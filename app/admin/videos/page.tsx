import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getVideos() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export default async function AdminVideosPage() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    redirect("/admin/login");
  }

  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  const videos = await getVideos();

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
                Manage Videos
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/videos/new"
                className="rounded-lg bg-[#007CFF] px-4 py-2 text-base font-medium text-white hover:bg-[#0066CC] transition-colors"
              >
                + New Video
              </Link>
              <span className="text-sm text-[#4A5768]">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Videos Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.length === 0 ? (
            <div className="col-span-full rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
              <p className="text-sm text-[#4A5768] mb-4">
                No videos found.
              </p>
              <Link
                href="/admin/videos/new"
                className="inline-block rounded-lg bg-[#007CFF] px-4 py-2 text-base font-medium text-white hover:bg-[#0066CC] transition-colors"
              >
                Create First Video
              </Link>
            </div>
          ) : (
            videos.map((video: any) => (
              <div
                key={video.id}
                className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-[#F3F4F6] flex items-center justify-center">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa-regular fa-video fa-subtitle text-4xl text-[#4A5768]"></i>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#F3F4F6] text-[#005B6E]">
                      {video.category || "Uncategorized"}
                    </span>
                  </div>
                  <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#4A5768] mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4A5768]">
                      {video.createdAt
                        ? new Date(video.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="text-xs text-[#007CFF] hover:text-[#0066CC] transition-colors"
                      >
                        Edit
                      </Link>
                      <button className="text-xs text-red-600 hover:text-red-800 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

