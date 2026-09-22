import type { Category } from "@prisma/client";
import type { SearchableProduct } from "@/lib/products/types";

export type CategoryJson = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type ProductJson = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId?: string;
  price: number;
  specialPrice: number | null;
  category?: CategoryJson;
  isSpecial?: boolean;
  featured?: boolean;
  imageUrls?: string[];
  sellerType?: string | null;
  source: "product" | "marketplace";
  condition?: string;
  sellerName?: string;
  sellerPhone?: string;
  location?: string;
};

function parseImageUrls(value: string | string[] | null | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function serializeProduct(p: SearchableProduct): ProductJson {
  if ("title" in p) {
    const imageUrls = parseImageUrls(p.imageUrls);

    return {
      id: p.id,
      slug: p.slug,
      name: p.title,
      description: p.description,
      price: Number(p.price),
      specialPrice: null,
      imageUrl: p.imageUrl ?? null,
      imageUrls,
      category: p.category
        ? {
            id: p.id,
            name: p.category.name,
            slug: p.category.slug,
            description: null,
            imageUrl: null,
          }
        : undefined,
      isSpecial: false,
      featured: false,
      source: "marketplace",
      condition: p.condition,
      sellerName: p.sellerName,
      sellerPhone: (p as any).sellerPhone,
      sellerType: (p as any).sellerType ?? null,
      location: p.location,
    };
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl ?? null,
    categoryId: p.categoryId,
    price: Number(p.price),
    specialPrice: p.specialPrice != null ? Number(p.specialPrice) : null,
    category: p.category ? serializeCategory(p.category) : undefined,
    isSpecial: p.isSpecial,
    featured: p.featured,
    source: "product",
  };
}

export function serializeCategory(c: Category): CategoryJson {
  return { ...c };
}
