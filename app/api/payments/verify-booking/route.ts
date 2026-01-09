import { NextResponse } from "next/server";
import { verifyTransaction, convertCentsToKes } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Verify a Paystack transaction for a booking
 * GET /api/payments/verify-booking?reference=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const verification = await verifyTransaction(reference);

    // Find booking by reference (bookingNumber or payment reference in notes)
    // Try bookingNumber first (most common case)
    let booking = await prisma.booking.findFirst({
      where: {
        bookingNumber: reference,
      },
      include: {
        service: true,
      },
    });

    // If not found by bookingNumber, try to find by payment reference in notes
    if (!booking) {
      const allBookings = await prisma.booking.findMany({
        where: {
          notes: {
            contains: reference,
          },
        },
        include: {
          service: true,
        },
      });

      // Find the booking with the exact payment reference
      booking = allBookings.find(b => 
        b.notes?.includes(`[Payment Reference: ${reference}]`)
      ) || null;
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found for this transaction" },
        { status: 404 }
      );
    }

    // Verify amount matches
    const expectedAmountInCents = Math.round(Number(booking.price) * 100);
    if (verification.data.amount !== expectedAmountInCents) {
      console.error("Amount mismatch:", {
        expected: expectedAmountInCents,
        received: verification.data.amount,
      });
      return NextResponse.json(
        { error: "Transaction amount mismatch" },
        { status: 400 }
      );
    }

    // Update booking based on transaction status
    // Only update if booking is not already paid (idempotency check)
    if (verification.data.status === "success") {
      if (!booking.paid) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paid: true,
            status: "CONFIRMED", // Update status to confirmed when paid
            notes: booking.notes 
              ? booking.notes.replace(
                  /\[Payment Reference: [^\]]+\]/g,
                  `[Payment Reference: ${verification.data.reference} - PAID]`
                )
              : `[Payment Reference: ${verification.data.reference} - PAID]`,
          },
        });

        console.log("✅ Booking payment confirmed via verify endpoint:", {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          reference: verification.data.reference,
        });
      } else {
        console.log("ℹ️ Booking already paid, skipping update:", {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
        });
      }
    } else if (verification.data.status === "failed") {
      // Only update notes if still unpaid
      if (!booking.paid) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            notes: booking.notes 
              ? booking.notes.replace(
                  /\[Payment Reference: [^\]]+\]/g,
                  `[Payment Reference: ${verification.data.reference} - FAILED]`
                )
              : `[Payment Reference: ${verification.data.reference} - FAILED]`,
          },
        });
      }
    }

    return NextResponse.json({
      success: verification.data.status === "success",
      status: verification.data.status,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        paid: verification.data.status === "success" ? true : booking.paid,
      },
      transaction: {
        reference: verification.data.reference,
        amount: convertCentsToKes(verification.data.amount),
        currency: verification.data.currency,
        paidAt: verification.data.paid_at,
      },
    });
  } catch (error: any) {
    console.error("Error verifying booking payment:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to verify booking payment",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

