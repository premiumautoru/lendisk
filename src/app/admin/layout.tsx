import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Админ-панель", template: "%s · Админ Lendisk" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-[#0d0d0f] text-bone">{children}</div>;
}
