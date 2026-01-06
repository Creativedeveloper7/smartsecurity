"use client";

import { useState, useEffect, useMemo } from "react";

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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url}`;
  };

  // Fetch articles and categories
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("limit", pagination.limit.toString());
        params.set("page", page.toString());
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery) params.set("search", searchQuery);

        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(`/api/articles?${params.toString()}`, { signal: controller.signal }),
          fetch("/api/categories", { signal: controller.signal }),
        ]);

        if (!articlesRes.ok) throw new Error("Failed to fetch articles");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        setArticles(articlesData.articles || []);
        setPagination(articlesData.pagination || { page: 1, limit: 9, totalPages: 1, total: 0 });
        setCategories([{ name: "All", slug: "all" }, ...(categoriesData || [])]);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load articles");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [page, selectedCategory, searchQuery, pagination.limit]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  const handleArticleClick = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = "unset";
  };

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

  // Get related articles (exclude current article, same category preferred)
  const getRelatedArticles = (currentArticle: Article) => {
    const currentCategorySlugs = currentArticle.categories.map((c) => c.slug);
    return articles
      .filter((article) => {
        if (article.id === currentArticle.id) return false;
        // Prefer articles with matching categories
        return article.categories.some((cat) => currentCategorySlugs.includes(cat.slug));
      })
      .slice(0, 3);
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
                  <button
                    key={article.id}
                    onClick={(e) => handleArticleClick(e, article)}
                    className="group w-full rounded-xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007CFF] hover:shadow-lg"
                  >
                    {/* Featured Image */}
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
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
                            <i className="fa-regular fa-calendar fa-text"></i>
                            {publishedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-regular fa-clock fa-text"></i>
                            {readingTime} min read
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-sm font-semibold text-[#007CFF]">
                        Read more
                        <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <i className="fa-regular fa-magnifying-glass fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
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

      {/* Article Modal */}
      {isModalOpen && selectedArticle && (
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
              {/* Article Header */}
              <div className="border-b border-[#E5E7EB] bg-white p-8 space-y-3">
                {selectedArticle.categories.length > 0 && (
                  <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
                    {selectedArticle.categories[0].name}
                  </span>
                )}
                <h1 className="text-2xl font-heading font-bold leading-tight text-[#0A1A33] sm:text-3xl">
                  {selectedArticle.title}
                </h1>
                {selectedArticle.publishedAt && (
                  <div className="flex flex-wrap items-center gap-6 text-sm text-[#4A5768]">
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar fa-text"></i>
                      {new Date(selectedArticle.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-clock fa-text"></i>
                      {calculateReadingTime(selectedArticle.content)} min read
                    </div>
                    <button className="flex items-center gap-2 hover:text-[#007CFF] transition-colors">
                      <i className="fa-regular fa-share-nodes fa-text"></i>
                      Share
                    </button>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-8">
                {selectedArticle.featuredImage && (
                  <div className="mb-8 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                    <img
                      src={resolveImageUrl(selectedArticle.featuredImage)}
                      alt={selectedArticle.title}
                      className="h-auto w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div
                  className="prose prose-lg max-w-none mb-12 prose-headings:mb-3 prose-p:mb-4 prose-li:mb-2"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  style={{
                    color: "#2D3748",
                    lineHeight: "1.6",
                  }}
                />

                {/* Related Articles Section */}
                {getRelatedArticles(selectedArticle).length > 0 && (
                  <div className="mt-16 border-t border-[#E5E7EB] pt-12">
                    <h2 className="mb-8 text-xl font-heading font-semibold text-[#1F2937]">
                      Related Articles
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {getRelatedArticles(selectedArticle).map((article) => {
                        const readingTime = calculateReadingTime(article.content);
                        const publishedDate = article.publishedAt
                          ? new Date(article.publishedAt)
                          : null;
                        const primaryCategory = article.categories[0]?.name || "Uncategorized";

                        return (
                          <button
                            key={article.id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleArticleClick(e, article);
                              const modalContent = document.querySelector('[class*="max-h-[90vh]"]');
                              if (modalContent) {
                                modalContent.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            className="group w-full text-left rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md cursor-pointer"
                          >
                            <span className="mb-3 inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#005B6E]">
                              {primaryCategory}
                            </span>
                            <h3 className="mb-2 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="mb-4 text-sm leading-relaxed text-[#4A5768] line-clamp-3">
                                {article.excerpt}
                              </p>
                            )}
                            {publishedDate && (
                              <div className="flex items-center gap-4 text-xs text-[#4A5768]">
                                <div className="flex items-center gap-1">
                                  <i className="fa-regular fa-calendar fa-text"></i>
                                  {publishedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <i className="fa-regular fa-clock fa-text"></i>
                                  {readingTime} min
                                </div>
                              </div>
                            )}
                            <div className="mt-4 flex items-center text-xs font-medium text-[#007CFF] opacity-0 group-hover:opacity-100 transition-opacity">
                              Read Article
                              <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
