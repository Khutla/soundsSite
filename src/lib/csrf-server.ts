import { randomBytes } from "crypto";
import { cookies } from "next/headers";

import { CSRF_COOKIE_NAME } from "@/lib/csrf";

export async function ensureCsrfCookie(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE_NAME)?.value;
  if (existing && existing.length >= 32) return existing;

  const token = randomBytes(32).toString("hex");
  jar.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}
