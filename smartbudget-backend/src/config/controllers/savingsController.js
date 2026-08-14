import savingService from "../../services/savingService.js";

/* =========================================================
   RESPONSE HELPER
========================================================= */

const sendSuccess = (
  res,
  {
    statusCode = 200,
    message,
    data = null,
    meta = null,
  }
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   GET SAVINGS OVERVIEW
========================================================= */

/**
 * GET /api/savings
 *
 * Returns the authenticated user's high-level
 * savings information.
 */
export const getSavingsOverview = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsOverview({
        userId,
      });

    return sendSuccess(res, {
      message:
        "Savings overview retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS SUMMARY
========================================================= */

/**
 * GET /api/savings/summary
 *
 * Returns aggregate savings statistics.
 */
export const getSavingsSummary = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsSummary({
        userId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Savings summary retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS BALANCE
========================================================= */

/**
 * GET /api/savings/balance
 *
 * Returns the user's current savings balance
 * and related aggregate information.
 */
export const getSavingsBalance = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsBalance({
        userId,
      });

    return sendSuccess(res, {
      message:
        "Savings balance retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS STATISTICS
========================================================= */

/**
 * GET /api/savings/statistics
 */
export const getSavingsStatistics = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsStatistics({
        userId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Savings statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS ACTIVITY
========================================================= */

/**
 * GET /api/savings/activity
 *
 * Returns recent savings activity.
 */
export const getSavingsActivity = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsActivity({
        userId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Savings activity retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS DASHBOARD
========================================================= */

/**
 * GET /api/savings/dashboard
 *
 * Aggregated savings data intended for the
 * SmartBudget dashboard.
 */
export const getSavingsDashboard = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsDashboard({
        userId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Savings dashboard retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS PROGRESS
========================================================= */

/**
 * GET /api/savings/progress
 *
 * Returns aggregate progress across savings goals/plans.
 */
export const getSavingsProgress = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsProgress({
        userId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Savings progress retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SAVINGS HEALTH
========================================================= */

/**
 * GET /api/savings/health
 *
 * Returns savings-health indicators calculated by
 * the service layer.
 */
export const getSavingsHealth = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingService.getSavingsHealth({
        userId,
      });

    return sendSuccess(res, {
      message:
        "Savings health retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   EXPORTS
========================================================= */

export default {
  getSavingsOverview,
  getSavingsSummary,
  getSavingsBalance,
  getSavingsStatistics,
  getSavingsActivity,
  getSavingsDashboard,
  getSavingsProgress,
  getSavingsHealth,
};