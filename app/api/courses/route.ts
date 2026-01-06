import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const published = searchParams.get("published");

    const where: any = {};

    if (published === "true") {
      where.published = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { expandedDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // @ts-ignore - Course model will be available after Prisma client regeneration
    const courses = await (prisma as any).course.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // If table doesn't exist yet, return empty array
    if (error.code === "P2021" || error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("Course table does not exist yet. Please run: npm run db:migrate");
      return NextResponse.json({ courses: [] });
    }

    // If Prisma client doesn't have Course model yet
    if (error.message?.includes("course") || error.message?.includes("Course") || error.code === "P2001") {
      console.warn("Prisma client needs to be regenerated. Please restart dev server.");
      return NextResponse.json({ courses: [] });
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: process.env.NODE_ENV === "development" ? (error.message || String(error)) : undefined,
        code: error.code || "UNKNOWN"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      expandedDescription,
      keyOutcomes,
      idealAudience,
      deliveryFormat,
      duration,
      price,
      image,
      published,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    if (!description || !expandedDescription) {
      return NextResponse.json(
        { error: "Description and expanded description are required" },
        { status: 400 }
      );
    }

    // @ts-ignore - Course model will be available after Prisma client regeneration
    const course = await (prisma as any).course.create({
      data: {
        title,
        slug,
        description: description || "",
        expandedDescription: expandedDescription || "",
        keyOutcomes: keyOutcomes || [],
        idealAudience: idealAudience || "",
        deliveryFormat: deliveryFormat || "Workshop / Custom",
        duration: duration || "Customizable",
        price: price || "On request",
        image: image || null,
        published: published || false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);

    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A course with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}

