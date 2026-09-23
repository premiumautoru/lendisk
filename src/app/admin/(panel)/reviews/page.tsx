import { Star, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteReview, saveReview } from "@/app/actions/admin";
import { AdminField, Card, PageTitle } from "@/components/admin/AdminField";
import { SubmitButton, Toggle } from "@/components/admin/ui";
import type { Review } from "@prisma/client";

export const metadata = { title: "Отзывы" };

function ReviewFields({ r }: { r?: Review }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminField label="Имя клиента *">
          <input name="author" defaultValue={r?.author} required className="field" />
        </AdminField>
        <AdminField label="Автомобиль">
          <input name="car" defaultValue={r?.car} className="field" placeholder="BMW X5" />
        </AdminField>
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Оценка">
            <select name="rating" defaultValue={r?.rating ?? 5} className="field">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
            </select>
          </AdminField>
          <AdminField label="Порядок">
            <input name="sort" defaultValue={r?.sort ?? 0} inputMode="numeric" className="field" />
          </AdminField>
        </div>
      </div>
      <AdminField label="Текст отзыва *" className="mt-4">
        <textarea name="text" defaultValue={r?.text} required rows={3} className="field !h-auto py-3" />
      </AdminField>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Toggle name="published" defaultChecked={r ? r.published : true} label="Опубликован" />
        <Toggle name="isDemo" defaultChecked={r?.isDemo} label="Демонстрационный" hint="Показывает метку «Пример отзыва»" />
      </div>
    </>
  );
}

export default async function ReviewsAdmin() {
  await requireAdmin();
  const reviews = await prisma.review.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "desc" }] });
  const demo = reviews.filter((r) => r.isDemo).length;
  return (
    <>
      <PageTitle title="Отзывы" subtitle={demo ? `Сейчас ${demo} демонстрационных отзыва — замените их реальными отзывами клиентов.` : "Отзывы показываются на главной странице."} />
      <Card title="Добавить отзыв" className="mb-8">
        <form action={saveReview.bind(null, null)}>
          <ReviewFields />
          <div className="mt-5"><SubmitButton>Добавить отзыв</SubmitButton></div>
        </form>
      </Card>

      <div className="space-y-4">
        {reviews.map((r) => (
          <details key={r.id} className="group rounded-2xl border border-white/[0.08] bg-graphite">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex text-gold">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="size-3.5" fill="currentColor" />)}</span>
              <span className="font-medium">{r.author}</span>
              {r.car && <span className="text-sm text-bone/45">{r.car}</span>}
              {r.isDemo && <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-bone/50">демо</span>}
              {!r.published && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">скрыт</span>}
              <span className="ml-auto text-sm text-gold group-open:hidden">Редактировать</span>
            </summary>
            <div className="border-t border-white/[0.06] p-5">
              <form action={saveReview.bind(null, r.id)}>
                <ReviewFields r={r} />
                <div className="mt-5"><SubmitButton>Сохранить</SubmitButton></div>
              </form>
              <form action={deleteReview.bind(null, r.id)} className="mt-3">
                <SubmitButton variant="danger" confirm="Удалить отзыв?" pendingText="Удаление…"><Trash2 className="size-4" /> Удалить</SubmitButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
