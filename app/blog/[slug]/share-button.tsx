"use client";

export function ShareButton({ title, excerpt }: { title: string; excerpt: string }) {
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: excerpt,
            url: window.location.href,
          });
        } catch (err) {
          // User cancelled or error occurred
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 hover:text-[#007CFF] transition-colors"
    >
      <i className="fa-regular fa-share-nodes fa-text"></i>
      Share
    </button>
  );
}

