import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Check, Phone, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { cardSelect } from "@/lib/catalog";
import { daysAhead, makesList, num, phoneHref, rub, whatsappHref } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/catalog/ProductCard";
import { LeadDialog } from "@/components/forms/LeadDialog";
import { TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";

const getProduct = cache(async (slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sort: "asc" } } },
  }),
);

export async function generateMetadata(props: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);
  if (!p || !p.published) return { title: "Товар не найден" };
  const title = `Диск ${p.name} R${p.diameter} ${num(p.width)}J ${p.pcd} ET${num(p.et)}`;
  const description = `Купить диск ${p.name.startsWith(p.brand) ? "" : `${p.brand} `}${p.name} R${p.diameter} (${p.pcd}, ET${num(p.et)}, DIA ${num(p.dia)}) в Москве — ${rub(p.price)} за шт. ${p.inStock ? "В наличии" : "Под заказ"}, доставка по Москве и МО. Lendisk.`;
  const img = p.images.find((i) => !i.spin)?.url;
  return {
    title,
    description,
    alternates: { canonical: `/catalog/${p.slug}` },
    openGraph: { title: `${title} — Lendisk`, description, images: img ? [{ url: img, width: 1200, height: 1200 }] : undefined, type: "website" },
  };
}

export default async function ProductPage(props: PageProps<"/catalog/[slug]">) {
  const { slug } = await props.params;
  const [p, s] = await Promise.all([getProduct(slug), getSettings()]);
  if (!p || !p.published) notFound();

  const title = `${p.name} R${p.diameter}`;
  const specsLine = `${num(p.width)}J · ${p.pcd} · ET${num(p.et)} · DIA ${num(p.dia)}`;
  const makes = makesList(p.compatibleMakes);
  const similar = await prisma.product.findMany({
    where: { published: true, id: { not: p.id }, OR: [{ model: p.model }, { diameter: p.diameter, pcd: p.pcd }] },
    select: cardSelect,
    orderBy: [{ inStock: "desc" }, { isPopular: "desc" }],
    take: 4,
  });

  const specs: [string, string][] = [
    ["Бренд / серия", p.brand],
    ["Модель", p.model],
    ["Диаметр", `R${p.diameter}″`],
    ["Ширина", `${num(p.width)}J`],
    ["Разболтовка (PCD)", p.pcd],
    ["Вылет (ET)", `${num(p.et)} мм`],
    ["Центральное отверстие (DIA)", `${num(p.dia)} мм`],
    ["Покрытие", p.finishCode ? `${p.finish} (${p.finishCode})` : p.finish],
    ["Тип", p.type],
    ...(p.axle ? ([["Ось", p.axle]] as [string, string][]) : []),
    ["Артикул", p.sku],
  ];

  const img = p.images.find((i) => !i.spin)?.url;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Диск ${title} ${specsLine}`,
    sku: p.sku,
    mpn: p.model,
    category: "Автомобильные диски",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Диаметр", value: `R${p.diameter}` },
      { "@type": "PropertyValue", name: "Ширина", value: `${num(p.width)}J` },
      { "@type": "PropertyValue", name: "PCD", value: p.pcd },
      { "@type": "PropertyValue", name: "Вылет ET", value: num(p.et) },
      { "@type": "PropertyValue", name: "DIA", value: num(p.dia) },
    ],
    brand: { "@type": "Brand", name: p.brand },
    image: img ? [`${SITE_URL}${img}`] : undefined,
    description: p.description || `Автомобильный диск ${title}, ${specsLine}, ${p.finish}.`,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: daysAhead(90),
      areaServed: ["Москва", "Московская область"],
      url: `${SITE_URL}/catalog/${p.slug}`,
      seller: { "@type": "Organization", name: "Lendisk" },
    },
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/catalog/${p.slug}` },
    ],
  };

  return (
    <div className="pb-24 pt-24 lg:pt-32">
      <div className="container-x">
        <nav className="mb-8 text-xs text-bone/40" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-gold">Главная</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-gold">Каталог</Link>
          <span className="mx-2">/</span>
          <Link href={`/catalog?d=${p.diameter}`} className="hover:text-gold">R{p.diameter}</Link>
          <span className="mx-2">/</span>
          <span className="text-bone/70">{p.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={p.images.map((i) => ({ url: i.url, spin: i.spin }))} name={`Диск ${title}`} model3dUrl={p.model3dUrl} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">{p.brand}</span>
              <span className={p.inStock ? "flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300" : "rounded-full bg-white/5 px-3 py-1 text-xs text-bone/50"}>
                {p.inStock && <span className="size-1.5 rounded-full bg-emerald-400" />}
                {p.inStock ? "В наличии" : "Под заказ"}
              </span>
              {p.isNew && <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">Новинка</span>}
              {p.type !== "Литой" && <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-medium text-gold-3">{p.type}</span>}
            </div>
            <h1 className="mt-5 font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-bold uppercase leading-[1.02]">{title}</h1>
            <p className="mt-2 text-sm text-bone/45">{p.finish}{p.finishCode ? ` · ${p.finishCode}` : ""} · арт. {p.sku}</p>

            {/* key parameters, always in the same order */}
            <dl className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Диаметр", `R${p.diameter}`],
                ["Ширина", `${num(p.width)}J`],
                ["PCD", p.pcd],
                ["Вылет", `ET${num(p.et)}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/[0.08] bg-graphite px-4 py-3">
                  <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-bone/45">{k}</dt>
                  <dd className="mt-1 font-display text-lg font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-bone/40">Центральное отверстие DIA {num(p.dia)} мм</p>

            {/* price & main action */}
            <div className="mt-7 rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/[0.07] to-transparent p-5 sm:p-6">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-display text-[2.4rem] font-semibold leading-none">{rub(p.price)}</span>
                {p.oldPrice && p.oldPrice > p.price && <span className="pb-1 text-lg text-bone/35 line-through">{rub(p.oldPrice)}</span>}
                <span className="pb-1 text-sm text-bone/50">за 1 диск</span>
              </div>
              <p className="mt-2 text-sm text-bone/55">Комплект из 4 дисков — {rub(p.price * 4)}</p>
              <LeadDialog productId={p.id} productName={`${title} ${specsLine}`} className="btn btn-gold mt-5 w-full !h-14 text-base">
                Оставить заявку на этот диск
              </LeadDialog>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a href={whatsappHref(s.whatsapp, `Здравствуйте! Интересует диск ${title} (${specsLine}), артикул ${p.sku}.`)} target="_blank" rel="noopener" className="btn btn-ghost !h-11 !gap-1.5 !px-2 text-[0.8rem] sm:text-sm">
                  <WhatsAppIcon className="size-4 text-[#25D366]" /> <span>WhatsApp</span>
                </a>
                <a href={phoneHref(s.phone)} className="btn btn-ghost !h-11 !gap-1.5 !px-2 text-[0.8rem] sm:text-sm">
                  <Phone className="size-4 text-gold" /> <span>Звонок</span>
                </a>
                <a href={s.telegram} target="_blank" rel="noopener" className="btn btn-ghost !h-11 !gap-1.5 !px-2 text-[0.8rem] sm:text-sm">
                  <TelegramIcon className="size-4 text-[#2AABEE]" /> <span>Telegram</span>
                </a>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-bone/65 sm:grid-cols-2">
              <li className="flex gap-3"><Truck className="size-5 shrink-0 text-gold" strokeWidth={1.5} /> Доставка по Москве и МО в день заказа или на следующий день</li>
              <li className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-gold" strokeWidth={1.5} /> Проверим совместимость с вашим автомобилем по VIN</li>
            </ul>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Характеристики</h2>
              <dl className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-graphite">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 px-5 py-3.5 text-sm">
                    <dt className="text-bone/50">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {makes.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-2 font-display text-lg">Подходит по разболтовке</h2>
                <p className="mb-4 text-xs text-bone/40">Точную совместимость (вылет, DIA, тормоза) специалист проверит по VIN.</p>
                <div className="flex flex-wrap gap-2">
                  {makes.map((m) => (
                    <Link key={m} href={`/catalog?make=${encodeURIComponent(m)}`} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-bone/75 hover:border-gold hover:text-gold">
                      <Check className="size-3.5 text-gold" /> {m}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {p.description && (
              <section className="mt-8">
                <h2 className="mb-3 font-display text-lg">Описание</h2>
                <p className="whitespace-pre-line leading-relaxed text-bone/65">{p.description}</p>
              </section>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-24">
            <p className="eyebrow mb-4">Вам может подойти</p>
            <h2 className="mb-10 font-display text-[clamp(1.45rem,3.6vw,2.6rem)] font-semibold uppercase">Похожие диски</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {similar.map((sp) => (
                <ProductCard key={sp.id} p={sp} whatsapp={s.whatsapp} />
              ))}
            </div>
          </section>
        )}
      </div>
      {/* phones: price + request always at hand (covers the generic contact bar on this page) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-white/[0.08] bg-ink/95 px-4 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-none">{rub(p.price)}</p>
          <p className="mt-1 truncate text-xs text-bone/45">{title} · за 1 диск</p>
        </div>
        <LeadDialog productId={p.id} productName={`${title} ${specsLine}`} className="btn btn-gold !h-12 !px-5 text-sm">
          Оставить заявку
        </LeadDialog>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([productLd, crumbsLd]) }} />
    </div>
  );
}
