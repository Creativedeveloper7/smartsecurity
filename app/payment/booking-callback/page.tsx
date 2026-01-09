"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function BookingPaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Paystack sends both 'reference' and 'trxref' parameters
    // Use 'reference' if available, otherwise fall back to 'trxref'
    const reference = searchParams?.get("reference") || searchParams?.get("trxref");

    if (!reference) {
      setStatus("failed");
      setError("No payment reference found");
      return;
    }

    // Verify the transaction
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify-booking?reference=${reference}`);
        const data = await response.json();

        if (data.success && data.status === "success") {
          setStatus("success");
          setBookingNumber(data.booking.bookingNumber);
        } else {
          setStatus("failed");
          setError(data.error || "Payment verification failed");
        }
      } catch (err: any) {
        console.error("Error verifying booking payment:", err);
        setStatus("failed");
        setError("Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#007CFF] animate-pulse">
              <i className="fa-solid fa-spinner fa-title text-3xl text-white animate-spin"></i>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-heading font-bold text-[#0A1A33]">
            Verifying Payment...
          </h2>
          <p className="text-sm text-[#4A5768]">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]">
              <i className="fa-solid fa-check fa-title text-3xl text-white"></i>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-heading font-bold text-[#0A1A33]">
            Payment Successful!
          </h2>
          {bookingNumber && (
            <p className="mb-4 text-sm text-[#4A5768]">
              Booking Number: <span className="font-semibold text-[#007CFF]">{bookingNumber}</span>
            </p>
          )}
          <p className="mb-6 text-sm text-[#4A5768]">
            Thank you for your booking! Your payment has been confirmed and you will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white hover:bg-[#0066CC] transition-colors"
            >
              View Courses
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#2D3748] hover:bg-[#F3F4F6] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <i className="fa-solid fa-xmark fa-title text-3xl text-red-600"></i>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-heading font-bold text-[#0A1A33]">
          Payment Failed
        </h2>
        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <p className="mb-6 text-sm text-[#4A5768]">
          Your payment could not be processed. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white hover:bg-[#0066CC] transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#2D3748] hover:bg-[#F3F4F6] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingPaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#007CFF] animate-pulse">
              <i className="fa-solid fa-spinner fa-title text-3xl text-white animate-spin"></i>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-heading font-bold text-[#0A1A33]">
            Loading...
          </h2>
          <p className="text-sm text-[#4A5768]">
            Please wait
          </p>
        </div>
      </div>
    }>
      <BookingPaymentCallbackContent />
    </Suspense>
  );
}


