import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findProducts } from "@/lib/products/query";
import { serializeProduct } from "@/lib/serialize";
import { ProductCard } from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    min?: string;
    max?: string;
  }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const search = sp.q?.trim();
  const categorySlug = sp.category?.trim();
  const minRaw = sp.min;
  const maxRaw = sp.max;

  const minPrice =
    minRaw !== undefined && minRaw !== "" ? Number(minRaw) : undefined;
  const maxPrice =
    maxRaw !== undefined && maxRaw !== "" ? Number(maxRaw) : undefined;

  const [products, categories] = await Promise.all([
    findProducts({
      search,
      categorySlug,
      minPrice,
      maxPrice,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-white">Shop</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Filter by category and price range, or search by keywords — similar spellings still match.
        </p>
      </div>

      <form
        className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        method="get"
        action="/shop"
      >
        <label className="block text-xs font-medium text-zinc-400">
          Search
          <input
            name="q"
            defaultValue={search ?? ""}
            placeholder="Speakers, amps…"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Category
          <select
            name="category"
            defaultValue={categorySlug ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Min price (ZAR)
          <input
            name="min"
            type="number"
            min={0}
            step={100}
            defaultValue={minRaw ?? ""}
            placeholder="0"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Max price (ZAR)
          <input
            name="max"
            type="number"
            min={0}
            step={100}
            defaultValue={maxRaw ?? ""}
            placeholder="Any"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Apply filters
          </button>
          <Link
            href="/shop"
            className="rounded-full border border-zinc-600 px-5 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500"
          >
            Reset
          </Link>
        </div>
      </form>

      <p className="mt-6 text-sm text-zinc-500">
        Showing <span className="font-semibold text-zinc-300">{products.length}</span>{" "}
        product{products.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={serializeProduct(p)} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-center text-sm text-zinc-500">
          No products match your filters.{" "}
          <Link href="/shop" className="text-amber-400 hover:underline">
            Clear filters
          </Link>
        </p>
      )}
    </div>
  );
}
