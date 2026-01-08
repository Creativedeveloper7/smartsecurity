import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "./delete-button";

export const dynamic = 'force-dynamic';

async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        categories: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
    return articles;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export default async function AdminArticlesPage() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    redirect("/admin/login");
  }

  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Link
                href="/admin"
                className="text-xs sm:text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-[#0A1A33]">
                Manage Articles
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/admin/articles/new"
                className="flex-1 sm:flex-none text-center rounded-lg bg-[#007CFF] px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white hover:bg-[#0066CC] transition-colors"
              >
                + New Article
              </Link>
              <span className="text-xs sm:text-sm text-[#4A5768] break-all hidden sm:inline">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Articles Table - Mobile: Card View, Desktop: Table View */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 lg:px-6 py-8 text-center text-sm text-[#4A5768]">
                      No articles found. <Link href="/admin/articles/new" className="text-[#007CFF] hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-[#F3F4F6]">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-[#0A1A33] break-words">{article.title}</div>
                        <div className="text-xs text-[#4A5768] line-clamp-1">{article.excerpt}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {article.categories && article.categories.length > 0 ? (
                            article.categories.map((cat: any) => (
                              <span
                                key={cat.id}
                                className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#F3F4F6] text-[#005B6E]"
                              >
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#F3F4F6] text-[#005B6E]">
                              Uncategorized
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-[#4A5768]">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : "Draft"}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <Link
                          href={`/admin/articles/${article.slug}/comments`}
                          className="text-sm text-[#007CFF] hover:text-[#0066CC] transition-colors font-medium"
                        >
                          {article._count?.comments || 0} comments
                        </Link>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            article.published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {article.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            className="text-[#007CFF] hover:text-[#0066CC] transition-colors text-xs sm:text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-[#007CFF] hover:text-[#0066CC] transition-colors text-xs sm:text-sm"
                          >
                            Edit
                          </Link>
                          <DeleteButton 
                            articleSlug={article.slug} 
                            articleTitle={article.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-[#E5E7EB]">
            {articles.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#4A5768]">
                No articles found. <Link href="/admin/articles/new" className="text-[#007CFF] hover:underline">Create one</Link>
              </div>
            ) : (
              articles.map((article: any) => (
                <div key={article.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#0A1A33] break-words mb-1">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-xs text-[#4A5768] line-clamp-2">{article.excerpt}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        article.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {article.categories && article.categories.length > 0 ? (
                        article.categories.map((cat: any) => (
                          <span
                            key={cat.id}
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#F3F4F6] text-[#005B6E]"
                          >
                            {cat.name}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#F3F4F6] text-[#005B6E]">
                          Uncategorized
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#4A5768]">
                    <div>
                      <span className="font-medium">Published: </span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : "Draft"}
                    </div>
                    <Link
                      href={`/admin/articles/${article.slug}/comments`}
                      className="text-[#007CFF] hover:text-[#0066CC] transition-colors font-medium"
                    >
                      {article._count?.comments || 0} comments
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB]">
                    <Link
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      className="flex-1 text-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#2D3748] hover:bg-[#F3F4F6] transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="flex-1 text-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#2D3748] hover:bg-[#F3F4F6] transition-colors"
                    >
                      Edit
                    </Link>
                    <div className="flex-1">
                      <DeleteButton 
                        articleSlug={article.slug} 
                        articleTitle={article.title}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


