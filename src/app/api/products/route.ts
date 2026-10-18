import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findProducts } from "@/lib/products/query";
import { serializeProduct } from "@/lib/serialize";
import { requireAdminApi } from "@/lib/admin-api";
import { uniqueProductSlug } from "@/lib/slug";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") ?? undefined;
    const search =
      searchParams.get("search")?.trim() ?? searchParams.get("q")?.trim();
    const minRaw = searchParams.get("minPrice");
    const maxRaw = searchParams.get("maxPrice");
    const featured = searchParams.get("featured") === "1";
    const specials = searchParams.get("specials") === "1";

    const minPrice = minRaw != null && minRaw !== "" ? Number(minRaw) : undefined;
    const maxPrice = maxRaw != null && maxRaw !== "" ? Number(maxRaw) : undefined;

    const products = await findProducts({
      categorySlug,
      search,
      minPrice,
      maxPrice,
      featured,
      specials,
    });

    return NextResponse.json({
      products: products.map(serializeProduct),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId.trim() : "";
    const price = Number(body.price);
    const specialRaw = body.specialPrice;
    const specialPrice =
      specialRaw === null || specialRaw === undefined || specialRaw === ""
        ? null
        : Number(specialRaw);
    const isSpecial = Boolean(body.isSpecial);
    const featured = Boolean(body.featured);
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl.trim() : null;

    if (!name || name.length > 200) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (!description || description.length > 8000) {
      return NextResponse.json({ error: "Invalid description." }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }
    if (specialPrice !== null && (Number.isNaN(specialPrice) || specialPrice < 0)) {
      return NextResponse.json({ error: "Invalid special price." }, { status: 400 });
    }

    const slug = await uniqueProductSlug(body.slug && typeof body.slug === "string" ? body.slug : name);

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        price,
        specialPrice,
        isSpecial,
        featured,
        imageUrl,
      },
      include: { category: true },
    });

    return NextResponse.json({ product: serializeProduct(product) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
