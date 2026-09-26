import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { HeroVisual } from "@/components/site/hero/Hero3D";
import { HeroParticles } from "@/components/site/hero/HeroParticles";
import type { SiteSettings } from "@/lib/settings-defaults";

export function Hero({ s, total }: { s: SiteSettings; total: number }) {
  return (
    <section className="grain relative isolate flex min-h-[100svh] items-start overflow-hidden pb-24 pt-[4.5rem] sm:items-center sm:pb-16 sm:pt-24 lg:pt-28">
      {/* background */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_45%,#1e1b17_0%,#0e0e10_45%,#0a0a0b_75%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      {/* silver dust in a beam of light — behind text, buttons and the wheel */}
      <HeroParticles />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 select-none whitespace-nowrap font-display font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(243,240,234,0.07)] bottom-[6%] left-1/2 -translate-x-1/2 text-[34vw] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:text-[22vw]"
      >
        LENDISK
      </div>

      <div className="container-x grid items-center gap-2 sm:gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="hero-in mb-4 flex items-center gap-3 sm:mb-7 sm:gap-4" style={{ ["--d" as string]: "0ms" }}>
            <LogoMark className="size-9 shrink-0 sm:size-14" logoUrl={s.logoUrl} />
            <div className="h-7 w-px shrink-0 bg-white/15 sm:h-10" />
            <p className="eyebrow whitespace-nowrap !text-[0.62rem] !tracking-[0.14em] sm:!text-[0.72rem] sm:!tracking-[0.22em]">{s.heroEyebrow}</p>
          </div>

          <h1 className="hero-in" style={{ ["--d" as string]: "80ms" }}>
            <span className="text-chrome block font-display text-[clamp(2.2rem,13vw,7.6rem)] lg:text-[min(7.2vw,6.9rem)] font-bold uppercase leading-[0.9] tracking-[0.04em]">
              Lendisk
            </span>
            <span className="mt-3 block max-w-xl text-balance font-display text-[1.2rem] font-medium leading-[1.2] text-bone sm:mt-5 sm:text-[clamp(1.35rem,3.2vw,2.3rem)] sm:leading-[1.15]">
              {s.heroTitle}
            </span>
          </h1>

          <p className="hero-in mt-3 max-w-lg text-pretty text-[0.95rem] leading-relaxed text-bone/60 sm:mt-6 sm:text-lg" style={{ ["--d" as string]: "160ms" }}>
            {s.heroSubtitle}
          </p>

          <div className="hero-in mt-6 grid grid-cols-2 gap-2 sm:mt-9 sm:flex sm:gap-3" style={{ ["--d" as string]: "240ms" }}>
            <Link href="/catalog" className="btn btn-gold !h-12 !px-3 text-[0.85rem] sm:!h-[3.25rem] sm:!px-[1.6rem] sm:text-[0.95rem]">
              <span className="sm:hidden">Каталог</span><span className="hidden sm:inline">Смотреть каталог</span> <ArrowRight className="size-4" />
            </Link>
            <Link href="/#podbor" className="btn btn-ghost !h-12 !px-3 text-[0.85rem] sm:!h-[3.25rem] sm:!px-[1.6rem] sm:text-[0.95rem]">
              Подобрать диски
            </Link>
          </div>

          <dl className="hero-in mt-6 grid max-w-lg grid-cols-3 gap-3 border-t border-white/[0.08] pt-4 sm:mt-12 sm:gap-4 sm:pt-6" style={{ ["--d" as string]: "320ms" }}>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-bone/40">В наличии</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-lg font-semibold xs:text-xl sm:text-2xl">{total.toLocaleString("ru-RU")}+</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-bone/40">Диаметры</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-lg font-semibold xs:text-xl sm:text-2xl">R13–R23</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-bone/40">Доставка</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-lg font-semibold xs:text-xl sm:text-2xl">1 день</dd>
            </div>
          </dl>
        </div>

        <div className="hero-wheel-in order-1 mx-auto min-w-0 w-[62%] max-w-[250px] sm:w-[88%] sm:max-w-[460px] lg:order-2 lg:w-full lg:max-w-none">
          <HeroVisual />
        </div>
      </div>

      <a href="#advantages" aria-label="Листать вниз" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-bone/40 transition hover:text-gold lg:flex">
        Scroll <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
