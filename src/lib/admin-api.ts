import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { COOKIE_NAME, verifyAdminToken } from "./auth";
import { verifyCsrfRequest } from "./csrf";

export async function getAdminFromCookie() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload?.sub) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true },
  });
  return user;
}

export async function requireAdminApi(request?: Request) {
  const user = await getAdminFromCookie();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const method = request?.method?.toUpperCase() ?? "GET";
  if (request && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (!(await verifyCsrfRequest(request))) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return user;
}

export async function requireAdminPage() {
  const user = await getAdminFromCookie();
  if (!user) redirect("/admin/login");
  return user;
}
