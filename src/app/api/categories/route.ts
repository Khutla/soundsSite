import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serialize";
import { requireAdminApi } from "@/lib/admin-api";
import { uniqueCategorySlug } from "@/lib/slug";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      categories: categories.map(serializeCategory),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load categories." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl.trim() : null;

    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (description.length > 2000) {
      return NextResponse.json({ error: "Description too long." }, { status: 400 });
    }

    const slug = await uniqueCategorySlug(
      typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : name
    );

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || "",
        imageUrl,
      },
    });

    return NextResponse.json({ category: serializeCategory(category) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
