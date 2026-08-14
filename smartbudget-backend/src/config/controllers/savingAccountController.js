import {
  createSavingAccount as createSavingAccountService,
  getSavingAccount as getSavingAccountService,
  getUserSavingAccounts as getUserSavingAccountsService,
  getPrimarySavingAccount as getPrimarySavingAccountService,
  setPrimarySavingAccount as setPrimarySavingAccountService,
  updateSavingAccount as updateSavingAccountService,
  pauseSavingAccount as pauseSavingAccountService,
  activateSavingAccount as activateSavingAccountService,
  lockSavingAccount as lockSavingAccountService,
  closeSavingAccount as closeSavingAccountService,
  getSavingAccountBalance as getSavingAccountBalanceService,
  getSavingAccountSummary as getSavingAccountSummaryService,
} from "../../services/savingAccountService.js";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

/**
 * Send a successful API response.
 *
 * The controller owns HTTP response formatting.
 * The service owns business logic.
 */
const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = undefined,
  } = {}
) => {
  const response = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized API error response.
 */
const sendError = (
  res,
  {
    statusCode = 500,
    message = "An unexpected error occurred",
    code = "INTERNAL_SERVER_ERROR",
    details = undefined,
  } = {}
) => {
  const response = {
    success: false,
    message,
    code,
  };

  if (
    details !== undefined &&
    process.env.NODE_ENV !== "production"
  ) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

/**
 * Converts service/controller errors into a safe HTTP response.
 *
 * The service already provides:
 *
 *   error.statusCode
 *   error.code
 *   error.message
 *
 * The controller should preserve those values instead of
 * replacing useful business errors with generic 500 errors.
 */
const handleControllerError = (
  res,
  error,
  fallbackMessage
) => {
  const statusCode =
    Number(error?.statusCode) >= 400 &&
    Number(error?.statusCode) < 600
      ? Number(error.statusCode)
      : 500;

  const code =
    error?.code ||
    "SAVING_ACCOUNT_ERROR";

  const message =
    error?.message ||
    fallbackMessage ||
    "Saving account operation failed";

  return sendError(res, {
    statusCode,
    message,
    code,
    details:
      process.env.NODE_ENV !== "production"
        ? error?.stack
        : undefined,
  });
};

/* =========================================================
   AUTHENTICATED USER
========================================================= */

/**
 * Extract the authenticated user's ID.
 *
 * Supports the common forms:
 *
 *   req.user.id
 *   req.user._id
 *   req.user.userId
 *
 * This keeps the individual controllers clean and makes the
 * controller resilient to the exact User representation
 * returned by authMiddleware.
 */
const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?.id ||
    req.user?._id ||
    req.user?.userId;

  if (!userId) {
    const error = new Error(
      "Authenticated user could not be identified"
    );

    error.statusCode = 401;
    error.code = "AUTHENTICATED_USER_NOT_FOUND";

    throw error;
  }

  return userId;
};

/* =========================================================
   REQUEST BODY HELPERS
========================================================= */

/**
 * Safely return an object body.
 */
const getBody = (req) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return {};
  }

  return req.body;
};

/**
 * Extract an account ID from the route.
 */
const getAccountId = (req) => {
  return req.params?.accountId;
};

/**
 * Extract an optional reason.
 *
 * This prevents accidental "[object Object]" values from
 * reaching the service.
 */
const getReason = (req, defaultReason) => {
  const reason = req.body?.reason;

  if (
    reason === undefined ||
    reason === null
  ) {
    return defaultReason;
  }

  return String(reason).trim() || defaultReason;
};

/* =========================================================
   CREATE SAVING ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts
 */
export const createSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const body = getBody(req);

    const account =
      await createSavingAccountService({
        userId,

        name: body.name,

        description:
          body.description,

        currency:
          body.currency,

        accountType:
          body.accountType,

        goal:
          body.goal,

        isPrimary:
          body.isPrimary,

        metadata:
          body.metadata,
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Saving account created successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to create saving account"
    );
  }
};

/* =========================================================
   GET USER SAVING ACCOUNTS
========================================================= */

/**
 * GET /api/saving-accounts
 *
 * Query parameters:
 *
 * page
 * limit
 * status
 * accountType
 * currency
 * search
 * includeClosed
 */
export const getUserSavingAccounts = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page,
      limit,
      status,
      accountType,
      currency,
      search,
      includeClosed,
    } = req.query;

    const result =
      await getUserSavingAccountsService({
        userId,
        page,
        limit,
        status,
        accountType,
        currency,
        search,
        includeClosed:
          includeClosed === "true",
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving accounts retrieved successfully",
      data: result.data,
      meta: {
        pagination:
          result.pagination,
      },
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve saving accounts"
    );
  }
};

/* =========================================================
   GET PRIMARY SAVING ACCOUNT
========================================================= */

/**
 * GET /api/saving-accounts/primary
 */
export const getPrimarySavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const account =
      await getPrimarySavingAccountService({
        userId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        account
          ? "Primary saving account retrieved successfully"
          : "No primary saving account found",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve primary saving account"
    );
  }
};

/* =========================================================
   GET SINGLE SAVING ACCOUNT
========================================================= */

/**
 * GET /api/saving-accounts/:accountId
 */
export const getSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const account =
      await getSavingAccountService({
        userId,
        accountId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account retrieved successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve saving account"
    );
  }
};

/* =========================================================
   UPDATE SAVING ACCOUNT
========================================================= */

/**
 * PATCH /api/saving-accounts/:accountId
 *
 * Only user-configurable account fields should reach the
 * service.
 *
 * Financial fields such as:
 *
 * balance
 * availableBalance
 * totalContributed
 * totalWithdrawn
 *
 * are deliberately not forwarded.
 */
export const updateSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const body = getBody(req);

    const account =
      await updateSavingAccountService({
        userId,
        accountId,

        name:
          body.name,

        description:
          body.description,

        accountType:
          body.accountType,

        metadata:
          body.metadata,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account updated successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to update saving account"
    );
  }
};

/* =========================================================
   SET PRIMARY ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/primary
 */
export const setPrimarySavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const account =
      await setPrimarySavingAccountService({
        userId,
        accountId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Primary saving account updated successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to set primary saving account"
    );
  }
};

/* =========================================================
   GET ACCOUNT BALANCE
========================================================= */

/**
 * GET /api/saving-accounts/:accountId/balance
 */
export const getSavingAccountBalance = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const balance =
      await getSavingAccountBalanceService({
        userId,
        accountId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account balance retrieved successfully",
      data: balance,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve saving account balance"
    );
  }
};

/* =========================================================
   GET ACCOUNT SUMMARY
========================================================= */

/**
 * GET /api/saving-accounts/:accountId/summary
 */
export const getSavingAccountSummary = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const summary =
      await getSavingAccountSummaryService({
        userId,
        accountId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve saving account summary"
    );
  }
};

/* =========================================================
   PAUSE ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/pause
 */
export const pauseSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const reason = getReason(
      req,
      "Paused by user"
    );

    const account =
      await pauseSavingAccountService({
        userId,
        accountId,
        reason,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account paused successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to pause saving account"
    );
  }
};

/* =========================================================
   ACTIVATE ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/activate
 */
export const activateSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const account =
      await activateSavingAccountService({
        userId,
        accountId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account activated successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to activate saving account"
    );
  }
};

/* =========================================================
   LOCK ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/lock
 */
export const lockSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const reason = getReason(
      req,
      "Locked by user"
    );

    const account =
      await lockSavingAccountService({
        userId,
        accountId,
        reason,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account locked successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to lock saving account"
    );
  }
};

/* =========================================================
   CLOSE ACCOUNT
========================================================= */

/**
 * POST /api/saving-accounts/:accountId/close
 */
export const closeSavingAccount = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const accountId =
      getAccountId(req);

    const reason = getReason(
      req,
      "Closed by user"
    );

    const account =
      await closeSavingAccountService({
        userId,
        accountId,
        reason,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving account closed successfully",
      data: account,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to close saving account"
    );
  }
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const savingAccountController = {
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
};

export default savingAccountController;