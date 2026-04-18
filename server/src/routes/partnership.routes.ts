import express from 'express';
import { PartnershipRequest } from '../models';
import { upload, processImage } from '../middleware/upload';
import { authenticateOptional } from '../middleware/auth.middleware';

const router = express.Router();

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
