import express from 'express';
import { getPosts, getPostBySlug } from '../controllers/blog.controller';

const router = express.Router();

router.get('/posts', getPosts);
router.get('/posts/:slug', getPostBySlug);

export default router;
