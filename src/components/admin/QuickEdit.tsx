"use client";

import clsx from "clsx";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { quickUpdateProduct } from "@/app/actions/admin";

/** Inline price / stock editor in the products table — saves on Enter or blur. */
export function QuickPrice({ id, price }: { id: string; price: number }) {
  const [value, setValue] = useState(String(price));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const commit = () => {
    const n = Number(value.replace(/\s/g, ""));
    if (!Number.isFinite(n) || n < 0 || n === price) return;
    start(async () => {
      await quickUpdateProduct(id, { price: n });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };
  return (
    <div className="relative">
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="field !h-10 !w-28 !rounded-lg !px-3 !pr-8 text-sm"
        aria-label="Цена, ₽"
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bone/40">
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : saved ? <Check className="size-3.5 text-emerald-400" /> : <span className="text-xs">₽</span>}
      </span>
    </div>
  );
}

export function QuickStock({ id, inStock }: { id: string; inStock: boolean }) {
  const [on, setOn] = useState(inStock);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next);
        start(() => quickUpdateProduct(id, { inStock: next }));
      }}
      className={clsx("rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition", on ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30" : "bg-white/[0.04] text-bone/50 ring-white/10")}
      aria-pressed={on}
    >
      {on ? "В наличии" : "Нет в наличии"}
    </button>
  );
}
