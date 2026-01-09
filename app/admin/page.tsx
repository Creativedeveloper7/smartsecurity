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
    orderRevenue: 0,
    bookingRevenue: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalVideos: 0,
    totalProducts: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalComments: 0,
    totalUsers: 0,
  };

  try {
    const [
      bookings,
      articles,
      publishedArticles,
      videos,
      products,
      orders,
      courses,
      publishedCourses,
      comments,
      users,
    ] = await Promise.all([
      prisma.booking.count().catch(() => 0),
      prisma.article.count().catch(() => 0),
      prisma.article.count({ where: { published: true } }).catch(() => 0),
      prisma.video.count().catch(() => 0),
      prisma.product.count().catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.course.count().catch(() => 0),
      prisma.course.count({ where: { published: true } }).catch(() => 0),
      prisma.comment.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
    ]);

    // Get order statistics
    const [paidOrders, pendingOrders, allOrders] = await Promise.all([
      prisma.order.count({ where: { paymentStatus: 'PAID' } }).catch(() => 0),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }).catch(() => 0),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }).catch(() => []),
    ]);

    // Get booking revenue
    const paidBookings = await prisma.booking.findMany({
      where: { paid: true },
      select: { price: true },
    }).catch(() => []);

    // Calculate revenues
    const orderRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const bookingRevenue = paidBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
    const totalRevenue = orderRevenue + bookingRevenue;

    stats = {
      totalBookings: bookings,
      totalRevenue,
      orderRevenue,
      bookingRevenue,
      totalArticles: articles,
      publishedArticles: publishedArticles,
      totalVideos: videos,
      totalProducts: products,
      totalOrders: orders,
      paidOrders,
      pendingOrders,
      totalCourses: courses,
      publishedCourses: publishedCourses,
      totalComments: comments,
      totalUsers: users,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Use default stats if database query fails
  }

  // Fetch recent orders
  let recentOrders: any[] = [];
  try {
    recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
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

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Articles</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalArticles}
                </p>
                <p className="mt-1 text-xs text-[#4A5768]">
                  {stats.publishedArticles} published
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-book-open fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Videos</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalVideos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-video fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Courses</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalCourses}
                </p>
                <p className="mt-1 text-xs text-[#4A5768]">
                  {stats.publishedCourses} published
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-graduation-cap fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Products</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-bag-shopping fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Bookings</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-calendar fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Orders</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalOrders}
                </p>
                <p className="mt-1 text-xs text-[#4A5768]">
                  {stats.paidOrders} paid, {stats.pendingOrders} pending
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-cart-shopping fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Comments</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  {stats.totalComments}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-comments fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#4A5768]">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
                  KSh {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#4A5768]">
                  Orders: KSh {stats.orderRevenue.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E]">
                <i className="fa-solid fa-dollar-sign fa-subtitle text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/articles"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-book-open fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Articles
              </h3>
              <p className="text-sm text-[#4A5768]">Create and edit blog articles</p>
            </Link>

            <Link
              href="/admin/videos"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-video fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Videos
              </h3>
              <p className="text-sm text-[#4A5768]">Add and organize video content</p>
            </Link>

            <Link
              href="/admin/gallery"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-images fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Gallery
              </h3>
              <p className="text-sm text-[#4A5768]">Upload and manage gallery images</p>
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-bag-shopping fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Products
              </h3>
              <p className="text-sm text-[#4A5768]">Manage shop inventory</p>
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-cart-shopping fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Orders
              </h3>
              <p className="text-sm text-[#4A5768]">View and manage all orders</p>
            </Link>

            <Link
              href="/admin/bookings"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-calendar fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Bookings
              </h3>
              <p className="text-sm text-[#4A5768]">View and manage consultations</p>
            </Link>

            <Link
              href="/admin/courses"
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-md"
            >
              <i className="fa-solid fa-graduation-cap fa-subtitle mb-3 text-4xl text-[#005B6E]"></i>
              <h3 className="mb-1 text-sm font-heading font-semibold text-[#1F2937]">
                Manage Courses
              </h3>
              <p className="text-sm text-[#4A5768]">Create and organize training courses</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-[#007CFF] hover:text-[#0066CC] font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F3F4F6]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#4A5768]">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const statusColors: Record<string, string> = {
                        PENDING: 'bg-yellow-100 text-yellow-800',
                        PROCESSING: 'bg-blue-100 text-blue-800',
                        SHIPPED: 'bg-purple-100 text-purple-800',
                        DELIVERED: 'bg-green-100 text-green-800',
                        CANCELLED: 'bg-red-100 text-red-800',
                      };

                      const paymentColors: Record<string, string> = {
                        PENDING: 'bg-yellow-100 text-yellow-800',
                        PAID: 'bg-green-100 text-green-800',
                        FAILED: 'bg-red-100 text-red-800',
                        REFUNDED: 'bg-gray-100 text-gray-800',
                      };

                      return (
                        <tr key={order.id} className="hover:bg-[#F3F4F6]">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm font-medium text-[#007CFF] hover:text-[#0066CC]"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-[#1F2937]">{order.customerName}</div>
                            <div className="text-xs text-[#4A5768]">{order.customerEmail}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#1F2937]">
                            KSh {Number(order.total).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4A5768]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

