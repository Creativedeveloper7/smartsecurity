import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET comments for an article
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Find article by slug
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Get approved comments for this article
    const comments = await prisma.comment.findMany({
      where: {
        articleId: article.id,
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("❌ [GET /api/articles/[slug]/comments] Error fetching comments:", {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    
    // Check if it's a Prisma client issue (model not found)
    if (error.message?.includes("comment") || error.message?.includes("Comment") || error.code === "P2001") {
      console.warn("⚠️ Prisma client needs to be regenerated. Please run: npx prisma generate");
      return NextResponse.json({ comments: [] }, { status: 200 });
    }
    
    // Check if it's a database connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("🔴 Database connection failed");
      return NextResponse.json({ comments: [] }, { status: 200 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch comments", comments: [] },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, comment } = body;

    // Validate input
    if (!name || !comment) {
      return NextResponse.json(
        { error: "Name and comment are required" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Find article by slug
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Create comment (approved automatically)
    const newComment = await prisma.comment.create({
      data: {
        articleId: article.id,
        name: name.trim(),
        comment: comment.trim(),
        approved: true, // Comments appear automatically
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/articles/[slug]/comments] Error creating comment:", {
      message: error.message,
      code: error.code,
      name: error.name,
      meta: error.meta,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    
    // Check if it's a Prisma client issue (model not found)
    if (error.message?.includes("comment") || error.message?.includes("Comment") || error.code === "P2001") {
      console.warn("⚠️ Prisma client needs to be regenerated. Please run: npx prisma generate");
      return NextResponse.json(
        { error: "Comment model not found. Please regenerate Prisma client." },
        { status: 500 }
      );
    }
    
    // Check if it's a database connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("🔴 Database connection failed");
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create comment",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

