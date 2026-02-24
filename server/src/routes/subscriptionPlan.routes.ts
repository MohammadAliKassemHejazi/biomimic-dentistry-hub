import express from 'express';
import { getPlans, updatePlan, seedPlans } from '../controllers/subscriptionPlan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getPlans);
router.post('/seed', authenticate, isAdmin, seedPlans);
router.put('/:id', authenticate, isAdmin, updatePlan);

export default router;
