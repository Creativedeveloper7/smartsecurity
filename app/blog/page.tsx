"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  categories: Array<{ id: string; name: string; slug: string }>;
  views: number;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Base URL for resolving relative image paths (works in browser only)
  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL || "";
  }, []);

  // Constant limit - don't include in dependencies
  const ARTICLES_PER_PAGE = 9;

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    // If it's already a full URL (http/https), return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If it starts with /, it's a relative path from the public folder
    if (url.startsWith("/")) {
      return `${baseUrl}${url}`;
    }
    // Otherwise, assume it's a relative path and prepend /
    return `${baseUrl}/${url}`;
  };

  // Fetch articles and categories
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("limit", ARTICLES_PER_PAGE.toString());
        params.set("page", page.toString());
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);

        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(`/api/articles?${params.toString()}`, { signal: controller.signal }),
          fetch("/api/categories", { signal: controller.signal }),
        ]);

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        // Handle errors gracefully
        if (articlesData.error) {
          console.warn("API returned error:", articlesData.error);
          setArticles([]);
          setPagination({ page: 1, limit: ARTICLES_PER_PAGE, totalPages: 1, total: 0 });
          // Don't set error state for database issues - just show empty state
          if (articlesData.error !== "Database connection failed") {
            setError(articlesData.message || "Failed to load articles");
          }
        } else {
          setArticles(articlesData.articles || []);
          setPagination(articlesData.pagination || { page: 1, limit: ARTICLES_PER_PAGE, totalPages: 1, total: 0 });
        }

        // Handle categories - if error, just use empty array
        if (categoriesData.error) {
          console.warn("Categories API returned error:", categoriesData.error);
          setCategories([{ name: "All", slug: "all" }]);
        } else {
          setCategories([{ name: "All", slug: "all" }, ...(categoriesData || [])]);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching data:", err);
        setArticles([]);
        setPagination({ page: 1, limit: ARTICLES_PER_PAGE, totalPages: 1, total: 0 });
        setCategories([{ name: "All", slug: "all" }]);
        // Only show error for non-network issues
        if (!err.message?.includes("fetch")) {
          setError(err.message || "Failed to load articles");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [page, selectedCategory, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  // Removed modal handlers - articles now open in their own pages

  // Calculate reading time (rough estimate: 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Articles already filtered server-side; keep as-is
  const filteredArticles = articles;

  // Pagination controls (compact, accessible)
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const maxButtons = 5;
    const start = Math.max(1, pagination.page - 2);
    const end = Math.min(pagination.totalPages, start + maxButtons - 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="mt-10 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={pagination.page === 1}
          className="rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded-md px-3 py-2 text-sm ${
              p === pagination.page
                ? "bg-[#0A1A33] text-white"
                : "border border-transparent text-[#1F2937] hover:border-[#E5E7EB] hover:bg-[#F3F4F6]"
            }`}
            aria-current={p === pagination.page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          disabled={pagination.page === pagination.totalPages}
          className="rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-[#4A5768]">Loading articles...</p>
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
      <div className="min-h-screen bg-[#F7F8FA] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <h1 className="text-2xl font-heading font-bold text-[#0A1A33] sm:text-3xl">
              Articles & Insights
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768] sm:text-base">
              Expert analysis and professional insights on security, criminal justice, and law enforcement
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? "bg-[#007CFF] text-white"
                    : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative mx-auto block w-full max-w-md">
              <input
                type="text"
                placeholder="Search articles..."
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

          {/* Search Results Count */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4A5768]">
            <div>
              {pagination.total} article{pagination.total !== 1 ? "s" : ""} • Page {pagination.page} of {pagination.totalPages}
            </div>
            {searchQuery && (
              <div>
                Found {filteredArticles.length} matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => {
                const readingTime = calculateReadingTime(article.content);
                const publishedDate = article.publishedAt
                  ? new Date(article.publishedAt)
                  : null;
                const primaryCategory = article.categories[0]?.name || "Uncategorized";
                const imageUrl = resolveImageUrl(article.featuredImage);

                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group w-full rounded-xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007CFF] hover:shadow-lg block"
                  >
                    {/* Featured Image */}
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          onError={(e) => {
                            // Hide image on error and show placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector(".image-placeholder")) {
                              const placeholder = document.createElement("div");
                              placeholder.className = "image-placeholder flex h-full items-center justify-center";
                              placeholder.innerHTML = '<span class="text-white/50">Article Image</span>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-white/50">Article Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      {/* Category Tag */}
                      <span className="inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#005B6E]">
                        {primaryCategory}
                      </span>

                      {/* Title */}
                      <h2 className="text-base font-heading font-semibold leading-snug text-[#0F172A] transition-colors group-hover:text-[#007CFF] lg:text-lg">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-sm leading-relaxed text-[#4A5768] line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      {publishedDate && (
                        <div className="flex items-center gap-4 text-xs font-medium text-[#4A5768]">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-calendar fa-text"></i>
                            {publishedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-clock fa-text"></i>
                            {readingTime} min read
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-sm font-semibold text-[#007CFF]">
                        Read more
                        <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <i className="fa-solid fa-magnifying-glass fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
              <p className="text-sm text-[#4A5768]">
                No articles found matching your search criteria.
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

          {renderPagination()}
        </div>
      </div>
    </>
  );
}
