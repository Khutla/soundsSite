"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CategoryJson, ProductJson } from "@/lib/serialize";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Mode = "create" | "edit";

export function ProductForm({
  mode,
  categories,
  initial,
  presetSpecial = false,
}: {
  mode: Mode;
  categories: CategoryJson[];
  initial?: ProductJson;
  /** When creating, pre-check “Mark as special” (e.g. from dashboard or /admin/products/new?special=1) */
  presetSpecial?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [specialPrice, setSpecialPrice] = useState(
    initial?.specialPrice != null ? String(initial.specialPrice) : ""
  );
  const [isSpecial, setIsSpecial] = useState(
    mode === "edit" ? Boolean(initial?.isSpecial) : Boolean(presetSpecial)
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const autoSlugHint = useMemo(() => {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return base;
  }, [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name,
        description,
        categoryId,
        price: Number(price),
        specialPrice: specialPrice === "" ? null : Number(specialPrice),
        isSpecial,
        featured,
        imageUrl,
      };
      if (slug.trim()) payload.slug = slug.trim();

      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!initial) return;
        res = await fetch(`/api/products/${encodeURIComponent(initial.slug)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Save failed");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium text-zinc-400">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          URL slug{" "}
          <span className="font-normal text-zinc-600">(optional — auto from name)</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={!slugTouched ? autoSlugHint || "product-slug" : undefined}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
      </div>

      <label className="block text-xs font-medium text-zinc-400">
        Description
        <textarea
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium text-zinc-400">
          Category
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Price (ZAR)
          <input
            required
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium text-zinc-400">
          Special price (optional)
          <input
            type="number"
            min={0}
            step={1}
            value={specialPrice}
            onChange={(e) => setSpecialPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-amber-500"
            />
            Mark as special
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 text-amber-500"
            />
            Featured on home
          </label>
        </div>
      </div>

      <ImageUploadField label="Product image" value={imageUrl} onChange={setImageUrl} />

      {err && (
        <p className="text-sm text-red-400" role="alert">
          {err}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || !categoryId}
          className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
