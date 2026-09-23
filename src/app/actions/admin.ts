"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { removeFile, saveImage, saveLogo, saveModel } from "@/lib/storage";
import { SETTINGS_DEFAULTS, type SettingKey } from "@/lib/settings-defaults";

export type FormState = { ok?: boolean; error?: string; message?: string };

function refreshSite() {
  revalidatePath("/", "layout");
}

function slugify(s: string) {
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya" };
  return s
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => map[c] ?? "")
    .replace(/[×*]/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", ".").replace(/\s/g, ""));

/* ───────────── leads ───────────── */

export async function setLeadStatus(id: string, status: string) {
  await requireAdmin();
  if (!["NEW", "IN_WORK", "CONTACTED", "DONE"].includes(status)) return;
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function saveLeadNote(id: string, form: FormData) {
  await requireAdmin();
  await prisma.lead.update({ where: { id }, data: { note: String(form.get("note") || "").slice(0, 3000) } });
  revalidatePath(`/admin/leads/${id}`);
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin", "layout");
  redirect("/admin/leads");
}

/* ───────────── products ───────────── */

const productSchema = z.object({
  name: z.string().trim().min(2, "Укажите название"),
  model: z.string().trim().default(""),
  brand: z.string().trim().min(1, "Укажите бренд"),
  sku: z.string().trim().min(2, "Укажите артикул"),
  slug: z.string().trim().default(""),
  diameter: z.number().int().min(10).max(26),
  width: z.number().min(3).max(15),
  pcd: z.string().trim().min(3, "Укажите разболтовку"),
  et: z.number().min(-100).max(150),
  dia: z.number().min(40).max(180),
  finish: z.string().trim().default(""),
  finishCode: z.string().trim().default(""),
  type: z.string().trim().default("Литой"),
  axle: z.string().trim().default(""),
  compatibleMakes: z.string().trim().default(""),
  price: z.number().int().min(0).max(10_000_000),
  oldPrice: z.number().int().min(0).max(10_000_000).optional(),
  stockQty: z.number().int().min(0).max(100000),
  warehouse: z.string().trim().default(""),
  description: z.string().trim().max(5000).default(""),
  model3dUrl: z.string().trim().default(""),
});

function readProduct(form: FormData) {
  const str = (k: string) => String(form.get(k) ?? "");
  const oldPrice = num(form.get("oldPrice"));
  return productSchema.safeParse({
    name: str("name"),
    model: str("model"),
    brand: str("brand"),
    sku: str("sku"),
    slug: str("slug"),
    diameter: num(form.get("diameter")),
    width: num(form.get("width")),
    pcd: str("pcd").replace(/[x*х]/gi, "×").replace(".", ","),
    et: num(form.get("et")),
    dia: num(form.get("dia")),
    finish: str("finish"),
    finishCode: str("finishCode"),
    type: str("type") || "Литой",
    axle: str("axle"),
    compatibleMakes: str("compatibleMakes"),
    price: Math.round(num(form.get("price"))),
    oldPrice: oldPrice > 0 ? Math.round(oldPrice) : undefined,
    stockQty: Math.round(num(form.get("stockQty")) || 0),
    warehouse: str("warehouse"),
    description: str("description"),
    model3dUrl: str("model3dUrl"),
  });
}

async function attachUploads(productId: string, form: FormData) {
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const spin = form.get("photosSpin") === "on";
  if (files.length) {
    const last = await prisma.productImage.findFirst({ where: { productId }, orderBy: { sort: "desc" } });
    let sort = (last?.sort ?? -1) + 1;
    for (const f of files.slice(0, 72)) {
      const url = await saveImage(f);
      await prisma.productImage.create({ data: { productId, url, sort: sort++, spin } });
    }
  }
  const model = form.get("model3d");
  if (model instanceof File && model.size > 0) {
    const prev = await prisma.product.findUnique({ where: { id: productId }, select: { model3dUrl: true } });
    const url = await saveModel(model);
    await prisma.product.update({ where: { id: productId }, data: { model3dUrl: url } });
    await removeFile(prev?.model3dUrl);
  }
}

export async function saveProduct(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = readProduct(form);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Проверьте поля" };
  const d = parsed.data;
  const slug = slugify(d.slug || `${d.name}-r${d.diameter}-${d.pcd}-et${d.et}`) || slugify(d.sku);

  const clash = await prisma.product.findFirst({ where: { OR: [{ sku: d.sku }, { slug }], NOT: id ? { id } : undefined }, select: { sku: true, slug: true } });
  if (clash) return { error: clash.sku === d.sku ? "Товар с таким артикулом уже существует" : "Такой адрес страницы (slug) уже занят" };

  const data = {
    name: d.name,
    model: d.model || d.name.split(" ")[0],
    brand: d.brand,
    sku: d.sku,
    slug,
    diameter: d.diameter,
    width: d.width,
    pcd: d.pcd,
    et: d.et,
    dia: d.dia,
    finish: d.finish,
    finishCode: d.finishCode,
    type: d.type,
    axle: d.axle || null,
    compatibleMakes: d.compatibleMakes,
    price: d.price,
    oldPrice: d.oldPrice ?? null,
    stockQty: d.stockQty,
    warehouse: d.warehouse,
    description: d.description,
    inStock: form.get("inStock") === "on",
    published: form.get("published") === "on",
    isPopular: form.get("isPopular") === "on",
    isNew: form.get("isNew") === "on",
    ...(form.get("removeModel") === "on" ? { model3dUrl: null } : {}),
  };

  let productId = id;
  try {
    if (id) {
      if (form.get("removeModel") === "on") {
        const prev = await prisma.product.findUnique({ where: { id }, select: { model3dUrl: true } });
        await removeFile(prev?.model3dUrl);
      }
      await prisma.product.update({ where: { id }, data });
    } else {
      const created = await prisma.product.create({ data });
      productId = created.id;
    }
    await attachUploads(productId!, form);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось сохранить" };
  }
  refreshSite();
  if (!id) redirect(`/admin/products/${productId}?created=1`);
  return { ok: true, message: "Изменения сохранены" };
}

export async function quickUpdateProduct(id: string, patch: { price?: number; inStock?: boolean; stockQty?: number }) {
  await requireAdmin();
  const data: { price?: number; inStock?: boolean; stockQty?: number } = {};
  if (patch.price !== undefined && Number.isFinite(patch.price) && patch.price >= 0) data.price = Math.round(patch.price);
  if (patch.inStock !== undefined) data.inStock = patch.inStock;
  if (patch.stockQty !== undefined && Number.isFinite(patch.stockQty) && patch.stockQty >= 0) data.stockQty = Math.round(patch.stockQty);
  await prisma.product.update({ where: { id }, data });
  refreshSite();
}

export async function bulkPrice(form: FormData): Promise<void> {
  await requireAdmin();
  const brand = String(form.get("brand") || "");
  const diameter = Number(form.get("diameter") || 0);
  const price = Math.round(num(form.get("price")));
  if (!(price > 0)) return;
  await prisma.product.updateMany({ where: { ...(brand ? { brand } : {}), ...(diameter ? { diameter } : {}) }, data: { price } });
  refreshSite();
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (p) {
    for (const img of p.images) await removeFile(img.url);
    await removeFile(p.model3dUrl);
    await prisma.product.delete({ where: { id } });
  }
  refreshSite();
  redirect("/admin/products?deleted=1");
}

export async function deleteImage(imageId: string) {
  await requireAdmin();
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  await prisma.productImage.delete({ where: { id: imageId } });
  // imported catalogue photos can be shared between products, so only uploaded files are removed
  const stillUsed = await prisma.productImage.count({ where: { url: img.url } });
  if (!stillUsed) await removeFile(img.url);
  refreshSite();
}

export async function moveImage(imageId: string, dir: -1 | 1) {
  await requireAdmin();
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  const list = await prisma.productImage.findMany({ where: { productId: img.productId }, orderBy: { sort: "asc" } });
  const i = list.findIndex((x) => x.id === imageId);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await prisma.$transaction(list.map((x, k) => prisma.productImage.update({ where: { id: x.id }, data: { sort: k } })));
  refreshSite();
}

export async function toggleImageSpin(imageId: string) {
  await requireAdmin();
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  await prisma.productImage.update({ where: { id: imageId }, data: { spin: !img.spin } });
  refreshSite();
}

/* ───────────── reviews ───────────── */

export async function saveReview(id: string | null, form: FormData): Promise<void> {
  await requireAdmin();
  const data = {
    author: String(form.get("author") || "").trim().slice(0, 80),
    car: String(form.get("car") || "").trim().slice(0, 80),
    text: String(form.get("text") || "").trim().slice(0, 2000),
    rating: Math.min(5, Math.max(1, Number(form.get("rating") || 5))),
    sort: Number(form.get("sort") || 0),
    published: form.get("published") === "on",
    isDemo: form.get("isDemo") === "on",
  };
  if (!data.author || !data.text) return;
  if (id) await prisma.review.update({ where: { id }, data });
  else await prisma.review.create({ data });
  refreshSite();
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } }).catch(() => {});
  refreshSite();
  revalidatePath("/admin/reviews");
}

/* ───────────── FAQ ───────────── */

export async function saveFaq(id: string | null, form: FormData): Promise<void> {
  await requireAdmin();
  const data = {
    question: String(form.get("question") || "").trim().slice(0, 300),
    answer: String(form.get("answer") || "").trim().slice(0, 3000),
    sort: Number(form.get("sort") || 0),
    published: form.get("published") === "on",
  };
  if (!data.question || !data.answer) return;
  if (id) await prisma.faqItem.update({ where: { id }, data });
  else await prisma.faqItem.create({ data });
  refreshSite();
  revalidatePath("/admin/faq");
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await prisma.faqItem.delete({ where: { id } }).catch(() => {});
  refreshSite();
  revalidatePath("/admin/faq");
}

/* ───────────── settings ───────────── */

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const keys = Object.keys(SETTINGS_DEFAULTS) as SettingKey[];
  try {
    for (const key of keys) {
      if (key === "logoUrl") continue;
      const v = form.get(key);
      if (v === null) continue;
      const value = String(v).trim().slice(0, 4000);
      await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    const logo = form.get("logo");
    if (logo instanceof File && logo.size > 0) {
      const url = await saveLogo(logo);
      await prisma.setting.upsert({ where: { key: "logoUrl" }, update: { value: url }, create: { key: "logoUrl", value: url } });
    }
    if (form.get("resetLogo") === "on") {
      await prisma.setting.upsert({ where: { key: "logoUrl" }, update: { value: SETTINGS_DEFAULTS.logoUrl }, create: { key: "logoUrl", value: SETTINGS_DEFAULTS.logoUrl } });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось сохранить" };
  }
  refreshSite();
  return { ok: true, message: "Настройки сохранены" };
}
