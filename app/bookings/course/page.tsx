"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  expandedDescription: string;
  keyOutcomes: string[];
  idealAudience: string;
  deliveryFormat: string;
  duration: string;
  price: string;
  image: string | null;
  published: boolean;
  createdAt: string;
}

function CourseBookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get courseId from URL and ensure it's properly decoded
  const courseId = (() => {
    const rawId = searchParams?.get("courseId") || "";
    console.log("Raw courseId from URL:", rawId);
    
    if (!rawId) {
      console.error("No courseId found in URL parameters");
      return "";
    }
    
    try {
      const decodedId = decodeURIComponent(rawId);
      console.log("Decoded courseId:", decodedId);
      return decodedId;
    } catch (error) {
      console.error("Error decoding courseId:", error);
      return "";
    }
  })();
  
  // Debug: Log the final courseId
  console.log("Final courseId to use:", courseId, "(type:", typeof courseId, ")");

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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch course details
  useEffect(() => {
    console.log("useEffect triggered with courseId:", courseId);
    
    if (!courseId) {
      const errorMsg = "No course selected. Please select a course to book.";
      console.error(errorMsg);
      setError(errorMsg);
      router.push("/courses");
      return;
    }

    // Validate courseId format
    const trimmedId = courseId.trim();
    if (!trimmedId) {
      const errorMsg = `Invalid course selection. Please select a valid course to continue.`;
      console.error(errorMsg, { courseId });
      setError(errorMsg);
      return;
    }

    const fetchCourse = async () => {
      console.log("Starting to fetch course with ID:", courseId);
      try {
        // Ensure courseId is properly encoded and the URL is correctly formed
        if (!courseId) {
          throw new Error("No valid course ID available for API request");
        }
        
        const encodedId = encodeURIComponent(courseId);
        const apiUrl = `/api/courses/${encodedId}`;
        
        console.log("Making API request to:", apiUrl);
        console.log("Encoded courseId:", encodedId);
        console.log("Making API request to:", apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log("Course API response status:", response.status);
        console.log("Course API response data:", data);
        
        if (!response.ok) {
          const errorMsg = data.error || `Failed to fetch course details (${response.status})`;
          console.error("API Error:", errorMsg);
          throw new Error(errorMsg);
        }
        
        if (!data.course) {
          const errorMsg = "Course not found or invalid course data";
          console.error(errorMsg, { data });
          throw new Error(errorMsg);
        }
        
        console.log("Successfully fetched course:", data.course);
        setSelectedCourse(data.course);
        setError(null);
      } catch (err) {
        console.error("Error in fetchCourse:", err);
        const errorMessage = err instanceof Error ? 
          `Failed to load course: ${err.message}` : 
          "An unknown error occurred while loading the course";
        setError(errorMessage);
      }
    };

    fetchCourse().catch(err => {
      console.error("Unhandled error in fetchCourse:", err);
    });
  }, [courseId, router]);

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Booking Error</h2>
          <p className="text-gray-700 mb-4">
            No valid course was selected. Please select a course to continue.
          </p>
          <Link 
            href="/courses" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Booking Request Received!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for your interest in our <span className="font-semibold">{selectedCourse?.title}</span> course.
              We've received your booking request and will contact you shortly to confirm the details.
            </p>
            <div className="mt-8">
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="animate-pulse">
              <p className="text-gray-600">Loading course details...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.preferredDate) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate start and end times from preferred date and time
      const startDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000); // 8 hours default duration

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
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          clientPhone: formData.clientPhone.trim(),
          organization: formData.organization.trim() || null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: formData.additionalNotes.trim() || null,
          price: 0, // Will be set by the API based on course pricing
          status: "PENDING",
          serviceName: `Course: ${selectedCourse?.title}`,
          duration: 480, // 8 hours in minutes
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

