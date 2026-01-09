import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET - Get a single video by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("❌ [GET /api/videos/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// PUT - Update a video
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
    const { title, description, youtubeUrl, uploadUrl, thumbnail, duration, category } = body;

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate that at least one video source is provided
    if (!youtubeUrl && !uploadUrl) {
      return NextResponse.json(
        { error: "Either YouTube URL or Upload URL is required" },
        { status: 400 }
      );
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title,
        description: description || null,
        youtubeUrl: youtubeUrl || null,
        uploadUrl: uploadUrl || null,
        thumbnail: thumbnail || null,
        duration: duration || null,
        category: category ? category.toUpperCase() : existingVideo.category,
      },
    });

    console.log("✅ [PUT /api/videos/[id]] Video updated:", {
      id,
      title: updatedVideo.title,
    });

    return NextResponse.json(updatedVideo);
  } catch (error: any) {
    console.error("❌ [PUT /api/videos/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video
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

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    await prisma.video.delete({
      where: { id },
    });

    console.log("✅ [DELETE /api/videos/[id]] Video deleted:", {
      id,
      title: existingVideo.title,
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ [DELETE /api/videos/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}
