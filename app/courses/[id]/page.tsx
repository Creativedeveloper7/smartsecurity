"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image?: string;
  expandedDescription?: string;
  keyOutcomes?: string[];
  idealAudience?: string;
  deliveryFormat?: string;
  slug?: string;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch course details
  useEffect(() => {
    if (!id) {
      setError("No course ID provided");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch course");
        }

        if (!data.course) {
          throw new Error("Course not found");
        }

        setCourse(data.course);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.preferredDate) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000); // 8 hours default

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "course",
          courseId: id,
          courseTitle: course?.title,
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          clientPhone: formData.clientPhone.trim(),
          organization: formData.organization.trim() || null,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: formData.additionalNotes.trim() || null,
          price: course?.price || "On request",
          status: "PENDING",
          serviceName: `Course: ${course?.title}`,
          duration: 480, // 8 hours in minutes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit booking");
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
      console.error("Error submitting booking:", err);
      setError(err instanceof Error ? err.message : "Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || "Course not found"}</p>
              </div>
            </div>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Booking Request Received!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for your interest in our <span className="font-semibold text-gray-900">{course.title}</span> course.
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Course Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h1 className="text-lg leading-6 font-medium text-gray-900">Course Details</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">View and book this course</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Course Title</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  {course.title}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="prose prose-sm max-w-none">
                    {course.description}
                  </div>
                </dd>
              </div>
              {course.expandedDescription && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Detailed Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="prose prose-sm max-w-none">
                      {course.expandedDescription}
                    </div>
                  </dd>
                </div>
              )}
              {course.keyOutcomes && course.keyOutcomes.length > 0 && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Key Outcomes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {course.keyOutcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Ideal Audience</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.idealAudience || "Not specified"}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Delivery Format</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.deliveryFormat || "Not specified"}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {course.duration || "Not specified"}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  {course.price || "Contact for pricing"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Book This Course</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Fill in your details to book this course.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="clientName"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="clientEmail"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="clientPhone"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  Organization (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="preferredDate"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="preferredTime"
                    required
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
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
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="additionalNotes"
                    rows={3}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Any special requirements or questions you might have..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}