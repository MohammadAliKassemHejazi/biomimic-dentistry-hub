import express from 'express';
import { getProfile, getPurchases, getStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.get('/purchases', getPurchases);
router.get('/stats', getStats);

export default router;
