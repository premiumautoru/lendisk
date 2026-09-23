import clsx from "clsx";

export function AdminField({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-sm text-bone/65">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-bone/40">{hint}</span>}
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    NEW: ["Новая", "bg-gold/15 text-gold-3 ring-gold/30"],
    IN_WORK: ["В работе", "bg-sky-500/10 text-sky-300 ring-sky-400/25"],
    CONTACTED: ["Связались", "bg-violet-500/10 text-violet-300 ring-violet-400/25"],
    DONE: ["Завершена", "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25"],
  };
  const [label, cls] = map[status] ?? [status, "bg-white/5 text-bone/60 ring-white/10"];
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", cls)}>{label}</span>;
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={clsx("rounded-2xl border border-white/[0.08] bg-graphite p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-base font-medium">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-bone/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
