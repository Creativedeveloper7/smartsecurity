"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams?.get("product");
  const quantity = parseInt(searchParams?.get("quantity") || "1");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    shippingAddress: "",
  });

  // Fetch product details
  useEffect(() => {
    if (!productId) {
      setError("No product selected");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${productId}`);
        const data = await response.json();
        
        if (data.error || !data.product) {
          setError("Product not found");
        } else {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (!formData.customerEmail || !formData.customerName) {
      setError("Please fill in all required fields");
      setProcessing(false);
      return;
    }

    try {
      // Create order and get Paystack checkout URL
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          shippingAddress: formData.shippingAddress || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to Paystack checkout page
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      console.error("Error initializing payment:", err);
      setError(err.message || "Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-title text-3xl text-[#007CFF] animate-spin mb-4"></i>
          <p className="text-sm text-[#4A5768]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <i className="fa-solid fa-xmark fa-title text-3xl text-red-600"></i>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-heading font-bold text-[#0A1A33]">
            Error
          </h2>
          <p className="mb-6 text-sm text-[#4A5768]">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-6 py-3 text-sm font-medium text-white hover:bg-[#0066CC] transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const subtotal = Number(product.price) * quantity;
  const shipping = product.isDigital ? 0 : 500;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="mb-4 inline-flex items-center text-sm text-[#007CFF] hover:underline"
          >
            <i className="fa-solid fa-arrow-left fa-text mr-2"></i>
            Back to Shop
          </Link>
          <h1 className="mb-2 text-2xl font-heading font-bold text-[#0A1A33]">
            Checkout
          </h1>
          <p className="text-sm text-[#4A5768]">
            Complete your purchase securely with Paystack
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-heading font-semibold text-[#1F2937]">
                Customer Information
              </h2>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="customerName" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                    placeholder="john.doe@example.com"
                  />
                </div>

                {/* Shipping Address (only for physical products) */}
                {!product.isDigital && (
                  <div>
                    <label htmlFor="shippingAddress" className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Shipping Address
                    </label>
                    <textarea
                      id="shippingAddress"
                      rows={3}
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#2D3748] placeholder:text-[#4A5768] focus:border-[#007CFF] focus:outline-none focus:ring-2 focus:ring-[#007CFF]/20"
                      placeholder="Enter your shipping address"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || (!product.isDigital && product.stock === 0)}
                  className="w-full rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-text animate-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <i className="fa-solid fa-arrow-right fa-text"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm sticky top-8">
              <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
                Order Summary
              </h2>

              {/* Product Info */}
              <div className="mb-4 space-y-3">
                <div className="flex items-start gap-3">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#1F2937]">{product.name}</h3>
                    <p className="text-xs text-[#4A5768]">Quantity: {quantity}</p>
                    <p className="text-sm font-semibold text-[#007CFF] mt-1">
                      KSh {Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                <div className="flex justify-between text-sm text-[#4A5768]">
                  <span>Subtotal</span>
                  <span>KSh {subtotal.toFixed(2)}</span>
                </div>
                {!product.isDigital && (
                  <div className="flex justify-between text-sm text-[#4A5768]">
                    <span>Shipping</span>
                    <span>KSh {shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-semibold text-[#0A1A33]">
                  <span>Total</span>
                  <span>KSh {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 rounded-lg bg-[#F3F4F6] p-4">
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-shield-halved fa-text text-[#007CFF] mt-0.5"></i>
                  <div>
                    <p className="text-xs font-medium text-[#1F2937]">Secure Payment</p>
                    <p className="text-xs text-[#4A5768] mt-1">
                      Your payment is processed securely by Paystack
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-title text-3xl text-[#007CFF] animate-spin mb-4"></i>
          <p className="text-sm text-[#4A5768]">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}


