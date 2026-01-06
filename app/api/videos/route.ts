import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  console.log("📥 [GET /api/videos]", {
    url: requestUrl.pathname + requestUrl.search,
    category,
    search,
    timestamp: new Date().toISOString(),
  });

  try {

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

    console.log("✅ [GET /api/videos] Success", {
      videosCount: videos.length,
    });

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("❌ [GET /api/videos] Error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      url: requestUrl.pathname + requestUrl.search,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    
    // Check if it's a connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      console.error("🔴 [GET /api/videos] Database connection failed:", {
        errorCode: error.code,
        errorMessage: error.message,
        suggestion: "Check DATABASE_URL in Vercel environment variables",
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
      });
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
  console.log("📥 [POST /api/videos] Request received", {
    timestamp: new Date().toISOString(),
  });

  try {
    const body = await request.json();
    const { title, description, youtubeUrl, uploadUrl, thumbnail, duration, category } = body;

    console.log("📥 [POST /api/videos] Request data:", {
      title,
      hasYoutubeUrl: !!youtubeUrl,
      hasUploadUrl: !!uploadUrl,
      category,
    });

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

    console.log("✅ [POST /api/videos] Video created successfully", {
      videoId: video.id,
      title: video.title,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /api/videos] Error creating video:", {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fullError: process.env.NODE_ENV === "development" ? error : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to create video" },
      { status: 500 }
    );
  }
}

