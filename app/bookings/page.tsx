"use client";

import { useState } from "react";

const serviceTypes = [
  {
    id: "1",
    name: "Security Consultation",
    description: "Comprehensive security assessment and strategic advice",
    duration: 60,
    price: 5000,
  },
  {
    id: "2",
    name: "Criminal Justice Advisory",
    description: "Expert guidance on criminal justice matters",
    duration: 90,
    price: 7500,
  },
  {
    id: "3",
    name: "Expert Witness Testimony",
    description: "Professional expert witness services",
    duration: 120,
    price: 10000,
  },
  {
    id: "4",
    name: "Training/Workshop",
    description: "Customized training sessions for your team",
    duration: 180,
    price: 15000,
  },
  {
    id: "5",
    name: "Speaking Engagement",
    description: "Keynote speeches and presentations",
    duration: 60,
    price: 8000,
  },
];

export default function BookingsPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    organization: "",
    consultationTopic: "",
    preferredDate: "",
    preferredTime: "",
    specialRequirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const selectedServiceData = serviceTypes.find((s) => s.id === selectedService);
      if (!selectedServiceData) {
        throw new Error("Please select a service");
      }

      // Calculate start and end times
      const startDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.duration * 60 * 1000);

      // Build notes with all consultation details
      const notes = [
        `Consultation Topic: ${formData.consultationTopic}`,
        formData.organization ? `Organization: ${formData.organization}` : null,
        formData.specialRequirements ? `Special Requirements: ${formData.specialRequirements}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      // Submit booking - API will handle service creation
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          clientPhone: formData.clientPhone.trim(),
          serviceName: selectedServiceData.name,
          duration: selectedServiceData.duration,
          servicePrice: selectedServiceData.price,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: notes,
          price: selectedServiceData.price,
          organization: formData.organization.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit booking");
      }

      setIsSubmitted(true);
      // Reset form
      setSelectedService(null);
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        organization: "",
        consultationTopic: "",
        preferredDate: "",
        preferredTime: "",
        specialRequirements: "",
      });
    } catch (err: any) {
      console.error("Error submitting booking:", err);
      setError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-2xl font-heading font-bold text-[#0A1A33] lg:text-3xl">
            Book a Consultation
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
            Schedule a professional consultation with our security expert
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Service Selection */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <h2 className="mb-4 text-2xl font-heading font-semibold text-[#1F2937]">
              Select Service
            </h2>
            <div className="space-y-3">
              {serviceTypes.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedService === service.id
                      ? "border-[#007CFF] bg-[#007CFF]/5"
                      : "border-[#E5E7EB] bg-white hover:border-[#005B6E]"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-heading font-semibold text-[#1F2937]">
                      {service.name}
                    </h3>
                    {selectedService === service.id && (
                      <i className="fa-solid fa-circle-check fa-text text-[#007CFF]"></i>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-[#4A5768]">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[#4A5768]">
                    <div className="flex items-center gap-1">
                      <i className="fa-regular fa-clock fa-text"></i>
                      {service.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fa-regular fa-dollar-sign fa-text"></i>
                      KSh {service.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
              {!selectedService ? (
                <div className="py-12 text-center">
                  <i className="fa-regular fa-calendar fa-subtitle text-6xl text-[#4A5768] mx-auto mb-4 block"></i>
                  <p className="text-sm text-[#4A5768]">
                    Please select a service to continue
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="mb-6 text-lg font-heading font-semibold text-[#1F2937]">
                    Booking Information
                  </h2>

                  {/* Client Name */}
                  <div>
                    <label
                      htmlFor="clientName"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
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
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="clientEmail"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
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
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="clientPhone"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
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
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label
                      htmlFor="organization"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
                    >
                      Organization/Company
                    </label>
                    <input
                      type="text"
                      id="organization"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="Company Name"
                    />
                  </div>

                  {/* Preferred Date */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="preferredDate"
                        className="mb-2 block text-sm font-medium text-[#1F2937]"
                      >
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        required
                        value={formData.preferredDate}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredDate: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      />
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label
                        htmlFor="preferredTime"
                        className="mb-2 block text-sm font-medium text-[#1F2937]"
                      >
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        id="preferredTime"
                        required
                        value={formData.preferredTime}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredTime: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      />
                    </div>
                  </div>

                  {/* Consultation Topic */}
                  <div>
                    <label
                      htmlFor="consultationTopic"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
                    >
                      Consultation Topic/Reason *
                    </label>
                    <textarea
                      id="consultationTopic"
                      required
                      rows={4}
                      value={formData.consultationTopic}
                      onChange={(e) =>
                        setFormData({ ...formData, consultationTopic: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="Please describe the reason for consultation..."
                    />
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label
                      htmlFor="specialRequirements"
                      className="mb-2 block text-sm font-medium text-[#1F2937]"
                    >
                      Special Requirements
                    </label>
                    <textarea
                      id="specialRequirements"
                      rows={3}
                      value={formData.specialRequirements}
                      onChange={(e) =>
                        setFormData({ ...formData, specialRequirements: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {isSubmitted && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600">
                      <p className="font-semibold mb-1">Booking Request Submitted!</p>
                      <p>Your consultation booking has been sent to the admin dashboard for review. You will receive a confirmation email shortly.</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full rounded-lg bg-[#007CFF] px-8 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : isSubmitted ? "Submitted!" : "Submit Booking Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

