import express from 'express';
import { getMembers, createMember, updateMember, deleteMember } from '../controllers/leadershipMember.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/', cacheMiddleware(900), getMembers);
router.post('/', authenticate, isAdmin, upload.single('image'), processImage, createMember);
router.put('/:id', authenticate, isAdmin, upload.single('image'), processImage, updateMember);
router.delete('/:id', authenticate, isAdmin, deleteMember);

export default router;
