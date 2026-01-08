"use client";

interface BookingDetailsProps {
  booking: any;
  onClose: () => void;
}

export function BookingDetails({ booking, onClose }: BookingDetailsProps) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative my-8 w-full max-w-2xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark fa-text text-xl"></i>
        </button>

        {/* Modal Content */}
        <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-heading font-bold text-[#0A1A33]">
            Booking Details
          </h2>

          <div className="space-y-6">
            {/* Booking Number */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                Booking Number
              </h3>
              <p className="text-lg font-medium text-[#1F2937]">{booking.bookingNumber}</p>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                Client Information
              </h3>
              <div className="space-y-2 rounded-lg bg-[#F3F4F6] p-4">
                <div>
                  <span className="text-xs font-medium text-[#4A5768]">Name:</span>
                  <p className="text-sm text-[#1F2937]">{booking.clientName}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4A5768]">Email:</span>
                  <p className="text-sm text-[#1F2937]">{booking.clientEmail}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4A5768]">Phone:</span>
                  <p className="text-sm text-[#1F2937]">{booking.clientPhone}</p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                Service
              </h3>
              <div className="rounded-lg bg-[#F3F4F6] p-4">
                <p className="text-sm font-medium text-[#1F2937]">
                  {booking.service?.name || "N/A"}
                </p>
                {booking.service?.description && (
                  <p className="mt-1 text-xs text-[#4A5768]">{booking.service.description}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                Date & Time
              </h3>
              <div className="rounded-lg bg-[#F3F4F6] p-4">
                <div className="mb-2">
                  <span className="text-xs font-medium text-[#4A5768]">Start:</span>
                  <p className="text-sm text-[#1F2937]">
                    {new Date(booking.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-[#1F2937]">
                    {new Date(booking.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4A5768]">End:</span>
                  <p className="text-sm text-[#1F2937]">
                    {new Date(booking.endTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes/Details */}
            {booking.notes && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                  Consultation Details
                </h3>
                <div className="rounded-lg bg-[#F3F4F6] p-4">
                  <pre className="whitespace-pre-wrap text-sm text-[#1F2937] font-sans">
                    {booking.notes}
                  </pre>
                </div>
              </div>
            )}

            {/* Status & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                  Status
                </h3>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    booking.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#4A5768] uppercase tracking-wide">
                  Amount
                </h3>
                <p className="text-lg font-semibold text-[#1F2937]">
                  {booking.price && Number(booking.price) > 0
                    ? `KSh ${Number(booking.price).toLocaleString()}`
                    : "On Request"}
                </p>
                {booking.paid && (
                  <p className="mt-1 text-xs text-green-600">✓ Paid</p>
                )}
              </div>
            </div>

            {/* Created Date */}
            <div>
              <p className="text-xs text-[#4A5768]">
                Created: {new Date(booking.createdAt).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

