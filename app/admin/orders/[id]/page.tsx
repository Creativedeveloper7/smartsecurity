import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN")) {
    redirect("/admin/login");
  }

  const { id } = await params;

  // Fetch order details
  let order: any = null;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                isDigital: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    notFound();
  }

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
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
                Order Details
              </h1>
              <p className="mt-1 text-sm text-[#4A5768]">
                Order #{order.orderNumber}
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm text-[#007CFF] hover:text-[#0066CC] font-medium"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
                  Order Items
                </h2>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center space-x-4">
                        {item.product.images && item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="text-sm font-medium text-[#007CFF] hover:text-[#0066CC]"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-[#4A5768] mt-1">
                            Quantity: {item.quantity}
                            {item.product.isDigital && (
                              <span className="ml-2 text-[#005B6E]">(Digital)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#1F2937]">
                          KSh {Number(item.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-[#4A5768]">
                          KSh {Number(item.price * item.quantity).toLocaleString()} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
                <div className="px-4 py-5 sm:px-6 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
                    Shipping Address
                  </h2>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-sm text-[#1F2937]">
                    {typeof order.shippingAddress === 'object' ? (
                      <div className="space-y-1">
                        {order.shippingAddress.street && (
                          <p>{order.shippingAddress.street}</p>
                        )}
                        {order.shippingAddress.city && (
                          <p>{order.shippingAddress.city}</p>
                        )}
                        {order.shippingAddress.state && (
                          <p>{order.shippingAddress.state}</p>
                        )}
                        {order.shippingAddress.postalCode && (
                          <p>{order.shippingAddress.postalCode}</p>
                        )}
                        {order.shippingAddress.country && (
                          <p>{order.shippingAddress.country}</p>
                        )}
                      </div>
                    ) : (
                      <p>{String(order.shippingAddress)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
                  Order Summary
                </h2>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A5768]">Subtotal</span>
                  <span className="font-medium text-[#1F2937]">
                    KSh {Number(order.subtotal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A5768]">Tax</span>
                  <span className="font-medium text-[#1F2937]">
                    KSh {Number(order.tax).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A5768]">Shipping</span>
                  <span className="font-medium text-[#1F2937]">
                    KSh {Number(order.shipping).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-[#E5E7EB] pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-[#1F2937]">Total</span>
                    <span className="text-base font-bold text-[#0A1A33]">
                      KSh {Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
                  Order Status
                </h2>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.status}
                  currentPaymentStatus={order.paymentStatus}
                />
                {order.paymentIntent && (
                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <label className="block text-sm font-medium text-[#4A5768] mb-1">
                      Payment Reference
                    </label>
                    <p className="text-sm text-[#1F2937] font-mono break-all">
                      {order.paymentIntent}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
                  Customer Information
                </h2>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A5768] mb-1">
                    Name
                  </label>
                  <p className="text-sm text-[#1F2937]">{order.customerName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A5768] mb-1">
                    Email
                  </label>
                  <p className="text-sm text-[#1F2937]">{order.customerEmail}</p>
                </div>
                {order.user && (
                  <div>
                    <label className="block text-xs font-medium text-[#4A5768] mb-1">
                      User Account
                    </label>
                    <p className="text-sm text-[#007CFF]">
                      {order.user.name || order.user.email}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#4A5768] mb-1">
                    Order Date
                  </label>
                  <p className="text-sm text-[#1F2937]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

