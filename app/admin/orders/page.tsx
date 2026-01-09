import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrdersList from "@/components/admin/OrdersList";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getSession();

  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN")) {
    redirect("/admin/login");
  }

  // Fetch all orders
  let orders: any[] = [];
  try {
    const rawOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true },
            },
          },
        },
        user: {
          select: { email: true, name: true },
        },
      },
    });

    // Convert Decimal fields to numbers for client component serialization
    orders = rawOrders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
      })),
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Orders Management
              </h1>
              <p className="mt-1 text-sm text-[#4A5768]">
                View and manage all shop orders and payments
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-[#007CFF] hover:text-[#0066CC] font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <OrdersList orders={orders} />
      </div>
    </div>
  );
}

