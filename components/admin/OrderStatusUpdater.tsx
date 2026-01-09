"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: orderStatus,
          paymentStatus: paymentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#4A5768] mb-2">
          Order Status
        </label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm"
          disabled={loading}
        >
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <div className="mt-2">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusColors[orderStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {orderStatus}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A5768] mb-2">
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="block w-full rounded-md border-[#E5E7EB] shadow-sm focus:border-[#007CFF] focus:ring-[#007CFF] sm:text-sm"
          disabled={loading}
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <div className="mt-2">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {paymentStatus}
          </span>
        </div>
      </div>

      {(orderStatus !== currentStatus || paymentStatus !== currentPaymentStatus) && (
        <div className="pt-4 border-t border-[#E5E7EB]">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
              Order updated successfully!
            </div>
          )}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full rounded-lg bg-[#007CFF] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      )}
    </div>
  );
}


