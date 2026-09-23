import Link from "next/link";
import { Phone } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { Contacts } from "./contacts";

/** Sticky contact bar on phones: call / WhatsApp / Telegram / podbor. */
export function MobileContactBar({ contacts }: { contacts: Contacts }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-ink/85 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] gap-2">
        <a href={contacts.phoneHref} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.68rem] text-bone/80" aria-label="Позвонить">
          <Phone className="size-5 text-gold" /> Звонок
        </a>
        <a href={contacts.whatsapp} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.68rem] text-bone/80">
          <WhatsAppIcon className="size-5 text-[#25D366]" /> WhatsApp
        </a>
        <a href={contacts.telegram} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.68rem] text-bone/80">
          <TelegramIcon className="size-5 text-[#2AABEE]" /> Telegram
        </a>
        <Link href="/#podbor" className="btn btn-gold !h-full !rounded-xl !px-2 text-[0.8rem]">
          Подобрать
        </Link>
      </div>
    </div>
  );
}
