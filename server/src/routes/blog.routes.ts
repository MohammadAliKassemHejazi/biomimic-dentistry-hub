import express from 'express';
import { getPosts, getPostBySlug, createPost, toggleFavorite, recordView, updatePostStatus } from '../controllers/blog.controller';
import { authenticate, authenticateOptional } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/posts', authenticateOptional, getPosts);
router.get('/posts/:slug', authenticateOptional, getPostBySlug);

router.post('/posts', authenticate, upload.single('featured_image'), createPost);
router.post('/posts/:id/favorite', authenticate, toggleFavorite);
router.post('/posts/:id/view', authenticateOptional, recordView);

router.patch('/posts/:id/status', authenticate, isAdmin, updatePostStatus);

export default router;
