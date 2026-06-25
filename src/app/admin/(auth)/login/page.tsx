"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) router.replace("/admin");
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/15 text-lg font-black text-amber-400">
          M
        </span>
        <h1 className="mt-4 text-xl font-bold text-white">MkhSounds Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">JWT-secured dashboard</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-xs font-medium text-zinc-400">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-amber-500/50 focus:ring-2"
          />
        </label>
        <p className="text-right">
          <Link href="/admin/reset-password" className="text-xs text-zinc-500 hover:text-amber-400">
            Reset password
          </Link>
        </p>
        {err && (
          <p className="text-sm text-red-400" role="alert">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-zinc-600">
        <Link href="/" className="text-zinc-500 hover:text-amber-400">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
