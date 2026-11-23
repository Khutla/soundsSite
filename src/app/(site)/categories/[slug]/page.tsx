import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { ProductCard } from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: { include: { category: true }, orderBy: { name: "asc" } },
    },
  });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/categories" className="hover:text-amber-400">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-400">{category.name}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">{category.name}</h1>
      {category.description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">{category.description}</p>
      ) : null}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {category.products.map((p) => (
          <ProductCard key={p.id} product={serializeProduct(p)} />
        ))}
      </div>

      {category.products.length === 0 && (
        <p className="mt-10 text-sm text-zinc-500">No products in this category yet.</p>
      )}
    </div>
  );
}
