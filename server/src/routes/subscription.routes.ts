import express from 'express';
import { getStatus, createCheckoutSession, createPortalSession } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/status', getStatus);
router.post('/checkout', createCheckoutSession);
router.post('/portal', createPortalSession);

export default router;
