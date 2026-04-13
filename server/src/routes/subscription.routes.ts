import express from 'express';
import { getStatus, createCheckoutSession, createPayPalCheckout, createPortalSession } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/status', getStatus);
router.post('/checkout', createCheckoutSession);
router.post('/paypal/checkout', createPayPalCheckout);
router.post('/portal', createPortalSession);

export default router;
