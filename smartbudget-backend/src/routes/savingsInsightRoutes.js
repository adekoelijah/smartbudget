import express from "express";

import {
  getDashboardSavingInsights,
  getGoalSavingInsights,
  getTopSavingInsight,
  getSavingInsightSummary,
} from "../config/controllers/savingsInsightController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/*
 * All savings insight endpoints require
 * an authenticated SmartBudget user.
 */
router.use(protect);

/* =========================================================
   DASHBOARD SAVINGS INSIGHTS
========================================================= */

/**
 * GET /api/savings/insights
 *
 * Returns dashboard-level savings intelligence
 * for the authenticated user.
 *
 * Optional:
 * ?asOfDate=2026-08-13
 */
router.get(
  "/",
  getDashboardSavingInsights
);

/* =========================================================
   INSIGHT SUMMARY
========================================================= */

/**
 * GET /api/savings/insights/summary
 *
 * Returns aggregate savings insight information.
 */
router.get(
  "/summary",
  getSavingInsightSummary
);

/* =========================================================
   TOP INSIGHT
========================================================= */

/**
 * GET /api/savings/insights/top
 *
 * Returns the highest-priority savings insight.
 */
router.get(
  "/top",
  getTopSavingInsight
);

/* =========================================================
   GOAL INSIGHTS
========================================================= */

/**
 * GET /api/savings/insights/goals/:goalId
 *
 * Returns detailed intelligence for one saving goal.
 *
 * Optional:
 * ?asOfDate=2026-08-13
 */
router.get(
  "/goals/:goalId",
  getGoalSavingInsights
);

/* =========================================================
   EXPORT
========================================================= */

export default router;