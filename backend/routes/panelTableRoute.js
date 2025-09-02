import express from 'express';
import { saveDurationConfig, getDurationConfig, savePanels, fetchPanels } from '../controllers/panelTableController.js';

const router = express.Router();

router.post('/duration', saveDurationConfig);
router.get('/duration', getDurationConfig);
router.post('/savePanels', savePanels);
router.get('/panels', fetchPanels);

export default router;
