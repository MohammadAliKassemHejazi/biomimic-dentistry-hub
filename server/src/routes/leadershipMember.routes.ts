import express from 'express';
import { getMembers, createMember, updateMember, deleteMember } from '../controllers/leadershipMember.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getMembers);
router.post('/', authenticate, isAdmin, createMember);
router.put('/:id', authenticate, isAdmin, updateMember);
router.delete('/:id', authenticate, isAdmin, deleteMember);

export default router;
