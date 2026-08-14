// routes/savingPlanRoutes.js

import express from "express";

import {
  createSavingPlan,
  getUserSavingPlans,
  getSavingPlanById,
  updateSavingPlan,

  activateSavingPlan,
  pauseSavingPlan,
  resumeSavingPlan,

  completeSavingPlan,
  cancelSavingPlan,

  recalculateSavingPlanMetrics,
  refreshSavingPlanProgress,

  attachAutomation,
  detachAutomation,

  checkSavingPlanEligibility,
  getSavingPlanStatistics,
} from "../config/controllers/savingsPlanController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/**
 * Every savings-plan endpoint requires authentication.
 *
 * IMPORTANT:
 * The authenticated user's identity comes exclusively
 * from authMiddleware.
 *
 * Client-supplied userId values must never be trusted.
 */
router.use(protect);

/* =========================================================
   CREATE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans
 *
 * Creates a new saving plan for the authenticated user.
 */
router.post(
  "/",
  createSavingPlan
);

/* =========================================================
   GET USER SAVING PLANS
========================================================= */

/**
 * GET /api/savings/plans
 *
 * Returns saving plans belonging to the authenticated user.
 *
 * Supported query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?goal=<goalId>
 * ?savingAccount=<accountId>
 * ?automated=true
 *
 * Ownership is always enforced by the service layer.
 */
router.get(
  "/",
  getUserSavingPlans
);

/* =========================================================
   GET SAVING PLAN STATISTICS
========================================================= */

/**
 * GET /api/savings/plans/:planId/stats
 *
 * Returns aggregate contribution and execution statistics
 * for a specific saving plan.
 *
 * IMPORTANT:
 * This route must remain BEFORE /:planId.
 */
router.get(
  "/:planId/stats",
  getSavingPlanStatistics
);

/* =========================================================
   CHECK PLAN ELIGIBILITY
========================================================= */

/**
 * GET /api/savings/plans/:planId/eligibility
 *
 * Determines whether the saving plan is currently eligible
 * for execution/contribution.
 */
router.get(
  "/:planId/eligibility",
  checkSavingPlanEligibility
);

/* =========================================================
   GET SAVING PLAN BY ID
========================================================= */

/**
 * GET /api/savings/plans/:planId
 *
 * Returns one saving plan belonging to the authenticated
 * user.
 */
router.get(
  "/:planId",
  getSavingPlanById
);

/* =========================================================
   UPDATE SAVING PLAN
========================================================= */

/**
 * PUT /api/savings/plans/:planId
 *
 * Updates user-configurable saving-plan properties.
 *
 * Protected financial/system fields are enforced by the
 * service layer.
 */
router.put(
  "/:planId",
  updateSavingPlan
);

/* =========================================================
   ACTIVATE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/activate
 *
 * Activates a draft or paused saving plan.
 */
router.post(
  "/:planId/activate",
  activateSavingPlan
);

/* =========================================================
   PAUSE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/pause
 *
 * Pauses an active saving plan.
 *
 * Optional body:
 *
 * {
 *   "reason": "Temporary financial difficulty"
 * }
 */
router.post(
  "/:planId/pause",
  pauseSavingPlan
);

/* =========================================================
   RESUME SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/resume
 *
 * Resumes a paused saving plan.
 */
router.post(
  "/:planId/resume",
  resumeSavingPlan
);

/* =========================================================
   COMPLETE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/complete
 *
 * Marks a saving plan as completed.
 *
 * Optional body:
 *
 * {
 *   "reason": "target_reached"
 * }
 */
router.post(
  "/:planId/complete",
  completeSavingPlan
);

/* =========================================================
   CANCEL SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/cancel
 *
 * Cancels a saving plan.
 *
 * Optional body:
 *
 * {
 *   "reason": "user_cancelled",
 *   "note": "No longer required"
 * }
 */
router.post(
  "/:planId/cancel",
  cancelSavingPlan
);

/* =========================================================
   RECALCULATE PLAN METRICS
========================================================= */

/**
 * POST /api/savings/plans/:planId/recalculate-metrics
 *
 * Recalculates required daily, weekly and monthly
 * contribution metrics.
 *
 * This does not move money.
 */
router.post(
  "/:planId/recalculate-metrics",
  recalculateSavingPlanMetrics
);

/* =========================================================
   REFRESH PLAN PROGRESS
========================================================= */

/**
 * POST /api/savings/plans/:planId/refresh-progress
 *
 * Rebuilds the cached progress snapshot from completed
 * SavingContribution records.
 *
 * Financial contribution records remain the source of truth.
 */
router.post(
  "/:planId/refresh-progress",
  refreshSavingPlanProgress
);

/* =========================================================
   ATTACH AUTOMATION
========================================================= */

/**
 * POST /api/savings/plans/:planId/automation
 *
 * Attaches an AutoSave or SavingSchedule to the plan.
 *
 * Example:
 *
 * {
 *   "autoSaveId": "...",
 *   "scheduleId": "..."
 * }
 */
router.post(
  "/:planId/automation",
  attachAutomation
);

/* =========================================================
   DETACH AUTOMATION
========================================================= */

/**
 * DELETE /api/savings/plans/:planId/automation
 *
 * Disables automation and removes the attached AutoSave
 * and SavingSchedule references.
 */
router.delete(
  "/:planId/automation",
  detachAutomation
);

/* =========================================================
   EXPORT
========================================================= */

export default router;