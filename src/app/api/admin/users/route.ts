import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { hashPassword, normalizeAdminEmail, validateNewPassword } from "@/lib/password";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, createdAt: true },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const email = normalizeAdminEmail(
      typeof body.email === "string" ? body.email : ""
    );
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const passwordError = validateNewPassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An admin with that email already exists." },
        { status: 409 }
      );
    }

    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
      },
      select: { id: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Could not create user." }, { status: 500 });
  }
}
