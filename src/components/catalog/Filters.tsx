"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { Facets } from "@/lib/catalog";
import { pcdFromUrl } from "@/lib/format";

type Props = { facets: Facets; total: number };

const SORTS = [
  { v: "", l: "Сначала популярные" },
  { v: "price-asc", l: "Сначала дешевле" },
  { v: "price-desc", l: "Сначала дороже" },
  { v: "d-asc", l: "Диаметр ↑" },
  { v: "d-desc", l: "Диаметр ↓" },
  { v: "new", l: "Новинки" },
];

/** Every filter param; "Сбросить всё" clears all of them (sorting is kept). */
const FILTER_KEYS = ["q", "brand", "series", "d", "pcd", "make", "min", "max", "stock"] as const;

const selectArrow =
  "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23c29a5a%22 fill=%22none%22 stroke-width=%221.6%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat !pr-10";

/**
 * The query string of the latest navigation that has not landed yet. Quick consecutive clicks
 * (e.g. switching off R19 and R20 in a row) must build on it, not on the URL still on screen —
 * otherwise the second click undoes the first one.
 */
const nav = { pending: null as string | null };

function useQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const [pending, start] = useTransition();
  const current = urlParams.toString();
  // the navigation has arrived — drop the pending copy
  useEffect(() => {
    if (nav.pending === current) nav.pending = null;
  }, [current]);
  const sp = nav.pending !== null && nav.pending !== current ? new URLSearchParams(nav.pending) : urlParams;
  const list = (k: string) => (sp.get(k) || "").split(",").filter(Boolean);
  const set = (patch: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(nav.pending ?? current);
    // "Серия" depends on the brand: a series of another brand would give an empty page
    if ("brand" in patch) next.delete("series");
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(",") : v;
      if (val) next.set(k, val);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    nav.pending = qs;
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const reset = () => set(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])));
  const active = FILTER_KEYS.some((k) => sp.get(k));
  return { sp, list, set, reset, active, pending };
}

function Chip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled && !active}
      className={clsx(
        "rounded-full border px-3.5 py-2 text-sm transition",
        active ? "border-gold bg-gold text-ink" : "border-white/12 text-bone/75 hover:border-gold/60 hover:text-bone",
        "disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:text-bone/25 disabled:hover:text-bone/25",
      )}
    >
      {children}
    </button>
  );
}

const Count = ({ n }: { n: number }) => <span className="ml-1 text-[0.75em] opacity-55">{n}</span>;

function Group({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="border-b border-white/[0.07] py-5 first:pt-0">
      {/* float + clear keeps the legend inside the normal flow, so spacing matches other blocks */}
      <legend className="float-left mb-3 w-full text-xs font-semibold uppercase tracking-[0.18em] text-bone/45">{title}</legend>
      <div className="clear-left">{children}</div>
      {hint && <p className="mt-2 text-xs text-bone/35">{hint}</p>}
    </fieldset>
  );
}

/**
 * Price inputs: local while typing; applied on Enter or when focus leaves *both* fields
 * (moving from «от» to «до» does not trigger a reload that would overwrite what you are typing).
 * External URL changes (reset, chips) are synced back, our own applied values are not re-applied.
 */
function PriceRange({ facets }: { facets: Facets }) {
  const { sp, set } = useQueryState();
  const urlMin = sp.get("min") || "";
  const urlMax = sp.get("max") || "";
  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (editing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMin(urlMin);
    setMax(urlMax);
  }, [urlMin, urlMax, editing]);

  const apply = () => {
    let a = Number(min) || 0;
    let b = Number(max) || 0;
    if (a && b && a > b) [a, b] = [b, a]; // typed the other way round — swap instead of showing nothing
    const nextMin = a ? String(a) : "";
    const nextMax = b ? String(b) : "";
    setMin(nextMin);
    setMax(nextMax);
    setEditing(false);
    if (nextMin !== urlMin || nextMax !== urlMax) set({ min: nextMin || null, max: nextMax || null });
  };

  return (
    <form
      className="flex items-center gap-2"
      onFocus={() => setEditing(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) apply();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <input value={min} onChange={(e) => (setEditing(true), setMin(e.target.value.replace(/\D/g, "").slice(0, 7)))} inputMode="numeric" enterKeyHint="done" placeholder={`от ${facets.price.min || ""}`} className="field !h-11 min-w-0 !px-3 text-sm" aria-label="Цена от, ₽" />
      <span className="text-bone/30">—</span>
      <input value={max} onChange={(e) => (setEditing(true), setMax(e.target.value.replace(/\D/g, "").slice(0, 7)))} inputMode="numeric" enterKeyHint="done" placeholder={`до ${facets.price.max || ""}`} className="field !h-11 min-w-0 !px-3 text-sm" aria-label="Цена до, ₽" />
      <button type="submit" className="sr-only">Применить цену</button>
    </form>
  );
}

function FilterBody({ facets, inlineReset = true }: { facets: Facets; inlineReset?: boolean }) {
  const { sp, list, set, reset, active } = useQueryState();
  const brands = list("brand");
  const ds = list("d");
  const pcds = list("pcd");
  const series = sp.get("series") || "";
  const make = sp.get("make") || "";
  const stock = sp.get("stock") === "1";
  const [showAllPcd, setShowAllPcd] = useState(false);
  const toggle = (k: string, arr: string[], v: string) => set({ [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] });
  const pcdList = showAllPcd ? facets.pcds : facets.pcds.filter((p, i) => i < 8 || pcds.includes(p.url));

  return (
    <div>
      {active && inlineReset && (
        <button type="button" onClick={reset} className="mb-5 flex items-center gap-2 text-sm text-gold hover:underline">
          <RotateCcw className="size-3.5" /> Сбросить все фильтры
        </button>
      )}

      <Group title="Наличие">
        <label className={clsx("flex items-center justify-between gap-3 text-sm", facets.inStock === 0 && !stock ? "cursor-not-allowed text-bone/35" : "cursor-pointer")}>
          <span>
            Только в наличии <Count n={facets.inStock} />
          </span>
          <input type="checkbox" className="peer sr-only" checked={stock} disabled={facets.inStock === 0 && !stock} onChange={(e) => set({ stock: e.target.checked ? "1" : null })} />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/10 transition after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-bone after:transition peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold/50" />
        </label>
      </Group>

      <Group title="Диаметр">
        <div className="flex flex-wrap gap-2">
          {facets.diameters.map((d) => (
            <Chip key={d.value} active={ds.includes(d.value)} disabled={d.count === 0} onClick={() => toggle("d", ds, d.value)}>
              R{d.value}
              <Count n={d.count} />
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Цена за диск, ₽" hint={facets.price.max ? `Сейчас доступно: ${facets.price.min.toLocaleString("ru-RU")} – ${facets.price.max.toLocaleString("ru-RU")} ₽` : undefined}>
        <PriceRange facets={facets} />
      </Group>

      <Group title="Марка автомобиля" hint="Совместимость по разболтовке — финально подтвердим по VIN.">
        <select value={make} onChange={(e) => set({ make: e.target.value || null })} className={clsx("field !h-11 text-sm", selectArrow)} aria-label="Марка автомобиля">
          <option value="">Любая марка</option>
          {facets.makes.map((m) => (
            <option key={m.value} value={m.value} disabled={m.count === 0 && m.value !== make}>
              {m.value} ({m.count})
            </option>
          ))}
        </select>
      </Group>

      <Group title="Бренд">
        <div className="flex flex-wrap gap-2">
          {facets.brands.map((b) => (
            <Chip key={b.value} active={brands.includes(b.value)} disabled={b.count === 0} onClick={() => toggle("brand", brands, b.value)}>
              {b.value}
              <Count n={b.count} />
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Серия" hint={brands.length || make ? "Список зависит от выбранного бренда, марки и других фильтров." : "Выберите бренд, чтобы сузить список серий."}>
        <select value={series} onChange={(e) => set({ series: e.target.value || null })} className={clsx("field !h-11 text-sm", selectArrow)} aria-label="Серия диска" disabled={facets.series.length === 0}>
          <option value="">{facets.series.length ? `Все серии (${facets.series.length})` : "Нет подходящих серий"}</option>
          {facets.series.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value} ({s.count})
            </option>
          ))}
        </select>
      </Group>

      <Group title="Разболтовка (PCD)">
        <div className="flex flex-wrap gap-2">
          {pcdList.map((p) => (
            <Chip key={p.url} active={pcds.includes(p.url)} disabled={p.count === 0} onClick={() => toggle("pcd", pcds, p.url)}>
              {p.value}
              <Count n={p.count} />
            </Chip>
          ))}
        </div>
        {facets.pcds.length > 8 && (
          <button type="button" onClick={() => setShowAllPcd((v) => !v)} className="mt-3 text-sm text-gold hover:underline">
            {showAllPcd ? "Свернуть" : `Ещё ${facets.pcds.length - pcdList.length}`}
          </button>
        )}
      </Group>
    </div>
  );
}

export function SearchBox() {
  const { sp, set, pending } = useQueryState();
  const urlQ = sp.get("q") || "";
  const [q, setQ] = useState(urlQ);
  // keep the field in sync when the URL changes elsewhere (reset, chips, back button)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setQ(urlQ), [urlQ]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (urlQ !== q.trim()) set({ q: q.trim() || null });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  return (
    <div className="relative flex-1">
      <Search className={clsx("pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2", pending ? "animate-pulse text-gold" : "text-bone/40")} />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск: модель, артикул, R19, 5x112, BMW…"
        className="field !rounded-full !pl-11"
        aria-label="Поиск по каталогу"
        enterKeyHint="search"
      />
    </div>
  );
}

export function SortSelect() {
  const { sp, set } = useQueryState();
  return (
    <select value={sp.get("sort") || ""} onChange={(e) => set({ sort: e.target.value || null })} className={clsx("field !h-12 min-w-0 flex-1 !rounded-full text-sm sm:!w-auto sm:flex-none", selectArrow)} aria-label="Сортировка">
      {SORTS.map((s) => (
        <option key={s.v} value={s.v}>
          {s.l}
        </option>
      ))}
    </select>
  );
}

export function ActiveFilters() {
  const { sp, set, reset, pending } = useQueryState();
  const chips = useMemo(() => {
    const out: { label: string; clear: () => void }[] = [];
    const list = (k: string) => (sp.get(k) || "").split(",").filter(Boolean);
    if (sp.get("stock") === "1") out.push({ label: "В наличии", clear: () => set({ stock: null }) });
    for (const d of list("d")) out.push({ label: `R${d}`, clear: () => set({ d: list("d").filter((x) => x !== d) }) });
    if (sp.get("min") || sp.get("max")) out.push({ label: `${sp.get("min") || 0} – ${sp.get("max") || "∞"} ₽`, clear: () => set({ min: null, max: null }) });
    if (sp.get("make")) out.push({ label: sp.get("make")!, clear: () => set({ make: null }) });
    for (const b of list("brand")) out.push({ label: b, clear: () => set({ brand: list("brand").filter((x) => x !== b) }) });
    if (sp.get("series")) out.push({ label: `Серия ${sp.get("series")}`, clear: () => set({ series: null }) });
    for (const p of list("pcd")) out.push({ label: pcdFromUrl(p), clear: () => set({ pcd: list("pcd").filter((x) => x !== p) }) });
    if (sp.get("q")) out.push({ label: `«${sp.get("q")}»`, clear: () => set({ q: null }) });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);
  if (!chips.length) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2" aria-live="polite">
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={c.clear} className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/[0.08] px-3 py-1.5 text-sm text-gold-3 transition hover:border-gold" aria-label={`Убрать фильтр ${c.label}`}>
          {c.label} <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={reset} className="px-2 text-sm text-bone/50 underline-offset-4 hover:text-bone hover:underline">
        Сбросить всё
      </button>
      {pending && <Loader2 className="size-4 animate-spin text-gold" />}
    </div>
  );
}

/** Empty result: explain and offer a one-tap reset. */
export function ResetFiltersButton({ className }: { className?: string }) {
  const { reset } = useQueryState();
  return (
    <button type="button" onClick={reset} className={className}>
      <RotateCcw className="size-4" /> Сбросить фильтры
    </button>
  );
}

export function FilterSidebar({ facets }: { facets: Facets }) {
  return (
    <aside className="no-scrollbar sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      <FilterBody facets={facets} />
    </aside>
  );
}

export function MobileFilters({ facets, total }: Props) {
  const [open, setOpen] = useState(false);
  const { active, reset, pending, sp } = useQueryState();
  const count = ["brand", "series", "d", "pcd", "make", "stock"].filter((k) => sp.get(k)).length + (sp.get("min") || sp.get("max") ? 1 : 0);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost !h-12 shrink-0 lg:hidden" aria-haspopup="dialog">
        <SlidersHorizontal className="size-4" /> Фильтры
        {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-gold text-[0.7rem] font-bold text-ink">{count}</span>}
      </button>

      <div className={clsx("fixed inset-0 z-[60] lg:hidden", open ? "visible" : "invisible")} role="dialog" aria-modal="true" aria-label="Фильтры каталога">
        <div className={clsx("absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div
          className={clsx(
            "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[1.8rem] border-t border-white/10 bg-graphite transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="relative flex items-center justify-between gap-3 px-5 pb-3 pt-5">
            <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
            <p className="font-display text-lg">Фильтры</p>
            <div className="flex items-center gap-2">
              {active && (
                <button type="button" onClick={reset} className="rounded-full px-3 py-2 text-sm text-gold">
                  Сбросить
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-white/10" aria-label="Закрыть фильтры">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2">
            {/* the sheet header already has «Сбросить» */}
            <FilterBody facets={facets} inlineReset={false} />
          </div>
          <div className="border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-gold w-full">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {total > 0 ? `Показать ${total.toLocaleString("ru-RU")} ${plural(total)}` : "Нет подходящих дисков"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function plural(n: number) {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return "дисков";
  if (b === 1) return "диск";
  if (b > 1 && b < 5) return "диска";
  return "дисков";
}
