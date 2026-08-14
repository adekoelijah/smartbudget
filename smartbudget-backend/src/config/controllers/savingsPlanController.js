// config/controllers/savingsPlanController.js

import savingPlanService from "../../services/savingPlanService.js";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

/**
 * Standard successful API response.
 */
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

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   REQUEST HELPERS
========================================================= */

/**
 * Extract authenticated user ID.
 *
 * User ownership must always come from the authentication
 * middleware. Never trust userId from params, body, or query.
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
 * Extract an optional MongoDB transaction session.
 *
 * Normal HTTP requests do not usually contain a session.
 * Transaction orchestration should happen at a higher level.
 */
const getRequestSession = (req) =>
  req.mongoSession || null;

/**
 * Safely extract a request body.
 */
const getRequestBody = (req) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return {};
  }

  return req.body;
};

/* =========================================================
   CREATE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans
 *
 * Create a new saving plan.
 */
export const createSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const plan =
      await savingPlanService.createSavingPlan({
        userId,
        data: getRequestBody(req),
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Saving plan created successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET SAVING PLAN BY ID
========================================================= */

/**
 * GET /api/savings/plans/:planId
 */
export const getSavingPlanById = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const plan =
      await savingPlanService.getSavingPlanById({
        userId,
        planId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET USER SAVING PLANS
========================================================= */

/**
 * GET /api/savings/plans
 *
 * Supported query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?goal=<goalId>
 * ?savingAccount=<accountId>
 * ?automated=true
 */
export const getUserSavingPlans = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page = 1,
      limit = 20,
      status = null,
      goal = null,
      savingAccount = null,
      automated = null,
    } = req.query || {};

    const result =
      await savingPlanService.getUserSavingPlans({
        userId,
        page,
        limit,
        status,
        goal,
        savingAccount,
        automated,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plans retrieved successfully",

      data: result.items,

      meta: {
        pagination: result.pagination,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   UPDATE SAVING PLAN
========================================================= */

/**
 * PUT /api/savings/plans/:planId
 */
export const updateSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const plan =
      await savingPlanService.updateSavingPlan({
        userId,
        planId,
        updates: getRequestBody(req),
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan updated successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   ACTIVATE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/activate
 */
export const activateSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const plan =
      await savingPlanService.activateSavingPlan({
        userId,
        planId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan activated successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   PAUSE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/pause
 *
 * Body:
 * {
 *   "reason": "Temporary financial difficulty"
 * }
 */
export const pauseSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const body =
      getRequestBody(req);

    const reason =
      body.reason ?? null;

    const plan =
      await savingPlanService.pauseSavingPlan({
        userId,
        planId,
        reason,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan paused successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   RESUME SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/resume
 */
export const resumeSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const plan =
      await savingPlanService.resumeSavingPlan({
        userId,
        planId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan resumed successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   COMPLETE SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/complete
 *
 * Body:
 * {
 *   "reason": "target_reached"
 * }
 */
export const completeSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const body =
      getRequestBody(req);

    const reason =
      body.reason ||
      "manually_completed";

    const plan =
      await savingPlanService.completeSavingPlan({
        userId,
        planId,
        reason,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan completed successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   CANCEL SAVING PLAN
========================================================= */

/**
 * POST /api/savings/plans/:planId/cancel
 *
 * Body:
 * {
 *   "reason": "user_cancelled",
 *   "note": "No longer needed"
 * }
 */
export const cancelSavingPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const body =
      getRequestBody(req);

    const reason =
      body.reason ||
      "user_cancelled";

    const note =
      body.note ?? null;

    const plan =
      await savingPlanService.cancelSavingPlan({
        userId,
        planId,
        reason,
        note,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving plan cancelled successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   RECALCULATE PLAN METRICS
========================================================= */

/**
 * POST /api/savings/plans/:planId/recalculate-metrics
 *
 * Recalculates cached plan metrics.
 */
export const recalculateSavingPlanMetrics =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { planId } =
        req.params;

      const plan =
        await savingPlanService
          .recalculateSavingPlanMetrics({
            userId,
            planId,
            session:
              getRequestSession(req),
          });

      return sendSuccess(res, {
        message:
          "Saving plan metrics recalculated successfully",
        data: plan,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   REFRESH PLAN PROGRESS
========================================================= */

/**
 * POST /api/savings/plans/:planId/refresh-progress
 *
 * Rebuilds cached progress from contribution records.
 */
export const refreshSavingPlanProgress =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { planId } =
        req.params;

      const plan =
        await savingPlanService
          .refreshSavingPlanProgress({
            userId,
            planId,
            session:
              getRequestSession(req),
          });

      return sendSuccess(res, {
        message:
          "Saving plan progress refreshed successfully",
        data: plan,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   ATTACH AUTOMATION
========================================================= */

/**
 * POST /api/savings/plans/:planId/automation
 *
 * Body:
 * {
 *   "autoSaveId": "...",
 *   "scheduleId": "..."
 * }
 *
 * At least one automation source is required.
 */
export const attachAutomation = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const body =
      getRequestBody(req);

    const {
      autoSaveId = null,
      scheduleId = null,
    } = body;

    const plan =
      await savingPlanService.attachAutomation({
        userId,
        planId,
        autoSaveId,
        scheduleId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Automation attached to saving plan successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   DETACH AUTOMATION
========================================================= */

/**
 * DELETE /api/savings/plans/:planId/automation
 *
 * Removes all automation references from the plan.
 */
export const detachAutomation = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { planId } = req.params;

    const plan =
      await savingPlanService.detachAutomation({
        userId,
        planId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Automation detached from saving plan successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   CHECK PLAN ELIGIBILITY
========================================================= */

/**
 * GET /api/savings/plans/:planId/eligibility
 *
 * Determines whether the plan is currently eligible
 * for saving execution.
 */
export const checkSavingPlanEligibility =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { planId } =
        req.params;

      const eligibility =
        await savingPlanService
          .checkSavingPlanEligibility({
            userId,
            planId,
            session:
              getRequestSession(req),
          });

      return sendSuccess(res, {
        message:
          "Saving plan eligibility checked successfully",
        data: eligibility,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   GET PLAN STATISTICS
========================================================= */

/**
 * GET /api/savings/plans/:planId/statistics
 */
export const getSavingPlanStatistics =
  async (req, res, next) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { planId } =
        req.params;

      const statistics =
        await savingPlanService
          .getSavingPlanStatistics({
            userId,
            planId,
            session:
              getRequestSession(req),
          });

      return sendSuccess(res, {
        message:
          "Saving plan statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      return next(error);
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  createSavingPlan,
  getSavingPlanById,
  getUserSavingPlans,
  updateSavingPlan,

  activateSavingPlan,
  pauseSavingPlan,
  resumeSavingPlan,

  completeSavingPlan,
  cancelSavingPlan,

  recalculateSavingPlanMetrics,
  refreshSavingPlanProgress,

  attachAutomation,
  detachAutomation,

  checkSavingPlanEligibility,
  getSavingPlanStatistics,
};