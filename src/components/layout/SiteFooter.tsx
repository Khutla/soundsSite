import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
          <div className="relative h-30 w-36">
  <Image
    src="/MkH.png"
    alt="MkhSounds Logo"
    fill
    className="object-contain drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
    priority
  />
          </div>
            <span className="text-lg font-semibold text-zinc-100">Feel the Sound</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
            Premium in-car sound for enthusiasts across South Africa. Quality gear,
            expert guidance, and installs that perform.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Shop
          </h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>
              <Link href="/shop" className="hover:text-amber-400">
                All products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-amber-400">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/specials" className="hover:text-amber-400">
                Specials
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Visit
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300">
            Western Cape, South Africa
            <br />
            <span className="text-zinc-500">Nationwide dispatch</span>
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Connect
          </h3>
          <p className="text-sm text-zinc-300">
            <a
              href="mailto:hello@mkhsounds.co.za"
              className="text-amber-400 hover:text-amber-300"
            >
              info@mkhsounds.co.za
            </a>
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            www.mkhsounds.co.za — App inspired by retailer layout patterns; branding
            and content are MkhSounds.
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} MkhSounds. All rights reserved.
      </div>
    </footer>
  );
}
