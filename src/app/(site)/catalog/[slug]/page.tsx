import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Check, Phone, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { cardSelect } from "@/lib/catalog";
import { makesList, num, phoneHref, rub, whatsappHref } from "@/lib/format";
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
  const description = `Купить диск ${p.brand} ${p.name} R${p.diameter} (${p.pcd}, ET${num(p.et)}, DIA ${num(p.dia)}) в Москве — ${rub(p.price)} за шт. ${p.inStock ? "В наличии" : "Под заказ"}, доставка по Москве и МО. Lendisk.`;
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
    brand: { "@type": "Brand", name: p.brand },
    image: img ? [`${SITE_URL}${img}`] : undefined,
    description: p.description || `Автомобильный диск ${title}, ${specsLine}, ${p.finish}.`,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
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

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={p.images.map((i) => ({ url: i.url, spin: i.spin }))} name={`Диск ${title}`} model3dUrl={p.model3dUrl} />

          <div className="lg:pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">{p.brand}</span>
              <span className={p.inStock ? "flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300" : "rounded-full bg-white/5 px-3 py-1 text-xs text-bone/50"}>
                {p.inStock && <span className="size-1.5 rounded-full bg-emerald-400" />}
                {p.inStock ? "В наличии" : "Под заказ"}
              </span>
              {p.isNew && <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">Новинка</span>}
            </div>
            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-bold uppercase leading-[1]">{title}</h1>
            <p className="mt-3 text-bone/55">{specsLine}</p>
            <p className="mt-1 text-sm text-bone/40">{p.finish}</p>

            <div className="mt-8 flex items-end gap-3 border-y border-white/[0.08] py-6">
              <span className="font-display text-4xl font-semibold">{rub(p.price)}</span>
              {p.oldPrice && p.oldPrice > p.price && <span className="pb-1 text-lg text-bone/35 line-through">{rub(p.oldPrice)}</span>}
              <span className="pb-1.5 text-sm text-bone/45">за 1 диск · комплект {rub(p.price * 4)}</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LeadDialog productId={p.id} productName={`${title} ${specsLine}`} className="btn btn-gold sm:col-span-2">
                Оставить заявку
              </LeadDialog>
              <a href={whatsappHref(s.whatsapp, `Здравствуйте! Интересует диск ${title} (${specsLine}), артикул ${p.sku}.`)} target="_blank" rel="noopener" className="btn btn-ghost">
                <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
              </a>
              <a href={phoneHref(s.phone)} className="btn btn-ghost">
                <Phone className="size-4 text-gold" /> Позвонить
              </a>
              <a href={s.telegram} target="_blank" rel="noopener" className="btn btn-ghost sm:col-span-2">
                <TelegramIcon className="size-4 text-[#2AABEE]" /> Написать в Telegram
              </a>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-bone/65">
              <li className="flex gap-3"><Truck className="size-5 shrink-0 text-gold" strokeWidth={1.5} /> Доставка по Москве и МО в день заказа или на следующий день</li>
              <li className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-gold" strokeWidth={1.5} /> Проверим совместимость с вашим автомобилем по VIN перед покупкой</li>
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
            <h2 className="mb-10 font-display text-[clamp(1.6rem,3.6vw,2.6rem)] font-semibold uppercase">Похожие диски</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {similar.map((sp) => (
                <ProductCard key={sp.id} p={sp} whatsapp={s.whatsapp} />
              ))}
            </div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([productLd, crumbsLd]) }} />
    </div>
  );
}
