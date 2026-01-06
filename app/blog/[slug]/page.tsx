import { notFound } from "next/navigation";
import Link from "next/link";

// Mock data - will be replaced with actual API calls
const mockArticle = {
  id: "1",
  title: "Modern Security Challenges in Kenya",
  content: `
    <p>Kenya faces a complex and evolving security landscape that requires sophisticated approaches to protection and risk management. This article explores the key challenges and provides expert insights into effective security strategies.</p>
    
    <h2>Current Threat Landscape</h2>
    <p>The security environment in Kenya has undergone significant changes over the past decade. Organizations must now contend with a diverse range of threats, from traditional criminal activities to emerging cyber threats and geopolitical risks.</p>
    
    <h2>Key Security Challenges</h2>
    <ul>
      <li>Urban crime and organized criminal networks</li>
      <li>Cybersecurity vulnerabilities</li>
      <li>Political instability and civil unrest</li>
      <li>Terrorism and extremism</li>
      <li>Economic crimes and fraud</li>
    </ul>
    
    <h2>Best Practices for Organizations</h2>
    <p>Effective security requires a multi-layered approach that combines physical security measures, intelligence gathering, and strategic planning. Organizations should invest in comprehensive risk assessments and develop tailored security protocols.</p>
    
    <h2>Conclusion</h2>
    <p>By understanding the current threat landscape and implementing robust security measures, organizations can significantly enhance their protection and resilience against various security challenges.</p>
  `,
  slug: "modern-security-challenges-kenya",
  publishedAt: new Date("2024-01-15"),
  readingTime: 5,
  category: "Security",
  metaDescription: "An in-depth analysis of contemporary security threats in Kenya",
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // In production, fetch article by slug from database
  if (slug !== mockArticle.slug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center text-sm text-[#007CFF] hover:underline"
        >
          ← Back to Articles
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Tag */}
          <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
            {mockArticle.category}
          </span>

          {/* Title */}
          <h1 className="mb-4 text-2xl font-heading font-bold leading-tight text-[#0A1A33] lg:text-3xl">
            {mockArticle.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#4A5768]">
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-calendar fa-text"></i>
              {mockArticle.publishedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock fa-text"></i>
              {mockArticle.readingTime} min read
            </div>
            <button className="flex items-center gap-2 hover:text-[#007CFF] transition-colors">
              <i className="fa-regular fa-share-nodes fa-text"></i>
              Share
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8 h-96 w-full overflow-hidden rounded-lg bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
          <div className="flex h-full items-center justify-center">
            <span className="text-white/50">Featured Image</span>
          </div>
        </div>

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: mockArticle.content }}
          style={{
            color: "#2D3748",
          }}
        />

        {/* Related Articles */}
        <section className="mt-16 border-t border-[#E5E7EB] pt-12">
          <h2 className="mb-6 text-lg font-heading font-semibold text-[#1F2937]">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Link
                key={i}
                href="/blog"
                className="group rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF]"
              >
                <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                  Related Article Title {i}
                </h3>
                <p className="text-sm text-[#4A5768]">
                  Brief excerpt from related article...
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

