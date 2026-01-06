import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getBookings() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/bookings`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { bookings: [] };
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return { bookings: [] };
  }
}

export default async function AdminBookingsPage() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    redirect("/admin/login");
  }

  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  const { bookings } = await getBookings();

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                Manage Bookings
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#4A5768]">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Bookings Table */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Booking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#4A5768]">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-[#F3F4F6]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0A1A33]">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1F2937]">{booking.clientName}</div>
                        <div className="text-xs text-[#4A5768]">{booking.clientEmail}</div>
                        {booking.clientPhone && (
                          <div className="text-xs text-[#4A5768]">{booking.clientPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5768]">
                        {booking.service?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4A5768]">
                        <div>
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(booking.startTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2937]">
                        {booking.price && Number(booking.price) > 0 ? `KSh ${Number(booking.price).toLocaleString()}` : "On Request"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-[#007CFF] hover:text-[#0066CC] transition-colors">
                          View Details
                        </button>
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

