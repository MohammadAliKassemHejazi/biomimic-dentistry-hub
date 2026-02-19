import express from 'express';
import { getResources, createResource, updateResource, deleteResource, downloadResource } from '../controllers/resource.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', authenticate, getResources); // Should public be able to see resources? The old code allowed public access (no auth middleware). But getResources logic now filters. I'll keep it open but filter in controller?
// Wait, `getResources` uses `req.user`. If no auth middleware, `req.user` is undefined.
// Original code had `router.get('/', getResources);` without auth.
// I should probably add `authenticate` middleware but make it optional?
// Or just require auth for resources? Usually resources are protected.
// Let's assume resources are visible to public if access_level is public.
// But `req.user` is needed for role check.
// I will keep it open but add a middleware that populates user if token exists but doesn't fail if not.
// OR just use `authenticate` if the app is mostly private.
// The context says "Authenticated Users: Can access /dashboard, /profile, /courses, /resources".
// So `getResources` should probably be authenticated.
// I will add `authenticate` to `router.get('/', ...)`

router.get('/', authenticate, getResources);
router.post('/:id/download', authenticate, downloadResource);

// Create: Ambassadors and Admins
router.post('/', authenticate, createResource);

// Admin only operations
router.put('/:id', authenticate, isAdmin, updateResource);
router.delete('/:id', authenticate, isAdmin, deleteResource);

export default router;
