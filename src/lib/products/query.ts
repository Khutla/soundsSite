import { prisma } from "@/lib/prisma";
import type { Category, Product, Prisma, SecondHandProduct } from "@prisma/client";
import { fuzzyMatchProducts } from "@/lib/products/fuzzy-search";
import type { SearchableProduct } from "@/lib/products/types";
import { slugify } from "@/lib/slug";

function parseMarketplaceImageUrls(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

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

function marketplaceCategorySlug(category: string) {
  return slugify(category);
}

function passesMarketplaceFilter(
  listing: SecondHandProduct,
  options: Omit<ProductQueryOptions, "search" | "limit">
) {
  const { minPrice, maxPrice, categorySlug } = options;

  if (minPrice !== undefined && !Number.isNaN(minPrice) && Number(listing.price) < minPrice) {
    return false;
  }

  if (maxPrice !== undefined && !Number.isNaN(maxPrice) && Number(listing.price) > maxPrice) {
    return false;
  }

  if (categorySlug) {
    return marketplaceCategorySlug(listing.category) === categorySlug;
  }

  return true;
}

export async function findProductBySlug(
  slug: string
): Promise<SearchableProduct | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (product) return product;

  if (!(prisma as unknown as Record<string, unknown>).secondHandProduct) {
    return null;
  }

  const listing = await prisma.secondHandProduct.findUnique({
    where: { slug },
  });

  if (!listing || listing.status !== "APPROVED") return null;

  const imageUrls = parseMarketplaceImageUrls(listing.imageUrls);

  return {
    id: listing.id,
    slug: listing.slug,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    sellerName: listing.sellerName,
    sellerWhatsapp: listing.sellerWhatsapp,
    location: listing.location,
    imageUrls: listing.imageUrls,
    status: listing.status,
    title: listing.title,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    name: listing.title,
    imageUrl: imageUrls[0] ?? null,
    category: { name: listing.category, slug: marketplaceCategorySlug(listing.category) },
  } as SearchableProduct;
}

export async function findProducts(options: ProductQueryOptions = {}) {
  const { search, limit, ...filterOptions } = options;
  const where = buildProductWhere(filterOptions);

  const [products, marketplaceItems] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    (async () => {
      if (!(prisma as unknown as Record<string, unknown>).secondHandProduct) {
        return [] as SearchableProduct[];
      }

      const listings = await prisma.secondHandProduct.findMany({
        where: { status: "APPROVED" },
        orderBy: { title: "asc" },
      });

      return listings
        .filter((listing) => passesMarketplaceFilter(listing, filterOptions))
        .map((listing): SearchableProduct => {
          const imageUrls = parseMarketplaceImageUrls(listing.imageUrls);
          return {
            id: listing.id,
            slug: listing.slug,
            description: listing.description,
            price: listing.price,
            condition: listing.condition,
            sellerName: listing.sellerName,
            sellerWhatsapp: listing.sellerWhatsapp,
            location: listing.location,
            imageUrls: listing.imageUrls,
            status: listing.status,
            title: listing.title,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            name: listing.title,
            imageUrl: imageUrls[0] ?? null,
            category: { name: listing.category, slug: marketplaceCategorySlug(listing.category) },
          };
        });
    })(),
  ]);

  const combined = [...products, ...marketplaceItems] as SearchableProduct[];

  const matched = search?.trim()
    ? fuzzyMatchProducts(combined, search.trim())
    : combined.sort((a, b) => a.name.localeCompare(b.name));

  return limit ? matched.slice(0, limit) : matched;
}
