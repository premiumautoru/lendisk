import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { SITE_URL } from "./site";

/**
 * IndexNow: tells Yandex and Bing right away that pages were added, changed or removed.
 * The key is derived from AUTH_SECRET (or set INDEXNOW_KEY) and published at /indexnow.txt.
 * Only runs on a real public https host.
 */
export function indexNowKey() {
  const seed = process.env.INDEXNOW_KEY || createHash("sha256").update(`indexnow:${process.env.AUTH_SECRET || "lendisk"}`).digest("hex");
  return seed.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
}

const ENDPOINTS = ["https://yandex.com/indexnow", "https://api.indexnow.org/indexnow"];

/** Queues a ping for the given site paths (e.g. "/catalog/slug"); never blocks or fails the admin action. */
export function pingIndexNow(paths: string[]) {
  const site = new URL(SITE_URL);
  if (site.protocol !== "https:" || site.hostname === "localhost" || !paths.length) return;
  const urlList = [...new Set(paths)].slice(0, 10000).map((p) => new URL(p, SITE_URL).toString());
  const body = JSON.stringify({ host: site.hostname, key: indexNowKey(), keyLocation: `${SITE_URL}/indexnow.txt`, urlList });
  after(async () => {
    await Promise.allSettled(
      ENDPOINTS.map((u) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body, signal: AbortSignal.timeout(10000) })),
    );
  });
}
