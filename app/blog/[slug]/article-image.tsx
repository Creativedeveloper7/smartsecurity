"use client";

interface ArticleImageProps {
  src: string;
  alt: string;
}

export function ArticleImage({ src, alt }: ArticleImageProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full object-cover"
        loading="eager"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    </div>
  );
}

