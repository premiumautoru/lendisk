import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { SETTINGS_DEFAULTS, type SiteSettings } from "./settings-defaults";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.setting.findMany();
  const out = { ...SETTINGS_DEFAULTS } as SiteSettings;
  for (const r of rows) if (r.key in out) out[r.key as keyof SiteSettings] = r.value;
  return out;
});
