import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
// @ts-ignore - module resolution is available at runtime
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

// Fallback to local filesystem if Supabase is not configured
const USE_LOCAL_STORAGE = !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (USE_LOCAL_STORAGE) {
      console.log("📁 Using local filesystem storage (Supabase not configured)");
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

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `File size (${fileSizeMB}MB) exceeds the 50MB limit` },
        { status: 400 }
      );
    }

    // Generate unique filename/path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;

    // Use local storage if Supabase is not configured
    if (USE_LOCAL_STORAGE) {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      
      // Ensure uploads directory exists
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error: any) {
        if (error.code !== "EEXIST") {
          console.error("Error creating uploads directory:", error);
          throw error;
        }
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file to disk
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      // Return public URL
      const publicUrl = `/uploads/${fileName}`;
      
      console.log("✅ File uploaded to local storage:", {
        path: filePath,
        url: publicUrl,
        size: file.size,
      });

      return NextResponse.json({
        success: true,
        url: publicUrl,
        path: fileName,
        bucket: "local",
      });
    }

    // Use Supabase Storage
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const path = `articles/${fileName}`;

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

    // Allow for cases where Supabase might not return a public URL
    let publicUrl: string | undefined = publicData?.publicUrl;

    // Fallback: generate a signed URL (valid 30 days) if public URL isn't available
    if (!publicUrl) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 30);
      
      if (signedError) {
        console.error("Failed to create signed URL:", signedError);
      }
      
      publicUrl = signedData?.signedUrl ?? publicUrl;
    }

    // Final check - if we still don't have a URL, return an error
    if (!publicUrl) {
      console.error("Failed to get any URL for uploaded file:", path);
      return NextResponse.json(
        { error: "File uploaded but failed to generate accessible URL. Please check Supabase storage configuration." },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded successfully:", {
      path,
      url: publicUrl,
      bucket: SUPABASE_STORAGE_BUCKET,
    });

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

