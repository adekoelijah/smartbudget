// routes/savingsGoalRoutes.js

import express from "express";

import {
  createSavingGoalController,
  getUserSavingGoalsController,
  getSavingGoalController,
  getSavingSummaryController,
  getGoalContributionsController,
  getSavingHistoryController,
  checkSavingEligibilityController,
} from "../config/controllers/savingsGoalController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/**
 * All saving-goal routes require authentication.
 *
 * Ownership is always determined from:
 *
 *   req.user.id
 *
 * Never trust userId from:
 * - params
 * - query
 * - request body
 */
router.use(protect);

/* =========================================================
   CREATE SAVING GOAL
========================================================= */

/**
 * POST /api/savings/goals
 *
 * Creates a new saving goal.
 */
router.post(
  "/",
  createSavingGoalController
);

/* =========================================================
   LIST SAVING GOALS
========================================================= */

/**
 * GET /api/savings/goals
 *
 * Query:
 * ?page=1
 * ?limit=20
 * ?status=active
 */
router.get(
  "/",
  getUserSavingGoalsController
);

/* =========================================================
   GOAL-SPECIFIC ROUTES
   IMPORTANT:
   These must come BEFORE /:goalId
========================================================= */

/**
 * GET /api/savings/goals/:goalId/summary
 */
router.get(
  "/:goalId/summary",
  getSavingSummaryController
);

/**
 * GET /api/savings/goals/:goalId/contributions
 *
 * Query:
 * ?page=1
 * ?limit=20
 * ?status=completed
 * ?startDate=2026-01-01
 * ?endDate=2026-12-31
 */
router.get(
  "/:goalId/contributions",
  getGoalContributionsController
);

/**
 * GET /api/savings/goals/:goalId/history
 */
router.get(
  "/:goalId/history",
  getSavingHistoryController
);

/**
 * GET /api/savings/goals/:goalId/eligibility
 *
 * Query:
 * ?amount=5000
 */
router.get(
  "/:goalId/eligibility",
  checkSavingEligibilityController
);

/* =========================================================
   GET SINGLE SAVING GOAL
   MUST COME AFTER /:goalId/... ROUTES
========================================================= */

/**
 * GET /api/savings/goals/:goalId
 */
router.get(
  "/:goalId",
  getSavingGoalController
);

/* =========================================================
   EXPORT
========================================================= */

export default router;