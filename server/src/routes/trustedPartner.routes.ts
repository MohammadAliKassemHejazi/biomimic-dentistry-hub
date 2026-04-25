import express from 'express';
import { getPartners, createPartner, updatePartner, deletePartner } from '../controllers/trustedPartner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { uploadImageOnly, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/', cacheMiddleware(900), getPartners);
// uploadImageOnly rejects non-image files (PDF, doc, etc.) with a clear error.
// This ensures the logo field always contains a displayable image URL.
router.post('/', authenticate, isAdmin, uploadImageOnly.single('logo'), processImage, createPartner);
router.put('/:id', authenticate, isAdmin, uploadImageOnly.single('logo'), processImage, updatePartner);
router.delete('/:id', authenticate, isAdmin, deletePartner);

export default router;
