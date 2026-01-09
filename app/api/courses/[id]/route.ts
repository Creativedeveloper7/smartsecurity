// app/api/courses/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

// PUT - Update a course
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { title, slug, description, expandedDescription, idealAudience, deliveryFormat, duration, price, image, published, keyOutcomes } = body;

    const trimmedId = id.trim();

    // Find course by ID or slug
    const existingCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { id: trimmedId },
          { slug: trimmedId }
        ]
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findFirst({
        where: {
          slug,
          NOT: { id: existingCourse.id }
        }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A course with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: existingCourse.id },
      data: {
        title,
        slug,
        description: description || "",
        expandedDescription: expandedDescription || "",
        idealAudience: idealAudience || "",
        deliveryFormat: deliveryFormat || "Workshop / Custom",
        duration: duration || "Customizable",
        price: price || "On request",
        image: image || null,
        published: published || false,
        keyOutcomes: keyOutcomes || [],
      },
    });

    console.log("✅ [PUT /api/courses/[id]] Course updated:", {
      id: existingCourse.id,
      title: updatedCourse.title,
      slug: updatedCourse.slug,
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error: any) {
    console.error("❌ [PUT /api/courses/[id]] Error:", error);
    
    // Handle unique constraint violation (duplicate slug)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A course with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const trimmedId = id.trim();

    // Find course by ID or slug
    const existingCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { id: trimmedId },
          { slug: trimmedId }
        ]
      },
      select: { id: true, title: true },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id: existingCourse.id },
    });

    console.log("✅ [DELETE /api/courses/[id]] Course deleted:", {
      id: existingCourse.id,
      title: existingCourse.title,
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ [DELETE /api/courses/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}