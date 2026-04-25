/**
 * SV-16 (Iter 3) — Stripe & PayPal webhook handlers.
 *
 * WHY WEBHOOKS:
 *   Stripe/PayPal never write to our DB directly. After a user completes checkout,
 *   both services call these endpoints with event details. Without them the
 *   Subscription table is never updated and `GET /api/subscriptions/status`
 *   always returns { subscribed: false }.
 *
 * BODY PARSER:
 *   Both routes use `express.raw({ type: 'application/json' })` (applied at the route
 *   level in webhook.routes.ts). The raw Buffer is required for Stripe's signature
 *   verification and for PayPal's HMAC verification.
 *   The webhook router is mounted BEFORE `express.json()` in index.ts so the global
 *   json parser never processes these requests.
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../utils/stripe';
import { Subscription, User, SubscriptionPlan } from '../models';
import { SubscriptionStatus, UserRole } from '../types/enums';
import { clearUserCache } from '../middleware/auth.middleware';

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Maps plan keys to user roles. 'gold' is the DB plan key for the VIP tier. */
const PLAN_KEY_TO_ROLE: Record<string, UserRole> = {
  bronze: UserRole.BRONZE,
  silver: UserRole.SILVER,
  gold: UserRole.VIP,   // 'gold' plan key → 'vip' DB role (existing convention)
  vip: UserRole.VIP,    // fallback in case plan key is stored as 'vip'
};

/**
 * Upsert a Subscription row and update the user's role.
 * Uses findOrCreate on userId (unique) then updates if already exists,
 * making the operation idempotent on webhook retries.
 */
async function activateSubscription(
  userId: string,
  externalSubId: string,  // Stripe sub_xxx OR PayPal I-xxx (dual-purpose column for Iter 3)
  priceOrPlanId: string,
  periodEnd: Date,
  planKey?: string
): Promise<void> {
  const [sub, created] = await Subscription.findOrCreate({
    where: { userId },
    defaults: {
      stripeSubscriptionId: externalSubId,
      stripePriceId: priceOrPlanId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  if (!created) {
    await sub.update({
      stripeSubscriptionId: externalSubId,
      stripePriceId: priceOrPlanId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    });
  }

  if (planKey) {
    const newRole = PLAN_KEY_TO_ROLE[planKey];
    if (newRole) {
      await User.update({ role: newRole }, { where: { id: userId } });
      // SV-14: invalidate the 30s in-process cache so the next request sees the new role.
      clearUserCache(userId);
    }
  }
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).json({ message: 'Missing stripe-signature header' });
    return;
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook:stripe] STRIPE_WEBHOOK_SECRET is not set — cannot verify events');
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  let event: Stripe.Event;
  try {
    // req.body is a raw Buffer here (express.raw middleware in webhook.routes.ts)
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig as string,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('[webhook:stripe] Signature verification failed:', err.message);
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Cast to any: @types/stripe v8 conflicts with Stripe SDK v20 types
        const session = event.data.object as any;
        // Only handle subscription-mode checkouts
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.userId;
        const planKey = session.metadata?.planKey;

        if (!userId || !session.subscription) {
          console.warn('[webhook:stripe] checkout.session.completed: missing userId or subscription');
          break;
        }

        const stripeSubId = session.subscription as string;
        // Fetch the full subscription to get price ID and period end
        // Cast to any: @types/stripe v8 (legacy) conflicts with Stripe SDK v20 built-in types
        const sub = await stripe.subscriptions.retrieve(stripeSubId) as any;

        await activateSubscription(
          userId,
          stripeSubId,
          sub.items.data[0]?.price.id ?? '',
          new Date(sub.current_period_end * 1000),
          planKey
        );

        console.log(`[webhook:stripe] Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        // Cast to any: @types/stripe v8 conflicts with Stripe SDK v20 types
        const sub = event.data.object as any;

        const existingSub = await Subscription.findOne({
          where: { stripeSubscriptionId: sub.id },
        });

        if (!existingSub) {
          console.warn(`[webhook:stripe] subscription.updated: no local record for ${sub.id}`);
          break;
        }

        await existingSub.update({
          status: sub.status as SubscriptionStatus,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          stripePriceId: sub.items.data[0]?.price.id ?? existingSub.stripePriceId,
        });

        // Invalidate the user cache so role/sub state is fresh on the next request
        clearUserCache(existingSub.userId);
        console.log(`[webhook:stripe] Subscription updated for user ${existingSub.userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Cast to any: @types/stripe v8 conflicts with Stripe SDK v20 types
        const sub = event.data.object as any;

        const existingSub = await Subscription.findOne({
          where: { stripeSubscriptionId: sub.id },
        });

        if (!existingSub) {
          console.warn(`[webhook:stripe] subscription.deleted: no local record for ${sub.id}`);
          break;
        }

        await existingSub.update({ status: SubscriptionStatus.CANCELED });
        // Revert user role to base USER
        await User.update({ role: UserRole.USER }, { where: { id: existingSub.userId } });
        clearUserCache(existingSub.userId);
        console.log(`[webhook:stripe] Subscription cancelled for user ${existingSub.userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        if (!subId) break;

        await Subscription.update(
          { status: SubscriptionStatus.PAST_DUE },
          { where: { stripeSubscriptionId: subId } }
        );
        console.log(`[webhook:stripe] Payment failed — marked past_due for ${subId}`);
        break;
      }

      default:
        // Non-critical event — acknowledge without processing
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[webhook:stripe] Event processing error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ─── PayPal ──────────────────────────────────────────────────────────────────

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured');

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) throw new Error(`PayPal auth failed: ${response.statusText}`);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Verify the PayPal webhook signature via the PayPal API.
 * IMPORTANT: if PAYPAL_WEBHOOK_ID is not set, we skip verification and only
 * log a warning. This is acceptable in dev/staging but must NOT be used in
 * production without the env var set — an attacker could spoof events.
 */
async function verifyPayPalSignature(
  headers: Record<string, string>,
  rawBody: string
): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn(
      '[webhook:paypal] PAYPAL_WEBHOOK_ID not set — skipping signature verification. ' +
      'Set this env var in production to prevent event spoofing.'
    );
    return true;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    const data = (await response.json()) as { verification_status: string };
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('[webhook:paypal] Signature verification error:', err);
    return false;
  }
}

export const paypalWebhook = async (req: Request, res: Response): Promise<void> => {
  // req.body is a raw Buffer (express.raw middleware)
  const rawBody = (req.body as Buffer).toString('utf8');

  const headers: Record<string, string> = {};
  const paypalHeaders = [
    'paypal-auth-algo',
    'paypal-cert-id',
    'paypal-transmission-id',
    'paypal-transmission-sig',
    'paypal-transmission-time',
  ];
  paypalHeaders.forEach((h) => {
    const val = req.headers[h];
    if (val) headers[h] = val as string;
  });

  const verified = await verifyPayPalSignature(headers, rawBody);
  if (!verified) {
    res.status(400).json({ message: 'PayPal webhook signature invalid' });
    return;
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ message: 'Invalid JSON payload' });
    return;
  }

  try {
    const { event_type, resource } = event as { event_type: string; resource: any };

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // resource.id = PayPal subscription ID (e.g. "I-XXXXXXXX")
        // resource.subscriber.email_address = subscriber's email
        // resource.plan_id = PayPal billing plan ID
        const paypalSubId: string = resource?.id;
        const subscriberEmail: string = resource?.subscriber?.email_address;
        const paypalPlanId: string = resource?.plan_id;

        if (!paypalSubId || !subscriberEmail) {
          console.warn('[webhook:paypal] BILLING.SUBSCRIPTION.ACTIVATED: missing id or email');
          break;
        }

        // Resolve our userId from the subscriber's email
        const user = await User.findOne({ where: { email: subscriberEmail } });
        if (!user) {
          console.warn(
            `[webhook:paypal] BILLING.SUBSCRIPTION.ACTIVATED: no user found for email ${subscriberEmail}`
          );
          break;
        }

        // Look up plan details for role assignment
        const plan = await SubscriptionPlan.findOne({ where: { paypalPlanId } });

        // Approximate period end (PayPal doesn't always include the next billing date)
        const interval = plan?.interval ?? 'month';
        const periodEnd = new Date(
          Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
        );

        await activateSubscription(
          user.id as string,
          paypalSubId,   // stored in stripeSubscriptionId column (dual-purpose in Iter 3)
          paypalPlanId,
          periodEnd,
          plan?.key
        );

        console.log(`[webhook:paypal] Subscription activated for user ${user.id}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const paypalSubId: string = resource?.id;
        if (!paypalSubId) break;

        // stripeSubscriptionId column stores both Stripe and PayPal IDs in Iter 3
        const existingSub = await Subscription.findOne({
          where: { stripeSubscriptionId: paypalSubId },
        });
        if (!existingSub) {
          console.warn(`[webhook:paypal] BILLING.SUBSCRIPTION.CANCELLED: no record for ${paypalSubId}`);
          break;
        }

        await existingSub.update({ status: SubscriptionStatus.CANCELED });
        await User.update({ role: UserRole.USER }, { where: { id: existingSub.userId } });
        clearUserCache(existingSub.userId);
        console.log(`[webhook:paypal] Subscription cancelled for user ${existingSub.userId}`);
        break;
      }

      default:
        // Other PayPal events (PAYMENT.SALE.COMPLETED, etc.) — acknowledge and ignore
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[webhook:paypal] Event processing error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};
