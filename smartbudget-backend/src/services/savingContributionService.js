import mongoose from "mongoose";

import SavingContribution from "../models/SavingContribution.js";
import SavingGoal from "../models/SavingsGoal.js";
import SavingSchedule from "../models/SavingSchedule.js";

/* =========================================================
   CONSTANTS
========================================================= */

const CONTRIBUTION_STATUS = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REVERSED: "reversed",
  CANCELLED: "cancelled",
});

const CONTRIBUTION_SOURCE = Object.freeze({
  MANUAL: "manual",
  AUTOMATIC: "automatic",
  BANK: "bank",
  PAYMENT: "payment",
});

const ACTIVE_GOAL_STATUSES = ["active", "paused"];

/* =========================================================
   ERROR FACTORY
========================================================= */

const createServiceError = (
  message,
  statusCode = 400,
  code = "SAVING_CONTRIBUTION_ERROR"
) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.code = code;

  return error;
};

/* =========================================================
   OBJECT ID VALIDATION
========================================================= */

const assertObjectId = (value, fieldName) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw createServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_OBJECT_ID"
    );
  }
};

/* =========================================================
   USER ID NORMALIZATION
========================================================= */

const normalizeUserId = (userId) => {
  if (!userId) {
    throw createServiceError(
      "User is required",
      401,
      "USER_REQUIRED"
    );
  }

  assertObjectId(userId, "User ID");

  return new mongoose.Types.ObjectId(userId);
};

/* =========================================================
   AMOUNT NORMALIZATION
========================================================= */

const normalizeAmount = (amount) => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw createServiceError(
      "Contribution amount must be greater than zero",
      400,
      "INVALID_CONTRIBUTION_AMOUNT"
    );
  }

  return numericAmount;
};

/* =========================================================
   TRANSACTION HELPER
========================================================= */

const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await callback(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/* =========================================================
   GET GOAL FOR USER
========================================================= */

const getOwnedGoal = async (
  userId,
  savingGoalId,
  session = null
) => {
  assertObjectId(savingGoalId, "Saving goal ID");

  const query = SavingGoal.findOne({
    _id: savingGoalId,
    user: userId,
    isDeleted: false,
  });

  if (session) {
    query.session(session);
  }

  const goal = await query;

  if (!goal) {
    throw createServiceError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  return goal;
};

/* =========================================================
   GET CONTRIBUTION BY ID
========================================================= */

export const getContributionById = async (
  userId,
  contributionId
) => {
  const normalizedUserId =
    normalizeUserId(userId);

  assertObjectId(
    contributionId,
    "Contribution ID"
  );

  const contribution =
    await SavingContribution.findOne({
      _id: contributionId,
      user: normalizedUserId,
    })
      .populate({
        path: "savingGoal",
        select:
          "name category targetAmount currentAmount currency status",
      })
      .populate({
        path: "savingSchedule",
        select:
          "name strategy frequency status",
      });

  if (!contribution) {
    throw createServiceError(
      "Saving contribution not found",
      404,
      "CONTRIBUTION_NOT_FOUND"
    );
  }

  return contribution;
};

/* =========================================================
   CREATE MANUAL CONTRIBUTION
========================================================= */

/**
 * Creates a completed manual contribution.
 *
 * Financial sequence:
 *
 * 1. Validate user.
 * 2. Validate goal ownership.
 * 3. Validate goal status.
 * 4. Create contribution ledger record.
 * 5. Update goal aggregate.
 * 6. Commit atomically.
 *
 * If any operation fails, MongoDB rolls back the transaction.
 */

export const createManualContribution =
  async ({
    userId,
    savingGoalId,
    amount,
    currency = "NGN",
    description = "",
    note = "",
    idempotencyKey,
    metadata = {},
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    const normalizedAmount =
      normalizeAmount(amount);

    return executeTransaction(
      async (session) => {
        /* -------------------------------------------------
           IDEMPOTENCY CHECK
        ------------------------------------------------- */

        if (idempotencyKey) {
          const existing =
            await SavingContribution.findOne({
              user: normalizedUserId,
              idempotencyKey,
            }).session(session);

          if (existing) {
            return existing;
          }
        }

        /* -------------------------------------------------
           GET GOAL
        ------------------------------------------------- */

        const goal = await getOwnedGoal(
          normalizedUserId,
          savingGoalId,
          session
        );

        /* -------------------------------------------------
           GOAL STATUS
        ------------------------------------------------- */

        if (
          !ACTIVE_GOAL_STATUSES.includes(
            goal.status
          )
        ) {
          throw createServiceError(
            `Cannot contribute to a ${goal.status} saving goal`,
            400,
            "GOAL_NOT_ACCEPTING_CONTRIBUTIONS"
          );
        }

        /* -------------------------------------------------
           CURRENCY VALIDATION
        ------------------------------------------------- */

        if (
          currency.toUpperCase() !==
          goal.currency.toUpperCase()
        ) {
          throw createServiceError(
            "Contribution currency must match the saving goal currency",
            400,
            "CURRENCY_MISMATCH"
          );
        }

        /* -------------------------------------------------
           CONTRIBUTION LIMITS
        ------------------------------------------------- */

        if (
          goal.minimumContributionAmount > 0 &&
          normalizedAmount <
            goal.minimumContributionAmount
        ) {
          throw createServiceError(
            "Contribution amount is below the minimum allowed amount",
            400,
            "BELOW_MINIMUM_CONTRIBUTION"
          );
        }

        if (
          goal.maximumContributionAmount !==
            null &&
          goal.maximumContributionAmount !==
            undefined &&
          normalizedAmount >
            goal.maximumContributionAmount
        ) {
          throw createServiceError(
            "Contribution amount exceeds the maximum allowed amount",
            400,
            "ABOVE_MAXIMUM_CONTRIBUTION"
          );
        }

        /* -------------------------------------------------
           GOAL COMPLETION PROTECTION
        ------------------------------------------------- */

        const remainingAmount =
          Math.max(
            Number(goal.targetAmount) -
              Number(goal.currentAmount || 0),
            0
          );

        if (
          remainingAmount <= 0 &&
          !goal.allowExtraContributions
        ) {
          throw createServiceError(
            "This saving goal has already reached its target",
            400,
            "GOAL_ALREADY_COMPLETED"
          );
        }

        /* -------------------------------------------------
           PREVENT OVERFUNDING
        ------------------------------------------------- */

        let contributionAmount =
          normalizedAmount;

        if (
          !goal.allowExtraContributions &&
          contributionAmount > remainingAmount
        ) {
          contributionAmount =
            remainingAmount;
        }

        if (contributionAmount <= 0) {
          throw createServiceError(
            "No contribution amount remains for this goal",
            400,
            "NO_REMAINING_GOAL_BALANCE"
          );
        }

        /* -------------------------------------------------
           CREATE LEDGER RECORD
        ------------------------------------------------- */

        const contribution =
          new SavingContribution({
            user: normalizedUserId,

            savingGoal: goal._id,

            amount: contributionAmount,

            currency:
              currency.toUpperCase(),

            source:
              CONTRIBUTION_SOURCE.MANUAL,

            status:
              CONTRIBUTION_STATUS.COMPLETED,

            requestedAt: new Date(),

            completedAt: new Date(),

            idempotencyKey:
              idempotencyKey || undefined,

            description,

            note,

            isAutomatic: false,

            metadata,

            createdBy: normalizedUserId,

            updatedBy: normalizedUserId,
          });

        await contribution.save({
          session,
        });

        /* -------------------------------------------------
           UPDATE GOAL AGGREGATE
        ------------------------------------------------- */

        goal.addContribution(
          contributionAmount
        );

        await goal.save({
          session,
        });

        return contribution;
      }
    );
  };

/* =========================================================
   CREATE AUTOMATIC CONTRIBUTION
========================================================= */

export const createAutomaticContribution =
  async ({
    userId,
    savingGoalId,
    amount,
    savingScheduleId,
    idempotencyKey,
    currency = "NGN",
    description = "",
    metadata = {},
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    const normalizedAmount =
      normalizeAmount(amount);

    assertObjectId(
      savingScheduleId,
      "Saving schedule ID"
    );

    return executeTransaction(
      async (session) => {
        /* -------------------------------------------------
           IDEMPOTENCY
        ------------------------------------------------- */

        if (idempotencyKey) {
          const existing =
            await SavingContribution.findOne({
              user: normalizedUserId,
              idempotencyKey,
            }).session(session);

          if (existing) {
            return existing;
          }
        }

        /* -------------------------------------------------
           GET GOAL
        ------------------------------------------------- */

        const goal = await getOwnedGoal(
          normalizedUserId,
          savingGoalId,
          session
        );

        if (
          !ACTIVE_GOAL_STATUSES.includes(
            goal.status
          )
        ) {
          throw createServiceError(
            "Saving goal is not accepting automatic contributions",
            400,
            "GOAL_NOT_ACCEPTING_CONTRIBUTIONS"
          );
        }

        /* -------------------------------------------------
           GET SCHEDULE
        ------------------------------------------------- */

        const schedule =
          await SavingSchedule.findOne({
            _id: savingScheduleId,
            user: normalizedUserId,
            savingGoal: goal._id,
          }).session(session);

        if (!schedule) {
          throw createServiceError(
            "Saving schedule not found",
            404,
            "SAVING_SCHEDULE_NOT_FOUND"
          );
        }

        if (
          schedule.status !== "active"
        ) {
          throw createServiceError(
            "Saving schedule is not active",
            400,
            "SCHEDULE_NOT_ACTIVE"
          );
        }

        /* -------------------------------------------------
           CURRENCY
        ------------------------------------------------- */

        if (
          currency.toUpperCase() !==
          goal.currency.toUpperCase()
        ) {
          throw createServiceError(
            "Contribution currency does not match the saving goal currency",
            400,
            "CURRENCY_MISMATCH"
          );
        }

        /* -------------------------------------------------
           SCHEDULE LIMIT
        ------------------------------------------------- */

        let contributionAmount =
          normalizedAmount;

        if (
          schedule.maximumContribution &&
          contributionAmount >
            schedule.maximumContribution
        ) {
          contributionAmount =
            schedule.maximumContribution;
        }

        /* -------------------------------------------------
           GOAL LIMIT
        ------------------------------------------------- */

        const remainingAmount =
          Math.max(
            Number(goal.targetAmount) -
              Number(goal.currentAmount || 0),
            0
          );

        if (
          !goal.allowExtraContributions &&
          contributionAmount > remainingAmount
        ) {
          contributionAmount =
            remainingAmount;
        }

        if (contributionAmount <= 0) {
          throw createServiceError(
            "No contribution amount remains for this goal",
            400,
            "NO_REMAINING_GOAL_BALANCE"
          );
        }

        /* -------------------------------------------------
           CREATE CONTRIBUTION
        ------------------------------------------------- */

        const contribution =
          new SavingContribution({
            user: normalizedUserId,

            savingGoal: goal._id,

            amount: contributionAmount,

            currency:
              currency.toUpperCase(),

            source:
              CONTRIBUTION_SOURCE.AUTOMATIC,

            status:
              CONTRIBUTION_STATUS.COMPLETED,

            requestedAt: new Date(),

            completedAt: new Date(),

            idempotencyKey:
              idempotencyKey || undefined,

            description,

            isAutomatic: true,

            savingSchedule:
              schedule._id,

            metadata,

            createdBy: normalizedUserId,

            updatedBy: normalizedUserId,
          });

        await contribution.save({
          session,
        });

        /* -------------------------------------------------
           UPDATE GOAL
        ------------------------------------------------- */

        goal.addContribution(
          contributionAmount
        );

        await goal.save({
          session,
        });

        /* -------------------------------------------------
           UPDATE SCHEDULE
        ------------------------------------------------- */

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

        schedule.consecutiveFailures = 0;

        schedule.lastFailureAt = null;

        schedule.lastFailureCode = null;

        schedule.lastFailureReason = null;

        schedule.totalContributed =
          Number(
            schedule.totalContributed || 0
          ) + contributionAmount;

        await schedule.save({
          session,
        });

        return contribution;
      }
    );
  };

/* =========================================================
   LIST CONTRIBUTIONS
========================================================= */

export const getContributions = async ({
  userId,
  savingGoalId,
  status,
  source,
  page = 1,
  limit = 20,
  startDate,
  endDate,
}) => {
  const normalizedUserId =
    normalizeUserId(userId);

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (safePage - 1) * safeLimit;

  const query = {
    user: normalizedUserId,
  };

  if (savingGoalId) {
    assertObjectId(
      savingGoalId,
      "Saving goal ID"
    );

    query.savingGoal = savingGoalId;
  }

  if (status) {
    query.status = status;
  }

  if (source) {
    query.source = source;
  }

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte =
        new Date(startDate);
    }

    if (endDate) {
      query.createdAt.$lte =
        new Date(endDate);
    }
  }

  const [items, total] =
    await Promise.all([
      SavingContribution.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .populate({
          path: "savingGoal",
          select:
            "name category targetAmount currentAmount currency status",
        })
        .lean(),

      SavingContribution.countDocuments(
        query
      ),
    ]);

  return {
    items,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(
        total / safeLimit
      ),
      hasNextPage:
        safePage <
        Math.ceil(total / safeLimit),
      hasPreviousPage:
        safePage > 1,
    },
  };
};

/* =========================================================
   GET CONTRIBUTION SUMMARY
========================================================= */

export const getContributionSummary =
  async ({
    userId,
    savingGoalId,
    startDate,
    endDate,
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    const match = {
      user: normalizedUserId,

      status:
        CONTRIBUTION_STATUS.COMPLETED,
    };

    if (savingGoalId) {
      assertObjectId(
        savingGoalId,
        "Saving goal ID"
      );

      match.savingGoal =
        new mongoose.Types.ObjectId(
          savingGoalId
        );
    }

    if (startDate || endDate) {
      match.completedAt = {};

      if (startDate) {
        match.completedAt.$gte =
          new Date(startDate);
      }

      if (endDate) {
        match.completedAt.$lte =
          new Date(endDate);
      }
    }

    const [summary] =
      await SavingContribution.aggregate([
        {
          $match: match,
        },

        {
          $group: {
            _id: null,

            totalContributed: {
              $sum: "$amount",
            },

            contributionCount: {
              $sum: 1,
            },

            averageContribution: {
              $avg: "$amount",
            },

            largestContribution: {
              $max: "$amount",
            },

            smallestContribution: {
              $min: "$amount",
            },
          },
        },

        {
          $project: {
            _id: 0,

            totalContributed: 1,

            contributionCount: 1,

            averageContribution: 1,

            largestContribution: 1,

            smallestContribution: 1,
          },
        },
      ]);

    return (
      summary || {
        totalContributed: 0,
        contributionCount: 0,
        averageContribution: 0,
        largestContribution: 0,
        smallestContribution: 0,
      }
    );
  };

/* =========================================================
   REVERSE CONTRIBUTION
========================================================= */

/**
 * IMPORTANT:
 *
 * We NEVER edit the original financial contribution.
 *
 * A reversal creates a compensating ledger entry.
 */

export const reverseContribution =
  async ({
    userId,
    contributionId,
    reason,
    metadata = {},
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    assertObjectId(
      contributionId,
      "Contribution ID"
    );

    if (!reason?.trim()) {
      throw createServiceError(
        "Reversal reason is required",
        400,
        "REVERSAL_REASON_REQUIRED"
      );
    }

    return executeTransaction(
      async (session) => {
        /* -------------------------------------------------
           GET ORIGINAL CONTRIBUTION
        ------------------------------------------------- */

        const original =
          await SavingContribution.findOne({
            _id: contributionId,
            user: normalizedUserId,
          }).session(session);

        if (!original) {
          throw createServiceError(
            "Saving contribution not found",
            404,
            "CONTRIBUTION_NOT_FOUND"
          );
        }

        if (
          original.status !==
          CONTRIBUTION_STATUS.COMPLETED
        ) {
          throw createServiceError(
            "Only completed contributions can be reversed",
            400,
            "CONTRIBUTION_NOT_REVERSIBLE"
          );
        }

        /* -------------------------------------------------
           PREVENT DOUBLE REVERSAL
        ------------------------------------------------- */

        const existingReversal =
          await SavingContribution.findOne({
            reversedContribution:
              original._id,
            status:
              CONTRIBUTION_STATUS.REVERSED,
          }).session(session);

        if (existingReversal) {
          throw createServiceError(
            "This contribution has already been reversed",
            409,
            "CONTRIBUTION_ALREADY_REVERSED"
          );
        }

        /* -------------------------------------------------
           GET GOAL
        ------------------------------------------------- */

        const goal = await getOwnedGoal(
          normalizedUserId,
          original.savingGoal,
          session
        );

        /* -------------------------------------------------
           CREATE REVERSAL LEDGER ENTRY
        ------------------------------------------------- */

        const reversal =
          new SavingContribution({
            user: normalizedUserId,

            savingGoal:
              original.savingGoal,

            amount: original.amount,

            currency:
              original.currency,

            source:
              original.source,

            status:
              CONTRIBUTION_STATUS.REVERSED,

            requestedAt: new Date(),

            completedAt: null,

            reversedAt: new Date(),

            description:
              `Reversal of contribution ${original._id}`,

            note: reason,

            isAutomatic:
              original.isAutomatic,

            savingSchedule:
              original.savingSchedule,

            provider:
              original.provider,

            providerTransactionId:
              original.providerTransactionId,

            bankAccountId:
              original.bankAccountId,

            bankTransactionId:
              original.bankTransactionId,

            externalReference:
              original.externalReference,

            reversalReason:
              reason,

            reversedContribution:
              original._id,

            metadata,

            createdBy:
              normalizedUserId,

            updatedBy:
              normalizedUserId,
          });

        await reversal.save({
          session,
        });

        /* -------------------------------------------------
           MARK ORIGINAL AS REVERSED
        ------------------------------------------------- */

        original.status =
          CONTRIBUTION_STATUS.REVERSED;

        original.reversedAt =
          new Date();

        original.reversalReason =
          reason;

        original.updatedBy =
          normalizedUserId;

        await original.save({
          session,
        });

        /* -------------------------------------------------
           DECREASE GOAL AGGREGATE
        ------------------------------------------------- */

        goal.currentAmount =
          Math.max(
            Number(goal.currentAmount || 0) -
              Number(original.amount),
            0
          );

        goal.lastContributionAt =
          await SavingContribution.findOne({
            user: normalizedUserId,
            savingGoal: goal._id,
            status:
              CONTRIBUTION_STATUS.COMPLETED,
          })
            .sort({
              completedAt: -1,
            })
            .session(session)
            .then(
              (latest) =>
                latest?.completedAt ||
                null
            );

        await goal.save({
          session,
        });

        return reversal;
      }
    );
  };

/* =========================================================
   CANCEL PENDING CONTRIBUTION
========================================================= */

export const cancelContribution =
  async ({
    userId,
    contributionId,
    reason,
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    assertObjectId(
      contributionId,
      "Contribution ID"
    );

    if (!reason?.trim()) {
      throw createServiceError(
        "Cancellation reason is required",
        400,
        "CANCELLATION_REASON_REQUIRED"
      );
    }

    const contribution =
      await SavingContribution.findOne({
        _id: contributionId,
        user: normalizedUserId,
      });

    if (!contribution) {
      throw createServiceError(
        "Saving contribution not found",
        404,
        "CONTRIBUTION_NOT_FOUND"
      );
    }

    if (
      contribution.status !==
      CONTRIBUTION_STATUS.PENDING
    ) {
      throw createServiceError(
        "Only pending contributions can be cancelled",
        400,
        "CONTRIBUTION_NOT_PENDING"
      );
    }

    contribution.status =
      CONTRIBUTION_STATUS.CANCELLED;

    contribution.failureReason =
      reason;

    contribution.updatedBy =
      normalizedUserId;

    await contribution.save();

    return contribution;
  };

/* =========================================================
   MARK CONTRIBUTION FAILED
========================================================= */

export const markContributionFailed =
  async ({
    userId,
    contributionId,
    failureCode,
    failureReason,
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    assertObjectId(
      contributionId,
      "Contribution ID"
    );

    const contribution =
      await SavingContribution.findOne({
        _id: contributionId,
        user: normalizedUserId,
      });

    if (!contribution) {
      throw createServiceError(
        "Saving contribution not found",
        404,
        "CONTRIBUTION_NOT_FOUND"
      );
    }

    if (
      contribution.status !==
      CONTRIBUTION_STATUS.PENDING
    ) {
      throw createServiceError(
        "Only pending contributions can fail",
        400,
        "INVALID_CONTRIBUTION_STATE"
      );
    }

    contribution.status =
      CONTRIBUTION_STATUS.FAILED;

    contribution.failedAt =
      new Date();

    contribution.failureCode =
      failureCode || null;

    contribution.failureReason =
      failureReason || null;

    contribution.updatedBy =
      normalizedUserId;

    await contribution.save();

    return contribution;
  };

/* =========================================================
   MARK CONTRIBUTION COMPLETED
========================================================= */

/**
 * Used primarily by:
 *
 * - payment webhooks
 * - bank integrations
 * - asynchronous funding providers
 */

export const completeContribution =
  async ({
    userId,
    contributionId,
    providerTransactionId,
    externalReference,
    metadata = {},
  }) => {
    const normalizedUserId =
      normalizeUserId(userId);

    assertObjectId(
      contributionId,
      "Contribution ID"
    );

    return executeTransaction(
      async (session) => {
        const contribution =
          await SavingContribution.findOne({
            _id: contributionId,
            user: normalizedUserId,
          }).session(session);

        if (!contribution) {
          throw createServiceError(
            "Saving contribution not found",
            404,
            "CONTRIBUTION_NOT_FOUND"
          );
        }

        /* -----------------------------------------------
           IDEMPOTENT COMPLETION
        ------------------------------------------------ */

        if (
          contribution.status ===
          CONTRIBUTION_STATUS.COMPLETED
        ) {
          return contribution;
        }

        if (
          contribution.status !==
          CONTRIBUTION_STATUS.PENDING
        ) {
          throw createServiceError(
            `Cannot complete a ${contribution.status} contribution`,
            400,
            "INVALID_CONTRIBUTION_STATE"
          );
        }

        /* -----------------------------------------------
           UPDATE PROVIDER REFERENCES
        ------------------------------------------------ */

        if (providerTransactionId) {
          contribution.providerTransactionId =
            providerTransactionId;
        }

        if (externalReference) {
          contribution.externalReference =
            externalReference;
        }

        contribution.metadata = {
          ...(contribution.metadata || {}),
          ...metadata,
        };

        contribution.status =
          CONTRIBUTION_STATUS.COMPLETED;

        contribution.completedAt =
          new Date();

        contribution.updatedBy =
          normalizedUserId;

        await contribution.save({
          session,
        });

        /* -----------------------------------------------
           GET GOAL
        ------------------------------------------------ */

        const goal = await getOwnedGoal(
          normalizedUserId,
          contribution.savingGoal,
          session
        );

        /* -----------------------------------------------
           UPDATE GOAL
        ------------------------------------------------ */

        goal.addContribution(
          contribution.amount
        );

        await goal.save({
          session,
        });

        return contribution;
      }
    );
  };

/* =========================================================
   EXPORT CONSTANTS
========================================================= */

export {
  CONTRIBUTION_STATUS,
  CONTRIBUTION_SOURCE,
};