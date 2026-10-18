import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeAdminEmail } from "@/lib/password";

export function getBootstrapAdminConfig(): { email: string; password: string } | null {
  const email = normalizeAdminEmail(process.env.ADMIN_EMAIL ?? "");
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    return null;
  }

  if (!email.includes("@")) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  return { email, password };
}

export async function ensureBootstrapAdmin() {
  const config = getBootstrapAdminConfig();
  if (!config) {
    return null;
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: config.email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (existing) {
    const isCurrentPassword = await bcrypt.compare(config.password, existing.passwordHash);
    if (!isCurrentPassword) {
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: { passwordHash: await hashPassword(config.password) },
      });
    }

    return { id: existing.id, email: existing.email };
  }

  const created = await prisma.adminUser.create({
    data: {
      email: config.email,
      passwordHash: await hashPassword(config.password),
    },
    select: { id: true, email: true },
  });

  return created;
}
