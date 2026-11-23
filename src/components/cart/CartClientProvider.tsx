"use client";

import { CartProvider } from "./CartProvider";

export default function CartClientProvider({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
