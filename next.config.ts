import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Prisma with Next.js 16 and Turbopack
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
