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

      // Find order by reference
      const order = await prisma.order.findFirst({
        where: {
          paymentIntent: transaction.reference,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        console.error("Order not found for webhook reference:", transaction.reference);
        // Still return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
      }

      // Verify amount matches
      const expectedAmountInCents = Math.round(Number(order.total) * 100);
      if (transaction.amount !== expectedAmountInCents) {
        console.error("Amount mismatch in webhook:", {
          expected: expectedAmountInCents,
          received: transaction.amount,
          reference: transaction.reference,
        });
        // Still return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
      }

      // Only update if order is still pending
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

