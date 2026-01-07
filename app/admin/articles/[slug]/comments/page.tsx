import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CommentManagement } from "./comment-management";

export const dynamic = 'force-dynamic';

async function getArticleWithComments(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        categories: true,
      },
    });
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function ArticleCommentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let session;
  try {
    session = await getSession();
  } catch (error) {
    redirect("/admin/login");
  }

  if (
    !session ||
    ((session.user as any)?.role !== "ADMIN" &&
      (session.user as any)?.role !== "SUPER_ADMIN")
  ) {
    redirect("/admin/login");
  }

  const article = await getArticleWithComments(slug);

  if (!article) {
    redirect("/admin/articles");
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className="text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Articles
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                  Manage Comments
                </h1>
                <p className="text-sm text-[#4A5768] mt-1">{article.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/blog/${article.slug}`}
                target="_blank"
                className="text-sm text-[#007CFF] hover:text-[#0066CC] transition-colors"
              >
                View Article
              </Link>
              <span className="text-sm text-[#4A5768]">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CommentManagement
          articleSlug={slug}
          initialComments={article.comments}
        />
      </div>
    </div>
  );
}

