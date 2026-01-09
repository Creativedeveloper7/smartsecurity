"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewGalleryImagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useFileUpload, setUseFileUpload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    order: 0,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setImagePreview("");
      setUploadSuccess(false);
      return;
    }

    setError("");
    setUploadSuccess(false);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${fileSizeMB}MB) exceeds the 50MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload?type=gallery", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setImagePreview(data.url);
      setUploadSuccess(true);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setUploadSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.title || !formData.imageUrl) {
      setError("Title and image are required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          imageUrl: formData.imageUrl.trim(),
          order: parseInt(String(formData.order)) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create gallery image");
      }

      router.push("/admin/gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the gallery image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/gallery"
              className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
            >
              ← Back to Gallery
            </Link>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
              Add Gallery Image
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Image title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Short description (optional)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Image *
            </label>
            
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseFileUpload(true);
                  setError("");
                  setUploadSuccess(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
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
                onClick={() => {
                  setUseFileUpload(false);
                  setError("");
                  setUploadSuccess(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
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
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  ref={fileInputRef}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] file:mr-4 file:rounded-lg file:border-0 file:bg-[#007CFF] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0066CC] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20 disabled:opacity-50"
                />
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
              </div>
            ) : (
              <input
                type="url"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                placeholder="https://example.com/image.jpg"
              />
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
                      setFormData((prev) => ({ ...prev, imageUrl: "" }));
                      setImagePreview("");
                      setUploadSuccess(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
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

          {/* Order */}
          <div>
            <label htmlFor="order" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Display Order
            </label>
            <input
              id="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-[#4A5768]">
              Lower numbers appear first. Leave as 0 for default ordering.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Gallery Image"}
            </button>
            <Link
              href="/admin/gallery"
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

