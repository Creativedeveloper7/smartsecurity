"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  videoId: string;
  videoTitle: string;
}

export function DeleteButton({ videoId, videoTitle }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDeleteClick = () => {
    setShowDialog(true);
    setError("");
  };

  const handleCancel = () => {
    setShowDialog(false);
    setError("");
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete video");
      }

      // Close dialog and show success
      setShowDialog(false);
      setShowSuccess(true);

      // Refresh the page to show updated list
      router.refresh();

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error deleting video:", err);
      setError(err.message || "Failed to delete video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={loading}
        className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Delete
      </button>

      {/* Delete Confirmation Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
              aria-label="Close dialog"
            >
              <i className="fa-solid fa-xmark fa-text text-lg"></i>
            </button>

            {/* Dialog Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <i className="fa-solid fa-triangle-exclamation fa-text text-xl text-red-600"></i>
                </div>
              </div>

              <h3 className="mb-2 text-center text-lg font-semibold text-[#0A1A33]">
                Delete Video
              </h3>

              <p className="mb-6 text-center text-sm text-[#4A5768]">
                Are you sure you want to delete <span className="font-medium text-[#0A1A33]">"{videoTitle}"</span>?
                <br />
                <span className="mt-1 block text-xs text-red-600">
                  This action cannot be undone.
                </span>
              </p>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#2D3748] transition-colors hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check-circle fa-text text-green-600"></i>
            <span className="text-sm font-medium text-green-700">
              Video deleted successfully!
            </span>
          </div>
        </div>
      )}
    </>
  );
}
