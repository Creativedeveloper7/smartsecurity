"use client";

import { useState, useEffect, useRef } from "react";

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

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  order: number;
  createdAt: Date | string;
}

const videoCategories = ["All", "Podcast", "Interview"];

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<"videos" | "gallery">("videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [showCustomPlay, setShowCustomPlay] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch both videos and gallery images
        const [videosRes, galleryRes] = await Promise.all([
          fetch("/api/videos"),
          fetch("/api/gallery"),
        ]);

        const videosData = await videosRes.json();
        const galleryData = await galleryRes.json();
        
        // Handle videos
        if (videosData.error) {
          console.warn("API returned error:", videosData.error);
          setVideos([]);
        } else {
          setVideos(videosData.videos || []);
        }

        // Handle gallery images
        if (galleryData.error) {
          console.warn("Gallery API returned error:", galleryData.error);
          setGalleryImages([]);
        } else {
          setGalleryImages(galleryData.images || []);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setVideos([]);
        setGalleryImages([]);
        if (!err.message?.includes("fetch")) {
          setError(err.message || "Failed to load content");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setVideoReady(false);
    setShowCustomPlay(true); // Show custom play button initially
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    // Pause video if playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsModalOpen(false);
    setSelectedVideo(null);
    setVideoReady(false);
    setShowCustomPlay(false);
    document.body.style.overflow = "unset";
  };

  // Handle custom play button click for mobile
  const handleCustomPlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setShowCustomPlay(false); // Hide custom button once playing
      console.log('Custom play button triggered video playback');
    } catch (error) {
      console.error('Failed to play video:', error);
    }
  };


  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const filteredGalleryImages = galleryImages.filter((image) => {
    return (
      searchQuery === "" ||
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.description && image.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

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
              Videos and Gallery
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
              Watch interviews, podcasts, webinars, and browse our gallery
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center gap-4">
            <button
              onClick={() => {
                setActiveTab("videos");
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "videos"
                  ? "bg-[#007CFF] text-white"
                  : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => {
                setActiveTab("gallery");
                setSearchQuery("");
              }}
              className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "gallery"
                  ? "bg-[#007CFF] text-white"
                  : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
              }`}
            >
              Gallery
            </button>
          </div>

          {/* Filters */}
          {activeTab === "videos" && (
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
                  <i className="fa-solid fa-magnifying-glass fa-text absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5768]"></i>
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
          )}

          {activeTab === "gallery" && (
            <div className="mb-8">
              {/* Search Bar */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Search gallery images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 pl-10 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  />
                  <i className="fa-solid fa-magnifying-glass fa-text absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5768]"></i>
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
          )}

          {/* Videos Grid */}
          {activeTab === "videos" && (
            <>
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
                          <i className="fa-solid fa-clock fa-text mr-1"></i>
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
                          <i className="fa-solid fa-eye fa-text"></i>
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
                  <i className="fa-solid fa-video fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
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
            </>
          )}

          {/* Gallery Grid */}
          {activeTab === "gallery" && (
            <>
              {filteredGalleryImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredGalleryImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleImageClick(image)}
                      className="group w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-[#F3F4F6]">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors line-clamp-1">
                          {image.title}
                        </h3>
                        {image.description && (
                          <p className="text-xs leading-relaxed text-[#4A5768] line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <i className="fa-solid fa-images fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
                  <p className="text-sm text-[#4A5768]">
                    {searchQuery
                      ? "No gallery images found matching your search."
                      : "No gallery images available."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 text-sm text-[#007CFF] hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
          onClick={(e) => {
            // Only close if clicking the backdrop itself
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative my-8 w-full max-w-4xl rounded-lg bg-white shadow-2xl">
            {/* Close Button - positioned to not interfere with video */}
            <button
              onClick={closeModal}
              className="absolute right-2 top-2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-colors hover:bg-black/90"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-sm"></i>
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
                    <i className="fa-solid fa-eye fa-text"></i>
                    {selectedVideo.views.toLocaleString()} views
                  </div>
                  {selectedVideo.duration && (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-clock fa-text"></i>
                      {formatDuration(selectedVideo.duration)}
                    </div>
                  )}
                  {selectedVideo.createdAt && (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-calendar fa-text"></i>
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
              <div className="p-4 sm:p-8">
                {selectedVideo.youtubeUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl)}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : selectedVideo.uploadUrl ? (
                  <div className="relative w-full">
                    <video
                      ref={videoRef}
                      src={selectedVideo.uploadUrl}
                      controls
                      playsInline
                      webkit-playsinline
                      x5-playsinline
                      x-webkit-airplay="allow"
                      preload="auto"
                      className="w-full h-auto rounded-lg bg-black"
                      style={{ 
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      onPlay={() => {
                        console.log('Video started playing');
                        setVideoReady(true);
                        setShowCustomPlay(false);
                      }}
                      onPause={() => {
                        console.log('Video paused');
                        setShowCustomPlay(true);
                      }}
                      onLoadedMetadata={() => {
                        console.log('Video metadata loaded');
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          setVideoReady(true);
                        }
                      }}
                      onCanPlay={() => {
                        console.log('Video can play');
                        setVideoReady(true);
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        const video = e.target as HTMLVideoElement;
                        console.error('Video error details:', {
                          error: video.error,
                          networkState: video.networkState,
                          readyState: video.readyState,
                          src: video.src
                        });
                      }}
                      onLoadStart={() => {
                        console.log('Video load started');
                      }}
                      onProgress={() => {
                        console.log('Video loading progress');
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Video element clicked');
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        console.log('Video element touched');
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Custom play button for mobile fallback */}
                    {showCustomPlay && videoReady && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleCustomPlay();
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleCustomPlay();
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
                        style={{ 
                          zIndex: 5,
                          pointerEvents: 'auto'
                        }}
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <i className="fa-solid fa-play fa-text text-2xl text-[#007CFF] ml-1"></i>
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center rounded-lg bg-black text-white">
                    <p>No video source available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="relative my-8 w-full max-w-4xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-xl"></i>
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Image */}
              <div className="w-full overflow-hidden bg-black">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Image Info */}
              <div className="border-t border-[#E5E7EB] bg-white p-8">
                <h1 className="mb-2 text-xl font-heading font-bold leading-tight text-[#0A1A33]">
                  {selectedImage.title}
                </h1>
                {selectedImage.description && (
                  <p className="mb-4 text-sm leading-relaxed text-[#4A5768]">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-[#4A5768]">
                  <i className="fa-solid fa-calendar fa-text"></i>
                  {new Date(selectedImage.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
