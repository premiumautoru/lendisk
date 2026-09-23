import { getAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/format";

const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

/** CSV export of all leads (opens in Excel; UTF-8 with BOM, «;» separator). */
export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, diameter: true, sku: true } } } });
  const status = Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, s.label]));
  const head = ["Дата", "Статус", "Тип", "Имя", "Телефон", "Марка", "Модель", "VIN", "Диаметр", "Товар", "Комментарий", "Заметка"];
  const rows = leads.map((l) =>
    [
      l.createdAt.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }),
      status[l.status] ?? l.status,
      LEAD_TYPES[l.type] ?? l.type,
      l.name,
      l.phone,
      l.carMake,
      l.carModel,
      l.vin,
      l.diameter,
      l.product ? `${l.product.name} R${l.product.diameter} (${l.product.sku})` : "",
      l.comment,
      l.note,
    ]
      .map(cell)
      .join(";"),
  );
  const csv = "﻿" + [head.map(cell).join(";"), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lendisk-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
