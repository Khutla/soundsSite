import type { Category, Product } from "@prisma/client";

export type ProductJson = Omit<Product, "price" | "specialPrice"> & {
  price: number;
  specialPrice: number | null;
  category?: CategoryJson;
};

export type CategoryJson = Omit<Category, never>;

export function serializeProduct(
  p: Product & { category?: Category }
): ProductJson {
  return {
    ...p,
    price: Number(p.price),
    specialPrice: p.specialPrice != null ? Number(p.specialPrice) : null,
    category: p.category ? serializeCategory(p.category) : undefined,
  };
}

export function serializeCategory(c: Category): CategoryJson {
  return { ...c };
}
