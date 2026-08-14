// controllers/savings/autoSaveController.js

import mongoose from "mongoose";

import {
  createAutoSave as createAutoSaveService,
  getAutoSaveById,
  getUserAutoSaves,
  updateAutoSave as updateAutoSaveService,
  activateAutoSave as activateAutoSaveService,
  pauseAutoSave as pauseAutoSaveService,
  resumeAutoSave as resumeAutoSaveService,
  cancelAutoSave as cancelAutoSaveService,
  deleteAutoSave as deleteAutoSaveService,
  restoreAutoSave as restoreAutoSaveService,
  syncAutoSaveSchedule as syncAutoSaveScheduleService,
  unlinkAutoSaveSchedule as unlinkAutoSaveScheduleService,
  checkAutoSaveEligibility as checkAutoSaveEligibilityService,
  getAutoSaveStatus as getAutoSaveStatusService,
  getAutoSaveStatistics as getAutoSaveStatisticsService,
  getDueAutoSaves as getDueAutoSavesService,
} from "../../services/autoSaveService.js";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

/**
 * Send a successful API response.
 *
 * The controller intentionally keeps response formatting
 * here instead of putting HTTP concerns inside the service.
 */
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
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized API error.
 */
const sendError = (
  res,
  {
    statusCode = 500,
    message = "An unexpected error occurred",
    code = "INTERNAL_SERVER_ERROR",
    details = undefined,
  } = {}
) => {
  const response = {
    success: false,
    message,
    code,
  };

  if (
    details !== undefined &&
    process.env.NODE_ENV !== "production"
  ) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

/**
 * Convert service / Mongoose / unexpected errors into
 * a consistent controller response.
 */
const handleControllerError = (
  res,
  error,
  fallbackMessage = "Unable to complete AutoSave request"
) => {
  // Service-level errors.
  if (error?.statusCode) {
    return sendError(res, {
      statusCode: error.statusCode,
      message: error.message,
      code:
        error.code ||
        "AUTO_SAVE_ERROR",
    });
  }

  // Mongoose validation errors.
  if (
    error instanceof mongoose.Error.ValidationError
  ) {
    const details = Object.values(
      error.errors || {}
    ).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return sendError(res, {
      statusCode: 400,
      message: "AutoSave validation failed",
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // Invalid MongoDB ObjectId.
  if (
    error instanceof mongoose.Error.CastError
  ) {
    return sendError(res, {
      statusCode: 400,
      message: "One or more supplied identifiers are invalid",
      code: "INVALID_ID",
    });
  }

  // Duplicate-key errors.
  if (error?.code === 11000) {
    return sendError(res, {
      statusCode: 409,
      message:
        "A conflicting AutoSave configuration already exists",
      code: "DUPLICATE_RESOURCE",
    });
  }

  // Transaction errors should not be exposed directly.
  if (
    error?.codeName ===
    "NoSuchTransaction"
  ) {
    return sendError(res, {
      statusCode: 409,
      message:
        "The AutoSave operation could not be completed because the transaction expired or was interrupted",
      code: "TRANSACTION_FAILED",
    });
  }

  // Log unexpected errors server-side.
  console.error(
    "[AutoSaveController]",
    error
  );

  return sendError(res, {
    statusCode: 500,
    message: fallbackMessage,
    code: "INTERNAL_SERVER_ERROR",
  });
};

/* =========================================================
   AUTHENTICATED USER HELPER
========================================================= */

/**
 * All AutoSave operations are user-scoped.
 *
 * authMiddleware should populate req.user.id.
 */
const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (!userId) {
    const error = new Error(
      "Authenticated user could not be identified"
    );

    error.statusCode = 401;
    error.code = "AUTHENTICATION_REQUIRED";

    throw error;
  }

  return userId;
};

/* =========================================================
   CREATE
========================================================= */

/**
 * POST /autosave
 */
export const createAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const autoSave =
      await createAutoSaveService({
        userId,
        data: req.body,
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "AutoSave configuration created successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to create AutoSave configuration"
    );
  }
};

/* =========================================================
   LIST
========================================================= */

/**
 * GET /autosave
 *
 * Supported query parameters:
 * ?page=1
 * ?limit=20
 * ?status=active
 * ?savingGoal=<id>
 * ?savingAccount=<id>
 */
export const getAutoSaves = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page,
      limit,
      status,
      savingGoal,
      savingAccount,
    } = req.query;

    const result =
      await getUserAutoSaves({
        userId,
        page,
        limit,
        status,
        savingGoal,
        savingAccount,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configurations retrieved successfully",
      data: result.items,
      meta: result.pagination,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve AutoSave configurations"
    );
  }
};

/* =========================================================
   GET ONE
========================================================= */

/**
 * GET /autosave/:autoSaveId
 */
export const getAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await getAutoSaveById({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration retrieved successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve AutoSave configuration"
    );
  }
};

/* =========================================================
   UPDATE
========================================================= */

/**
 * PUT /autosave/:autoSaveId
 */
export const updateAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await updateAutoSaveService({
        userId,
        autoSaveId,
        updates: req.body,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration updated successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to update AutoSave configuration"
    );
  }
};

/* =========================================================
   ACTIVATE
========================================================= */

/**
 * POST /autosave/:autoSaveId/activate
 */
export const activateAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await activateAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration activated successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to activate AutoSave configuration"
    );
  }
};

/* =========================================================
   PAUSE
========================================================= */

/**
 * POST /autosave/:autoSaveId/pause
 */
export const pauseAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await pauseAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration paused successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to pause AutoSave configuration"
    );
  }
};

/* =========================================================
   RESUME
========================================================= */

/**
 * POST /autosave/:autoSaveId/resume
 */
export const resumeAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await resumeAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration resumed successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to resume AutoSave configuration"
    );
  }
};

/* =========================================================
   CANCEL
========================================================= */

/**
 * POST /autosave/:autoSaveId/cancel
 */
export const cancelAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await cancelAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration cancelled successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to cancel AutoSave configuration"
    );
  }
};

/* =========================================================
   SOFT DELETE
========================================================= */

/**
 * DELETE /autosave/:autoSaveId
 */
export const deleteAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await deleteAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration deleted successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to delete AutoSave configuration"
    );
  }
};

/* =========================================================
   RESTORE
========================================================= */

/**
 * POST /autosave/:autoSaveId/restore
 */
export const restoreAutoSave = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await restoreAutoSaveService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave configuration restored successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to restore AutoSave configuration"
    );
  }
};

/* =========================================================
   SYNC SAVING SCHEDULE
========================================================= */

/**
 * POST /autosave/:autoSaveId/sync-schedule
 *
 * This operation uses a MongoDB transaction because it
 * may create/update both AutoSave and SavingSchedule.
 */
export const syncAutoSaveSchedule = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    let schedule;

    await session.withTransaction(
      async () => {
        schedule =
          await syncAutoSaveScheduleService({
            userId,
            autoSaveId,
            session,
          });
      }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave schedule synchronized successfully",
      data: schedule,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to synchronize AutoSave schedule"
    );
  } finally {
    await session.endSession();
  }
};

/* =========================================================
   UNLINK SCHEDULE
========================================================= */

/**
 * POST /autosave/:autoSaveId/unlink-schedule
 */
export const unlinkAutoSaveSchedule = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const autoSave =
      await unlinkAutoSaveScheduleService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave schedule unlinked successfully",
      data: autoSave,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to unlink AutoSave schedule"
    );
  }
};

/* =========================================================
   ELIGIBILITY
========================================================= */

/**
 * GET /autosave/:autoSaveId/eligibility
 */
export const checkAutoSaveEligibility = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const result =
      await checkAutoSaveEligibilityService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave eligibility checked successfully",
      data: result,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to check AutoSave eligibility"
    );
  }
};

/* =========================================================
   STATUS
========================================================= */

/**
 * GET /autosave/:autoSaveId/status
 */
export const getAutoSaveStatus = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const result =
      await getAutoSaveStatusService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave status retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve AutoSave status"
    );
  }
};

/* =========================================================
   STATISTICS
========================================================= */

/**
 * GET /autosave/:autoSaveId/statistics
 */
export const getAutoSaveStatistics = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      autoSaveId,
    } = req.params;

    const statistics =
      await getAutoSaveStatisticsService({
        userId,
        autoSaveId,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "AutoSave statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve AutoSave statistics"
    );
  }
};

/* =========================================================
   DUE AUTOSAVES
========================================================= */

/**
 * GET /autosave/due
 *
 * IMPORTANT:
 * This should NOT normally be exposed to ordinary
 * authenticated users.
 *
 * It is intended for an internal worker / cron route
 * protected by internal authentication.
 */
export const getDueAutoSaves = async (
  req,
  res
) => {
  try {
    const {
      limit,
    } = req.query;

    const autoSaves =
      await getDueAutoSavesService({
        limit,
      });

    return sendSuccess(res, {
      statusCode: 200,
      message:
        "Due AutoSave configurations retrieved successfully",
      data: autoSaves,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Unable to retrieve due AutoSave configurations"
    );
  }
};