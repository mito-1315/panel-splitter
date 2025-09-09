import express from 'express';
import { downloadPanel, downloadAllPanels, getAvailablePanels } from '../controllers/panelDownloadController.js';

const router = express.Router();

/**
 * @swagger
 * /api/panel/available:
 *   get:
 *     summary: Get list of available panel numbers
 *     tags: [Panel Download]
 *     responses:
 *       200:
 *         description: List of available panel numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       500:
 *         description: Server error
 */
router.get('/panel/available', getAvailablePanels);

/**
 * @swagger
 * /api/panel/download/all:
 *   get:
 *     summary: Download CSV data for all panels
 *     tags: [Panel Download]
 *     responses:
 *       200:
 *         description: CSV file with all panel data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: No panel data found
 *       500:
 *         description: Server error
 */
router.get('/panel/download/all', downloadAllPanels);

/**
 * @swagger
 * /api/panel/download/{panelNumber}:
 *   get:
 *     summary: Download CSV data for a specific panel
 *     tags: [Panel Download]
 *     parameters:
 *       - in: path
 *         name: panelNumber
 *         required: true
 *         description: Panel number to download
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CSV file with panel data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: Panel not found
 *       500:
 *         description: Server error
 */
router.get('/panel/download/:panelNumber', downloadPanel);

export default router;
