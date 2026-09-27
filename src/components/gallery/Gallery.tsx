"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { GalleryPhoto } from "@/data/gallery";

// the viewer (with motion) is loaded only when someone actually opens a photo
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

export function Photo({ p, sizes, className, eager }: { p: GalleryPhoto; sizes: string; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- files are pre-sized WebP, no need for the optimiser
    <img
      src={`${p.file}-sm.webp`}
      srcSet={`${p.file}-sm.webp 800w, ${p.file}.webp 1600w`}
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

/** One frame: the photo, and a quiet caption underneath — no overlays, no accent colour. */
function Frame({ p, i, sizes, onOpen, className }: { p: GalleryPhoto; i: number; sizes: string; onOpen: () => void; className?: string }) {
  return (
    <figure className={clsx("group", className)}>
      <button type="button" onClick={onOpen} aria-label={`Открыть фото «${p.title}»`} className="block w-full overflow-hidden rounded-[1.25rem] bg-graphite outline-none ring-bone/40 ring-offset-4 ring-offset-ink focus-visible:ring-1">
        <Photo p={p} sizes={sizes} className="aspect-[4/5] w-full object-cover transition duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]" />
      </button>
      <figcaption className="mt-4 flex items-baseline gap-4 text-sm">
        <span className="tabular-nums text-bone/30">{String(i + 1).padStart(2, "0")}</span>
        <span className="text-bone/75 transition duration-500 group-hover:text-bone">{p.title}</span>
      </figcaption>
    </figure>
  );
}

/**
 * layout="row"  — home page: four portrait frames with a gentle stagger on desktop,
 *                 a swipe carousel with a thin progress line on phones.
 * layout="page" — /gallery: two offset columns of large frames on desktop, one column on phones.
 */
export function Gallery({ photos, layout = "row" }: { photos: GalleryPhoto[]; layout?: "row" | "page" }) {
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const row = layout === "row";

  // phone carousel: which frame is in view
  useEffect(() => {
    const el = track.current;
    if (!el || !row) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 16;
      setActive(Math.max(0, Math.min(photos.length - 1, Math.round(el.scrollLeft / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [row, photos.length]);

  const frames = photos.map((p, i) => ({ p, i }));

  return (
    <>
      {row ? (
        <>
          <div
            ref={track}
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 lg:gap-8 [&::-webkit-scrollbar]:hidden"
          >
            {frames.map(({ p, i }) => (
              <Frame
                key={p.file}
                p={p}
                i={i}
                sizes="(min-width: 768px) 24vw, 78vw"
                onOpen={() => setOpen(i)}
                className={clsx("w-[78vw] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none", i % 2 === 1 && "md:mt-16")}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 md:hidden" aria-hidden>
            <span className="text-xs tabular-nums text-bone/50">
              {String(active + 1).padStart(2, "0")} <span className="text-bone/25">/ {String(photos.length).padStart(2, "0")}</span>
            </span>
            <span className="relative h-px flex-1 bg-white/10">
              <span className="absolute inset-y-0 left-0 bg-bone/70 transition-all duration-500" style={{ width: `${((active + 1) / photos.length) * 100}%` }} />
            </span>
          </div>
        </>
      ) : (
        <>
          {/* phone / tablet: one calm column */}
          <div className="space-y-14 md:hidden">
            {frames.map(({ p, i }) => (
              <Frame key={p.file} p={p} i={i} sizes="100vw" onOpen={() => setOpen(i)} />
            ))}
          </div>
          {/* desktop: two columns, the right one offset for rhythm */}
          <div className="hidden gap-10 md:grid md:grid-cols-2 lg:gap-16">
            {[0, 1].map((col) => (
              <div key={col} className={clsx("space-y-20 lg:space-y-28", col === 1 && "pt-40")}>
                {frames
                  .filter(({ i }) => i % 2 === col)
                  .map(({ p, i }) => (
                    <Frame key={p.file} p={p} i={i} sizes="(min-width: 1280px) 600px, 46vw" onOpen={() => setOpen(i)} />
                  ))}
              </div>
            ))}
          </div>
        </>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
