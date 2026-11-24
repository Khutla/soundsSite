import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { isSafeUploadFilename } from "@/lib/uploads";

type RouteContext = { params: Promise<{ id: string }> };

function parseImageUrls(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((url): url is string => typeof url === "string")
      : [];
  } catch {
    return [];
  }
}

function isManagedUploadUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith("/uploads/")) return false;
  return isSafeUploadFilename(value.slice("/uploads/".length));
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdminApi(request);
    if (admin instanceof Response) return admin;

    const body = await request.json().catch(() => null);
    if (
      !body ||
      !Array.isArray(body.imageUrls) ||
      body.imageUrls.length === 0 ||
      !body.imageUrls.every(isManagedUploadUrl)
    ) {
      return NextResponse.json({ error: "Invalid image URLs." }, { status: 400 });
    }

    if (!(prisma as unknown as Record<string, unknown>).secondHandProduct) {
      return NextResponse.json(
        { error: "Marketplace model not available. Run prisma generate/migrate." },
        { status: 503 }
      );
    }

    const { id } = await params;
    const listing = await prisma.secondHandProduct.findUnique({
      where: { id },
      select: { imageUrls: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const imageUrls = [...new Set([
      ...parseImageUrls(listing.imageUrls),
      ...body.imageUrls,
    ])];

    const updated = await prisma.secondHandProduct.update({
      where: { id },
      data: { imageUrls: JSON.stringify(imageUrls) },
      select: { imageUrls: true },
    });

    return NextResponse.json({
      success: true,
      imageUrls: parseImageUrls(updated.imageUrls),
    });
  } catch (error) {
    console.error("Marketplace image update error", error);
    return NextResponse.json(
      { error: "Failed to add images to listing." },
      { status: 500 }
    );
  }
}
