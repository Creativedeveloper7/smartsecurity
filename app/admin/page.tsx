import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    // If auth fails (e.g., no database), redirect to login
    console.error("Auth error:", error);
    redirect("/admin/login");
  }

  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  // Fetch real stats from database with timeout protection
  let stats = {
    totalBookings: 0,
    totalRevenue: 0,
    totalArticles: 0,
    totalVideos: 0,
    totalProducts: 0,
    totalOrders: 0,
  };

  try {
    const [bookings, articles, videos, products, orders] = await Promise.all([
      prisma.booking.count().catch(() => 0),
      prisma.article.count().catch(() => 0),
      prisma.video.count().catch(() => 0),
      prisma.product.count().catch(() => 0),
      prisma.order.count().catch(() => 0),
    ]);

    const paidBookings = await prisma.booking.findMany({
      where: { paid: true },
      select: { price: true },
    }).catch(() => []);

    stats = {
      totalBookings: bookings,
      totalRevenue: paidBookings.reduce((sum, b) => sum + Number(b.price || 0), 0),
      totalArticles: articles,
      totalVideos: videos,
      totalProducts: products,
      totalOrders: orders,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Use default stats if database query fails
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#4A5768]">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Bookings</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-regular fa-calendar fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  KSh {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-regular fa-dollar-sign fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Articles</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalArticles}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-regular fa-book fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Videos</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalVideos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-regular fa-video fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/articles"
              className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-regular fa-book fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Articles
              </h3>
              <p className="text-sm text-[#4A5768]">Create and edit blog articles</p>
            </Link>

            <Link
              href="/admin/videos"
              className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-regular fa-video fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Videos
              </h3>
              <p className="text-sm text-[#4A5768]">Add and organize video content</p>
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-regular fa-bag-shopping fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Products
              </h3>
              <p className="text-sm text-[#4A5768]">Manage shop inventory</p>
            </Link>

            <Link
              href="/admin/bookings"
              className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-regular fa-calendar fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Bookings
              </h3>
              <p className="text-sm text-[#4A5768]">View and manage consultations</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#4A5768]">
              Recent activity will appear here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

