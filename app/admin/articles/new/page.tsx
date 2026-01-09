"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    published: false,
    categoryIds: [] as string[],
  });

  // Available categories (you can fetch these from API if needed)
  const availableCategories = [
    { id: "security", name: "Security", slug: "security" },
    { id: "intelligence", name: "Intelligence", slug: "intelligence" },
    { id: "protection", name: "Protection", slug: "protection" },
    { id: "criminal-justice", name: "Criminal Justice", slug: "criminal-justice" },
  ];

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  // Debug: Log when featuredImage changes
  useEffect(() => {
    console.log("🔄 formData.featuredImage changed:", formData.featuredImage || "(empty)");
  }, [formData.featuredImage]);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 File input changed", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected - files array:", e.target.files);
      setError("No file selected. Please choose an image file.");
      return;
    }
    console.log("📄 File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).";
      console.error("❌ Invalid file type:", file.type);
      setError(errorMsg);
      setUploadingImage(false);
      return;
    }

    // Validate file size (50MB - increased to accommodate larger images)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      const errorMsg = `File size (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit. Please choose a smaller image or compress it.`;
      console.error("❌ File too large:", { 
        fileName: file.name,
        fileSize: file.size, 
        fileSizeMB,
        maxSize, 
        maxSizeMB 
      });
      setError(errorMsg);
      setUploadingImage(false);
      // Clear the file input
      const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      return;
    }
    
    console.log("✅ File size check passed:", {
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      maxSizeMB: (maxSize / (1024 * 1024)).toFixed(0),
    });

    console.log("✅ File validation passed, starting upload...");
    setUploadingImage(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload?type=articles", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      console.log("📤 Image upload response:", data);
      
      if (!data.url) {
        console.error("❌ No URL in response:", data);
        throw new Error("Upload succeeded but no URL was returned. Response: " + JSON.stringify(data));
      }
      
      const imageUrl = data.url;
      console.log("✅ Setting featuredImage to:", imageUrl);
      
      // Use functional update to ensure we're using the latest state
      setFormData((prev) => {
        const updated = { ...prev, featuredImage: imageUrl };
        console.log("📝 Updated formData:", {
          before: prev.featuredImage || "(empty)",
          after: updated.featuredImage,
        });
        return updated;
      });
      
      setImagePreview(imageUrl);
      setUploadSuccess(true);
      console.log("✅ Image preview and formData updated. Current state:", imageUrl);
      
      // Show success message
      setError(""); // Clear any previous errors
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("❌ Image upload error:", err);
      setError(err.message || "Failed to upload image");
      setUploadSuccess(false);
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, featuredImage: url }));
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate that if image was uploaded, it's still in formData
    if (imagePreview && !formData.featuredImage) {
      console.error("❌ Image preview exists but featuredImage is empty!", {
        imagePreview,
        featuredImage: formData.featuredImage,
      });
      setError("Image was uploaded but URL is missing. Please upload the image again.");
      setLoading(false);
      return;
    }
    
    // Warn if trying to submit without an image (but allow it)
    if (!formData.featuredImage) {
      console.warn("⚠️ Submitting article without featured image");
      const confirmSubmit = window.confirm(
        "You're submitting without a featured image. The article will be created but won't have a preview image. Continue?"
      );
      if (!confirmSubmit) {
        setLoading(false);
        return;
      }
    }

    try {
      // First, get or create categories
      const categoryPromises = formData.categoryIds.map(async (categorySlug) => {
        try {
          // Try to find existing category
          const response = await fetch(`/api/categories?slug=${categorySlug}`);
          if (response.ok) {
            const data = await response.json();
            if (data.id) {
              return data.id;
            }
          }
          // If not found, create it
          const categoryName = availableCategories.find((c) => c.slug === categorySlug)?.name || categorySlug;
          const createResponse = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: categoryName,
              slug: categorySlug,
            }),
          });
          if (createResponse.ok) {
            const newCategory = await createResponse.json();
            return newCategory.id;
          }
        } catch (err) {
          console.error(`Error processing category ${categorySlug}:`, err);
        }
        return null;
      });

      const categoryIds = (await Promise.all(categoryPromises)).filter((id) => id !== null) as string[];

      // Create article
      console.log("📋 Current formData before submission:", {
        title: formData.title,
        featuredImage: formData.featuredImage || "(empty)",
        hasFeaturedImage: !!formData.featuredImage,
        imagePreview: imagePreview || "(no preview)",
      });
      
      const articlePayload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage && formData.featuredImage.trim() !== "" ? formData.featuredImage.trim() : null,
        published: formData.published,
        categories: categoryIds,
      };
      
      console.log("📤 Submitting article with featuredImage:", articlePayload.featuredImage || "(not set)");
      
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articlePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create article");
      }

      const article = await response.json();
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Articles
              </Link>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Create New Article
              </h1>
            </div>
          </div>
        </div>
      </header>

          <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && formData.featuredImage && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-600">
            <p className="font-semibold">Debug Info:</p>
            <p>Featured Image URL: {formData.featuredImage}</p>
            <p>Image Preview: {imagePreview || "Not set"}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Enter article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="article-slug"
            />
            <p className="mt-1 text-xs text-[#4A5768]">
              URL-friendly version of the title (auto-generated, but you can edit)
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Brief summary of the article"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Content *
            </label>
            <textarea
              id="content"
              rows={15}
              required
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20 font-mono"
              placeholder="Enter article content (HTML supported)"
            />
            <p className="mt-1 text-xs text-[#4A5768]">
              You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;)
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Featured Image {formData.featuredImage && <span className="text-green-600">✓ Set</span>}
            </label>
            <p className="mb-3 text-xs text-[#4A5768]">
              {useFileUpload 
                ? "Click 'Choose File' to upload an image from your computer"
                : "Enter a full image URL (e.g., https://example.com/image.jpg)"}
            </p>
            
            {/* Toggle between file upload and URL */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setUseFileUpload(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  useFileUpload
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setUseFileUpload(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  !useFileUpload
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                Use URL
              </button>
            </div>

            {useFileUpload ? (
              <div>
                <label htmlFor="fileUpload" className="block">
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileUpload}
                    onClick={(e) => {
                      console.log("🖱️ File input clicked");
                      (e.target as HTMLInputElement).value = ""; // Reset to allow re-selecting same file
                    }}
                    disabled={uploadingImage}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] file:mr-4 file:rounded-lg file:border-0 file:bg-[#007CFF] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0066CC] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20 disabled:opacity-50 cursor-pointer"
                  />
                </label>
                {uploadingImage && (
                  <p className="mt-2 text-xs text-[#4A5768]">Uploading image...</p>
                )}
                {uploadSuccess && (
                  <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-2">
                    <p className="text-xs font-medium text-green-700">
                      ✓ Image uploaded successfully!
                    </p>
                  </div>
                )}
                {formData.featuredImage && !uploadingImage && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-green-600">
                      ✓ Image URL saved: {formData.featuredImage.substring(0, 60)}...
                    </p>
                  </div>
                )}
                {!formData.featuredImage && !uploadingImage && !uploadSuccess && (
                  <p className="mt-2 text-xs text-[#4A5768]">
                    No image uploaded yet. Please select an image file.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  id="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={handleImageUrlChange}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.featuredImage && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Image URL set: {formData.featuredImage.substring(0, 50)}...
                  </p>
                )}
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-[#1F2937]">Preview:</p>
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={() => setImagePreview("")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, featuredImage: "" }));
                      setImagePreview("");
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove image"
                  >
                    <i className="fa-solid fa-xmark fa-text"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Categories
            </label>
            <div className="flex flex-wrap gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.slug)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    formData.categoryIds.includes(category.slug)
                      ? "bg-[#007CFF] text-white"
                      : "bg-white border border-[#E5E7EB] text-[#2D3748] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 rounded border-[#E5E7EB] text-[#007CFF] focus:ring-2 focus:ring-[#007CFF]/20"
            />
            <label htmlFor="published" className="text-sm font-medium text-[#1F2937]">
              Publish immediately
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Article"}
            </button>
            <Link
              href="/admin/articles"
              className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-base font-medium text-[#2D3748] transition-all hover:bg-[#F3F4F6]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

