"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { saveSettings, type FormState } from "@/app/actions/admin";
import { changePassword, type AuthState } from "@/app/actions/auth";
import { SETTINGS_GROUPS, type SiteSettings } from "@/lib/settings-defaults";
import { LogoMark } from "@/components/brand/Logo";
import { AdminField, Card } from "./AdminField";
import { SubmitButton, Toggle } from "./ui";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveSettings, {});
  const [logoName, setLogoName] = useState("");
  return (
    <form action={action} className="space-y-6">
      <Card title="Логотип">
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid size-24 place-items-center rounded-2xl bg-ink ring-1 ring-white/10">
            <LogoMark className="size-16" logoUrl={settings.logoUrl} />
          </div>
          <div className="space-y-3">
            <label className="btn btn-ghost !h-11 cursor-pointer text-sm">
              <Upload className="size-4" /> {logoName || "Загрузить новый логотип"}
              <input type="file" name="logo" accept="image/svg+xml,image/png,image/webp,image/jpeg" className="sr-only" onChange={(e) => setLogoName(e.target.files?.[0]?.name || "")} />
            </label>
            <p className="text-xs text-bone/40">SVG или PNG с прозрачным фоном. Показывается в шапке, на главном экране, в меню и футере.</p>
            <div className="max-w-xs">
              <Toggle name="resetLogo" label="Вернуть официальный логотип Lendisk" />
            </div>
          </div>
        </div>
      </Card>

      {SETTINGS_GROUPS.map((g) => (
        <Card key={g.title} title={g.title}>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <AdminField key={f.key} label={f.label} hint={f.hint} className={f.long ? "sm:col-span-2" : undefined}>
                {f.long ? (
                  <textarea name={f.key} defaultValue={settings[f.key]} rows={3} className="field !h-auto py-3" />
                ) : (
                  <input name={f.key} defaultValue={settings[f.key]} className="field" />
                )}
              </AdminField>
            ))}
          </div>
        </Card>
      ))}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink/90 p-3 backdrop-blur">
        <SubmitButton className="min-w-40">Сохранить настройки</SubmitButton>
        {state.error && <p className="text-sm text-red-300">{state.error}</p>}
        {state.ok && <p className="flex items-center gap-1.5 text-sm text-emerald-300"><CheckCircle2 className="size-4" /> {state.message}</p>}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(changePassword, {});
  return (
    <Card title="Смена пароля администратора">
      <form action={action} className="grid gap-4 sm:grid-cols-3">
        <AdminField label="Текущий пароль">
          <input type="password" name="current" required autoComplete="current-password" className="field" />
        </AdminField>
        <AdminField label="Новый пароль" hint="Минимум 10 символов">
          <input type="password" name="next" required minLength={10} autoComplete="new-password" className="field" />
        </AdminField>
        <AdminField label="Повторите новый пароль">
          <input type="password" name="repeat" required minLength={10} autoComplete="new-password" className="field" />
        </AdminField>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <SubmitButton variant="ghost">Изменить пароль</SubmitButton>
          {state.error && <p className="text-sm text-red-300">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-300">Пароль изменён</p>}
        </div>
      </form>
    </Card>
  );
}
