import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

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

    if (!(prisma as unknown as Record<string, unknown>).secondHandProduct) {
      return NextResponse.json(
        { error: "Marketplace temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const sellerName = typeof body.sellerName === "string" ? body.sellerName.trim() : "";
    const sellerWhatsapp = typeof body.sellerWhatsapp === "string" ? body.sellerWhatsapp.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const condition = typeof body.condition === "string" ? body.condition.trim() : "";
    const imageCount = typeof body.imageCount === "number" ? body.imageCount : 0;
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((item): item is string => typeof item === "string")
      : [];
    const priceValue = typeof body.price === "number" ? body.price : Number(body.price);

    if (
      !title ||
      !description ||
      !sellerName ||
      !sellerWhatsapp ||
      !location ||
      !condition ||
      imageCount < 1 ||
      imageUrls.length < 1 ||
      !Number.isFinite(priceValue) ||
      priceValue <= 0
    ) {
      return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
    }

    const slugBase = slugify(title) || "listing";
    const slugSuffix = crypto.randomUUID().slice(0, 8);
    const slug = `${slugBase}-${slugSuffix}`;

    await prisma.secondHandProduct.create({
      data: {
        slug,
        title,
        price: priceValue,
        condition,
        description,
        sellerName,
        sellerWhatsapp,
        location,
        imageUrls,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Marketplace submit error", error);
    return NextResponse.json({ error: "Failed to submit listing." }, { status: 500 });
  }
}
