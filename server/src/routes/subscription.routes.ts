import express from 'express';
import {
  getStatus,
  createCheckoutSession,
  createPayPalCheckout,
  confirmPayPalSubscription,
  createPortalSession,
} from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/status', getStatus);
router.post('/checkout', createCheckoutSession);
router.post('/paypal/checkout', createPayPalCheckout);
// SV-16b (Iter 3): client calls this after PayPal approval redirect to activate the subscription
router.post('/paypal/confirm', confirmPayPalSubscription);
router.post('/portal', createPortalSession);

export default router;
