import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env file!");
  console.error("\nPlease add DATABASE_URL to your .env file:");
  console.error('DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"');
  process.exit(1);
}

if (process.env.DATABASE_URL.includes("[YOUR-PASSWORD]") || process.env.DATABASE_URL.includes("[PASSWORD]")) {
  console.error("❌ DATABASE_URL still contains password placeholder!");
  console.error("\nPlease replace [YOUR-PASSWORD] or [PASSWORD] with your actual Supabase database password.");
  console.error("Get it from: https://supabase.com/dashboard → Settings → Database");
  process.exit(1);
}

console.log("✅ DATABASE_URL found");
const dbUrl = process.env.DATABASE_URL;
console.log(`Connection string preview: ${dbUrl.substring(0, 50)}...`);

// Verify the URL format
if (!dbUrl.startsWith("postgresql://")) {
  console.error("❌ DATABASE_URL must start with 'postgresql://'");
  process.exit(1);
}

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("\nTesting database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful!");
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. Current users: ${userCount}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.error("\nPossible issues:");
      console.error("1. DATABASE_URL in .env is incorrect");
      console.error("2. Database password is wrong");
      console.error("3. Supabase project might be paused");
      console.error("4. Network/firewall blocking connection");
      console.error("\nSolution:");
      console.error("1. Go to Supabase dashboard");
      console.error("2. Settings → Database → Connection string");
      console.error("3. Copy the URI connection string");
      console.error("4. Update DATABASE_URL in .env");
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

