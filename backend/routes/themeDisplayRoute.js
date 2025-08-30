import express from 'express';
import { themeDisplay } from '../controllers/themeDisplayController.js';

/**
 * @swagger
 * tags:
 *   name: Themes
 *   description: Theme display API
 */

const router = express.Router();

/**
 * @swagger
 * /themes/{parameter}:
 *   get:
 *     summary: Get theme by parameter
 *     description: Returns theme information for the given parameter
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: parameter
 *         required: true
 *         schema:
 *           type: string
 *         description: The theme parameter to look up
 *     responses:
 *       200:
 *         description: Theme found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 theme:
 *                   type: string
 *                   example: dark
 *       404:
 *         description: Theme not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Theme not found
 */
router.get('/themes/:parameter', themeDisplay);

export default router;
