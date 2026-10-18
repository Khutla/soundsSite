import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProductBySlug } from "@/lib/products/query";
import { serializeProduct } from "@/lib/serialize";
import { formatZar } from "@/lib/format";
import { AddToCartButton } from "@/components/products/AddToCartButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function sanitizeSouthAfricanPhone(rawPhone: string): string | null {
  const digits = rawPhone.replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) {
    return `27${digits.slice(1)}`;
  }
  return digits;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const row = await findProductBySlug(slug);
  if (!row) notFound();

  const product = serializeProduct(row);
  const onSpecial = product.isSpecial && product.specialPrice != null;
  const displayPrice = onSpecial ? product.specialPrice! : product.price;
  const wasPrice = onSpecial ? product.price : null;
  const isMarketplace = product.source === "marketplace";
  const sellerName = product.sellerName ?? "Seller";
  const rawSellerPhone = product.sellerPhone ?? "";
  const sanitizedWhatsapp = sanitizeSouthAfricanPhone(rawSellerPhone);
  const whatsappUrl = sanitizedWhatsapp
    ? `https://wa.me/${sanitizedWhatsapp}?text=${encodeURIComponent(
        `Hi ${sellerName}, I saw your "${product.name}" listed under the 2nd Hand Equipment category on Mkh Sounds. Is it still available?`
      )}`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/shop" className="hover:text-amber-400">
          Shop
        </Link>
        <span className="mx-2">/</span>
        {isMarketplace ? (
          <span className="text-zinc-400">{product.category?.name}</span>
        ) : (
          <Link href={`/categories/${product.category?.slug}`} className="hover:text-amber-400">
            {product.category?.name}
          </Link>
        )}
        <span className="mx-2">/</span>
        <span className="text-zinc-400">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
              <span className="text-8xl text-zinc-700">♪</span>
            </div>
          )}
          {onSpecial && (
            <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-950">
              On special
            </span>
          )}
          {isMarketplace && (
            <span className="absolute left-4 top-4 rounded-full bg-sky-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-950">
              Second-hand
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
            {product.category?.name}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-400">{formatZar(displayPrice)}</span>
            {wasPrice != null && (
              <span className="text-lg text-zinc-500 line-through">{formatZar(wasPrice)}</span>
            )}
          </div>
          <p className="mt-8 max-w-none whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {product.description}
          </p>

          {isMarketplace ? (
            <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                Approved seller listing
              </p>
              <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-white">Condition</p>
                  <p>{product.condition}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p>{product.location}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-medium text-white">Seller</p>
                  <p>{product.sellerName}</p>
                  <p className="mt-1 text-xs text-zinc-500">WhatsApp: {product.sellerPhone}</p>
                </div>
              </div>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Contact Seller on WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            {!isMarketplace ? (
              <AddToCartButton product={product} />
            ) : null}
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-amber-500/40"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
