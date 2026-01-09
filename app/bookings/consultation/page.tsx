"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}

export default function ConsultationBookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    organization: "",
    preferredDate: "",
    preferredTime: "09:00",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) throw new Error("Failed to fetch services");
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("Error fetching services:", err);
        // Continue without services - allow general consultation
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.preferredDate) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Calculate start and end times
      const startDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      // Default to 1 hour if no service selected, otherwise use service duration
      const selectedService = services.find(s => s.id === selectedServiceId);
      const durationMinutes = selectedService ? selectedService.duration : 60;
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      // Submit booking to API
      // If no service selected, API will create/use a default "General Consultation" service
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(selectedServiceId && { serviceId: selectedServiceId }),
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          clientPhone: formData.clientPhone.trim(),
          organization: formData.organization.trim() || null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          additionalNotes: formData.additionalNotes.trim() || null,
          duration: durationMinutes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // If payment is required, redirect to payment checkout
      if (data.requiresPayment && data.bookingId) {
        try {
          const paymentResponse = await fetch("/api/payments/checkout-booking", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId: data.bookingId,
              customerEmail: formData.clientEmail.trim(),
              customerName: formData.clientName.trim(),
            }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.authorizationUrl) {
            // Redirect to Paystack checkout
            window.location.href = paymentData.authorizationUrl;
            return;
          } else {
            // Payment initialization failed, but booking was created
            throw new Error(paymentData.error || "Booking created but payment initialization failed. Please contact support.");
          }
        } catch (paymentError) {
          console.error("Error initializing payment:", paymentError);
          throw new Error(paymentError instanceof Error ? paymentError.message : "Booking created but payment initialization failed. Please contact support.");
        }
      } else {
        // No payment required or free booking
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(
        err instanceof Error
          ? `Booking failed: ${err.message}`
          : "An error occurred while creating the booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-check fa-title text-3xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-heading font-bold text-[#0A1A33] mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-[#4A5768] mb-6">
            Thank you for booking a consultation. We'll be in touch shortly to confirm the details.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#007CFF] text-white px-6 py-3 rounded-lg hover:bg-[#0066CC] transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold text-[#0A1A33] mb-2">
            Book a Consultation
          </h1>
          <p className="text-[#4A5768]">
            Schedule a consultation with our security expert
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#F3F4F6] border-b border-[#E5E7EB]">
            <h2 className="text-lg font-heading font-semibold text-[#1F2937]">
              Consultation Details
            </h2>
            <p className="mt-1 text-sm text-[#4A5768]">
              Please fill in your details to complete the booking
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              {!loading && services.length > 0 && (
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Consultation Type (Optional)
                  </label>
                  <select
                    id="service"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  >
                    <option value="">General Consultation</option>
                    {services.filter(s => s.active).map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.duration} min - KSh {Number(service.price).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <p className="mt-2 text-sm text-[#4A5768]">
                      {selectedService.description}
                    </p>
                  )}
                </div>
              )}

              {/* Client Information */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    required
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="clientPhone"
                    required
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="Company Name (Optional)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredDate"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDate: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredTime"
                    className="block text-sm font-medium text-[#1F2937] mb-2"
                  >
                    Preferred Time *
                  </label>
                  <select
                    id="preferredTime"
                    required
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredTime: e.target.value })
                    }
                    className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="additionalNotes"
                  className="block text-sm font-medium text-[#1F2937] mb-2"
                >
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalNotes: e.target.value })
                  }
                  className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  placeholder="Any special requirements or questions you might have..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#2D3748] transition-all hover:bg-[#F3F4F6]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-text mr-2 animate-spin"></i>
                      Processing...
                    </>
                  ) : (
                    "Book Consultation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

