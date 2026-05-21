import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { COOKIE_NAME, verifyAdminToken } from "./auth";

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

export async function requireAdminApi() {
  const user = await getAdminFromCookie();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireAdminPage() {
  const user = await getAdminFromCookie();
  if (!user) redirect("/admin/login");
  return user;
}
