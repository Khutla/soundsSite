import { NextResponse } from "next/server";
import { findProducts } from "@/lib/products/query";
import { serializeProduct } from "@/lib/serialize";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Math.min(Math.max(Number(limitRaw), 1), 20) : 8;

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const products = await findProducts({ search: query, limit });
    return NextResponse.json({
      products: products.map(serializeProduct),
    });
  } catch {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
