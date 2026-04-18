import express from 'express';
import { listAmbassadors, applyAmbassador } from '../controllers/ambassador.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload, processImage } from '../middleware/upload';

const router = express.Router();

router.get('/', listAmbassadors);
router.post('/apply', authenticate, upload.single('cv'), processImage, applyAmbassador);

export default router;
