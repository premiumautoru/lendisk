import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Gallery } from "@/components/gallery/Gallery";
import { GALLERY, GALLERY_LICENSE } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Галерея — автомобили и диски",
  description: "Галерея Lendisk: как цвет, рисунок спиц и посадка дисков меняют облик автомобиля. Подберём диски под ваш автомобиль в Москве и Московской области.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="pb-28 pt-28 lg:pt-36">
      <div className="container-x">
        <nav className="mb-6 text-xs text-bone/40" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-bone">Главная</Link> <span className="mx-2">/</span> <span className="text-bone/70">Галерея</span>
        </nav>
        <header className="mb-16 flex flex-col gap-8 lg:mb-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(2rem,6vw,4.4rem)] font-bold uppercase leading-[0.95]">Галерея</h1>
            <p className="mt-6 text-pretty leading-relaxed text-bone/50">Цвет, рисунок спиц и посадка — то, что меняет облик автомобиля. Нажмите на фото, чтобы открыть его на весь экран.</p>
          </div>
          <Link href="/catalog" className="group inline-flex items-center gap-2 self-start text-sm text-bone/60 transition hover:text-bone lg:self-auto">
            Смотреть каталог <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </header>

        <Gallery photos={GALLERY} layout="page" />

        <section className="mt-28 border-t border-white/[0.06] pt-10 text-sm" aria-labelledby="credits">
          <h2 id="credits" className="text-xs uppercase tracking-[0.3em] text-bone/40">Источники фотографий</h2>
          <p className="mt-4 max-w-2xl text-bone/45">
            Фото с Unsplash по лицензии{" "}
            <a href={GALLERY_LICENSE.url} target="_blank" rel="noopener" className="text-bone/70 underline decoration-white/20 underline-offset-2 hover:text-bone">{GALLERY_LICENSE.name}</a>{" "}
            (коммерческое использование разрешено). Это иллюстрации, а не работы Lendisk; модели дисков не указываются.
          </p>
          <ol className="mt-6 grid gap-x-10 gap-y-2 text-bone/45 sm:grid-cols-2">
            {GALLERY.map((p, i) => (
              <li key={p.file} className="flex gap-4">
                <span className="w-6 shrink-0 tabular-nums text-bone/25">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {p.title} — <a href={p.authorUrl} target="_blank" rel="noopener" className="hover:text-bone">{p.author}</a>,{" "}
                  <a href={p.source} target="_blank" rel="noopener" className="underline decoration-white/20 underline-offset-2 hover:text-bone">Unsplash</a>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
