// routes/savingScheduleRoutes.js

import express from "express";

import {
  createSchedule,
  getSchedules,
  getSchedule,
  getActiveSchedules,
  updateSchedule,
  activateSchedule,
  pauseSchedule,
  resumeSchedule,
  cancelSchedule,
  deleteSchedule,
  completeSchedule,
  getScheduleStats,
} from "../config/controllers/savingScheduleController.js";

const router = express.Router();

/*
 * Authentication is intentionally NOT applied here.
 *
 * The parent savings router already applies:
 *
 * router.use(protect);
 *
 * Therefore every route in this module is authenticated
 * through the parent router.
 */

/* =========================================================
   CREATE SAVING SCHEDULE
========================================================= */

/**
 * POST /api/savings/schedules
 *
 * Create a new automatic saving schedule.
 */
router.post(
  "/",
  createSchedule
);

/* =========================================================
   LIST USER SAVING SCHEDULES
========================================================= */

/**
 * GET /api/savings/schedules
 *
 * Supported query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?savingGoal=<goalId>
 * ?fundingSource=wallet
 * ?strategy=fixed
 * ?frequency=weekly
 * ?isAutomatic=true
 * ?includeCancelled=false
 */
router.get(
  "/",
  getSchedules
);

/* =========================================================
   ACTIVE SAVING SCHEDULES
========================================================= */

/**
 * GET /api/savings/schedules/active
 *
 * Returns all active schedules belonging to the
 * authenticated user.
 *
 * IMPORTANT:
 * This route MUST appear before /:scheduleId.
 */
router.get(
  "/active",
  getActiveSchedules
);

/* =========================================================
   SCHEDULE STATISTICS
========================================================= */

/**
 * GET /api/savings/schedules/:scheduleId/stats
 *
 * Returns execution statistics for a schedule.
 *
 * This route is registered before /:scheduleId so
 * "stats" cannot be interpreted as a schedule ID.
 */
router.get(
  "/:scheduleId/stats",
  getScheduleStats
);

/* =========================================================
   GET SINGLE SCHEDULE
========================================================= */

/**
 * GET /api/savings/schedules/:scheduleId
 *
 * Get one schedule belonging to the authenticated user.
 */
router.get(
  "/:scheduleId",
  getSchedule
);

/* =========================================================
   UPDATE SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId
 *
 * Update user-configurable schedule properties.
 */
router.patch(
  "/:scheduleId",
  updateSchedule
);

/* =========================================================
   ACTIVATE SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/activate
 *
 * Optional body:
 *
 * {
 *   "nextExecutionAt": "2026-08-20T08:00:00.000Z"
 * }
 */
router.patch(
  "/:scheduleId/activate",
  activateSchedule
);

/* =========================================================
   PAUSE SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/pause
 *
 * Optional body:
 *
 * {
 *   "reason": "Temporarily reducing expenses"
 * }
 */
router.patch(
  "/:scheduleId/pause",
  pauseSchedule
);

/* =========================================================
   RESUME SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/resume
 *
 * Required body:
 *
 * {
 *   "nextExecutionAt": "2026-08-20T08:00:00.000Z"
 * }
 */
router.patch(
  "/:scheduleId/resume",
  resumeSchedule
);

/* =========================================================
   CANCEL SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/cancel
 *
 * Optional body:
 *
 * {
 *   "reason": "Cancelled by user"
 * }
 */
router.patch(
  "/:scheduleId/cancel",
  cancelSchedule
);

/* =========================================================
   COMPLETE SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/complete
 *
 * IMPORTANT:
 * Completion is normally performed by the execution/
 * worker lifecycle.
 *
 * Only expose this endpoint if user-facing completion
 * is intentionally part of the application contract.
 */
router.patch(
  "/:scheduleId/complete",
  completeSchedule
);

/* =========================================================
   DELETE SCHEDULE
========================================================= */

/**
 * DELETE /api/savings/schedules/:scheduleId
 *
 * The service performs a safe lifecycle operation rather
 * than physically deleting financial automation records.
 */
router.delete(
  "/:scheduleId",
  deleteSchedule
);

/* =========================================================
   EXPORT
========================================================= */

export default router;