import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Using default API version or let it be handled by package
});

export default stripe;
