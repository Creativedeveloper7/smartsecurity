// app/bookings/course/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

export default function CourseBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams?.get("courseId") || "";

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
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch course details
  useEffect(() => {
    if (!courseId) {
      setError("No course selected. Please select a course to book.");
      return;
    }

    const fetchCourse = async () => {
      try {
        console.log("Fetching course with ID:", courseId);
        const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`);
        const data = await response.json();
        
        console.log("Course API response:", { status: response.status, data });
        
        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch course (${response.status})`);
        }
        
        if (!data.course) {
          throw new Error("Course not found");
        }
        
        setCourse(data.course);
        setError(null);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err instanceof Error 
            ? `Failed to load course: ${err.message}`
            : "An error occurred while loading the course"
        );
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          courseId: course.id,
          serviceName: course.title,
          price: course.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book course");
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
      console.error("Error booking course:", err);
      setError(
        err instanceof Error
          ? `Booking failed: ${err.message}`
          : "An error occurred while booking the course"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for booking {course?.title}. We'll be in touch shortly to
            confirm the details.
          </p>
          <Link
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Course
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/courses"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h1 className="text-lg leading-6 font-medium text-gray-900">
              {course.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Complete the form below to book this course
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.description}
                </dd>
              </div>
              {course.expandedDescription && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {course.expandedDescription}
                  </dd>
                </div>
              )}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.duration}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.price}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Booking Information
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Please fill in your details to complete the booking
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="clientName"
                      required
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="clientEmail"
                      required
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, clientEmail: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="clientPhone"
                      required
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, clientPhone: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="organization"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="preferredDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Preferred Date *
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="preferredDate"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.preferredDate}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredDate: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="preferredTime"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Preferred Time *
                  </label>
                  <div className="mt-1">
                    <select
                      id="preferredTime"
                      required
                      value={formData.preferredTime}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredTime: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="additionalNotes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Additional Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="additionalNotes"
                      rows={3}
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalNotes: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Any special requirements or questions you might have..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/courses")}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Book Now"
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