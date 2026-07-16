export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueProductSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const { prisma } = await import("./prisma");
  const slug = slugify(base) || "product";
  let candidate = slug;
  let n = 0;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

export async function uniqueCategorySlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const { prisma } = await import("./prisma");
  const slug = slugify(base) || "category";
  let candidate = slug;
  let n = 0;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

export function marketplaceProductSlug(base: string, id: string) {
  const baseSlug = slugify(base) || "listing";
  const shortId = id.slice(0, 8);
  return `${baseSlug}-${shortId}`;
}
