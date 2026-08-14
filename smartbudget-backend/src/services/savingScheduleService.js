import mongoose from "mongoose";

import SavingSchedule from "../models/SavingSchedule.js";
import SavingGoal from "../models/SavingsGoal.js";

/* =========================================================
   CONSTANTS
========================================================= */

const ACTIVE_STATUSES = ["active"];

const TERMINAL_STATUSES = [
  "completed",
  "cancelled",
];

const VALID_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
  "failed",
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* =========================================================
   ERROR FACTORY
========================================================= */

const createError = (message, statusCode = 400, code = null) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  if (code) {
    error.code = code;
  }

  return error;
};

/* =========================================================
   OBJECT ID VALIDATION
========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const assertObjectId = (id, field = "ID") => {
  if (!isValidObjectId(id)) {
    throw createError(
      `Invalid ${field}`,
      400,
      "INVALID_OBJECT_ID"
    );
  }
};

/* =========================================================
   USER OWNERSHIP
========================================================= */

/**
 * Ensures that the requested schedule belongs to the user.
 *
 * This is important because controllers should never trust
 * a schedule ID supplied by the client.
 */
const findScheduleForUser = async (
  scheduleId,
  userId,
  options = {}
) => {
  assertObjectId(scheduleId, "saving schedule ID");
  assertObjectId(userId, "user ID");

  const query = SavingSchedule.findOne({
    _id: scheduleId,
    user: userId,
  });

  if (options.populateGoal) {
    query.populate({
      path: "savingGoal",
      select:
        "name targetAmount currentAmount currency status",
    });
  }

  if (options.lean) {
    query.lean();
  }

  const schedule = await query;

  if (!schedule) {
    throw createError(
      "Saving schedule not found",
      404,
      "SAVING_SCHEDULE_NOT_FOUND"
    );
  }

  return schedule;
};

/* =========================================================
   GOAL OWNERSHIP
========================================================= */

/**
 * Verifies that a SavingGoal belongs to the authenticated user.
 */
const verifyGoalOwnership = async (
  savingGoalId,
  userId
) => {
  assertObjectId(
    savingGoalId,
    "saving goal ID"
  );

  assertObjectId(userId, "user ID");

  const goal = await SavingGoal.findOne({
    _id: savingGoalId,
    user: userId,
    isDeleted: false,
  }).select(
    "_id user status targetAmount currentAmount currency"
  );

  if (!goal) {
    throw createError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  return goal;
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeCreatePayload = (
  payload = {}
) => {
  const data = {
    ...payload,
  };

  /*
   * Prevent clients from controlling ownership or
   * server-maintained fields.
   */
  delete data.user;
  delete data.createdBy;
  delete data.updatedBy;

  delete data.totalExecutions;
  delete data.successfulExecutions;
  delete data.failedExecutions;
  delete data.skippedExecutions;

  delete data.totalContributed;
  delete data.consecutiveFailures;

  delete data.lastExecutionAt;
  delete data.lastExecutionKey;

  delete data.lastFailureAt;
  delete data.lastFailureCode;
  delete data.lastFailureReason;

  return data;
};

/* =========================================================
   CREATE SCHEDULE
========================================================= */

/**
 * Creates a new SavingSchedule.
 *
 * IMPORTANT:
 * This does NOT create a financial contribution.
 */
export const createSavingSchedule =
  async ({
    userId,
    data,
    createdBy = null,
  }) => {
    assertObjectId(userId, "user ID");

    if (!data || typeof data !== "object") {
      throw createError(
        "Schedule data is required",
        400,
        "INVALID_SCHEDULE_DATA"
      );
    }

    const payload =
      normalizeCreatePayload(data);

    /*
     * Verify goal ownership before creating the schedule.
     */
    const goal =
      await verifyGoalOwnership(
        payload.savingGoal,
        userId
      );

    /*
     * Do not create schedules against terminal goals.
     */
    if (
      TERMINAL_STATUSES.includes(
        goal.status
      )
    ) {
      throw createError(
        "Cannot create a saving schedule for a completed or cancelled goal",
        409,
        "GOAL_NOT_SCHEDULABLE"
      );
    }

    /*
     * Prevent schedules from using a different currency
     * from the goal.
     */
    if (
      payload.currency &&
      payload.currency !== goal.currency
    ) {
      throw createError(
        "Schedule currency must match the saving goal currency",
        400,
        "CURRENCY_MISMATCH"
      );
    }

    const schedule =
      new SavingSchedule({
        ...payload,

        user: userId,

        /*
         * Use the goal currency when one is not supplied.
         */
        currency:
          payload.currency ||
          goal.currency ||
          "NGN",

        createdBy:
          createdBy || userId,

        updatedBy:
          createdBy || userId,
      });

    /*
     * Let the model perform its own business validation.
     */
    await schedule.validate();

    await schedule.save();

    return schedule;
  };

/* =========================================================
   GET ONE SCHEDULE
========================================================= */

export const getSavingSchedule =
  async ({
    scheduleId,
    userId,
    populateGoal = true,
  }) => {
    return findScheduleForUser(
      scheduleId,
      userId,
      {
        populateGoal,
      }
    );
  };

/* =========================================================
   LIST USER SCHEDULES
========================================================= */

export const getSavingSchedules =
  async ({
    userId,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    savingGoal,
    fundingSource,
    strategy,
    frequency,
    isAutomatic,
    includeCancelled = false,
  }) => {
    assertObjectId(userId, "user ID");

    /*
     * Normalize pagination.
     */
    page = Math.max(
      Number(page) || 1,
      1
    );

    limit = Math.min(
      Math.max(
        Number(limit) || DEFAULT_LIMIT,
        1
      ),
      MAX_LIMIT
    );

    const filter = {
      user: userId,
    };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        throw createError(
          "Invalid schedule status",
          400,
          "INVALID_SCHEDULE_STATUS"
        );
      }

      filter.status = status;
    }

    if (savingGoal) {
      assertObjectId(
        savingGoal,
        "saving goal ID"
      );

      filter.savingGoal = savingGoal;
    }

    if (fundingSource) {
      filter.fundingSource =
        fundingSource;
    }

    if (strategy) {
      filter.strategy = strategy;
    }

    if (frequency) {
      filter.frequency = frequency;
    }

    if (
      typeof isAutomatic === "boolean"
    ) {
      filter.isAutomatic = isAutomatic;
    }

    if (
      !includeCancelled &&
      !status
    ) {
      filter.status = {
        $ne: "cancelled",
      };
    }

    const skip = (page - 1) * limit;

    const [schedules, total] =
      await Promise.all([
        SavingSchedule.find(filter)
          .populate({
            path: "savingGoal",
            select:
              "name targetAmount currentAmount currency status",
          })
          .sort({
            nextExecutionAt: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        SavingSchedule.countDocuments(
          filter
        ),
      ]);

    return {
      schedules,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          page <
          Math.ceil(total / limit),

        hasPreviousPage:
          page > 1,
      },
    };
  };

/* =========================================================
   UPDATE SCHEDULE
========================================================= */

/**
 * Updates user-configurable schedule settings.
 *
 * Server-owned execution counters and financial fields are
 * deliberately protected.
 */
export const updateSavingSchedule =
  async ({
    scheduleId,
    userId,
    data,
    updatedBy = null,
  }) => {
    assertObjectId(
      scheduleId,
      "saving schedule ID"
    );

    assertObjectId(userId, "user ID");

    if (!data || typeof data !== "object") {
      throw createError(
        "Update data is required",
        400,
        "INVALID_UPDATE_DATA"
      );
    }

    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      schedule.status ===
      "cancelled"
    ) {
      throw createError(
        "Cancelled schedules cannot be modified",
        409,
        "SCHEDULE_CANCELLED"
      );
    }

    /*
     * Fields that clients are allowed to change.
     */
    const allowedFields = [
      "name",
      "description",
      "strategy",
      "amount",
      "percentage",
      "frequency",
      "dayOfWeek",
      "dayOfMonth",
      "paydayOffset",
      "interval",
      "intervalUnit",
      "executionTime",
      "timezone",
      "startDate",
      "endDate",
      "fundingSource",
      "bankAccount",
      "maximumContribution",
      "minimumBalanceRequired",
      "goalCompletionAction",
      "autoResume",
      "metadata",
    ];

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          field
        )
      ) {
        schedule[field] =
          data[field];
      }
    }

    /*
     * If changing the goal, verify ownership and currency.
     *
     * Normally changing goals should be discouraged.
     * If the architecture later decides goals are immutable
     * for a schedule, this can simply be removed from the
     * allowed fields.
     */
    if (
      data.savingGoal &&
      data.savingGoal.toString() !==
        schedule.savingGoal.toString()
    ) {
      throw createError(
        "Changing the saving goal of an existing schedule is not supported",
        409,
        "GOAL_CHANGE_NOT_ALLOWED"
      );
    }

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.validate();
    await schedule.save();

    return schedule;
  };

/* =========================================================
   ACTIVATE SCHEDULE
========================================================= */

export const activateSavingSchedule =
  async ({
    scheduleId,
    userId,
    nextExecutionAt = null,
    updatedBy = null,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      schedule.status ===
      "cancelled"
    ) {
      throw createError(
        "Cancelled schedules cannot be activated",
        409,
        "SCHEDULE_CANCELLED"
      );
    }

    if (
      schedule.status ===
      "completed"
    ) {
      throw createError(
        "Completed schedules cannot be activated",
        409,
        "SCHEDULE_COMPLETED"
      );
    }

    schedule.status = "active";

    schedule.pausedAt = null;
    schedule.pauseReason = null;

    if (nextExecutionAt) {
      const date =
        new Date(nextExecutionAt);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        throw createError(
          "Invalid next execution date",
          400,
          "INVALID_EXECUTION_DATE"
        );
      }

      schedule.nextExecutionAt =
        date;
    }

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   PAUSE SCHEDULE
========================================================= */

export const pauseSavingSchedule =
  async ({
    scheduleId,
    userId,
    reason = "Paused by user",
    updatedBy = null,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      schedule.status !==
      "active"
    ) {
      throw createError(
        "Only active schedules can be paused",
        409,
        "SCHEDULE_NOT_ACTIVE"
      );
    }

    schedule.status = "paused";
    schedule.pausedAt =
      new Date();

    schedule.pauseReason =
      String(reason).trim();

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   RESUME SCHEDULE
========================================================= */

export const resumeSavingSchedule =
  async ({
    scheduleId,
    userId,
    nextExecutionAt,
    updatedBy = null,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      schedule.status !==
      "paused"
    ) {
      throw createError(
        "Only paused schedules can be resumed",
        409,
        "SCHEDULE_NOT_PAUSED"
      );
    }

    if (
      !nextExecutionAt
    ) {
      throw createError(
        "Next execution date is required when resuming a schedule",
        400,
        "NEXT_EXECUTION_REQUIRED"
      );
    }

    const nextDate =
      new Date(nextExecutionAt);

    if (
      Number.isNaN(
        nextDate.getTime()
      )
    ) {
      throw createError(
        "Invalid next execution date",
        400,
        "INVALID_EXECUTION_DATE"
      );
    }

    schedule.status = "active";

    schedule.pausedAt = null;
    schedule.pauseReason = null;

    schedule.nextExecutionAt =
      nextDate;

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   CANCEL SCHEDULE
========================================================= */

export const cancelSavingSchedule =
  async ({
    scheduleId,
    userId,
    reason = "Cancelled by user",
    updatedBy = null,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      TERMINAL_STATUSES.includes(
        schedule.status
      )
    ) {
      throw createError(
        "This schedule is already in a terminal state",
        409,
        "SCHEDULE_TERMINAL"
      );
    }

    schedule.status =
      "cancelled";

    schedule.cancelledAt =
      new Date();

    schedule.cancellationReason =
      String(reason).trim();

    /*
     * A cancelled schedule must never
     * remain in the execution queue.
     */
    schedule.nextExecutionAt =
      null;

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   COMPLETE SCHEDULE
========================================================= */

/**
 * Used by the execution layer when a schedule has naturally
 * finished.
 */
export const completeSavingSchedule =
  async ({
    scheduleId,
    userId,
    updatedBy = null,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    if (
      schedule.status ===
      "cancelled"
    ) {
      throw createError(
        "Cancelled schedules cannot be completed",
        409,
        "SCHEDULE_CANCELLED"
      );
    }

    schedule.status =
      "completed";

    schedule.nextExecutionAt =
      null;

    schedule.updatedBy =
      updatedBy || userId;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   GET DUE SCHEDULES
========================================================= */

/**
 * Used by:
 *
 * - cron jobs
 * - background workers
 * - queue workers
 * - serverless scheduled functions
 *
 * This function only retrieves candidates.
 *
 * It does NOT execute them.
 */
export const getDueSavingSchedules =
  async ({
    before = new Date(),
    limit = 100,
  } = {}) => {
    const executionDate =
      new Date(before);

    if (
      Number.isNaN(
        executionDate.getTime()
      )
    ) {
      throw createError(
        "Invalid execution date",
        400,
        "INVALID_EXECUTION_DATE"
      );
    }

    limit = Math.min(
      Math.max(
        Number(limit) || 100,
        1
      ),
      500
    );

    return SavingSchedule.find({
      status: "active",

      isAutomatic: true,

      nextExecutionAt: {
        $ne: null,
        $lte: executionDate,
      },
    })
      .sort({
        nextExecutionAt: 1,
        _id: 1,
      })
      .limit(limit)
      .lean();
  };

/* =========================================================
   GET USER'S ACTIVE SCHEDULES
========================================================= */

export const getActiveSavingSchedules =
  async (userId) => {
    assertObjectId(userId, "user ID");

    return SavingSchedule.find({
      user: userId,
      status: "active",
    })
      .populate({
        path: "savingGoal",
        select:
          "name targetAmount currentAmount currency status",
      })
      .sort({
        nextExecutionAt: 1,
        createdAt: -1,
      })
      .lean();
  };

/* =========================================================
   GET SCHEDULE STATISTICS
========================================================= */

export const getSavingScheduleStats =
  async ({
    scheduleId,
    userId,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    const total =
      Number(
        schedule.totalExecutions || 0
      );

    const successful =
      Number(
        schedule.successfulExecutions ||
          0
      );

    const failed =
      Number(
        schedule.failedExecutions || 0
      );

    const skipped =
      Number(
        schedule.skippedExecutions || 0
      );

    const successRate =
      total > 0
        ? Math.round(
            (successful / total) *
              10000
          ) / 100
        : 0;

    return {
      scheduleId:
        schedule._id,

      status:
        schedule.status,

      totalExecutions: total,

      successfulExecutions:
        successful,

      failedExecutions:
        failed,

      skippedExecutions:
        skipped,

      totalContributed:
        Number(
          schedule.totalContributed ||
            0
        ),

      consecutiveFailures:
        Number(
          schedule.consecutiveFailures ||
            0
        ),

      successRate,

      lastExecutionAt:
        schedule.lastExecutionAt,

      nextExecutionAt:
        schedule.nextExecutionAt,

      lastFailureAt:
        schedule.lastFailureAt,

      lastFailureCode:
        schedule.lastFailureCode,

      lastFailureReason:
        schedule.lastFailureReason,
    };
  };

/* =========================================================
   RESET FAILURE STATE
========================================================= */

/**
 * Called after a successful execution.
 *
 * The execution service should normally call this after
 * the contribution has been successfully committed.
 */
export const resetScheduleFailures =
  async ({
    scheduleId,
    userId,
  }) => {
    const schedule =
      await findScheduleForUser(
        scheduleId,
        userId
      );

    schedule.consecutiveFailures =
      0;

    schedule.lastFailureAt =
      null;

    schedule.lastFailureCode =
      null;

    schedule.lastFailureReason =
      null;

    await schedule.save();

    return schedule;
  };

/* =========================================================
   RECORD EXECUTION SUCCESS
========================================================= */

/**
 * Updates schedule-level denormalized counters.
 *
 * The actual SavingContribution remains the financial
 * source of truth.
 */
export const recordSuccessfulExecution =
  async ({
    scheduleId,
    userId,
    amount,
    executionAt = new Date(),
    nextExecutionAt = null,
    executionKey = null,
  }) => {
    assertObjectId(
      scheduleId,
      "saving schedule ID"
    );

    assertObjectId(userId, "user ID");

    const contributionAmount =
      Number(amount);

    if (
      !Number.isFinite(
        contributionAmount
      ) ||
      contributionAmount <= 0
    ) {
      throw createError(
        "Execution amount must be greater than zero",
        400,
        "INVALID_EXECUTION_AMOUNT"
      );
    }

    /*
     * Atomic ownership + active lookup.
     */
    const schedule =
      await SavingSchedule.findOne({
        _id: scheduleId,
        user: userId,
      });

    if (!schedule) {
      throw createError(
        "Saving schedule not found",
        404,
        "SAVING_SCHEDULE_NOT_FOUND"
      );
    }

    /*
     * Idempotency protection.
     *
     * If the worker retries the same execution key,
     * do not increment the counters twice.
     */
    if (
      executionKey &&
      schedule.lastExecutionKey ===
        executionKey
    ) {
      return schedule;
    }

    schedule.totalExecutions += 1;

    schedule.successfulExecutions += 1;

    schedule.totalContributed =
      Number(
        schedule.totalContributed || 0
      ) + contributionAmount;

    schedule.consecutiveFailures =
      0;

    schedule.lastExecutionAt =
      new Date(executionAt);

    schedule.lastFailureAt = null;
    schedule.lastFailureCode = null;
    schedule.lastFailureReason = null;

    schedule.lastExecutionKey =
      executionKey || null;

    if (nextExecutionAt) {
      schedule.nextExecutionAt =
        new Date(nextExecutionAt);
    } else {
      schedule.nextExecutionAt =
        null;
    }

    /*
     * If no next execution exists, the schedule can be
     * completed by the execution layer when appropriate.
     */
    await schedule.save();

    return schedule;
  };

/* =========================================================
   RECORD EXECUTION FAILURE
========================================================= */

export const recordFailedExecution =
  async ({
    scheduleId,
    userId,
    failureCode = null,
    failureReason = null,
    executionAt = new Date(),
    executionKey = null,
  }) => {
    assertObjectId(
      scheduleId,
      "saving schedule ID"
    );

    assertObjectId(userId, "user ID");

    const schedule =
      await SavingSchedule.findOne({
        _id: scheduleId,
        user: userId,
      });

    if (!schedule) {
      throw createError(
        "Saving schedule not found",
        404,
        "SAVING_SCHEDULE_NOT_FOUND"
      );
    }

    /*
     * Prevent duplicate failure processing.
     */
    if (
      executionKey &&
      schedule.lastExecutionKey ===
        executionKey
    ) {
      return schedule;
    }

    schedule.totalExecutions += 1;

    schedule.failedExecutions += 1;

    schedule.consecutiveFailures += 1;

    schedule.lastFailureAt =
      new Date(executionAt);

    schedule.lastFailureCode =
      failureCode;

    schedule.lastFailureReason =
      failureReason;

    schedule.lastExecutionKey =
      executionKey || null;

    /*
     * The model's save middleware will automatically
     * pause the schedule when the maximum consecutive
     * failure threshold is reached.
     */
    await schedule.save();

    return schedule;
  };

/* =========================================================
   RECORD SKIPPED EXECUTION
========================================================= */

export const recordSkippedExecution =
  async ({
    scheduleId,
    userId,
    nextExecutionAt = null,
    executionKey = null,
  }) => {
    assertObjectId(
      scheduleId,
      "saving schedule ID"
    );

    assertObjectId(userId, "user ID");

    const schedule =
      await SavingSchedule.findOne({
        _id: scheduleId,
        user: userId,
      });

    if (!schedule) {
      throw createError(
        "Saving schedule not found",
        404,
        "SAVING_SCHEDULE_NOT_FOUND"
      );
    }

    if (
      executionKey &&
      schedule.lastExecutionKey ===
        executionKey
    ) {
      return schedule;
    }

    schedule.totalExecutions += 1;

    schedule.skippedExecutions += 1;

    schedule.lastExecutionKey =
      executionKey || null;

    if (nextExecutionAt) {
      schedule.nextExecutionAt =
        new Date(nextExecutionAt);
    }

    await schedule.save();

    return schedule;
  };

/* =========================================================
   DELETE SCHEDULE
========================================================= */

/**
 * We do not physically delete financial automation records.
 *
 * A schedule is cancelled instead.
 */
export const deleteSavingSchedule =
  async ({
    scheduleId,
    userId,
    reason = "Deleted by user",
    updatedBy = null,
  }) => {
    return cancelSavingSchedule({
      scheduleId,
      userId,
      reason,
      updatedBy,
    });
  };

/* =========================================================
   EXPORT DEFAULT SERVICE
========================================================= */

const savingScheduleService = {
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

  getDueSavingSchedules,

  getSavingScheduleStats,

  resetScheduleFailures,

  recordSuccessfulExecution,

  recordFailedExecution,

  recordSkippedExecution,
};

export default savingScheduleService;