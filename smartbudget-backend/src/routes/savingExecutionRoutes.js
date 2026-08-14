// routes/savingExecutionRoutes.js

import express from "express";

import {
  createSavingExecution,
  getSavingExecution,
  listSavingExecutions,
  getSavingExecutionStats,
  cancelSavingExecution,
  retrySavingExecution,
} from "../config/controllers/savingExecutionController.js";

const router = express.Router();

/*
 * Authentication is handled by the parent savings router.
 *
 * Parent:
 *   router.use(protect);
 *
 * Mount:
 *   router.use("/executions", savingExecutionRoutes);
 *
 * Therefore every route below is authenticated.
 */

/* =========================================================
   CREATE EXECUTION
========================================================= */

/**
 * POST /api/savings/executions
 *
 * Create a saving execution for an automatic schedule.
 *
 * Body:
 * {
 *   scheduleId,
 *   executionAt,
 *   baseAmount,
 *   metadata
 * }
 */
router.post(
  "/",
  createSavingExecution
);

/* =========================================================
   LIST EXECUTIONS
========================================================= */

/**
 * GET /api/savings/executions
 *
 * List authenticated user's saving executions.
 *
 * Query parameters:
 *
 * ?savingGoalId=<goalId>
 * ?savingScheduleId=<scheduleId>
 * ?status=pending
 * ?page=1
 * ?limit=20
 */
router.get(
  "/",
  listSavingExecutions
);

/* =========================================================
   EXECUTION STATISTICS
========================================================= */

/**
 * GET /api/savings/executions/stats
 *
 * Get aggregate saving execution statistics
 * for the authenticated user.
 *
 * IMPORTANT:
 * This route MUST appear before /:executionId.
 */
router.get(
  "/stats",
  getSavingExecutionStats
);

/* =========================================================
   GET SINGLE EXECUTION
========================================================= */

/**
 * GET /api/savings/executions/:executionId
 *
 * Get one execution belonging to the authenticated user.
 */
router.get(
  "/:executionId",
  getSavingExecution
);

/* =========================================================
   CANCEL EXECUTION
========================================================= */

/**
 * PATCH /api/savings/executions/:executionId/cancel
 *
 * Cancel a pending/eligible execution.
 *
 * Body:
 * {
 *   "reason": "User cancelled execution"
 * }
 */
router.patch(
  "/:executionId/cancel",
  cancelSavingExecution
);

/* =========================================================
   RETRY EXECUTION
========================================================= */

/**
 * POST /api/savings/executions/:executionId/retry
 *
 * Queue an execution for retry.
 *
 * IMPORTANT:
 * This should only be exposed if retrying executions is
 * intentionally part of the user-facing API.
 */
router.post(
  "/:executionId/retry",
  retrySavingExecution
);

/* =========================================================
   EXPORT
========================================================= */

export default router;