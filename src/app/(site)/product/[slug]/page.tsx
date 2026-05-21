import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { formatZar } from "@/lib/format";
import { AddToCartButton } from "@/components/products/AddToCartButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!row) notFound();

  const product = serializeProduct(row);
  const onSpecial = product.isSpecial && product.specialPrice != null;
  const displayPrice = onSpecial ? product.specialPrice! : product.price;
  const wasPrice = onSpecial ? product.price : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/shop" className="hover:text-amber-400">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${product.category?.slug}`} className="hover:text-amber-400">
          {product.category?.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-400">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
              <span className="text-8xl text-zinc-700">♪</span>
            </div>
          )}
          {onSpecial && (
            <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-950">
              On special
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
            {product.category?.name}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-400">{formatZar(displayPrice)}</span>
            {wasPrice != null && (
              <span className="text-lg text-zinc-500 line-through">{formatZar(wasPrice)}</span>
            )}
          </div>
          <p className="mt-8 max-w-none whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {product.description}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-amber-500/40"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
