import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { num, rub, thumb, whatsappHref } from "@/lib/format";
import { LeadDialog } from "@/components/forms/LeadDialog";
import { WhatsAppIcon } from "@/components/ui/icons";
import { WheelPlaceholder } from "./WheelPlaceholder";

/**
 * Product card. Order is fixed for easy comparison: photo → brand & stock → name → price →
 * R · PCD · ET (then width and DIA) → actions. Compact on phones (2 columns at 390 px).
 */
export function ProductCard({ p, whatsapp, priority }: { p: CardProduct; whatsapp: string; priority?: boolean }) {
  const [img, second] = p.images.map((i) => i.url);
  const title = `${p.name} R${p.diameter}`;
  const specs = `R${p.diameter} · ${p.pcd} · ET${num(p.et)}`;
  const extra = `${num(p.width)}J · DIA ${num(p.dia)}`;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-graphite transition duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_30px_60px_-30px_rgba(194,154,90,0.35)] sm:rounded-[1.4rem]">
      <Link href={`/catalog/${p.slug}`} className="relative block aspect-square overflow-hidden bg-paper" aria-label={`Подробнее: ${title}`}>
        {img ? (
          <Image
            src={thumb(img)}
            alt={`Диск ${title} ${p.finish}`}
            fill
            sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
            className="object-cover mix-blend-multiply transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[8deg] group-hover:scale-[1.06]"
            priority={priority}
          />
        ) : null}
        {img && second && (
          // second photo (e.g. the wheel mounted on a car) fades in on hover, desktop only
          <Image
            src={thumb(second)}
            alt=""
            fill
            sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
          />
        )}
        {!img && (
          <WheelPlaceholder label={p.name} />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {p.isNew && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-ink sm:px-2.5 sm:py-1 sm:text-[0.68rem]">New</span>}
          {p.type !== "Литой" && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[0.62rem] font-semibold text-ink sm:px-2.5 sm:py-1 sm:text-[0.68rem]">{p.type}</span>}
        </div>
        {p.model3dUrl && (
          <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink/85 text-gold sm:right-3 sm:top-3 sm:size-8" title="Есть 3D-модель">
            <Box className="size-3.5 sm:size-4" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-bone/45 sm:text-[0.7rem] sm:tracking-[0.18em]">
          <span className="truncate">{p.brand}</span>
          <span className={p.inStock ? "flex shrink-0 items-center gap-1 text-emerald-400/90" : "shrink-0 text-bone/40"}>
            <span className={p.inStock ? "size-1.5 rounded-full bg-emerald-400" : "size-1.5 rounded-full bg-bone/30"} />
            {p.inStock ? "В наличии" : "Под заказ"}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5em] font-display text-[0.82rem] font-medium leading-[1.25] sm:text-base">
          <Link href={`/catalog/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {title}
          </Link>
        </h3>

        <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 font-display text-[1.05rem] font-semibold leading-none sm:mt-3 sm:text-xl">
          {rub(p.price)}
          <span className="font-sans text-[0.68rem] font-normal text-bone/40 sm:text-xs">/ шт.</span>
          {p.oldPrice && p.oldPrice > p.price && <span className="font-sans text-xs font-normal text-bone/35 line-through">{rub(p.oldPrice)}</span>}
        </p>

        <dl className="mt-2.5 border-t border-white/[0.07] pt-2.5 sm:mt-3 sm:pt-3">
          <dt className="sr-only">Параметры</dt>
          <dd className="whitespace-nowrap text-[0.74rem] font-medium tabular-nums text-bone/85 sm:text-sm">{specs}</dd>
          <dd className="mt-0.5 whitespace-nowrap text-[0.68rem] tabular-nums text-bone/45 sm:text-xs">{extra}</dd>
          <dd className="mt-0.5 hidden truncate text-xs text-bone/40 sm:block">{p.finish}</dd>
        </dl>

        <div className="relative z-10 mt-auto flex min-w-0 gap-1.5 pt-3 sm:gap-2 sm:pt-4">
          <LeadDialog productId={p.id} productName={`${title} ${specs} · ${extra}`} className="btn btn-gold !h-10 min-w-0 flex-1 !px-2 text-[0.8rem] sm:!h-11 sm:!px-3 sm:text-[0.82rem]">
            <span className="sm:hidden">Заявка</span>
            <span className="hidden sm:inline">Оставить заявку</span>
          </LeadDialog>
          <a
            href={whatsappHref(whatsapp, `Здравствуйте! Интересует диск ${title} (${specs}, ${extra}), ${rub(p.price)}.`)}
            target="_blank"
            rel="noopener"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10 sm:size-11"
            aria-label={`Спросить в WhatsApp про ${title}`}
          >
            <WhatsAppIcon className="size-[17px] sm:size-[18px]" />
          </a>
        </div>
        <Link href={`/catalog/${p.slug}`} className="relative z-10 mt-2 hidden items-center justify-center gap-1.5 py-1.5 text-[0.8rem] font-medium text-bone/60 transition hover:text-gold sm:flex">
          Подробнее <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
