// routes/savingsChallengeRoutes.js

import express from "express";

import {
  createSavingsChallenge,
  getSavingsChallenge,
  getUserSavingsChallenges,
  updateSavingsChallenge,
  activateSavingsChallenge,
  pauseSavingsChallenge,
  resumeSavingsChallenge,
  completeSavingsChallenge,
  cancelSavingsChallenge,
  failSavingsChallenge,
  expireSavingsChallenge,
  applyContributionToChallenge,
  registerSuccessfulChallengePeriod,
  registerMissedChallengePeriod,
  getChallengeSnapshot,
  getSavingsChallengeSummary,
  archiveSavingsChallenge,
  restoreSavingsChallenge,
  getActiveSavingsChallenges,
  getPausedSavingsChallenges,
  getCompletedSavingsChallenges,
} from "../config/controllers/savingsChallengeController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/*
 * All savings-challenge endpoints require authentication.
 *
 * The authenticated user is always obtained from req.user.
 * Client-supplied user IDs must never determine ownership.
 */
router.use(protect);

/* =========================================================
   CREATE
========================================================= */

/**
 * POST /api/savings-challenges
 *
 * Create a new savings challenge.
 */
router.post(
  "/",
  createSavingsChallenge
);

/* =========================================================
   LIST / COLLECTION ENDPOINTS
========================================================= */

/**
 * GET /api/savings-challenges
 *
 * Get the authenticated user's savings challenges.
 *
 * Supported query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?challengeType=fixed_amount
 * ?difficulty=beginner
 * ?savingPlan=<planId>
 * ?savingAccount=<accountId>
 * ?includeTemplates=true
 */
router.get(
  "/",
  getUserSavingsChallenges
);

/**
 * GET /api/savings-challenges/summary
 *
 * Get aggregate savings-challenge summary.
 *
 * IMPORTANT:
 * Must appear before /:challengeId.
 */
router.get(
  "/summary",
  getSavingsChallengeSummary
);

/**
 * GET /api/savings-challenges/active
 *
 * Get active savings challenges.
 *
 * IMPORTANT:
 * Must appear before /:challengeId.
 */
router.get(
  "/active",
  getActiveSavingsChallenges
);

/**
 * GET /api/savings-challenges/paused
 *
 * Get paused savings challenges.
 *
 * IMPORTANT:
 * Must appear before /:challengeId.
 */
router.get(
  "/paused",
  getPausedSavingsChallenges
);

/**
 * GET /api/savings-challenges/completed
 *
 * Get completed savings challenges.
 *
 * IMPORTANT:
 * Must appear before /:challengeId.
 */
router.get(
  "/completed",
  getCompletedSavingsChallenges
);

/* =========================================================
   SINGLE CHALLENGE
========================================================= */

/**
 * GET /api/savings-challenges/:challengeId
 *
 * Get a single savings challenge.
 */


/* =========================================================
   SNAPSHOT
========================================================= */

/**
 * GET /api/savings-challenges/:challengeId/snapshot
 *
 * Get the current calculated snapshot/progress
 * of a savings challenge.
 *
 * IMPORTANT:
 * This must be registered before any generic
 * parameter route that could consume "snapshot".
 */
router.get(
  "/:challengeId/snapshot",
  getChallengeSnapshot
);

router.get(
  "/:challengeId",
  getSavingsChallenge
);

/* =========================================================
   UPDATE
========================================================= */

/**
 * PATCH /api/savings-challenges/:challengeId
 *
 * Update a draft/user-configurable savings challenge.
 */
router.patch(
  "/:challengeId",
  updateSavingsChallenge
);

/* =========================================================
   LIFECYCLE — ACTIVATE
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/activate
 */
router.post(
  "/:challengeId/activate",
  activateSavingsChallenge
);

/* =========================================================
   LIFECYCLE — PAUSE
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/pause
 */
router.post(
  "/:challengeId/pause",
  pauseSavingsChallenge
);

/* =========================================================
   LIFECYCLE — RESUME
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/resume
 */
router.post(
  "/:challengeId/resume",
  resumeSavingsChallenge
);

/* =========================================================
   LIFECYCLE — COMPLETE
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/complete
 */
router.post(
  "/:challengeId/complete",
  completeSavingsChallenge
);

/* =========================================================
   LIFECYCLE — CANCEL
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/cancel
 */
router.post(
  "/:challengeId/cancel",
  cancelSavingsChallenge
);

/* =========================================================
   LIFECYCLE — FAIL
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/fail
 */
router.post(
  "/:challengeId/fail",
  failSavingsChallenge
);

/* =========================================================
   LIFECYCLE — EXPIRE
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/expire
 */
router.post(
  "/:challengeId/expire",
  expireSavingsChallenge
);

/* =========================================================
   CONTRIBUTIONS
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/contributions
 *
 * Apply an already-confirmed contribution to the
 * challenge's denormalized progress.
 */
router.post(
  "/:challengeId/contributions",
  applyContributionToChallenge
);

/* =========================================================
   PERIOD TRACKING
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/periods/success
 *
 * Register a successful challenge period.
 */
router.post(
  "/:challengeId/periods/success",
  registerSuccessfulChallengePeriod
);

/**
 * POST /api/savings-challenges/:challengeId/periods/missed
 *
 * Register a missed challenge period.
 */
router.post(
  "/:challengeId/periods/missed",
  registerMissedChallengePeriod
);

/* =========================================================
   RESTORE
========================================================= */

/**
 * POST /api/savings-challenges/:challengeId/restore
 *
 * Restore an archived savings challenge.
 */
router.post(
  "/:challengeId/restore",
  restoreSavingsChallenge
);

/* =========================================================
   ARCHIVE
========================================================= */

/**
 * DELETE /api/savings-challenges/:challengeId
 *
 * Archive a savings challenge.
 *
 * This should not physically remove financial history.
 */
router.delete(
  "/:challengeId",
  archiveSavingsChallenge
);

/* =========================================================
   EXPORT
========================================================= */

export default router;