"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number | string;
  subtotal: number | string;
  status: string;
  paymentStatus: string;
  createdAt: string | Date;
  paymentIntent?: string | null;
  items: Array<{
    id: string;
    product: {
      name: string;
      slug: string;
    };
  }>;
  user?: {
    email: string;
    name: string;
  } | null;
}

interface OrdersListProps {
  orders: Order[];
}

export default function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...initialOrders];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          (order.paymentIntent && order.paymentIntent.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-desc":
          return Number(b.total) - Number(a.total);
        case "amount-asc":
          return Number(a.total) - Number(b.total);
        case "customer-asc":
          return a.customerName.localeCompare(b.customerName);
        case "customer-desc":
          return b.customerName.localeCompare(a.customerName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialOrders, statusFilter, paymentFilter, sortBy, searchQuery]);

  const totalRevenue = filteredAndSortedOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-[#4A5768] mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order #, customer name, email..."
              className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm px-3 py-2"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-[#4A5768] mb-2">
              Order Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <label htmlFor="payment" className="block text-sm font-medium text-[#4A5768] mb-2">
              Payment Status
            </label>
            <select
              id="payment"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm px-3 py-2"
            >
              <option value="all">All Payments</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-[#4A5768] mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm px-3 py-2"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="customer-asc">Customer (A-Z)</option>
              <option value="customer-desc">Customer (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-[#4A5768]">
          Showing {filteredAndSortedOrders.length} of {initialOrders.length} orders
        </div>
      </div>

      {/* Orders Table */}
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
                  Items
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
                <th className="px-4 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#4A5768]">
                    No orders found matching your filters
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F3F4F6]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1F2937]">{order.orderNumber}</div>
                      {order.paymentIntent && (
                        <div className="text-xs text-[#4A5768]">
                          Ref: {order.paymentIntent.substring(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937]">{order.customerName}</div>
                      <div className="text-xs text-[#4A5768]">{order.customerEmail}</div>
                      {order.user && (
                        <div className="text-xs text-[#007CFF]">User Account</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#1F2937]">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-[#4A5768] mt-1">
                        {order.items.slice(0, 2).map((item) => item.product.name).join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1F2937]">
                        KSh {Number(order.total).toLocaleString()}
                      </div>
                      <div className="text-xs text-[#4A5768]">
                        Subtotal: KSh {Number(order.subtotal).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paymentColors[order.paymentStatus] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#4A5768]">
                      <div>{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                      <div className="text-xs">{format(new Date(order.createdAt), "h:mm a")}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#007CFF] hover:text-[#0066CC] font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#4A5768]">Filtered Orders</p>
          <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
            {filteredAndSortedOrders.length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#4A5768]">Paid Orders</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {filteredAndSortedOrders.filter((o) => o.paymentStatus === "PAID").length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#4A5768]">Filtered Revenue</p>
          <p className="mt-2 text-2xl font-bold text-[#0A1A33]">
            KSh {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}


