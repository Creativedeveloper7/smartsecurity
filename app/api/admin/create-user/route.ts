import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Create admin user
    const adminEmail = "admin@example.com";
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "SUPER_ADMIN",
        name: "Admin User",
      },
      create: {
        email: adminEmail,
        name: "Admin User",
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully!",
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      loginCredentials: {
        email: "admin@example.com",
        password: "any password (password checking is disabled)",
      },
    });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create admin user",
      },
      { status: 500 }
    );
  }
}

