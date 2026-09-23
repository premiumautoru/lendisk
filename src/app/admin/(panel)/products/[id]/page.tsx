import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Box, ExternalLink, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteProduct } from "@/app/actions/admin";
import { Card, PageTitle } from "@/components/admin/AdminField";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { SubmitButton } from "@/components/admin/ui";

export const metadata = { title: "Редактирование товара" };

export default async function EditProduct(props: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sort: "asc" } }, _count: { select: { leads: true } } } });
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-2 text-sm text-bone/55 hover:text-bone">
        <ArrowLeft className="size-4" /> Все товары
      </Link>
      <PageTitle
        title={`${product.name} R${product.diameter}`}
        subtitle={`Артикул ${product.sku} · заявок по товару: ${product._count.leads}`}
        actions={
          <a href={`/catalog/${product.slug}`} target="_blank" className="btn btn-ghost !h-11 text-sm">
            <ExternalLink className="size-4" /> Открыть на сайте
          </a>
        }
      />
      {sp.created && <p className="mb-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Товар создан и уже опубликован на сайте.</p>}

      <div className="space-y-6">
        <ImageManager images={product.images} />
        {product.model3dUrl && (
          <Card title="3D-модель">
            <p className="flex items-center gap-2 text-sm text-bone/70">
              <Box className="size-4 text-gold" /> Загружена:{" "}
              <a href={product.model3dUrl} className="font-mono text-xs text-gold hover:underline" target="_blank">
                {product.model3dUrl.split("/").pop()}
              </a>
            </p>
          </Card>
        )}
        <ProductForm product={product} />

        <Card title="Удаление">
          <form action={deleteProduct.bind(null, product.id)} className="flex flex-wrap items-center gap-4">
            <SubmitButton variant="danger" confirm="Удалить товар вместе с фотографиями? Это действие нельзя отменить." pendingText="Удаление…">
              <Trash2 className="size-4" /> Удалить товар
            </SubmitButton>
            <p className="text-xs text-bone/40">Если товар временно закончился — лучше выключите «В наличии» или «Показывать на сайте».</p>
          </form>
        </Card>
      </div>
    </>
  );
}
