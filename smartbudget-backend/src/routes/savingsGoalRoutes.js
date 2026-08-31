
// src/routes/savingsGoalRoutes.js

import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getSavingGoalsController,
  getSavingGoalController,
  createSavingGoalController,
  updateSavingGoalController,

  pauseSavingGoalController,
  resumeSavingGoalController,
  cancelSavingGoalController,

  deleteSavingGoalController,
  restoreSavingGoalController,

  setPrimarySavingGoalController,
  removePrimarySavingGoalController,
  getPrimarySavingGoalController,

  getSavingGoalProgressController,

  completeSavingGoalController,
  expireSavingGoalController,

  getSavingGoalSummaryController,
  getActiveSavingGoalsController,
} from "../config/controllers/savingsGoalController.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/*
 * All saving-goal routes require authentication.
 *
 * The controller obtains the user ID from req.user.
 * Clients must never supply the authenticated user ID.
 */
router.use(protect);

/* =========================================================
   COLLECTION ROUTES
========================================================= */

/**
 * GET /api/savings/goals
 *
 * Get all saving goals belonging to the authenticated user.
 *
 * Supported query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?category=...
 * ?priority=...
 * ?goalType=...
 * ?search=...
 * ?sortBy=createdAt
 * ?sortOrder=desc
 */
router.get(
  "/",
  getSavingGoalsController
);

/**
 * POST /api/savings/goals
 *
 * Create a new saving goal.
 */
router.post(
  "/",
  createSavingGoalController
);

/* =========================================================
   STATIC COLLECTION ENDPOINTS
========================================================= */

/*
 * IMPORTANT:
 *
 * These routes MUST appear before:
 *
 *   /:goalId
 *
 * Otherwise Express can interpret:
 *
 *   /summary
 *   /primary
 *   /active
 *
 * as goal IDs.
 */

/**
 * GET /api/savings/goals/summary
 *
 * Get aggregate saving-goal statistics.
 */
router.get(
  "/summary",
  getSavingGoalSummaryController
);

/**
 * GET /api/savings/goals/primary
 *
 * Get the authenticated user's primary saving goal.
 */
router.get(
  "/primary",
  getPrimarySavingGoalController
);

/**
 * GET /api/savings/goals/active
 *
 * Get all active saving goals.
 */
router.get(
  "/active",
  getActiveSavingGoalsController
);

/* =========================================================
   SINGLE GOAL
========================================================= */

/**
 * GET /api/savings/goals/:goalId
 *
 * Get one saving goal.
 */
router.get(
  "/:goalId",
  getSavingGoalController
);

/**
 * PATCH /api/savings/goals/:goalId
 *
 * Update a saving goal.
 */
router.patch(
  "/:goalId",
  updateSavingGoalController
);

/**
 * DELETE /api/savings/goals/:goalId
 *
 * Soft-delete a saving goal.
 */
router.delete(
  "/:goalId",
  deleteSavingGoalController
);

/* =========================================================
   GOAL STATE
========================================================= */

/**
 * POST /api/savings/goals/:goalId/pause
 *
 * Pause an active goal.
 */
router.post(
  "/:goalId/pause",
  pauseSavingGoalController
);

/**
 * POST /api/savings/goals/:goalId/resume
 *
 * Resume a paused goal.
 */
router.post(
  "/:goalId/resume",
  resumeSavingGoalController
);

/**
 * POST /api/savings/goals/:goalId/cancel
 *
 * Cancel a saving goal.
 */
router.post(
  "/:goalId/cancel",
  cancelSavingGoalController
);

/**
 * POST /api/savings/goals/:goalId/restore
 *
 * Restore a soft-deleted goal.
 */
router.post(
  "/:goalId/restore",
  restoreSavingGoalController
);

/**
 * POST /api/savings/goals/:goalId/complete
 *
 * Explicitly complete a goal whose target has been reached.
 */
router.post(
  "/:goalId/complete",
  completeSavingGoalController
);

/**
 * POST /api/savings/goals/:goalId/expire
 *
 * Mark an unfinished goal as expired after its target date.
 */
router.post(
  "/:goalId/expire",
  expireSavingGoalController
);

/* =========================================================
   PRIMARY GOAL
========================================================= */

/**
 * POST /api/savings/goals/:goalId/primary
 *
 * Make this goal the user's primary goal.
 */
router.post(
  "/:goalId/primary",
  setPrimarySavingGoalController
);

/**
 * DELETE /api/savings/goals/:goalId/primary
 *
 * Remove primary status from this goal.
 */
router.delete(
  "/:goalId/primary",
  removePrimarySavingGoalController
);

/* =========================================================
   GOAL PROGRESS
========================================================= */

/**
 * GET /api/savings/goals/:goalId/progress
 *
 * Get calculated progress and savings intelligence.
 */
router.get(
  "/:goalId/progress",
  getSavingGoalProgressController
);

/* =========================================================
   EXPORT
========================================================= */

export default router;
