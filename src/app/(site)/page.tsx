import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { ProductCard } from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, specials, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isSpecial: true },
      include: { category: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const heroProducts = featured.length ? featured : specials;
  const hero = heroProducts[0] ?? null;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-amber-700/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
              Featured
            </p>
            <h1 className="mt-6 font-sans text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sound that
              <span className="block bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                travels with you
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
              Hand-picked speakers, amplifiers, and accessories for cleaner staging,
              tighter bass, and daily-driving comfort — the MkhSounds way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400"
              >
                Shop now
              </Link>
              <Link
                href="/specials"
                className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-200"
              >
                View specials
              </Link>
            </div>
          </div>

          <Link
            href={hero ? `/product/${hero.slug}` : "/shop"}
            className="group relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-black/60 lg:max-w-none lg:justify-self-end"
          >
            {hero?.imageUrl ? (
              <Image
                src={hero.imageUrl}
                alt={hero.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-800 to-black p-8 text-center">
                <span className="text-6xl text-amber-500/30">♪</span>
                <p className="text-sm text-zinc-500">
                  {hero
                    ? hero.name
                    : "Browse the shop for amplifiers, speakers, and more."}
                </p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {hero && (
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-300/90">
                    Promotion highlight
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{hero.name}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  Tap to view
                </span>
              </div>
            )}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Shop by category</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Explore curated ranges — from front-stage clarity to trunk-rattling low end.
            </p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
            All categories →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-amber-500/40"
            >
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                  {c.imageUrl ? (
                    <Image src={c.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-zinc-600">
                      ♪
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-100 transition group-hover:text-amber-200">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {c.description || "Browse products in this category."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-zinc-500">
              Categories will appear here once added in the admin panel.
            </p>
          )}
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Featured products</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Staff picks and install favourites — refreshed from your catalogue.
              </p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              Browse shop →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={serializeProduct(p)} />
            ))}
          </div>
          {featured.length === 0 && (
            <p className="mt-6 text-sm text-zinc-500">
              No featured products yet. Mark items as featured in{" "}
              <Link href="/admin" className="text-amber-400 hover:underline">
                Admin
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Specials & deals</h2>
            <p className="mt-1 text-sm text-zinc-400">Limited offers on selected lines.</p>
          </div>
          <Link href="/specials" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
            View all specials →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {specials.map((p) => (
            <ProductCard key={p.id} product={serializeProduct(p)} />
          ))}
        </div>
        {specials.length === 0 && (
          <p className="mt-6 text-sm text-zinc-500">
            No specials right now — toggle &ldquo;Special&rdquo; on a product in admin to highlight
            deals here.
          </p>
        )}
      </section>
    </div>
  );
}
