import express from "express";

import {
  createAutoSave,
  getAutoSaves,
  getAutoSaveById,
  updateAutoSave,
  deleteAutoSave,
  activateAutoSave,
  pauseAutoSave,
  resumeAutoSave,
  cancelAutoSave,
  getAutoSaveStats,
} from "../config/controllers/autoSaveController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/*
 * All AutoSave endpoints require an authenticated user.
 *
 * The authenticated user must come from authMiddleware.
 * Never trust a userId supplied by the client.
 */
router.use(protect);

/* =========================================================
   CREATE AUTOSAVE
========================================================= */

/**
 * POST /api/savings/auto-save
 *
 * Create a new automatic savings configuration.
 */
router.post(
  "/",
  createAutoSave
);

/* =========================================================
   LIST USER AUTOSAVES
========================================================= */

/**
 * GET /api/savings/auto-save
 *
 * Get all AutoSave configurations belonging to the
 * authenticated user.
 *
 * Example:
 *
 * GET /api/savings/auto-save
 * GET /api/savings/auto-save?status=active
 * GET /api/savings/auto-save?page=1&limit=20
 */
router.get(
  "/",
  getAutoSaves
);

/* =========================================================
   AUTOSAVE STATISTICS
========================================================= */

/**
 * GET /api/savings/auto-save/:autoSaveId/stats
 *
 * Get aggregate statistics for one AutoSave configuration.
 *
 * IMPORTANT:
 * This must appear before /:autoSaveId.
 */
router.get(
  "/:autoSaveId/stats",
  getAutoSaveStats
);

/* =========================================================
   GET SINGLE AUTOSAVE
========================================================= */

/**
 * GET /api/savings/auto-save/:autoSaveId
 *
 * Get one AutoSave configuration belonging to the user.
 */
router.get(
  "/:autoSaveId",
  getAutoSaveById
);

/* =========================================================
   UPDATE AUTOSAVE
========================================================= */

/**
 * PUT /api/savings/auto-save/:autoSaveId
 *
 * Update user-configurable AutoSave settings.
 */
router.put(
  "/:autoSaveId",
  updateAutoSave
);

/* =========================================================
   ACTIVATE AUTOSAVE
========================================================= */

/**
 * POST /api/savings/auto-save/:autoSaveId/activate
 *
 * Activate an AutoSave configuration.
 */
router.post(
  "/:autoSaveId/activate",
  activateAutoSave
);

/* =========================================================
   PAUSE AUTOSAVE
========================================================= */

/**
 * POST /api/savings/auto-save/:autoSaveId/pause
 *
 * Temporarily pause an AutoSave configuration.
 */
router.post(
  "/:autoSaveId/pause",
  pauseAutoSave
);

/* =========================================================
   RESUME AUTOSAVE
========================================================= */

/**
 * POST /api/savings/auto-save/:autoSaveId/resume
 *
 * Resume a paused AutoSave configuration.
 */
router.post(
  "/:autoSaveId/resume",
  resumeAutoSave
);

/* =========================================================
   CANCEL AUTOSAVE
========================================================= */

/**
 * POST /api/savings/auto-save/:autoSaveId/cancel
 *
 * Permanently cancel an AutoSave configuration.
 */
router.post(
  "/:autoSaveId/cancel",
  cancelAutoSave
);

/* =========================================================
   DELETE AUTOSAVE
========================================================= */

/**
 * DELETE /api/savings/auto-save/:autoSaveId
 *
 * Delete/archive an AutoSave configuration.
 *
 * The service layer should determine whether this is a
 * soft delete or cancellation. Historical financial
 * records must never be physically deleted.
 */
router.delete(
  "/:autoSaveId",
  deleteAutoSave
);

/* =========================================================
   EXPORT
========================================================= */

export default router;