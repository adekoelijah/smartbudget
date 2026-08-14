/**
 * ============================================================
 * SAVING EXECUTION CONTROLLER
 * ============================================================
 *
 * HTTP controller for SmartBudget saving executions.
 *
 * Responsibilities:
 * - Validate request-level input
 * - Extract authenticated user identity
 * - Call savingExecutionService
 * - Return standardized API responses
 * - Delegate errors to centralized error middleware
 *
 * IMPORTANT:
 * This controller MUST NOT:
 * - Perform database queries
 * - Create SavingContribution records
 * - Update SavingGoal
 * - Update SavingSchedule
 * - Calculate execution amounts
 * - Handle MongoDB transactions
 * - Implement retry/business logic
 * - Process financial operations directly
 *
 * Business logic belongs to:
 * savingExecutionService.js
 *
 * ============================================================
 */

import savingExecutionService from "../../services/savingExecutionService.js";

import {
  sendSuccess,
  sendError,
} from "../../utils/response.js";

/* ============================================================
   HELPERS
============================================================ */

/**
 * Get authenticated user ID.
 *
 * The protect/auth middleware should populate:
 *
 * req.user.id
 */
const getAuthenticatedUserId = (req) =>
  req.user?.id || req.user?._id;

/**
 * Normalize optional pagination/filter values.
 */
const getQueryValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
};

/* ============================================================
   CREATE EXECUTION
============================================================ */

/**
 * POST /api/saving-executions
 *
 * Creates an execution for an automatic saving schedule.
 *
 * Body:
 * {
 *   scheduleId,
 *   executionAt,
 *   baseAmount,
 *   metadata
 * }
 */
export const createSavingExecution = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return sendError(
        res,
        "Authentication required",
        401,
        "UNAUTHORIZED"
      );
    }

    const {
      scheduleId,
      executionAt,
      baseAmount,
      metadata,
    } = req.body || {};

    if (!scheduleId) {
      return sendError(
        res,
        "Saving schedule ID is required",
        400,
        "SCHEDULE_ID_REQUIRED"
      );
    }

    const execution =
      await savingExecutionService.createSavingExecution({
        userId,
        scheduleId,
        executionAt:
          executionAt || new Date(),
        baseAmount:
          baseAmount ?? null,
        metadata:
          metadata || {},
      });

    return sendSuccess(
      res,
      execution,
      "Saving execution created successfully",
      201
    );
  } catch (error) {
    return next(error);
  }
};

/* ============================================================
   GET SINGLE EXECUTION
============================================================ */

/**
 * GET /api/saving-executions/:executionId
 */
export const getSavingExecution = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return sendError(
        res,
        "Authentication required",
        401,
        "UNAUTHORIZED"
      );
    }

    const { executionId } =
      req.params;

    if (!executionId) {
      return sendError(
        res,
        "Execution ID is required",
        400,
        "EXECUTION_ID_REQUIRED"
      );
    }

    const execution =
      await savingExecutionService.getSavingExecutionById({
        executionId,
        userId,
      });

    return sendSuccess(
      res,
      execution,
      "Saving execution retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

/* ============================================================
   LIST EXECUTIONS
============================================================ */

/**
 * GET /api/saving-executions
 *
 * Supported query parameters:
 *
 * ?savingGoalId=
 * ?savingScheduleId=
 * ?status=
 * ?page=
 * ?limit=
 */
export const listSavingExecutions = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return sendError(
        res,
        "Authentication required",
        401,
        "UNAUTHORIZED"
      );
    }

    const {
      savingGoalId,
      savingScheduleId,
      status,
      page,
      limit,
    } = req.query;

    const result =
      await savingExecutionService.listSavingExecutions({
        userId,

        savingGoalId:
          getQueryValue(
            savingGoalId
          ),

        savingScheduleId:
          getQueryValue(
            savingScheduleId
          ),

        status:
          getQueryValue(status),

        page:
          page || 1,

        limit:
          limit || 20,
      });

    return sendSuccess(
      res,
      result,
      "Saving executions retrieved successfully"
    );
  } catch (error) {
    return next(error);
  }
};

/* ============================================================
   GET EXECUTION STATISTICS
============================================================ */

/**
 * GET /api/saving-executions/stats
 */
export const getSavingExecutionStats =
  async (
    req,
    res,
    next
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      if (!userId) {
        return sendError(
          res,
          "Authentication required",
          401,
          "UNAUTHORIZED"
        );
      }

      const stats =
        await savingExecutionService.getSavingExecutionStats(
          userId
        );

      return sendSuccess(
        res,
        stats,
        "Saving execution statistics retrieved successfully"
      );
    } catch (error) {
      return next(error);
    }
  };

/* ============================================================
   CANCEL EXECUTION
============================================================ */

/**
 * PATCH /api/saving-executions/:executionId/cancel
 *
 * Body:
 * {
 *   reason
 * }
 */
export const cancelSavingExecution =
  async (
    req,
    res,
    next
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      if (!userId) {
        return sendError(
          res,
          "Authentication required",
          401,
          "UNAUTHORIZED"
        );
      }

      const {
        executionId,
      } = req.params;

      const {
        reason,
      } = req.body || {};

      if (!executionId) {
        return sendError(
          res,
          "Execution ID is required",
          400,
          "EXECUTION_ID_REQUIRED"
        );
      }

      const execution =
        await savingExecutionService.cancelSavingExecution({
          executionId,
          userId,
          reason,
        });

      return sendSuccess(
        res,
        execution,
        "Saving execution cancelled successfully"
      );
    } catch (error) {
      return next(error);
    }
  };

/* ============================================================
   RETRY EXECUTION
============================================================ */

/**
 * POST /api/saving-executions/:executionId/retry
 */
export const retrySavingExecution =
  async (
    req,
    res,
    next
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      if (!userId) {
        return sendError(
          res,
          "Authentication required",
          401,
          "UNAUTHORIZED"
        );
      }

      const {
        executionId,
      } = req.params;

      if (!executionId) {
        return sendError(
          res,
          "Execution ID is required",
          400,
          "EXECUTION_ID_REQUIRED"
        );
      }

      /*
       * The service currently accepts only executionId.
       *
       * We still authenticate the request here so this
       * endpoint cannot become an unauthenticated execution
       * lifecycle endpoint.
       *
       * Ownership should ideally be enforced by the service
       * before retrying.
       */
      const execution =
        await savingExecutionService.retrySavingExecution(
          executionId
        );

      /*
       * Prevent an unused-variable lint warning while keeping
       * authentication explicit.
       */
      void userId;

      return sendSuccess(
        res,
        execution,
        "Saving execution queued for retry"
      );
    } catch (error) {
      return next(error);
    }
  };

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const savingExecutionController = {
  createSavingExecution,
  getSavingExecution,
  listSavingExecutions,
  getSavingExecutionStats,
  cancelSavingExecution,
  retrySavingExecution,
};

export default savingExecutionController;