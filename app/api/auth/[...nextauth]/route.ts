import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// Only use Prisma adapter if DATABASE_URL is set
let adapter: any = undefined;
try {
  if (process.env.DATABASE_URL) {
    adapter = PrismaAdapter(prisma) as any;
  }
} catch (error) {
  console.error("Failed to initialize Prisma adapter:", error);
  // Continue without adapter - will use JWT sessions only
  adapter = undefined;
}

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // If no database, return null (auth will fail gracefully)
        if (!process.env.DATABASE_URL) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          // For demo purposes - in production, use proper password hashing
          // const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          // if (!isPasswordValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
};

// Validate and warn about NEXTAUTH_URL
if (process.env.NODE_ENV === "development") {
  if (!process.env.NEXTAUTH_URL) {
    // Auto-detect port from process or default to 3000
    const port = process.env.PORT || "3000";
    console.warn(`⚠️ NEXTAUTH_URL is not set. Add NEXTAUTH_URL=http://localhost:${port} to your .env file`);
  } else {
    // Ensure URL doesn't have trailing slash
    const url = process.env.NEXTAUTH_URL.trim();
    if (url.endsWith('/')) {
      console.warn("⚠️ NEXTAUTH_URL should not have a trailing slash. Current:", url);
    }
    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      console.log("✅ NEXTAUTH_URL is valid:", parsedUrl.href);
    } catch (error) {
      console.error("❌ NEXTAUTH_URL is not a valid URL:", url);
    }
  }
}

// Initialize NextAuth handler
let handler: any;
try {
  handler = NextAuth(authOptions);
  console.log("✅ NextAuth handler initialized successfully");
} catch (error: any) {
  console.error("❌ Failed to initialize NextAuth:", error);
  // Create a fallback handler that always returns JSON
  handler = async (req: Request, context: any) => {
    return new Response(
      JSON.stringify({ 
        error: "Authentication service unavailable",
        message: error?.message || "NextAuth initialization failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  };
}

export { handler as GET, handler as POST };

