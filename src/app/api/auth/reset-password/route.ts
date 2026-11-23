import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeAdminEmail, validateNewPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = normalizeAdminEmail(
      typeof body.email === "string" ? body.email : ""
    );
    const resetCode = typeof body.resetCode === "string" ? body.resetCode : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    const secret = process.env.ADMIN_RESET_SECRET;
    if (!secret || secret.length < 8) {
      return NextResponse.json(
        { error: "Password reset is not configured." },
        { status: 503 }
      );
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!resetCode) {
      return NextResponse.json({ error: "Reset code is required." }, { status: 400 });
    }
    if (resetCode !== secret) {
      return NextResponse.json({ error: "Invalid reset code." }, { status: 401 });
    }

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "No account found for that email." }, { status: 404 });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
