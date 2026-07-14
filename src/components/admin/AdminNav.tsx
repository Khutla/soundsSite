"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/specials", label: "Specials" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-950 lg:w-56 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4 lg:block">
        <Link href="/" className="block">
          <div className="relative h-30 w-30">
            <Image
              src="/MkH.png"
              alt="MkhSounds Logo"
              fill
              className="object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
              priority
              sizes="120px"
            />
          </div>
        </Link>
        <div className="min-w-0 flex-1 lg:mt-3">
          <p className="truncate text-sm font-semibold text-white">MkhSounds</p>
          <p className="truncate text-xs text-zinc-500" title={email}>
            {email}
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-wrap gap-1 p-3 lg:flex-col">
        {items.map((i) => {
          const active =
            i.href === "/admin"
              ? pathname === "/admin"
              : pathname === i.href || pathname.startsWith(`${i.href}/`);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-amber-500/15 text-amber-200"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-lg border border-zinc-800 px-3 py-2 text-left text-sm text-zinc-400 hover:border-zinc-700 hover:text-white"
        >
          Sign out
        </button>
        <Link href="/" className="mt-2 block text-center text-xs text-zinc-600 hover:text-amber-400">
          View storefront
        </Link>
      </div>
    </aside>
  );
}
