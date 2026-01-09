import { NextResponse } from "next/server";
// @ts-ignore - module resolution is available at runtime
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_VIDEO_BUCKET = "VIDEOS"; // Use the VIDEOS bucket that exists in Supabase

export async function POST(request: Request) {
  try {
    // Validate Supabase configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Supabase configuration missing:", {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return NextResponse.json(
        { 
          error: "Video upload is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
          details: process.env.NODE_ENV === "development" 
            ? "Supabase storage is required for video uploads. Local filesystem is not supported in serverless environments."
            : undefined
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo", // AVI
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files (MP4, WebM, OGG, MOV, AVI) are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit. Please choose a smaller video." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;

    // Use Supabase Storage (required for serverless environments)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine upload type from query parameter or default to 'general'
    const url = new URL(request.url);
    const uploadType = url.searchParams.get("type") || "general";
    
    // Organize videos by type: videos, courses, general
    const validTypes = ["videos", "courses", "general"];
    const folder = validTypes.includes(uploadType) ? uploadType : "general";
    const path = `${folder}/${fileName}`;

    // Ensure bucket exists and is public (no-op if it already exists)
    await supabase.storage
      .createBucket(SUPABASE_VIDEO_BUCKET, { public: true })
      .catch(() => {});

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_VIDEO_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase video upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload video" },
        { status: 500 }
      );
    }

    // Get public URL (requires bucket to be public or use signed URLs)
    const { data: publicData } = supabase.storage
      .from(SUPABASE_VIDEO_BUCKET)
      .getPublicUrl(path);

    // Allow for cases where Supabase might not return a public URL
    let publicUrl: string | undefined = publicData?.publicUrl;

    // Fallback: generate a signed URL (valid 30 days) if public URL isn't available
    if (!publicUrl) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(SUPABASE_VIDEO_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 30);
      
      if (signedError) {
        console.error("Failed to create signed URL:", signedError);
      }
      
      publicUrl = signedData?.signedUrl ?? publicUrl;
    }

    // Final check - if we still don't have a URL, return an error
    if (!publicUrl) {
      console.error("Failed to get any URL for uploaded video:", path);
      return NextResponse.json(
        { error: "Video uploaded but failed to generate accessible URL. Please check Supabase storage configuration." },
        { status: 500 }
      );
    }

    console.log("✅ Video uploaded successfully:", {
      path,
      url: publicUrl,
      bucket: SUPABASE_VIDEO_BUCKET,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      path,
      size: file.size,
      type: file.type,
      bucket: SUPABASE_VIDEO_BUCKET,
    });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload video" },
      { status: 500 }
    );
  }
}

