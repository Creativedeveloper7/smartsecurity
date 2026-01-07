"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  name: string;
  comment: string;
  createdAt: Date | string;
}

interface CommentSectionProps {
  articleSlug: string;
}

export function CommentSection({ articleSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    comment: "",
  });

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${articleSlug}/comments`);
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [articleSlug]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit comment");
      }

      // Add new comment to the list
      setComments([data, ...comments]);
      setFormData({ name: "", comment: "" });
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
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
    <div className="mt-16 border-t border-[#E5E7EB] pt-12">
      <h2 className="mb-8 text-2xl font-heading font-bold text-[#0A1A33]">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="mb-12 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
          Leave a Comment
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#2D3748]">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              minLength={2}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-[#2D3748]">
              Comment *
            </label>
            <textarea
              id="comment"
              required
              minLength={10}
              rows={5}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20 resize-none"
              placeholder="Write your comment here..."
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
              Comment submitted successfully!
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Comment"}
          </button>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-sm text-[#4A5768]">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#4A5768]">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007CFF]/10 text-[#007CFF] font-semibold">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2937]">{comment.name}</div>
                    <div className="text-xs text-[#4A5768]">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#2D3748] whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

