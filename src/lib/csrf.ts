import { timingSafeEqual } from "crypto";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

export function getBrowserCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!match) return null;
  const value = decodeURIComponent(match.split("=")[1] ?? "");
  return value || null;
}

export async function ensureBrowserCsrfToken(): Promise<string | null> {
  if (typeof document === "undefined") return null;

  const existing = getBrowserCsrfToken();
  if (existing) return existing;

  try {
    const res = await fetch("/api/admin/csrf", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    if (typeof data.token === "string" && data.token.length >= 32) {
      return data.token;
    }
  } catch {
    // Ignore and fall back to any existing browser cookie value.
  }

  return getBrowserCsrfToken();
}

function parseCookieValue(rawCookieHeader: string | null, name: string): string | null {
  if (!rawCookieHeader) return null;

  for (const part of rawCookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const value = trimmed.slice(name.length + 1);
    return decodeURIComponent(value) || null;
  }

  return null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function verifyCsrfRequest(request: Request): Promise<boolean> {
  const cookieToken = parseCookieValue(request.headers.get("cookie"), CSRF_COOKIE_NAME);
  if (!cookieToken) return false;

  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken && constantTimeEqual(headerToken, cookieToken)) {
    return true;
  }

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.clone().json();
      const bodyToken = typeof body?.csrfToken === "string" ? body.csrfToken : "";
      return constantTimeEqual(bodyToken, cookieToken);
    }

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.clone().formData();
      const bodyToken = form.get("csrfToken")?.toString() ?? "";
      return constantTimeEqual(bodyToken, cookieToken);
    }
  } catch {
    return false;
  }

  return false;
}

export function withCsrfHeader(headers?: HeadersInit, token?: string): HeadersInit {
  const next = new Headers(headers ?? {});
  const currentToken = token ?? getBrowserCsrfToken();
  if (currentToken) {
    next.set(CSRF_HEADER_NAME, currentToken);
  }
  return next;
}
