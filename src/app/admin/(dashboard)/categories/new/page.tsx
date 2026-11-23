import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">New category</h1>
          <p className="mt-1 text-sm text-zinc-500">Shown on the homepage and categories page.</p>
        </div>
        <Link
          href="/admin/categories"
          className="text-sm font-semibold text-zinc-400 hover:text-amber-400"
        >
          ← Back to list
        </Link>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
