import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
}

/**
 * Generate a unique booking number
 */
export function generateBookingNumber(): string {
  return `BKG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
}
