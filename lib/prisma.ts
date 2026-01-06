import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL environment variable is not set");
  // Don't throw in production to allow graceful degradation
  if (process.env.NODE_ENV === "development") {
    throw new Error("DATABASE_URL environment variable is not set");
  }
}

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.error("⚠️ DATABASE_URL is missing. Database queries will fail.");
    // Return a client that will fail gracefully
    return new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://placeholder:placeholder@localhost:5432/placeholder",
        },
      },
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma =
  globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Test connection on startup (non-blocking)
if (process.env.DATABASE_URL) {
  prisma.$connect().catch((error) => {
    console.error("⚠️ Failed to connect to database:", error.message);
  });
}

