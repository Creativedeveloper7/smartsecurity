import { NextResponse } from "next/server";
import { initializeTransaction, convertKesToCents } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Initialize a Paystack payment transaction
 * POST /api/payments/initialize
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, customerEmail, customerName, callbackUrl } = body;

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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Initialize Paystack transaction
    const amountInCents = convertKesToCents(total);
    const reference = order.orderNumber;

    const callbackUrlToUse = callbackUrl || `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/callback`;

    const paystackResponse = await initializeTransaction({
      email: customerEmail,
      amount: amountInCents,
      reference,
      callback_url: callbackUrlToUse,
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

    return NextResponse.json({
      success: true,
      accessCode: paystackResponse.data.access_code,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to initialize payment",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



