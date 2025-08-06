# Mock PSP Server

This is a simulated Payment Service Provider (PSP) server using JSON Server to test hexagonal architecture payment processing.

## Quick Start

```bash
# Install dependencies
npm install

# Start the mock PSP server
npm start
```

The server will run on http://localhost:3001

## API Endpoints

### Payments

- `POST /v1/payment_intents` - Create a payment
- `GET /v1/payment_intents/:id` - Get payment details

### Refunds

- `POST /v1/refunds` - Create a refund

### Special Test Cases

Send specific amounts to trigger different behaviors:

- Amount `666` cents → Payment fails (`requires_payment_method`)
- Amount `777` cents → Payment goes to processing state
- Any other amount → Payment succeeds immediately

## Example Payment Request

```bash
curl -X POST http://localhost:3001/v1/payment_intents \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "usd",
    "description": "Test payment",
    "payment_method": {
      "type": "card",
      "card": {
        "number": "4242424242424242",
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
      }
    },
    "metadata": {
      "merchant_id": "1",
      "domain_payment_id": "payment_123"
    }
  }'
```

## Webhook Simulation

The server automatically generates webhook events for successful payments. In a real scenario, these would be sent to your application's webhook endpoint.

## Integration with Main App

Make sure your main application is configured to use this mock PSP:

```env
MOCK_PSP_URL=http://localhost:3001
```