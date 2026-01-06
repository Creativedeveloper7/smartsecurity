"use client";

import { useState, useEffect } from "react";

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
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch articles and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch("/api/articles?limit=100"),
          fetch("/api/categories"),
        ]);

        if (!articlesRes.ok) throw new Error("Failed to fetch articles");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        setArticles(articlesData.articles || []);
        setCategories(["All", ...categoriesData.map((cat: any) => cat.name)]);
      } catch (err: any) {
        setError(err.message || "Failed to load articles");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Filter articles based on search query and category
  const filteredArticles = articles.filter((article) => {
    const articleCategories = article.categories.map((c) => c.name);
    const matchesCategory =
      selectedCategory === "All" || articleCategories.includes(selectedCategory);
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      articleCategories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
              Articles & Insights
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
              Expert analysis and professional insights on security, criminal justice, and law enforcement
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
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
          {searchQuery && (
            <div className="mb-4 text-center text-sm text-[#4A5768]">
              Found {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} matching &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => {
                const readingTime = calculateReadingTime(article.content);
                const publishedDate = article.publishedAt
                  ? new Date(article.publishedAt)
                  : null;
                const primaryCategory = article.categories[0]?.name || "Uncategorized";

                return (
                  <button
                    key={article.id}
                    onClick={(e) => handleArticleClick(e, article)}
                    className="group w-full rounded-lg border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
                  >
                    {/* Featured Image */}
                    {article.featuredImage ? (
                      <div className="h-48 w-full overflow-hidden rounded-t-lg">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                        <div className="flex h-full items-center justify-center">
                          <span className="text-white/50">Article Image</span>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Category Tag */}
                      <span className="mb-3 inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#005B6E]">
                        {primaryCategory}
                      </span>

                      {/* Title */}
                      <h2 className="mb-2 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="mb-4 text-sm leading-relaxed text-[#4A5768]">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta Info */}
                      {publishedDate && (
                        <div className="flex items-center gap-4 text-xs text-[#4A5768]">
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

                      {/* Read More */}
                      <div className="mt-4 flex items-center text-sm font-medium text-[#007CFF]">
                        Read More
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
              <div className="border-b border-[#E5E7EB] bg-white p-8">
                {selectedArticle.categories.length > 0 && (
                  <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
                    {selectedArticle.categories[0].name}
                  </span>
                )}
                <h1 className="mb-2 text-xl font-heading font-bold leading-tight text-[#0A1A33]">
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
                <div
                  className="prose max-w-none mb-12"
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
