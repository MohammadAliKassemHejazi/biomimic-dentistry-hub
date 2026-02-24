import express from 'express';
import { getPartners, createPartner, updatePartner, deletePartner } from '../controllers/trustedPartner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getPartners);
router.post('/', authenticate, isAdmin, createPartner);
router.put('/:id', authenticate, isAdmin, updatePartner);
router.delete('/:id', authenticate, isAdmin, deletePartner);

export default router;
