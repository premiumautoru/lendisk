import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Gallery } from "@/components/gallery/Gallery";
import { GALLERY, GALLERY_LICENSE } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Галерея — автомобили и диски",
  description: "Галерея Lendisk: как цвет, рисунок спиц и размер дисков меняют облик автомобиля. Подберём диски под ваш автомобиль в Москве и Московской области.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="pb-24 pt-28 lg:pt-36">
      <div className="container-x">
        <nav className="mb-6 text-xs text-bone/40" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-gold">Главная</Link> <span className="mx-2">/</span> <span className="text-bone/70">Галерея</span>
        </nav>
        <header className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Lendisk · вдохновение</p>
            <h1 className="font-display text-[clamp(2rem,6vw,4.4rem)] font-bold uppercase leading-[0.95]">Галерея</h1>
            <p className="mt-5 text-pretty leading-relaxed text-bone/55">
              Кадры, по которым легко понять, какой стиль вам ближе: золото на тёмном кузове, диски в цвет, сетка спиц или строгая классика.
              Нажмите на фото, чтобы открыть его на весь экран.
            </p>
          </div>
          <Link href="/catalog" className="btn btn-gold self-start lg:self-auto">
            Смотреть каталог <ArrowRight className="size-4" />
          </Link>
        </header>

        <Gallery photos={GALLERY} layout="editorial" />

        <section className="mt-16 rounded-[1.6rem] border border-white/[0.08] bg-graphite p-6 text-sm sm:p-8" aria-labelledby="credits">
          <h2 id="credits" className="font-display text-sm uppercase tracking-[0.16em] text-gold">Источники фотографий</h2>
          <p className="mt-3 max-w-3xl text-bone/55">
            Все фотографии взяты с Unsplash и используются по лицензии{" "}
            <a href={GALLERY_LICENSE.url} target="_blank" rel="noopener" className="text-bone underline decoration-white/20 underline-offset-2 hover:text-gold">{GALLERY_LICENSE.name}</a>{" "}
            (разрешено коммерческое использование). Это иллюстрации, а не работы Lendisk; модели дисков на фото не указываются.
          </p>
          <ol className="mt-5 grid gap-x-8 gap-y-2 text-bone/60 sm:grid-cols-2">
            {GALLERY.map((p, i) => (
              <li key={p.file} className="flex gap-3">
                <span className="w-6 shrink-0 tabular-nums text-bone/30">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  «{p.title}» — <a href={p.authorUrl} target="_blank" rel="noopener" className="hover:text-gold">{p.author}</a>,{" "}
                  <a href={p.source} target="_blank" rel="noopener" className="underline decoration-white/20 underline-offset-2 hover:text-gold">Unsplash</a>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
