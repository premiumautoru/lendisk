import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageTitle } from "@/components/admin/AdminField";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Новый товар" };

export default async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-2 text-sm text-bone/55 hover:text-bone">
        <ArrowLeft className="size-4" /> Все товары
      </Link>
      <PageTitle title="Новый диск" subtitle="Заполните поля со звёздочкой. Фото и 3D-модель можно добавить сразу или позже." />
      <ProductForm />
    </>
  );
}
