/**
 * SV-16 (Iter 3) — Webhook routes for Stripe and PayPal.
 *
 * CRITICAL: Both routes use express.raw() as route-level middleware.
 * This router MUST be mounted in index.ts BEFORE app.use(express.json()).
 * If the global json parser runs first, it consumes the body and
 * stripe.webhooks.constructEvent() will throw a 400 signature error.
 */
import express from 'express';
import { stripeWebhook, paypalWebhook } from '../controllers/webhook.controller';

const router = express.Router();

// Stripe requires the raw Buffer body for constructEvent() signature check
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// PayPal also needs the raw body for HMAC verification
router.post(
  '/paypal',
  express.raw({ type: 'application/json' }),
  paypalWebhook
);

export default router;
