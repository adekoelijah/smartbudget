
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
 * - Load saving-goal intelligence data
 * - Delegate intelligence calculations to savingsInsightService
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

import * as savingContributionService from "../../services/savingContributionService.js";

/* ============================================================
   RESPONSE HELPERS
============================================================ */

/**
 * Send a successful API response.
 */
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

/**
 * Send a consistent API error response.
 */
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

/**
 * Extract the authenticated user ID from the request.
 *
 * The controller NEVER accepts userId from:
 *
 * - req.body
 * - req.query
 * - req.params
 *
 * The authenticated identity comes only from req.user.
 */
const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?._id ??
    req.user?.id ??
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

/**
 * Normalize the optional asOfDate query parameter.
 *
 * If no date is supplied, the current date/time is used.
 */
const normalizeDateQuery = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
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
   SERVICE VALIDATION
============================================================ */

/**
 * Ensure the expected saving-goal service methods exist.
 *
 * This prevents an obscure:
 *
 *   "savingGoalService.getUserGoals is not a function"
 *
 * error from reaching the controller.
 */
const assertGoalServiceMethods = () => {
  if (
    typeof savingGoalService?.getUserGoals !==
    "function"
  ) {
    throw new SavingInsightServiceError(
      "Saving goal service is not configured correctly",
      500,
      "GOAL_SERVICE_METHOD_MISSING"
    );
  }

  if (
    typeof savingGoalService?.getGoalById !==
    "function"
  ) {
    throw new SavingInsightServiceError(
      "Saving goal lookup service is not configured correctly",
      500,
      "GOAL_LOOKUP_METHOD_MISSING"
    );
  }
};

/**
 * Ensure the contribution service exposes the
 * summary method expected by this controller.
 *
 * NOTE:
 *
 * The provided savingContributionService.js exports:
 *
 *   getContributionSummary()
 *
 * NOT:
 *
 *   getContributionStatistics()
 */
const assertContributionServiceMethods = () => {
  if (
    typeof savingContributionService
      ?.getContributionSummary !==
    "function"
  ) {
    throw new SavingInsightServiceError(
      "Saving contribution summary service is not configured correctly",
      500,
      "CONTRIBUTION_SUMMARY_METHOD_MISSING"
    );
  }
};

/* ============================================================
   GOAL DATA LOADER
============================================================ */

/**
 * Retrieve saving goals together with contribution
 * statistics required by savingsInsightService.
 *
 * This function deliberately delegates all contribution
 * aggregation to savingContributionService.
 *
 * It does NOT calculate financial values itself.
 */
const loadGoalInsightData = async ({
  userId,
  goalId = null,
}) => {
  assertGoalServiceMethods();
  assertContributionServiceMethods();

  let goals;

  /* ----------------------------------------------------------
     SINGLE GOAL
  ---------------------------------------------------------- */

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
  }

  /* ----------------------------------------------------------
     ALL USER GOALS
  ---------------------------------------------------------- */

  else {
    goals =
      await savingGoalService.getUserGoals(
        userId
      );
  }

  /* ----------------------------------------------------------
     VALIDATE RESULT
  ---------------------------------------------------------- */

  if (!Array.isArray(goals)) {
    throw new SavingInsightServiceError(
      "Unable to retrieve saving goals",
      500,
      "INVALID_GOAL_DATA"
    );
  }

  /* ----------------------------------------------------------
     ENRICH GOALS WITH CONTRIBUTION SUMMARY
  ---------------------------------------------------------- */

  const enrichedGoals =
    await Promise.all(
      goals.map(async (goal) => {
        const goalIdValue =
          goal?._id ??
          goal?.id;

        /*
         * A goal without an ID should never normally happen,
         * but we fail safely instead of crashing the entire
         * insight endpoint.
         */
        if (!goalIdValue) {
          return {
            goal,

            contributionCount: 0,

            averageContribution: 0,

            largestContribution: 0,

            contributionAmount:
              goal?.contributionAmount ??
              null,

            frequency:
              goal?.contributionFrequency ??
              null,
          };
        }

        /*
         * Delegate contribution aggregation to the service.
         *
         * IMPORTANT:
         *
         * getContributionSummary() is the actual method
         * exported by savingContributionService.js.
         */
        const statistics =
          await savingContributionService
            .getContributionSummary({
              userId,

              savingGoalId:
                String(goalIdValue),
            });

        return {
          goal,

          contributionCount:
            Number(
              statistics?.contributionCount
            ) || 0,

          averageContribution:
            Number(
              statistics?.averageContribution
            ) || 0,

          largestContribution:
            Number(
              statistics?.largestContribution
            ) || 0,

          contributionAmount:
            goal?.contributionAmount ??
            null,

          frequency:
            goal?.contributionFrequency ??
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

    const { goalId } =
      req.params || {};

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

    if (
      !Array.isArray(goalData) ||
      goalData.length === 0
    ) {
      throw new SavingInsightServiceError(
        "Saving goal not found",
        404,
        "GOAL_NOT_FOUND"
      );
    }

    const goal =
      goalData[0];

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
 * Returns the highest-priority insight across the
 * user's savings portfolio.
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
            Array.isArray(
              result?.insights
            )
              ? result.insights
              : [],
        });

    return sendSuccess(
      res,
      {
        insight: topInsight ?? null,

        summary:
          result?.summary ?? null,
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
   GET SAVING INSIGHT SUMMARY
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
            Array.isArray(
              result?.insights
            )
              ? result.insights
              : [],
        });

    return sendSuccess(
      res,
      {
        summary:
          result?.summary ?? null,

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

/**
 * Central controller error handler.
 *
 * Known service errors preserve their:
 *
 * - statusCode
 * - code
 * - message
 * - safe details
 *
 * Unknown 500-level errors receive a generic message so that
 * database/infrastructure details are not exposed to clients.
 */
const handleControllerError = (
  error,
  res,
  logContext
) => {
  console.error(
    `${logContext}:`,
    error
  );

  /* ----------------------------------------------------------
     KNOWN SAVINGS INSIGHT ERROR
  ---------------------------------------------------------- */

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

  /* ----------------------------------------------------------
     DOWNSTREAM SERVICE ERROR
  ---------------------------------------------------------- */

  const statusCode =
    Number.isInteger(
      error?.statusCode
    )
      ? error.statusCode
      : Number.isInteger(
          error?.status
        )
        ? error.status
        : 500;

  const code =
    typeof error?.code === "string" &&
    error.code.trim()
      ? error.code
      : "INTERNAL_SERVER_ERROR";

  /* ----------------------------------------------------------
     SAFE CLIENT MESSAGE
  ---------------------------------------------------------- */

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
