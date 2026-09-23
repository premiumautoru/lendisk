"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Box, CheckCircle2, ImagePlus } from "lucide-react";
import type { Product } from "@prisma/client";
import { saveProduct, type FormState } from "@/app/actions/admin";
import { AdminField, Card } from "./AdminField";
import { SubmitButton, Toggle } from "./ui";

export function ProductForm({ product }: { product?: Product }) {
  const save = useMemo(() => saveProduct.bind(null, product?.id ?? null), [product?.id]);
  const [state, action] = useActionState<FormState, FormData>(save, {});
  const [files, setFiles] = useState<string[]>([]);
  const [modelName, setModelName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // after a successful save clear chosen files so they are not uploaded twice
  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((i) => (i.value = ""));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiles([]);
    setModelName("");
  }, [state]);
  const p = product;

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <Card title="Основное">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Название *" hint="Например: TS-5611 BMF">
            <input name="name" defaultValue={p?.name} required className="field" />
          </AdminField>
          <AdminField label="Бренд / серия *">
            <input name="brand" defaultValue={p?.brand} required className="field" />
          </AdminField>
          <AdminField label="Артикул (SKU) *">
            <input name="sku" defaultValue={p?.sku} required className="field" />
          </AdminField>
          <AdminField label="Модель" hint="Используется для «похожих товаров»">
            <input name="model" defaultValue={p?.model} className="field" />
          </AdminField>
        </div>
      </Card>

      <Card title="Цена и наличие">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminField label="Цена за 1 диск, ₽ *">
            <input name="price" defaultValue={p?.price ?? 10000} inputMode="numeric" required className="field font-display text-lg" />
          </AdminField>
          <AdminField label="Старая цена, ₽" hint="Если указана — будет зачёркнута">
            <input name="oldPrice" defaultValue={p?.oldPrice ?? ""} inputMode="numeric" className="field" />
          </AdminField>
          <AdminField label="Количество на складе, шт.">
            <input name="stockQty" defaultValue={p?.stockQty ?? 4} inputMode="numeric" className="field" />
          </AdminField>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle name="inStock" defaultChecked={p ? p.inStock : true} label="В наличии" hint="Показывать бейдж «В наличии»" />
          <Toggle name="published" defaultChecked={p ? p.published : true} label="Показывать на сайте" hint="Выключите, чтобы скрыть товар" />
          <Toggle name="isPopular" defaultChecked={p?.isPopular} label="Популярный" hint="Блок «Популярные диски» на главной" />
          <Toggle name="isNew" defaultChecked={p?.isNew} label="Новое поступление" hint="Блок «Новые поступления» и бейдж NEW" />
        </div>
      </Card>

      <Card title="Характеристики">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminField label="Диаметр, R *">
            <input name="diameter" defaultValue={p?.diameter ?? 18} inputMode="numeric" required className="field" />
          </AdminField>
          <AdminField label="Ширина, J *">
            <input name="width" defaultValue={p?.width ?? 8} inputMode="decimal" required className="field" />
          </AdminField>
          <AdminField label="Разболтовка (PCD) *" hint="Например 5×112">
            <input name="pcd" defaultValue={p?.pcd ?? "5×112"} required className="field" />
          </AdminField>
          <AdminField label="Вылет ET, мм *">
            <input name="et" defaultValue={p?.et ?? 35} inputMode="decimal" required className="field" />
          </AdminField>
          <AdminField label="DIA (центр. отверстие), мм *">
            <input name="dia" defaultValue={p?.dia ?? 66.6} inputMode="decimal" required className="field" />
          </AdminField>
          <AdminField label="Тип">
            <select name="type" defaultValue={p?.type ?? "Литой"} className="field">
              <option>Литой</option>
              <option>Кованый</option>
              <option>Flow Forming</option>
            </select>
          </AdminField>
          <AdminField label="Покрытие / цвет">
            <input name="finish" defaultValue={p?.finish} className="field" placeholder="Чёрный с полированной лицевой частью" />
          </AdminField>
          <AdminField label="Код покрытия">
            <input name="finishCode" defaultValue={p?.finishCode} className="field" placeholder="BMF" />
          </AdminField>
          <AdminField label="Ось (для разноширокого)">
            <select name="axle" defaultValue={p?.axle ?? ""} className="field">
              <option value="">—</option>
              <option value="передняя ось">Передняя ось</option>
              <option value="задняя ось">Задняя ось</option>
            </select>
          </AdminField>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <AdminField label="Совместимые марки" hint="Через запятую: BMW, Mercedes-Benz, Audi">
            <input name="compatibleMakes" defaultValue={p?.compatibleMakes} className="field" />
          </AdminField>
          <AdminField label="Склад (видно только в админке)">
            <input name="warehouse" defaultValue={p?.warehouse} className="field" />
          </AdminField>
        </div>
        <AdminField label="Описание" className="mt-4">
          <textarea name="description" defaultValue={p?.description} rows={4} className="field !h-auto py-3" />
        </AdminField>
        <AdminField label="Адрес страницы (slug)" hint="Оставьте пустым — сформируется автоматически" className="mt-4">
          <input name="slug" defaultValue={p?.slug} className="field font-mono text-sm" />
        </AdminField>
      </Card>

      <Card title="Добавить фотографии и 3D">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center transition hover:border-gold">
            <ImagePlus className="size-7 text-gold" strokeWidth={1.5} />
            <span className="text-sm font-medium">Загрузить фото</span>
            <span className="text-xs text-bone/45">JPG, PNG, WEBP · можно несколько файлов</span>
            <input type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => setFiles([...(e.target.files || [])].map((f) => f.name))} />
            {files.length > 0 && <span className="mt-1 text-xs text-emerald-300">Выбрано: {files.length}</span>}
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center transition hover:border-gold">
            <Box className="size-7 text-gold" strokeWidth={1.5} />
            <span className="text-sm font-medium">{p?.model3dUrl ? "Заменить 3D-модель" : "Загрузить 3D-модель"}</span>
            <span className="text-xs text-bone/45">GLB или GLTF, до 40 МБ</span>
            <input type="file" name="model3d" accept=".glb,.gltf,model/gltf-binary" className="sr-only" onChange={(e) => setModelName(e.target.files?.[0]?.name || "")} />
            {modelName && <span className="mt-1 text-xs text-emerald-300">{modelName}</span>}
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle name="photosSpin" label="Это кадры для 360°" hint="Серия из 8–72 снимков по кругу. Покупатель сможет вращать диск." />
          {p?.model3dUrl && <Toggle name="removeModel" label="Удалить текущую 3D-модель" />}
        </div>
      </Card>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink/90 p-3 backdrop-blur">
        <SubmitButton className="min-w-40">{p ? "Сохранить изменения" : "Создать товар"}</SubmitButton>
        {state.error && <p className="text-sm text-red-300" role="alert">{state.error}</p>}
        {state.ok && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 className="size-4" /> {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
