# Booking Payment Integration Guide

## Overview
Payment integration has been added for service bookings (courses and services). Bookings with a price > 0 will automatically redirect to Paystack checkout after creation.

## Implementation Details

### 1. API Endpoints

#### `/api/payments/checkout-booking` (POST)
Creates a Paystack transaction for a booking.

**Request Body:**
```json
{
  "bookingId": "string",
  "customerEmail": "string",
  "customerName": "string"
}
```

**Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "BKG-123-ABC",
  "bookingId": "string",
  "bookingNumber": "string"
}
```

#### `/api/payments/verify-booking` (GET)
Verifies a Paystack transaction for a booking.

**Query Parameters:**
- `reference`: Payment reference from Paystack

**Response:**
```json
{
  "success": true,
  "status": "success",
  "booking": {
    "id": "string",
    "bookingNumber": "string",
    "paid": true
  },
  "transaction": {
    "reference": "string",
    "amount": 5000.00,
    "currency": "KES",
    "paidAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Booking Flow

1. **User submits booking form** → Creates booking via `/api/bookings`
2. **API checks if payment required** → If `price > 0`, returns `requiresPayment: true`
3. **Frontend redirects to payment** → Calls `/api/payments/checkout-booking`
4. **User redirected to Paystack** → Completes payment on Paystack checkout page
5. **Paystack redirects back** → `/payment/booking-callback?reference=...`
6. **Callback verifies payment** → Calls `/api/payments/verify-booking`
7. **Booking updated** → `paid: true`, `status: CONFIRMED`

### 3. Webhook Integration

The webhook handler (`/api/payments/webhook`) now supports both:
- **Orders**: Product purchases
- **Bookings**: Service/course bookings

The webhook automatically detects which type based on the reference:
- Orders: Found by `paymentIntent` or `orderNumber`
- Bookings: Found by `bookingNumber` or payment reference in `notes`

### 4. Payment Reference Storage

**Note**: The `Booking` model doesn't have a `paymentIntent` field (unlike `Order`). The payment reference is temporarily stored in the `notes` field as:
```
[Payment Reference: BKG-123-ABC]
```

After payment confirmation, it's updated to:
```
[Payment Reference: BKG-123-ABC - PAID]
```

**Future Enhancement**: Consider adding a `paymentIntent` field to the `Booking` model for cleaner separation.

### 5. Frontend Integration

All booking forms have been updated to:
1. Create booking via `/api/bookings`
2. Check if `requiresPayment` is true
3. If yes, automatically call `/api/payments/checkout-booking`
4. Redirect user to Paystack checkout
5. Handle payment callback

**Updated Forms:**
- `/app/bookings/course/page.tsx`
- `/app/courses/[id]/page.tsx`
- `/app/bookings/page.tsx`

### 6. Free Bookings

Bookings with `price = 0` or `price = null` will:
- Be created successfully
- Skip payment flow
- Show success message immediately
- Status remains `PENDING` (admin can confirm manually)

### 7. Error Handling

- **Booking creation fails**: Error shown to user, no booking created
- **Payment initialization fails**: Booking created but error shown, user can retry payment
- **Payment verification fails**: Error shown on callback page, user can contact support
- **Webhook fails**: Logged for investigation, user can manually verify payment

### 8. Idempotency

Both verify endpoint and webhook check:
- `booking.paid === false` before updating
- Prevents duplicate payment processing
- Safe to call multiple times

## Testing

### Test Booking Payment Flow

1. **Create a booking with price > 0:**
   ```bash
   POST /api/bookings
   {
     "courseId": "...",
     "clientName": "Test User",
     "clientEmail": "test@example.com",
     "clientPhone": "+254700000000",
     "preferredDate": "2024-12-31",
     "preferredTime": "10:00"
   }
   ```

2. **Check response for `requiresPayment: true`**

3. **Initialize payment:**
   ```bash
   POST /api/payments/checkout-booking
   {
     "bookingId": "...",
     "customerEmail": "test@example.com",
     "customerName": "Test User"
   }
   ```

4. **Complete payment on Paystack** (use test cards)

5. **Verify payment:**
   ```bash
   GET /api/payments/verify-booking?reference=BKG-...
   ```

6. **Check booking in database:**
   - `paid` should be `true`
   - `status` should be `CONFIRMED`
   - `notes` should contain payment reference

## Environment Variables

Same as product payments:
```env
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
NEXTAUTH_URL=http://localhost:3000
```

## Webhook Configuration

The same webhook URL handles both orders and bookings:
```
https://your-domain.com/api/payments/webhook
```

No additional webhook configuration needed.

## Database Schema

Current `Booking` model:
```prisma
model Booking {
  id            String        @id @default(cuid())
  bookingNumber String        @unique
  clientName    String
  clientEmail   String
  clientPhone   String
  serviceId     String
  startTime     DateTime
  endTime       DateTime
  status        BookingStatus @default(PENDING)
  notes         String?       // Stores payment reference temporarily
  price         Decimal
  paid          Boolean       @default(false)
  ...
}
```

**Note**: Consider adding `paymentIntent String?` field in future migration for cleaner payment reference storage.



