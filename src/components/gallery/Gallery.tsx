"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Expand } from "lucide-react";
import type { GalleryPhoto } from "@/data/gallery";

// the viewer (with motion) is loaded only when someone actually opens a photo
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

export function Photo({ p, sizes, className, eager }: { p: GalleryPhoto; sizes: string; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- files are pre-sized WebP, no need for the optimiser
    <img
      src={`${p.file}-sm.webp`}
      srcSet={`${p.file}-sm.webp 900w, ${p.file}.webp 1920w`}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={p.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}

/* Desktop: bento grid with big frames. Phone: full-bleed swipe carousel with a counter. */
const BENTO = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
];

/* /gallery page: an editorial rhythm of wide and narrow frames */
// rows always add up to 12 columns: 8+4 · 4+8 · 12 · 6+6 · 4+4+4 · 7+5
const EDITORIAL = ["md:col-span-8", "md:col-span-4", "md:col-span-4", "md:col-span-8", "md:col-span-12", "md:col-span-6", "md:col-span-6", "md:col-span-4", "md:col-span-4", "md:col-span-4", "md:col-span-7", "md:col-span-5"];

export function Gallery({ photos, layout = "bento" }: { photos: GalleryPhoto[]; layout?: "bento" | "editorial" }) {
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const bento = layout === "bento";

  // phone carousel: which card is centred
  useEffect(() => {
    const el = track.current;
    if (!el || !bento) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 12;
      setActive(Math.max(0, Math.min(photos.length - 1, Math.round(el.scrollLeft / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [bento, photos.length]);

  return (
    <>
      <div
        ref={track}
        className={clsx(
          bento
            ? "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-12 md:auto-rows-[15rem] md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:auto-rows-[18rem] [&::-webkit-scrollbar]:hidden"
            : "grid gap-3 md:grid-cols-12 md:auto-rows-[20rem] md:gap-4 lg:auto-rows-[26rem]",
        )}
      >
        {photos.map((p, i) => (
          <button
            key={p.file}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Открыть фото «${p.title}»`}
            data-reveal={bento ? undefined : ""}
            className={clsx(
              "group relative overflow-hidden rounded-[1.4rem] bg-graphite text-left outline-none ring-gold/60 focus-visible:ring-2 md:rounded-[1.6rem]",
              bento ? ["aspect-[4/5] w-[82vw] max-w-[420px] shrink-0 snap-center md:aspect-auto md:w-auto md:max-w-none", BENTO[i % BENTO.length]] : ["aspect-[3/2] md:aspect-auto", EDITORIAL[i % EDITORIAL.length]],
            )}
          >
            <Photo
              p={p}
              sizes={bento ? (i === 0 ? "(min-width: 768px) 58vw, 82vw" : "(min-width: 768px) 40vw, 82vw") : "(min-width: 768px) 66vw, 100vw"}
              className="absolute inset-0 size-full object-cover transition duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-90 transition duration-700 group-hover:opacity-100" />
            <span aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.07] transition duration-700 group-hover:ring-gold/40" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
              <span className="transition duration-700 md:translate-y-1 md:group-hover:translate-y-0">
                <span className="block font-display text-[0.7rem] tracking-[0.3em] text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className={clsx("mt-1 block font-display uppercase tracking-[0.04em] text-bone", bento && i === 0 ? "text-xl md:text-3xl" : "text-lg md:text-xl")}>{p.title}</span>
              </span>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-black/30 text-bone/80 backdrop-blur transition duration-500 group-hover:border-gold group-hover:text-gold md:opacity-0 md:group-hover:opacity-100">
                <Expand className="size-4" />
              </span>
            </span>
          </button>
        ))}
      </div>

      {bento && (
        <div className="mt-5 flex items-center gap-4 md:hidden" aria-hidden>
          <span className="font-display text-xs tabular-nums tracking-[0.2em] text-bone/60">
            {String(active + 1).padStart(2, "0")} <span className="text-bone/25">/ {String(photos.length).padStart(2, "0")}</span>
          </span>
          <span className="relative h-px flex-1 bg-white/10">
            <span className="absolute inset-y-0 left-0 bg-gold transition-all duration-500" style={{ width: `${((active + 1) / photos.length) * 100}%` }} />
          </span>
        </div>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
