import { NextResponse } from "next/server";
import { verifyTransaction, convertCentsToKes } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * Verify a Paystack transaction
 * GET /api/payments/verify?reference=xxx
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

    // Find order by reference (stored in paymentIntent field)
    // Also try orderNumber as fallback (in case Paystack uses our orderNumber as reference)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentIntent: reference },
          { orderNumber: reference }, // Fallback: Paystack might use our orderNumber as reference
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

    if (!order) {
      return NextResponse.json(
        { error: "Order not found for this transaction" },
        { status: 404 }
      );
    }

    // Verify amount matches
    const expectedAmountInCents = Math.round(Number(order.total) * 100);
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

    // Update order based on transaction status
    // Only update if order is still pending (idempotency check)
    if (verification.data.status === "success") {
      // Only process if order is still pending payment
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

        console.log("✅ Order payment confirmed via verify endpoint:", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reference: verification.data.reference,
        });
      } else {
        console.log("ℹ️ Order already processed, skipping update:", {
          orderId: order.id,
          currentStatus: order.paymentStatus,
        });
      }
    } else if (verification.data.status === "failed") {
      // Only update to failed if still pending
      if (order.paymentStatus === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }
    }

    return NextResponse.json({
      success: verification.data.status === "success",
      status: verification.data.status,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: verification.data.status === "success" ? "PAID" : order.paymentStatus,
      },
      transaction: {
        reference: verification.data.reference,
        amount: convertCentsToKes(verification.data.amount),
        currency: verification.data.currency,
        paidAt: verification.data.paid_at,
      },
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

