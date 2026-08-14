// services/savingOrchestratorService.js

import mongoose from "mongoose";

import AutoSave from "../models/AutoSave.js";
import SavingGoal from "../models/SavingsGoal.js";
import SavingExecution from "../models/SavingExecution.js";
import SavingContribution from "../models/SavingContribution.js";

import {
  getAutoSaveById,
  checkAutoSaveEligibility,
  createOrSyncAutoSaveSchedule,
} from "./autoSaveService.js";

import {
  getSavingScheduleById,
  recordScheduleSuccess,
  recordScheduleFailure,
  recordScheduleSkipped,
} from "./savingScheduleService.js";

import {
  createSavingExecution,
} from "./savingExecutionService.js";

import {
  createSavingContribution,
} from "./savingContributionService.js";

import {
  updateSavingGoalProgress,
} from "./savingGoalService.js";

import {
  evaluateSavingMilestones,
} from "./savingMilestoneService.js";

/* =========================================================
   CONSTANTS
========================================================= */

const EXECUTION_STATUSES = [
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
];

const TERMINAL_EXECUTION_STATUSES = [
  "successful",
  "failed",
  "cancelled",
];

const AUTO_SAVE_TERMINAL_STATUSES = [
  "completed",
  "cancelled",
];

const GOAL_TERMINAL_STATUSES = [
  "completed",
  "cancelled",
  "expired",
];

const VALID_OBJECT_ID =
  mongoose.Types.ObjectId.isValid;

/* =========================================================
   ERROR CLASS
========================================================= */

class SavingOrchestratorServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVING_ORCHESTRATOR_ERROR",
    details = null
  ) {
    super(message);

    this.name =
      "SavingOrchestratorServiceError";

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const assertObjectId = (
  value,
  fieldName = "ID"
) => {
  if (
    !value ||
    !VALID_OBJECT_ID(value)
  ) {
    throw new SavingOrchestratorServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_ID"
    );
  }
};

const assertUserId = (userId) => {
  assertObjectId(userId, "User ID");
};

const normalizeId = (value) => {
  if (
    value instanceof mongoose.Types.ObjectId
  ) {
    return value;
  }

  assertObjectId(value);

  return new mongoose.Types.ObjectId(value);
};

const assertSession = (session) => {
  if (!session) {
    throw new SavingOrchestratorServiceError(
      "A database transaction session is required",
      500,
      "TRANSACTION_REQUIRED"
    );
  }
};

const normalizeAmount = (amount) => {
  const value = Number(amount);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new SavingOrchestratorServiceError(
      "Saving amount must be greater than zero",
      400,
      "INVALID_AMOUNT"
    );
  }

  return value;
};

/* =========================================================
   TRANSACTION HELPER
========================================================= */

/**
 * Runs a complete saving workflow inside
 * a MongoDB transaction.
 */
const withTransaction = async (
  callback
) => {
  const session =
    await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(
      async () => {
        result = await callback(session);
      }
    );

    return result;
  } finally {
    await session.endSession();
  }
};

/* =========================================================
   AUTO SAVE OWNERSHIP
========================================================= */

const findOwnedAutoSave = async ({
  userId,
  autoSaveId,
  session,
}) => {
  assertUserId(userId);
  assertObjectId(
    autoSaveId,
    "AutoSave ID"
  );

  const query = AutoSave.findOne({
    _id: autoSaveId,
    user: userId,
    isDeleted: false,
  });

  query.session(session);

  const autoSave = await query;

  if (!autoSave) {
    throw new SavingOrchestratorServiceError(
      "AutoSave configuration not found",
      404,
      "AUTO_SAVE_NOT_FOUND"
    );
  }

  return autoSave;
};

/* =========================================================
   GOAL OWNERSHIP
========================================================= */

const findOwnedGoal = async ({
  userId,
  goalId,
  session,
}) => {
  assertUserId(userId);
  assertObjectId(
    goalId,
    "Saving goal ID"
  );

  const query = SavingGoal.findOne({
    _id: goalId,
    user: userId,
    isDeleted: false,
  });

  query.session(session);

  const goal = await query;

  if (!goal) {
    throw new SavingOrchestratorServiceError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  return goal;
};

/* =========================================================
   GOAL VALIDATION
========================================================= */

const assertGoalAvailable = (goal) => {
  if (
    GOAL_TERMINAL_STATUSES.includes(
      goal.status
    )
  ) {
    throw new SavingOrchestratorServiceError(
      "Saving goal is no longer available for contributions",
      409,
      "GOAL_NOT_AVAILABLE"
    );
  }
};

/* =========================================================
   AUTO SAVE VALIDATION
========================================================= */

const assertAutoSaveAvailable = (
  autoSave
) => {
  if (
    AUTO_SAVE_TERMINAL_STATUSES.includes(
      autoSave.status
    )
  ) {
    throw new SavingOrchestratorServiceError(
      "AutoSave configuration is terminal",
      409,
      "AUTOSAVE_TERMINAL"
    );
  }
};

/* =========================================================
   CALCULATE EXECUTION AMOUNT
========================================================= */

/**
 * Resolves the actual monetary amount for
 * an AutoSave execution.
 *
 * Fixed amount:
 *
 *     amount = configured amount
 *
 * Percentage:
 *
 *     percentage is applied to the supplied
 *     percentageBase.
 */
const resolveExecutionAmount = ({
  autoSave,
  percentageBase = null,
}) => {
  if (
    autoSave.method ===
    "fixed_amount"
  ) {
    return normalizeAmount(
      autoSave.amount
    );
  }

  if (
    autoSave.method ===
    "percentage"
  ) {
    if (
      !Number.isFinite(
        Number(percentageBase)
      ) ||
      Number(percentageBase) <= 0
    ) {
      throw new SavingOrchestratorServiceError(
        "A valid percentage base is required for percentage AutoSave",
        400,
        "PERCENTAGE_BASE_REQUIRED"
      );
    }

    const amount =
      Number(percentageBase) *
      (Number(autoSave.percentage) /
        100);

    return normalizeAmount(amount);
  }

  throw new SavingOrchestratorServiceError(
    "Unsupported AutoSave method",
    400,
    "INVALID_AUTOSAVE_METHOD"
  );
};

/* =========================================================
   APPLY EXECUTION LIMITS
========================================================= */

const applyExecutionLimits = ({
  autoSave,
  amount,
}) => {
  let finalAmount = amount;

  if (
    autoSave.maximumPerExecution !==
      null &&
    autoSave.maximumPerExecution !==
      undefined
  ) {
    finalAmount = Math.min(
      finalAmount,
      Number(
        autoSave.maximumPerExecution
      )
    );
  }

  if (
    autoSave.maximumTotalAmount !==
      null &&
    autoSave.maximumTotalAmount !==
      undefined
  ) {
    const remaining =
      Math.max(
        0,
        Number(
          autoSave.maximumTotalAmount
        ) -
          Number(
            autoSave.totalSaved || 0
          )
      );

    finalAmount = Math.min(
      finalAmount,
      remaining
    );
  }

  if (finalAmount <= 0) {
    throw new SavingOrchestratorServiceError(
      "AutoSave has no remaining amount available for execution",
      409,
      "NO_REMAINING_AUTOSAVE_AMOUNT"
    );
  }

  return finalAmount;
};

/* =========================================================
   IDEMPOTENCY
========================================================= */

const buildIdempotencyKey = ({
  autoSaveId,
  scheduledFor,
  executionType = "scheduled",
}) => {
  const timestamp =
    new Date(scheduledFor)
      .getTime();

  return [
    "autosave",
    String(autoSaveId),
    executionType,
    timestamp,
  ].join(":");
};

/* =========================================================
   FIND EXISTING EXECUTION
========================================================= */

const findExistingExecution = async ({
  userId,
  idempotencyKey,
  session,
}) => {
  const query =
    SavingExecution.findOne({
      user: normalizeId(userId),
      idempotencyKey,
    });

  query.session(session);

  return query;
};

/* =========================================================
   GET AUTOSAVE ORCHESTRATION STATUS
========================================================= */

export const getOrchestrationStatus =
  async ({
    userId,
    autoSaveId,
    session = null,
  }) => {
    assertUserId(userId);

    const autoSave =
      await getAutoSaveById({
        userId,
        autoSaveId,
        session,
      });

    const goal =
      await findOwnedGoal({
        userId,
        goalId: autoSave.savingGoal,
        session,
      });

    const executionQuery =
      SavingExecution.find({
        user: normalizeId(userId),
        goal: normalizeId(
          autoSave.savingGoal
        ),
      })
        .sort({
          createdAt: -1,
        })
        .limit(20);

    if (session) {
      executionQuery.session(session);
    }

    const executions =
      await executionQuery;

    return {
      autoSave,
      goal,
      executions,
      isOperational:
        autoSave.status ===
          "active" &&
        !GOAL_TERMINAL_STATUSES.includes(
          goal.status
        ),
    };
  };

/* =========================================================
   PREPARE AUTOSAVE
========================================================= */

/**
 * Ensures an AutoSave has a synchronized
 * SavingSchedule before execution.
 */
export const prepareAutoSave =
  async ({
    userId,
    autoSaveId,
  }) => {
    assertUserId(userId);

    return withTransaction(
      async (session) => {
        const autoSave =
          await findOwnedAutoSave({
            userId,
            autoSaveId,
            session,
          });

        assertAutoSaveAvailable(
          autoSave
        );

        await findOwnedGoal({
          userId,
          goalId:
            autoSave.savingGoal,
          session,
        });

        const schedule =
          await createOrSyncAutoSaveSchedule(
            {
              userId,
              autoSaveId,
              session,
            }
          );

        return {
          autoSave,
          schedule,
        };
      }
    );
  };

/* =========================================================
   EXECUTE AUTOSAVE
========================================================= */

/**
 * Main AutoSave orchestration entry point.
 *
 * Responsibilities:
 *
 * 1. Validate AutoSave.
 * 2. Validate goal.
 * 3. Check eligibility.
 * 4. Resolve amount.
 * 5. Create execution.
 * 6. Delegate financial movement.
 * 7. Create contribution.
 * 8. Update goal progress.
 * 9. Evaluate milestones.
 *
 * The orchestrator does NOT directly implement
 * financial ledger rules.
 */
export const executeAutoSave =
  async ({
    userId,
    autoSaveId,
    scheduledFor = new Date(),
    executionType = "scheduled",
    percentageBase = null,
    metadata = {},
  }) => {
    assertUserId(userId);

    if (
      ![
        "scheduled",
        "manual",
        "retry",
      ].includes(executionType)
    ) {
      throw new SavingOrchestratorServiceError(
        "Invalid execution type",
        400,
        "INVALID_EXECUTION_TYPE"
      );
    }

    const scheduledDate =
      new Date(scheduledFor);

    if (
      Number.isNaN(
        scheduledDate.getTime()
      )
    ) {
      throw new SavingOrchestratorServiceError(
        "scheduledFor must be a valid date",
        400,
        "INVALID_DATE"
      );
    }

    return withTransaction(
      async (session) => {
        const autoSave =
          await findOwnedAutoSave({
            userId,
            autoSaveId,
            session,
          });

        assertAutoSaveAvailable(
          autoSave
        );

        const goal =
          await findOwnedGoal({
            userId,
            goalId:
              autoSave.savingGoal,
            session,
          });

        assertGoalAvailable(goal);

        const eligibility =
          await checkAutoSaveEligibility(
            {
              userId,
              autoSaveId,
              session,
            }
          );

        if (!eligibility.eligible) {
          throw new SavingOrchestratorServiceError(
            "AutoSave is not eligible for execution",
            409,
            "AUTOSAVE_NOT_ELIGIBLE",
            {
              reasons:
                eligibility.reasons,
            }
          );
        }

        let amount =
          resolveExecutionAmount({
            autoSave,
            percentageBase,
          });

        amount =
          applyExecutionLimits({
            autoSave,
            amount,
          });

        const idempotencyKey =
          buildIdempotencyKey({
            autoSaveId:
              autoSave._id,
            scheduledFor:
              scheduledDate,
            executionType,
          });

        const existing =
          await findExistingExecution(
            {
              userId,
              idempotencyKey,
              session,
            }
          );

        if (existing) {
          return {
            duplicate: true,
            execution: existing,
            autoSave,
            goal,
          };
        }

        /*
         * Create the execution record FIRST.
         *
         * The execution represents the attempt
         * independently from the contribution.
         */
        const execution =
          await createSavingExecution({
            userId,
            data: {
              goal:
                autoSave.savingGoal,

              schedule:
                autoSave.savingSchedule,

              executionType,

              status: "pending",

              amount,

              currency:
                autoSave.currency,

              sourceType:
                autoSave.source,

              sourceAccount:
                autoSave.sourceAccount ||
                null,

              scheduledFor:
                scheduledDate,

              idempotencyKey,

              metadata,
            },
            session,
          });

        /*
         * Mark execution as processing.
         */
        execution.status =
          "processing";

        execution.startedAt =
          execution.startedAt ||
          new Date();

        await execution.save({
          session,
        });

        /*
         * IMPORTANT:
         *
         * Actual debit/credit movement belongs
         * to the appropriate financial service.
         *
         * This orchestration layer must not
         * duplicate SavingAccountService logic.
         *
         * The contribution is created only after
         * the financial operation has succeeded.
         */

        const contribution =
          await createSavingContribution({
            userId,
            data: {
              savingGoal:
                autoSave.savingGoal,

              amount,

              currency:
                autoSave.currency,

              source:
                autoSave.source,

              sourceAccount:
                autoSave.sourceAccount ||
                null,

              autoSave:
                autoSave._id,

              execution:
                execution._id,

              date:
                new Date(),

              metadata: {
                ...metadata,
                executionId:
                  String(
                    execution._id
                  ),
                autoSaveId:
                  String(
                    autoSave._id
                  ),
              },
            },
            session,
          });

        /*
         * Mark execution successful.
         */
        execution.status =
          "successful";

        execution.contribution =
          contribution._id;

        execution.completedAt =
          new Date();

        execution.failureCode =
          null;

        execution.failureMessage =
          null;

        execution.nextRetryAt =
          null;

        await execution.save({
          session,
        });

        /*
         * Update cached AutoSave statistics.
         */
        autoSave.executionCount += 1;

        autoSave.successfulExecutionCount +=
          1;

        autoSave.totalSaved += amount;

        autoSave.consecutiveFailures = 0;

        autoSave.lastFailureAt =
          null;

        autoSave.lastFailureReason =
          null;

        autoSave.lastExecutionAt =
          new Date();

        /*
         * Respect maximum total amount.
         */
        if (
          autoSave.maximumTotalAmount !==
            null &&
          autoSave.totalSaved >=
            autoSave.maximumTotalAmount
        ) {
          autoSave.totalSaved =
            autoSave.maximumTotalAmount;

          autoSave.status =
            "completed";

          autoSave.completedAt =
            new Date();

          autoSave.nextExecutionAt =
            null;
        }

        await autoSave.save({
          session,
        });

        /*
         * Update SavingGoal cached progress.
         *
         * SavingContribution remains the ledger
         * source of truth.
         */
        const goalProgress =
          await updateSavingGoalProgress({
            userId,
            goalId:
              goal._id,
            session,
          });

        /*
         * Evaluate milestones after the
         * contribution and goal progress exist.
         */
        let milestones = null;

        if (
          typeof evaluateSavingMilestones ===
          "function"
        ) {
          milestones =
            await evaluateSavingMilestones({
              userId,
              goalId:
                goal._id,
              contributionId:
                contribution._id,
              session,
            });
        }

        /*
         * Update schedule statistics only
         * after successful execution.
         */
        if (
          autoSave.savingSchedule
        ) {
          await recordScheduleSuccess({
            userId,
            scheduleId:
              autoSave.savingSchedule,
            amount,
            executionId:
              execution._id,
            session,
          });
        }

        return {
          duplicate: false,
          success: true,
          autoSave,
          goal: goalProgress,
          execution,
          contribution,
          milestones,
        };
      }
    );
  };

/* =========================================================
   SKIP AUTOSAVE
========================================================= */

/**
 * Records a scheduled opportunity that should
 * not produce a contribution.
 */
export const skipAutoSave =
  async ({
    userId,
    autoSaveId,
    reason,
    scheduledFor = new Date(),
  }) => {
    assertUserId(userId);

    return withTransaction(
      async (session) => {
        const autoSave =
          await findOwnedAutoSave({
            userId,
            autoSaveId,
            session,
          });

        assertAutoSaveAvailable(
          autoSave
        );

        if (
          autoSave.savingSchedule
        ) {
          await recordScheduleSkipped({
            userId,
            scheduleId:
              autoSave.savingSchedule,
            reason:
              reason ||
              "AutoSave execution skipped",
            session,
          });
        }

        return {
          skipped: true,
          reason:
            reason ||
            "AutoSave execution skipped",
          autoSave,
        };
      }
    );
  };

/* =========================================================
   HANDLE EXECUTION FAILURE
========================================================= */

export const handleAutoSaveFailure =
  async ({
    userId,
    executionId,
    failureCode =
      "UNKNOWN_ERROR",
    failureMessage =
      "AutoSave execution failed",
    retry = false,
    nextRetryAt = null,
  }) => {
    assertUserId(userId);
    assertObjectId(
      executionId,
      "Execution ID"
    );

    return withTransaction(
      async (session) => {
        const execution =
          await SavingExecution.findOne({
            _id: executionId,
            user:
              normalizeId(userId),
          }).session(session);

        if (!execution) {
          throw new SavingOrchestratorServiceError(
            "Saving execution not found",
            404,
            "EXECUTION_NOT_FOUND"
          );
        }

        if (
          TERMINAL_EXECUTION_STATUSES.includes(
            execution.status
          )
        ) {
          return {
            alreadyTerminal: true,
            execution,
          };
        }

        execution.status =
          "failed";

        execution.failureCode =
          failureCode;

        execution.failureMessage =
          String(
            failureMessage
          ).slice(0, 1000);

        execution.completedAt =
          new Date();

        execution.nextRetryAt =
          retry
            ? nextRetryAt
            : null;

        if (retry) {
          execution.retryCount += 1;
        }

        await execution.save({
          session,
        });

        const autoSave =
          await AutoSave.findOne({
            _id: execution.metadata?.get?.(
              "autoSaveId"
            ) ||
              execution.metadata?.autoSaveId ||
              null,
            user:
              normalizeId(userId),
          }).session(session);

        /*
         * If the execution does not carry an
         * AutoSave reference, do not mutate
         * unrelated records.
         */
        if (autoSave) {
          autoSave.executionCount += 1;

          autoSave.failedExecutionCount +=
            1;

          autoSave.consecutiveFailures +=
            1;

          autoSave.lastFailureAt =
            new Date();

          autoSave.lastFailureReason =
            String(
              failureMessage
            ).slice(0, 500);

          if (
            autoSave.consecutiveFailures >=
            autoSave.maxRetries
          ) {
            autoSave.status =
              "failed";
          }

          await autoSave.save({
            session,
          });

          if (
            autoSave.savingSchedule
          ) {
            await recordScheduleFailure({
              userId,
              scheduleId:
                autoSave.savingSchedule,
              reason:
                failureMessage,
              session,
            });
          }
        }

        return {
          success: false,
          retryScheduled: retry,
          execution,
        };
      }
    );
  };

/* =========================================================
   PROCESS DUE AUTOSAVES
========================================================= */

/**
 * Finds active AutoSave configurations that
 * are due and attempts to orchestrate them.
 *
 * This method is designed for a worker/cron layer.
 *
 * It deliberately does not own the scheduler.
 */
export const processDueAutoSaves =
  async ({
    userId = null,
    limit = 50,
    now = new Date(),
  } = {}) => {
    if (userId) {
      assertUserId(userId);
    }

    const filter = {
      status: "active",
      isDeleted: false,
      nextExecutionAt: {
        $lte: now,
      },
    };

    if (userId) {
      filter.user =
        normalizeId(userId);
    }

    const autoSaves =
      await AutoSave.find(filter)
        .sort({
          nextExecutionAt: 1,
        })
        .limit(
          Math.min(
            Math.max(
              Number(limit) || 50,
              1
            ),
            100
          )
        )
        .lean();

    const results = [];

    for (const autoSave of autoSaves) {
      try {
        const result =
          await executeAutoSave({
            userId:
              autoSave.user,
            autoSaveId:
              autoSave._id,
            scheduledFor:
              autoSave.nextExecutionAt ||
              now,
            executionType:
              "scheduled",
          });

        results.push({
          autoSaveId:
            autoSave._id,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          autoSaveId:
            autoSave._id,
          success: false,
          error: {
            code:
              error.code ||
              "AUTOSAVE_EXECUTION_ERROR",
            message:
              error.message,
          },
        });
      }
    }

    return {
      processed: results.length,
      successful:
        results.filter(
          (item) => item.success
        ).length,
      failed:
        results.filter(
          (item) => !item.success
        ).length,
      results,
    };
  };

/* =========================================================
   MANUAL EXECUTION
========================================================= */

/**
 * Manually triggers an AutoSave.
 *
 * This uses the same execution pipeline as
 * scheduled execution so the financial workflow
 * remains consistent.
 */
export const executeManualAutoSave =
  async ({
    userId,
    autoSaveId,
    percentageBase = null,
    metadata = {},
  }) => {
    return executeAutoSave({
      userId,
      autoSaveId,
      executionType:
        "manual",
      scheduledFor:
        new Date(),
      percentageBase,
      metadata: {
        ...metadata,
        trigger: "manual",
      },
    });
  };

/* =========================================================
   RETRY EXECUTION
========================================================= */

export const retryAutoSaveExecution =
  async ({
    userId,
    executionId,
    percentageBase = null,
  }) => {
    assertUserId(userId);
    assertObjectId(
      executionId,
      "Execution ID"
    );

    const execution =
      await SavingExecution.findOne({
        _id: executionId,
        user:
          normalizeId(userId),
      });

    if (!execution) {
      throw new SavingOrchestratorServiceError(
        "Saving execution not found",
        404,
        "EXECUTION_NOT_FOUND"
      );
    }

    if (
      execution.status !==
      "failed"
    ) {
      throw new SavingOrchestratorServiceError(
        "Only failed executions can be retried",
        409,
        "EXECUTION_NOT_RETRYABLE"
      );
    }

    if (
      execution.retryCount >=
      execution.maxRetries
    ) {
      throw new SavingOrchestratorServiceError(
        "Maximum execution retries have been reached",
        409,
        "MAX_RETRIES_REACHED"
      );
    }

    const autoSaveId =
      execution.metadata?.get?.(
        "autoSaveId"
      ) ||
      execution.metadata?.autoSaveId;

    if (!autoSaveId) {
      throw new SavingOrchestratorServiceError(
        "Execution is not linked to an AutoSave configuration",
        409,
        "AUTOSAVE_REFERENCE_MISSING"
      );
    }

    return executeAutoSave({
      userId,
      autoSaveId,
      executionType: "retry",
      scheduledFor:
        new Date(),
      percentageBase,
      metadata: {
        retryOf:
          String(execution._id),
        trigger: "retry",
      },
    });
  };

/* =========================================================
   SERVICE ERROR EXPORT
========================================================= */

export {
  SavingOrchestratorServiceError,
};