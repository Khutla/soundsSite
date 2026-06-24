import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, signAdminToken } from "@/lib/auth";


export async function POST(req: Request) {
  try {
    // Parse email and password from the incoming request first
    const { email, password } = await req.json();

    // ==========================================
    // TEMPORARY ADMIN CREATION BYPASS
    // ==========================================
    try {
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: "admin@mkhsounds.co.za" }
      });

      if (!existingAdmin) {
        const bcryptjs = require("bcryptjs"); 
        const temporaryHash = await bcryptjs.hash("admin123", 10);
        
        await prisma.adminUser.create({
          data: {
            email: "admin@mkhsounds.co.za",
            passwordHash: temporaryHash,
          }
        });
        console.log("=== LIVE ADMIN USER CREATED SUCCESSFULLY ===");
      }
    } catch (error) {
      console.error("Temporary admin creation failed:", error);
    }
    // ==========================================

    // Your normal login authentication continues smoothly here
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Checking the password using your file's main bcrypt module
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
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}