import express from 'express';
import { getResources, createResource, updateResource, deleteResource, downloadResource } from '../controllers/resource.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getResources);
router.post('/:id/download', downloadResource);

// Admin routes
router.post('/', authenticate, isAdmin, createResource);
router.put('/:id', authenticate, isAdmin, updateResource);
router.delete('/:id', authenticate, isAdmin, deleteResource);

export default router;
