"use client";

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
  createdAt: Date | string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses?published=true");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    document.body.style.overflow = "unset";
  };

  const handleShare = async () => {
    if (!selectedCourse) return;

    const url = `${window.location.origin}/courses/${selectedCourse.slug}`;
    const shareData = {
      title: selectedCourse.title,
      text: selectedCourse.description,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("Course link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleBookCourse = () => {
    if (!selectedCourse) return;
    // This will be handled by the Link component now
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-[#4A5768]">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
              Professional Security Courses
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
              Expert-led consultation and guided sessions designed to enhance your organization&apos;s security capabilities
            </p>
          </div>

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => handleViewCourse(course)}
                >
                  {/* Course Image */}
                  {course.image && (
                    <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="mb-3 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                      {course.title}
                    </h3>
                    <p className="mb-6 line-clamp-3 text-xs leading-relaxed text-[#4A5768]">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#007CFF]">
                        {course.price}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCourse(course);
                        }}
                        className="flex items-center text-xs font-medium text-[#007CFF] hover:underline"
                      >
                        View Course
                        <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <i className="fa-solid fa-graduation-cap fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
              <p className="text-sm text-[#4A5768]">No courses available at the moment.</p>
            </div>
          )}

          {/* Information Section */}
          <div className="mt-16 rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
                Course Delivery Method
              </h2>
              <p className="text-sm text-[#2D3748] leading-relaxed">
                All courses are delivered through personalized consultation sessions and guided training programs.
                Each course is tailored to your organization&apos;s specific needs and security context, ensuring
                practical, actionable outcomes that align with international best practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      {isModalOpen && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative my-8 w-full max-w-5xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-xl"></i>
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Course Image */}
                <div className="bg-[#F3F4F6] p-6">
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                    {selectedCourse.image ? (
                      <img
                        src={selectedCourse.image}
                        alt={selectedCourse.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                        <span className="text-white/50">Course Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-8">
                  {/* Course Title */}
                  <h1 className="mb-2 text-xl font-heading font-bold leading-tight text-[#0A1A33]">
                    {selectedCourse.title}
                  </h1>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-[#0A1A33]">
                      {selectedCourse.price}
                    </div>
                  </div>

                  {/* Brief Description */}
                  <div className="mb-6">
                    <p className="text-sm leading-relaxed text-[#4A5768]">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Expanded Description */}
                  <div className="mb-6">
                    <h2 className="mb-2 text-sm font-semibold text-[#1F2937]">Course Overview</h2>
                    <p className="text-sm leading-relaxed text-[#4A5768] whitespace-pre-wrap">
                      {selectedCourse.expandedDescription}
                    </p>
                  </div>

                  {/* Key Outcomes */}
                  {selectedCourse.keyOutcomes && selectedCourse.keyOutcomes.length > 0 && (
                    <div className="mb-6">
                      <h2 className="mb-3 text-sm font-semibold text-[#1F2937]">Key Outcomes</h2>
                      <ul className="space-y-2">
                        {selectedCourse.keyOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-[#2D3748]">
                            <i className="fa-solid fa-check fa-text mt-0.5 shrink-0 text-[#007CFF]"></i>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Course Details Grid */}
                  <div className="mb-6 grid grid-cols-1 gap-4 border-t border-[#E5E7EB] pt-6">
                    <div>
                      <h3 className="mb-1 text-xs font-semibold text-[#1F2937]">Ideal Audience</h3>
                      <p className="text-xs leading-relaxed text-[#2D3748]">
                        {selectedCourse.idealAudience}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-xs font-semibold text-[#1F2937]">Delivery Format</h3>
                      <p className="text-xs text-[#2D3748]">{selectedCourse.deliveryFormat}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-xs font-semibold text-[#1F2937]">Duration</h3>
                      <p className="text-xs text-[#2D3748]">{selectedCourse.duration}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      href={{
                        pathname: '/bookings/course',
                        query: { courseId: selectedCourse.id }
                      }}
                      as={`/bookings/course?courseId=${encodeURIComponent(selectedCourse.id)}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                    >
                      Book Now
                    </Link>

                    <button
                      onClick={handleShare}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-base font-medium text-[#2D3748] transition-all hover:bg-[#F3F4F6] flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-share-nodes fa-text"></i>
                      Share Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
