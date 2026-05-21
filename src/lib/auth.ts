import * as jose from "jose";

const COOKIE_NAME = "admin_token";

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 8) {
    throw new Error("JWT_SECRET must be set to a strong value in production");
  }
  return new TextEncoder().encode(raw);
}

/** Dev fallback so `next dev` works without .env until first configure */
function getSecretLoose() {
  const raw = process.env.JWT_SECRET ?? "mkhsounds-dev-secret-change-in-production";
  return new TextEncoder().encode(raw);
}

export async function signAdminToken(adminUserId: string): Promise<string> {
  const secret = process.env.NODE_ENV === "production" ? getSecret() : getSecretLoose();
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
    const secret = process.env.NODE_ENV === "production" ? getSecret() : getSecretLoose();
    const { payload } = await jose.jwtVerify(token, secret);
    const sub = payload.sub;
    if (typeof sub !== "string") return null;
    return { sub };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
