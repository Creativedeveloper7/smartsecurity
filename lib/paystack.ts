/**
 * Paystack Payment Integration
 * 
 * This module handles Paystack payment initialization and verification.
 * Amounts should be in the smallest currency unit (kobo for NGN, pesewas for GHS, cents for ZAR, etc.)
 * For KES (Kenyan Shillings), amounts should be in cents (multiply by 100)
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  console.warn("⚠️ PAYSTACK_SECRET_KEY is not set. Paystack payments will not work.");
}

if (!PAYSTACK_PUBLIC_KEY) {
  console.warn("⚠️ NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set. Paystack payments will not work.");
}

export interface InitializeTransactionParams {
  email: string;
  amount: number; // Amount in cents (KES * 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  currency?: string; // Default: "KES"
}

export interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string; // "success" | "failed" | "pending"
    reference: string;
    amount: number; // Amount in cents
    currency: string;
    customer: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    metadata: Record<string, any>;
    paid_at: string | null;
    created_at: string;
    gateway_response: string;
  };
}

/**
 * Initialize a Paystack transaction
 * This should be called from the backend API route
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const {
    email,
    amount,
    reference,
    callback_url,
    metadata,
    currency = "KES",
  } = params;

  // Generate reference if not provided
  const transactionReference =
    reference || `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const requestBody = {
    email,
    amount: amount.toString(), // Paystack expects amount as string
    reference: transactionReference,
    currency,
    callback_url,
    metadata: metadata || {},
  };

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to initialize transaction");
    }

    return data;
  } catch (error: any) {
    console.error("Error initializing Paystack transaction:", error);
    throw new Error(error.message || "Failed to initialize Paystack transaction");
  }
}

/**
 * Verify a Paystack transaction
 * This should be called after payment to confirm the transaction status
 */
export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to verify transaction");
    }

    return data;
  } catch (error: any) {
    console.error("Error verifying Paystack transaction:", error);
    throw new Error(error.message || "Failed to verify Paystack transaction");
  }
}

/**
 * Convert KES amount to cents (Paystack format)
 */
export function convertKesToCents(kesAmount: number): number {
  return Math.round(kesAmount * 100);
}

/**
 * Convert cents to KES amount
 */
export function convertCentsToKes(cents: number): number {
  return cents / 100;
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    return false;
  }

  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  return hash === signature;
}



