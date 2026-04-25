import { Request, Response } from 'express';
import { User, Subscription } from '../models';
import { SubscriptionPlan } from '../models/SubscriptionPlan.model';
import stripe from '../utils/stripe';
import { createPayPalSubscription, getPayPalSubscription } from '../utils/paypal';
import { SubscriptionStatus, UserRole } from '../types/enums';
import { clearUserCache } from '../middleware/auth.middleware';

// Plan key → User role mapping (mirrors webhook.controller.ts)
const PLAN_KEY_TO_ROLE: Record<string, UserRole> = {
  bronze: UserRole.BRONZE,
  silver: UserRole.SILVER,
  gold: UserRole.VIP,
  vip: UserRole.VIP,
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const subscription = await Subscription.findOne({
      where: { userId },
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return res.json({
        subscribed: false,
        product_id: null,
        subscription_end: null,
      });
    }

    // SV-09: currentPeriodEnd can be null (e.g. lifetime / trialing without set end) —
    // guard the .toISOString() call so we don't crash with a 500.
    res.json({
      subscribed: true,
      product_id: subscription.stripePriceId,
      subscription_end: subscription.currentPeriodEnd
        ? subscription.currentPeriodEnd.toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { price_id } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) return res.status(401).json({ message: 'Unauthorized' });

    if (typeof price_id !== 'string' || !price_id) {
      return res.status(400).json({ message: 'price_id is required' });
    }

    // SV-03: validate price_id against our registered SubscriptionPlan table.
    const plan = await SubscriptionPlan.findOne({ where: { stripePriceId: price_id } });
    if (!plan) {
      return res.status(400).json({ message: 'Invalid price_id' });
    }

    let customerId = req.user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: userId as string },
      });
      customerId = customer.id;
      await User.update({ stripeCustomerId: customerId }, {
        where: { id: userId },
      });
    }

    const clientUrl = process.env.CLIENT_URL;
    const successUrl = clientUrl
      ? `${clientUrl}/subscription?success=true`
      : 'http://localhost:3000/subscription?success=true';
    const cancelUrl = clientUrl
      ? `${clientUrl}/subscription?canceled=true`
      : 'http://localhost:3000/subscription?canceled=true';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: userId as string, planKey: plan.key },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPayPalCheckout = async (req: Request, res: Response) => {
  try {
    const { plan_key } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!plan_key) return res.status(400).json({ message: 'plan_key is required' });

    const plan = await SubscriptionPlan.findOne({ where: { key: plan_key } });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (!plan.paypalPlanId) {
      return res.status(400).json({ message: 'This plan does not have a PayPal billing plan configured. Please contact support.' });
    }

    const clientUrl = process.env.CLIENT_URL;
    const returnBase = clientUrl ?? 'http://localhost:3000';

    const { approveUrl } = await createPayPalSubscription(
      plan.paypalPlanId,
      `${returnBase}/subscription?paypal_success=true`,
      `${returnBase}/subscription?canceled=true`
    );

    res.json({ url: approveUrl });
  } catch (error) {
    console.error('Error creating PayPal checkout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * SV-16b (Iter 3) — Confirm a PayPal subscription after the user approves it.
 *
 * Flow:
 *   1. User clicks "Pay with PayPal" → redirected to PayPal approval page.
 *   2. User approves → PayPal redirects to /subscription?paypal_success=true&subscription_id=I-xxx
 *   3. Client extracts subscription_id from URL and calls this endpoint (authenticated).
 *   4. We fetch the PayPal sub, verify ACTIVE, upsert Subscription, update User.role.
 *
 * NOTE: stripeSubscriptionId column stores the PayPal subscription ID here.
 * This dual-purpose usage is intentional for Iter 3; a dedicated paypalSubscriptionId
 * column will be added in Iter 4 once migration tooling (SV-06) ships.
 */
export const confirmPayPalSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { subscription_id } = req.body;
    if (!subscription_id || typeof subscription_id !== 'string') {
      return res.status(400).json({ message: 'subscription_id is required' });
    }

    // Fetch and verify the subscription from PayPal
    let paypalSub: any;
    try {
      paypalSub = await getPayPalSubscription(subscription_id);
    } catch (err) {
      console.error('PayPal subscription fetch failed:', err);
      return res.status(502).json({ message: 'Could not verify subscription with PayPal' });
    }

    if (paypalSub.status !== 'ACTIVE') {
      return res.status(400).json({
        message: `Subscription is not active yet (PayPal status: ${paypalSub.status}). Please wait a moment and try again.`,
      });
    }

    const paypalPlanId: string = paypalSub.plan_id;
    const plan = await SubscriptionPlan.findOne({ where: { paypalPlanId } });

    // Approximate period end from plan interval (PayPal subscriptions API doesn't always
    // return the next billing date in the basic subscription object)
    const interval = plan?.interval ?? 'month';
    const periodEnd = new Date(
      Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
    );

    // Upsert the Subscription row
    const [sub, created] = await Subscription.findOrCreate({
      where: { userId },
      defaults: {
        stripeSubscriptionId: subscription_id, // PayPal sub ID stored here (Iter 3)
        stripePriceId: paypalPlanId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    if (!created) {
      await sub.update({
        stripeSubscriptionId: subscription_id,
        stripePriceId: paypalPlanId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    }

    // Update user role if plan key is recognized
    if (plan?.key) {
      const newRole = PLAN_KEY_TO_ROLE[plan.key];
      if (newRole) {
        await User.update({ role: newRole }, { where: { id: userId } });
        clearUserCache(userId as string);
      }
    }

    res.json({ success: true, message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Error confirming PayPal subscription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const customerId = req.user?.stripeCustomerId;

    if (!customerId) {
      return res.status(400).json({ message: 'No billing account found' });
    }

    const clientUrl = process.env.CLIENT_URL;
    const returnUrl = clientUrl
      ? `${clientUrl}/subscription`
      : 'http://localhost:3000/subscription';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
