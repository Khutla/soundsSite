import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serialize";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ special?: string }>;
};

export default async function NewProductPage({ searchParams }: Props) {
  const sp = await searchParams;
  const asSpecial =
    sp.special === "1" || sp.special === "true" || sp.special === "yes";

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {asSpecial ? "New special" : "New product"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {asSpecial
              ? "Creates a product marked as a special — set list and promo prices below."
              : "Creates a slug automatically from the name."}
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-zinc-400 hover:text-amber-400"
        >
          ← Back to list
        </Link>
      </div>
      <ProductForm
        mode="create"
        categories={categories.map(serializeCategory)}
        presetSpecial={asSpecial}
      />
    </div>
  );
}
