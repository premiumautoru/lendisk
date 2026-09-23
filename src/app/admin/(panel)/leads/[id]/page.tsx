import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEAD_STATUSES, LEAD_TYPES, phoneHref, rub, whatsappHref } from "@/lib/format";
import { deleteLead, saveLeadNote, setLeadStatus } from "@/app/actions/admin";
import { Card, PageTitle, StatusBadge } from "@/components/admin/AdminField";
import { SubmitButton } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/ui/icons";

export const metadata = { title: "Заявка" };

export default async function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { product: true } });
  if (!lead) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Тип заявки", LEAD_TYPES[lead.type] ?? lead.type],
    ["Имя", lead.name],
    ["Телефон", <a key="p" href={phoneHref(lead.phone)} className="text-gold hover:underline">{lead.phone}</a>],
    ["Марка автомобиля", lead.carMake || "—"],
    ["Модель автомобиля", lead.carModel || "—"],
    ["VIN", lead.vin ? <span key="v" className="font-mono">{lead.vin}</span> : "—"],
    ["Желаемый диаметр", lead.diameter || "—"],
    ["Комментарий", lead.comment ? <span key="c" className="whitespace-pre-line">{lead.comment}</span> : "—"],
    ["Согласие на обработку ПД", lead.consent ? "Да" : "Нет"],
    ["Создана", lead.createdAt.toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Moscow" })],
    ["Страница отправки", lead.source || "—"],
  ];

  return (
    <>
      <Link href="/admin/leads" className="mb-6 inline-flex items-center gap-2 text-sm text-bone/55 hover:text-bone">
        <ArrowLeft className="size-4" /> Все заявки
      </Link>
      <PageTitle title={`Заявка от ${lead.name}`} subtitle={<StatusBadge status={lead.status} />} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Данные клиента">
          <dl className="divide-y divide-white/[0.06]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                <dt className="text-sm text-bone/50">{k}</dt>
                <dd className="break-words text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          {lead.product && (
            <div className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.05] p-4 text-sm">
              <p className="text-bone/55">Товар из заявки</p>
              <Link href={`/admin/products/${lead.product.id}`} className="mt-1 block font-medium text-gold hover:underline">
                {lead.product.name} R{lead.product.diameter} · {lead.product.pcd} · ET{lead.product.et}
              </Link>
              <p className="mt-1 text-bone/50">{rub(lead.product.price)} · арт. {lead.product.sku}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Связаться">
            <div className="grid gap-2">
              <a href={phoneHref(lead.phone)} className="btn btn-gold !h-11 text-sm"><Phone className="size-4" /> Позвонить</a>
              <a href={whatsappHref(lead.phone, `Здравствуйте, ${lead.name}! Это Lendisk, по вашей заявке на подбор дисков.`)} target="_blank" rel="noopener" className="btn btn-ghost !h-11 text-sm">
                <WhatsAppIcon className="size-4 text-[#25D366]" /> Написать в WhatsApp
              </a>
            </div>
          </Card>

          <Card title="Статус заявки">
            <div className="grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <form key={s.value} action={setLeadStatus.bind(null, lead.id, s.value)}>
                  <button className={`w-full rounded-xl border px-3 py-2.5 text-sm transition ${lead.status === s.value ? "border-gold bg-gold text-ink" : "border-white/10 text-bone/70 hover:border-gold/50"}`}>{s.label}</button>
                </form>
              ))}
            </div>
          </Card>

          <Card title="Заметка менеджера">
            <form action={saveLeadNote.bind(null, lead.id)} className="space-y-3">
              <textarea name="note" defaultValue={lead.note} rows={4} className="field !h-auto py-3 text-sm" placeholder="Например: перезвонить в 18:00, предложить TS-5611 R20" />
              <SubmitButton variant="ghost">Сохранить заметку</SubmitButton>
            </form>
          </Card>

          <form action={deleteLead.bind(null, lead.id)}>
            <SubmitButton variant="danger" confirm="Удалить заявку безвозвратно?" pendingText="Удаление…">
              <Trash2 className="size-4" /> Удалить заявку
            </SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
