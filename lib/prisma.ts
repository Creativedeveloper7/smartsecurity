import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL environment variable is not set");
  if (process.env.NODE_ENV === "development") {
    throw new Error("DATABASE_URL environment variable is not set");
  }
}

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.error("⚠️ DATABASE_URL is missing. Database queries will fail.");
    throw new Error("DATABASE_URL is required");
  }

  // Configure Prisma for serverless environments (Vercel)
  // Use connection pooling URL for Supabase on Vercel
  const databaseUrl = process.env.DATABASE_URL;
  
  // Ensure we're using the pooler URL for Vercel (port 6543)
  // If not, log a warning
  if (process.env.VERCEL && !databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes(':6543')) {
    console.warn("⚠️ Consider using Supabase connection pooler URL (port 6543) for better performance on Vercel");
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const prisma =
  globalThis.prisma ?? createPrismaClient();

// In development, reuse the same Prisma instance
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// For serverless (Vercel), ensure we disconnect properly
if (process.env.VERCEL) {
  // Disconnect on process termination
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

