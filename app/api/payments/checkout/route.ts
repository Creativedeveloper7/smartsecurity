import { NextResponse } from "next/server";
import { initializeTransaction, convertKesToCents } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Create order and redirect to Paystack checkout
 * POST /api/payments/checkout
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, customerEmail, customerName, shippingAddress } = body;

    // Validate required fields
    if (!productId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Product ID, customer email, and customer name are required" },
        { status: 400 }
      );
    }

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock availability for physical products
    if (!product.isDigital && product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock available" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const subtotal = Number(product.price) * quantity;
    const tax = 0; // You can add tax calculation here
    const shipping = product.isDigital ? 0 : 500; // 500 KES shipping for physical products
    const total = subtotal + tax + shipping;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create order in database (pending status)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail,
        customerName,
        shippingAddress: shippingAddress || null,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price,
          },
        },
      },
    });

    // Initialize Paystack transaction
    const amountInCents = convertKesToCents(total);
    const reference = order.orderNumber;

    // Set callback URL - user will be redirected here after payment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/payment/callback`;

    const paystackResponse = await initializeTransaction({
      email: customerEmail,
      amount: amountInCents,
      reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName,
        productId: product.id,
        productName: product.name,
        quantity,
      },
      currency: "KES",
    });

    // Update order with payment reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntent: paystackResponse.data.reference,
      },
    });

    // Return the authorization URL for redirect
    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create checkout",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



