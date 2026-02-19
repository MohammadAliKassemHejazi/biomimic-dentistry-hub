import express from 'express';
import { getUsers, updateUserRole, getAnalytics, getPendingContent, getApplications, updateApplicationStatus } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/analytics', getAnalytics);
router.get('/content/pending', getPendingContent);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
