"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { GALLERY_LICENSE, type GalleryPhoto } from "@/data/gallery";

/**
 * Full-screen viewer: swipe / drag on phones, arrows and keyboard on desktop,
 * direction-aware cross-slide between photos, thumbnails strip, focus trap-lite
 * (focus goes to the close button and back to the tile on close), scroll lock.
 */
export default function Lightbox({ photos, index, onIndex, onClose }: { photos: GalleryPhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [dir, setDir] = useState(0);
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const p = photos[index];
  const n = photos.length;

  const go = (step: number) => {
    setDir(step);
    onIndex((index + step + n) % n);
  };

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    // warm up the neighbours so the next swipe is instant
    for (const k of [index + 1, index - 1]) {
      const q = photos[(k + n) % n];
      const img = new Image();
      img.src = `${q.file}${window.innerWidth > 800 ? "" : "-sm"}.webp`;
    }
    return () => window.removeEventListener("keydown", onKey);
  });

  const slide = reduce
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({ x: d * 90, opacity: 0, scale: 0.98 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (d: number) => ({ x: d * -90, opacity: 0, scale: 0.98 }),
      };

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Галерея: ${p.title}`}
      className="fixed inset-0 z-[90] flex flex-col bg-[#060607]/[0.97] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
        <span className="text-xs tabular-nums text-bone/50">
          {String(index + 1).padStart(2, "0")} <span className="text-bone/25">/ {String(n).padStart(2, "0")}</span>
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Закрыть" className="grid size-11 place-items-center rounded-full border border-white/15 text-bone/80 transition hover:border-bone/60 hover:text-bone">
          <X className="size-5" />
        </button>
      </div>

      {/* stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-0 sm:px-20">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={p.file}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70 || info.velocity.x < -450) go(1);
              else if (info.offset.x > 70 || info.velocity.x > 450) go(-1);
            }}
            className="flex size-full cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP */}
            <img
              src={`${p.file}.webp`}
              srcSet={`${p.file}-sm.webp 800w, ${p.file}.webp 1600w`}
              sizes="100vw"
              width={p.width}
              height={p.height}
              alt={p.alt}
              draggable={false}
              className="max-h-full w-full select-none object-contain sm:rounded-xl"
            />
          </motion.figure>
        </AnimatePresence>

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Предыдущее фото" className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-bone/80 backdrop-blur transition hover:border-bone/60 hover:text-bone sm:grid">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Следующее фото" className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-bone/80 backdrop-blur transition hover:border-bone/60 hover:text-bone sm:grid">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* caption + thumbnails */}
      <div className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <p className="text-base text-bone/85 sm:text-lg">{p.title}</p>
          <p className="text-xs text-bone/45">
            Фото:{" "}
            <a href={p.authorUrl} target="_blank" rel="noopener" className="underline decoration-white/20 underline-offset-2 hover:text-bone">{p.author}</a>{" "}
            /{" "}
            <a href={p.source} target="_blank" rel="noopener" className="underline decoration-white/20 underline-offset-2 hover:text-bone">Unsplash</a>
            {" · "}
            <a href={GALLERY_LICENSE.url} target="_blank" rel="noopener" className="hover:text-bone">{GALLERY_LICENSE.name}</a>
          </p>
        </div>
        {n > 1 && (
          <div className="mx-auto mt-4 hidden max-w-6xl justify-center gap-2 sm:flex">
            {photos.map((q, i) => (
              <button
                key={q.file}
                type="button"
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  onIndex(i);
                }}
                aria-label={`Фото ${i + 1}: ${q.title}`}
                aria-current={i === index ? "true" : undefined}
                className={clsx("h-14 w-11 overflow-hidden rounded-md border transition duration-300", i === index ? "border-bone/80 opacity-100" : "border-transparent opacity-40 hover:opacity-80")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail */}
                <img src={`${q.file}-sm.webp`} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {n > 1 && (
          <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {photos.map((q, i) => (
              <span key={q.file} className={clsx("h-1 rounded-full transition-all duration-500", i === index ? "w-6 bg-bone/80" : "w-1.5 bg-white/20")} />
            ))}
          </div>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
