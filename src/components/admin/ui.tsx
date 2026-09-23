"use client";

import clsx from "clsx";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({ children, className, pendingText = "Сохранение…", variant = "gold", confirm }: { children: React.ReactNode; className?: string; pendingText?: string; variant?: "gold" | "ghost" | "danger"; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={clsx(
        "btn !h-11 text-sm",
        variant === "gold" && "btn-gold",
        variant === "ghost" && "btn-ghost",
        variant === "danger" && "border border-red-500/40 text-red-300 hover:bg-red-500/10",
        className,
      )}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

export function Toggle({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-bone/45">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-white/10 transition after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-bone after:transition peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-ink" />
    </label>
  );
}
