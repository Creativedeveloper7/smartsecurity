"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  articleSlug: string;
  articleTitle: string;
}

export function DeleteButton({ articleSlug, articleTitle }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${articleTitle}"?\n\nThis action cannot be undone and will also delete all associated comments.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/articles/${articleSlug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete article");
      }

      // Refresh the page to show updated list
      router.refresh();
      
      // Show success message (optional - you could use a toast library)
      alert("Article deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting article:", err);
      setError(err.message || "Failed to delete article");
      alert(`Error: ${err.message || "Failed to delete article"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error && (
        <span className="text-xs text-red-600 ml-2">{error}</span>
      )}
    </>
  );
}

