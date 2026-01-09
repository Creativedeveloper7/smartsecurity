"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isDigital: boolean;
  createdAt: Date | string;
}

const productCategories = ["All", "Publications", "Digital Downloads", "Merchandise", "Reports", "Training Materials"];

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedImageIndex(0);
    document.body.style.overflow = "unset";
  };

  const handleShare = async () => {
    if (!selectedProduct) return;
    
    const url = `${window.location.origin}/shop/${selectedProduct.slug}`;
    const shareData = {
      title: selectedProduct.name,
      text: selectedProduct.description,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        alert("Product link copied to clipboard!");
      }
    } catch (err) {
      // User cancelled or error occurred
      console.error("Error sharing:", err);
    }
  };

  const handleCheckout = () => {
    if (!selectedProduct) return;
    // Redirect to checkout page with product ID
    router.push(`/checkout?product=${selectedProduct.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-[#4A5768]">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-xl font-heading font-bold text-[#0A1A33]">
            Shop
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
            Browse publications, reports, and professional resources
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {productCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#007CFF] text-white"
                    : "bg-white text-[#2D3748] hover:bg-[#F3F4F6]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 pl-10 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
              />
              <i className="fa-solid fa-magnifying-glass fa-text absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5768]"></i>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5768] hover:text-[#007CFF] transition-colors"
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark fa-text"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-left shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-white/50">Product Image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="mb-2 inline-block text-xs font-medium text-[#005B6E]">
                    {product.category}
                  </span>

                  {/* Product Name */}
                  <h3 className="mb-2 text-sm font-heading font-semibold text-[#1F2937] group-hover:text-[#007CFF] transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 text-sm text-[#4A5768]">
                    {product.description}
                  </p>

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-[#0A1A33]">
                        KSh {Number(product.price).toFixed(2)}
                      </div>
                      {product.isDigital && (
                        <div className="text-xs text-[#4A5768]">Digital Download</div>
                      )}
                      {!product.isDigital && product.stock > 0 && (
                        <div className="text-xs text-[#4A5768]">
                          {product.stock} in stock
                        </div>
                      )}
                      {!product.isDigital && product.stock === 0 && (
                        <div className="text-xs text-red-600">Out of stock</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="rounded-lg bg-[#007CFF] p-2 text-white transition-colors hover:bg-[#0066CC]"
                      aria-label="View product"
                    >
                      <i className="fa-solid fa-eye fa-text"></i>
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <i className="fa-solid fa-bag-shopping fa-subtitle mb-4 text-4xl text-[#4A5768]"></i>
            <p className="text-sm text-[#4A5768]">
              No products found matching your criteria.
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-sm text-[#007CFF] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative my-8 w-full max-w-5xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#007CFF]"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-xl"></i>
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Product Images */}
                <div className="bg-[#F3F4F6] p-6">
                  {/* Main Image */}
                  <div className="aspect-square w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white mb-4">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img
                        src={selectedProduct.images[selectedImageIndex]}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0A1A33] to-[#005B6E]">
                        <span className="text-white/50">Product Image</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImageIndex === index
                              ? "border-[#007CFF]"
                              : "border-[#E5E7EB] hover:border-[#007CFF]/50"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-8">
                  {/* Category Badge */}
                  <span className="mb-4 inline-block rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#005B6E]">
                    {selectedProduct.category}
                  </span>

                  {/* Product Name */}
                  <h1 className="mb-2 text-xl font-heading font-bold leading-tight text-[#0A1A33]">
                    {selectedProduct.name}
                  </h1>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-[#0A1A33]">
                      KSh {Number(selectedProduct.price).toFixed(2)}
                    </div>
                    {selectedProduct.isDigital && (
                      <div className="mt-1 text-sm text-[#4A5768]">Digital Download</div>
                    )}
                    {!selectedProduct.isDigital && (
                      <div className="mt-1 text-sm text-[#4A5768]">
                        {selectedProduct.stock > 0 ? (
                          <span className="text-green-600">{selectedProduct.stock} in stock</span>
                        ) : (
                          <span className="text-red-600">Out of stock</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="mb-2 text-sm font-semibold text-[#1F2937]">Description</h2>
                    <p className="text-sm leading-relaxed text-[#4A5768] whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCheckout}
                      disabled={!selectedProduct.isDigital && selectedProduct.stock === 0}
                      className="w-full rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedProduct.isDigital ? "Purchase & Download" : "Proceed to Checkout"}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-base font-medium text-[#2D3748] transition-all hover:bg-[#F3F4F6] flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-share-nodes fa-text"></i>
                      Share Product
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                    <div className="space-y-2 text-xs text-[#4A5768]">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-box fa-text"></i>
                        <span>SKU: {selectedProduct.slug}</span>
                      </div>
                      {selectedProduct.createdAt && (
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar fa-text"></i>
                          <span>
                            Added {new Date(selectedProduct.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
