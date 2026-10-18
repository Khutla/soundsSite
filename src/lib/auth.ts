import * as jose from "jose";

const COOKIE_NAME = "admin_token";

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.trim().length < 32) {
    throw new Error("JWT_SECRET must be set to a strong value of at least 32 characters.");
  }
  return new TextEncoder().encode(raw);
}

export async function signAdminToken(adminUserId: string): Promise<string> {
  const secret = getSecret();
  return new jose.SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(
  token: string
): Promise<{ sub: string } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    const sub = payload.sub;
    if (typeof sub !== "string") return null;
    return { sub };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
