import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, MapPin, Navigation, PackageCheck, Phone, ScanSearch, Star, Truck, Wrench } from "lucide-react";
import type { Review, FaqItem } from "@prisma/client";
import type { CardProduct } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/settings-defaults";
import type { Contacts } from "@/components/site/contacts";
import { ProductCard } from "@/components/catalog/ProductCard";
import { LeadForm } from "@/components/forms/LeadForm";
import { LeadDialog } from "@/components/forms/LeadDialog";
import { LogoMark } from "@/components/brand/Logo";
import { MaxIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { YandexMap } from "@/components/site/YandexMap";
import { plural } from "@/lib/format";

function SectionHead({ eyebrow, title, children, action }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between" data-reveal>
      <div className="max-w-2xl">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h2 className="text-balance font-display text-[clamp(1.45rem,4.2vw,3rem)] font-semibold uppercase leading-[1.05] tracking-[0.01em]">{title}</h2>
        {children && <p className="mt-5 max-w-xl text-pretty leading-relaxed text-bone/55">{children}</p>}
      </div>
      {action}
    </div>
  );
}

/* ───────── marquee ───────── */
export function Marquee() {
  const items = ["Диски в наличии", "R13 — R23", "Доставка в день заказа", "Подбор по VIN", "Москва и Московская область", "Литые · Кованые · Flow Forming"];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/[0.06] bg-ink-2 py-5" aria-hidden>
      <div className="flex w-max animate-marquee gap-10">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-sm uppercase tracking-[0.2em] text-bone/70">
            {t}
            <svg viewBox="0 0 100 100" className="size-4" fill="none" stroke="#b08a4a" strokeWidth="8" strokeLinecap="round">
              <rect x="4" y="4" width="92" height="92" rx="24" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────── advantages ───────── */
const ADVANTAGES = [
  { icon: Truck, title: "Быстрая доставка", text: "Привезём в день заказа или на следующий день по Москве и МО." },
  { icon: PackageCheck, title: "Диски в наличии", text: "Более тысячи позиций на складе — без долгого ожидания под заказ." },
  { icon: ScanSearch, title: "Помощь с подбором", text: "Проверим разболтовку, вылет и DIA по VIN вашего автомобиля." },
  { icon: MapPin, title: "Доставка по Москве и МО", text: "Магазин в Лобне, доставка по всей Москве и области." },
];

export function Advantages() {
  return (
    <section id="advantages" className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHead eyebrow="Почему Lendisk" title={<>Сервис уровня <span className="text-gold-gradient">premium</span></>} />
        <div className="grid gap-px overflow-hidden rounded-[1.6rem] border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a, i) => (
            <div key={a.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="group relative bg-ink p-7 transition-colors duration-500 hover:bg-graphite sm:p-8">
              <span className="font-display text-xs text-bone/25">0{i + 1}</span>
              <a.icon className="mt-8 size-9 text-gold transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.4} />
              <h3 className="mt-6 font-display text-lg font-medium">{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bone/55">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── product grids ───────── */
export function ProductGrid({ id, eyebrow, title, items, whatsapp, href, text }: { id: string; eyebrow: string; title: string; items: CardProduct[]; whatsapp: string; href: string; text?: string }) {
  if (!items.length) return null;
  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          action={
            <Link href={href} className="btn btn-ghost self-start md:self-auto">
              Смотреть все <ArrowRight className="size-4" />
            </Link>
          }
        >
          {text}
        </SectionHead>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {items.map((p, i) => (
            <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 80}ms` }}>
              <ProductCard p={p} whatsapp={whatsapp} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── diameters / brand statement ───────── */
export function BrandStatement({ diameters }: { diameters: { value: string; count: number }[] }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(194,154,90,0.12),transparent_60%)]" />
      <div className="container-x">
        <div data-reveal className="text-center">
          <p className="eyebrow mb-6">Каталог по диаметру</p>
          <h2 className="text-chrome font-display text-[clamp(2.6rem,10vw,8.5rem)] font-bold uppercase leading-[0.9] tracking-[0.02em]">
            Ваш размер
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-bone/55">Выберите диаметр — покажем всё, что есть на складе прямо сейчас.</p>
        </div>
        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3" data-reveal>
          {diameters.map((d) => (
            <Link
              key={d.value}
              href={`/catalog?d=${d.value}`}
              className="group flex min-w-[5.2rem] flex-col items-center rounded-2xl border border-white/10 px-5 py-4 transition duration-500 hover:-translate-y-1 hover:border-gold hover:bg-gold/[0.06]"
            >
              <span className="font-display text-2xl font-semibold transition group-hover:text-gold sm:text-3xl">R{d.value}</span>
              <span className="mt-1 text-[0.7rem] text-bone/40">{d.count} {plural(d.count, "модель", "модели", "моделей")}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── podbor ───────── */
export function Podbor({ s }: { s: SiteSettings }) {
  const steps = [
    { icon: ScanSearch, t: "Оставьте VIN или модель авто" },
    { icon: Wrench, t: "Проверим PCD, ET, DIA и ширину" },
    { icon: BadgeCheck, t: "Предложим варианты из наличия" },
  ];
  return (
    <section id="podbor" className="scroll-mt-20 py-16 sm:py-24">
      <div className="container-x">
        <div className="grain relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-graphite">
          <div aria-hidden className="absolute -right-40 -top-40 size-[520px] rounded-full bg-gold/10 blur-3xl" />
          <div className="relative grid gap-12 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-16">
            <div data-reveal className="min-w-0">
              <p className="eyebrow mb-5">Подбор дисков</p>
              <h2 className="text-balance font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-[1.08]">{s.podborTitle}</h2>
              <p className="mt-6 max-w-md leading-relaxed text-bone/60">{s.podborText}</p>
              <ol className="mt-10 space-y-5">
                {steps.map((st, i) => (
                  <li key={st.t} className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/[0.07] text-gold">
                      <st.icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="text-sm text-bone/75">
                      <span className="mr-2 font-display text-xs text-gold">0{i + 1}</span>
                      {st.t}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div data-reveal style={{ ["--reveal-delay" as string]: "120ms" }} className="min-w-0 rounded-[1.5rem] border border-white/[0.08] bg-ink/60 p-5 backdrop-blur sm:p-8">
              <LeadForm variant="podbor" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── delivery ───────── */
export function Delivery({ s }: { s: SiteSettings }) {
  const items = [
    { icon: Truck, t: "Быстрая доставка", d: "В день заказа или на следующий день" },
    { icon: PackageCheck, t: "Диски в наличии", d: "Отгрузка со склада без ожидания" },
    { icon: ScanSearch, t: "Помощь с подбором", d: "Проверим совместимость до покупки" },
    { icon: MapPin, t: "Доставка по Москве и МО", d: "Привезём к дому или шиномонтажу" },
  ];
  return (
    <section id="delivery" className="scroll-mt-20 py-16 sm:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div data-reveal>
          <p className="eyebrow mb-5">Доставка</p>
          <h2 className="text-balance font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold uppercase leading-[1.05]">{s.deliveryTitle}</h2>
          <p className="mt-6 max-w-lg text-pretty leading-relaxed text-bone/60">{s.deliveryText}</p>
          <div className="mt-10 flex items-center gap-5 rounded-2xl border border-white/[0.08] p-5">
            <Clock3 className="size-8 shrink-0 text-gold" strokeWidth={1.4} />
            <p className="text-sm text-bone/65">
              Оформите заказ до обеда — и в большинстве случаев диски приедут <span className="text-bone">уже сегодня</span>. Точное время согласует менеджер.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <div key={it.t} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="group relative overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-graphite p-7 transition duration-500 hover:border-gold/30">
              <div aria-hidden className="absolute -right-8 -top-8 size-32 rounded-full bg-gold/0 blur-2xl transition duration-700 group-hover:bg-gold/15" />
              <it.icon className="size-8 text-gold" strokeWidth={1.4} />
              <h3 className="mt-8 font-display text-base font-medium">{it.t}</h3>
              <p className="mt-2 text-sm text-bone/50">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── reviews ───────── */
export function Reviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const hasDemo = reviews.some((r) => r.isDemo);
  return (
    <section id="reviews" className="scroll-mt-20 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Отзывы клиентов" title="Нам доверяют автомобили">
          {hasDemo ? "Демонстрационные отзывы — будут заменены реальными отзывами клиентов Lendisk." : undefined}
        </SectionHead>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <figure
              key={r.id}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 4) * 90}ms` }}
              className="flex w-[82%] shrink-0 snap-start flex-col rounded-[1.4rem] border border-white/[0.07] bg-graphite p-7 sm:w-auto"
            >
              <div className="flex gap-1 text-gold" role="img" aria-label={`Оценка ${r.rating} из 5`}>
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="size-4" fill={k < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-bone/75">«{r.text}»</blockquote>
              <figcaption className="mt-6 border-t border-white/[0.07] pt-5">
                <p className="font-medium">{r.author}</p>
                {r.car && <p className="mt-0.5 text-xs text-bone/45">{r.car}</p>}
                {r.isDemo && <span className="mt-3 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-bone/40">Пример отзыва</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
export function Faq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div data-reveal>
          <p className="eyebrow mb-5">FAQ</p>
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold uppercase leading-[1.05]">Частые вопросы</h2>
          <p className="mt-6 max-w-sm text-bone/55">Не нашли ответ? Напишите нам в WhatsApp или позвоните — ответим за пару минут.</p>
        </div>
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]" data-reveal>
          {items.map((f) => (
            <details key={f.id} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium transition hover:text-gold sm:text-lg">
                {f.question}
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-white/10 transition group-open:rotate-45 group-open:border-gold group-open:text-gold">
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className="absolute h-3.5 w-px bg-current" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-12 leading-relaxed text-bone/60">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
export function Cta({ s, contacts }: { s: SiteSettings; contacts: Contacts }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e3c894] via-[#c29a5a] to-[#8c6b3a] p-8 text-ink sm:p-14 lg:p-20">
          <LogoMark className="pointer-events-none absolute -bottom-24 -right-16 size-[340px] opacity-25 mix-blend-multiply [&_g]:stroke-ink" />
          <div className="relative max-w-2xl">
            <h2 className="text-balance font-display text-[clamp(1.8rem,4.4vw,3.4rem)] font-bold uppercase leading-[1]">{s.ctaTitle}</h2>
            <p className="mt-5 max-w-lg text-lg text-ink/75">{s.ctaText}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LeadDialog variant="podbor" title="Подберём диски под ваш автомобиль" className="btn btn-dark">
                Оставить заявку <ArrowRight className="size-4" />
              </LeadDialog>
              <a href={contacts.whatsapp} target="_blank" rel="noopener" className="btn border border-ink/25 text-ink hover:bg-ink/10">
                <WhatsAppIcon className="size-4" /> Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── contacts + map ───────── */
export function ContactsSection({ contacts }: { contacts: Contacts }) {
  return (
    <section id="contacts" className="scroll-mt-20 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Контакты" title="Как нас найти" />
        <div className="grid overflow-hidden rounded-[2rem] border border-white/[0.08] bg-graphite lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col p-7 sm:p-10" data-reveal>
            <div className="flex items-center gap-4">
              <LogoMark className="size-12" logoUrl={contacts.logoUrl} />
              <span className="font-display text-xl font-semibold uppercase tracking-[0.3em]">Lendisk</span>
            </div>
            <ul className="mt-10 space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-bone/40">Адрес магазина</p>
                  <p className="mt-1 text-lg">{contacts.address}</p>
                  <p className="text-bone/60">{contacts.city}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 size-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-bone/40">Телефон</p>
                  <a href={contacts.phoneHref} className="mt-1 block font-display text-xl hover:text-gold">{contacts.phone}</a>
                </div>
              </li>
              <li className="flex gap-4">
                <Clock3 className="mt-1 size-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-bone/40">Режим работы</p>
                  <p className="mt-1">{contacts.workHours}</p>
                </div>
              </li>
            </ul>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <a href={contacts.route} target="_blank" rel="noopener" className="btn btn-gold sm:col-span-2">
                <Navigation className="size-4" /> Построить маршрут
              </a>
              <a href={contacts.phoneHref} className="btn btn-ghost">
                <Phone className="size-4" /> Позвонить
              </a>
              <a href={contacts.whatsapp} target="_blank" rel="noopener" className="btn btn-ghost">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
              <a href={contacts.telegram} target="_blank" rel="noopener" className="btn btn-ghost">
                <TelegramIcon className="size-4" /> Telegram
              </a>
              <a href={contacts.max} target="_blank" rel="noopener" className="btn btn-ghost">
                <MaxIcon className="size-4" /> MAX
              </a>
            </div>
          </div>
          <div className="relative min-h-[380px] lg:min-h-[560px]">
            <YandexMap lat={contacts.lat} lon={contacts.lon} address={`${contacts.address}, ${contacts.city}`} />
          </div>
        </div>
      </div>
    </section>
  );
}

