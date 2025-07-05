# Stripe Integration Setup Guide

This guide explains how to set up and test the Stripe webhook integration for the Arode Studio photo ordering system.

## Overview

The Stripe integration includes:
- ✅ Webhook handler (`/api/stripe-webhook`) for processing completed payments
- ✅ Checkout session creation API (`/api/create-checkout-session`)
- ✅ Product and price management utilities
- ✅ Order processing with database integration
- ✅ Enhanced success page with order details

## Environment Variables

Make sure these environment variables are set in your `.env.local` and production environment:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (important for redirects)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Webhook Configuration

### 1. Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL to: `https://your-domain.vercel.app/api/stripe-webhook`
4. Select events to send:
   - `checkout.session.completed` ✅ (Required)
   - `payment_intent.succeeded` (Optional)
   - `invoice.payment_succeeded` (Optional for subscriptions)

### 2. Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the "Signing secret" (starts with `whsec_`)
3. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Product Structure

The integration automatically creates Stripe products with this metadata structure:

```json
{
  "photo_id": "uuid-of-photo-in-database",
  "product_type": "digital|print|bundle"
}
```

### Product Types and Prices

- **Digital**: 15€ - High-resolution download
- **Print**: 25€ - Professional print + shipping
- **Bundle**: 35€ - Digital + Print combination

## API Endpoints

### POST `/api/create-checkout-session`

Creates a Stripe checkout session for photo purchases.

**Request Body:**
```json
{
  "items": [
    {
      "photoId": "photo-uuid",
      "productType": "digital|print|bundle",
      "quantity": 1
    }
  ],
  "customerEmail": "customer@example.com",
  "successUrl": "https://your-domain.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://your-domain.com/gallery"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### GET `/api/create-checkout-session?session_id=cs_test_...`

Retrieves session details for the success page.

**Response:**
```json
{
  "session": {
    "id": "cs_test_...",
    "payment_status": "paid",
    "customer_email": "customer@example.com",
    "amount_total": 1500,
    "currency": "eur"
  }
}
```

### POST `/api/stripe-webhook`

Handles Stripe webhook events (internal use only).

## Database Schema

The webhook creates records in these tables:

### `orders` table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  stripe_checkout_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
  total_amount INTEGER, -- Amount in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `order_items` table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  product_type TEXT CHECK (product_type IN ('digital', 'print')),
  price INTEGER NOT NULL, -- Price in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing the Integration

### 1. Local Testing with Stripe CLI

Install Stripe CLI and forward events to your local server:

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Use the webhook secret provided by the CLI
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

### 2. Test Checkout Flow

```javascript
// Example: Create a checkout session
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      {
        photoId: 'your-photo-uuid',
        productType: 'digital',
        quantity: 1
      }
    ],
    customerEmail: 'test@example.com'
  })
})

const { url } = await response.json()
// Redirect user to the checkout URL
window.location.href = url
```

### 3. Test Payment with Stripe Test Cards

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Error Handling

The webhook includes comprehensive error handling:

- ✅ Signature verification
- ✅ Event type validation
- ✅ Database transaction safety
- ✅ Detailed logging
- ✅ Graceful error recovery

## Monitoring

Monitor webhook delivery in:
1. **Stripe Dashboard** → Webhooks → Your endpoint
2. **Application logs** for detailed processing information
3. **Database** for order creation success

## Production Deployment

### 1. Update Environment Variables

```env
# Production Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Production domain
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
```

### 2. Create Production Webhook

1. Create a new webhook in Stripe Dashboard for production
2. Use production URL: `https://your-domain.com/api/stripe-webhook`
3. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

### 3. Test Production Flow

1. Make a real test purchase with a small amount
2. Verify webhook delivery in Stripe Dashboard
3. Check database for correct order creation
4. Confirm customer receives success page

## Security Features

- ✅ **Webhook signature verification** - Prevents fake events
- ✅ **Environment variable validation** - Ensures proper configuration
- ✅ **Database foreign key constraints** - Maintains data integrity
- ✅ **Input validation** - Sanitizes all incoming data
- ✅ **Error logging** - Tracks issues without exposing sensitive data

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL is correct
   - Verify webhook is receiving events

2. **Order not created in database**
   - Check Supabase service role key permissions
   - Verify database table structure
   - Review webhook logs for errors

3. **Photos not found during checkout**
   - Ensure photo UUIDs exist in database
   - Check photo table foreign key relationships
   - Verify gallery associations

### Debug Logs

The webhook provides detailed console logging:

```
✅ Received Stripe webhook event: checkout.session.completed ID: evt_...
💳 Processing completed checkout session: cs_...
📝 Creating order for: customer@email.com Amount: 1500
✅ Order created with ID: order-uuid
✅ Created 1 order items for order: order-uuid
```

## Next Steps

1. **Email Integration**: Implement order confirmation emails using Resend
2. **Digital Delivery**: Create secure download links for digital photos
3. **Print Fulfillment**: Integrate with printing service API
4. **Admin Dashboard**: Build order management interface
5. **Analytics**: Track sales and popular photos

For questions or issues, check the webhook logs and Stripe Dashboard event delivery status.