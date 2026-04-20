import express from 'express';
import { subscribe, getSubscribers, deleteSubscriber } from '../controllers/newsletter.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.post('/', subscribe);
router.get('/', authenticate, isAdmin, getSubscribers);
router.delete('/:id', authenticate, isAdmin, deleteSubscriber);

export default router;
