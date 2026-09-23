import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { num, rub, thumb, whatsappHref } from "@/lib/format";
import { LeadDialog } from "@/components/forms/LeadDialog";
import { WhatsAppIcon } from "@/components/ui/icons";
import { WheelPlaceholder } from "./WheelPlaceholder";

export function ProductCard({ p, whatsapp, priority }: { p: CardProduct; whatsapp: string; priority?: boolean }) {
  const img = p.images[0]?.url;
  const title = `${p.name} R${p.diameter}`;
  const specs = `${num(p.width)}J · ${p.pcd} · ET${num(p.et)} · DIA ${num(p.dia)}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-graphite transition duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_30px_60px_-30px_rgba(194,154,90,0.35)]">
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
        ) : (
          <WheelPlaceholder label={p.name} />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ink px-2.5 py-1 font-display text-[0.7rem] font-semibold text-bone">R{p.diameter}</span>
          {p.isNew && <span className="rounded-full bg-gold px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-ink">New</span>}
          {p.type !== "Литой" && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-semibold text-ink">{p.type}</span>}
        </div>
        {p.model3dUrl && (
          <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-ink/85 text-gold" title="Есть 3D-модель">
            <Box className="size-4" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone/45">
          <span>{p.brand}</span>
          <span className={p.inStock ? "flex items-center gap-1.5 text-emerald-400/90" : "text-bone/40"}>
            <span className={p.inStock ? "size-1.5 rounded-full bg-emerald-400" : "size-1.5 rounded-full bg-bone/30"} />
            {p.inStock ? "В наличии" : "Под заказ"}
          </span>
        </div>
        <h3 className="font-display text-[0.95rem] font-medium leading-snug sm:text-base">
          <Link href={`/catalog/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {title}
          </Link>
        </h3>
        <p className="mt-1.5 text-xs text-bone/50">{specs}</p>
        <p className="mt-1 line-clamp-1 text-xs text-bone/40">{p.finish}</p>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold">{rub(p.price)}</span>
            {p.oldPrice && p.oldPrice > p.price && <span className="text-sm text-bone/35 line-through">{rub(p.oldPrice)}</span>}
            <span className="text-xs text-bone/40">/ шт.</span>
          </div>
          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-2">
            <LeadDialog productId={p.id} productName={`${title} ${specs}`} className="btn btn-gold !h-11 !px-3 text-[0.82rem]">
              Оставить заявку
            </LeadDialog>
            <a
              href={whatsappHref(whatsapp, `Здравствуйте! Интересует диск ${title} (${specs}), ${rub(p.price)}.`)}
              target="_blank"
              rel="noopener"
              className="grid size-11 place-items-center rounded-full border border-white/12 text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
              aria-label={`Спросить в WhatsApp про ${title}`}
            >
              <WhatsAppIcon className="size-[18px]" />
            </a>
          </div>
          <Link href={`/catalog/${p.slug}`} className="relative z-10 mt-2 flex items-center justify-center gap-1.5 py-1.5 text-[0.8rem] font-medium text-bone/60 transition hover:text-gold">
            Подробнее <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
