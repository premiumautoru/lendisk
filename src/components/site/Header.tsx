"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BrandLockup } from "@/components/brand/Logo";
import { MaxIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { Contacts } from "./contacts";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/#podbor", label: "Подбор" },
  { href: "/#delivery", label: "Доставка" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#faq", label: "Вопросы" },
  { href: "/#contacts", label: "Контакты" },
];

export function Header({ contacts }: { contacts: Contacts }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open ? "border-b border-white/[0.06] bg-ink/80 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link href="/" aria-label="Lendisk — на главную" className="shrink-0">
            <BrandLockup logoUrl={contacts.logoUrl} size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Основное меню">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  "relative text-sm font-medium text-bone/70 transition-colors hover:text-bone",
                  "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 hover:after:scale-x-100",
                  pathname === n.href && "text-bone after:scale-x-100",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={contacts.phoneHref} className="hidden text-sm font-semibold tracking-wide text-bone xl:block">
              {contacts.phone}
            </a>
            <a href={contacts.whatsapp} target="_blank" rel="noopener" aria-label="Написать в WhatsApp" className="hidden size-10 place-items-center rounded-full border border-white/10 text-bone/80 transition hover:border-[#25D366] hover:text-[#25D366] sm:grid">
              <WhatsAppIcon className="size-[18px]" />
            </a>
            <a href={contacts.phoneHref} className="btn btn-gold !h-10 !px-4 text-sm" aria-label={`Позвонить ${contacts.phone}`}>
              <Phone className="size-4" />
              <span className="hidden sm:inline">Позвонить</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full border border-white/10 text-bone lg:hidden"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ink transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="container-x flex h-full flex-col pb-10 pt-24">
          <nav className="flex flex-col" aria-label="Мобильное меню">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                className={clsx(
                  "border-b border-white/[0.06] py-4 font-display text-2xl font-medium transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-5">
            <a href={contacts.phoneHref} className="block font-display text-2xl">
              {contacts.phone}
            </a>
            <div className="grid grid-cols-3 gap-2">
              <a href={contacts.whatsapp} target="_blank" rel="noopener" className="btn btn-ghost !h-12 !px-2 text-sm">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
              <a href={contacts.telegram} target="_blank" rel="noopener" className="btn btn-ghost !h-12 !px-2 text-sm">
                <TelegramIcon className="size-4" /> Telegram
              </a>
              <a href={contacts.max} target="_blank" rel="noopener" className="btn btn-ghost !h-12 !px-2 text-sm">
                <MaxIcon className="size-4" /> MAX
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-bone/50">
              <BrandLockup logoUrl={contacts.logoUrl} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
