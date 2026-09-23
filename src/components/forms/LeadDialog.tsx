"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { LeadForm } from "./LeadForm";

/** Button that opens a modal with the lead form (product request / callback). */
export function LeadDialog({
  children,
  className,
  productId,
  productName,
  title = "Оставить заявку",
  subtitle = "Менеджер Lendisk подтвердит наличие и свяжется с вами в ближайшее время.",
  variant = "product",
}: {
  children: React.ReactNode;
  className?: string;
  productId?: string;
  productName?: string;
  title?: string;
  subtitle?: string;
  variant?: "product" | "callback" | "podbor";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setKey((k) => k + 1);
          setOpen(true);
        }}
      >
        {children}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className={clsx(
          "m-auto w-[min(640px,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-white/10 bg-graphite p-0 text-bone shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        )}
      >
        {open && (
          <div className="relative p-6 sm:p-9">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/10 text-bone/70 hover:text-bone" aria-label="Закрыть">
              <X className="size-5" />
            </button>
            <p className="eyebrow mb-3">Lendisk</p>
            <h2 className="pr-10 font-display text-xl font-medium sm:text-2xl">{title}</h2>
            <p className="mb-7 mt-2 text-sm text-bone/60">{subtitle}</p>
            <LeadForm key={key} variant={variant} productId={productId} productName={productName} compact />
          </div>
        )}
      </dialog>
    </>
  );
}
