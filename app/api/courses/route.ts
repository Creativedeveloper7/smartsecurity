import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const published = searchParams.get('published');
  
  console.log("📥 [GET /api/courses]", {
    search,
    published,
    timestamp: new Date().toISOString(),
  });

  try {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (published !== null) {
      where.published = published === 'true';
    }

    // @ts-ignore - Course model will be available after Prisma client regeneration
    const courses = await (prisma as any).course.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ [GET /api/courses] Found ${courses.length} courses`);
    
    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("❌ [GET /api/courses] Error:", {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log("📥 [POST /api/courses]", {
      title: data.title,
      timestamp: new Date().toISOString(),
    });

    // @ts-ignore - Course model will be available after Prisma client regeneration
    const course = await (prisma as any).course.create({
      data: {
        ...data,
        keyOutcomes: data.keyOutcomes || [],
      },
    });

    console.log("✅ [POST /api/courses] Course created", {
      id: course.id,
      title: course.title,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/courses] Error:", {
      message: error.message,
      code: error.code,
    });

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create course",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
