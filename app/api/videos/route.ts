import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};

    if (category && category !== "All") {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    
    // Check if it's a connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("❌ Database connection failed. Check DATABASE_URL in Vercel environment variables.");
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: "Please check your database configuration",
        },
        { status: 503 }
      );
    }
    
    // Return empty array for other errors
    return NextResponse.json({ videos: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, youtubeUrl, uploadUrl, thumbnail, duration, category } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!youtubeUrl && !uploadUrl) {
      return NextResponse.json(
        { error: "Either YouTube URL or Upload URL is required" },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description || null,
        youtubeUrl: youtubeUrl || null,
        uploadUrl: uploadUrl || null,
        thumbnail: thumbnail || null,
        duration: duration || null,
        category: category ? category.toUpperCase() : "PODCAST",
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create video" },
      { status: 500 }
    );
  }
}

