// controllers/savings/savingsGoalController.js

import {
  getSavingGoal,
  getUserSavingGoals,
  getSavingSummary,
  getGoalContributions,
  getSavingHistory,
  checkSavingEligibility,
} from "../../services/savingService.js";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Extract authenticated user ID.
 *
 * Ownership must always come from the authenticated request.
 * Never trust userId from params, body, or query.
 */
const getAuthenticatedUserId = (req) => {
  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Authenticated user is required"
    );

    error.statusCode = 401;
    error.code = "AUTHENTICATION_REQUIRED";

    throw error;
  }

  return userId;
};

/**
 * Extract pagination parameters.
 *
 * Validation and normalization are handled by the service.
 */
const getPagination = (req) => ({
  page: req.query?.page,
  limit: req.query?.limit,
});

/**
 * Extract an optional MongoDB transaction session.
 *
 * Normal HTTP requests do not normally provide a session.
 * Transaction orchestration belongs to higher-level services.
 */
const getRequestSession = (req) =>
  req.mongoSession || null;

/* =========================================================
   GET USER SAVING GOALS
========================================================= */

/**
 * GET /api/savings/goals
 *
 * Returns the authenticated user's saving goals.
 *
 * Query:
 * ?page=1
 * ?limit=20
 * ?status=active
 */
export const getUserSavingGoalsController = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page,
      limit,
    } = getPagination(req);

    const status =
      req.query?.status || null;

    const result =
      await getUserSavingGoals({
        userId,
        page,
        limit,
        status,
        session:
          getRequestSession(req),
      });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET SINGLE SAVING GOAL
========================================================= */

/**
 * GET /api/savings/goals/:goalId
 */
export const getSavingGoalController = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await getSavingGoal({
        userId,
        goalId,
        session:
          getRequestSession(req),
      });

    return res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET SAVING GOAL SUMMARY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/summary
 */
export const getSavingSummaryController = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const summary =
      await getSavingSummary({
        userId,
        goalId,
        session:
          getRequestSession(req),
      });

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET GOAL CONTRIBUTIONS
========================================================= */

/**
 * GET /api/savings/goals/:goalId/contributions
 *
 * Query:
 * ?page=1
 * ?limit=20
 * ?status=completed
 * ?startDate=2026-01-01
 * ?endDate=2026-12-31
 */
export const getGoalContributionsController =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const {
        page,
        limit,
      } = getPagination(req);

      const status =
        req.query?.status || null;

      const startDate =
        req.query?.startDate || null;

      const endDate =
        req.query?.endDate || null;

      const result =
        await getGoalContributions({
          userId,
          goalId,
          page,
          limit,
          status,
          startDate,
          endDate,
          session:
            getRequestSession(req),
        });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination:
          result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   GET SAVING HISTORY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/history
 *
 * Returns contributions and execution
 * records separately.
 */
export const getSavingHistoryController =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const {
        page,
        limit,
      } = getPagination(req);

      const history =
        await getSavingHistory({
          userId,
          goalId,
          page,
          limit,
          session:
            getRequestSession(req),
        });

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   CHECK CONTRIBUTION ELIGIBILITY
========================================================= */

/**
 * GET /api/savings/goals/:goalId/eligibility
 *
 * Query:
 * ?amount=5000
 */
export const checkSavingEligibilityController =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const amount =
        req.query?.amount;

      const eligibility =
        await checkSavingEligibility({
          userId,
          goalId,
          amount,
          session:
            getRequestSession(req),
        });

      return res.status(200).json({
        success: true,
        data: eligibility,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  getUserSavingGoalsController,
  getSavingGoalController,
  getSavingSummaryController,
  getGoalContributionsController,
  getSavingHistoryController,
  checkSavingEligibilityController,
};