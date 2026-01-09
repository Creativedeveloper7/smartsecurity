import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if it's an ID (cuid format) or a slug
    // CUIDs are typically 25 characters, start with 'c', and are alphanumeric
    // Slugs typically contain hyphens and are more descriptive
    const isId = /^c[a-z0-9]{24}$/i.test(slug) || /^[a-z0-9]{25}$/i.test(slug);
    
    let article;
    if (isId) {
      // Try to find by ID first (for admin editing)
      article = await prisma.article.findUnique({
        where: { id: slug },
        include: {
          categories: true,
        },
      });
    }
    
    // If not found by ID or not an ID, try by slug
    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug },
        include: {
          categories: true,
        },
      });
    }

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Only increment views for public slug access (not admin ID access)
    if (!isId) {
      await prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT - Update article (works with both ID and slug)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check admin authentication
    const session = await getSession();
    if (
      !session ||
      ((session.user as any)?.role !== "ADMIN" &&
        (session.user as any)?.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, slug: newSlug, excerpt, content, featuredImage, categories, published } = body;

    // Check if it's an ID (cuid format) or a slug
    // CUIDs are typically 25 characters, start with 'c', and are alphanumeric
    const isId = /^c[a-z0-9]{24}$/i.test(slug) || /^[a-z0-9]{25}$/i.test(slug);

    // Find article by ID or slug
    let existingArticle;
    if (isId) {
      existingArticle = await prisma.article.findUnique({
        where: { id: slug },
      });
    } else {
      existingArticle = await prisma.article.findUnique({
        where: { slug },
      });
    }

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (!title || !newSlug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (newSlug !== existingArticle.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Update the article
    const article = await prisma.article.update({
      where: { id: existingArticle.id },
      data: {
        title,
        slug: newSlug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage && featuredImage.trim() !== "" ? featuredImage.trim() : null,
        published: published || false,
        publishedAt: published && !existingArticle.publishedAt ? new Date() : existingArticle.publishedAt,
        categories: {
          set: [], // Clear existing categories
          connect: categories && categories.length > 0
            ? categories.map((categoryId: string) => ({ id: categoryId }))
            : [],
        },
      },
      include: {
        categories: true,
      },
    });

    console.log("✅ Article updated successfully:", {
      articleId: article.id,
      slug: article.slug,
      title: article.title,
    });

    return NextResponse.json(article);
  } catch (error: any) {
    console.error("Error updating article:", error);

    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an article (works with both ID and slug)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check admin authentication
    const session = await getSession();
    if (
      !session ||
      ((session.user as any)?.role !== "ADMIN" &&
        (session.user as any)?.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Check if it's an ID (cuid format) or a slug
    // CUIDs are typically 25 characters, start with 'c', and are alphanumeric
    const isId = /^c[a-z0-9]{24}$/i.test(slug) || /^[a-z0-9]{25}$/i.test(slug);

    // Find article by ID or slug
    let article;
    if (isId) {
      article = await prisma.article.findUnique({
        where: { id: slug },
        select: { id: true, title: true },
      });
    } else {
      article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true, title: true },
      });
    }

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Delete the article (comments will be cascade deleted due to schema)
    await prisma.article.delete({
      where: { id: article.id },
    });

    console.log("✅ Article deleted successfully:", {
      slug,
      articleId: article.id,
      title: article.title,
    });

    return NextResponse.json({ 
      success: true,
      message: "Article deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}

