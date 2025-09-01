import express from 'express';
import { saveDurationConfig, getDurationConfig } from '../controllers/panelTableController.js';

const router = express.Router();

router.post('/duration', saveDurationConfig);
router.get('/duration', getDurationConfig);

export default router;
