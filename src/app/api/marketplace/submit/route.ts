import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { marketplaceProductSlug } from "@/lib/slug";
import { randomUUID } from "crypto";

type SubmitBody = {
  title?: unknown;
  price?: unknown;
  condition?: unknown;
  description?: unknown;
  sellerName?: unknown;
  sellerWhatsapp?: unknown;
  location?: unknown;
  imageCount?: unknown;
  imageUrls?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as SubmitBody | null;

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const sellerName = typeof body.sellerName === "string" ? body.sellerName.trim() : "";
    const sellerWhatsapp = typeof body.sellerWhatsapp === "string" ? body.sellerWhatsapp.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const condition = typeof body.condition === "string" ? body.condition.trim() : "";
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url): url is string => typeof url === "string" && url.trim().length > 0).map((url) => url.trim())
      : [];
    const imageCount = typeof body.imageCount === "number" ? body.imageCount : imageUrls.length;
    const priceValue = typeof body.price === "number" ? body.price : Number(body.price);

    if (!title || !description || !sellerName || !sellerWhatsapp || !location || !condition || imageUrls.length < 1 || imageCount < 1 || !Number.isFinite(priceValue) || priceValue <= 0) {
      return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
    }

    const slug = marketplaceProductSlug(title, randomUUID());
    const listing = await prisma.secondHandProduct.create({
      data: {
        title,
        price: priceValue,
        condition,
        description,
        sellerName,
        sellerWhatsapp,
        location,
        imageUrls,
        status: "PENDING",
        category: "2nd Hand Equipment",
        slug,
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error("Marketplace submission error", error);
    return NextResponse.json({ error: "Failed to submit listing." }, { status: 500 });
  }
}
