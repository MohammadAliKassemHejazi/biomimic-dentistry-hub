import express from 'express';
import { PartnershipRequest } from '../models';
import { upload, processImage } from '../middleware/upload';
import { authenticateOptional } from '../middleware/auth.middleware';
import { getPartnerTemplates } from '../controllers/admin.controller';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

/**
 * PUBLIC — anyone applying to a partnership tier needs to download the
 * template for that tier. This is a read-only view of the same data that
 * admins manage via POST /admin/settings/partner-templates/:tier.
 * Cached for 5 minutes so the admin's upload is reflected quickly.
 */
router.get('/templates', cacheMiddleware(300), getPartnerTemplates);

router.post('/apply', authenticateOptional, upload.single('applicationFile'), processImage, async (req, res) => {
  try {
    const { name, email, companyName, message, tier } = req.body;
    const applicationFile = req.file ? `/uploads/${req.file.filename}` : undefined;
    const userId = (req as any).user?.id;

    await PartnershipRequest.create({
      name,
      email,
      companyName,
      message,
      tier,
      applicationFile,
      userId,
    });

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting partnership application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
