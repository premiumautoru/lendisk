"use client";

import { useEffect, useRef } from "react";

const SPOKES = 5;
const SPOKE = "M-16 -46 L-14 -110 L-54 -218 Q-41 -225 -27 -223 L-4 -128 L4 -128 L27 -223 Q41 -225 54 -218 L14 -110 L16 -46 Z";
const DRILL = Array.from({ length: 36 }, (_, i) => i);
/** Rounded so server and client render identical attribute strings. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Procedural premium wheel (vector, ~6 KB) that spins endlessly on a lit podium.
 * Tyre, disc and spokes rotate; the caliper and lighting stay fixed so the motion reads as real.
 * A light pointer parallax tilts the whole scene. No WebGL → fast on mobile.
 */
export function HeroWheel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[640px] [perspective:1400px]" aria-hidden>
      {/* ambient glow */}
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(194,154,90,0.22),transparent_62%)] blur-2xl" />

      <div
        className="relative z-10 mx-auto h-[86%] w-[86%] transition-transform duration-700 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
      >
        <svg viewBox="0 0 600 600" className="h-full w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.7)]">
          <defs>
            <radialGradient id="hw-tyre" cx="50%" cy="50%" r="50%">
              <stop offset="0.76" stopColor="#1a1a1c" />
              <stop offset="0.86" stopColor="#101012" />
              <stop offset="0.97" stopColor="#060607" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <linearGradient id="hw-lip" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4e2b8" />
              <stop offset="0.3" stopColor="#b8904f" />
              <stop offset="0.55" stopColor="#5b4222" />
              <stop offset="0.8" stopColor="#d6b57a" />
              <stop offset="1" stopColor="#6d522c" />
            </linearGradient>
            <linearGradient id="hw-spoke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9d0a0" />
              <stop offset="0.45" stopColor="#b28b4c" />
              <stop offset="1" stopColor="#5d4323" />
            </linearGradient>
            <linearGradient id="hw-spoke-edge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff3d6" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="hw-disc" cx="50%" cy="50%" r="50%">
              <stop offset="0.35" stopColor="#2b2b2f" />
              <stop offset="0.7" stopColor="#4a4a50" />
              <stop offset="0.92" stopColor="#35353a" />
              <stop offset="1" stopColor="#1d1d20" />
            </radialGradient>
            <linearGradient id="hw-caliper" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0d28e" />
              <stop offset="0.5" stopColor="#c7a049" />
              <stop offset="1" stopColor="#7d6026" />
            </linearGradient>
            <radialGradient id="hw-cap" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#3a3a3f" />
              <stop offset="1" stopColor="#0c0c0e" />
            </radialGradient>
            <radialGradient id="hw-sheen" cx="30%" cy="22%" r="75%">
              <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="1" stopColor="#000" stopOpacity="0.35" />
            </radialGradient>
            <path id="hw-text" d="M300,300 m-262,0 a262,262 0 1,1 524,0 a262,262 0 1,1 -524,0" />
            <clipPath id="hw-rim-clip">
              <circle cx="300" cy="300" r="226" />
            </clipPath>
          </defs>

          {/* ── rotating: tyre, barrel, brake disc ── */}
          <g className="wheel-spin">
            <circle cx="300" cy="300" r="296" fill="url(#hw-tyre)" />
            {/* sidewall lettering */}
            <text fontFamily="var(--font-unbounded)" fontSize="17" fontWeight="600" letterSpacing="6" fill="#2d2d31">
              <textPath href="#hw-text" startOffset="0">
                LENDISK · PREMIUM WHEELS · MOSCOW · LENDISK · PREMIUM WHEELS · MOSCOW ·
              </textPath>
            </text>
            {/* signature gold stripe (two arcs) */}
            <circle cx="300" cy="300" r="246" fill="none" stroke="#b08a4a" strokeWidth="4" strokeDasharray="420 353" strokeLinecap="round" opacity="0.9" />
            <circle cx="300" cy="300" r="233" fill="#0b0b0d" />
            <g clipPath="url(#hw-rim-clip)">
              <circle cx="300" cy="300" r="170" fill="url(#hw-disc)" />
              {DRILL.map((i) => {
                const a = (i / DRILL.length) * Math.PI * 2;
                const r = i % 2 ? 142 : 156;
                return <circle key={i} cx={r2(300 + Math.cos(a) * r)} cy={r2(300 + Math.sin(a) * r)} r="3.2" fill="#141416" />;
              })}
              <circle cx="300" cy="300" r="100" fill="#1b1b1e" />
              <circle cx="300" cy="300" r="170" fill="none" stroke="#5c5c63" strokeWidth="1.5" opacity="0.6" />
            </g>
          </g>

          {/* ── static caliper ── */}
          <g transform="rotate(-38 300 300)">
            <path d="M300 118 a182 182 0 0 1 98 30 l-18 26 a150 150 0 0 0 -80 -24 z" fill="url(#hw-caliper)" />
            <path d="M318 134 l54 13" stroke="#3b2c12" strokeWidth="3" opacity="0.5" />
            <text x="326" y="150" fontFamily="var(--font-unbounded)" fontSize="11" fontWeight="700" fill="#2a1f0c" letterSpacing="2" transform="rotate(12 346 146)">
              LENDISK
            </text>
          </g>

          {/* ── rotating: spokes, lip, hub ── */}
          <g className="wheel-spin">
            <circle cx="300" cy="300" r="228" fill="none" stroke="url(#hw-lip)" strokeWidth="11" />
            <circle cx="300" cy="300" r="221" fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="3" />
            <circle cx="300" cy="300" r="212" fill="none" stroke="#b08a4a" strokeOpacity="0.25" strokeWidth="1" />
            {Array.from({ length: SPOKES }, (_, i) => (
              <g key={i} transform={`rotate(${(360 / SPOKES) * i} 300 300) translate(300 300)`}>
                {/* contact shadow on the barrel gives the spokes depth */}
                <path d={SPOKE} fill="#000" opacity="0.55" transform="translate(5 7)" />
                <path
                  d={SPOKE}
                  fill="url(#hw-spoke)"
                  stroke="#2b1f0f"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                <path d="M-14 -110 L-54 -218" stroke="url(#hw-spoke-edge)" strokeWidth="2.2" />
                <path d="M4 -128 L27 -223" stroke="#2b1f0f" strokeOpacity="0.55" strokeWidth="2" />
                <path d="M-16 -46 L-14 -110" stroke="#fff3d6" strokeOpacity="0.5" strokeWidth="1.5" />
              </g>
            ))}
            {/* hub */}
            <circle cx="300" cy="300" r="56" fill="url(#hw-spoke)" />
            <circle cx="300" cy="300" r="56" fill="none" stroke="#2b1f0f" strokeOpacity="0.45" strokeWidth="2" />
            {Array.from({ length: SPOKES }, (_, i) => {
              const a = ((360 / SPOKES) * i + 36) * (Math.PI / 180) - Math.PI / 2;
              return (
                <g key={i}>
                  <circle cx={r2(300 + Math.cos(a) * 40)} cy={r2(300 + Math.sin(a) * 40)} r="8" fill="#141416" />
                  <circle cx={r2(300 + Math.cos(a) * 40)} cy={r2(300 + Math.sin(a) * 40)} r="4.5" fill="#6b6b72" />
                </g>
              );
            })}
            <circle cx="300" cy="300" r="27" fill="url(#hw-cap)" stroke="#b08a4a" strokeWidth="1.5" />
            <g transform="translate(286 286) scale(0.28)" fill="none" stroke="#c29a5a" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.1" y="1.1" width="97.8" height="97.8" rx="24" strokeWidth="4" />
              <path d="M40.3 37.4V62.5H59.7" strokeWidth="6.5" />
              <path d="M60 37.2V45.6" strokeWidth="6" />
            </g>
          </g>

          {/* ── static lighting ── */}
          <circle cx="300" cy="300" r="296" fill="url(#hw-sheen)" pointerEvents="none" />
          <path d="M112 196 A210 210 0 0 1 250 92" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* podium */}
      <div className="absolute inset-x-[6%] bottom-[-2%] z-0 h-[22%]">
        <div className="absolute inset-x-0 top-[18%] h-full rounded-[50%] bg-gradient-to-b from-[#1b1b1e] to-[#060607] shadow-[0_30px_80px_rgba(0,0,0,0.8)]" />
        <div className="absolute inset-x-[4%] top-[18%] h-[64%] rounded-[50%] border border-white/10 bg-[#0d0d0f]" />
        <div className="absolute inset-x-[10%] top-[26%] h-[48%] rounded-[50%] border-[3px] border-white/90 shadow-[0_0_24px_rgba(255,255,255,0.55),0_0_60px_rgba(227,200,148,0.35),inset_0_0_18px_rgba(255,255,255,0.4)]" />
      </div>
    </div>
  );
}
