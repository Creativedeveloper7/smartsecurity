// app/api/courses/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("Received request for course ID:", id);
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error("Invalid course ID:", id);
      return NextResponse.json(
        { error: "Valid course ID is required" },
        { status: 400 }
      );
    }
    
    const trimmedId = id.trim();

    console.log("Looking up course with ID/slug:", trimmedId);
    
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: trimmedId },
          { slug: trimmedId }
        ]
      },
    });
    
    console.log("Found course:", course);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch course",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}