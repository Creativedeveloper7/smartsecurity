"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function DeleteGalleryImagePage() {
  const router = useRouter();
  const params = useParams();
  const imageId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    // Fetch image details
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/gallery/${imageId}`);
        if (response.ok) {
          const data = await response.json();
          setImage(data);
        }
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    if (imageId) {
      fetchImage();
    }
  }, [imageId]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${image?.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete gallery image");
      }

      router.push("/admin/gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete gallery image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/gallery"
            className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
          >
            ← Back to Gallery
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8">
          <h1 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
            Delete Gallery Image
          </h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {image && (
            <>
              <div className="mb-6">
                <div className="aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#1F2937]">
                  {image.title}
                </h2>
                {image.description && (
                  <p className="mt-2 text-sm text-[#4A5768]">
                    {image.description}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete Image"}
                </button>
                <Link
                  href="/admin/gallery"
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-base font-medium text-[#2D3748] text-center transition-all hover:bg-[#F3F4F6]"
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

