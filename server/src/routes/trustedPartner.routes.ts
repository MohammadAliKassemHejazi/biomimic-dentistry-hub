import express from 'express';
import { getPartners, createPartner, updatePartner, deletePartner } from '../controllers/trustedPartner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getPartners);
router.post('/', authenticate, isAdmin, upload.single('logo'), createPartner);
router.put('/:id', authenticate, isAdmin, upload.single('logo'), updatePartner);
router.delete('/:id', authenticate, isAdmin, deletePartner);

export default router;
