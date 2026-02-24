import { Request, Response } from 'express';
import { User, Subscription } from '../models';
import stripe from '../utils/stripe';
import { SubscriptionStatus } from '../types/enums';

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

    res.json({
      subscribed: true,
      product_id: subscription.stripePriceId,
      subscription_end: subscription.currentPeriodEnd.toISOString(),
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

    const user = await User.findByPk(userId);
    let customerId = user?.stripeCustomerId;

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findByPk(userId);

    if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
