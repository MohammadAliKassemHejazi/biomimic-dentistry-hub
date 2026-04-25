import express from 'express';
import { getCourses, getCourseBySlug, createCourse, updateCourse, deleteCourse, notifyCourse } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload, processImage } from '../middleware/upload';

const router = express.Router();

router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);
router.post('/:id/notify', notifyCourse);

// Admin routes
router.post('/', authenticate, isAdmin, upload.single('featured_image'), processImage, createCourse);
router.put('/:id', authenticate, isAdmin, upload.single('featured_image'), processImage, updateCourse);
router.delete('/:id', authenticate, isAdmin, deleteCourse);

export default router;
