"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/notify";

export type LeadState = { ok: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, string> };

const schema = z.object({
  type: z.enum(["podbor", "product", "callback"]).default("podbor"),
  name: z.string().trim().min(2, "Укажите имя").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 15, "Проверьте номер телефона"),
  carMake: z.string().trim().max(60).default(""),
  carModel: z.string().trim().max(80).default(""),
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .max(17, "VIN — 17 символов")
    .refine((v) => v === "" || /^[A-HJ-NPR-Z0-9]{17}$/.test(v), "VIN — 17 латинских букв и цифр (без I, O, Q)")
    .default(""),
  diameter: z.string().trim().max(10).default(""),
  comment: z.string().trim().max(1500).default(""),
  productId: z.string().trim().max(40).optional(),
  consent: z.literal("on", { error: "Нужно согласие на обработку персональных данных" }),
});

function formatPhone(d: string) {
  const n = d.length === 11 && (d[0] === "8" || d[0] === "7") ? "7" + d.slice(1) : d.length === 10 ? "7" + d : d;
  return n.length === 11 ? `+${n[0]} ${n.slice(1, 4)} ${n.slice(4, 7)}-${n.slice(7, 9)}-${n.slice(9)}` : `+${n}`;
}

export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // honeypot: bots fill every field
  if (String(form.get("website") || "")) return { ok: true };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (!rateLimit(`lead:${ip}`, 6, 10 * 60 * 1000)) {
    return { ok: false, message: "Слишком много заявок подряд. Позвоните нам или попробуйте через несколько минут." };
  }

  const raw = Object.fromEntries(
    ["type", "name", "phone", "carMake", "carModel", "vin", "diameter", "comment", "productId", "consent"].map((k) => [k, form.get(k) ?? undefined]),
  );
  // echoed back so the form keeps what the visitor typed when validation fails
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors, values, message: "Проверьте поля формы" };
  }
  const d = parsed.data;
  if (d.type === "podbor" && !d.carMake && !d.vin) {
    return { ok: false, errors: { carMake: "Укажите марку автомобиля или VIN" }, values, message: "Проверьте поля формы" };
  }

  let productId: string | null = null;
  let productLabel: string | null = null;
  if (d.productId) {
    const p = await prisma.product.findUnique({ where: { id: d.productId }, select: { id: true, name: true, diameter: true, sku: true } });
    productId = p?.id ?? null;
    productLabel = p ? `${p.name} R${p.diameter} (${p.sku})` : null;
  }

  const lead = await prisma.lead.create({
    data: {
      type: d.type,
      name: d.name,
      phone: formatPhone(d.phone),
      carMake: d.carMake,
      carModel: d.carModel,
      vin: d.vin,
      diameter: d.diameter,
      comment: d.comment,
      consent: true,
      productId,
      source: (h.get("referer") || "").slice(0, 300),
    },
  });
  await notifyNewLead({ ...lead, product: productLabel });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Заявка принята. Специалист Lendisk свяжется с вами для подбора дисков." };
}
