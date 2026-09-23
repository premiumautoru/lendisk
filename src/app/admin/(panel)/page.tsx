import Link from "next/link";
import { ArrowRight, Inbox, Package, PackageX, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEAD_TYPES } from "@/lib/format";
import { Card, PageTitle, StatusBadge } from "@/components/admin/AdminField";

export const metadata = { title: "Обзор" };

export default async function Dashboard() {
  await requireAdmin();
  const [newLeads, totalLeads, products, outOfStock, reviews, latest] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.product.count(),
    prisma.product.count({ where: { inStock: false } }),
    prisma.review.count({ where: { published: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { product: { select: { name: true, diameter: true } } } }),
  ]);
  const stats = [
    { label: "Новые заявки", value: newLeads, icon: Inbox, href: "/admin/leads?status=NEW", accent: true },
    { label: "Всего заявок", value: totalLeads, icon: Inbox, href: "/admin/leads" },
    { label: "Товаров", value: products, icon: Package, href: "/admin/products" },
    { label: "Нет в наличии", value: outOfStock, icon: PackageX, href: "/admin/products?stock=0" },
    { label: "Отзывов", value: reviews, icon: Star, href: "/admin/reviews" },
  ];
  return (
    <>
      <PageTitle title="Добро пожаловать" subtitle="Здесь вы управляете заявками, товарами и текстами сайта Lendisk." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${s.accent ? "border-gold/40 bg-gold/[0.08]" : "border-white/[0.08] bg-graphite hover:border-white/20"}`}>
            <s.icon className={`size-5 ${s.accent ? "text-gold" : "text-bone/40"}`} strokeWidth={1.7} />
            <p className="mt-4 font-display text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-bone/55">{s.label}</p>
          </Link>
        ))}
      </div>

      <Card
        className="mt-8"
        title="Последние заявки"
        actions={
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm text-gold hover:underline">
            Все заявки <ArrowRight className="size-4" />
          </Link>
        }
      >
        {latest.length === 0 ? (
          <p className="py-6 text-center text-sm text-bone/45">Заявок пока нет. Они появятся здесь, как только клиенты отправят форму на сайте.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {latest.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 hover:text-gold">
                  <StatusBadge status={l.status} />
                  <span className="font-medium">{l.name}</span>
                  <span className="text-sm text-bone/60">{l.phone}</span>
                  <span className="text-sm text-bone/45">{LEAD_TYPES[l.type] ?? l.type}{l.product ? ` · ${l.product.name} R${l.product.diameter}` : l.carMake ? ` · ${l.carMake} ${l.carModel}` : ""}</span>
                  <span className="ml-auto text-xs text-bone/40">{l.createdAt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Moscow" })}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/products/new" className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-bone/70 hover:border-gold hover:text-gold">+ Добавить новый диск</Link>
        <Link href="/admin/settings" className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-bone/70 hover:border-gold hover:text-gold">Изменить телефон, адрес, тексты</Link>
        <Link href="/admin/reviews" className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-bone/70 hover:border-gold hover:text-gold">Добавить отзыв клиента</Link>
      </div>
    </>
  );
}
