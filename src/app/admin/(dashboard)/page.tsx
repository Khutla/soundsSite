import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, specialCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({
  where: { isSpecial: true },
})
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Snapshot of your catalogue. Changes appear on the storefront immediately.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm shadow-amber-900/20 hover:bg-amber-400"
          >
            Add product
          </Link>
          <Link
            href="/admin/products/new?special=1"
            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:border-amber-400/60 hover:bg-amber-500/15"
          >
            Add special
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Products
          </p>
          <p className="mt-2 text-4xl font-bold text-white">{productCount}</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Categories
          </p>
          <p className="mt-2 text-4xl font-bold text-white">{categoryCount}</p>
          <Link
            href="/admin/categories"
            className="mt-4 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
    Specials
  </p>
  <p className="mt-2 text-4xl font-bold text-white">{specialCount}</p>
  <Link
    href="/admin/specials"
    className="mt-4 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
  >
    Manage →
  </Link>
</div>
      </div>
    </div>
  );
}
