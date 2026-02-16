import express from 'express';
import { sendMessage } from '../controllers/contact.controller';

const router = express.Router();

router.post('/', sendMessage);

export default router;
