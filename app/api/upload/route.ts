import { NextResponse } from "next/server";
// @ts-ignore - module resolution is available at runtime
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase env vars missing", {
        hasUrl: !!SUPABASE_URL,
        hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return NextResponse.json(
        { error: "Supabase configuration missing on server" },
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
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate unique filename/path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `articles/${timestamp}_${safeName}`;

    // Ensure bucket exists and is public (no-op if it already exists)
    await supabase.storage
      .createBucket(SUPABASE_STORAGE_BUCKET, { public: true })
      .catch(() => {});

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL (requires bucket to be public or use signed URLs)
    const { data: publicData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    let publicUrl = publicData?.publicUrl;

    // Fallback: generate a signed URL (valid 30 days) if public URL isn't available
    if (!publicUrl) {
      const { data: signedData } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 30);
      publicUrl = signedData?.signedUrl;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      bucket: SUPABASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

