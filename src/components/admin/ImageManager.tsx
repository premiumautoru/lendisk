import Image from "next/image";
import { ArrowLeft, ArrowRight, RotateCw, Trash2 } from "lucide-react";
import type { ProductImage } from "@prisma/client";
import { deleteImage, moveImage, toggleImageSpin } from "@/app/actions/admin";
import { thumb } from "@/lib/format";
import { Card } from "./AdminField";

/** Current photos of a product: reorder, mark as 360° frame, delete. First photo is the cover. */
export function ImageManager({ images }: { images: ProductImage[] }) {
  return (
    <Card title={`Фотографии (${images.length})`}>
      {images.length === 0 ? (
        <p className="text-sm text-bone/45">Фото нет — на сайте показывается фирменная заглушка. Загрузите фото в форме ниже.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-white/10">
              <div className="relative aspect-square bg-paper">
                <Image src={thumb(img.url)} alt="" fill sizes="160px" className="object-cover mix-blend-multiply" />
                {i === 0 && !img.spin && <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-ink">Обложка</span>}
                {img.spin && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-bold text-gold">360°</span>}
              </div>
              <div className="flex justify-between bg-ink p-1">
                <form action={moveImage.bind(null, img.id, -1)}>
                  <button className="grid size-8 place-items-center rounded-lg text-bone/60 hover:bg-white/5 hover:text-bone" aria-label="Левее"><ArrowLeft className="size-4" /></button>
                </form>
                <form action={toggleImageSpin.bind(null, img.id)}>
                  <button className="grid size-8 place-items-center rounded-lg text-bone/60 hover:bg-white/5 hover:text-gold" aria-label="Отметить как кадр 360°" title="Кадр 360°"><RotateCw className="size-4" /></button>
                </form>
                <form action={deleteImage.bind(null, img.id)}>
                  <button className="grid size-8 place-items-center rounded-lg text-bone/60 hover:bg-red-500/10 hover:text-red-300" aria-label="Удалить фото"><Trash2 className="size-4" /></button>
                </form>
                <form action={moveImage.bind(null, img.id, 1)}>
                  <button className="grid size-8 place-items-center rounded-lg text-bone/60 hover:bg-white/5 hover:text-bone" aria-label="Правее"><ArrowRight className="size-4" /></button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
