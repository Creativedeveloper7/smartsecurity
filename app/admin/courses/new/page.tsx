"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrlInput, setUseUrlInput] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keyOutcomes, setKeyOutcomes] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    expandedDescription: "",
    idealAudience: "",
    deliveryFormat: "Workshop / Custom",
    duration: "Customizable",
    price: "On request",
    image: "",
    published: false,
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, WebP, GIF are allowed.");
        setSelectedFile(null);
        setImagePreview(null);
        return;
      }
      if (file.size > maxSize) {
        setError("File size exceeds 5MB limit.");
        setSelectedFile(null);
        setImagePreview(null);
        return;
      }

      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return null;

    setUploadingImage(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload?type=courses", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image upload failed.");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      setUploadingImage(false);
      setSelectedFile(null);
      return data.url;
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
      setUploadingImage(false);
      return null;
    }
  };

  const addKeyOutcome = () => {
    setKeyOutcomes([...keyOutcomes, ""]);
  };

  const removeKeyOutcome = (index: number) => {
    setKeyOutcomes(keyOutcomes.filter((_, i) => i !== index));
  };

  const updateKeyOutcome = (index: number, value: string) => {
    const updated = [...keyOutcomes];
    updated[index] = value;
    setKeyOutcomes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalImageUrl = formData.image;

      if (selectedFile && !useUrlInput) {
        const uploadedUrl = await handleUpload();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      const filteredOutcomes = keyOutcomes.filter((outcome) => outcome.trim() !== "");

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: finalImageUrl,
          keyOutcomes: filteredOutcomes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create course");
      }

      router.push("/admin/courses");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the course");
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
                href="/admin/courses"
                className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Courses
              </Link>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Create New Course
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Course Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Enter course title"
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
              placeholder="course-slug"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Brief Description *
            </label>
            <textarea
              id="description"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Brief description shown in course listing"
            />
          </div>

          {/* Expanded Description */}
          <div>
            <label htmlFor="expandedDescription" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Expanded Description *
            </label>
            <textarea
              id="expandedDescription"
              rows={6}
              required
              value={formData.expandedDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, expandedDescription: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Detailed course description"
            />
          </div>

          {/* Key Outcomes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Key Outcomes *
            </label>
            {keyOutcomes.map((outcome, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateKeyOutcome(index, e.target.value)}
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  placeholder={`Outcome ${index + 1}`}
                />
                {keyOutcomes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyOutcome(index)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <i className="fa-solid fa-xmark fa-text"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addKeyOutcome}
              className="mt-2 text-sm text-[#007CFF] hover:underline"
            >
              + Add Outcome
            </button>
          </div>

          {/* Ideal Audience */}
          <div>
            <label htmlFor="idealAudience" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Ideal Audience *
            </label>
            <textarea
              id="idealAudience"
              rows={3}
              required
              value={formData.idealAudience}
              onChange={(e) => setFormData((prev) => ({ ...prev, idealAudience: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Who should take this course?"
            />
          </div>

          {/* Delivery Format, Duration, Price */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="deliveryFormat" className="mb-2 block text-sm font-medium text-[#1F2937]">
                Delivery Format
              </label>
              <input
                id="deliveryFormat"
                type="text"
                value={formData.deliveryFormat}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryFormat: e.target.value }))}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                placeholder="Workshop / Custom"
              />
            </div>
            <div>
              <label htmlFor="duration" className="mb-2 block text-sm font-medium text-[#1F2937]">
                Duration
              </label>
              <input
                id="duration"
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                placeholder="2-3 days"
              />
            </div>
            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium text-[#1F2937]">
                Price
              </label>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                placeholder="On request"
              />
            </div>
          </div>

          {/* Course Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Course Image
            </label>
            
            {/* Toggle between URL and file upload */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setUseUrlInput(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  useUrlInput
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                Use Image URL
              </button>
              <button
                type="button"
                onClick={() => setUseUrlInput(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  !useUrlInput
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                Upload Image
              </button>
            </div>

            {!useUrlInput ? (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[#2D3748] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F3F4F6] file:text-[#0A1A33] hover:file:bg-[#E5E7EB]"
                />
                {imagePreview && (
                  <div className="mt-4 relative w-48 h-32 rounded-lg overflow-hidden border border-[#E5E7EB]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                        setFormData((prev) => ({ ...prev, image: "" }));
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-red-600 hover:text-red-800"
                    >
                      <i className="fa-solid fa-xmark fa-text text-xs"></i>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                placeholder="https://example.com/image.jpg"
              />
            )}
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
              Publish course (make it visible on frontend)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
            <Link
              href="/admin/courses"
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

