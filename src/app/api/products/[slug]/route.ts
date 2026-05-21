import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { requireAdminApi } from "@/lib/admin-api";
import { uniqueProductSlug } from "@/lib/slug";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product: serializeProduct(product) });
  } catch {
    return NextResponse.json({ error: "Failed to load product." }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { slug } = await ctx.params;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : existing.name;
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : existing.description;
    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId.trim() : existing.categoryId;

    let nextSlug = existing.slug;
    if (typeof body.slug === "string" && body.slug.trim()) {
      nextSlug = await uniqueProductSlug(body.slug.trim(), existing.id);
    } else if (name !== existing.name) {
      nextSlug = await uniqueProductSlug(name, existing.id);
    }

    const price =
      body.price !== undefined ? Number(body.price) : Number(existing.price);
    const specialRaw = body.specialPrice;
    let specialPrice: number | null;
    if (specialRaw === null || specialRaw === "") {
      specialPrice = null;
    } else if (specialRaw !== undefined) {
      specialPrice = Number(specialRaw);
    } else {
      specialPrice = existing.specialPrice != null ? Number(existing.specialPrice) : null;
    }

    const isSpecial =
      typeof body.isSpecial === "boolean" ? body.isSpecial : existing.isSpecial;
    const featured =
      typeof body.featured === "boolean" ? body.featured : existing.featured;

    const imageUrl =
      body.imageUrl !== undefined
        ? typeof body.imageUrl === "string" && body.imageUrl
          ? body.imageUrl.trim()
          : null
        : existing.imageUrl;

    if (!name || name.length > 200) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (!description || description.length > 8000) {
      return NextResponse.json({ error: "Invalid description." }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }
    if (specialPrice !== null && (Number.isNaN(specialPrice) || specialPrice < 0)) {
      return NextResponse.json({ error: "Invalid special price." }, { status: 400 });
    }

    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return NextResponse.json({ error: "Category not found." }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name,
        slug: nextSlug,
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
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { slug } = await ctx.params;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.product.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete product." }, { status: 500 });
  }
}
