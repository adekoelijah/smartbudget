import mongoose from "mongoose";

import SavingExecution from "../models/SavingExecution.js";
import SavingSchedule from "../models/SavingSchedule.js";
import SavingContribution from "../models/SavingContribution.js";
import SavingGoal from "../models/SavingsGoal.js";

/* =========================================================
   CONSTANTS
========================================================= */

const EXECUTION_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped",
  CANCELLED: "cancelled",
};

const SCHEDULE_STATUSES = {
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const CONTRIBUTION_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

const DEFAULT_MAX_RETRIES = 3;

/* =========================================================
   ERROR FACTORY
========================================================= */

const createError = (message, code = "SAVING_EXECUTION_ERROR") => {
  const error = new Error(message);
  error.code = code;
  return error;
};

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const normalizeId = (id) =>
  id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);

/* =========================================================
   EXECUTION KEY
========================================================= */

/**
 * Generates a deterministic execution key.
 *
 * The key is critical for idempotency.
 *
 * Example:
 *
 * schedule: 64abc...
 * execution time: 2026-08-12T09:00:00.000Z
 *
 * becomes:
 *
 * scheduleId:2026-08-12T09:00:00.000Z
 */
const buildExecutionKey = (
  scheduleId,
  executionAt
) => {
  const date = new Date(executionAt);

  if (Number.isNaN(date.getTime())) {
    throw createError(
      "Invalid execution date",
      "INVALID_EXECUTION_DATE"
    );
  }

  return `${scheduleId}:${date.toISOString()}`;
};

/* =========================================================
   CALCULATE CONTRIBUTION AMOUNT
========================================================= */

/**
 * Determines how much the schedule should contribute.
 *
 * Supported strategies:
 *
 * fixed
 * percentage
 * payday
 * round_up
 * smart
 *
 * Important:
 *
 * Percentage strategies require an externally supplied
 * calculation base. We do not invent a bank balance or
 * income value here.
 */
const calculateContributionAmount = ({
  schedule,
  baseAmount = null,
}) => {
  if (!schedule) {
    throw createError(
      "Saving schedule is required",
      "SCHEDULE_REQUIRED"
    );
  }

  switch (schedule.strategy) {
    case "fixed": {
      const amount = Number(schedule.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw createError(
          "Fixed schedule does not contain a valid amount",
          "INVALID_SCHEDULE_AMOUNT"
        );
      }

      return amount;
    }

    case "percentage": {
      const percentage = Number(
        schedule.percentage
      );

      const base = Number(baseAmount);

      if (
        !Number.isFinite(percentage) ||
        percentage <= 0
      ) {
        throw createError(
          "Schedule percentage is invalid",
          "INVALID_SCHEDULE_PERCENTAGE"
        );
      }

      if (!Number.isFinite(base) || base <= 0) {
        throw createError(
          "A valid base amount is required for percentage savings",
          "PERCENTAGE_BASE_REQUIRED"
        );
      }

      return Math.round(
        ((base * percentage) / 100) * 100
      ) / 100;
    }

    case "payday": {
      if (
        schedule.amount !== null &&
        schedule.amount !== undefined
      ) {
        const amount = Number(schedule.amount);

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          throw createError(
            "Payday amount is invalid",
            "INVALID_PAYDAY_AMOUNT"
          );
        }

        return amount;
      }

      const percentage = Number(
        schedule.percentage
      );

      const base = Number(baseAmount);

      if (
        !Number.isFinite(percentage) ||
        percentage <= 0
      ) {
        throw createError(
          "Payday percentage is invalid",
          "INVALID_PAYDAY_PERCENTAGE"
        );
      }

      if (!Number.isFinite(base) || base <= 0) {
        throw createError(
          "A valid payday base amount is required",
          "PAYDAY_BASE_REQUIRED"
        );
      }

      return Math.round(
        ((base * percentage) / 100) * 100
      ) / 100;
    }

    /**
     * Round-up and smart strategies should be calculated
     * by their dedicated intelligence/bank services.
     *
     * We intentionally do not guess their value.
     */
    case "round_up":
    case "smart":
      throw createError(
        `Strategy "${schedule.strategy}" requires a dedicated calculation service`,
        "STRATEGY_CALCULATION_REQUIRED"
      );

    default:
      throw createError(
        `Unsupported saving strategy: ${schedule.strategy}`,
        "UNSUPPORTED_STRATEGY"
      );
  }
};

/* =========================================================
   FIND SCHEDULE
========================================================= */

const getScheduleForUser = async (
  scheduleId,
  userId,
  session = null
) => {
  if (!isValidObjectId(scheduleId)) {
    throw createError(
      "Invalid saving schedule ID",
      "INVALID_SCHEDULE_ID"
    );
  }

  if (!isValidObjectId(userId)) {
    throw createError(
      "Invalid user ID",
      "INVALID_USER_ID"
    );
  }

  let query = SavingSchedule.findOne({
    _id: scheduleId,
    user: userId,
  });

  if (session) {
    query = query.session(session);
  }

  const schedule = await query;

  if (!schedule) {
    throw createError(
      "Saving schedule not found",
      "SCHEDULE_NOT_FOUND"
    );
  }

  return schedule;
};

/* =========================================================
   FIND GOAL
========================================================= */

const getGoalForUser = async (
  goalId,
  userId,
  session = null
) => {
  if (!isValidObjectId(goalId)) {
    throw createError(
      "Invalid saving goal ID",
      "INVALID_GOAL_ID"
    );
  }

  let query = SavingGoal.findOne({
    _id: goalId,
    user: userId,
    isDeleted: false,
  });

  if (session) {
    query = query.session(session);
  }

  const goal = await query;

  if (!goal) {
    throw createError(
      "Saving goal not found",
      "GOAL_NOT_FOUND"
    );
  }

  return goal;
};

/* =========================================================
   CREATE EXECUTION
========================================================= */

/**
 * Creates a single execution record for a schedule.
 *
 * This operation is idempotent.
 *
 * Calling this twice with the same schedule + execution time
 * must return the same execution instead of creating another.
 */
export const createSavingExecution = async ({
  userId,
  scheduleId,
  executionAt = new Date(),
  baseAmount = null,
  metadata = {},
}) => {
  if (!userId || !scheduleId) {
    throw createError(
      "User ID and schedule ID are required",
      "INVALID_EXECUTION_INPUT"
    );
  }

  const session =
    await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const schedule =
        await getScheduleForUser(
          scheduleId,
          userId,
          session
        );

      if (
        schedule.status !==
        SCHEDULE_STATUSES.ACTIVE
      ) {
        throw createError(
          "Only active saving schedules can be executed",
          "SCHEDULE_NOT_ACTIVE"
        );
      }

      if (!schedule.isAutomatic) {
        throw createError(
          "This saving schedule is not configured for automatic execution",
          "SCHEDULE_NOT_AUTOMATIC"
        );
      }

      const goal = await getGoalForUser(
        schedule.savingGoal,
        userId,
        session
      );

      if (
        goal.status !== "active"
      ) {
        throw createError(
          "The saving goal is not active",
          "GOAL_NOT_ACTIVE"
        );
      }

      const normalizedExecutionDate =
        new Date(executionAt);

      const executionKey =
        buildExecutionKey(
          schedule._id,
          normalizedExecutionDate
        );

      /*
       * Check for an existing execution.
       *
       * The database should also have a UNIQUE index on
       * executionKey. Database-level protection is required
       * because two workers can race between find and create.
       */
      const existing =
        await SavingExecution.findOne({
          user: userId,
          executionKey,
        }).session(session);

      if (existing) {
        result = existing;
        return;
      }

      const amount =
        calculateContributionAmount({
          schedule,
          baseAmount,
        });

      const cappedAmount =
        schedule.maximumContribution
          ? Math.min(
              amount,
              Number(
                schedule.maximumContribution
              )
            )
          : amount;

      if (
        !Number.isFinite(cappedAmount) ||
        cappedAmount <= 0
      ) {
        throw createError(
          "Calculated contribution amount is invalid",
          "INVALID_CONTRIBUTION_AMOUNT"
        );
      }

      const executions =
        await SavingExecution.create(
          [
            {
              user: userId,
              savingGoal: schedule.savingGoal,
              savingSchedule: schedule._id,

              executionKey,

              scheduledAt:
                normalizedExecutionDate,

              amount: cappedAmount,

              currency:
                schedule.currency || "NGN",

              status:
                EXECUTION_STATUSES.PENDING,

              attemptCount: 0,

              maxAttempts:
                DEFAULT_MAX_RETRIES,

              metadata,
            },
          ],
          { session }
        );

      result = executions[0];
    });

    return result;
  } catch (error) {
    /*
     * MongoDB duplicate-key errors can occur when two workers
     * create the same execution simultaneously.
     *
     * Treat that as successful idempotency instead of a
     * financial failure.
     */
    if (error?.code === 11000) {
      const executionKey =
        buildExecutionKey(
          scheduleId,
          executionAt
        );

      const existing =
        await SavingExecution.findOne({
          user: userId,
          executionKey,
        });

      if (existing) {
        return existing;
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/* =========================================================
   CLAIM EXECUTION
========================================================= */

/**
 * Atomically claims a pending execution.
 *
 * This prevents two workers from processing the same
 * execution simultaneously.
 */
export const claimSavingExecution = async (
  executionId
) => {
  if (!isValidObjectId(executionId)) {
    throw createError(
      "Invalid execution ID",
      "INVALID_EXECUTION_ID"
    );
  }

  const execution =
    await SavingExecution.findOneAndUpdate(
      {
        _id: executionId,
        status:
          EXECUTION_STATUSES.PENDING,
      },
      {
        $set: {
          status:
            EXECUTION_STATUSES.PROCESSING,
          startedAt: new Date(),
        },
        $inc: {
          attemptCount: 1,
        },
      },
      {
        new: true,
      }
    );

  return execution;
};

/* =========================================================
   COMPLETE EXECUTION
========================================================= */

/**
 * Marks an execution as completed after the contribution
 * has successfully been recorded.
 */
export const completeSavingExecution = async ({
  executionId,
  contributionId,
}) => {
  if (!isValidObjectId(executionId)) {
    throw createError(
      "Invalid execution ID",
      "INVALID_EXECUTION_ID"
    );
  }

  if (
    contributionId &&
    !isValidObjectId(contributionId)
  ) {
    throw createError(
      "Invalid contribution ID",
      "INVALID_CONTRIBUTION_ID"
    );
  }

  const execution =
    await SavingExecution.findOneAndUpdate(
      {
        _id: executionId,
        status:
          EXECUTION_STATUSES.PROCESSING,
      },
      {
        $set: {
          status:
            EXECUTION_STATUSES.COMPLETED,

          completedAt: new Date(),

          ...(contributionId
            ? {
                contribution:
                  contributionId,
              }
            : {}),
        },
      },
      {
        new: true,
      }
    );

  if (!execution) {
    throw createError(
      "Execution cannot be completed from its current state",
      "INVALID_EXECUTION_STATE"
    );
  }

  return execution;
};

/* =========================================================
   FAIL EXECUTION
========================================================= */

export const failSavingExecution = async ({
  executionId,
  failureCode = "EXECUTION_FAILED",
  failureReason = "Saving execution failed",
}) => {
  if (!isValidObjectId(executionId)) {
    throw createError(
      "Invalid execution ID",
      "INVALID_EXECUTION_ID"
    );
  }

  const execution =
    await SavingExecution.findById(
      executionId
    );

  if (!execution) {
    throw createError(
      "Saving execution not found",
      "EXECUTION_NOT_FOUND"
    );
  }

  if (
    ![
      EXECUTION_STATUSES.PROCESSING,
      EXECUTION_STATUSES.PENDING,
    ].includes(execution.status)
  ) {
    throw createError(
      "Execution cannot be failed from its current state",
      "INVALID_EXECUTION_STATE"
    );
  }

  const attempts =
    Number(execution.attemptCount || 0);

  const maxAttempts =
    Number(
      execution.maxAttempts ||
        DEFAULT_MAX_RETRIES
    );

  const shouldRetry =
    attempts < maxAttempts;

  execution.status =
    shouldRetry
      ? EXECUTION_STATUSES.PENDING
      : EXECUTION_STATUSES.FAILED;

  execution.failureCode =
    failureCode;

  execution.failureReason =
    failureReason;

  execution.failedAt = new Date();

  await execution.save();

  return execution;
};

/* =========================================================
   SKIP EXECUTION
========================================================= */

export const skipSavingExecution = async ({
  executionId,
  reason,
}) => {
  if (!isValidObjectId(executionId)) {
    throw createError(
      "Invalid execution ID",
      "INVALID_EXECUTION_ID"
    );
  }

  const execution =
    await SavingExecution.findOneAndUpdate(
      {
        _id: executionId,
        status: {
          $in: [
            EXECUTION_STATUSES.PENDING,
            EXECUTION_STATUSES.PROCESSING,
          ],
        },
      },
      {
        $set: {
          status:
            EXECUTION_STATUSES.SKIPPED,

          skippedAt: new Date(),

          skipReason:
            reason ||
            "Execution skipped",
        },
      },
      {
        new: true,
      }
    );

  if (!execution) {
    throw createError(
      "Execution cannot be skipped from its current state",
      "INVALID_EXECUTION_STATE"
    );
  }

  return execution;
};

/* =========================================================
   CANCEL EXECUTION
========================================================= */

export const cancelSavingExecution = async ({
  executionId,
  userId,
  reason,
}) => {
  if (
    !isValidObjectId(executionId) ||
    !isValidObjectId(userId)
  ) {
    throw createError(
      "Invalid execution or user ID",
      "INVALID_ID"
    );
  }

  const execution =
    await SavingExecution.findOne({
      _id: executionId,
      user: userId,
    });

  if (!execution) {
    throw createError(
      "Saving execution not found",
      "EXECUTION_NOT_FOUND"
    );
  }

  if (
    [
      EXECUTION_STATUSES.COMPLETED,
      EXECUTION_STATUSES.FAILED,
      EXECUTION_STATUSES.SKIPPED,
    ].includes(execution.status)
  ) {
    throw createError(
      "This execution can no longer be cancelled",
      "EXECUTION_NOT_CANCELLABLE"
    );
  }

  execution.status =
    EXECUTION_STATUSES.CANCELLED;

  execution.cancelledAt =
    new Date();

  execution.cancellationReason =
    reason ||
    "Execution cancelled";

  await execution.save();

  return execution;
};

/* =========================================================
   PROCESS EXECUTION
========================================================= */

/**
 * Main execution orchestration.
 *
 * Flow:
 *
 * 1. Claim execution.
 * 2. Load schedule.
 * 3. Load goal.
 * 4. Validate lifecycle.
 * 5. Create contribution.
 * 6. Update goal aggregate.
 * 7. Complete execution.
 *
 * The financial operation is wrapped in a MongoDB transaction.
 */
export const processSavingExecution = async ({
  executionId,
  baseAmount = null,
}) => {
  const claimed =
    await claimSavingExecution(
      executionId
    );

  /*
   * Another worker may have already claimed it.
   */
  if (!claimed) {
    return null;
  }

  const session =
    await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(
      async () => {
        const execution =
          await SavingExecution.findById(
            executionId
          ).session(session);

        if (!execution) {
          throw createError(
            "Saving execution not found",
            "EXECUTION_NOT_FOUND"
          );
        }

        if (
          execution.status !==
          EXECUTION_STATUSES.PROCESSING
        ) {
          throw createError(
            "Execution is not in processing state",
            "INVALID_EXECUTION_STATE"
          );
        }

        const schedule =
          await SavingSchedule.findOne({
            _id:
              execution.savingSchedule,
            user: execution.user,
          }).session(session);

        if (!schedule) {
          throw createError(
            "Saving schedule not found",
            "SCHEDULE_NOT_FOUND"
          );
        }

        if (
          [
            SCHEDULE_STATUSES.CANCELLED,
            SCHEDULE_STATUSES.COMPLETED,
          ].includes(schedule.status)
        ) {
          execution.status =
            EXECUTION_STATUSES.SKIPPED;

          execution.skippedAt =
            new Date();

          execution.skipReason =
            `Schedule is ${schedule.status}`;

          await execution.save({
            session,
          });

          result = execution;

          return;
        }

        const goal =
          await SavingGoal.findOne({
            _id: execution.savingGoal,
            user: execution.user,
            isDeleted: false,
          }).session(session);

        if (!goal) {
          throw createError(
            "Saving goal not found",
            "GOAL_NOT_FOUND"
          );
        }

        if (
          goal.status !== "active"
        ) {
          execution.status =
            EXECUTION_STATUSES.SKIPPED;

          execution.skippedAt =
            new Date();

          execution.skipReason =
            `Saving goal is ${goal.status}`;

          await execution.save({
            session,
          });

          result = execution;

          return;
        }

        /*
         * Never contribute beyond the goal target unless
         * the schedule explicitly permits continuation.
         */
        let amount =
          Number(execution.amount);

        const remaining =
          Math.max(
            Number(
              goal.targetAmount || 0
            ) -
              Number(
                goal.currentAmount || 0
              ),
            0
          );

        if (
          schedule.goalCompletionAction !==
            "continue" &&
          amount > remaining
        ) {
          amount = remaining;
        }

        if (amount <= 0) {
          execution.status =
            EXECUTION_STATUSES.SKIPPED;

          execution.skippedAt =
            new Date();

          execution.skipReason =
            "Saving goal target has already been reached";

          await execution.save({
            session,
          });

          result = execution;

          return;
        }

        /*
         * --------------------------------------------------
         * CREATE FINANCIAL LEDGER RECORD
         * --------------------------------------------------
         *
         * SavingContribution is the financial source of
         * truth.
         */
        const contributionKey =
          `execution:${execution._id}`;

        const existingContribution =
          await SavingContribution.findOne({
            user: execution.user,
            idempotencyKey:
              contributionKey,
          }).session(session);

        let contribution =
          existingContribution;

        if (!contribution) {
          const contributions =
            await SavingContribution.create(
              [
                {
                  user: execution.user,

                  savingGoal:
                    execution.savingGoal,

                  amount,

                  currency:
                    execution.currency ||
                    "NGN",

                  source: "automatic",

                  status:
                    CONTRIBUTION_STATUSES.COMPLETED,

                  requestedAt:
                    new Date(),

                  completedAt:
                    new Date(),

                  idempotencyKey:
                    contributionKey,

                  isAutomatic: true,

                  savingSchedule:
                    execution.savingSchedule,

                  description:
                    "Automatic SmartSave contribution",

                  createdBy:
                    execution.user,

                  metadata: {
                    executionId:
                      execution._id,
                  },
                },
              ],
              { session }
            );

          contribution =
            contributions[0];
        }

        /*
         * --------------------------------------------------
         * UPDATE GOAL AGGREGATE
         * --------------------------------------------------
         *
         * currentAmount is a cached aggregate.
         *
         * We use an atomic increment rather than:
         *
         * goal.currentAmount += amount
         *
         * because concurrent contributions must not overwrite
         * one another.
         */
        const updatedGoal =
          await SavingGoal.findOneAndUpdate(
            {
              _id:
                execution.savingGoal,

              user:
                execution.user,

              isDeleted: false,

              status: "active",

              /*
               * Do not allow the cached amount to exceed the
               * target for normal goal completion.
               */
              currentAmount: {
                $lt:
                  Number(
                    goal.targetAmount
                  ),
              },
            },
            {
              $inc: {
                currentAmount:
                  amount,
              },

              $set: {
                lastContributionAt:
                  new Date(),
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!updatedGoal) {
          throw createError(
            "Saving goal could not be updated",
            "GOAL_UPDATE_FAILED"
          );
        }

        /*
         * --------------------------------------------------
         * UPDATE EXECUTION
         * --------------------------------------------------
         */
        execution.amount =
          amount;

        execution.status =
          EXECUTION_STATUSES.COMPLETED;

        execution.completedAt =
          new Date();

        execution.contribution =
          contribution._id;

        execution.failureCode =
          null;

        execution.failureReason =
          null;

        await execution.save({
          session,
        });

        /*
         * --------------------------------------------------
         * UPDATE SCHEDULE
         * --------------------------------------------------
         */
        schedule.lastExecutionAt =
          new Date();

        schedule.totalExecutions =
          Number(
            schedule.totalExecutions || 0
          ) + 1;

        schedule.successfulExecutions =
          Number(
            schedule.successfulExecutions || 0
          ) + 1;

        schedule.totalContributed =
          Number(
            schedule.totalContributed || 0
          ) + amount;

        schedule.consecutiveFailures =
          0;

        schedule.lastFailureAt =
          null;

        schedule.lastFailureCode =
          null;

        schedule.lastFailureReason =
          null;

        /*
         * If the goal is complete and the schedule is
         * configured to stop/pause, the schedule service
         * should normally calculate this lifecycle transition.
         *
         * Here we only apply the immediate terminal state.
         */
        if (
          updatedGoal.currentAmount >=
          updatedGoal.targetAmount
        ) {
          if (
            schedule.goalCompletionAction ===
            "stop"
          ) {
            schedule.status =
              SCHEDULE_STATUSES.COMPLETED;

            schedule.nextExecutionAt =
              null;
          }

          if (
            schedule.goalCompletionAction ===
            "pause"
          ) {
            schedule.status =
              SCHEDULE_STATUSES.PAUSED;

            schedule.pausedAt =
              new Date();

            schedule.pauseReason =
              "Saving goal target reached";

            schedule.nextExecutionAt =
              null;
          }
        }

        await schedule.save({
          session,
        });

        result = execution;
      }
    );

    return result;
  } catch (error) {
    /*
     * Attempt to record the failure outside the failed
     * transaction so the failure state itself is preserved.
     */
    try {
      await failSavingExecution({
        executionId,
        failureCode:
          error.code ||
          "EXECUTION_FAILED",
        failureReason:
          error.message ||
          "Saving execution failed",
      });
    } catch {
      /*
       * Do not replace the original financial error with
       * an error from failure bookkeeping.
       */
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/* =========================================================
   PROCESS DUE EXECUTIONS
========================================================= */

/**
 * Finds executions that are ready to run.
 *
 * A worker/cron can call this periodically.
 */
export const processDueSavingExecutions =
  async ({
    limit = 50,
    baseAmountResolver = null,
  } = {}) => {
    const safeLimit = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const executions =
      await SavingExecution.find({
        status:
          EXECUTION_STATUSES.PENDING,

        scheduledAt: {
          $lte: new Date(),
        },
      })
        .sort({
          scheduledAt: 1,
        })
        .limit(safeLimit)
        .select("_id user scheduledAt");

    const results = [];

    for (const execution of executions) {
      try {
        let baseAmount = null;

        if (
          typeof baseAmountResolver ===
          "function"
        ) {
          baseAmount =
            await baseAmountResolver(
              execution
            );
        }

        const processed =
          await processSavingExecution({
            executionId:
              execution._id,
            baseAmount,
          });

        if (processed) {
          results.push({
            executionId:
              execution._id,
            success: true,
            execution:
              processed,
          });
        }
      } catch (error) {
        results.push({
          executionId:
            execution._id,
          success: false,
          error: error.message,
          code:
            error.code ||
            "EXECUTION_FAILED",
        });
      }
    }

    return results;
  };

/* =========================================================
   RETRY EXECUTION
========================================================= */

export const retrySavingExecution =
  async (executionId) => {
    if (!isValidObjectId(executionId)) {
      throw createError(
        "Invalid execution ID",
        "INVALID_EXECUTION_ID"
      );
    }

    const execution =
      await SavingExecution.findById(
        executionId
      );

    if (!execution) {
      throw createError(
        "Saving execution not found",
        "EXECUTION_NOT_FOUND"
      );
    }

    const attempts =
      Number(
        execution.attemptCount || 0
      );

    const maxAttempts =
      Number(
        execution.maxAttempts ||
          DEFAULT_MAX_RETRIES
      );

    if (attempts >= maxAttempts) {
      throw createError(
        "Maximum execution attempts reached",
        "MAX_RETRIES_REACHED"
      );
    }

    if (
      execution.status !==
      EXECUTION_STATUSES.FAILED
    ) {
      throw createError(
        "Only failed executions can be retried",
        "EXECUTION_NOT_RETRYABLE"
      );
    }

    execution.status =
      EXECUTION_STATUSES.PENDING;

    execution.failedAt =
      null;

    execution.failureCode =
      null;

    execution.failureReason =
      null;

    await execution.save();

    return execution;
  };

/* =========================================================
   GET EXECUTION
========================================================= */

export const getSavingExecutionById =
  async ({
    executionId,
    userId,
  }) => {
    if (
      !isValidObjectId(executionId) ||
      !isValidObjectId(userId)
    ) {
      throw createError(
        "Invalid execution or user ID",
        "INVALID_ID"
      );
    }

    const execution =
      await SavingExecution.findOne({
        _id: executionId,
        user: userId,
      })
        .populate(
          "savingGoal",
          "name targetAmount currentAmount currency status"
        )
        .populate(
          "savingSchedule",
          "name strategy frequency status"
        )
        .populate(
          "contribution",
          "amount currency status completedAt"
        );

    if (!execution) {
      throw createError(
        "Saving execution not found",
        "EXECUTION_NOT_FOUND"
      );
    }

    return execution;
  };

/* =========================================================
   LIST USER EXECUTIONS
========================================================= */

export const listSavingExecutions =
  async ({
    userId,
    savingGoalId = null,
    savingScheduleId = null,
    status = null,
    page = 1,
    limit = 20,
  }) => {
    if (!isValidObjectId(userId)) {
      throw createError(
        "Invalid user ID",
        "INVALID_USER_ID"
      );
    }

    const safePage = Math.max(
      Number(page) || 1,
      1
    );

    const safeLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const filter = {
      user: userId,
    };

    if (savingGoalId) {
      if (!isValidObjectId(savingGoalId)) {
        throw createError(
          "Invalid saving goal ID",
          "INVALID_GOAL_ID"
        );
      }

      filter.savingGoal =
        savingGoalId;
    }

    if (savingScheduleId) {
      if (
        !isValidObjectId(
          savingScheduleId
        )
      ) {
        throw createError(
          "Invalid saving schedule ID",
          "INVALID_SCHEDULE_ID"
        );
      }

      filter.savingSchedule =
        savingScheduleId;
    }

    if (status) {
      if (
        !Object.values(
          EXECUTION_STATUSES
        ).includes(status)
      ) {
        throw createError(
          "Invalid execution status",
          "INVALID_EXECUTION_STATUS"
        );
      }

      filter.status = status;
    }

    const skip =
      (safePage - 1) *
      safeLimit;

    const [executions, total] =
      await Promise.all([
        SavingExecution.find(filter)
          .sort({
            scheduledAt: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(safeLimit)
          .populate(
            "savingGoal",
            "name targetAmount currentAmount currency"
          )
          .populate(
            "savingSchedule",
            "name strategy frequency"
          )
          .populate(
            "contribution",
            "amount status completedAt"
          ),

        SavingExecution.countDocuments(
          filter
        ),
      ]);

    return {
      data: executions,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(
          total / safeLimit
        ),
        hasNextPage:
          safePage * safeLimit <
          total,
        hasPreviousPage:
          safePage > 1,
      },
    };
  };

/* =========================================================
   EXECUTION STATISTICS
========================================================= */

export const getSavingExecutionStats =
  async (userId) => {
    if (!isValidObjectId(userId)) {
      throw createError(
        "Invalid user ID",
        "INVALID_USER_ID"
      );
    }

    const stats =
      await SavingExecution.aggregate([
        {
          $match: {
            user:
              normalizeId(userId),
          },
        },

        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },

            totalAmount: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const result = {
      pending: {
        count: 0,
        totalAmount: 0,
      },

      processing: {
        count: 0,
        totalAmount: 0,
      },

      completed: {
        count: 0,
        totalAmount: 0,
      },

      failed: {
        count: 0,
        totalAmount: 0,
      },

      skipped: {
        count: 0,
        totalAmount: 0,
      },

      cancelled: {
        count: 0,
        totalAmount: 0,
      },
    };

    for (const item of stats) {
      if (result[item._id]) {
        result[item._id] = {
          count: item.count,
          totalAmount:
            item.totalAmount || 0,
        };
      }
    }

    return result;
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const savingExecutionService = {
  createSavingExecution,

  claimSavingExecution,

  processSavingExecution,

  processDueSavingExecutions,

  completeSavingExecution,

  failSavingExecution,

  retrySavingExecution,

  skipSavingExecution,

  cancelSavingExecution,

  getSavingExecutionById,

  listSavingExecutions,

  getSavingExecutionStats,
};

export default savingExecutionService;