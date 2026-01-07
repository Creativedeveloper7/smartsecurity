"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  name: string;
  comment: string;
  approved: boolean;
  createdAt: Date | string;
}

interface CommentManagementProps {
  articleSlug: string;
  initialComments: Comment[];
}

export function CommentManagement({
  articleSlug,
  initialComments,
}: CommentManagementProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  const filteredComments =
    filter === "all"
      ? comments
      : filter === "approved"
      ? comments.filter((c) => c.approved)
      : comments.filter((c) => !c.approved);

  const handleApprove = async (commentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      });

      if (response.ok) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, approved: true } : c
          )
        );
      }
    } catch (error) {
      console.error("Error approving comment:", error);
      alert("Failed to approve comment");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: false }),
      });

      if (response.ok) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, approved: false } : c
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting comment:", error);
      alert("Failed to reject comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-sm font-medium text-[#4A5768]">Total Comments</div>
          <div className="mt-1 text-2xl font-bold text-[#0A1A33]">
            {comments.length}
          </div>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-sm font-medium text-[#4A5768]">Approved</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {comments.filter((c) => c.approved).length}
          </div>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <div className="text-sm font-medium text-[#4A5768]">Pending</div>
          <div className="mt-1 text-2xl font-bold text-orange-600">
            {comments.filter((c) => !c.approved).length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#007CFF] text-white"
              : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
          }`}
        >
          All ({comments.length})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "approved"
              ? "bg-[#007CFF] text-white"
              : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
          }`}
        >
          Approved ({comments.filter((c) => c.approved).length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-[#007CFF] text-white"
              : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
          }`}
        >
          Pending ({comments.filter((c) => !c.approved).length})
        </button>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="text-sm text-[#4A5768]">No comments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border bg-white p-6 shadow-sm ${
                comment.approved
                  ? "border-green-200 bg-green-50/30"
                  : "border-orange-200 bg-orange-50/30"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007CFF]/10 text-[#007CFF] font-semibold">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2937]">{comment.name}</div>
                    <div className="text-xs text-[#4A5768]">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      comment.approved
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {comment.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#2D3748] whitespace-pre-wrap">
                {comment.comment}
              </p>
              <div className="flex gap-2">
                {!comment.approved && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={loading}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {comment.approved && (
                  <button
                    onClick={() => handleReject(comment.id)}
                    disabled={loading}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

