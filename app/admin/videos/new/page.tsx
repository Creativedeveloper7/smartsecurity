"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const videoCategories = [
  { value: "PODCAST", label: "Podcast" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "REEL", label: "Reel" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "SPEECH", label: "Speech" },
];

export default function NewVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"youtube" | "file" | "url">("youtube");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    uploadUrl: "",
    thumbnail: "",
    duration: "",
    category: "PODCAST",
  });

  const extractYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return "";
  };

  const handleYouTubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      youtubeUrl: url,
      thumbnail: getYouTubeThumbnail(url) || prev.thumbnail,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a video file (MP4, WebM, OGG, MOV, or AVI).");
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit. Please choose a smaller video.");
      return;
    }

    setUploadingVideo(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload video");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, uploadUrl: data.url }));
      setVideoPreview(data.url);
      
      // Try to get video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        setFormData((prev) => ({
          ...prev,
          duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
        }));
      };
      video.src = URL.createObjectURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.title) {
        throw new Error("Title is required");
      }

      // Validate that at least one video source is provided
      if (!formData.youtubeUrl && !formData.uploadUrl) {
        throw new Error("Please provide either a YouTube URL or upload a video file");
      }

      // Convert duration from MM:SS or HH:MM:SS to seconds
      let durationInSeconds: number | null = null;
      if (formData.duration) {
        const parts = formData.duration.split(":").map(Number);
        if (parts.length === 2) {
          durationInSeconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
          durationInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }

      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          youtubeUrl: formData.youtubeUrl || null,
          uploadUrl: formData.uploadUrl || null,
          thumbnail: formData.thumbnail || null,
          duration: durationInSeconds,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create video");
      }

      const video = await response.json();
      router.push("/admin/videos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the video");
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
                href="/admin/videos"
                className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Videos
              </Link>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Create New Video
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
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Enter video title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Enter video description"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
            >
              {videoCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Video Source Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Video Source *
            </label>
            
            {/* Toggle between upload methods */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod("youtube");
                  setFormData((prev) => ({ ...prev, uploadUrl: "", youtubeUrl: prev.youtubeUrl }));
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  uploadMethod === "youtube"
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                YouTube URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMethod("file");
                  setFormData((prev) => ({ ...prev, youtubeUrl: "", uploadUrl: prev.uploadUrl }));
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  uploadMethod === "file"
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMethod("url");
                  setFormData((prev) => ({ ...prev, youtubeUrl: "", uploadUrl: prev.uploadUrl }));
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  uploadMethod === "url"
                    ? "bg-[#007CFF] text-white"
                    : "bg-[#F3F4F6] text-[#2D3748] hover:bg-[#E5E7EB]"
                }`}
              >
                External URL
              </button>
            </div>

            {uploadMethod === "youtube" && (
              <div>
                <input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={handleYouTubeUrlChange}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-[#4A5768]">
                  Enter the full YouTube URL. Thumbnail will be auto-generated.
                </p>
                {formData.youtubeUrl && extractYouTubeVideoId(formData.youtubeUrl) && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Valid YouTube URL detected
                  </p>
                )}
              </div>
            )}

            {uploadMethod === "file" && (
              <div>
                <input
                  id="fileUpload"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                  onChange={handleFileUpload}
                  disabled={uploadingVideo}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] file:mr-4 file:rounded-lg file:border-0 file:bg-[#007CFF] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0066CC] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20 disabled:opacity-50"
                />
                {uploadingVideo && (
                  <p className="mt-2 text-xs text-[#4A5768]">Uploading video... This may take a while.</p>
                )}
                {formData.uploadUrl && !uploadingVideo && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Video uploaded: {formData.uploadUrl}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#4A5768]">
                  Supported formats: MP4, WebM, OGG, MOV, AVI (Max 100MB)
                </p>
              </div>
            )}

            {uploadMethod === "url" && (
              <div>
                <input
                  id="uploadUrl"
                  type="url"
                  value={formData.uploadUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, uploadUrl: e.target.value }))}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  placeholder="https://example.com/video.mp4"
                />
                <p className="mt-1 text-xs text-[#4A5768]">
                  Enter URL of video hosted elsewhere (not YouTube)
                </p>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && uploadMethod === "file" && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-[#1F2937]">Preview:</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, uploadUrl: "" }));
                      setVideoPreview("");
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove video"
                  >
                    <i className="fa-solid fa-xmark fa-text"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Preview */}
          {formData.thumbnail && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                Thumbnail Preview
              </label>
              <div className="relative h-48 w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6]">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                  onError={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail: "" }))}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Remove thumbnail"
                >
                  <i className="fa-solid fa-xmark fa-text"></i>
                </button>
              </div>
            </div>
          )}

          {/* Custom Thumbnail URL (optional) */}
          <div>
            <label htmlFor="thumbnail" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Custom Thumbnail URL (optional)
            </label>
            <input
              id="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="mt-1 text-xs text-[#4A5768]">
              Override auto-generated thumbnail with a custom image URL
            </p>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="mb-2 block text-sm font-medium text-[#1F2937]">
              Duration (optional)
            </label>
            <input
              id="duration"
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="MM:SS or HH:MM:SS (e.g., 15:30 or 1:15:30)"
            />
          </div>


          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Video"}
            </button>
            <Link
              href="/admin/videos"
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

