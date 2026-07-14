import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SubmitBody = {
  title?: unknown;
  price?: unknown;
  condition?: unknown;
  description?: unknown;
  sellerName?: unknown;
  sellerWhatsapp?: unknown;
  location?: unknown;
  imageCount?: unknown;
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
    const imageCount = typeof body.imageCount === "number" ? body.imageCount : 0;
    const priceValue = typeof body.price === "number" ? body.price : Number(body.price);

    if (!title || !description || !sellerName || !sellerWhatsapp || !location || !condition || imageCount < 1 || !Number.isFinite(priceValue) || priceValue <= 0) {
      return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
    }

    const listing = await prisma.secondHandProduct.create({
      data: {
        title,
        price: priceValue,
        condition,
        description,
        sellerName,
        sellerWhatsapp,
        location,
        imageUrls: [],
        status: "PENDING",
        category: "2nd Hand Equipment",
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error("Marketplace submission error", error);
    return NextResponse.json({ error: "Failed to submit listing." }, { status: 500 });
  }
}
