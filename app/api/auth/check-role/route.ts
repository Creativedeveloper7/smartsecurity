import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    // Get user role from database
    // Supabase Auth uses UUID, so we need to match by email or sync users
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Find user in our database by email (Supabase Auth email)
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    const isAdmin = dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN');

    return NextResponse.json({ isAdmin: !!isAdmin });
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}


