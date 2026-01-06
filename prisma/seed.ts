import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminEmail = "admin@example.com";
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      role: "SUPER_ADMIN",
      // Note: In production, you'd store the hashed password in a separate table
      // For now, this is a placeholder
    },
  });

  console.log("Created admin user:", admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "security" },
      update: {},
      create: {
        name: "Security",
        slug: "security",
      },
    }),
    prisma.category.upsert({
      where: { slug: "intelligence" },
      update: {},
      create: {
        name: "Intelligence",
        slug: "intelligence",
      },
    }),
    prisma.category.upsert({
      where: { slug: "protection" },
      update: {},
      create: {
        name: "Protection",
        slug: "protection",
      },
    }),
    prisma.category.upsert({
      where: { slug: "criminal-justice" },
      update: {},
      create: {
        name: "Criminal Justice",
        slug: "criminal-justice",
      },
    }),
  ]);

  console.log("Created categories:", categories.length);

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Security Consultation",
        description: "Comprehensive security assessment and strategic advice",
        duration: 60,
        price: 5000,
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Criminal Justice Advisory",
        description: "Expert guidance on criminal justice matters",
        duration: 90,
        price: 7500,
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Expert Witness Testimony",
        description: "Professional expert witness services",
        duration: 120,
        price: 10000,
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Training/Workshop",
        description: "Customized training sessions for your team",
        duration: 180,
        price: 15000,
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Speaking Engagement",
        description: "Keynote speeches and presentations",
        duration: 60,
        price: 8000,
        active: true,
      },
    }),
  ]);

  console.log("Created services:", services.length);

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      siteName: "SmartSecurity Consult",
      tagline: "Expert Security Services in Kenya",
      contactEmail: "contact@example.com",
      contactPhone: "+254 700 000 000",
      address: "Nairobi, Kenya",
      maintenanceMode: false,
    },
  });

  console.log("Created site settings");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

