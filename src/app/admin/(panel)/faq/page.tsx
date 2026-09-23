import { Trash2 } from "lucide-react";
import type { FaqItem } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFaq, saveFaq } from "@/app/actions/admin";
import { AdminField, Card, PageTitle } from "@/components/admin/AdminField";
import { SubmitButton, Toggle } from "@/components/admin/ui";

export const metadata = { title: "Вопросы и ответы" };

function FaqFields({ f }: { f?: FaqItem }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <AdminField label="Вопрос *">
          <input name="question" defaultValue={f?.question} required className="field" />
        </AdminField>
        <AdminField label="Порядок">
          <input name="sort" defaultValue={f?.sort ?? 0} inputMode="numeric" className="field" />
        </AdminField>
      </div>
      <AdminField label="Ответ *" className="mt-4">
        <textarea name="answer" defaultValue={f?.answer} required rows={3} className="field !h-auto py-3" />
      </AdminField>
      <div className="mt-4 max-w-sm">
        <Toggle name="published" defaultChecked={f ? f.published : true} label="Показывать на сайте" />
      </div>
    </>
  );
}

export default async function FaqAdmin() {
  await requireAdmin();
  const items = await prisma.faqItem.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <PageTitle title="Вопросы и ответы" subtitle="Блок FAQ на главной странице." />
      <Card title="Добавить вопрос" className="mb-8">
        <form action={saveFaq.bind(null, null)}>
          <FaqFields />
          <div className="mt-5"><SubmitButton>Добавить</SubmitButton></div>
        </form>
      </Card>
      <div className="space-y-4">
        {items.map((f) => (
          <details key={f.id} className="group rounded-2xl border border-white/[0.08] bg-graphite">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-xs text-bone/40">{f.sort}</span>
              <span className="font-medium">{f.question}</span>
              {!f.published && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">скрыт</span>}
              <span className="ml-auto shrink-0 text-sm text-gold group-open:hidden">Редактировать</span>
            </summary>
            <div className="border-t border-white/[0.06] p-5">
              <form action={saveFaq.bind(null, f.id)}>
                <FaqFields f={f} />
                <div className="mt-5"><SubmitButton>Сохранить</SubmitButton></div>
              </form>
              <form action={deleteFaq.bind(null, f.id)} className="mt-3">
                <SubmitButton variant="danger" confirm="Удалить вопрос?" pendingText="Удаление…"><Trash2 className="size-4" /> Удалить</SubmitButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
