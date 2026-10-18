"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ensureBrowserCsrfToken, withCsrfHeader } from "@/lib/csrf";

export function DeleteProductButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const csrfToken = await ensureBrowserCsrfToken();
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: withCsrfHeader(undefined, csrfToken ?? undefined),
      });
      if (!res.ok) {
        alert("Could not delete product.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="text-xs font-semibold uppercase tracking-wide text-red-400/90 hover:text-red-300 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
