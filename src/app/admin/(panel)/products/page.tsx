import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { ci } from "@/lib/db-text";
import { prisma } from "@/lib/db";
import { num, thumb } from "@/lib/format";
import { bulkPrice } from "@/app/actions/admin";
import { Card, PageTitle } from "@/components/admin/AdminField";
import { QuickPrice, QuickStock } from "@/components/admin/QuickEdit";
import { SubmitButton } from "@/components/admin/ui";

export const metadata = { title: "Товары" };
const PER = 40;

export default async function ProductsAdmin(props: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = one("q").trim();
  const brand = one("brand");
  const d = Number(one("d")) || 0;
  const stock = one("stock");
  const page = Math.max(1, Number(one("page")) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q ? { OR: [{ name: ci(q) }, { sku: ci(q) }, { model: ci(q) }] } : {}),
    ...(brand ? { brand } : {}),
    ...(d ? { diameter: d } : {}),
    ...(stock === "0" ? { inStock: false } : stock === "1" ? { inStock: true } : {}),
  };
  const [total, items, brands, diameters] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PER,
      take: PER,
      include: { images: { orderBy: { sort: "asc" }, take: 1 } },
    }),
    prisma.product.groupBy({ by: ["brand"], orderBy: { brand: "asc" } }),
    prisma.product.groupBy({ by: ["diameter"], orderBy: { diameter: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER));
  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (brand) u.set("brand", brand);
    if (d) u.set("d", String(d));
    if (stock) u.set("stock", stock);
    if (p > 1) u.set("page", String(p));
    return `/admin/products?${u}`;
  };

  return (
    <>
      <PageTitle
        title="Товары"
        subtitle={`${total} позиций. Цену и наличие можно менять прямо в списке — изменения сразу появляются на сайте.`}
        actions={
          <Link href="/admin/products/new" className="btn btn-gold !h-11 text-sm">
            <Plus className="size-4" /> Добавить диск
          </Link>
        }
      />

      <form className="mb-5 grid gap-2 sm:grid-cols-[1fr_150px_130px_160px_auto]">
        <input name="q" defaultValue={q} placeholder="Поиск: название или артикул" className="field !h-11 text-sm" />
        <select name="brand" defaultValue={brand} className="field !h-11 text-sm">
          <option value="">Все бренды</option>
          {brands.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
        </select>
        <select name="d" defaultValue={d || ""} className="field !h-11 text-sm">
          <option value="">Все R</option>
          {diameters.map((x) => <option key={x.diameter} value={x.diameter}>R{x.diameter}</option>)}
        </select>
        <select name="stock" defaultValue={stock} className="field !h-11 text-sm">
          <option value="">Любое наличие</option>
          <option value="1">В наличии</option>
          <option value="0">Нет в наличии</option>
        </select>
        <button className="btn btn-ghost !h-11 text-sm">Найти</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-graphite">
        <ul className="divide-y divide-white/[0.06]">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:px-4">
              <Link href={`/admin/products/${p.id}`} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-paper">
                {p.images[0] ? <Image src={thumb(p.images[0].url)} alt="" fill sizes="56px" className="object-cover mix-blend-multiply" /> : <span className="grid h-full place-items-center text-[0.6rem] text-ink/50">нет фото</span>}
              </Link>
              <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 hover:text-gold">
                <p className="truncate font-medium">{p.name} R{p.diameter}</p>
                <p className="truncate text-xs text-bone/45">
                  {p.brand} · {num(p.width)}J · {p.pcd} · ET{num(p.et)} · {p.sku}
                  {!p.published && <span className="ml-2 text-amber-300">скрыт</span>}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <QuickPrice id={p.id} price={p.price} />
                <QuickStock id={p.id} inStock={p.inStock} />
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="p-10 text-center text-sm text-bone/45">Ничего не найдено.</p>}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={href(page - 1)} className="rounded-full bg-white/[0.05] px-4 py-2">← Назад</Link>}
          <span className="px-3 text-bone/50">Страница {page} из {pages}</span>
          {page < pages && <Link href={href(page + 1)} className="rounded-full bg-white/[0.05] px-4 py-2">Вперёд →</Link>}
        </div>
      )}

      <Card title="Массовое изменение цены" className="mt-10">
        <form action={bulkPrice} className="grid gap-2 sm:grid-cols-[150px_130px_160px_auto] sm:items-end">
          <select name="brand" className="field !h-11 text-sm" defaultValue="">
            <option value="">Все бренды</option>
            {brands.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
          </select>
          <select name="diameter" className="field !h-11 text-sm" defaultValue="">
            <option value="">Все R</option>
            {diameters.map((x) => <option key={x.diameter} value={x.diameter}>R{x.diameter}</option>)}
          </select>
          <input name="price" inputMode="numeric" placeholder="Новая цена, ₽" className="field !h-11 text-sm" required />
          <SubmitButton confirm="Установить эту цену для всех выбранных товаров?">Применить</SubmitButton>
        </form>
        <p className="mt-3 text-xs text-bone/40">Например: выберите R20 и укажите 11 500 — цена изменится у всех дисков R20.</p>
      </Card>
    </>
  );
}
