import express from 'express';
import { listAmbassadors, applyAmbassador } from '../controllers/ambassador.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', listAmbassadors);
router.post('/apply', authenticate, applyAmbassador);

export default router;
