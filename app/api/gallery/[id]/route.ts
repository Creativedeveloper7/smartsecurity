import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// PUT - Update a gallery image
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
    const { title, description, imageUrl, order } = body;

    // Check if image exists
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!existingImage) {
      return NextResponse.json(
        { error: "Gallery image not found" },
        { status: 404 }
      );
    }

    const updatedImage = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(order !== undefined && { order: order }),
      },
    });

    return NextResponse.json(updatedImage);
  } catch (error: any) {
    console.error("❌ [PUT /api/gallery/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gallery image" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a gallery image
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

    // Check if image exists
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existingImage) {
      return NextResponse.json(
        { error: "Gallery image not found" },
        { status: 404 }
      );
    }

    await prisma.galleryImage.delete({
      where: { id },
    });

    console.log("✅ [DELETE /api/gallery/[id]] Gallery image deleted:", {
      id,
      title: existingImage.title,
    });

    return NextResponse.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ [DELETE /api/gallery/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}

