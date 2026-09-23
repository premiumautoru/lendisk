import "server-only";
import type { Prisma } from "@prisma/client";
import { ci } from "@/lib/db-text";
import { prisma } from "./db";
import { makesList } from "./format";

export const PAGE_SIZE = 24;

export const cardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  diameter: true,
  width: true,
  pcd: true,
  et: true,
  dia: true,
  finish: true,
  type: true,
  price: true,
  oldPrice: true,
  inStock: true,
  isNew: true,
  isPopular: true,
  model3dUrl: true,
  images: { select: { url: true }, orderBy: { sort: "asc" }, take: 1, where: { spin: false } },
} satisfies Prisma.ProductSelect;

export type CardProduct = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type CatalogQuery = {
  q?: string;
  brand?: string[];
  d?: string[];
  pcd?: string[];
  make?: string;
  min?: number;
  max?: number;
  stock?: boolean;
  sort?: string;
  page?: number;
};

function arr(v: string | string[] | undefined) {
  if (!v) return [];
  return (Array.isArray(v) ? v : v.split(",")).map((x) => x.trim()).filter(Boolean);
}

export function parseQuery(sp: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const n = (k: string) => {
    const v = Number(one(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  return {
    q: one("q")?.slice(0, 80),
    brand: arr(sp.brand),
    d: arr(sp.d),
    pcd: arr(sp.pcd),
    make: one("make")?.slice(0, 60),
    min: n("min"),
    max: n("max"),
    stock: one("stock") === "1",
    sort: one("sort"),
    page: Math.max(1, Math.floor(n("page") || 1)),
  };
}

export function buildWhere(q: CatalogQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ published: true }];
  if (q.q) {
    const terms = q.q.split(/\s+/).filter(Boolean).slice(0, 5);
    for (const t of terms) {
      const r = t.replace(/^r(\d{2})$/i, "$1");
      and.push({
        OR: [
          { name: ci(t) },
          { sku: ci(t) },
          { model: ci(t) },
          { brand: ci(t) },
          { finish: ci(t) },
          { pcd: ci(t.replace(/[x*]/i, "×")) },
          { compatibleMakes: ci(t) },
          ...(/^\d{2}$/.test(r) ? [{ diameter: Number(r) }] : []),
        ],
      });
    }
  }
  if (q.brand?.length) and.push({ brand: { in: q.brand } });
  if (q.d?.length) and.push({ diameter: { in: q.d.map(Number).filter(Boolean) } });
  if (q.pcd?.length) and.push({ pcd: { in: q.pcd } });
  if (q.make) and.push({ compatibleMakes: ci(q.make) });
  if (q.min) and.push({ price: { gte: q.min } });
  if (q.max) and.push({ price: { lte: q.max } });
  if (q.stock) and.push({ inStock: true });
  return { AND: and };
}

export function buildOrder(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }, { diameter: "asc" }];
    case "price-desc":
      return [{ price: "desc" }, { diameter: "desc" }];
    case "d-asc":
      return [{ diameter: "asc" }, { price: "asc" }];
    case "d-desc":
      return [{ diameter: "desc" }, { price: "asc" }];
    case "new":
      return [{ isNew: "desc" }, { createdAt: "desc" }];
    default:
      return [{ isPopular: "desc" }, { inStock: "desc" }, { isNew: "desc" }, { diameter: "asc" }, { name: "asc" }];
  }
}

export async function getFacets() {
  const [brands, diameters, pcds, priceAgg, makesRows] = await Promise.all([
    prisma.product.groupBy({ by: ["brand"], where: { published: true }, _count: true, orderBy: { brand: "asc" } }),
    prisma.product.groupBy({ by: ["diameter"], where: { published: true }, _count: true, orderBy: { diameter: "asc" } }),
    prisma.product.groupBy({ by: ["pcd"], where: { published: true }, _count: true, orderBy: { _count: { pcd: "desc" } } }),
    prisma.product.aggregate({ where: { published: true }, _min: { price: true }, _max: { price: true } }),
    prisma.product.findMany({ where: { published: true }, select: { compatibleMakes: true }, distinct: ["compatibleMakes"] }),
  ]);
  const makes = new Set<string>();
  for (const r of makesRows) for (const m of makesList(r.compatibleMakes)) makes.add(m);
  return {
    brands: brands.map((b) => ({ value: b.brand, count: b._count })),
    diameters: diameters.map((d) => ({ value: String(d.diameter), count: d._count })),
    pcds: pcds.map((p) => ({ value: p.pcd, count: p._count })),
    makes: [...makes].sort((a, b) => a.localeCompare(b)),
    price: { min: priceAgg._min.price ?? 0, max: priceAgg._max.price ?? 0 },
  };
}

export type Facets = Awaited<ReturnType<typeof getFacets>>;

export async function getCatalog(q: CatalogQuery) {
  const where = buildWhere(q);
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: buildOrder(q.sort),
      skip: ((q.page || 1) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { total, items, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeatured(kind: "popular" | "new", take = 8) {
  return prisma.product.findMany({
    where: { published: true, ...(kind === "popular" ? { isPopular: true } : { isNew: true }) },
    select: cardSelect,
    orderBy: [{ inStock: "desc" }, { diameter: "desc" }],
    take,
  });
}
