import express from 'express';
import { getPartners, createPartner, updatePartner, deletePartner } from '../controllers/trustedPartner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/', cacheMiddleware(900), getPartners);
router.post('/', authenticate, isAdmin, upload.single('logo'), processImage, createPartner);
router.put('/:id', authenticate, isAdmin, upload.single('logo'), processImage, updatePartner);
router.delete('/:id', authenticate, isAdmin, deletePartner);

export default router;
