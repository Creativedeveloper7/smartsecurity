"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  published: boolean;
  createdAt: Date | string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete course");
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-[#4A5768]">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 w-fit"
              >
                <i className="mr-2 fa-regular fa-arrow-left"></i> Back to Dashboard
              </Link>
              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
                <h1 className="text-2xl font-bold">Manage Courses</h1>
                <Link
                  href="/admin/courses/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <i className="mr-2 fa-regular fa-plus"></i> New Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-12 text-center">
            <i className="fa-regular fa-graduation-cap fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
            <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
              No courses yet
            </h3>
            <p className="mb-6 text-sm text-[#4A5768]">
              Get started by creating your first course.
            </p>
            <Link
              href="/admin/courses/new"
              className="inline-block rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F3F4F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4A5768]">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4A5768]">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4A5768]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#4A5768]">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#4A5768]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#1F2937]">
                        {course.title}
                      </div>
                      <div className="text-xs text-[#4A5768]">{course.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2D3748]">
                      {course.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          course.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A5768]">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="text-[#007CFF] hover:text-[#0066CC] transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

