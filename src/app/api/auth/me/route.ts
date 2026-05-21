import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/admin-api";

export async function GET() {
  const user = await getAdminFromCookie();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
