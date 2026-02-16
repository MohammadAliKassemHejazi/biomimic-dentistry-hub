import express from 'express';
import { getProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/profile', authenticate, getProfile);

export default router;
