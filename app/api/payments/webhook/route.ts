import { NextResponse } from "next/server";
import { verifyWebhookSignature, convertCentsToKes } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Paystack Webhook Handler
 * POST /api/payments/webhook
 * 
 * Handles Paystack webhook events, particularly charge.success
 */
export async function POST(request: Request) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature in webhook");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook event
    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const transaction = event.data;

      // Try to find order first
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentIntent: transaction.reference },
            { orderNumber: transaction.reference },
          ],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (order) {
        // Handle order payment
        const expectedAmountInCents = Math.round(Number(order.total) * 100);
        if (transaction.amount !== expectedAmountInCents) {
          console.error("Amount mismatch in webhook for order:", {
            expected: expectedAmountInCents,
            received: transaction.amount,
            reference: transaction.reference,
          });
          return NextResponse.json({ received: true });
        }

        if (order.paymentStatus === "PENDING") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "PROCESSING",
            },
          });

          // Update product stock for physical products
          for (const item of order.items) {
            if (!item.product.isDigital) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });
            }
          }

          console.log("✅ Order payment confirmed via webhook:", {
            orderId: order.id,
            orderNumber: order.orderNumber,
            reference: transaction.reference,
          });
        }
        return NextResponse.json({ received: true });
      }

      // If not an order, try to find booking
      // Try bookingNumber first (most common case)
      let booking = await prisma.booking.findFirst({
        where: {
          bookingNumber: transaction.reference,
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
              contains: transaction.reference,
            },
          },
          include: {
            service: true,
          },
        });

        booking = allBookings.find(b => 
          b.notes?.includes(`[Payment Reference: ${transaction.reference}]`)
        ) || null;
      }

      if (booking) {
        // Handle booking payment
        const expectedAmountInCents = Math.round(Number(booking.price) * 100);
        if (transaction.amount !== expectedAmountInCents) {
          console.error("Amount mismatch in webhook for booking:", {
            expected: expectedAmountInCents,
            received: transaction.amount,
            reference: transaction.reference,
          });
          return NextResponse.json({ received: true });
        }

        if (!booking.paid) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paid: true,
              status: "CONFIRMED",
              notes: booking.notes 
                ? booking.notes.replace(
                    /\[Payment Reference: [^\]]+\]/g,
                    `[Payment Reference: ${transaction.reference} - PAID]`
                  )
                : `[Payment Reference: ${transaction.reference} - PAID]`,
            },
          });

          console.log("✅ Booking payment confirmed via webhook:", {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            reference: transaction.reference,
          });
        }
        return NextResponse.json({ received: true });
      }

      // If neither order nor booking found, log and acknowledge
      console.error("Neither order nor booking found for webhook reference:", transaction.reference);
      return NextResponse.json({ received: true });
    }

    // Always return 200 OK to acknowledge receipt
    // Paystack will retry if we don't return 200
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);
    // Still return 200 to prevent Paystack from retrying
    // Log the error for investigation
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}

