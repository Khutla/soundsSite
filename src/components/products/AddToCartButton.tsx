"use client";

import { useState } from "react";
import type { ProductJson } from "@/lib/serialize";
import { useCart } from "@/components/cart/CartProvider";

export function AddToCartButton({ product }: { product: ProductJson }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onSpecial = product.isSpecial && product.specialPrice != null;
  const price = onSpecial ? product.specialPrice! : product.price;

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          slug: product.slug,
          name: product.name,
          price,
          imageUrl: product.imageUrl,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2000);
      }}
      className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/20 transition hover:bg-amber-400 disabled:opacity-70"
      disabled={added}
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
