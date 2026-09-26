"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, [role="button"], summary, select, label, [data-cursor]';
const CARD = "article, [data-cursor='card']";
const FIELD = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const TEXT = "p, li, dd, blockquote";

/**
 * A small gold wheel that follows the mouse and spins with the distance travelled.
 * - only on devices with a fine pointer and hover (desktop); touch devices keep the system cursor;
 * - pointer-events: none, so it never blocks clicks; over text and fields it steps aside for the system I-beam;
 * - the native cursor is hidden only after this component mounts, so without JS nothing changes;
 * - with reduced motion it follows 1:1 and does not spin.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    let x = -100, y = -100, tx = -100, ty = -100, angle = 0, raf = 0, shown = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        x = tx; y = ty; shown = true;
        el.dataset.visible = "true";
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      // links and buttons win over plain text, so a paragraph inside a link still shows the wheel
      const state = t.closest(FIELD) ? "text" : t.closest(INTERACTIVE) ? "button" : t.closest(CARD) ? "card" : t.closest(TEXT) ? "text" : "default";
      el.dataset.state = state;
    };
    const onLeave = () => { shown = false; el.dataset.visible = "false"; };
    const onDown = () => (el.dataset.pressed = "true");
    const onUp = () => (el.dataset.pressed = "false");

    const tick = () => {
      const k = reduce ? 1 : 0.35; // light easing: smooth, but never feels delayed
      const dx = tx - x, dy = ty - y;
      x += dx * k;
      y += dy * k;
      if (!reduce) angle += Math.hypot(dx, dy) * 0.9;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      (el.firstElementChild as HTMLElement).style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-visible="false"
      data-state="default"
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden [html.has-cursor_&]:block"
    >
      <div className="cursor-wheel">
        <svg viewBox="-12 -12 24 24" width="22" height="22">
          <circle r="10.5" fill="rgba(10,10,11,0.35)" stroke="#e3c894" strokeWidth="1.5" />
          <circle r="7.4" fill="none" stroke="#c29a5a" strokeWidth="0.8" />
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d="M-0.9 -2.6 L-1.8 -7 L1.8 -7 L0.9 -2.6 Z" fill="#e3c894" transform={`rotate(${i * 72})`} />
          ))}
          <circle r="1.9" fill="#e3c894" />
        </svg>
      </div>
    </div>
  );
}
