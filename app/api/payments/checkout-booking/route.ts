import { NextResponse } from "next/server";
import { initializeTransaction, convertKesToCents } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Create booking and redirect to Paystack checkout
 * POST /api/payments/checkout-booking
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingId,
      customerEmail,
      customerName,
    } = body;

    // Validate required fields
    if (!bookingId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Booking ID, customer email, and customer name are required" },
        { status: 400 }
      );
    }

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is already paid
    if (booking.paid) {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 400 }
      );
    }

    // Check if booking price is valid
    const bookingPrice = Number(booking.price);
    if (bookingPrice <= 0) {
      return NextResponse.json(
        { error: "Booking price must be greater than zero" },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const amountInCents = convertKesToCents(bookingPrice);
    const reference = booking.bookingNumber;

    // Set callback URL - user will be redirected here after payment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/payment/booking-callback`;

    const paystackResponse = await initializeTransaction({
      email: customerEmail,
      amount: amountInCents,
      reference,
      callback_url: callbackUrl,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName,
        serviceId: booking.serviceId,
        serviceName: booking.service.name,
        price: bookingPrice,
      },
      currency: "KES",
    });

    // Update booking with payment reference (store in notes or create a new field)
    // For now, we'll store it in a JSON field in notes or use a separate approach
    // Since Booking model doesn't have paymentIntent, we'll store it temporarily
    // and update it when payment is verified
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        notes: booking.notes 
          ? `${booking.notes}\n[Payment Reference: ${paystackResponse.data.reference}]`
          : `[Payment Reference: ${paystackResponse.data.reference}]`,
      },
    });

    // Return the authorization URL for redirect
    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
    });
  } catch (error: any) {
    console.error("Error creating booking checkout:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create booking checkout",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



