import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, notifyCourse } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getCourses);
router.post('/:id/notify', notifyCourse);

// Admin routes
router.post('/', authenticate, isAdmin, createCourse);
router.put('/:id', authenticate, isAdmin, updateCourse);
router.delete('/:id', authenticate, isAdmin, deleteCourse);

export default router;
