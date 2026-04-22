import Stripe from 'stripe';

// SV-08: fail fast if the Stripe key is missing — previously `as string` hid the bug
// until the first checkout request, which surfaced as a cryptic 500.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  // Using default API version or let it be handled by package
});

export default stripe;
