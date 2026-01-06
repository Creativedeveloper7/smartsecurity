import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        categories: true,
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Manage Articles
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles/new"
                className="rounded-lg bg-[#007CFF] px-4 py-2 text-base font-medium text-white hover:bg-[#0066CC] transition-colors"
              >
                + New Article
              </Link>
              <span className="text-sm text-[#4A5768]">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Articles Table */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#4A5768]">
                      No articles found. <Link href="/admin/articles/new" className="text-[#007CFF] hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-[#F3F4F6]">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#0A1A33]">{article.title}</div>
                        <div className="text-xs text-[#4A5768] line-clamp-1">{article.excerpt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5768]">
                        N/A
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5768]">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : "Draft"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-[#007CFF] hover:text-[#0066CC] transition-colors"
                          >
                            Edit
                          </Link>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

