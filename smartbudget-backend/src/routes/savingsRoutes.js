import express from "express";

import savingAccountRoutes from "./savingAccountRoutes.js";
import savingsGoalRoutes from "./savingsGoalRoutes.js";
import savingsPlanRoutes from "./savingsPlanRoutes.js";
import savingScheduleRoutes from "./savingScheduleRoutes.js";
import savingExecutionRoutes from "./savingExecutionRoutes.js";
import savingsChallengeRoutes from "./savingsChallengeRoutes.js";
import savingsInsightRoutes from "./savingsInsightRoutes.js";
import autoSaveRoutes from "./autoSaveRoutes.js";

import protect  from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   AUTHENTICATION
========================================================= */

/**
 * All savings endpoints require an authenticated user.
 *
 * The authenticated user's identity comes exclusively
 * from authMiddleware through req.user.
 *
 * Child routers/controllers must never trust a userId
 * supplied by the client.
 */
router.use(protect);


/* =========================================================
   SAVING ACCOUNTS
========================================================= */

/**
 * /api/savings/accounts
 *
 * Saving account management:
 *
 * - Create account
 * - List accounts
 * - Get account
 * - Get primary account
 * - Update account
 * - Account balance
 * - Account summary
 * - Set primary
 * - Pause
 * - Activate
 * - Close
 */
router.use(
  "/accounts",
  savingAccountRoutes
);


/* =========================================================
   SAVING GOALS
========================================================= */

/**
 * /api/savings/goals
 *
 * Goal creation, lifecycle management,
 * progress tracking and goal-level operations.
 */
router.use(
  "/goals",
  savingsGoalRoutes
);


/* =========================================================
   SAVINGS PLANS
========================================================= */

/**
 * /api/savings/plans
 *
 * Savings-plan configuration and lifecycle
 * management.
 */
router.use(
  "/plans",
  savingsPlanRoutes
);


/* =========================================================
   SAVING SCHEDULES
========================================================= */

/**
 * /api/savings/schedules
 *
 * Automatic savings scheduling and schedule
 * lifecycle management.
 */
router.use(
  "/schedules",
  savingScheduleRoutes
);


/* =========================================================
   SAVING EXECUTIONS
========================================================= */

/**
 * /api/savings/executions
 *
 * Execution records and execution history.
 *
 * IMPORTANT:
 *
 * Worker-only processing operations should remain
 * internal and must not be exposed as ordinary
 * authenticated user endpoints.
 */
router.use(
  "/executions",
  savingExecutionRoutes
);


/* =========================================================
   SAVINGS CHALLENGES
========================================================= */

/**
 * /api/savings/challenges
 *
 * Challenge discovery, enrollment, progress
 * and lifecycle operations.
 */
router.use(
  "/challenges",
  savingsChallengeRoutes
);


/* =========================================================
   SAVINGS INSIGHTS
========================================================= */

/**
 * /api/savings/insights
 *
 * Savings intelligence, recommendations
 * and financial insights.
 */
router.use(
  "/insights",
  savingsInsightRoutes
);

/* =========================================================
   AUTO SAVE
========================================================= */

/**
 * /api/savings/auto-save
 *
 * Automatic savings configuration and lifecycle
 * management.
 */
router.use(
  "/auto-save",
  autoSaveRoutes
);


/* =========================================================
   EXPORT
========================================================= */

export default router;