import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { InstallApp } from "@/components/pwa/Install";

export const metadata: Metadata = {
  title: "Приложение Lendisk",
  description: "Установите приложение Lendisk на телефон: каталог дисков, подбор по автомобилю и связь с магазином в одно касание.",
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return (
    <div className="container-x max-w-2xl pb-24 pt-32 lg:pt-40">
      <nav className="mb-6 text-xs text-bone/40" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-gold">Главная</Link> <span className="mx-2">/</span> <span className="text-bone/70">Приложение</span>
      </nav>
      <div className="flex items-center gap-5">
        <LogoMark className="size-20" />
        <div>
          <h1 className="font-display text-[clamp(1.6rem,5vw,2.6rem)] font-bold uppercase leading-none">Приложение Lendisk</h1>
          <p className="mt-2 text-bone/50">Для Android и iPhone · бесплатно</p>
        </div>
      </div>
      <p className="mt-8 leading-relaxed text-bone/65">
        Иконка Lendisk на экране телефона: каталог дисков, подбор по автомобилю и звонок или сообщение в магазин — в одно касание.
        Приложение открывается на весь экран и всегда показывает актуальные цены и наличие.
      </p>
      <div className="mt-10 rounded-[1.6rem] border border-white/[0.08] bg-graphite p-6 sm:p-8">
        <h2 className="mb-5 font-display text-sm uppercase tracking-[0.16em] text-gold">Как установить</h2>
        <InstallApp />
      </div>
    </div>
  );
}
