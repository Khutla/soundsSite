import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@mkhsounds.co.za" },
    update: { passwordHash: hash },
    create: {
      email: "admin@mkhsounds.co.za",
      passwordHash: hash,
    },
  });

  const speakers = await prisma.category.upsert({
    where: { slug: "speakers-subwoofers" },
    update: {},
    create: {
      name: "Speakers & Subwoofers",
      slug: "speakers-subwoofers",
      description: "Component sets, coaxials, and subwoofers for clarity and impact.",
    },
  });

  const amps = await prisma.category.upsert({
    where: { slug: "amplifiers" },
    update: {},
    create: {
      name: "Amplifiers",
      slug: "amplifiers",
      description: "Multi-channel and mono amps tuned for car audio performance.",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Wiring, damping, and installation essentials.",
    },
  });

  const demoProducts = [
    {
      name: "8″ Component Speaker Kit",
      slug: "8-component-speaker-kit",
      description:
        "Premium two-way component kit with silk dome tweeters and glass-fibre woofers.",
      price: 3499,
      specialPrice: 2999,
      isSpecial: true,
      featured: true,
      categoryId: speakers.id,
    },
    {
      name: "12″ Shallow Subwoofer",
      slug: "12-shallow-subwoofer",
      description: "Deep bass from a slim enclosure-friendly driver.",
      price: 2799,
      specialPrice: null as number | null,
      isSpecial: false,
      featured: true,
      categoryId: speakers.id,
    },
    {
      name: "5-Channel Class-D Amplifier",
      slug: "5-channel-class-d-amplifier",
      description: "Run fronts, rears, and a sub from one efficient amplifier.",
      price: 4299,
      specialPrice: 3999,
      isSpecial: true,
      featured: true,
      categoryId: amps.id,
    },
    {
      name: "Amp Wiring Kit — 4 Gauge",
      slug: "amp-wiring-kit-4-gauge",
      description: "Complete oxygen-free copper kit with fused distribution.",
      price: 899,
      specialPrice: null as number | null,
      isSpecial: false,
      featured: false,
      categoryId: accessories.id,
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        specialPrice: p.specialPrice,
        isSpecial: p.isSpecial,
        featured: p.featured,
        categoryId: p.categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        specialPrice: p.specialPrice,
        isSpecial: p.isSpecial,
        featured: p.featured,
        categoryId: p.categoryId,
        imageUrl: null,
      },
    });
  }

  console.log("Seed complete. Admin: admin@mkhsounds.co.za / admin123");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
