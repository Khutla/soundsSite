import type { Category, Product, SecondHandProduct } from "@prisma/client";

export type ProductSearchProduct = Product & { category?: Category | null };
export type MarketplaceSearchProduct = Omit<SecondHandProduct, "category"> & {
  category?: { name: string; slug: string };
  name: string;
  imageUrl: string | null;
};

export type SearchableProduct = ProductSearchProduct | MarketplaceSearchProduct;
