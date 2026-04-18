import express from 'express';
import { getPosts, getPostBySlug, createPost, toggleFavorite, getFavorites, recordView, updatePostStatus } from '../controllers/blog.controller';
import { authenticate, authenticateOptional } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImages } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/posts', authenticateOptional, cacheMiddleware(300), getPosts);
router.get('/posts/:slug', authenticateOptional, cacheMiddleware(300), getPostBySlug);

router.get('/favorites', authenticate, getFavorites);
router.post('/posts', authenticate, upload.fields([{ name: 'featured_image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), processImages, createPost);
router.post('/posts/:id/favorite', authenticate, toggleFavorite);
router.post('/posts/:id/view', authenticateOptional, recordView);

router.patch('/posts/:id/status', authenticate, isAdmin, updatePostStatus);

export default router;
