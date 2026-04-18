import express from 'express';
import { sendMessage, getMessages, updateMessageStatus } from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

router.post('/', sendMessage);
router.get('/', authenticate, isAdmin, getMessages);
router.patch('/:id/status', authenticate, isAdmin, updateMessageStatus);

export default router;
