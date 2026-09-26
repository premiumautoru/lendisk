"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HeroWheel } from "@/components/site/HeroWheel";

const Scene = dynamic(() => import("./Hero3DScene"), { ssr: false });

/**
 * Hero visual. Everyone first sees the light vector wheel (fast, ~6 KB).
 * On capable desktops — fine pointer, ≥1024 px, WebGL2, ≥4 GB RAM, no reduced motion —
 * the real-time 3D wheel is loaded when the browser is idle and cross-fades in.
 * Phones, tablets and weak devices keep the light version.
 */
export function HeroVisual() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(pointer: fine) and (hover: hover) and (min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency || 4;
    let gl = false;
    try {
      gl = !!document.createElement("canvas").getContext("webgl2");
    } catch {}
    if (!desktop || reduce || mem < 4 || cores < 4 || !gl) return;
    const start = () => setEnabled(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 2000 });
    else setTimeout(start, 1000);
  }, []);

  return (
    <div className="relative">
      <div className={ready ? "opacity-0 transition-opacity duration-700" : "transition-opacity duration-700"}>
        <HeroWheel />
      </div>
      {enabled && (
        <div aria-hidden className={`pointer-events-none absolute inset-[-8%] transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Scene onReady={() => setTimeout(() => setReady(true), 250)} />
        </div>
      )}
    </div>
  );
}
