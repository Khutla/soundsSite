"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CategoryJson } from "@/lib/serialize";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Mode = "create" | "edit";

export function CategoryForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: CategoryJson;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const autoSlugHint = useMemo(() => {
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }, [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name,
        description,
        imageUrl,
      };
      if (slug.trim()) payload.slug = slug.trim();

      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!initial) return;
        res = await fetch(`/api/categories/${encodeURIComponent(initial.id)}`, {
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
      router.push("/admin/categories");
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
          URL slug <span className="font-normal text-zinc-600">(optional)</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={!slugTouched ? autoSlugHint || "category-slug" : undefined}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
      </div>

      <label className="block text-xs font-medium text-zinc-400">
        Description
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
        />
      </label>

      <ImageUploadField label="Category image" value={imageUrl} onChange={setImageUrl} />

      {err && (
        <p className="text-sm text-red-400" role="alert">
          {err}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
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
