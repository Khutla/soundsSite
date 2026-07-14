import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApi();
    if (admin instanceof Response) {
      return admin;
    }

    const formData = await request.formData();
    const id = formData.get("id")?.toString().trim();
    const status = formData.get("status")?.toString().trim().toUpperCase();

    if (!id || !status || !["APPROVED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await prisma.secondHandProduct.update({
      where: { id },
      data: { status },
    });

    return NextResponse.redirect(new URL("/admin/marketplace", request.url));
  } catch (error) {
    console.error("Marketplace admin update error", error);
    return NextResponse.json({ error: "Failed to update listing." }, { status: 500 });
  }
}
