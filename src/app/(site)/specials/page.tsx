import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { ProductCard } from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

export default async function SpecialsPage() {
  const products = await prisma.product.findMany({
    where: { isSpecial: true },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500/90">Deals</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Specials</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Products marked as specials in the catalogue — same gear, sharper pricing where
        listed.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={serializeProduct(p)} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-10 text-sm text-zinc-500">
          No specials at the moment.{" "}
          <Link href="/shop" className="text-amber-400 hover:underline">
            Browse the full shop
          </Link>{" "}
          or check back soon.
        </p>
      )}
    </div>
  );
}
