
// src/config/controllers/savingsGoalController.js

import savingGoalService from "../../services/savingGoalService.js";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const sendSuccess = (
  res,
  {
    statusCode = 200,
    message,
    data = null,
    meta,
  } = {}
) => {
  const response = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, error) => {
  const statusCode =
    Number(error?.statusCode) >= 400
      ? Number(error.statusCode)
      : 500;

  const response = {
    success: false,
    message:
      error?.message ||
      "An unexpected error occurred",
  };

  if (error?.code) {
    response.code = error.code;
  }

  /*
   * Stack traces are useful during development,
   * but must never be exposed in production.
   */
  if (
    process.env.NODE_ENV !== "production" &&
    error?.stack
  ) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   AUTHENTICATED USER
========================================================= */

const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?._id ??
    req.user?.id ??
    req.auth?.userId ??
    req.auth?.id;

  if (!userId) {
    const error = new Error(
      "Authenticated user not found"
    );

    error.statusCode = 401;
    error.code = "UNAUTHENTICATED";

    throw error;
  }

  return userId;
};

/* =========================================================
   GET ALL SAVING GOALS
   GET /api/savings/goals
========================================================= */

export const getSavingGoalsController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      goalType,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      includeDeleted = false,
    } = req.query;

    const result =
      await savingGoalService.getSavingGoals({
        userId,
        page,
        limit,
        status,
        category,
        priority,
        goalType,
        search,
        sortBy,
        sortOrder,
        includeDeleted:
          String(includeDeleted) === "true",
      });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.goals,
      meta: {
        pagination: result.pagination,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   GET SINGLE SAVING GOAL
   GET /api/savings/goals/:goalId
========================================================= */

export const getSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.getSavingGoal({
        userId,
        goalId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   CREATE SAVING GOAL
   POST /api/savings/goals
========================================================= */

export const createSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const goal =
      await savingGoalService.createSavingGoal({
        userId,
        data: req.body,
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Saving goal created successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   UPDATE SAVING GOAL
   PATCH /api/savings/goals/:goalId
========================================================= */

export const updateSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.updateSavingGoal({
        userId,
        goalId,
        data: req.body,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal updated successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   PAUSE SAVING GOAL
   POST /api/savings/goals/:goalId/pause
========================================================= */

export const pauseSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.pauseSavingGoal({
        userId,
        goalId,
        reason:
          req.body?.reason || "",
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal paused successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   RESUME SAVING GOAL
   POST /api/savings/goals/:goalId/resume
========================================================= */

export const resumeSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.resumeSavingGoal({
        userId,
        goalId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal resumed successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   CANCEL SAVING GOAL
   POST /api/savings/goals/:goalId/cancel
========================================================= */

export const cancelSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.cancelSavingGoal({
        userId,
        goalId,
        reason:
          req.body?.reason || "",
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal cancelled successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   DELETE SAVING GOAL
   DELETE /api/savings/goals/:goalId
========================================================= */

export const deleteSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.deleteSavingGoal({
        userId,
        goalId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal deleted successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   RESTORE SAVING GOAL
   POST /api/savings/goals/:goalId/restore
========================================================= */

export const restoreSavingGoalController = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { goalId } = req.params;

    const goal =
      await savingGoalService.restoreSavingGoal({
        userId,
        goalId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Saving goal restored successfully",
      data: goal,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/* =========================================================
   SET PRIMARY SAVING GOAL
   POST /api/savings/goals/:goalId/primary
========================================================= */

export const setPrimarySavingGoalController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const goal =
        await savingGoalService.setPrimarySavingGoal({
          userId,
          goalId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        message:
          "Primary saving goal updated successfully",
        data: goal,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   REMOVE PRIMARY STATUS
   DELETE /api/savings/goals/:goalId/primary
========================================================= */

export const removePrimarySavingGoalController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const goal =
        await savingGoalService.removePrimarySavingGoal({
          userId,
          goalId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        message:
          "Primary status removed successfully",
        data: goal,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   GET PRIMARY SAVING GOAL
   GET /api/savings/goals/primary
========================================================= */

export const getPrimarySavingGoalController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const goal =
        await savingGoalService.getPrimarySavingGoal({
          userId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        data: goal,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   GET GOAL PROGRESS
   GET /api/savings/goals/:goalId/progress
========================================================= */

export const getSavingGoalProgressController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const progress =
        await savingGoalService.getSavingGoalProgress({
          userId,
          goalId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        data: progress,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   COMPLETE SAVING GOAL
   POST /api/savings/goals/:goalId/complete
========================================================= */

export const completeSavingGoalController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const goal =
        await savingGoalService.completeSavingGoal({
          userId,
          goalId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        message:
          "Saving goal completed successfully",
        data: goal,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   EXPIRE SAVING GOAL
   POST /api/savings/goals/:goalId/expire
========================================================= */

export const expireSavingGoalController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const { goalId } = req.params;

      const goal =
        await savingGoalService.expireSavingGoal({
          userId,
          goalId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        message:
          "Saving goal expired successfully",
        data: goal,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   GET SAVING GOAL SUMMARY
   GET /api/savings/goals/summary
========================================================= */

export const getSavingGoalSummaryController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const summary =
        await savingGoalService.getSavingGoalSummary({
          userId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        data: summary,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   GET ACTIVE SAVING GOALS
========================================================= */

export const getActiveSavingGoalsController =
  async (req, res) => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const goals =
        await savingGoalService.getActiveSavingGoals({
          userId,
        });

      return sendSuccess(res, {
        statusCode: 200,
        data: goals,
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const savingGoalController = {
  getSavingGoalsController,
  getSavingGoalController,
  createSavingGoalController,
  updateSavingGoalController,

  pauseSavingGoalController,
  resumeSavingGoalController,
  cancelSavingGoalController,

  deleteSavingGoalController,
  restoreSavingGoalController,

  setPrimarySavingGoalController,
  removePrimarySavingGoalController,
  getPrimarySavingGoalController,

  getSavingGoalProgressController,

  completeSavingGoalController,
  expireSavingGoalController,

  getSavingGoalSummaryController,
  getActiveSavingGoalsController,
};

export default savingGoalController;
