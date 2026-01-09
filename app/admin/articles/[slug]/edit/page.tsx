"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleSlug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Fetch article data on mount
  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleSlug) {
        setError("Article identifier is required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/articles/${articleSlug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const article = await response.json();
        
        // Map categories to category slugs for form
        const categorySlugs = article.categories?.map((cat: any) => cat.slug) || [];
        
        setFormData({
          title: article.title || "",
          slug: article.slug || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          featuredImage: article.featuredImage || "",
          published: article.published || false,
          categoryIds: categorySlugs,
        });
        
        if (article.featuredImage) {
          setImagePreview(article.featuredImage);
        }
      } catch (err: any) {
        console.error("Error fetching article:", err);
        setError(err.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleSlug]);

  // Auto-generate slug from title (only if slug is empty or matches auto-generated pattern)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Only auto-update slug if it's currently empty or matches the old auto-generated pattern
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === "" || prev.slug === autoSlug ? autoSlug : prev.slug,
    }));
  };

  const handleCategoryToggle = (categorySlug: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categorySlug)
        ? prev.categoryIds.filter((id) => id !== categorySlug)
        : [...prev.categoryIds, categorySlug],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected. Please choose an image file.");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds the 50MB limit. Please choose a smaller image.`);
      return;
    }

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
      if (!data.url) {
        throw new Error("Upload succeeded but no URL was returned");
      }

      setFormData((prev) => ({ ...prev, featuredImage: data.url }));
      setImagePreview(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
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
    setSaving(true);
    setError("");

    try {
      // Get or create categories
      const categoryPromises = formData.categoryIds.map(async (categorySlug) => {
        try {
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

      // Update article
      const articlePayload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage && formData.featuredImage.trim() !== "" ? formData.featuredImage.trim() : null,
        published: formData.published,
        categories: categoryIds,
      };

      const response = await fetch(`/api/articles/${articleSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articlePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update article");
      }

      router.push("/admin/articles");
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007CFF] mx-auto mb-4"></div>
          <p className="text-[#4A5768]">Loading article...</p>
        </div>
      </div>
    );
  }

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
                Edit Article
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
              disabled={saving}
              className="rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
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
