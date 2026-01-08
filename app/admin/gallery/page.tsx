import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "./delete-button";

export const dynamic = 'force-dynamic';

async function getGalleryImages() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });
    return images;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
}

export default async function AdminGalleryPage() {
  const session = await getSession();

  if (
    !session ||
    ((session.user as any)?.role !== "ADMIN" &&
      (session.user as any)?.role !== "SUPER_ADMIN")
  ) {
    redirect("/admin/login");
  }

  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Link
                href="/admin"
                className="text-xs sm:text-sm text-[#4A5768] hover:text-[#007CFF] transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-[#0A1A33]">
                Manage Gallery
              </h1>
            </div>
            <Link
              href="/admin/gallery/new"
              className="w-full sm:w-auto text-center rounded-lg bg-[#007CFF] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg"
            >
              Add Image
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-sm text-[#4A5768] mb-4">
              No gallery images found.
            </p>
            <Link
              href="/admin/gallery/new"
              className="inline-block rounded-lg bg-[#007CFF] px-4 py-2 text-base font-medium text-white hover:bg-[#0066CC] transition-colors"
            >
              Add First Image
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image: any) => (
              <div
                key={image.id}
                className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-1 line-clamp-1">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-xs text-[#4A5768] mb-3 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/gallery/${image.id}/edit`}
                      className="flex-1 text-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#2D3748] hover:bg-[#F3F4F6] transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton 
                      imageId={image.id} 
                      imageTitle={image.title}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

