// controllers/savings/savingScheduleController.js

import {
  createSavingSchedule,
  getSavingSchedule,
  getSavingSchedules,
  getActiveSavingSchedules,
  updateSavingSchedule,
  activateSavingSchedule,
  pauseSavingSchedule,
  resumeSavingSchedule,
  cancelSavingSchedule,
  deleteSavingSchedule,
  completeSavingSchedule,
  getSavingScheduleStats,
} from "../../services/savingScheduleService.js";

/* =========================================================
   RESPONSE HELPER
========================================================= */

const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = null,
  } = {}
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   AUTHENTICATED USER
========================================================= */

/**
 * Ownership MUST always come from the authenticated
 * request.
 *
 * Never accept userId from:
 * - req.body
 * - req.params
 * - req.query
 */
const getAuthenticatedUserId = (req) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    const error = new Error(
      "Authenticated user is required."
    );

    error.statusCode = 401;
    error.code = "AUTHENTICATION_REQUIRED";

    throw error;
  }

  return userId;
};

/* =========================================================
   DATABASE SESSION
========================================================= */

/**
 * Normal HTTP requests normally have no MongoDB session.
 *
 * Higher-level transaction orchestration may attach
 * req.mongoSession.
 */
const getRequestSession = (req) =>
  req.mongoSession || null;

/* =========================================================
   CREATE SAVING SCHEDULE
========================================================= */

/**
 * POST /api/savings/schedules
 */
export const createSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const schedule =
      await createSavingSchedule({
        userId,
        data: req.body,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Saving schedule created successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET SINGLE SAVING SCHEDULE
========================================================= */

/**
 * GET /api/savings/schedules/:scheduleId
 */
export const getSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await getSavingSchedule({
        userId,
        scheduleId,
        session:
          getRequestSession(req),
        populateGoal: true,
      });

    return sendSuccess(res, {
      message:
        "Saving schedule retrieved successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET USER SAVING SCHEDULES
========================================================= */

/**
 * GET /api/savings/schedules
 *
 * Query parameters:
 *
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?savingGoal=<id>
 * ?fundingSource=wallet
 * ?strategy=fixed
 * ?frequency=monthly
 * ?isAutomatic=true
 * ?includeCancelled=false
 */
export const getSchedules = async (
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
      status,
      savingGoal,
      fundingSource,
      strategy,
      frequency,
      isAutomatic,
      includeCancelled,
    } = req.query;

    const parseBoolean = (
      value,
      fieldName
    ) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return undefined;
      }

      if (
        value === true ||
        value === "true"
      ) {
        return true;
      }

      if (
        value === false ||
        value === "false"
      ) {
        return false;
      }

      const error = new Error(
        `${fieldName} must be true or false.`
      );

      error.statusCode = 400;
      error.code = "INVALID_BOOLEAN";

      throw error;
    };

    const schedules =
      await getSavingSchedules({
        userId,
        page,
        limit,
        status,
        savingGoal,
        fundingSource,
        strategy,
        frequency,
        isAutomatic:
          parseBoolean(
            isAutomatic,
            "isAutomatic"
          ),
        includeCancelled:
          parseBoolean(
            includeCancelled,
            "includeCancelled"
          ) ?? false,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedules retrieved successfully.",
      data: schedules.schedules,
      meta: {
        pagination:
          schedules.pagination,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET ACTIVE SAVING SCHEDULES
========================================================= */

/**
 * GET /api/savings/schedules/active
 */
export const getActiveSchedules = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const schedules =
      await getActiveSavingSchedules({
        userId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Active saving schedules retrieved successfully.",
      data: schedules,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   UPDATE SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId
 */
export const updateSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await updateSavingSchedule({
        userId,
        scheduleId,
        data: req.body,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule updated successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   ACTIVATE SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/activate
 *
 * Optional body:
 *
 * {
 *   "nextExecutionAt":
 *     "2026-08-20T08:00:00.000Z"
 * }
 */
export const activateSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await activateSavingSchedule({
        userId,
        scheduleId,
        nextExecutionAt:
          req.body?.nextExecutionAt ||
          null,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule activated successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   PAUSE SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/pause
 */
export const pauseSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await pauseSavingSchedule({
        userId,
        scheduleId,
        reason:
          req.body?.reason ||
          "Paused by user",
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule paused successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   RESUME SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/resume
 */
export const resumeSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await resumeSavingSchedule({
        userId,
        scheduleId,
        nextExecutionAt:
          req.body?.nextExecutionAt,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule resumed successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   CANCEL SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/cancel
 */
export const cancelSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await cancelSavingSchedule({
        userId,
        scheduleId,
        reason:
          req.body?.reason ||
          "Cancelled by user",
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule cancelled successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   DELETE SAVING SCHEDULE
========================================================= */

/**
 * DELETE /api/savings/schedules/:scheduleId
 *
 * The service layer determines whether this is a soft
 * lifecycle transition or another safe deletion strategy.
 *
 * Financial records must never be physically deleted
 * merely because a schedule is removed.
 */
export const deleteSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await deleteSavingSchedule({
        userId,
        scheduleId,
        reason:
          req.body?.reason ||
          "Deleted by user",
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule deleted successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   COMPLETE SAVING SCHEDULE
========================================================= */

/**
 * PATCH /api/savings/schedules/:scheduleId/complete
 *
 * IMPORTANT:
 * Completion should normally be performed by the
 * savings execution/worker lifecycle.
 *
 * Only expose this route if the service contract and
 * route policy explicitly permit user-driven completion.
 */
export const completeSchedule = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const schedule =
      await completeSavingSchedule({
        userId,
        scheduleId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule completed successfully.",
      data: schedule,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   GET SCHEDULE STATISTICS
========================================================= */

/**
 * GET /api/savings/schedules/:scheduleId/stats
 */
export const getScheduleStats = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const { scheduleId } = req.params;

    const stats =
      await getSavingScheduleStats({
        userId,
        scheduleId,
        session:
          getRequestSession(req),
      });

    return sendSuccess(res, {
      message:
        "Saving schedule statistics retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const savingScheduleController = {
  createSchedule,
  getSchedule,
  getSchedules,
  getActiveSchedules,
  updateSchedule,
  activateSchedule,
  pauseSchedule,
  resumeSchedule,
  cancelSchedule,
  deleteSchedule,
  completeSchedule,
  getScheduleStats,
};

export default savingScheduleController;