import express, { Request, Response } from 'express';
import { SiteSetting } from '../models';

const router = express.Router();

/**
 * GET /api/settings/partnership-kit
 * Public endpoint — returns the partnership kit download URL that was set by
 * an admin via POST /api/admin/settings/partnership-kit.
 *
 * The partnership kit is a marketing document (PDF) visible to anyone visiting
 * the public site, so no authentication is required to read the URL.
 * Only the WRITE endpoint is admin-protected.
 */
router.get('/partnership-kit', async (_req: Request, res: Response) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: 'partnership_kit_url' } });
    res.json({ url: setting?.value ?? null });
  } catch {
    res.json({ url: null });
  }
});

export default router;
