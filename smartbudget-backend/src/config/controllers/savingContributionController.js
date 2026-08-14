import savingContributionService from "../../services/savingContributionService.js";

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
   CREATE CONTRIBUTION
========================================================= */

/**
 * POST /api/savings/contributions
 *
 * Creates a new savings contribution.
 *
 * IMPORTANT:
 * The service is responsible for:
 * - validating the goal
 * - validating the contribution amount
 * - validating available balance/funding
 * - handling idempotency
 * - creating the contribution record
 * - updating the appropriate financial aggregates
 */
export const createContribution = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const idempotencyKey =
      req.get("Idempotency-Key") ||
      req.body?.idempotencyKey ||
      null;

    const contribution =
      await savingContributionService.createContribution({
        userId,
        data: req.body,
        idempotencyKey,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Savings contribution created successfully",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CONTRIBUTION BY ID
========================================================= */

/**
 * GET /api/savings/contributions/:contributionId
 */
export const getContributionById = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const contribution =
      await savingContributionService.getContributionById({
        userId,
        contributionId,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contribution retrieved successfully",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET USER CONTRIBUTIONS
========================================================= */

/**
 * GET /api/savings/contributions
 *
 * Supports filters such as:
 *
 * ?status=completed
 * ?source=manual
 * ?savingGoal=...
 * ?savingPlan=...
 * ?isAutomatic=true
 * ?page=1
 * ?limit=20
 * ?startDate=...
 * ?endDate=...
 */
export const getUserContributions = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingContributionService.getUserContributions({
        userId,
        query: req.query,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contributions retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CONTRIBUTIONS FOR GOAL
========================================================= */

/**
 * GET /api/savings/goals/:goalId/contributions
 */
export const getGoalContributions = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { goalId } = req.params;

    const result =
      await savingContributionService.getGoalContributions({
        userId,
        goalId,
        query: req.query,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Goal contributions retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CONTRIBUTIONS FOR PLAN
========================================================= */

/**
 * GET /api/savings/plans/:planId/contributions
 */
export const getPlanContributions = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { planId } = req.params;

    const result =
      await savingContributionService.getPlanContributions({
        userId,
        planId,
        query: req.query,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Plan contributions retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CONTRIBUTION SUMMARY
========================================================= */

/**
 * GET /api/savings/contributions/summary
 */
export const getContributionSummary = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const result =
      await savingContributionService.getContributionSummary({
        userId,
        query: req.query,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Contribution summary retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   MARK CONTRIBUTION AS COMPLETED
========================================================= */

/**
 * POST /api/savings/contributions/:contributionId/complete
 *
 * Normally used by a trusted backend workflow.
 *
 * Payment-provider/webhook confirmation should ultimately
 * be handled by the appropriate payment service rather than
 * trusting arbitrary client requests.
 */
export const completeContribution = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const contribution =
      await savingContributionService.completeContribution({
        userId,
        contributionId,
        data: req.body,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contribution completed successfully",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CANCEL CONTRIBUTION
========================================================= */

/**
 * POST /api/savings/contributions/:contributionId/cancel
 */
export const cancelContribution = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const contribution =
      await savingContributionService.cancelContribution({
        userId,
        contributionId,
        reason: req.body?.reason || null,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contribution cancelled successfully",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   REVERSE CONTRIBUTION
========================================================= */

/**
 * POST /api/savings/contributions/:contributionId/reverse
 *
 * IMPORTANT:
 * Reversal must NOT mutate the original financial amount.
 *
 * The service should create/process the appropriate
 * reversal financial record.
 */
export const reverseContribution = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!reason) {
      return res.status(400).json({
        success: false,
        message:
          "A reversal reason is required",
      });
    }

    const contribution =
      await savingContributionService.reverseContribution({
        userId,
        contributionId,
        reason,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contribution reversed successfully",
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CONTRIBUTION STATUS
========================================================= */

/**
 * GET /api/savings/contributions/:contributionId/status
 */
export const getContributionStatus = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const result =
      await savingContributionService.getContributionStatus({
        userId,
        contributionId,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Contribution status retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RECONCILE CONTRIBUTION
========================================================= */

/**
 * POST /api/savings/contributions/:contributionId/reconcile
 *
 * Intended for trusted reconciliation workflows.
 */
export const reconcileContribution = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const { contributionId } = req.params;

    const result =
      await savingContributionService.reconcileContribution({
        userId,
        contributionId,
        data: req.body,
        session: req.mongoSession || null,
      });

    return sendSuccess(res, {
      message:
        "Savings contribution reconciled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   EXPORT CONTROLLER
========================================================= */

export default {
  createContribution,
  getContributionById,
  getUserContributions,
  getGoalContributions,
  getPlanContributions,
  getContributionSummary,
  completeContribution,
  cancelContribution,
  reverseContribution,
  getContributionStatus,
  reconcileContribution,
};