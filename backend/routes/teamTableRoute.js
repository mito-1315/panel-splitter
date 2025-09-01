import express from 'express';
import { teamsFetcher } from '../controllers/teamTableController.js';
const router = express.Router();

router.get('/team/:themename', teamsFetcher);

export default router;
