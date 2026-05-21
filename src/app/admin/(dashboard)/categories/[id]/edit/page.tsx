import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serialize";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) notFound();

  const category = serializeCategory(row);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit category</h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{category.slug}</p>
        </div>
        <Link
          href="/admin/categories"
          className="text-sm font-semibold text-zinc-400 hover:text-amber-400"
        >
          ← Back to list
        </Link>
      </div>
      <CategoryForm mode="edit" initial={category} />
    </div>
  );
}
