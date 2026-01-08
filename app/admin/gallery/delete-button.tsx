"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DeleteButtonProps {
  imageId: string;
  imageTitle: string;
}

export function DeleteButton({ imageId, imageTitle }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!confirm(`Are you sure you want to delete "${imageTitle}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete gallery image");
      }

      alert(`Gallery image "${imageTitle}" deleted successfully!`);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting gallery image:", error);
      alert(error.message || "Failed to delete gallery image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 text-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}

