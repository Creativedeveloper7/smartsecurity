"use client";

import { useState, useEffect } from "react";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string | null;
  uploadUrl: string | null;
  thumbnail: string | null;
  duration: number | null;
  category: string;
  views: number;
  createdAt: Date | string;
}

const videoCategories = ["All", "Podcast", "Interview", "Reel", "Webinar", "Speech"];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/videos");
        const data = await response.json();
        
        // Handle both success and error responses gracefully
        if (data.error) {
          console.warn("API returned error:", data.error);
          setVideos([]);
          // Don't set error state for database issues - just show empty state
          if (data.error !== "Database connection failed") {
            setError(data.message || "Failed to load videos");
          }
        } else {
          setVideos(data.videos || []);
        }
      } catch (err: any) {
        console.error("Error fetching videos:", err);
        setVideos([]);
        // Only show error for non-network issues
        if (!err.message?.includes("fetch")) {
          setError(err.message || "Failed to load videos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return "";
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    document.body.style.overflow = "unset";
  };

  const filteredVideos = videos.filter((video) => {
    const videoCategory = videoCategories.find((cat) => cat.toUpperCase() === video.category);
    const matchesCategory = selectedCategory === "All" || videoCategory === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-[#4A5768]">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
              Videos & Media
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
              Watch interviews, podcasts, webinars, and expert presentations
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {videoCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#007CFF] text-white"
                      : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 pl-10 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                />
                <i className="fa-regular fa-magnifying-glass fa-text absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5768]"></i>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5768] hover:text-[#007CFF] transition-colors"
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark fa-text"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => {
                const categoryLabel = videoCategories.find((cat) => cat.toUpperCase() === video.category) || video.category;
                const thumbnail = video.thumbnail || (video.youtubeUrl ? getYouTubeEmbedUrl(video.youtubeUrl).replace("/embed/", "/vi/") + "/maxresdefault.jpg" : "");

                return (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="group w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <i className="fa-solid fa-play fa-title text-4xl text-white/90 group-hover:text-white transition-colors"></i>
                      </div>
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                          <i className="fa-regular fa-clock fa-text mr-1"></i>
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 rounded bg-[#007CFF] px-2 py-1 text-xs font-medium text-white">
                        {categoryLabel}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-2 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="mb-4 text-sm leading-relaxed text-[#4A5768] line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#4A5768]">
                        <div className="flex items-center gap-1">
                          <i className="fa-regular fa-eye fa-text"></i>
                          {video.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <i className="fa-regular fa-video fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
              <p className="text-sm text-[#4A5768]">
                No videos found matching your criteria.
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 text-sm text-[#007CFF] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative my-8 w-full max-w-4xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-xl"></i>
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Video Header */}
              <div className="border-b border-[#E5E7EB] bg-white p-8">
                <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
                  {videoCategories.find((cat) => cat.toUpperCase() === selectedVideo.category) || selectedVideo.category}
                </span>
                <h1 className="mb-2 text-xl font-heading font-bold leading-tight text-[#0A1A33]">
                  {selectedVideo.title}
                </h1>
                {selectedVideo.description && (
                  <p className="mb-4 text-sm text-[#4A5768]">
                    {selectedVideo.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-6 text-sm text-[#4A5768]">
                  <div className="flex items-center gap-2">
                    <i className="fa-regular fa-eye fa-text"></i>
                    {selectedVideo.views.toLocaleString()} views
                  </div>
                  {selectedVideo.duration && (
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-clock fa-text"></i>
                      {formatDuration(selectedVideo.duration)}
                    </div>
                  )}
                  {selectedVideo.createdAt && (
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar fa-text"></i>
                      {new Date(selectedVideo.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player */}
              <div className="p-8">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                  {selectedVideo.youtubeUrl ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl)}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : selectedVideo.uploadUrl ? (
                    <video
                      src={selectedVideo.uploadUrl}
                      controls
                      className="h-full w-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex h-full items-center justify-center text-white">
                      <p>No video source available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
