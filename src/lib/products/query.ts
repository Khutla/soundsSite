import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { fuzzyMatchProducts } from "@/lib/products/fuzzy-search";

export type ProductQueryOptions = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  specials?: boolean;
  search?: string;
  limit?: number;
};

export function buildProductWhere(
  options: Omit<ProductQueryOptions, "search" | "limit">
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (options.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  const { minPrice, maxPrice } = options;
  if (
    minPrice !== undefined &&
    !Number.isNaN(minPrice) &&
    maxPrice !== undefined &&
    !Number.isNaN(maxPrice)
  ) {
    where.price = { gte: minPrice, lte: maxPrice };
  } else if (minPrice !== undefined && !Number.isNaN(minPrice)) {
    where.price = { gte: minPrice };
  } else if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
    where.price = { lte: maxPrice };
  }

  if (options.featured) {
    where.featured = true;
  }

  if (options.specials) {
    where.isSpecial = true;
  }

  return where;
}

export async function findProducts(options: ProductQueryOptions = {}) {
  const { search, limit, ...filterOptions } = options;
  const where = buildProductWhere(filterOptions);

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const matched = search?.trim()
    ? fuzzyMatchProducts(products, search.trim())
    : products;

  return limit ? matched.slice(0, limit) : matched;
}
