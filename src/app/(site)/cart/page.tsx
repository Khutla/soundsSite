"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatZar } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, removeItem, clear, totalItems } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Cart</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Review your line items. Checkout and payments are not wired up yet — this is a
        demonstration basket only.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <p className="text-zinc-400">Your cart is empty.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            {items.map((i) => (
              <li key={i.slug} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
                  {i.imageUrl ? (
                    <Image src={product.image} alt={product.name} width={200} height={200} unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      ♪
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${i.slug}`}
                    className="font-semibold text-zinc-100 hover:text-amber-200"
                  >
                    {i.name}
                  </Link>
                  <p className="text-sm text-amber-400">{formatZar(i.price)} each</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  Qty
                  <input
                    type="number"
                    min={1}
                    className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100"
                    value={i.qty}
                    onChange={(e) => setQty(i.slug, Number(e.target.value))}
                  />
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-wide text-red-400/90 hover:text-red-300"
                  onClick={() => removeItem(i.slug)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Subtotal</p>
              <p className="text-2xl font-bold text-white">{formatZar(subtotal)}</p>
              <p className="text-xs text-zinc-500">
                {totalItems} line item{totalItems === 1 ? "" : "s"} · Excludes shipping
              </p>
            </div>
            <button
              type="button"
              onClick={() => clear()}
              className="rounded-full border border-zinc-600 px-5 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500"
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
