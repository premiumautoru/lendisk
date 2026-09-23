import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, diameters] = await Promise.all([
    prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.groupBy({ by: ["diameter"], where: { published: true } }),
  ]);
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...diameters.map((d) => ({ url: `${SITE_URL}/catalog?d=${d.diameter}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/catalog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];
}
