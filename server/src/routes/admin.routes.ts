import express from 'express';
import { getUsers, updateUserRole, getAnalytics } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/analytics', getAnalytics);

export default router;
