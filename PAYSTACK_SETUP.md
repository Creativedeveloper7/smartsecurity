# Paystack Payment Integration Setup

This application uses Paystack for processing payments. The integration uses Paystack's **redirect checkout** method, which redirects users to Paystack's secure checkout page.

## Payment Flow

1. **Customer clicks "Proceed to Checkout"** → Redirects to `/checkout` page
2. **Customer fills in details** → Name, email, shipping address (if needed)
3. **Customer clicks "Proceed to Payment"** → Order is created and Paystack transaction is initialized
4. **Redirect to Paystack** → Customer is redirected to Paystack's checkout page
5. **Payment completion** → Paystack redirects back to `/payment/callback`
6. **Verification** → Transaction is verified and order status is updated
7. **Webhook** → Paystack sends webhook event to confirm payment (backup verification)

## Environment Variables

Add these to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Your Paystack Secret Key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx  # Your Paystack Public Key (optional, for future use)

# Base URL (for callback URLs)
NEXTAUTH_URL=http://localhost:3000  # Development
# NEXTAUTH_URL=https://yourdomain.com  # Production
```

### Getting Your Paystack Keys

1. Sign up at [Paystack](https://paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** (starts with `sk_test_` for test, `sk_live_` for live)
4. Copy your **Public Key** (starts with `pk_test_` for test, `pk_live_` for live)

## Webhook Configuration

1. Go to your Paystack Dashboard → **Settings** → **API Keys & Webhooks**
2. Add your webhook URL:
   - **Test**: `http://localhost:3000/api/payments/webhook` (use ngrok for local testing)
   - **Production**: `https://yourdomain.com/api/payments/webhook`
3. Select the event: **charge.success**

### Testing Webhooks Locally

For local development, use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL in your Paystack webhook settings.

## API Routes

### `POST /api/payments/checkout`
Creates an order and initializes Paystack transaction. Returns authorization URL for redirect.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "shippingAddress": "123 Main St" // Optional, only for physical products
}
```

**Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "ORD-1234567890-ABC",
  "orderId": "order_id",
  "orderNumber": "ORD-1234567890-ABC"
}
```

### `GET /api/payments/verify?reference=xxx`
Verifies a Paystack transaction after payment.

### `POST /api/payments/webhook`
Handles Paystack webhook events (charge.success).

## Pages

### `/checkout`
Checkout page where customers enter their information before being redirected to Paystack.

**Query Parameters:**
- `product`: Product ID
- `quantity`: Quantity (default: 1)

### `/payment/callback`
Callback page where Paystack redirects users after payment.

**Query Parameters:**
- `reference`: Transaction reference from Paystack

## Order Status Flow

1. **PENDING** → Order created, payment not yet completed
2. **PROCESSING** → Payment successful, order being processed
3. **SHIPPED** → Order shipped (manual update by admin)
4. **DELIVERED** → Order delivered (manual update by admin)
5. **CANCELLED** → Order cancelled

## Payment Status

1. **PENDING** → Payment not yet completed
2. **PAID** → Payment successful
3. **FAILED** → Payment failed
4. **REFUNDED** → Payment refunded

## Important Notes

1. **Amount Format**: All amounts are stored in KES (Kenyan Shillings) in the database, but converted to cents (KES * 100) when sending to Paystack.

2. **Stock Management**: Physical product stock is automatically decremented when payment is confirmed.

3. **Digital Products**: Digital products have `shipping = 0` and don't require shipping addresses.

4. **Security**: 
   - Never expose your `PAYSTACK_SECRET_KEY` in frontend code
   - Always verify webhook signatures
   - Always verify transaction amounts match before updating order status

5. **Testing**: Use Paystack test keys for development. Test card numbers are available in Paystack dashboard.

## Testing

### Test Card Numbers (Paystack Test Mode)

- **Successful**: `4084084084084081`
- **Declined**: `5060666666666666666`
- **Insufficient Funds**: `5060666666666666667`

Use any future expiry date, any CVV, and any PIN.

## Troubleshooting

### Payment not redirecting
- Check that `PAYSTACK_SECRET_KEY` is set correctly
- Verify the callback URL is accessible
- Check browser console for errors

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check Paystack dashboard for webhook delivery logs
- Ensure webhook endpoint returns 200 OK

### Transaction verification fails
- Verify the reference matches the order
- Check that amount matches (in cents)
- Ensure order exists in database




