import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminSpecialsPage() {
  const products = await prisma.product.findMany({
    where: { isSpecial: true },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Specials</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Products marked as specials appear on the home page, /specials, and with badges in
            the shop.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new?special=1"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Add special
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-amber-500/50 hover:text-amber-200"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">List / Special</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => {
              const hasPromo = p.specialPrice != null;
              const promo = hasPromo ? Number(p.specialPrice) : null;
              const list = Number(p.price);
              return (
                <tr key={p.id} className="bg-zinc-950/40 hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-zinc-900">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          ♪
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.category.name}</td>
                  <td className="px-4 py-3 text-zinc-200">
                    <span className="text-zinc-500">{formatZar(list)}</span>
                    {promo != null && (
                      <>
                        {" "}
                        <span className="text-zinc-600">→</span>{" "}
                        <span className="font-semibold text-amber-400">{formatZar(promo)}</span>
                      </>
                    )}
                    {!hasPromo && (
                      <span className="ml-2 text-xs text-zinc-500">(no promo price)</span>
                    )}
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
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 text-center">
          <p className="text-sm text-zinc-400">No specials yet.</p>
          <Link
            href="/admin/products/new?special=1"
            className="mt-4 inline-flex rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Add your first special
          </Link>
        </div>
      )}
    </div>
  );
}
