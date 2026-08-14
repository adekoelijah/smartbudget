// services/savingService.js

import mongoose from "mongoose";

import SavingGoal from "../models/SavingsGoal.js";
import SavingContribution from "../models/SavingContribution.js";
import SavingExecution from "../models/SavingExecution.js";
import SavingAccount from "../models/SavingAccount.js";
import AutoSave from "../models/AutoSave.js";

/* =========================================================
   CONSTANTS
========================================================= */

const CONTRIBUTION_COMPLETED_STATUSES = [
  "completed",
  "successful",
];

const EXECUTION_STATUSES = [
  "successful",
  "failed",
  "pending",
  "processing",
  "cancelled",
];

/* =========================================================
   ERROR CLASS
========================================================= */

class SavingServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVING_ERROR",
    details = null
  ) {
    super(message);

    this.name = "SavingServiceError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(
      this,
      SavingServiceError
    );
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
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new SavingServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_ID"
    );
  }
};

const assertUserId = (userId) => {
  assertObjectId(userId, "User ID");
};

const toObjectId = (
  value,
  fieldName = "ID"
) => {
  assertObjectId(value, fieldName);

  return value instanceof mongoose.Types.ObjectId
    ? value
    : new mongoose.Types.ObjectId(value);
};

const normalizeAmount = (
  value,
  fieldName = "Amount"
) => {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new SavingServiceError(
      `${fieldName} must be greater than zero`,
      400,
      "INVALID_AMOUNT"
    );
  }

  return amount;
};

const normalizeDate = (
  value,
  fieldName = "Date"
) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SavingServiceError(
      `${fieldName} must be a valid date`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizePagination = ({
  page = 1,
  limit = 20,
} = {}) => {
  const normalizedPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const normalizedLimit = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 20,
      1
    ),
    100
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip:
      (normalizedPage - 1) *
      normalizedLimit,
  };
};

const assertSession = (session) => {
  if (!session) {
    throw new SavingServiceError(
      "Database transaction session is required for this operation",
      500,
      "TRANSACTION_REQUIRED"
    );
  }
};

/* =========================================================
   SESSION HELPERS
========================================================= */

const applySession = (
  query,
  session
) => {
  if (session) {
    query.session(session);
  }

  return query;
};

const applyAggregateSession = (
  aggregate,
  session
) => {
  if (session) {
    aggregate.session(session);
  }

  return aggregate;
};

/* =========================================================
   OWNERSHIP HELPERS
========================================================= */

/**
 * Find a user's saving goal.
 *
 * SavingGoal lifecycle operations belong to
 * savingPlanService.
 *
 * This helper is intentionally read-oriented and is used
 * only when saving operations need to verify ownership.
 */
const findUserGoal = async ({
  userId,
  goalId,
  session = null,
  allowDeleted = false,
}) => {
  assertUserId(userId);

  assertObjectId(
    goalId,
    "Saving goal ID"
  );

  const filter = {
    _id: goalId,
    user: userId,
  };

  if (!allowDeleted) {
    filter.isDeleted = false;
  }

  const query =
    SavingGoal.findOne(filter);

  applySession(query, session);

  const goal = await query;

  if (!goal) {
    throw new SavingServiceError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  return goal;
};

/**
 * Find a user's contribution.
 */
const findUserContribution = async ({
  userId,
  contributionId,
  session = null,
}) => {
  assertUserId(userId);

  assertObjectId(
    contributionId,
    "Saving contribution ID"
  );

  const query =
    SavingContribution.findOne({
      _id: contributionId,
      user: userId,
    });

  applySession(query, session);

  const contribution = await query;

  if (!contribution) {
    throw new SavingServiceError(
      "Saving contribution not found",
      404,
      "SAVING_CONTRIBUTION_NOT_FOUND"
    );
  }

  return contribution;
};

/**
 * Find a user's saving account.
 */
const findUserSavingAccount = async ({
  userId,
  accountId,
  session = null,
}) => {
  assertUserId(userId);

  assertObjectId(
    accountId,
    "Saving account ID"
  );

  const query =
    SavingAccount.findOne({
      _id: accountId,
      user: userId,
      isDeleted: false,
    });

  applySession(query, session);

  const account = await query;

  if (!account) {
    throw new SavingServiceError(
      "Saving account not found",
      404,
      "SAVING_ACCOUNT_NOT_FOUND"
    );
  }

  return account;
};

/* =========================================================
   CREATE MANUAL CONTRIBUTION
========================================================= */

/**
 * Create a pending saving contribution.
 *
 * IMPORTANT:
 *
 * This service creates the contribution ledger record.
 * It does NOT directly manipulate account balances.
 *
 * The contribution/payment execution layer should be
 * responsible for confirming the transaction and updating
 * the appropriate financial aggregates.
 */
export const createSavingContribution =
  async ({
    userId,
    goalId,
    amount,
    currency = "NGN",
    sourceType = "internal_balance",
    sourceAccount = null,
    description = "",
    metadata = {},
    idempotencyKey = null,
    session = null,
  }) => {
    assertUserId(userId);
    assertSession(session);

    const normalizedAmount =
      normalizeAmount(amount);

    const goal =
      await findUserGoal({
        userId,
        goalId,
        session,
      });

    /* ---------------------------------------------
       GOAL STATE VALIDATION
    --------------------------------------------- */

    if (
      ["completed", "cancelled", "expired"].includes(
        goal.status
      )
    ) {
      throw new SavingServiceError(
        "Saving goal is no longer available for contributions",
        409,
        "GOAL_NOT_AVAILABLE"
      );
    }

    if (
      goal.status === "paused"
    ) {
      throw new SavingServiceError(
        "Saving goal is currently paused",
        409,
        "GOAL_PAUSED"
      );
    }

    /* ---------------------------------------------
       CONTRIBUTION LIMITS
    --------------------------------------------- */

    const minimum =
      Number(
        goal.minimumContributionAmount
      ) || 0;

    const maximum =
      goal.maximumContributionAmount ===
      null
        ? null
        : Number(
            goal.maximumContributionAmount
          );

    if (
      minimum > 0 &&
      normalizedAmount < minimum
    ) {
      throw new SavingServiceError(
        "Contribution amount is below the minimum allowed amount",
        400,
        "CONTRIBUTION_BELOW_MINIMUM"
      );
    }

    if (
      maximum !== null &&
      normalizedAmount > maximum &&
      !goal.allowExtraContributions
    ) {
      throw new SavingServiceError(
        "Contribution amount exceeds the maximum allowed amount",
        400,
        "CONTRIBUTION_ABOVE_MAXIMUM"
      );
    }

    /* ---------------------------------------------
       SOURCE ACCOUNT VALIDATION
    --------------------------------------------- */

    if (sourceAccount) {
      await findUserSavingAccount({
        userId,
        accountId: sourceAccount,
        session,
      });
    }

    /* ---------------------------------------------
       TARGET VALIDATION
    --------------------------------------------- */

    if (
      goal.goalType === "target"
    ) {
      const targetAmount =
        Number(goal.targetAmount) || 0;

      const currentAmount =
        Number(goal.currentAmount) || 0;

      const remaining =
        Math.max(
          targetAmount -
            currentAmount,
          0
        );

      if (remaining <= 0) {
        throw new SavingServiceError(
          "Saving goal has already reached its target",
          409,
          "GOAL_TARGET_REACHED"
        );
      }

      if (
        normalizedAmount > remaining &&
        !goal.allowExtraContributions
      ) {
        throw new SavingServiceError(
          "Contribution exceeds the remaining goal amount",
          400,
          "CONTRIBUTION_EXCEEDS_TARGET",
          {
            remainingAmount: remaining,
            requestedAmount:
              normalizedAmount,
          }
        );
      }
    }

    /* ---------------------------------------------
       PAYLOAD
    --------------------------------------------- */

    const contributionPayload = {
      user: userId,
      savingGoal: goal._id,
      amount: normalizedAmount,
      currency,
      sourceType,
      sourceAccount,
      description,
      metadata,
      idempotencyKey,
      status: "pending",
      createdBy: userId,
      updatedBy: userId,
    };

    try {
      const [
        contribution,
      ] =
        await SavingContribution.create(
          [contributionPayload],
          { session }
        );

      return contribution;
    } catch (error) {
      if (
        error?.code === 11000 &&
        idempotencyKey
      ) {
        throw new SavingServiceError(
          "A contribution with this idempotency key already exists",
          409,
          "DUPLICATE_CONTRIBUTION"
        );
      }

      throw error;
    }
  };

/* =========================================================
   GET SAVING GOAL
========================================================= */

/**
 * Read-only goal lookup.
 *
 * Goal creation/update/lifecycle remains in
 * savingPlanService.
 */
export const getSavingGoal =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    return findUserGoal({
      userId,
      goalId,
      session,
    });
  };

/* =========================================================
   GET USER SAVING GOALS
========================================================= */

/**
 * Read-only goal listing.
 *
 * If savingPlanService already exposes this endpoint,
 * controllers should prefer that service.
 *
 * This method is retained for backward compatibility.
 */
export const getUserSavingGoals =
  async ({
    userId,
    page = 1,
    limit = 20,
    status = null,
    session = null,
  }) => {
    assertUserId(userId);

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const filter = {
      user: userId,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    const query =
      SavingGoal.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(pagination.skip)
        .limit(pagination.limit);

    const countQuery =
      SavingGoal.countDocuments(
        filter
      );

    applySession(
      query,
      session
    );

    applySession(
      countQuery,
      session
    );

    const [
      items,
      total,
    ] = await Promise.all([
      query,
      countQuery,
    ]);

    const totalPages =
      Math.ceil(
        total /
          pagination.limit
      );

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNextPage:
          pagination.page <
          totalPages,
        hasPreviousPage:
          pagination.page > 1,
      },
    };
  };

/* =========================================================
   GET CONTRIBUTION
========================================================= */

export const getSavingContribution =
  async ({
    userId,
    contributionId,
    session = null,
  }) => {
    return findUserContribution({
      userId,
      contributionId,
      session,
    });
  };

/* =========================================================
   GET CONTRIBUTIONS FOR GOAL
========================================================= */

export const getGoalContributions =
  async ({
    userId,
    goalId,
    page = 1,
    limit = 20,
    status = null,
    startDate = null,
    endDate = null,
    session = null,
  }) => {
    assertUserId(userId);

    await findUserGoal({
      userId,
      goalId,
      session,
    });

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const filter = {
      user: userId,
      savingGoal: goalId,
    };

    if (status) {
      filter.status = status;
    }

    const normalizedStart =
      normalizeDate(
        startDate,
        "Start date"
      );

    const normalizedEnd =
      normalizeDate(
        endDate,
        "End date"
      );

    if (
      normalizedStart &&
      normalizedEnd &&
      normalizedEnd <
        normalizedStart
    ) {
      throw new SavingServiceError(
        "End date cannot be before start date",
        400,
        "INVALID_DATE_RANGE"
      );
    }

    if (
      normalizedStart ||
      normalizedEnd
    ) {
      filter.createdAt = {};

      if (normalizedStart) {
        filter.createdAt.$gte =
          normalizedStart;
      }

      if (normalizedEnd) {
        filter.createdAt.$lte =
          normalizedEnd;
      }
    }

    const query =
      SavingContribution.find(
        filter
      )
        .sort({
          createdAt: -1,
        })
        .skip(pagination.skip)
        .limit(pagination.limit);

    const countQuery =
      SavingContribution.countDocuments(
        filter
      );

    applySession(
      query,
      session
    );

    applySession(
      countQuery,
      session
    );

    const [
      items,
      total,
    ] = await Promise.all([
      query,
      countQuery,
    ]);

    const totalPages =
      Math.ceil(
        total /
          pagination.limit
      );

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNextPage:
          pagination.page <
          totalPages,
        hasPreviousPage:
          pagination.page > 1,
      },
    };
  };

/* =========================================================
   GET SAVING HISTORY
========================================================= */

/**
 * Returns saving contributions and execution records
 * separately.
 *
 * They are intentionally NOT merged because they represent
 * different domains:
 *
 * Contribution = financial ledger
 * Execution    = automation/operational event
 */
export const getSavingHistory =
  async ({
    userId,
    goalId,
    page = 1,
    limit = 20,
    session = null,
  }) => {
    assertUserId(userId);

    await findUserGoal({
      userId,
      goalId,
      session,
    });

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const contributionFilter = {
      user: userId,
      savingGoal: goalId,
    };

    const executionFilter = {
      user: userId,
      goal: goalId,
    };

    const contributionQuery =
      SavingContribution.find(
        contributionFilter
      )
        .sort({
          createdAt: -1,
        })
        .skip(pagination.skip)
        .limit(pagination.limit);

    const executionQuery =
      SavingExecution.find(
        executionFilter
      )
        .sort({
          createdAt: -1,
        })
        .skip(pagination.skip)
        .limit(pagination.limit);

    applySession(
      contributionQuery,
      session
    );

    applySession(
      executionQuery,
      session
    );

    const [
      contributions,
      executions,
    ] = await Promise.all([
      contributionQuery,
      executionQuery,
    ]);

    return {
      contributions,
      executions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  };

/* =========================================================
   GET SAVING SUMMARY
========================================================= */

/**
 * Financial summary for a single saving goal.
 *
 * SavingContribution remains the financial source of truth.
 */
export const getSavingSummary =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    assertUserId(userId);

    const goal =
      await findUserGoal({
        userId,
        goalId,
        session,
      });

    const goalIdObject =
      toObjectId(
        goal._id,
        "Saving goal ID"
      );

    const userIdObject =
      toObjectId(
        userId,
        "User ID"
      );

    const contributionAggregate =
      SavingContribution.aggregate([
        {
          $match: {
            user: userIdObject,
            savingGoal:
              goalIdObject,
            status: {
              $in:
                CONTRIBUTION_COMPLETED_STATUSES,
            },
          },
        },
        {
          $group: {
            _id: null,

            totalSaved: {
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
          },
        },
      ]);

    const executionAggregate =
      SavingExecution.aggregate([
        {
          $match: {
            user: userIdObject,
            goal: goalIdObject,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    applyAggregateSession(
      contributionAggregate,
      session
    );

    applyAggregateSession(
      executionAggregate,
      session
    );

    const [
      contributionStats,
      executionStats,
    ] = await Promise.all([
      contributionAggregate,
      executionAggregate,
    ]);

    const contribution =
      contributionStats[0] || {
        totalSaved: 0,
        contributionCount: 0,
        averageContribution: 0,
        largestContribution: 0,
      };

    const executions = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      processing: 0,
      cancelled: 0,
    };

    executionStats.forEach(
      (item) => {
        executions.total +=
          item.count;

        if (
          EXECUTION_STATUSES.includes(
            item._id
          )
        ) {
          executions[item._id] =
            item.count;
        }
      }
    );

    const targetAmount =
      Number(goal.targetAmount) ||
      0;

    const totalSaved =
      Number(
        contribution.totalSaved
      ) || 0;

    const remainingAmount =
      Math.max(
        targetAmount -
          totalSaved,
        0
      );

    const progressPercentage =
      targetAmount > 0
        ? Math.min(
            100,
            (totalSaved /
              targetAmount) *
              100
          )
        : 0;

    return {
      goal,

      financial: {
        targetAmount,
        totalSaved,
        remainingAmount,
        progressPercentage:
          Number(
            progressPercentage.toFixed(
              2
            )
          ),

        contributionCount:
          contribution.contributionCount,

        averageContribution:
          Number(
            contribution.averageContribution
          ) || 0,

        largestContribution:
          Number(
            contribution.largestContribution
          ) || 0,
      },

      executions,
    };
  };

/* =========================================================
   GET SAVING DASHBOARD SUMMARY
========================================================= */

/**
 * Aggregated saving dashboard data.
 *
 * All aggregation pipelines receive the transaction
 * session when one is supplied.
 */
export const getSavingDashboardSummary =
  async ({
    userId,
    session = null,
  }) => {
    assertUserId(userId);

    const userIdObject =
      toObjectId(
        userId,
        "User ID"
      );

    const goalAggregate =
      SavingGoal.aggregate([
        {
          $match: {
            user: userIdObject,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const contributionAggregate =
      SavingContribution.aggregate([
        {
          $match: {
            user: userIdObject,
            status: {
              $in:
                CONTRIBUTION_COMPLETED_STATUSES,
            },
          },
        },
        {
          $group: {
            _id: null,

            totalSaved: {
              $sum: "$amount",
            },

            contributionCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const executionAggregate =
      SavingExecution.aggregate([
        {
          $match: {
            user: userIdObject,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const accountAggregate =
      SavingAccount.aggregate([
        {
          $match: {
            user: userIdObject,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,

            totalBalance: {
              $sum: "$balance",
            },

            accountCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const autoSaveAggregate =
      AutoSave.aggregate([
        {
          $match: {
            user: userIdObject,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    applyAggregateSession(
      goalAggregate,
      session
    );

    applyAggregateSession(
      contributionAggregate,
      session
    );

    applyAggregateSession(
      executionAggregate,
      session
    );

    applyAggregateSession(
      accountAggregate,
      session
    );

    applyAggregateSession(
      autoSaveAggregate,
      session
    );

    const [
      goalStats,
      contributionStats,
      executionStats,
      accountStats,
      autoSaveStats,
    ] = await Promise.all([
      goalAggregate,
      contributionAggregate,
      executionAggregate,
      accountAggregate,
      autoSaveAggregate,
    ]);

    /* ---------------------------------------------
       GOALS
    --------------------------------------------- */

    const goals = {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      cancelled: 0,
      expired: 0,
    };

    goalStats.forEach(
      (item) => {
        goals.total +=
          item.count;

        if (
          Object.prototype.hasOwnProperty.call(
            goals,
            item._id
          )
        ) {
          goals[item._id] =
            item.count;
        }
      }
    );

    /* ---------------------------------------------
       EXECUTIONS
    --------------------------------------------- */

    const executions = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      processing: 0,
      cancelled: 0,
    };

    executionStats.forEach(
      (item) => {
        executions.total +=
          item.count;

        if (
          Object.prototype.hasOwnProperty.call(
            executions,
            item._id
          )
        ) {
          executions[item._id] =
            item.count;
        }
      }
    );

    /* ---------------------------------------------
       AUTOSAVES
    --------------------------------------------- */

    const autoSaves = {
      total: 0,
      draft: 0,
      active: 0,
      paused: 0,
      completed: 0,
      cancelled: 0,
    };

    autoSaveStats.forEach(
      (item) => {
        autoSaves.total +=
          item.count;

        if (
          Object.prototype.hasOwnProperty.call(
            autoSaves,
            item._id
          )
        ) {
          autoSaves[item._id] =
            item.count;
        }
      }
    );

    /* ---------------------------------------------
       RESULT
    --------------------------------------------- */

    return {
      goals,

      savings: {
        totalSaved:
          Number(
            contributionStats[0]
              ?.totalSaved
          ) || 0,

        contributionCount:
          contributionStats[0]
            ?.contributionCount ||
          0,
      },

      accounts: {
        totalBalance:
          Number(
            accountStats[0]
              ?.totalBalance
          ) || 0,

        accountCount:
          accountStats[0]
            ?.accountCount || 0,
      },

      executions,

      autoSaves,
    };
  };

/* =========================================================
   CHECK SAVING ELIGIBILITY
========================================================= */

/**
 * Determines whether a contribution can currently be
 * applied to a saving goal.
 *
 * This function does NOT create a contribution and does
 * NOT mutate financial data.
 */
export const checkSavingEligibility =
  async ({
    userId,
    goalId,
    amount,
    session = null,
  }) => {
    assertUserId(userId);

    const normalizedAmount =
      normalizeAmount(amount);

    const goal =
      await findUserGoal({
        userId,
        goalId,
        session,
      });

    if (
      ["completed", "cancelled", "expired"].includes(
        goal.status
      )
    ) {
      return {
        eligible: false,
        reason:
          "Saving goal is no longer available",
        remainingAmount: 0,
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          Number(
            goal.currentAmount
          ) || 0,
        goal,
      };
    }

    if (
      goal.status === "paused"
    ) {
      return {
        eligible: false,
        reason:
          "Saving goal is currently paused",
        remainingAmount:
          Math.max(
            (Number(
              goal.targetAmount
            ) || 0) -
              (Number(
                goal.currentAmount
              ) || 0),
            0
          ),
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          Number(
            goal.currentAmount
          ) || 0,
        goal,
      };
    }

    const targetAmount =
      Number(goal.targetAmount) ||
      0;

    const currentAmount =
      Number(
        goal.currentAmount
      ) || 0;

    const remaining =
      Math.max(
        targetAmount -
          currentAmount,
        0
      );

    if (
      remaining <= 0 &&
      goal.goalType === "target"
    ) {
      return {
        eligible: false,
        reason:
          "Saving goal has already reached its target",
        remainingAmount: 0,
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          currentAmount,
        goal,
      };
    }

    const minimum =
      Number(
        goal.minimumContributionAmount
      ) || 0;

    if (
      minimum > 0 &&
      normalizedAmount < minimum
    ) {
      return {
        eligible: false,
        reason:
          "Contribution amount is below the minimum allowed amount",
        remainingAmount: remaining,
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          currentAmount,
        goal,
      };
    }

    const maximum =
      goal.maximumContributionAmount ===
      null
        ? null
        : Number(
            goal.maximumContributionAmount
          );

    if (
      maximum !== null &&
      normalizedAmount > maximum &&
      !goal.allowExtraContributions
    ) {
      return {
        eligible: false,
        reason:
          "Contribution amount exceeds the maximum allowed amount",
        remainingAmount: remaining,
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          currentAmount,
        goal,
      };
    }

    if (
      goal.goalType === "target" &&
      normalizedAmount > remaining &&
      !goal.allowExtraContributions
    ) {
      return {
        eligible: false,
        reason:
          "Contribution would exceed the remaining goal amount",
        remainingAmount: remaining,
        requestedAmount:
          normalizedAmount,
        projectedAmount:
          currentAmount +
          normalizedAmount,
        goal,
      };
    }

    return {
      eligible: true,
      reason: null,
      remainingAmount: remaining,
      requestedAmount:
        normalizedAmount,
      projectedAmount:
        currentAmount +
        normalizedAmount,
      goal,
    };
  };

/* =========================================================
   ERROR EXPORT
========================================================= */

export {
  SavingServiceError,
};