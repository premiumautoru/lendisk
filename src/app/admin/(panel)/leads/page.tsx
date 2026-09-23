import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ci } from "@/lib/db-text";
import { prisma } from "@/lib/db";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/format";
import { PageTitle, StatusBadge } from "@/components/admin/AdminField";

export const metadata = { title: "Заявки" };

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: ci(q) }, { phone: ci(q) }, { vin: ci(q.toUpperCase()) }, { carMake: ci(q) }] } : {}),
  };
  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { product: { select: { name: true, diameter: true } } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((a, c) => a + c._count, 0);
  const tabs = [{ value: "", label: "Все", n: total }, ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label, n: count(s.value) }))];

  return (
    <>
      <PageTitle
        title="Заявки"
        subtitle="Все обращения с сайта: подбор дисков, заявки на товары, обратные звонки."
        actions={
          <a href="/admin/leads-export" className="btn btn-ghost !h-11 text-sm">
            <Download className="size-4" /> Скачать в Excel (CSV)
          </a>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={t.value ? `/admin/leads?status=${t.value}` : "/admin/leads"}
              className={clsx("shrink-0 rounded-full px-4 py-2 text-sm transition", status === t.value ? "bg-gold text-ink" : "bg-white/[0.05] text-bone/70 hover:text-bone")}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </Link>
          ))}
        </div>
        <form className="sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Поиск: имя, телефон, VIN" className="field !h-11 text-sm" />
        </form>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-graphite p-10 text-center text-sm text-bone/50">Заявок не найдено.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-graphite">
          <ul className="divide-y divide-white/[0.06]">
            {leads.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className={clsx("grid gap-2 p-4 transition hover:bg-white/[0.03] sm:grid-cols-[110px_1.2fr_1fr_1.4fr_auto] sm:items-center sm:gap-4 sm:px-5", l.status === "NEW" && "bg-gold/[0.03]")}>
                  <StatusBadge status={l.status} />
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-bone/55">{l.phone}</p>
                  </div>
                  <p className="text-sm text-bone/60">{LEAD_TYPES[l.type] ?? l.type}</p>
                  <p className="truncate text-sm text-bone/55">
                    {l.product ? `${l.product.name} R${l.product.diameter}` : [l.carMake, l.carModel, l.diameter].filter(Boolean).join(" · ") || "—"}
                    {l.vin && <span className="ml-2 font-mono text-xs text-bone/40">VIN {l.vin}</span>}
                  </p>
                  <span className="flex items-center gap-2 text-xs text-bone/40">
                    {l.createdAt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Moscow" })}
                    <ChevronRight className="hidden size-4 sm:block" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
