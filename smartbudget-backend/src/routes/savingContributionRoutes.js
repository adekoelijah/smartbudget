import express from "express";

import {
  createContribution,
  getContributions,
  getContributionById,
  getContributionStats,
  getGoalContributions,
} from "../config/controllers/savingContributionController.js";

import protect  from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * =========================================================
 * AUTHENTICATION
 * =========================================================
 */

router.use(protect);

/*
 * =========================================================
 * CREATE CONTRIBUTION
 * =========================================================
 *
 * POST /api/savings/contributions
 */
router.post(
  "/",
  createContribution
);

/*
 * =========================================================
 * CONTRIBUTION STATISTICS
 * =========================================================
 *
 * GET /api/savings/contributions/stats
 *
 * Keep this before /:contributionId.
 */
router.get(
  "/stats",
  getContributionStats
);

/*
 * =========================================================
 * USER CONTRIBUTIONS
 * =========================================================
 *
 * GET /api/savings/contributions
 */
router.get(
  "/",
  getContributions
);

/*
 * =========================================================
 * GOAL CONTRIBUTIONS
 * =========================================================
 *
 * GET /api/savings/contributions/goal/:goalId
 */
router.get(
  "/goal/:goalId",
  getGoalContributions
);

/*
 * =========================================================
 * SINGLE CONTRIBUTION
 * =========================================================
 *
 * GET /api/savings/contributions/:contributionId
 */
router.get(
  "/:contributionId",
  getContributionById
);

export default router;