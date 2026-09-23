import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCatalog, getFacets, parseQuery } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ActiveFilters, FilterSidebar, MobileFilters, SearchBox, SortSelect } from "@/components/catalog/Filters";
import { LeadDialog } from "@/components/forms/LeadDialog";

export async function generateMetadata(props: PageProps<"/catalog">): Promise<Metadata> {
  const q = parseQuery(await props.searchParams);
  const d = q.d?.length === 1 ? ` R${q.d[0]}` : "";
  return {
    title: `Каталог автомобильных дисков${d} в наличии в Москве`,
    description: `Купить литые и кованые диски${d} в Москве и Московской области. Диски в наличии, подбор по автомобилю и доставка в день заказа — Lendisk.`,
    alternates: { canonical: "/catalog" },
  };
}

function pageHref(sp: Record<string, string | string[] | undefined>, page: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") p.set(k, Array.isArray(v) ? v.join(",") : v);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/catalog?${s}` : "/catalog";
}

export default async function CatalogPage(props: PageProps<"/catalog">) {
  const sp = await props.searchParams;
  const q = parseQuery(sp);
  const [s, facets, { items, total, pages }] = await Promise.all([getSettings(), getFacets(), getCatalog(q)]);
  const page = Math.min(q.page || 1, pages);
  const around = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  return (
    <div className="pb-24 pt-28 lg:pt-36">
      <div className="container-x">
        <header className="mb-10 lg:mb-14">
          <nav className="mb-6 text-xs text-bone/40" aria-label="Хлебные крошки">
            <Link href="/" className="hover:text-gold">Главная</Link> <span className="mx-2">/</span> <span className="text-bone/70">Каталог</span>
          </nav>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-4">Lendisk · в наличии</p>
              <h1 className="font-display text-[clamp(2rem,6vw,4.4rem)] font-bold uppercase leading-[0.95]">Каталог дисков</h1>
              <p className="mt-4 text-bone/55">
                Найдено <span className="text-bone">{total.toLocaleString("ru-RU")}</span> позиций · цена за 1 диск
              </p>
            </div>
          </div>
        </header>

        <Suspense>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <SearchBox />
            <div className="flex gap-3">
              <MobileFilters facets={facets} total={total} />
              <SortSelect />
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <FilterSidebar facets={facets} />
            </div>
            <div>
              <ActiveFilters />
              {items.length ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                  {items.map((p, i) => (
                    <ProductCard key={p.id} p={p} whatsapp={s.whatsapp} priority={i < 3} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-white/[0.08] bg-graphite p-10 text-center">
                  <p className="font-display text-xl">Ничего не нашлось</p>
                  <p className="mx-auto mt-3 max-w-md text-bone/55">Попробуйте изменить фильтры — или оставьте заявку, и мы подберём диски под ваш автомобиль.</p>
                  <LeadDialog variant="podbor" title="Подберём диски под ваш автомобиль" className="btn btn-gold mt-6">
                    Оставить заявку на подбор
                  </LeadDialog>
                </div>
              )}

              {pages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Страницы каталога">
                  {page > 1 && (
                    <Link href={pageHref(sp, page - 1)} className="grid size-11 place-items-center rounded-full border border-white/10 hover:border-gold" aria-label="Предыдущая страница">
                      <ChevronLeft className="size-4" />
                    </Link>
                  )}
                  {around.map((n, i) => (
                    <span key={n} className="flex items-center gap-2">
                      {i > 0 && n - around[i - 1] > 1 && <span className="text-bone/30">…</span>}
                      <Link
                        href={pageHref(sp, n)}
                        aria-current={n === page ? "page" : undefined}
                        className={n === page ? "grid size-11 place-items-center rounded-full bg-gold font-semibold text-ink" : "grid size-11 place-items-center rounded-full border border-white/10 text-bone/70 hover:border-gold"}
                      >
                        {n}
                      </Link>
                    </span>
                  ))}
                  {page < pages && (
                    <Link href={pageHref(sp, page + 1)} className="grid size-11 place-items-center rounded-full border border-white/10 hover:border-gold" aria-label="Следующая страница">
                      <ChevronRight className="size-4" />
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
