import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Used on the storefront and when assigning products.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Add category
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {categories.map((c) => (
              <tr key={c.id} className="bg-zinc-950/40 hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-16 overflow-hidden rounded-md bg-zinc-900">
                    {c.imageUrl ? (
                      <Image src={c.imageUrl} alt="" fill className="object-cover" sizes="64px" unoptimized/>
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        ♪
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-zinc-100">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{c.slug}</td>
                <td className="px-4 py-3 text-zinc-400">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/categories/${c.id}/edit`}
                    className="mr-3 text-xs font-semibold uppercase tracking-wide text-amber-400 hover:text-amber-300"
                  >
                    Edit
                  </Link>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No categories yet.</p>
      )}
    </div>
  );
}
