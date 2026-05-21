import Link from "next/link";
import { CartBadge } from "@/components/layout/CartBadge";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/specials", label: "Specials" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black via-zinc-950 to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
        <div className="relative h-30 w-36">
  <Image
    src="/MkH.png"
    alt="MkhSounds Logo"
    fill
    className="object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
    priority
  />
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide text-zinc-100">
            Feel the Sound
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500">
           Cape Town
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800/80 hover:text-amber-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartBadge />
        </div>
      </div>

      <nav className="flex border-t border-zinc-800/60 px-4 py-2 md:hidden">
        <div className="flex w-full flex-wrap justify-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-amber-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
