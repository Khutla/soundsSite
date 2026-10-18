import { NextResponse } from "next/server";
import { CSRF_COOKIE_NAME } from "@/lib/csrf";

export async function GET() {
  const token = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, byte) => {
    const hex = byte.toString(16).padStart(2, "0");
    return acc + hex;
  }, "");

  const res = NextResponse.json({ token });
  res.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
