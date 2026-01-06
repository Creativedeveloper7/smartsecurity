import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const slug = searchParams.get("slug");

  console.log("📥 [GET /api/categories]", {
    url: requestUrl.pathname + requestUrl.search,
    slug,
    timestamp: new Date().toISOString(),
  });

  try {

    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
      });
      if (category) {
        return NextResponse.json(category);
      }
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    console.log("✅ [GET /api/categories] Success", {
      categoriesCount: categories.length,
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("❌ [GET /api/categories] Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      url: requestUrl.pathname + requestUrl.search,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    
    // Check if it's a connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("🔴 [GET /api/categories] Database connection failed:", {
        errorCode: error.code,
        errorMessage: error.message,
        suggestion: "Check DATABASE_URL in Vercel environment variables",
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
      });
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: "Please check your database configuration",
        },
        { status: 503 }
      );
    }
    
    // Return empty array for other errors
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  console.log("📥 [POST /api/categories] Request received", {
    timestamp: new Date().toISOString(),
  });

  try {
    const body = await request.json();
    const { name, slug } = body;

    console.log("📥 [POST /api/categories] Request data:", {
      name,
      slug,
    });

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
      },
    });

    console.log("✅ [POST /api/categories] Category created successfully", {
      categoryId: category.id,
      slug: category.slug,
      name: category.name,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/categories] Error creating category:", {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

