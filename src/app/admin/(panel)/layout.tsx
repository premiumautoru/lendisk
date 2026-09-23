import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const [newLeads, s] = await Promise.all([prisma.lead.count({ where: { status: "NEW" } }), getSettings()]);
  return (
    <>
      <AdminNav newLeads={newLeads} login={admin.login} logoUrl={s.logoUrl} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
    </>
  );
}
