import express from 'express';
import {
  getUsers, updateUserRole, getAnalytics, getPendingContent, getApplications, updateApplicationStatus,
  uploadPartnershipKit, getPartnershipKit,
  uploadPartnerTemplate, getPartnerTemplates,
  getPartnerApplications, updatePartnerApplicationStatus,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

// SV-01: every /admin/* route must be behind authenticate + isAdmin.
// Previously `/settings/partnership-kit` and `/settings/partner-templates` were mounted
// BEFORE `router.use(authenticate, isAdmin)` and were therefore publicly readable.
router.use(authenticate, isAdmin);

router.get('/settings/partnership-kit', cacheMiddleware(3600), getPartnershipKit);
router.get('/settings/partner-templates', getPartnerTemplates);

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/analytics', getAnalytics);
router.get('/content/pending', getPendingContent);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

router.post('/settings/partnership-kit', upload.single('file'), processImage, uploadPartnershipKit);
router.post('/settings/partner-templates/:tier', upload.single('file'), processImage, uploadPartnerTemplate);

router.get('/partner-applications', getPartnerApplications);
router.patch('/partner-applications/:id/status', updatePartnerApplicationStatus);

export default router;
