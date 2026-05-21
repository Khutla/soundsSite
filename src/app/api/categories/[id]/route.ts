import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serialize";
import { requireAdminApi } from "@/lib/admin-api";
import { uniqueCategorySlug } from "@/lib/slug";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ category: serializeCategory(category) });
  } catch {
    return NextResponse.json({ error: "Failed to load category." }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { id } = await ctx.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const description =
      typeof body.description === "string" ? body.description.trim() : existing.description;
    const imageUrl =
      body.imageUrl !== undefined
        ? typeof body.imageUrl === "string" && body.imageUrl
          ? body.imageUrl.trim()
          : null
        : existing.imageUrl;

    let slug = existing.slug;
    if (typeof body.slug === "string" && body.slug.trim()) {
      slug = await uniqueCategorySlug(body.slug.trim(), existing.id);
    } else if (name !== existing.name) {
      slug = await uniqueCategorySlug(name, existing.id);
    }

    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (description && description.length > 2000) {
      return NextResponse.json({ error: "Description too long." }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description ?? "",
        imageUrl,
      },
    });

    return NextResponse.json({ category: serializeCategory(category) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not update category." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { id } = await ctx.params;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete category." }, { status: 500 });
  }
}
