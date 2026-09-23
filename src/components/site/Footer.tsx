import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { MaxIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { Contacts } from "./contacts";

export function Footer({ contacts }: { contacts: Contacts }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-ink pb-28 pt-20 md:pb-10">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4" aria-label="Lendisk">
              <LogoMark className="size-14" logoUrl={contacts.logoUrl} />
              <span className="font-display text-2xl font-semibold uppercase tracking-[0.3em]">Lendisk</span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/50">
              Автомобильные диски в наличии в Москве и Московской области. Подбор по автомобилю, доставка в день заказа.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={contacts.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full border border-white/10 text-bone/70 transition hover:border-[#25D366] hover:text-[#25D366]">
                <WhatsAppIcon className="size-5" />
              </a>
              <a href={contacts.telegram} target="_blank" rel="noopener" aria-label="Telegram" className="grid size-11 place-items-center rounded-full border border-white/10 text-bone/70 transition hover:border-[#2AABEE] hover:text-[#2AABEE]">
                <TelegramIcon className="size-5" />
              </a>
              <a href={contacts.max} target="_blank" rel="noopener" aria-label="MAX" className="grid size-11 place-items-center rounded-full border border-white/10 text-bone/70 transition hover:border-gold hover:text-gold">
                <MaxIcon className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">Магазин</p>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link className="hover:text-gold" href="/catalog">Каталог дисков</Link></li>
              <li><Link className="hover:text-gold" href="/catalog?sort=new">Новые поступления</Link></li>
              <li><Link className="hover:text-gold" href="/#podbor">Подбор по автомобилю</Link></li>
              <li><Link className="hover:text-gold" href="/catalog?d=20,21,22">Диски R20–R22</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Покупателям</p>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link className="hover:text-gold" href="/#delivery">Доставка</Link></li>
              <li><Link className="hover:text-gold" href="/#faq">Вопросы и ответы</Link></li>
              <li><Link className="hover:text-gold" href="/#reviews">Отзывы</Link></li>
              <li><Link className="hover:text-gold" href="/privacy">Политика конфиденциальности</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">Контакты</p>
            <ul className="space-y-4 text-sm text-bone/70">
              <li>
                <a href={contacts.phoneHref} className="flex items-center gap-3 font-display text-lg text-bone hover:text-gold">
                  <Phone className="size-4 text-gold" /> {contacts.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{contacts.address}<br />{contacts.city}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" /> {contacts.workHours}
              </li>
            </ul>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-16 select-none text-center font-display text-[18vw] font-bold leading-none tracking-[0.04em] text-white/[0.035] lg:text-[13rem]">
          LENDISK
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-bone/40 sm:flex-row sm:justify-between">
          <p>© {year} Lendisk. Автомобильные диски в Москве и Московской области.</p>
          <p>Информация на сайте не является публичной офертой. Цены и наличие уточняйте у менеджера.</p>
        </div>
      </div>
    </footer>
  );
}
