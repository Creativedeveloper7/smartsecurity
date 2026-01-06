import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      published: true,
    };

    if (category && category !== "All") {
      where.categories = {
        some: {
          slug: category.toLowerCase(),
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          categories: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    
    // Check if it's a connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("❌ Database connection failed. Check DATABASE_URL in Vercel environment variables.");
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: "Please check your database configuration",
        },
        { status: 503 }
      );
    }
    
    // Return empty array for other errors to prevent frontend breakage
    return NextResponse.json({
      articles: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, featuredImage, categories, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        categories: {
          connect: categories && categories.length > 0
            ? categories.map((id: string) => ({ id }))
            : [],
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error("Error creating article:", error);
    
    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}

