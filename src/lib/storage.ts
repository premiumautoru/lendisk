import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "./db";

/**
 * Storage for admin uploads, served by /media/[...path].
 *  - STORAGE_DRIVER=fs (default): files in UPLOAD_DIR on disk;
 *  - STORAGE_DRIVER=db: files in the StoredFile table — for hosts without a persistent disk (Render, etc.).
 */
export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");
const DRIVER = process.env.STORAGE_DRIVER === "db" ? "db" : "fs";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_MODEL = 40 * 1024 * 1024;

export const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

/** Stores bytes under `folder/name` and returns the public /media URL. */
async function put(folder: string, name: string, data: Buffer) {
  const rel = `${folder}/${name}`;
  if (DRIVER === "db") {
    await prisma.storedFile.create({ data: { path: rel, mime: MIME[path.extname(name)] ?? "application/octet-stream", size: data.length, data: new Uint8Array(data) } });
  } else {
    const dir = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), data);
  }
  return `/media/${rel}`;
}

/** Reads a stored file by its path relative to /media (null when missing or unsafe). */
export async function getFile(rel: string): Promise<{ data: Buffer; mime: string } | null> {
  const mime = MIME[path.extname(rel).toLowerCase()];
  if (!mime || rel.includes("..")) return null;
  if (DRIVER === "db") {
    const f = await prisma.storedFile.findUnique({ where: { path: rel } });
    return f ? { data: Buffer.from(f.data), mime: f.mime } : null;
  }
  const file = path.resolve(/*turbopackIgnore: true*/ UPLOAD_DIR, rel);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return null;
  try {
    return { data: await readFile(file), mime };
  } catch {
    return null;
  }
}

export async function saveImage(file: File, folder = "products") {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Поддерживаются JPG, PNG, WEBP, AVIF");
  if (file.size > MAX_IMAGE) throw new Error("Файл больше 15 МБ");
  const buf = Buffer.from(await file.arrayBuffer());
  const out = await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  return put(folder, `${randomUUID()}.webp`, out);
}

export async function saveLogo(file: File) {
  if (file.type === "image/svg+xml") {
    if (file.size > 512 * 1024) throw new Error("SVG больше 512 КБ");
    const text = await file.text();
    if (/<script|on\w+=|javascript:/i.test(text)) throw new Error("SVG содержит недопустимый код");
    return put("brand", `${randomUUID()}.svg`, Buffer.from(text));
  }
  return saveImage(file, "brand");
}

export async function saveModel(file: File) {
  if (!/\.(glb|gltf)$/i.test(file.name)) throw new Error("Поддерживаются только .glb / .gltf");
  if (file.size > MAX_MODEL) throw new Error("3D-модель больше 40 МБ");
  const ext = file.name.toLowerCase().endsWith(".gltf") ? "gltf" : "glb";
  return put("models", `${randomUUID()}.${ext}`, Buffer.from(await file.arrayBuffer()));
}

export async function removeFile(url: string | null | undefined) {
  if (!url || !url.startsWith("/media/")) return;
  const rel = url.slice("/media/".length);
  if (DRIVER === "db") {
    await prisma.storedFile.deleteMany({ where: { path: rel } });
    return;
  }
  const target = path.resolve(/*turbopackIgnore: true*/ UPLOAD_DIR, rel);
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
  await unlink(target).catch(() => {});
}
