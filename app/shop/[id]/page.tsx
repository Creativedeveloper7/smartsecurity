import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Mock data - will be replaced with actual API calls
const mockProduct = {
  id: "1",
  name: "Security Strategy Handbook",
  description: `
    <p>This comprehensive handbook provides detailed guidance on developing and implementing effective security strategies for organizations of all sizes.</p>
    <h2>What's Inside:</h2>
    <ul>
      <li>Risk assessment methodologies</li>
      <li>Security planning frameworks</li>
      <li>Implementation best practices</li>
      <li>Case studies and real-world examples</li>
      <li>Checklists and templates</li>
    </ul>
    <p>Written by a senior security expert at SmartSecurity Consult with over 30 years of experience in high-level security operations.</p>
  `,
  price: 29.99,
  images: ["/placeholder-product.jpg"],
  category: "Publications",
  stock: 50,
  isDigital: false,
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // In production, fetch product by id from database
  if (id !== mockProduct.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center text-sm text-[#007CFF] hover:underline"
        >
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                <span className="text-white/50">Product Image</span>
              </div>
            </div>
            {/* Thumbnail gallery would go here */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <span className="inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
              {mockProduct.category}
            </span>

            {/* Title */}
            <h1 className="text-2xl font-heading font-bold text-[#0A1A33]">
              {mockProduct.name}
            </h1>

            {/* Price */}
            <div className="text-xl font-bold text-[#0A1A33]">
              KSh {mockProduct.price.toFixed(2)}
            </div>

            {/* Description */}
            <div
              className="prose max-w-none text-[#2D3748]"
              dangerouslySetInnerHTML={{ __html: mockProduct.description }}
            />

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm text-[#4A5768]">
              {mockProduct.isDigital ? (
                <>
                  <i className="fa-solid fa-download fa-text"></i>
                  <span>Digital Download - Instant Access</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-box fa-text"></i>
                  <span>In Stock ({mockProduct.stock} available)</span>
                </>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button className="flex-1 rounded-lg bg-[#007CFF] px-8 py-4 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg flex items-center justify-center gap-2">
                <i className="fa-solid fa-cart-shopping fa-text"></i>
                Add to Cart
              </button>
              <button className="rounded-lg border-2 border-[#005B6E] bg-transparent px-6 py-4 text-base font-medium text-[#005B6E] transition-all hover:bg-[#005B6E] hover:text-white">
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
              <h3 className="mb-4 font-heading font-semibold text-[#1F2937]">
                Product Details
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#4A5768]">Category:</dt>
                  <dd className="font-medium text-[#2D3748]">{mockProduct.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A5768]">Format:</dt>
                  <dd className="font-medium text-[#2D3748]">
                    {mockProduct.isDigital ? "Digital" : "Physical"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A5768]">Availability:</dt>
                  <dd className="font-medium text-[#2D3748]">
                    {mockProduct.stock > 0 ? "In Stock" : "Out of Stock"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

