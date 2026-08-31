
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
 * Goal database access belongs to:
 *
 * savingGoalService.js
 *
 * Contribution database access belongs to:
 *
 * savingContributionService.js
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

/**
 * Extract the authenticated user's ID.
 *
 * The controller NEVER accepts userId from:
 *
 * - req.body
 * - req.query
 * - req.params
 *
 * The authenticated identity comes exclusively from
 * req.user.
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
   DATE NORMALIZATION
============================================================ */

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
   CONTRIBUTION STATISTICS
============================================================ */

/**
 * Retrieve contribution statistics for a saving goal.
 *
 * The contribution service is deliberately accessed through
 * its public service API.
 *
 * This controller does not query the contribution model
 * directly.
 */
const getContributionStatistics = async ({
  goalId,
  userId,
}) => {
  /*
   * The expected contribution-service method is:
   *
   * getContributionStatistics(goalId, userId)
   *
   * Validate that the service actually exposes it before
   * attempting to call it.
   */
  if (
    typeof savingContributionService
      .getContributionStatistics !==
    "function"
  ) {
    throw new SavingInsightServiceError(
      "Saving contribution service is not configured correctly",
      500,
      "CONTRIBUTION_SERVICE_METHOD_MISSING"
    );
  }

  const statistics =
    await savingContributionService.getContributionStatistics(
      goalId,
      userId
    );

  return {
    contributionCount:
      Number(
        statistics?.contributionCount ?? 0
      ),

    averageContribution:
      Number(
        statistics?.averageContribution ?? 0
      ),

    largestContribution:
      Number(
        statistics?.largestContribution ?? 0
      ),
  };
};

/* ============================================================
   GOAL DATA LOADER
============================================================ */

/**
 * Retrieve saving goals together with contribution statistics.
 *
 * IMPORTANT:
 *
 * This function now matches the actual savingGoalService API.
 *
 * savingGoalService provides:
 *
 * - getSavingGoal({ userId, goalId })
 * - getSavingGoals({ userId, ... })
 *
 * It does NOT provide:
 *
 * - getGoalById()
 * - getUserGoals()
 */
const loadGoalInsightData = async ({
  userId,
  goalId = null,
}) => {
  let goals = [];

  /* ----------------------------------------------------------
     SINGLE GOAL
  ---------------------------------------------------------- */

  if (goalId) {
    if (
      typeof savingGoalService
        .getSavingGoal !==
      "function"
    ) {
      throw new SavingInsightServiceError(
        "Saving goal service is not configured correctly",
        500,
        "GOAL_SERVICE_METHOD_MISSING"
      );
    }

    const goal =
      await savingGoalService.getSavingGoal({
        userId,
        goalId,
      });

    /*
     * getSavingGoal already throws a 404 when the goal
     * does not exist.
     */
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
    if (
      typeof savingGoalService
        .getSavingGoals !==
      "function"
    ) {
      throw new SavingInsightServiceError(
        "Saving goal service is not configured correctly",
        500,
        "GOAL_SERVICE_METHOD_MISSING"
      );
    }

    const result =
      await savingGoalService.getSavingGoals({
        userId,
        page: 1,
        limit: 100,
      });

    /*
     * getSavingGoals returns:
     *
     * {
     *   goals,
     *   pagination
     * }
     */
    goals = Array.isArray(
      result?.goals
    )
      ? result.goals
      : [];
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
     ENRICH GOALS
  ---------------------------------------------------------- */

  const enrichedGoals =
    await Promise.all(
      goals.map(async (goal) => {
        const goalIdValue =
          goal?._id ??
          goal?.id;

        /*
         * A valid goal should always have an ID.
         * If it does not, we can still return the goal
         * with empty contribution statistics.
         */
        if (!goalIdValue) {
          return {
            goal,

            contributionCount: 0,

            averageContribution: 0,

            largestContribution: 0,

            contributionAmount:
              goal?.plannedContributionAmount ??
              goal?.contributionAmount ??
              null,

            frequency:
              goal?.contributionFrequency ??
              null,
          };
        }

        const statistics =
          await getContributionStatistics({
            goalId:
              String(goalIdValue),

            userId,
          });

        return {
          goal,

          contributionCount:
            statistics.contributionCount,

          averageContribution:
            statistics.averageContribution,

          largestContribution:
            statistics.largestContribution,

          /*
           * Your SavingGoal service/schema uses
           * plannedContributionAmount.
           *
           * Keep contributionAmount as the normalized
           * field expected by the insight service.
           */
          contributionAmount:
            goal?.plannedContributionAmount ??
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
      savingsInsightService.generateDashboardSavingInsights({
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
      req.params;

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
      savingsInsightService.generateGoalInsights({
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
      savingsInsightService.generateDashboardSavingInsights({
        goals,
        asOfDate,
      });

    const topInsight =
      savingsInsightService.getTopSavingInsight({
        insights:
          result.insights,
      });

    return sendSuccess(
      res,
      {
        insight:
          topInsight,

        summary:
          result.summary,
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
      savingsInsightService.generateDashboardSavingInsights({
        goals,
        asOfDate,
      });

    const insightSummary =
      savingsInsightService.summarizeInsights({
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

  /* ----------------------------------------------------------
     KNOWN INSIGHT SERVICE ERROR
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
    error?.code ||
    "INTERNAL_SERVER_ERROR";

  /*
   * Never expose internal infrastructure/database
   * information for server errors.
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

const savingsInsightController = {
  getDashboardSavingInsights,
  getGoalSavingInsights,
  getTopSavingInsight,
  getSavingInsightSummary,
};

export default savingsInsightController;
