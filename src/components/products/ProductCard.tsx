import Image from "next/image";
import Link from "next/link";
import type { ProductJson } from "@/lib/serialize";

function formatZar(n: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProductCard({ product }: { product: ProductJson }) {
  const onSpecial = product.isSpecial && product.specialPrice != null;
  const displayPrice = onSpecial ? product.specialPrice! : product.price;
  const wasPrice = onSpecial ? product.price : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm shadow-black/40 transition hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-900/10">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] bg-zinc-950">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
            <span className="text-4xl text-zinc-700">♪</span>
          </div>
        )}
        {onSpecial && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-950 shadow">
            Special
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">
          {product.category?.name ?? "Uncategorised"}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold leading-snug text-zinc-100 transition group-hover:text-amber-200">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-amber-400">{formatZar(displayPrice)}</span>
          {wasPrice != null && (
            <span className="text-sm text-zinc-500 line-through">{formatZar(wasPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
