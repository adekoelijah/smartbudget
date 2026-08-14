/**
 * ============================================================
 * SAVINGS INSIGHT CONTROLLER
 * ============================================================
 *
 * HTTP/controller layer for SmartBudget savings intelligence.
 *
 * Responsibilities:
 *
 * - Validate authenticated requests
 * - Validate route/query parameters
 * - Retrieve saving-goal intelligence data
 * - Delegate calculations to savingsInsightService
 * - Return consistent API responses
 * - Handle known service errors
 * - Prevent clients from supplying arbitrary user IDs
 *
 * IMPORTANT:
 *
 * This controller MUST NOT:
 *
 * - Perform financial calculations
 * - Modify saving goals
 * - Create contributions
 * - Update contributions
 * - Delete savings records
 * - Directly manipulate database documents
 *
 * Financial intelligence belongs to:
 *
 * savingsInsightService.js
 *
 * Calculations belong to:
 *
 * savingCalculationService.js
 *
 * Database access belongs to the appropriate service layer.
 *
 * ============================================================
 */

import savingsInsightService, {
  SavingInsightServiceError,
} from "../../services/savingsInsightService.js";

import savingGoalService from "../../services/savingGoalService.js";
// import savingContributionService from "../../services/savingContributionService.js";
import * as savingContributionService
from "../../services/savingContributionService.js";

/* ============================================================
   RESPONSE HELPERS
============================================================ */

const sendSuccess = (
  res,
  data,
  message = "Request successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  code = "INTERNAL_SERVER_ERROR",
  details = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details ? { details } : {}),
  });
};

/* ============================================================
   AUTHENTICATION HELPERS
============================================================ */

const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (!userId) {
    throw new SavingInsightServiceError(
      "Authenticated user is required",
      401,
      "UNAUTHENTICATED"
    );
  }

  return String(userId);
};

/* ============================================================
   QUERY NORMALIZATION
============================================================ */

const normalizeDateQuery = (value) => {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SavingInsightServiceError(
      "Invalid asOfDate",
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

/* ============================================================
   GOAL DATA LOADER
============================================================ */

/**
 * Retrieve goals together with the contribution statistics
 * required by savingsInsightService.
 *
 * IMPORTANT:
 *
 * The exact service method names below should match your
 * existing savingGoalService and savingContributionService.
 */
const loadGoalInsightData = async ({
  userId,
  goalId = null,
}) => {
  let goals;

  if (goalId) {
    const goal =
      await savingGoalService.getGoalById(
        goalId,
        userId
      );

    if (!goal) {
      throw new SavingInsightServiceError(
        "Saving goal not found",
        404,
        "GOAL_NOT_FOUND"
      );
    }

    goals = [goal];
  } else {
    goals =
      await savingGoalService.getUserGoals(
        userId
      );
  }

  if (!Array.isArray(goals)) {
    throw new SavingInsightServiceError(
      "Unable to retrieve saving goals",
      500,
      "INVALID_GOAL_DATA"
    );
  }

  const enrichedGoals = await Promise.all(
    goals.map(async (goal) => {
      const goalIdValue =
        goal?._id || goal?.id;

      if (!goalIdValue) {
        return {
          goal,
          contributionCount: 0,
          averageContribution: 0,
          largestContribution: 0,
        };
      }

      const statistics =
        await savingContributionService
          .getContributionStatistics(
            goalIdValue,
            userId
          );

      return {
        goal,

        contributionCount:
          statistics?.contributionCount || 0,

        averageContribution:
          statistics?.averageContribution || 0,

        largestContribution:
          statistics?.largestContribution || 0,

        contributionAmount:
          goal?.contributionAmount ||
          null,

        frequency:
          goal?.contributionFrequency ||
          null,
      };
    })
  );

  return enrichedGoals;
};

/* ============================================================
   GET DASHBOARD SAVING INSIGHTS
============================================================ */

/**
 * GET /api/savings/insights
 *
 * Returns dashboard-level saving intelligence.
 */
export const getDashboardSavingInsights = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const asOfDate =
      normalizeDateQuery(
        req.query?.asOfDate
      );

    const goals =
      await loadGoalInsightData({
        userId,
      });

    const result =
      savingsInsightService
        .generateDashboardSavingInsights({
          goals,
          asOfDate,
        });

    return sendSuccess(
      res,
      result,
      "Saving insights retrieved successfully"
    );
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "GET_DASHBOARD_SAVING_INSIGHTS_ERROR"
    );
  }
};

/* ============================================================
   GET SINGLE GOAL INSIGHTS
============================================================ */

/**
 * GET /api/savings/goals/:goalId/insights
 *
 * Returns detailed intelligence for one saving goal.
 */
export const getGoalSavingInsights = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    if (!goalId) {
      return sendError(
        res,
        "Goal ID is required",
        400,
        "GOAL_ID_REQUIRED"
      );
    }

    const asOfDate =
      normalizeDateQuery(
        req.query?.asOfDate
      );

    const goalData =
      await loadGoalInsightData({
        userId,
        goalId,
      });

    if (goalData.length === 0) {
      throw new SavingInsightServiceError(
        "Saving goal not found",
        404,
        "GOAL_NOT_FOUND"
      );
    }

    const goal = goalData[0];

    const result =
      savingsInsightService
        .generateGoalInsights({
          goal: goal.goal,

          asOfDate,

          contributionCount:
            goal.contributionCount,

          averageContribution:
            goal.averageContribution,

          largestContribution:
            goal.largestContribution,

          contributionAmount:
            goal.contributionAmount,

          frequency:
            goal.frequency,
        });

    return sendSuccess(
      res,
      result,
      "Goal saving insights retrieved successfully"
    );
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "GET_GOAL_SAVING_INSIGHTS_ERROR"
    );
  }
};

/* ============================================================
   GET TOP SAVING INSIGHT
============================================================ */

/**
 * GET /api/savings/insights/top
 *
 * Returns the highest-priority insight across the user's
 * active savings portfolio.
 */
export const getTopSavingInsight = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const asOfDate =
      normalizeDateQuery(
        req.query?.asOfDate
      );

    const goals =
      await loadGoalInsightData({
        userId,
      });

    const result =
      savingsInsightService
        .generateDashboardSavingInsights({
          goals,
          asOfDate,
        });

    const topInsight =
      savingsInsightService
        .getTopSavingInsight({
          insights:
            result.insights,
        });

    return sendSuccess(
      res,
      {
        insight: topInsight,
        summary: result.summary,
      },
      topInsight
        ? "Top saving insight retrieved successfully"
        : "No saving insights available"
    );
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "GET_TOP_SAVING_INSIGHT_ERROR"
    );
  }
};

/* ============================================================
   GET INSIGHT SUMMARY
============================================================ */

/**
 * GET /api/savings/insights/summary
 *
 * Returns aggregate insight counts for the dashboard.
 */
export const getSavingInsightSummary = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const asOfDate =
      normalizeDateQuery(
        req.query?.asOfDate
      );

    const goals =
      await loadGoalInsightData({
        userId,
      });

    const result =
      savingsInsightService
        .generateDashboardSavingInsights({
          goals,
          asOfDate,
        });

    const insightSummary =
      savingsInsightService
        .summarizeInsights({
          insights:
            result.insights,
        });

    return sendSuccess(
      res,
      {
        summary:
          result.summary,

        insights:
          insightSummary,
      },
      "Saving insight summary retrieved successfully"
    );
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "GET_SAVING_INSIGHT_SUMMARY_ERROR"
    );
  }
};

/* ============================================================
   ERROR HANDLER
============================================================ */

const handleControllerError = (
  error,
  res,
  logContext
) => {
  console.error(
    `${logContext}:`,
    error
  );

  if (
    error instanceof
    SavingInsightServiceError
  ) {
    return sendError(
      res,
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  /*
   * Preserve errors that expose an HTTP status
   * from downstream services.
   */
  const statusCode =
    Number.isInteger(error?.statusCode)
      ? error.statusCode
      : Number.isInteger(error?.status)
        ? error.status
        : 500;

  const code =
    error?.code ||
    "INTERNAL_SERVER_ERROR";

  /*
   * Do not expose internal database,
   * stack-trace, or infrastructure details
   * in production responses.
   */
  const message =
    statusCode >= 500
      ? "Unable to retrieve saving insights"
      : error?.message ||
        "Request failed";

  return sendError(
    res,
    message,
    statusCode,
    code
  );
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  getDashboardSavingInsights,
  getGoalSavingInsights,
  getTopSavingInsight,
  getSavingInsightSummary,
};