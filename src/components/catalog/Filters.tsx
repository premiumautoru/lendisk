"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Facets } from "@/lib/catalog";

type Props = { facets: Facets; total: number };

const SORTS = [
  { v: "", l: "Сначала популярные" },
  { v: "price-asc", l: "Сначала дешевле" },
  { v: "price-desc", l: "Сначала дороже" },
  { v: "d-asc", l: "Диаметр ↑" },
  { v: "d-desc", l: "Диаметр ↓" },
  { v: "new", l: "Новинки" },
];

function useQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const list = (k: string) => (sp.get(k) || "").split(",").filter(Boolean);
  const set = (patch: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(",") : v;
      if (val) next.set(k, val);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { sp, list, set, pending };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-full border px-3.5 py-2 text-sm transition",
        active ? "border-gold bg-gold text-ink" : "border-white/12 text-bone/75 hover:border-gold/60 hover:text-bone",
      )}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-white/[0.07] py-6 first:pt-0">
      <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-bone/45">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterBody({ facets }: { facets: Facets }) {
  const { sp, list, set } = useQueryState();
  const brands = list("brand");
  const ds = list("d");
  const pcds = list("pcd");
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");
  const [showAllPcd, setShowAllPcd] = useState(false);
  const applyPrice = () => {
    if ((sp.get("min") || "") !== min || (sp.get("max") || "") !== max) set({ min: min || null, max: max || null });
  };
  const toggle = (k: string, arr: string[], v: string) => set({ [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] });

  return (
    <div>
      <Group title="Наличие">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          Только в наличии
          <input type="checkbox" className="peer sr-only" checked={sp.get("stock") === "1"} onChange={(e) => set({ stock: e.target.checked ? "1" : null })} />
          <span className="relative h-6 w-11 rounded-full bg-white/10 transition after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-bone after:transition peer-checked:bg-gold peer-checked:after:translate-x-5 peer-checked:after:bg-ink" />
        </label>
      </Group>

      <Group title="Диаметр">
        <div className="flex flex-wrap gap-2">
          {facets.diameters.map((d) => (
            <Chip key={d.value} active={ds.includes(d.value)} onClick={() => toggle("d", ds, d.value)}>
              R{d.value}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Цена за диск, ₽">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyPrice();
          }}
        >
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={`от ${facets.price.min}`} className="field !h-11 !px-3 text-sm" aria-label="Цена от" onBlur={applyPrice} />
          <span className="text-bone/30">—</span>
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={`до ${facets.price.max}`} className="field !h-11 !px-3 text-sm" aria-label="Цена до" onBlur={applyPrice} />
        </form>
      </Group>

      <Group title="Марка автомобиля">
        <select
          value={sp.get("make") || ""}
          onChange={(e) => set({ make: e.target.value || null })}
          className="field !h-11 appearance-none text-sm"
          aria-label="Марка автомобиля"
        >
          <option value="">Любая марка</option>
          {facets.makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-bone/35">Совместимость по разболтовке — финально подтвердим по VIN.</p>
      </Group>

      <Group title="Бренд / серия">
        <div className="flex flex-wrap gap-2">
          {facets.brands.map((b) => (
            <Chip key={b.value} active={brands.includes(b.value)} onClick={() => toggle("brand", brands, b.value)}>
              {b.value} <span className="opacity-50">{b.count}</span>
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Разболтовка (PCD)">
        <div className="flex flex-wrap gap-2">
          {(showAllPcd ? facets.pcds : facets.pcds.slice(0, 8)).map((p) => (
            <Chip key={p.value} active={pcds.includes(p.value)} onClick={() => toggle("pcd", pcds, p.value)}>
              {p.value}
            </Chip>
          ))}
        </div>
        {facets.pcds.length > 8 && (
          <button type="button" onClick={() => setShowAllPcd((v) => !v)} className="mt-3 text-sm text-gold hover:underline">
            {showAllPcd ? "Свернуть" : `Ещё ${facets.pcds.length - 8}`}
          </button>
        )}
      </Group>
    </div>
  );
}

export function SearchBox() {
  const { sp, set, pending } = useQueryState();
  const [q, setQ] = useState(sp.get("q") || "");
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") || "") !== q.trim()) set({ q: q.trim() || null });
    }, 350);
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
      />
    </div>
  );
}

export function SortSelect() {
  const { sp, set } = useQueryState();
  return (
    <select value={sp.get("sort") || ""} onChange={(e) => set({ sort: e.target.value || null })} className="field !h-12 min-w-0 flex-1 !rounded-full appearance-none !pr-10 text-sm sm:!w-auto sm:flex-none" aria-label="Сортировка">
      {SORTS.map((s) => (
        <option key={s.v} value={s.v}>
          {s.l}
        </option>
      ))}
    </select>
  );
}

export function ActiveFilters() {
  const { sp, set } = useQueryState();
  const chips = useMemo(() => {
    const out: { label: string; clear: () => void }[] = [];
    const list = (k: string) => (sp.get(k) || "").split(",").filter(Boolean);
    for (const d of list("d")) out.push({ label: `R${d}`, clear: () => set({ d: list("d").filter((x) => x !== d) }) });
    for (const b of list("brand")) out.push({ label: b, clear: () => set({ brand: list("brand").filter((x) => x !== b) }) });
    for (const p of list("pcd")) out.push({ label: p, clear: () => set({ pcd: list("pcd").filter((x) => x !== p) }) });
    if (sp.get("make")) out.push({ label: sp.get("make")!, clear: () => set({ make: null }) });
    if (sp.get("min") || sp.get("max")) out.push({ label: `${sp.get("min") || 0}–${sp.get("max") || "∞"} ₽`, clear: () => set({ min: null, max: null }) });
    if (sp.get("stock") === "1") out.push({ label: "В наличии", clear: () => set({ stock: null }) });
    if (sp.get("q")) out.push({ label: `«${sp.get("q")}»`, clear: () => set({ q: null }) });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);
  if (!chips.length) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={c.clear} className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/[0.08] px-3 py-1.5 text-sm text-gold-3 transition hover:border-gold">
          {c.label} <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={() => set({ d: null, brand: null, pcd: null, make: null, min: null, max: null, stock: null, q: null })} className="px-2 text-sm text-bone/50 underline-offset-4 hover:text-bone hover:underline">
        Сбросить всё
      </button>
    </div>
  );
}

export function FilterSidebar({ facets }: { facets: Facets }) {
  return (
    <aside className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar">
      <FilterBody facets={facets} />
    </aside>
  );
}

export function MobileFilters({ facets, total }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* mobile trigger */}
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost !h-12 shrink-0 lg:hidden" aria-haspopup="dialog">
        <SlidersHorizontal className="size-4" /> Фильтры
      </button>

      {/* mobile sheet */}
      <div className={clsx("fixed inset-0 z-[60] lg:hidden", open ? "visible" : "invisible")} role="dialog" aria-modal="true" aria-label="Фильтры каталога">
        <div className={clsx("absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div
          className={clsx(
            "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[1.8rem] border-t border-white/10 bg-graphite transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <span className="mx-auto mb-2 block h-1 w-10 rounded-full bg-white/20 absolute left-1/2 top-2 -translate-x-1/2" />
            <p className="font-display text-lg">Фильтры</p>
            <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-white/10" aria-label="Закрыть фильтры">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-2">
            <FilterBody facets={facets} />
          </div>
          <div className="border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-gold w-full">
              Показать {total.toLocaleString("ru-RU")} товаров
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
