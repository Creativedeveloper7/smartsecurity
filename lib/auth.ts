import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return null;
    }

    // Get user role from database
    // Match by email since Supabase Auth UUID may differ from Prisma ID
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, name: true, role: true, image: true },
    });

    if (!dbUser) {
      // User exists in Supabase Auth but not in our database
      // This shouldn't happen, but return null to prevent errors
      console.warn(`User ${user.email} exists in Supabase Auth but not in database`);
      return null;
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
      },
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized - Admin access required");
  }
  return session;
}

