import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const search = searchParams.get("search");
  const published = searchParams.get("published");

  console.log("📥 [GET /api/courses]", {
    url: requestUrl.pathname + requestUrl.search,
    search,
    published,
    timestamp: new Date().toISOString(),
  });

  try {

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

    console.log("✅ [GET /api/courses] Success", {
      coursesCount: courses.length,
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("❌ [GET /api/courses] Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      meta: error.meta,
      url: requestUrl.pathname + requestUrl.search,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
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
  console.log("📥 [POST /api/courses] Request received", {
    timestamp: new Date().toISOString(),
  });

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

    console.log("📥 [POST /api/courses] Request data:", {
      title,
      slug,
      hasDescription: !!description,
      keyOutcomesCount: keyOutcomes?.length || 0,
      published,
    });

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

    console.log("✅ [POST /api/courses] Course created successfully", {
      courseId: course.id,
      slug: course.slug,
      title: course.title,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/courses] Error creating course:", {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });

    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      console.warn("⚠️ [POST /api/courses] Duplicate slug detected");
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

