import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage catalogue items and promotions.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Add product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Flags</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => {
              const onSale = p.isSpecial && p.specialPrice != null;
              const display = onSale ? Number(p.specialPrice) : Number(p.price);
              return (
                <tr key={p.id} className="bg-zinc-950/40 hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-zinc-900">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="64px" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          ♪
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.category.name}</td>
                  <td className="px-4 py-3 text-zinc-200">{formatZar(display)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          Featured
                        </span>
                      )}
                      {p.isSpecial && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          Special
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${encodeURIComponent(p.slug)}/edit`}
                      className="mr-3 text-xs font-semibold uppercase tracking-wide text-amber-400 hover:text-amber-300"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton slug={p.slug} name={p.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No products yet. Create one to get started.</p>
      )}
    </div>
  );
}
