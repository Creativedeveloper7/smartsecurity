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
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "Failed to fetch articles"
      : "Failed to fetch articles";
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? String(error) : undefined },
      { status: 500 }
    );
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

