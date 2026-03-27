import express from 'express';
import { getPosts, getPostBySlug, createPost, toggleFavorite, recordView, updatePostStatus } from '../controllers/blog.controller';
import { authenticate, authenticateOptional } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

router.get('/posts', authenticateOptional, cacheMiddleware(300), getPosts);
router.get('/posts/:slug', authenticateOptional, cacheMiddleware(300), getPostBySlug);

router.post('/posts', authenticate, upload.single('featured_image'), processImage, createPost);
router.post('/posts/:id/favorite', authenticate, toggleFavorite);
router.post('/posts/:id/view', authenticateOptional, recordView);

router.patch('/posts/:id/status', authenticate, isAdmin, updatePostStatus);

export default router;
