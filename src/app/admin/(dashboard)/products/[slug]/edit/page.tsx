import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeCategory, serializeProduct } from "@/lib/serialize";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  const productRow = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!productRow) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const product = serializeProduct(productRow);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit product</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{product.slug}</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-zinc-400 hover:text-amber-400"
        >
          ← Back to list
        </Link>
      </div>
      <ProductForm
        mode="edit"
        initial={product}
        categories={categories.map(serializeCategory)}
      />
    </div>
  );
}
