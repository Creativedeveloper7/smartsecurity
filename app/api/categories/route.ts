import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

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

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "Failed to fetch categories"
      : "Failed to fetch categories";
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? String(error) : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;

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

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

