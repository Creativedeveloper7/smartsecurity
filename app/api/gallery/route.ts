import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET - Fetch all gallery images
export async function GET(request: Request) {
  try {
    const galleryImages = await prisma.galleryImage.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ images: galleryImages });
  } catch (error: any) {
    console.error("❌ [GET /api/gallery] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images", images: [] },
      { status: 500 }
    );
  }
}

// POST - Create a new gallery image
export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, description, imageUrl, order } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const galleryImage = await prisma.galleryImage.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl.trim(),
        order: order || 0,
      },
    });

    console.log("✅ [POST /api/gallery] Gallery image created:", {
      id: galleryImage.id,
      title: galleryImage.title,
    });

    return NextResponse.json(galleryImage, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/gallery] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create gallery image" },
      { status: 500 }
    );
  }
}

