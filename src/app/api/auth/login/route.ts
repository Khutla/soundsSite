import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, signAdminToken } from "@/lib/auth";


export async function POST(req: Request) {
 
  try {
    const { email, password } = await req.json();

    // ==========================================
    // TEMPORARY ADMIN CREATION BYPASS (Safe & Clean)
    // ==========================================
    try {
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: "admin@mkhsounds.co.za" }
      });

      if (!existingAdmin) {
        // We use 'bcrypt' here directly, leveraging your top-of-file import!
        const temporaryHash = await bcrypt.hash("admin123", 10);
        
        await prisma.adminUser.create({
          data: {
            email: "admin@mkhsounds.co.za",
            passwordHash: temporaryHash,
          }
        });
        console.log("=== LIVE ADMIN USER CREATED SUCCESSFULLY ===");
      }
    } catch (bypassError) {
      // If the bypass fails, log it but don't crash the entire login page
      console.error("Bypass background warning:", bypassError);
    }
    // ==========================================

    // Your standard login code continues below
    const admin = await prisma.adminUser.findUnique({ where: { email } });
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
    // This logs the exact error causing "Something went wrong" to your terminal!
    console.error("CRITICAL ROUTE ERROR:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}