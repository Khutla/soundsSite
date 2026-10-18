import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, signAdminToken } from "@/lib/auth";
import { ensureBootstrapAdmin } from "@/lib/admin-bootstrap";
import { normalizeAdminEmail } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = normalizeAdminEmail(
      typeof body.email === "string" ? body.email : ""
    );
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    let admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      const bootstrapAdmin = await ensureBootstrapAdmin();
      if (!bootstrapAdmin || bootstrapAdmin.email !== email) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
      }
      admin = await prisma.adminUser.findUnique({ where: { email } });
    }

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signAdminToken(admin.id);
    const res = NextResponse.json({
      ok: true,
      user: { id: admin.id, email: admin.email },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("CRITICAL ROUTE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}