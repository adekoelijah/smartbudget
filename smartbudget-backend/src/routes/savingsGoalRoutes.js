// routes/savingsGoalRoutes.js

import express from "express";

import {
  getUserSavingGoalsController,
  getSavingGoalController,
  getSavingSummaryController,
  getGoalContributionsController,
  getSavingHistoryController,
  checkSavingEligibilityController,
} from "../config/controllers/savingsGoalController.js";

import protect  from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/**
 * All saving-goal endpoints require authentication.
 *
 * Ownership is determined exclusively from:
 *
 *   req.user.id
 *
 * Controllers must never trust userId from:
 * - params
 * - query
 * - request body
 */
router.use(protect);

/* =========================================================
   LIST SAVING GOALS
========================================================= */

/**
 * GET /api/savings/goals
 *
 * Returns the authenticated user's saving goals.
 *
 * Query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 */
router.get(
  "/",
  getUserSavingGoalsController
);

/* =========================================================
   GET SAVING GOAL
========================================================= */

/**
 * GET /api/savings/goals/:goalId
 *
 * Returns one saving goal belonging to the
 * authenticated user.
 */
router.get(
  "/:goalId",
  getSavingGoalController
);

/* =========================================================
   SAVING GOAL SUMMARY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/summary
 *
 * Returns financial/progress summary for the goal.
 *
 * IMPORTANT:
 * This route must appear before:
 *
 *   /:goalId
 *
 * otherwise Express can interpret "summary" as a goalId.
 */
router.get(
  "/:goalId/summary",
  getSavingSummaryController
);

/* =========================================================
   GOAL CONTRIBUTIONS
========================================================= */

/**
 * GET /api/savings/goals/:goalId/contributions
 *
 * Returns contributions belonging to the goal.
 *
 * Query parameters:
 *
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

/* =========================================================
   SAVING HISTORY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/history
 *
 * Returns the saving history associated with the goal.
 */
router.get(
  "/:goalId/history",
  getSavingHistoryController
);

/* =========================================================
   CONTRIBUTION ELIGIBILITY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/eligibility
 *
 * Checks whether a contribution can be made.
 *
 * Query:
 *
 * ?amount=5000
 */
router.get(
  "/:goalId/eligibility",
  checkSavingEligibilityController
);

/* =========================================================
   EXPORT
========================================================= */

export default router;