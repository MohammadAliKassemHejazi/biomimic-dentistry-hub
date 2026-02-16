import express from 'express';
import { getResources } from '../controllers/resource.controller';

const router = express.Router();

router.get('/', getResources);

export default router;
