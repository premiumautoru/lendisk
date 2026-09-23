"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Hand, ImageIcon, Rotate3d } from "lucide-react";
import { WheelPlaceholder } from "@/components/catalog/WheelPlaceholder";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-sm text-ink/50">Загрузка 3D-модели…</div>,
});

type Img = { url: string; spin: boolean };

/**
 * Photo gallery with three modes:
 *  - «Фото»: regular gallery with thumbnails;
 *  - «360°»: drag to rotate. With an uploaded frame sequence (≥8 spin frames) it scrubs through them,
 *    otherwise it spins the frontal photo around the hub axis with inertia;
 *  - «3D»: GLB/GLTF model (if uploaded in the admin panel), orbit with mouse or finger.
 */
export function ProductGallery({ images, name, model3dUrl }: { images: Img[]; name: string; model3dUrl?: string | null }) {
  const photos = images.filter((i) => !i.spin);
  const frames = images.filter((i) => i.spin);
  const hasFrames = frames.length >= 8;
  const [mode, setMode] = useState<"photo" | "spin" | "3d">(model3dUrl ? "3d" : "photo");
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[1.8rem] bg-paper">
        {mode === "photo" &&
          (current ? (
            <Image key={current.url} src={current.url} alt={name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="animate-[fade_.5s_ease] object-cover mix-blend-multiply" />
          ) : (
            <WheelPlaceholder label={name} />
          ))}
        {mode === "spin" && (hasFrames ? <FrameSpinner frames={frames.map((f) => f.url)} name={name} /> : current ? <PhotoSpinner url={current.url} name={name} /> : <WheelPlaceholder label={name} />)}
        {mode === "3d" && model3dUrl && <ModelViewer url={model3dUrl} />}

        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <div className="flex gap-1 rounded-full bg-ink/85 p-1 backdrop-blur" role="tablist" aria-label="Режим просмотра">
            <ModeBtn active={mode === "photo"} onClick={() => setMode("photo")} icon={<ImageIcon className="size-4" />}>Фото</ModeBtn>
            {(current || hasFrames) && <ModeBtn active={mode === "spin"} onClick={() => setMode("spin")} icon={<Rotate3d className="size-4" />}>360°</ModeBtn>}
            {model3dUrl && <ModeBtn active={mode === "3d"} onClick={() => setMode("3d")} icon={<Box className="size-4" />}>3D</ModeBtn>}
          </div>
        </div>
      </div>

      {photos.length > 1 && mode === "photo" && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p.url}
              type="button"
              onClick={() => setActive(i)}
              className={clsx("relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper ring-2 transition sm:size-24", i === active ? "ring-gold" : "ring-transparent hover:ring-white/30")}
              aria-label={`Фото ${i + 1}`}
            >
              <Image src={p.url} alt="" fill sizes="96px" className="object-cover mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={clsx("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition", active ? "bg-gold text-ink" : "text-bone/70 hover:text-bone")}>
      {icon}
      {children}
    </button>
  );
}

function useDrag(onDelta: (dx: number) => void, onRelease?: (v: number) => void) {
  const last = useRef<{ x: number; t: number; v: number } | null>(null);
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      last.current = { x: e.clientX, t: performance.now(), v: 0 };
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!last.current) return;
      const now = performance.now();
      const dx = e.clientX - last.current.x;
      last.current = { x: e.clientX, t: now, v: dx / Math.max(1, now - last.current.t) };
      onDelta(dx);
    },
    onPointerUp: () => {
      onRelease?.(last.current?.v ?? 0);
      last.current = null;
    },
    onPointerCancel: () => (last.current = null),
  };
  return handlers;
}

function Hint() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/80 px-3.5 py-1.5 text-xs text-bone/80">
      <Hand className="size-3.5" /> Потяните, чтобы вращать
    </span>
  );
}

function PhotoSpinner({ url, name }: { url: string; name: string }) {
  const [angle, setAngle] = useState(0);
  const vel = useRef(0);
  const raf = useRef(0);
  const spinTo = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      vel.current *= 0.95;
      setAngle((a) => a + vel.current);
      if (Math.abs(vel.current) > 0.05) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const drag = useDrag(
    (dx) => {
      cancelAnimationFrame(raf.current);
      setAngle((a) => a + dx * 0.6);
    },
    (v) => {
      vel.current = v * 10;
      spinTo();
    },
  );
  return (
    <div className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing" {...drag}>
      <Image src={url} alt={name} fill sizes="(min-width:1024px) 50vw, 100vw" draggable={false} style={{ transform: `rotate(${angle}deg)` }} className="object-cover mix-blend-multiply will-change-transform" />
      <Hint />
    </div>
  );
}

function FrameSpinner({ frames, name }: { frames: string[]; name: string }) {
  const [pos, setPos] = useState(0);
  const drag = useDrag((dx) => setPos((p) => p + dx / 12));
  const idx = ((Math.round(pos) % frames.length) + frames.length) % frames.length;
  return (
    <div className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing" {...drag}>
      {frames.map((f, i) => (
        <Image key={f} src={f} alt={i === idx ? name : ""} fill sizes="(min-width:1024px) 50vw, 100vw" draggable={false} className={clsx("object-cover mix-blend-multiply", i === idx ? "opacity-100" : "opacity-0")} />
      ))}
      <Hint />
    </div>
  );
}
