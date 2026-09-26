import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { makesList, pcdFromUrl, pcdToUrl } from "./format";

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
  images: { select: { url: true }, orderBy: { sort: "asc" }, take: 2, where: { spin: false } },
} satisfies Prisma.ProductSelect;

export type CardProduct = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type CatalogQuery = {
  q?: string;
  brand?: string[];
  series?: string[];
  d?: string[];
  pcd?: string[];
  make?: string;
  min?: number;
  max?: number;
  stock?: boolean;
  sort?: string;
  page?: number;
};

/** Facet dimensions; each facet is counted with every *other* active filter applied. */
type Dim = "q" | "brand" | "series" | "d" | "pcd" | "make" | "price" | "stock";


function arr(v: string | string[] | undefined) {
  if (!v) return [];
  return (Array.isArray(v) ? v.join(",") : v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function parseQuery(sp: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const n = (k: string) => {
    const v = Number(String(one(k) ?? "").replace(/\s/g, ""));
    return Number.isFinite(v) && v > 0 ? Math.round(v) : undefined;
  };
  let min = n("min");
  let max = n("max");
  if (min && max && min > max) [min, max] = [max, min]; // "от 12000 до 9000" means the same range
  return {
    q: one("q")?.trim().slice(0, 80) || undefined,
    brand: arr(sp.brand),
    series: arr(sp.series),
    d: arr(sp.d).filter((x) => /^\d{2}$/.test(x)),
    pcd: arr(sp.pcd).map(pcdFromUrl),
    make: one("make")?.trim().slice(0, 60) || undefined,
    min,
    max,
    stock: one("stock") === "1",
    sort: one("sort"),
    page: Math.max(1, Math.floor(n("page") || 1)),
  };
}

/** Lightweight row used for filtering, counting and sorting (the whole catalogue is ~1–5k rows). */
const indexSelect = {
  id: true,
  name: true,
  sku: true,
  model: true,
  brand: true,
  finish: true,
  diameter: true,
  pcd: true,
  compatibleMakes: true,
  price: true,
  inStock: true,
  isNew: true,
  isPopular: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

type Row = Prisma.ProductGetPayload<{ select: typeof indexSelect }> & { makes: string[]; hay: string };

const loadIndex = cache(async (): Promise<Row[]> => {
  const rows = await prisma.product.findMany({ where: { published: true }, select: indexSelect });
  return rows.map((r) => ({
    ...r,
    makes: makesList(r.compatibleMakes),
    hay: [r.name, r.sku, r.model, r.brand, r.finish, r.pcd, r.compatibleMakes, `r${r.diameter}`].join(" ").toLowerCase(),
  }));
});

function matchesSearch(r: Row, q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .every((t) => {
      const d = t.match(/^r?(\d{2})$/);
      if (d && Number(d[1]) === r.diameter) return true;
      return r.hay.includes(t) || r.hay.includes(t.replace(/[xх*]/, "×")) || r.hay.includes(t.replace(".", ","));
    });
}

/** One matcher for results *and* facet counts, so the numbers can never disagree. */
function matches(r: Row, q: CatalogQuery, ...skipDims: Dim[]) {
  const skip = (d: Dim) => skipDims.includes(d);
  if (!skip("q") && q.q && !matchesSearch(r, q.q)) return false;
  if (!skip("brand") && q.brand?.length && !q.brand.includes(r.brand)) return false;
  if (!skip("series") && q.series?.length && !q.series.includes(r.model)) return false;
  if (!skip("d") && q.d?.length && !q.d.includes(String(r.diameter))) return false;
  if (!skip("pcd") && q.pcd?.length && !q.pcd.includes(r.pcd)) return false;
  // exact make match: "Lada" must not pull in "Lada Niva", "Toyota" not "Toyota Land Cruiser"
  if (!skip("make") && q.make && !r.makes.includes(q.make)) return false;
  if (!skip("price") && q.min && r.price < q.min) return false;
  if (!skip("price") && q.max && r.price > q.max) return false;
  if (!skip("stock") && q.stock && !r.inStock) return false;
  return true;
}

function sortRows(rows: Row[], sort?: string) {
  const by = (...fns: ((a: Row, b: Row) => number)[]) => (a: Row, b: Row) => {
    for (const f of fns) {
      const v = f(a, b);
      if (v) return v;
    }
    return 0;
  };
  const num = (k: keyof Row, dir = 1) => (a: Row, b: Row) => ((a[k] as number) - (b[k] as number)) * dir;
  const bool = (k: keyof Row) => (a: Row, b: Row) => Number(b[k]) - Number(a[k]);
  const name = (a: Row, b: Row) => a.name.localeCompare(b.name);
  switch (sort) {
    case "price-asc":
      return rows.sort(by(num("price"), num("diameter"), name));
    case "price-desc":
      return rows.sort(by(num("price", -1), num("diameter", -1), name));
    case "d-asc":
      return rows.sort(by(num("diameter"), num("price"), name));
    case "d-desc":
      return rows.sort(by(num("diameter", -1), num("price"), name));
    case "new":
      return rows.sort(by(bool("isNew"), (a, b) => b.createdAt.getTime() - a.createdAt.getTime(), name));
    default:
      return rows.sort(by(bool("isPopular"), bool("inStock"), bool("isNew"), num("diameter"), name));
  }
}

function countBy(rows: Row[], key: (r: Row) => string | string[]) {
  const m = new Map<string, number>();
  for (const r of rows) for (const k of ([] as string[]).concat(key(r))) m.set(k, (m.get(k) || 0) + 1);
  return m;
}

/**
 * Filter options with counts that respect the other active filters (faceted search).
 * Selected values stay in the list even at 0, so they can always be switched off.
 */
export async function getFacets(q: CatalogQuery = {}) {
  const rows = await loadIndex();
  const pick = (...dims: Dim[]) => rows.filter((r) => matches(r, q, ...dims));
  const opts = (all: string[], counts: Map<string, number>, selected: string[] = []) =>
    all.map((value) => ({ value, count: counts.get(value) || 0 })).filter((o) => o.count > 0 || selected.includes(o.value));

  const uniq = (xs: string[]) => [...new Set(xs)];
  const allDiameters = uniq(rows.map((r) => String(r.diameter))).sort((a, b) => Number(a) - Number(b));
  const allBrands = uniq(rows.map((r) => r.brand)).sort();
  const allPcds = [...countBy(rows, (r) => r.pcd).entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const allMakes = uniq(rows.flatMap((r) => r.makes)).sort((a, b) => a.localeCompare(b));

  const dCounts = countBy(pick("d"), (r) => String(r.diameter));
  const brandCounts = countBy(pick("brand", "series"), (r) => r.brand);
  const priceRows = pick("price");
  const seriesRows = pick("series");
  const allSeries = uniq(seriesRows.map((r) => r.model)).sort((a, b) => a.localeCompare(b, "ru", { numeric: true }));

  return {
    // diameters are always listed (zero options disabled) so the grid layout stays stable
    diameters: allDiameters.map((value) => ({ value, count: dCounts.get(value) || 0 })),
    // the series is a child of the brand, so brand counts ignore the chosen series (otherwise you could not switch brands)
    brands: allBrands.map((value) => ({ value, count: brandCounts.get(value) || 0 })),
    series: opts(uniq([...allSeries, ...(q.series || [])]), countBy(seriesRows, (r) => r.model), q.series),
    pcds: opts(allPcds, countBy(pick("pcd"), (r) => r.pcd), q.pcd).map((o) => ({ ...o, url: pcdToUrl(o.value) })),
    makes: opts(allMakes, countBy(pick("make"), (r) => r.makes), q.make ? [q.make] : []),
    inStock: pick("stock").filter((r) => r.inStock).length,
    price: {
      min: priceRows.length ? Math.min(...priceRows.map((r) => r.price)) : 0,
      max: priceRows.length ? Math.max(...priceRows.map((r) => r.price)) : 0,
    },
  };
}

export type Facets = Awaited<ReturnType<typeof getFacets>>;

export async function getCatalog(q: CatalogQuery) {
  const rows = sortRows((await loadIndex()).filter((r) => matches(r, q)), q.sort);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page || 1, pages);
  const ids = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => r.id);
  const found = await prisma.product.findMany({ where: { id: { in: ids } }, select: cardSelect });
  const byId = new Map(found.map((p) => [p.id, p]));
  const items = ids.map((id) => byId.get(id)).filter((p): p is CardProduct => Boolean(p));
  return { total, items, pages, page };
}

export async function getFeatured(kind: "popular" | "new", take = 8) {
  return prisma.product.findMany({
    where: { published: true, ...(kind === "popular" ? { isPopular: true } : { isNew: true }) },
    select: cardSelect,
    orderBy: [{ inStock: "desc" }, { diameter: "desc" }],
    take,
  });
}
