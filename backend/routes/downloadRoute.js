import express from 'express';
import { downloadTheme, downloadAllThemes } from '../controllers/downloadController.js';

const router = express.Router();

router.get('/download/:theme', downloadTheme);
router.get('/bro/all', downloadAllThemes);

export default router;