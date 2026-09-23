import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageTitle } from "@/components/admin/AdminField";
import { PasswordForm, SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Настройки сайта" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <PageTitle title="Настройки сайта" subtitle="Контакты, адрес, тексты блоков и SEO. После сохранения изменения сразу видны на сайте." />
      <SettingsForm settings={settings} />
      <div className="mt-10">
        <PasswordForm />
      </div>
    </>
  );
}
