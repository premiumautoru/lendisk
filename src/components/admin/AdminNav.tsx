"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, HelpCircle, Inbox, LayoutDashboard, LogOut, Package, Settings, Star } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { logout } from "@/app/actions/auth";

const ITEMS = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Заявки", icon: Inbox, badge: true },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/faq", label: "Вопросы (FAQ)", icon: HelpCircle },
  { href: "/admin/settings", label: "Настройки сайта", icon: Settings },
];

export function AdminNav({ newLeads, login, logoUrl }: { newLeads: number; login: string; logoUrl?: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/[0.07] bg-ink p-5 lg:flex">
        <Link href="/admin" className="mb-10 flex items-center gap-3 px-2">
          <LogoMark className="size-9" logoUrl={logoUrl} />
          <span>
            <span className="block font-display text-sm font-semibold uppercase tracking-[0.28em]">Lendisk</span>
            <span className="block text-xs text-bone/40">Админ-панель</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive(it.href, it.exact) ? "bg-gold/[0.12] text-gold-3" : "text-bone/65 hover:bg-white/[0.04] hover:text-bone",
              )}
            >
              <it.icon className="size-[18px]" strokeWidth={1.7} />
              {it.label}
              {it.badge && newLeads > 0 && <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[0.7rem] font-bold text-ink">{newLeads}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-white/[0.07] pt-4">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone/65 hover:text-bone">
            <ExternalLink className="size-[18px]" strokeWidth={1.7} /> Открыть сайт
          </a>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone/65 hover:text-red-300">
              <LogOut className="size-[18px]" strokeWidth={1.7} /> Выйти ({login})
            </button>
          </form>
        </div>
      </aside>

      {/* mobile top bar + tabs */}
      <div className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink/90 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <LogoMark className="size-7 shrink-0" logoUrl={logoUrl} />
            <span className="truncate font-display text-xs font-semibold uppercase tracking-[0.2em]">Lendisk</span>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.65rem] text-bone/55">админ</span>
          </Link>
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" className="grid size-9 place-items-center rounded-full text-bone/60" aria-label="Открыть сайт">
              <ExternalLink className="size-4" />
            </a>
            <form action={logout}>
              <button className="grid size-9 place-items-center rounded-full text-bone/60" aria-label="Выйти">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={clsx("flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm", isActive(it.href, it.exact) ? "bg-gold text-ink" : "bg-white/[0.04] text-bone/70")}
            >
              <it.icon className="size-4" strokeWidth={1.8} />
              {it.label}
              {it.badge && newLeads > 0 && <span className="rounded-full bg-ink/80 px-1.5 text-[0.7rem] font-bold text-gold">{newLeads}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
