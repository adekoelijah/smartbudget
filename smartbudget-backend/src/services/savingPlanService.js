// services/savingPlanService.js

import mongoose from "mongoose";

import SavingPlan from "../models/SavingPlan.js";
import SavingGoal from "../models/SavingsGoal.js";
import SavingAccount from "../models/SavingAccount.js";
import SavingContribution from "../models/SavingContribution.js";
import SavingExecution from "../models/SavingExecution.js";
import AutoSave from "../models/AutoSave.js";
import SavingSchedule from "../models/SavingSchedule.js";

/* =========================================================
   CONSTANTS
========================================================= */

const PLAN_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
  "expired",
];

const TERMINAL_STATUSES = [
  "completed",
  "cancelled",
  "expired",
];

const PLAN_TYPES = [
  "fixed_amount",
  "percentage_income",
  "round_up",
  "target_date",
  "flexible",
  "custom",
];

const CONTRIBUTION_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "custom",
];

const CONTRIBUTION_METHODS = [
  "manual",
  "automatic",
  "bank_transfer",
  "wallet",
  "round_up",
  "income_percentage",
];

const COMPLETION_REASONS = [
  "target_reached",
  "target_date_reached",
  "manually_completed",
  "goal_completed",
];

const CANCELLATION_REASONS = [
  "user_cancelled",
  "goal_cancelled",
  "account_closed",
  "financial_difficulty",
  "duplicate_plan",
  "system",
  "other",
];

const VALID_OBJECT_ID = mongoose.Types.ObjectId.isValid;

/* =========================================================
   ERROR CLASS
========================================================= */

class SavingPlanServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVING_PLAN_ERROR"
  ) {
    super(message);

    this.name = "SavingPlanServiceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const assertObjectId = (
  value,
  fieldName = "ID"
) => {
  if (!value || !VALID_OBJECT_ID(value)) {
    throw new SavingPlanServiceError(
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
  assertObjectId(value);

  return value instanceof mongoose.Types.ObjectId
    ? value
    : new mongoose.Types.ObjectId(value);
};

const assertTransaction = (session) => {
  if (!session) {
    throw new SavingPlanServiceError(
      "Database transaction session is required",
      500,
      "TRANSACTION_REQUIRED"
    );
  }
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

const normalizeDate = (
  value,
  fieldName
) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SavingPlanServiceError(
      `${fieldName} must be a valid date`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizePositiveNumber = (
  value,
  fieldName
) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    throw new SavingPlanServiceError(
      `${fieldName} must be greater than zero`,
      400,
      "INVALID_AMOUNT"
    );
  }

  return number;
};

const normalizeOptionalNumber = (
  value,
  fieldName,
  minimum = 0
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < minimum
  ) {
    throw new SavingPlanServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_NUMBER"
    );
  }

  return number;
};

/* =========================================================
   OWNERSHIP
========================================================= */

const findUserPlan = async ({
  userId,
  planId,
  session = null,
}) => {
  assertUserId(userId);
  assertObjectId(planId, "Saving plan ID");

  const query = SavingPlan.findOne({
    _id: planId,
    user: userId,
  });

  if (session) {
    query.session(session);
  }

  const plan = await query;

  if (!plan) {
    throw new SavingPlanServiceError(
      "Saving plan not found",
      404,
      "SAVING_PLAN_NOT_FOUND"
    );
  }

  return plan;
};

/* =========================================================
   GOAL OWNERSHIP
========================================================= */

const findUserGoal = async ({
  userId,
  goalId,
  session = null,
  allowTerminal = false,
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

  if (session) {
    query.session(session);
  }

  const goal = await query;

  if (!goal) {
    throw new SavingPlanServiceError(
      "Saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  if (
    !allowTerminal &&
    ["completed", "cancelled", "expired"].includes(
      goal.status
    )
  ) {
    throw new SavingPlanServiceError(
      "Saving goal is not available for this plan",
      409,
      "GOAL_NOT_AVAILABLE"
    );
  }

  return goal;
};

/* =========================================================
   SAVING ACCOUNT OWNERSHIP
========================================================= */

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

  const query = SavingAccount.findOne({
    _id: accountId,
    user: userId,
  });

  if (session) {
    query.session(session);
  }

  const account = await query;

  if (!account) {
    throw new SavingPlanServiceError(
      "Saving account not found",
      404,
      "SAVING_ACCOUNT_NOT_FOUND"
    );
  }

  return account;
};

/* =========================================================
   DUPLICATE PLAN PROTECTION
========================================================= */

const ensureNoDuplicatePlan = async ({
  userId,
  goalId,
  excludePlanId = null,
  session = null,
}) => {
  const filter = {
    user: userId,
    goal: goalId,
    status: {
      $in: [
        "draft",
        "active",
        "paused",
      ],
    },
  };

  if (excludePlanId) {
    filter._id = {
      $ne: excludePlanId,
    };
  }

  const query = SavingPlan.findOne(
    filter
  );

  if (session) {
    query.session(session);
  }

  const existing = await query;

  if (existing) {
    throw new SavingPlanServiceError(
      "An active saving plan already exists for this goal",
      409,
      "DUPLICATE_SAVING_PLAN"
    );
  }
};

/* =========================================================
   INPUT VALIDATION
========================================================= */

const validatePlanConfiguration = (
  data = {}
) => {
  if (
    data.planType &&
    !PLAN_TYPES.includes(data.planType)
  ) {
    throw new SavingPlanServiceError(
      "Invalid saving plan type",
      400,
      "INVALID_PLAN_TYPE"
    );
  }

  if (
    data.status &&
    !PLAN_STATUSES.includes(data.status)
  ) {
    throw new SavingPlanServiceError(
      "Invalid saving plan status",
      400,
      "INVALID_STATUS"
    );
  }

  if (
    data.contribution?.method &&
    !CONTRIBUTION_METHODS.includes(
      data.contribution.method
    )
  ) {
    throw new SavingPlanServiceError(
      "Invalid contribution method",
      400,
      "INVALID_CONTRIBUTION_METHOD"
    );
  }

  if (
    data.contribution?.frequency &&
    !CONTRIBUTION_FREQUENCIES.includes(
      data.contribution.frequency
    )
  ) {
    throw new SavingPlanServiceError(
      "Invalid contribution frequency",
      400,
      "INVALID_FREQUENCY"
    );
  }

  if (
    data.target?.amount !== undefined
  ) {
    normalizePositiveNumber(
      data.target.amount,
      "Target amount"
    );
  }

  if (
    data.target?.targetDate
  ) {
    normalizeDate(
      data.target.targetDate,
      "Target date"
    );
  }

  if (
    data.period?.startDate
  ) {
    normalizeDate(
      data.period.startDate,
      "Period start date"
    );
  }

  if (
    data.period?.endDate
  ) {
    normalizeDate(
      data.period.endDate,
      "Period end date"
    );
  }

  const startDate =
    normalizeDate(
      data.period?.startDate,
      "Period start date"
    );

  const endDate =
    normalizeDate(
      data.period?.endDate,
      "Period end date"
    );

  if (
    startDate &&
    endDate &&
    endDate < startDate
  ) {
    throw new SavingPlanServiceError(
      "Plan end date cannot be before start date",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  const minimum =
    data.contribution?.minimumAmount;

  const maximum =
    data.contribution?.maximumAmount;

  if (
    minimum !== null &&
    minimum !== undefined &&
    maximum !== null &&
    maximum !== undefined &&
    Number(maximum) < Number(minimum)
  ) {
    throw new SavingPlanServiceError(
      "Maximum contribution cannot be lower than minimum contribution",
      400,
      "INVALID_CONTRIBUTION_LIMITS"
    );
  }

  if (
    data.contribution?.percentage !==
      null &&
    data.contribution?.percentage !==
      undefined
  ) {
    const percentage = Number(
      data.contribution.percentage
    );

    if (
      !Number.isFinite(percentage) ||
      percentage <= 0 ||
      percentage > 100
    ) {
      throw new SavingPlanServiceError(
        "Contribution percentage must be between 0.01 and 100",
        400,
        "INVALID_PERCENTAGE"
      );
    }
  }

  if (
    data.contribution?.amount !==
      null &&
    data.contribution?.amount !==
      undefined
  ) {
    normalizePositiveNumber(
      data.contribution.amount,
      "Contribution amount"
    );
  }

  if (
    data.contribution?.customIntervalDays !==
      null &&
    data.contribution?.customIntervalDays !==
      undefined
  ) {
    normalizePositiveNumber(
      data.contribution.customIntervalDays,
      "Custom contribution interval"
    );
  }
};

/* =========================================================
   CREATE PLAN
========================================================= */

export const createSavingPlan =
  async ({
    userId,
    data,
    session = null,
  }) => {
    assertUserId(userId);

    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new SavingPlanServiceError(
        "Saving plan data is required",
        400,
        "INVALID_INPUT"
      );
    }

    validatePlanConfiguration(data);

    const goal =
      await findUserGoal({
        userId,
        goalId: data.goal,
        session,
      });

    const account =
      await findUserSavingAccount({
        userId,
        accountId:
          data.savingAccount,
        session,
      });

    await ensureNoDuplicatePlan({
      userId,
      goalId: goal._id,
      session,
    });

    const payload = {
      ...data,

      user: userId,

      goal: goal._id,

      savingAccount:
        account._id,

      createdBy: userId,

      updatedBy: userId,

      lastModifiedAt:
        new Date(),
    };

    const [plan] =
      await SavingPlan.create(
        [payload],
        session
          ? { session }
          : undefined
      );

    return plan;
  };

/* =========================================================
   GET PLAN
========================================================= */

export const getSavingPlanById =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    return findUserPlan({
      userId,
      planId,
      session,
    });
  };

/* =========================================================
   GET USER PLANS
========================================================= */

export const getUserSavingPlans =
  async ({
    userId,
    page = 1,
    limit = 20,
    status = null,
    goal = null,
    savingAccount = null,
    automated = null,
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
    };

    if (status) {
      if (
        !PLAN_STATUSES.includes(status)
      ) {
        throw new SavingPlanServiceError(
          "Invalid saving plan status",
          400,
          "INVALID_STATUS"
        );
      }

      filter.status = status;
    }

    if (goal) {
      assertObjectId(
        goal,
        "Saving goal ID"
      );

      filter.goal = goal;
    }

    if (savingAccount) {
      assertObjectId(
        savingAccount,
        "Saving account ID"
      );

      filter.savingAccount =
        savingAccount;
    }

    if (automated !== null) {
      filter[
        "automation.enabled"
      ] = automated === true ||
        automated === "true";
    }

    const query = SavingPlan.find(
      filter
    )
      .sort({
        createdAt: -1,
      })
      .skip(pagination.skip)
      .limit(pagination.limit);

    const countQuery =
      SavingPlan.countDocuments(filter);

    if (session) {
      query.session(session);
      countQuery.session(session);
    }

    const [
      items,
      total,
    ] = await Promise.all([
      query,
      countQuery,
    ]);

    const totalPages =
      Math.ceil(
        total / pagination.limit
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
   UPDATE PLAN
========================================================= */

export const updateSavingPlan =
  async ({
    userId,
    planId,
    updates,
    session = null,
  }) => {
    assertUserId(userId);

    if (
      !updates ||
      typeof updates !== "object"
    ) {
      throw new SavingPlanServiceError(
        "Plan updates are required",
        400,
        "INVALID_INPUT"
      );
    }

    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (
      TERMINAL_STATUSES.includes(
        plan.status
      )
    ) {
      throw new SavingPlanServiceError(
        "Completed, cancelled, or expired plans cannot be modified",
        409,
        "PLAN_TERMINAL"
      );
    }

    validatePlanConfiguration(
      updates
    );

    if (updates.goal) {
      assertObjectId(
        updates.goal,
        "Saving goal ID"
      );

      if (
        String(updates.goal) !==
        String(plan.goal)
      ) {
        await findUserGoal({
          userId,
          goalId: updates.goal,
          session,
        });

        await ensureNoDuplicatePlan({
          userId,
          goalId: updates.goal,
          excludePlanId: plan._id,
          session,
        });
      }
    }

    if (updates.savingAccount) {
      await findUserSavingAccount({
        userId,
        accountId:
          updates.savingAccount,
        session,
      });
    }

    const protectedFields = new Set([
      "_id",
      "user",
      "createdAt",
      "updatedAt",
      "version",
      "progress",
      "metrics",
      "execution",
      "completion",
      "cancellation",
      "pause",
      "createdBy",
    ]);

    for (
      const [key, value]
      of Object.entries(updates)
    ) {
      if (
        !protectedFields.has(key)
      ) {
        plan[key] = value;
      }
    }

    plan.version += 1;
    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   ACTIVATE
========================================================= */

export const activateSavingPlan =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (
      TERMINAL_STATUSES.includes(
        plan.status
      )
    ) {
      throw new SavingPlanServiceError(
        "Terminal plans cannot be activated",
        409,
        "PLAN_TERMINAL"
      );
    }

    if (plan.status === "active") {
      return plan;
    }

    if (
      plan.target?.targetDate &&
      new Date(
        plan.target.targetDate
      ) <= new Date()
    ) {
      throw new SavingPlanServiceError(
        "Plan target date has already passed",
        409,
        "TARGET_DATE_EXPIRED"
      );
    }

    plan.status = "active";

    if (!plan.activatedAt) {
      plan.activatedAt =
        new Date();
    }

    plan.pause.resumeAt =
      new Date();

    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   PAUSE
========================================================= */

export const pauseSavingPlan =
  async ({
    userId,
    planId,
    reason = null,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (plan.status !== "active") {
      throw new SavingPlanServiceError(
        "Only active plans can be paused",
        409,
        "INVALID_STATUS_TRANSITION"
      );
    }

    const now = new Date();

    plan.status = "paused";

    plan.pause.pausedAt = now;

    plan.pause.reason =
      reason || "Paused by user";

    plan.updatedBy = userId;
    plan.lastModifiedAt = now;

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   RESUME
========================================================= */

export const resumeSavingPlan =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (plan.status !== "paused") {
      throw new SavingPlanServiceError(
        "Only paused plans can be resumed",
        409,
        "INVALID_STATUS_TRANSITION"
      );
    }

    const now = new Date();

    if (
      plan.pause.pausedAt
    ) {
      const pausedMilliseconds =
        now.getTime() -
        new Date(
          plan.pause.pausedAt
        ).getTime();

      const pausedDays =
        Math.max(
          pausedMilliseconds /
            (1000 * 60 * 60 * 24),
          0
        );

      plan.pause.totalPausedDays +=
        Number(
          pausedDays.toFixed(2)
        );
    }

    plan.status = "active";

    plan.pause.resumeAt = now;

    plan.pause.reason = null;

    plan.updatedBy = userId;
    plan.lastModifiedAt = now;

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   COMPLETE
========================================================= */

export const completeSavingPlan =
  async ({
    userId,
    planId,
    reason = "manually_completed",
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (
      !COMPLETION_REASONS.includes(
        reason
      )
    ) {
      throw new SavingPlanServiceError(
        "Invalid completion reason",
        400,
        "INVALID_COMPLETION_REASON"
      );
    }

    if (
      plan.status === "cancelled"
    ) {
      throw new SavingPlanServiceError(
        "Cancelled plans cannot be completed",
        409,
        "PLAN_CANCELLED"
      );
    }

    if (
      plan.status === "completed"
    ) {
      return plan;
    }

    const now = new Date();

    plan.status = "completed";

    plan.completion.completedAt =
      now;

    plan.completion.reason =
      reason;

    plan.execution.nextExecutionAt =
      null;

    plan.updatedBy = userId;
    plan.lastModifiedAt = now;

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   CANCEL
========================================================= */

export const cancelSavingPlan =
  async ({
    userId,
    planId,
    reason = "user_cancelled",
    note = null,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (
      !CANCELLATION_REASONS.includes(
        reason
      )
    ) {
      throw new SavingPlanServiceError(
        "Invalid cancellation reason",
        400,
        "INVALID_CANCELLATION_REASON"
      );
    }

    if (
      plan.status === "completed"
    ) {
      throw new SavingPlanServiceError(
        "Completed plans cannot be cancelled",
        409,
        "PLAN_COMPLETED"
      );
    }

    if (
      plan.status === "cancelled"
    ) {
      return plan;
    }

    const now = new Date();

    plan.status = "cancelled";

    plan.cancellation.cancelledAt =
      now;

    plan.cancellation.reason =
      reason;

    plan.cancellation.note =
      note
        ? String(note).slice(0, 500)
        : null;

    plan.execution.nextExecutionAt =
      null;

    plan.updatedBy = userId;
    plan.lastModifiedAt = now;

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   RECALCULATE METRICS
========================================================= */

export const recalculateSavingPlanMetrics =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    const metrics =
      plan.calculateRequiredContribution();

    plan.metrics.requiredContributionPerDay =
      metrics.daily;

    plan.metrics.requiredContributionPerWeek =
      metrics.weekly;

    plan.metrics.requiredContributionPerMonth =
      metrics.monthly;

    plan.metrics.averageContribution =
      plan.progress
        ?.successfulContributionCount > 0
        ? Number(
            (
              plan.progress
                .contributedAmount /
              plan.progress
                .successfulContributionCount
            ).toFixed(2)
          )
        : 0;

    plan.metrics.estimatedTotalContributions =
      plan.contribution?.amount &&
      plan.contribution.amount > 0
        ? Math.ceil(
            metrics.remaining /
              plan.contribution.amount
          )
        : 0;

    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   REFRESH PROGRESS
========================================================= */

/**
 * Rebuilds the cached progress snapshot from
 * completed SavingContribution records.
 *
 * Financial truth remains the contribution records.
 */
export const refreshSavingPlanProgress =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    const match = {
      user: normalizeId(userId),
      savingGoal: normalizeId(
        plan.goal
      ),
      status: "completed",
    };

    const result =
      await SavingContribution.aggregate(
        [
          {
            $match: match,
          },
          {
            $group: {
              _id: null,

              contributedAmount: {
                $sum: "$amount",
              },

              contributionCount: {
                $sum: 1,
              },

              lastContributionAt: {
                $max: "$createdAt",
              },
            },
          },
        ]
      ).session(session || null);

    const snapshot =
      result[0] || {
        contributedAmount: 0,
        contributionCount: 0,
        lastContributionAt:
          null,
      };

    const target =
      Number(
        plan.target?.amount || 0
      );

    const contributed =
      Math.max(
        Number(
          snapshot.contributedAmount || 0
        ),
        0
      );

    plan.progress.contributedAmount =
      contributed;

    plan.progress.remainingAmount =
      Math.max(
        target - contributed,
        0
      );

    plan.progress.percentage =
      target > 0
        ? Math.min(
            Number(
              (
                (contributed /
                  target) *
                100
              ).toFixed(2)
            ),
            100
          )
        : 0;

    plan.progress.contributionCount =
      Number(
        snapshot.contributionCount || 0
      );

    plan.progress.successfulContributionCount =
      Number(
        snapshot.contributionCount || 0
      );

    plan.progress.lastContributionAt =
      snapshot.lastContributionAt ||
      null;

    plan.progress.lastProgressCalculatedAt =
      new Date();

    if (
      contributed >= target &&
      target > 0 &&
      !TERMINAL_STATUSES.includes(
        plan.status
      )
    ) {
      plan.status = "completed";

      plan.completion.completedAt =
        new Date();

      plan.completion.reason =
        "target_reached";

      plan.execution.nextExecutionAt =
        null;
    }

    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   AUTOMATION ATTACHMENT
========================================================= */

export const attachAutomation =
  async ({
    userId,
    planId,
    autoSaveId = null,
    scheduleId = null,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    if (
      TERMINAL_STATUSES.includes(
        plan.status
      )
    ) {
      throw new SavingPlanServiceError(
        "Terminal plans cannot be automated",
        409,
        "PLAN_TERMINAL"
      );
    }

    if (
      !autoSaveId &&
      !scheduleId
    ) {
      throw new SavingPlanServiceError(
        "An AutoSave or SavingSchedule is required",
        400,
        "AUTOMATION_REQUIRED"
      );
    }

    if (autoSaveId) {
      assertObjectId(
        autoSaveId,
        "AutoSave ID"
      );

      const query =
        AutoSave.findOne({
          _id: autoSaveId,
          user: userId,
          savingGoal: plan.goal,
        });

      if (session) {
        query.session(session);
      }

      const autoSave =
        await query;

      if (!autoSave) {
        throw new SavingPlanServiceError(
          "AutoSave configuration not found or does not belong to this goal",
          404,
          "AUTOSAVE_NOT_FOUND"
        );
      }

      plan.automation.autoSave =
        autoSave._id;
    }

    if (scheduleId) {
      assertObjectId(
        scheduleId,
        "Saving schedule ID"
      );

      const query =
        SavingSchedule.findOne({
          _id: scheduleId,
          user: userId,
          savingGoal: plan.goal,
        });

      if (session) {
        query.session(session);
      }

      const schedule =
        await query;

      if (!schedule) {
        throw new SavingPlanServiceError(
          "Saving schedule not found or does not belong to this goal",
          404,
          "SCHEDULE_NOT_FOUND"
        );
      }

      plan.automation.schedule =
        schedule._id;
    }

    plan.automation.enabled =
      true;

    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   DETACH AUTOMATION
========================================================= */

export const detachAutomation =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    plan.automation.enabled =
      false;

    plan.automation.autoSave =
      null;

    plan.automation.schedule =
      null;

    plan.execution.nextExecutionAt =
      null;

    plan.updatedBy = userId;
    plan.lastModifiedAt =
      new Date();

    await plan.save(
      session
        ? { session }
        : undefined
    );

    return plan;
  };

/* =========================================================
   ELIGIBILITY
========================================================= */

export const checkSavingPlanEligibility =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    const reasons = [];

    if (
      plan.status !== "active"
    ) {
      reasons.push(
        "Saving plan is not active"
      );
    }

    if (plan.targetReached) {
      reasons.push(
        "Saving plan target has been reached"
      );
    }

    if (
      plan.isExpired
    ) {
      reasons.push(
        "Saving plan has expired"
      );
    }

    if (
      plan.target?.targetDate &&
      new Date(
        plan.target.targetDate
      ) <= new Date() &&
      !plan.targetReached
    ) {
      reasons.push(
        "Saving plan target date has been reached"
      );
    }

    if (
      plan.automation?.enabled &&
      !plan.automation.autoSave &&
      !plan.automation.schedule
    ) {
      reasons.push(
        "Automation is enabled without a valid automation source"
      );
    }

    return {
      eligible:
        reasons.length === 0,

      reasons,

      plan,
    };
  };

/* =========================================================
   STATISTICS
========================================================= */

export const getSavingPlanStatistics =
  async ({
    userId,
    planId,
    session = null,
  }) => {
    const plan =
      await findUserPlan({
        userId,
        planId,
        session,
      });

    const contributionMatch = {
      user: normalizeId(userId),
      savingGoal: normalizeId(
        plan.goal
      ),
    };

    const executionMatch = {
      user: normalizeId(userId),
    };

    if (
      plan.automation?.schedule
    ) {
      executionMatch.schedule =
        normalizeId(
          plan.automation.schedule
        );
    }

    const [
      contributionStats,
      executionStats,
    ] = await Promise.all([
      SavingContribution.aggregate([
        {
          $match:
            contributionMatch,
        },
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },

            amount: {
              $sum: "$amount",
            },
          },
        },
      ]).session(
        session || null
      ),

      SavingExecution.aggregate([
        {
          $match:
            executionMatch,
        },
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },
      ]).session(
        session || null
      ),
    ]);

    const contributions = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0,
    };

    for (
      const item of contributionStats
    ) {
      contributions.total +=
        item.count;

      if (
        item._id === "completed"
      ) {
        contributions.completed +=
          item.count;

        contributions.totalAmount +=
          Number(item.amount || 0);
      }

      if (
        item._id === "pending"
      ) {
        contributions.pending +=
          item.count;
      }

      if (
        item._id === "failed"
      ) {
        contributions.failed +=
          item.count;
      }

      if (
        item._id === "cancelled"
      ) {
        contributions.cancelled +=
          item.count;
      }
    }

    const executions = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      processing: 0,
      cancelled: 0,
    };

    for (
      const item of executionStats
    ) {
      executions.total +=
        item.count;

      if (
        item._id === "successful"
      ) {
        executions.successful +=
          item.count;
      }

      if (
        item._id === "failed"
      ) {
        executions.failed +=
          item.count;
      }

      if (
        item._id === "pending"
      ) {
        executions.pending +=
          item.count;
      }

      if (
        item._id === "processing"
      ) {
        executions.processing +=
          item.count;
      }

      if (
        item._id === "cancelled"
      ) {
        executions.cancelled +=
          item.count;
      }
    }

    return {
      plan,

      progress: {
        contributedAmount:
          plan.progress
            ?.contributedAmount || 0,

        remainingAmount:
          plan.remainingTarget,

        percentage:
          plan.progressPercentage,

        targetReached:
          plan.targetReached,
      },

      contributions,

      executions,
    };
  };

/* =========================================================
   FIND DUE AUTOMATED PLANS
========================================================= */

/**
 * Used by a background worker/orchestrator.
 *
 * This method ONLY discovers plans that are due.
 * It does not execute money movement.
 */
export const findDueAutomatedPlans =
  async ({
    limit = 100,
    session = null,
  } = {}) => {
    const normalizedLimit =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 100,
          1
        ),
        500
      );

    const now = new Date();

    const query =
      SavingPlan.find({
        status: "active",

        "automation.enabled":
          true,

        "execution.nextExecutionAt":
          {
            $lte: now,
          },
      })
        .sort({
          "execution.nextExecutionAt":
            1,
        })
        .limit(
          normalizedLimit
        );

    if (session) {
      query.session(session);
    }

    return query;
  };

/* =========================================================
   EXPORT ERROR
========================================================= */

export {
  SavingPlanServiceError,
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  createSavingPlan,
  getSavingPlanById,
  getUserSavingPlans,
  updateSavingPlan,

  activateSavingPlan,
  pauseSavingPlan,
  resumeSavingPlan,

  completeSavingPlan,
  cancelSavingPlan,

  recalculateSavingPlanMetrics,
  refreshSavingPlanProgress,

  attachAutomation,
  detachAutomation,

  checkSavingPlanEligibility,
  getSavingPlanStatistics,

  findDueAutomatedPlans,
};
