import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { ViewDetailsButton } from "./view-details-button";

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";

async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
    
    // Convert Decimal fields to numbers for client components
    return bookings.map((booking) => ({
      ...booking,
      price: booking.price ? Number(booking.price) : null,
      service: booking.service ? {
        ...booking.service,
        price: booking.service.price ? Number(booking.service.price) : null,
      } : null,
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
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

  const bookings = await getBookings();

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Link
                href="/admin"
                className="text-xs sm:text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-[#0A1A33]">
                Manage Bookings
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm text-[#4A5768] break-all">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Bookings Table - Mobile: Card View, Desktop: Table View */}
        <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Booking #
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[#4A5768] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 lg:px-6 py-8 text-center text-sm text-[#4A5768]">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-[#F3F4F6]">
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-[#0A1A33]">
                        <span className="break-all">{booking.bookingNumber}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-[#1F2937] break-words">{booking.clientName}</div>
                        <div className="text-xs text-[#4A5768] break-all">{booking.clientEmail}</div>
                        {booking.clientPhone && (
                          <div className="text-xs text-[#4A5768]">{booking.clientPhone}</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-[#4A5768]">
                        {booking.service?.name || "N/A"}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-[#4A5768]">
                        <div>
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(booking.startTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-[#1F2937]">
                        {booking.price && Number(booking.price) > 0 ? `KSh ${Number(booking.price).toLocaleString()}` : "On Request"}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm">
                        <ViewDetailsButton booking={booking} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[#E5E7EB]">
            {bookings.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#4A5768]">
                No bookings found
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div key={booking.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Booking #</p>
                      <p className="text-sm font-semibold text-[#0A1A33] break-all">{booking.bookingNumber}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Client</p>
                    <p className="text-sm text-[#1F2937] font-medium">{booking.clientName}</p>
                    <p className="text-xs text-[#4A5768] break-all">{booking.clientEmail}</p>
                    {booking.clientPhone && (
                      <p className="text-xs text-[#4A5768]">{booking.clientPhone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Service</p>
                    <p className="text-sm text-[#1F2937]">{booking.service?.name || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Date & Time</p>
                    <p className="text-sm text-[#1F2937]">
                      {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                    <div>
                      <p className="text-xs font-medium text-[#4A5768] uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {booking.price && Number(booking.price) > 0 ? `KSh ${Number(booking.price).toLocaleString()}` : "On Request"}
                      </p>
                    </div>
                    <ViewDetailsButton booking={booking} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

