import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { ShareButton } from "./share-button";
import { CommentSection } from "./comment-section";

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

// Format content with proper paragraphs
function formatContent(content: string): string {
  // If content already has HTML tags, return as-is
  if (content.includes("<p>") || content.includes("<div>") || content.includes("<h")) {
    return content;
  }

  // Split by double newlines to create paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter((para) => para.length > 0);

  // Wrap each paragraph in <p> tags
  return paragraphs.map((para) => `<p>${para.replace(/\n/g, "<br />")}</p>`).join("");
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Resolve image URL
function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let article: Article | null = null;

  try {
    // Get the host from headers for absolute URL
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/articles/${slug}`, {
      cache: "no-store",
    });

    if (response.ok) {
      article = await response.json();
    }
  } catch (error) {
    console.error("Error fetching article:", error);
  }

  if (!article) {
    notFound();
  }

  const formattedContent = formatContent(article.content);
  const readingTime = calculateReadingTime(article.content);
  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : null;
  const primaryCategory = article.categories[0]?.name || "Uncategorized";
  const imageUrl = resolveImageUrl(article.featuredImage);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#007CFF] hover:underline"
        >
          <i className="fa-solid fa-arrow-left fa-text"></i>
          Back to Articles
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Tag */}
          {article.categories.length > 0 && (
          <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
              {primaryCategory}
          </span>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-heading font-bold leading-tight text-[#0A1A33] lg:text-4xl">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#4A5768]">
            {publishedDate && (
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-calendar fa-text"></i>
                {publishedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            )}
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock fa-text"></i>
              {readingTime} min read
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-eye fa-text"></i>
              {article.views.toLocaleString()} views
            </div>
            <ShareButton title={article.title} excerpt={article.excerpt || ""} />
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <div className="mb-8 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
            <img
              src={imageUrl}
              alt={article.title}
              className="h-auto w-full object-cover"
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-8 rounded-lg bg-[#F3F4F6] p-6">
            <p className="text-base leading-relaxed text-[#2D3748] italic">{article.excerpt}</p>
        </div>
        )}

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none mb-12
          prose-headings:mb-3 prose-headings:text-[#0A1A33] prose-headings:font-semibold prose-headings:font-heading
          prose-p:mb-5 prose-p:text-[#2D3748] prose-p:leading-relaxed prose-p:text-base
          prose-ul:mb-5 prose-ol:mb-5 prose-li:mb-2
          prose-strong:text-[#0A1A33] prose-strong:font-semibold
          prose-a:text-[#007CFF] prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:border prose-img:border-[#E5E7EB] prose-img:my-8
          prose-blockquote:border-l-4 prose-blockquote:border-[#007CFF] prose-blockquote:pl-4 prose-blockquote:italic
          prose-hr:border-[#E5E7EB]"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Comment Section */}
        <CommentSection articleSlug={slug} />
      </div>
    </div>
  );
}
