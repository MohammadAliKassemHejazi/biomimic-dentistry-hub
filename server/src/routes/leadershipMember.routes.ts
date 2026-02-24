import express from 'express';
import { getMembers, createMember, updateMember, deleteMember } from '../controllers/leadershipMember.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getMembers);
router.post('/', authenticate, isAdmin, upload.single('image'), createMember);
router.put('/:id', authenticate, isAdmin, upload.single('image'), updateMember);
router.delete('/:id', authenticate, isAdmin, deleteMember);

export default router;
