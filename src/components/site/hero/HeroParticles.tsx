"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; a: number; vy: number; drift: number; phase: number; tw: number; bokeh: boolean };

/**
 * Silver dust drifting down through a soft beam of light, behind the hero content.
 * - one 2D canvas, no libraries; density scales with the area (≈3× fewer particles on phones);
 * - particles inside the beam glow brighter, a few large blurred ones add depth;
 * - prefers-reduced-motion: a single static frame, no animation;
 * - paused while the hero is off-screen or the tab is hidden.
 */
export function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, running = false, visible = true;
    let parts: P[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const make = (anywhere: boolean): P => {
      const bokeh = Math.random() < 0.07;
      return {
        x: rand(0, w),
        y: anywhere ? rand(0, h) : rand(-40, -5),
        r: bokeh ? rand(2.4, 4.6) : Math.random() < 0.18 ? rand(1.3, 2.1) : rand(0.5, 1.3),
        a: bokeh ? rand(0.06, 0.16) : rand(0.3, 0.95),
        vy: bokeh ? rand(3, 8) : rand(5, 24), // px per second: slow dust, not snow
        drift: rand(4, 16),
        phase: rand(0, Math.PI * 2),
        tw: rand(0.4, 1.4),
        bokeh,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const phone = w < 640;
      const target = Math.round(((w * h) / (phone ? 9000 : 6500)) * (phone ? 0.75 : 1));
      const n = Math.max(28, Math.min(phone ? 60 : 180, target));
      parts = Array.from({ length: n }, () => make(true));
    };

    // light beam: from the top, slightly right of centre, fading downwards
    const beam = (x: number, y: number) => {
      const cx = w * 0.62 + (y / h) * w * -0.12;
      const spread = w * 0.22 + y * 0.35;
      const dx = Math.abs(x - cx) / spread;
      return Math.max(0, 1 - dx * dx) * Math.max(0.25, 1 - y / (h * 1.3));
    };

    // pre-rendered sprites: drawing an image is far cheaper than building gradients every frame
    const sprite = (size: number, stops: [number, number][]) => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [o, a] of stops) grad.addColorStop(o, `rgba(236,240,242,${a})`);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return c;
    };
    const dot = sprite(32, [[0, 1], [0.16, 1], [0.24, 0.35], [0.5, 0.08], [1, 0]]);
    const blob = sprite(64, [[0, 0.9], [0.45, 0.35], [1, 0]]);

    const draw = (t: number, dt: number) => {
      if (!w || !h) return; // not laid out yet (hidden tab, zero-size container)
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        if (!reduce && dt) {
          p.y += p.vy * dt;
          p.x += Math.sin(t * 0.00025 * p.tw + p.phase) * p.drift * dt;
          if (p.y - p.r > h) Object.assign(p, make(false));
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }
        const glow = 0.35 + 0.65 * beam(p.x, p.y);
        const twinkle = reduce ? 1 : 0.75 + 0.25 * Math.sin(t * 0.0012 * p.tw + p.phase);
        const alpha = Math.max(0, Math.min(1, p.a * glow * twinkle)) || 0;
        if (!alpha) continue;
        ctx.globalAlpha = alpha;
        if (p.bokeh) {
          const s = p.r * 4.4;
          ctx.drawImage(blob, p.x - s / 2, p.y - s / 2, s, s);
        } else {
          const s = p.r * (p.r > 1.2 ? 12 : 6.5); // bigger specks get a visible halo
          ctx.drawImage(dot, p.x - s / 2, p.y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !visible || document.hidden || !armed) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    draw(0, 0); // static first frame immediately
    let armed = false;
    const arm = () => {
      armed = true;
      start();
    };
    const w8 = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const kick = () => (w8.requestIdleCallback ? w8.requestIdleCallback(arm, { timeout: 2500 }) : setTimeout(arm, 1200));
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now(), 0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      {/* the beam itself: barely visible, just enough to explain where the light comes from */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:linear-gradient(200deg,transparent_38%,rgba(220,226,230,0.05)_52%,transparent_68%)] sm:[background:linear-gradient(205deg,transparent_40%,rgba(220,226,230,0.06)_55%,transparent_70%)]"
      />
      <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
    </>
  );
}
