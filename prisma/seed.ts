import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Initialize Supabase client for user creation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn("⚠️  Supabase credentials not found. User creation in Supabase Auth will be skipped.");
  console.warn("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to create users in Supabase Auth.");
}

async function main() {
  console.log("Seeding database...");

  // Create admin user in Supabase Auth first
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  let authUserId: string | null = null;

  if (supabase) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === adminEmail);

      if (existingUser) {
        console.log(`✅ User ${adminEmail} already exists in Supabase Auth`);
        authUserId = existingUser.id;
      } else {
        // Create user in Supabase Auth
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: "Admin User",
          },
        });

        if (createError) {
          console.error("❌ Error creating user in Supabase Auth:", createError.message);
          console.log("💡 You can create the user manually in Supabase Dashboard:");
          console.log("   1. Go to Authentication → Users");
          console.log("   2. Click 'Add user' → 'Create new user'");
          console.log("   3. Email:", adminEmail);
          console.log("   4. Password:", adminPassword);
        } else {
          console.log(`✅ Created user in Supabase Auth: ${adminEmail}`);
          authUserId = newUser.user.id;
        }
      }
    } catch (error) {
      console.error("❌ Error with Supabase Auth:", error);
      console.log("💡 Continuing with database seed (user must be created manually in Supabase Auth)");
    }
  }

  // Sync user to Prisma User table
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "SUPER_ADMIN",
      name: "Admin User",
      // Update ID if we got one from Supabase Auth
      ...(authUserId && { id: authUserId }),
    },
    create: {
      id: authUserId || undefined, // Use Supabase Auth UUID if available, otherwise Prisma will generate
      email: adminEmail,
      name: "Admin User",
      role: "SUPER_ADMIN",
      emailVerified: new Date(), // Auto-confirmed
    },
  });

  console.log("✅ Synced admin user to database:", admin.email, `(${admin.role})`);

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

