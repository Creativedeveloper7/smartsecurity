"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

const courses = {
  "strategic-risk-threat-assessment": {
    title: "Strategic Risk & Threat Assessment",
    description: "Comprehensive methodology for identifying, analyzing, and mitigating security risks at organizational and strategic levels.",
    deliveryFormat: "Executive Briefing / Workshop / Custom",
    duration: "2-3 days (customizable)",
    price: "On request",
  },
  "organizational-security-resilience": {
    title: "Organizational Security & Resilience Planning",
    description: "Develop robust security frameworks and resilience strategies to protect organizational assets and operations.",
    deliveryFormat: "Workshop / Custom",
    duration: "3-5 days (customizable)",
    price: "From $5,000 per cohort",
  },
  "cybersecurity-awareness-leadership": {
    title: "Cybersecurity Awareness for Leadership",
    description: "Executive-level cybersecurity education and strategic decision-making frameworks for senior management.",
    deliveryFormat: "Executive Briefing / Custom",
    duration: "1-2 days (customizable)",
    price: "On request",
  },
  "crisis-response-incident-management": {
    title: "Crisis Response & Incident Management",
    description: "Structured approaches to crisis management, incident response protocols, and organizational recovery planning.",
    deliveryFormat: "Workshop / Custom",
    duration: "2-4 days (customizable)",
    price: "From $4,500 per cohort",
  },
  "governance-compliance-policy": {
    title: "Governance, Compliance & Security Policy Design",
    description: "Establish effective security governance structures, compliance frameworks, and policy development methodologies.",
    deliveryFormat: "Workshop / Custom",
    duration: "2-3 days (customizable)",
    price: "On request",
  },
};

function CourseBookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    organization: "",
    preferredDate: "",
    preferredTime: "",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedCourse = courseId ? courses[courseId as keyof typeof courses] : null;

  useEffect(() => {
    if (!courseId || !selectedCourse) {
      router.push("/courses");
    }
  }, [courseId, selectedCourse, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate start and end times from preferred date and time
      const startDateTime = formData.preferredDate
        ? new Date(`${formData.preferredDate}T${formData.preferredTime || "09:00"}`)
        : new Date();
      const endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000); // Default 8 hours

      // Submit booking to API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "course",
          courseId: courseId,
          courseTitle: selectedCourse?.title,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          organization: formData.organization,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: formData.additionalNotes,
          price: 0, // Price is "On request" or varies
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Booking has been sent to admin dashboard - show success message
      } else {
        alert("Failed to submit booking. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!selectedCourse) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]">
              <i className="fa-solid fa-check fa-title text-3xl text-white"></i>
            </div>
          </div>
          <h2 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
            Booking Confirmed!
          </h2>
          <p className="mb-6 text-sm text-[#4A5768]">
            Your course booking request has been submitted successfully and sent to the admin dashboard for review. You will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#2D3748] transition-colors hover:bg-[#F3F4F6]"
            >
              Back to Courses
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white hover:bg-[#0066CC] transition-colors"
            >
              Return to Home
              <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="mb-4 inline-flex items-center text-sm text-[#007CFF] hover:underline"
          >
            <i className="fa-solid fa-arrow-left fa-text mr-2"></i>
            Back to Courses
          </Link>
          <h1 className="mb-2 text-2xl font-heading font-bold text-[#0A1A33]">
            Book Course
          </h1>
          <p className="text-sm text-[#4A5768]">
            Complete the form below to book your selected course
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Course Details Card */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-heading font-semibold text-[#1F2937]">
                Selected Course
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-heading font-semibold text-[#1F2937]">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-xs text-[#4A5768]">
                    {selectedCourse.description}
                  </p>
                </div>
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                  <div>
                    <span className="text-xs font-medium text-[#4A5768]">Delivery Format:</span>
                    <p className="text-xs text-[#2D3748]">{selectedCourse.deliveryFormat}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#4A5768]">Duration:</span>
                    <p className="text-xs text-[#2D3748]">{selectedCourse.duration}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#4A5768]">Investment:</span>
                    <p className="text-xs text-[#2D3748]">{selectedCourse.price}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-heading font-semibold text-[#1F2937]">
                Your Details
              </h2>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="clientName" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="clientEmail" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="john.doe@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="clientPhone" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="clientPhone"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="+254 700 000 000"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="organization" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Organization *
                  </label>
                  <input
                    type="text"
                    id="organization"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="Company Name"
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <label htmlFor="preferredDate" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Preferred Start Date *
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label htmlFor="preferredTime" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="additionalNotes" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Additional Notes
                  </label>
                  <textarea
                    id="additionalNotes"
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/courses"
                  className="flex items-center justify-center rounded-lg border-2 border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#2D3748] transition-colors hover:bg-[#F3F4F6]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-text mr-2 animate-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <i className="fa-solid fa-check fa-text ml-2"></i>
                    </>
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

export default function CourseBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-title text-3xl text-[#007CFF] animate-spin mb-4"></i>
          <p className="text-sm text-[#4A5768]">Loading booking form...</p>
        </div>
      </div>
    }>
      <CourseBookingForm />
    </Suspense>
  );
}

