import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShareButton } from "./share-button";
import { CommentSection } from "./comment-section";
import { ArticleImage } from "./article-image";

export const dynamic = 'force-dynamic';

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
  let slug: string;
  try {
    const paramsObj = await params;
    slug = paramsObj.slug;
    console.log("🔍 [ArticlePage] Received params, slug:", slug);
  } catch (error: any) {
    console.error("❌ [ArticlePage] Error extracting params:", error);
    notFound();
    return null;
  }

  let article: Article | null = null;

  try {
    console.log("🔍 [ArticlePage] Fetching article with slug:", slug);
    
    // Fetch article directly from database
    const articleData = await prisma.article.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });

    console.log("📄 [ArticlePage] Query result:", {
      found: !!articleData,
      slug,
      articleId: articleData?.id || "N/A",
      title: articleData?.title || "N/A",
    });

    if (!articleData) {
      console.warn("⚠️ [ArticlePage] Article not found for slug:", slug);
      // Try to find similar slugs for debugging
      const similarArticles = await prisma.article.findMany({
        where: {
          slug: {
            contains: slug.substring(0, 5), // First 5 chars
          },
        },
        select: { slug: true, title: true },
        take: 5,
      });
      console.log("🔍 [ArticlePage] Similar slugs found:", similarArticles);
      notFound();
    }

    // Increment views
    await prisma.article.update({
      where: { id: articleData.id },
      data: { views: { increment: 1 } },
    }).catch((error) => {
      // Ignore errors when updating views
      console.warn("Failed to increment views:", error);
    });

    article = articleData as Article;
  } catch (error: any) {
    console.error("❌ Error fetching article:", {
      slug,
      error: error.message,
      code: error.code,
      name: error.name,
    });
    
    // Check if it's a database connection error
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      console.error("🔴 Database connection failed");
    }
    
    notFound();
  }

  if (!article) {
    console.warn("⚠️ Article is null after fetch");
    notFound();
  }

  const formattedContent = formatContent(article.content);
  const readingTime = calculateReadingTime(article.content);
  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : null;
  const primaryCategory = article.categories[0]?.name || "Uncategorized";
  const imageUrl = resolveImageUrl(article.featuredImage);

  return (
    <div className="min-h-screen bg-white py-6 sm:py-12">
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
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#4A5768]">
            {publishedDate && (
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calendar fa-text"></i>
                {publishedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            )}
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-clock fa-text"></i>
              {readingTime} min read
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-eye fa-text"></i>
              {article.views.toLocaleString()} views
            </div>
            <ShareButton title={article.title} excerpt={article.excerpt || ""} />
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && <ArticleImage src={imageUrl} alt={article.title} />}

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
