import express from 'express';
import { listAmbassadors, applyAmbassador } from '../controllers/ambassador.controller';

const router = express.Router();

router.get('/', listAmbassadors);
router.post('/apply', applyAmbassador);

export default router;
