// insert-admin.js
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function run() {
  console.log("Starting local admin injection...");
  
  try {
    const email = "admin@mkhsounds.co.za";
    const password = "shibambu147@";
    
    // Hash the password securely matching your standard setup
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if user exists, create if they don't
    const user = await prisma.adminUser.upsert({
      where: { email: email },
      update: { passwordHash: passwordHash },
      create: {
        email: email,
        passwordHash: passwordHash,
      },
    });

    console.log("=========================================");
    console.log(" SUCCESS: Admin user is ready in the DB!");
    console.log(` Email: ${user.email}`);
    console.log("=========================================");
    
  } catch (error) {
    console.error(" CRITICAL ERROR RUNNING SCRIPT:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();