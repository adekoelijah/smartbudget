import express from "express";

import {
  createSavingAccount,
  getSavingAccount,
  getUserSavingAccounts,
  getPrimarySavingAccount,
  setPrimarySavingAccount,
  updateSavingAccount,
  pauseSavingAccount,
  activateSavingAccount,
  lockSavingAccount,
  closeSavingAccount,
  getSavingAccountBalance,
  getSavingAccountSummary,
} from "../config/controllers/savingAccountController.js";

import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| SAVING ACCOUNT ROUTES
|--------------------------------------------------------------------------
|
| Base path:
| /api/saving-accounts
|
| All routes require authentication.
|
*/

/* =========================================================
   ACCOUNT COLLECTION
========================================================= */

/**
 * GET /api/saving-accounts
 *
 * Get authenticated user's saving accounts.
 *
 * Supported query parameters:
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?accountType=savings
 * ?currency=NGN
 * ?search=emergency
 * ?includeClosed=false
 */
router.get(
  "/",
  protect,
  getUserSavingAccounts
);

/**
 * POST /api/saving-accounts
 *
 * Create a new saving account.
 */
router.post(
  "/",
  protect,
  createSavingAccount
);


/* =========================================================
   PRIMARY ACCOUNT
========================================================= */

/**
 * GET /api/saving-accounts/primary
 *
 * Get authenticated user's primary saving account.
 *
 * IMPORTANT:
 * This route must appear BEFORE /:accountId.
 */
router.get(
  "/primary",
  protect,
  getPrimarySavingAccount
);


/* =========================================================
   INDIVIDUAL ACCOUNT
========================================================= */

/**
 * GET /api/saving-accounts/:accountId
 *
 * Get a specific saving account owned by the authenticated user.
 */
router.get(
  "/:accountId",
  protect,
  getSavingAccount
);

/**
 * PATCH /api/saving-accounts/:accountId
 *
 * Update user-configurable account information.
 */
router.patch(
  "/:accountId",
  protect,
  updateSavingAccount
);


/* =========================================================
   ACCOUNT BALANCE & SUMMARY
========================================================= */

/**
 * GET /api/saving-accounts/:accountId/balance
 *
 * Get account balance information.
 */
router.get(
  "/:accountId/balance",
  protect,
  getSavingAccountBalance
);

/**
 * GET /api/saving-accounts/:accountId/summary
 *
 * Get account financial summary.
 */
router.get(
  "/:accountId/summary",
  protect,
  getSavingAccountSummary
);


/* =========================================================
   ACCOUNT STATE MANAGEMENT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/primary
 *
 * Make this account the user's primary saving account.
 */
router.post(
  "/:accountId/primary",
  protect,
  setPrimarySavingAccount
);

/**
 * POST /api/saving-accounts/:accountId/pause
 *
 * Pause a saving account.
 */
router.post(
  "/:accountId/pause",
  protect,
  pauseSavingAccount
);

/**
 * POST /api/saving-accounts/:accountId/activate
 *
 * Reactivate a paused saving account.
 */
router.post(
  "/:accountId/activate",
  protect,
  activateSavingAccount
);

/**
 * POST /api/saving-accounts/:accountId/lock
 *
 * Lock a saving account.
 *
 * This should eventually be restricted further if locking
 * can be triggered by security/fraud workflows.
 */
router.post(
  "/:accountId/lock",
  protect,
  lockSavingAccount
);

/**
 * POST /api/saving-accounts/:accountId/close
 *
 * Close a saving account.
 *
 * The service prevents closure when the account has funds.
 */
router.post(
  "/:accountId/close",
  protect,
  closeSavingAccount
);


/* =========================================================
   EXPORT
========================================================= */

export default router;