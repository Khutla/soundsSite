import type { Category, Product, SecondHandProduct } from "@prisma/client";

export type ProductSearchProduct = Product & { category?: Category | null };
export type MarketplaceSearchProduct = Omit<
  SecondHandProduct,
  "category" | "slug" | "sellerName" | "sellerPhone" | "location"
> & {
  category?: { name: string; slug: string };
  slug: string;
  sellerName: string | null;
  sellerPhone: string | null;
  location: string | null;
  name: string;
  imageUrl: string | null;
  sellerType: string;
};

export type SearchableProduct = ProductSearchProduct | MarketplaceSearchProduct;
