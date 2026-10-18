"use client";

import Image from "next/image";
import { useState } from "react";
import { ensureBrowserCsrfToken, withCsrfHeader } from "@/lib/csrf";

type Props = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  error?: string | null;
};

export function ImageUploadField({ label, value, onChange, error }: Props) {
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLocalErr(null);
    setBusy(true);
    try {
      const csrfToken = await ensureBrowserCsrfToken();
      const fd = new FormData();
      fd.set("file", file);
      if (csrfToken) fd.set("csrfToken", csrfToken);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: withCsrfHeader(undefined, csrfToken ?? undefined),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setLocalErr(typeof data.error === "string" ? data.error : "Upload failed");
        return;
      }
      if (typeof data.url === "string") onChange(data.url);
    } catch {
      setLocalErr("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const err = error ?? localErr;

  return (
    <div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          {value ? (
            <Image src={value} alt="" fill className="object-cover" sizes="160px" unoptimized/>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              No image
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
          <p className="text-[11px] text-zinc-600">JPG, PNG, WebP or GIF · max 5MB</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs font-semibold text-red-400/90 hover:text-red-300"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      {busy && <p className="mt-2 text-xs text-amber-400/90">Uploading…</p>}
      {err && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
