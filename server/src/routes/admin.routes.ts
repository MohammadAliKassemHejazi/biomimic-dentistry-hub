import express from 'express';
import { getUsers, updateUserRole, getAnalytics, getPendingContent, getApplications, updateApplicationStatus, uploadPartnershipKit, getPartnershipKit } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/settings/partnership-kit', cacheMiddleware(3600), getPartnershipKit);

router.use(authenticate, isAdmin);

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/analytics', getAnalytics);
router.get('/content/pending', getPendingContent);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

router.post('/settings/partnership-kit', upload.single('file'), processImage, uploadPartnershipKit);

export default router;
