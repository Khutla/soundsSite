import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Browse by product family. Each category opens a filtered catalogue view.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-amber-500/40"
          >
            <div className="relative aspect-[16/9] bg-zinc-950">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  className="object-cover opacity-90 transition group-hover:opacity-100"
                  sizes="(max-width: 1024px) 100vw, 33vw" unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black text-5xl text-zinc-700">
                  ♪
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-white group-hover:text-amber-200">{c.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                {c.description || "Explore products in this category."}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-amber-500/80">
                {c._count.products} product{c._count.products === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="mt-10 text-sm text-zinc-500">
          No categories yet. Add them from the{" "}
          <Link href="/admin" className="text-amber-400 hover:underline">
            admin panel
          </Link>
          .
        </p>
      )}
    </div>
  );
}
