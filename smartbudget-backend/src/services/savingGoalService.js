import mongoose from "mongoose";

import SavingGoal from "../models/SavingsGoal.js";

const { Types } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const VALID_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "targetAmount",
  "currentAmount",
  "targetDate",
  "priority",
  "status",
  "progressPercentage",
];

/*
 * Fields that users are allowed to modify after creation.
 *
 * Financial ledger fields such as currentAmount are deliberately
 * excluded. They are maintained by the contribution service.
 */
const UPDATABLE_FIELDS = [
  "name",
  "description",
  "category",
  "goalType",
  "priority",
  "targetAmount",
  "currency",
  "startDate",
  "targetDate",
  "contributionFrequency",
  "plannedContributionAmount",
  "minimumContributionAmount",
  "maximumContributionAmount",
  "fundingMethod",
  "automationEnabled",
  "nextContributionDate",
  "allowExtraContributions",
  "notifyOnContribution",
  "notifyOnMilestone",
  "notifyBeforeContribution",
  "icon",
  "color",
  "tags",
];

/* =========================================================
   ERROR HELPERS
========================================================= */

const createError = (
  message,
  statusCode = 400,
  code = "SAVING_GOAL_ERROR"
) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.code = code;

  return error;
};

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const assertObjectId = (value, field = "ID") => {
  if (!Types.ObjectId.isValid(value)) {
    throw createError(
      `Invalid ${field}`,
      400,
      "INVALID_OBJECT_ID"
    );
  }

  return new Types.ObjectId(value);
};

const assertUserId = (userId) =>
  assertObjectId(userId, "user ID");

const normalizePagination = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT
) => {
  const normalizedPage = Math.max(
    Number.parseInt(page, 10) || DEFAULT_PAGE,
    1
  );

  const normalizedLimit = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || DEFAULT_LIMIT,
      1
    ),
    MAX_LIMIT
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip:
      (normalizedPage - 1) *
      normalizedLimit,
  };
};

const normalizeSort = (
  sortBy = "createdAt",
  sortOrder = "desc"
) => {
  const safeSortBy = VALID_SORT_FIELDS.includes(
    sortBy
  )
    ? sortBy
    : "createdAt";

  const safeSortOrder =
    String(sortOrder).toLowerCase() === "asc"
      ? 1
      : -1;

  return {
    [safeSortBy]: safeSortOrder,
  };
};

const normalizeDate = (value, fieldName) => {
  if (value === null || value === undefined) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(
      `${fieldName} must be a valid date`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizeAmount = (
  value,
  fieldName,
  { allowZero = true } = {}
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw createError(
      `${fieldName} must be a valid number`,
      400,
      "INVALID_AMOUNT"
    );
  }

  if (
    allowZero
      ? amount < 0
      : amount <= 0
  ) {
    throw createError(
      `${fieldName} must be ${
        allowZero
          ? "zero or greater"
          : "greater than zero"
      }`,
      400,
      "INVALID_AMOUNT"
    );
  }

  return amount;
};

const sanitizeUpdatePayload = (payload = {}) => {
  const sanitized = {};

  for (const field of UPDATABLE_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        field
      )
    ) {
      sanitized[field] = payload[field];
    }
  }

  return sanitized;
};

/* =========================================================
   GOAL QUERY HELPERS
========================================================= */

const baseGoalFilter = (userId) => ({
  user: assertUserId(userId),
  isDeleted: false,
});

const getOwnedGoalQuery = (
  userId,
  goalId
) => ({
  ...baseGoalFilter(userId),
  _id: assertObjectId(
    goalId,
    "saving goal ID"
  ),
});

/* =========================================================
   GET SINGLE GOAL
========================================================= */

/**
 * Get one saving goal belonging to the authenticated user.
 */
export const getSavingGoal = async ({
  userId,
  goalId,
  session = null,
}) => {
  const query = SavingGoal.findOne(
    getOwnedGoalQuery(userId, goalId)
  );

  if (session) {
    query.session(session);
  }

  const goal = await query;

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
   LIST GOALS
========================================================= */

/**
 * Retrieve a user's saving goals with filtering,
 * sorting and pagination.
 */
export const getSavingGoals = async ({
  userId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  status,
  category,
  priority,
  goalType,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
  includeDeleted = false,
  session = null,
} = {}) => {
  const normalizedUserId =
    assertUserId(userId);

  const pagination =
    normalizePagination(page, limit);

  const filter = {
    user: normalizedUserId,
  };

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (goalType) {
    filter.goalType = goalType;
  }

  if (search) {
    const safeSearch = String(search)
      .trim()
      .slice(0, 100);

    if (safeSearch) {
      filter.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  const sort = normalizeSort(
    sortBy,
    sortOrder
  );

  let findQuery = SavingGoal.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);

  let countQuery =
    SavingGoal.countDocuments(filter);

  if (session) {
    findQuery = findQuery.session(session);
    countQuery = countQuery.session(session);
  }

  const [goals, total] =
    await Promise.all([
      findQuery,
      countQuery,
    ]);

  return {
    goals,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(
        total / pagination.limit
      ),
      hasNextPage:
        pagination.page <
        Math.ceil(
          total / pagination.limit
        ),
      hasPreviousPage:
        pagination.page > 1,
    },
  };
};

/* =========================================================
   CREATE GOAL
========================================================= */

/**
 * Create a new saving goal.
 *
 * This method intentionally does not create a contribution.
 */
export const createSavingGoal = async ({
  userId,
  data,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  if (!data || typeof data !== "object") {
    throw createError(
      "Goal data is required",
      400,
      "INVALID_GOAL_DATA"
    );
  }

  const payload = {
    user: normalizedUserId,

    name: data.name,
    description: data.description,
    category: data.category,
    goalType: data.goalType,
    priority: data.priority,

    targetAmount:
      normalizeAmount(
        data.targetAmount,
        "Target amount",
        { allowZero: false }
      ),

    currency:
      data.currency || "NGN",

    startDate:
      normalizeDate(
        data.startDate,
        "Start date"
      ) || new Date(),

    targetDate:
      normalizeDate(
        data.targetDate,
        "Target date"
      ),

    contributionFrequency:
      data.contributionFrequency,

    plannedContributionAmount:
      normalizeAmount(
        data.plannedContributionAmount,
        "Planned contribution amount"
      ),

    minimumContributionAmount:
      normalizeAmount(
        data.minimumContributionAmount,
        "Minimum contribution amount"
      ),

    maximumContributionAmount:
      normalizeAmount(
        data.maximumContributionAmount,
        "Maximum contribution amount"
      ),

    fundingMethod:
      data.fundingMethod,

    automationEnabled:
      Boolean(data.automationEnabled),

    nextContributionDate:
      normalizeDate(
        data.nextContributionDate,
        "Next contribution date"
      ),

    allowExtraContributions:
      data.allowExtraContributions,

    notifyOnContribution:
      data.notifyOnContribution,

    notifyOnMilestone:
      data.notifyOnMilestone,

    notifyBeforeContribution:
      data.notifyBeforeContribution,

    icon: data.icon,
    color: data.color,
    tags: Array.isArray(data.tags)
      ? data.tags
      : undefined,

    createdBy: normalizedUserId,
    updatedBy: normalizedUserId,
  };

  /*
   * Remove undefined values so Mongoose defaults
   * can operate normally.
   */
  Object.keys(payload).forEach(
    (key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    }
  );

  const goal = new SavingGoal(payload);

  if (session) {
    goal.$session(session);
  }

  await goal.save();

  return goal;
};

/* =========================================================
   UPDATE GOAL
========================================================= */

/**
 * Update goal configuration.
 *
 * IMPORTANT:
 * currentAmount is intentionally NOT accepted.
 *
 * Money movement belongs to SavingContributionService.
 */
export const updateSavingGoal = async ({
  userId,
  goalId,
  data,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const normalizedGoalId =
    assertObjectId(
      goalId,
      "saving goal ID"
    );

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId: normalizedGoalId,
      session,
    });

  if (
    ["cancelled", "completed"].includes(
      goal.status
    )
  ) {
    throw createError(
      `A ${goal.status} goal cannot be edited`,
      409,
      "GOAL_NOT_EDITABLE"
    );
  }

  const updates =
    sanitizeUpdatePayload(data);

  /*
   * Normalize numeric fields.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "targetAmount"
    )
  ) {
    updates.targetAmount =
      normalizeAmount(
        updates.targetAmount,
        "Target amount",
        { allowZero: false }
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "plannedContributionAmount"
    )
  ) {
    updates.plannedContributionAmount =
      normalizeAmount(
        updates.plannedContributionAmount,
        "Planned contribution amount"
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "minimumContributionAmount"
    )
  ) {
    updates.minimumContributionAmount =
      normalizeAmount(
        updates.minimumContributionAmount,
        "Minimum contribution amount"
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "maximumContributionAmount"
    )
  ) {
    updates.maximumContributionAmount =
      normalizeAmount(
        updates.maximumContributionAmount,
        "Maximum contribution amount"
      );
  }

  /*
   * Normalize dates.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "startDate"
    )
  ) {
    updates.startDate =
      normalizeDate(
        updates.startDate,
        "Start date"
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "targetDate"
    )
  ) {
    updates.targetDate =
      normalizeDate(
        updates.targetDate,
        "Target date"
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      "nextContributionDate"
    )
  ) {
    updates.nextContributionDate =
      normalizeDate(
        updates.nextContributionDate,
        "Next contribution date"
      );
  }

  /*
   * Validate date relationships using the
   * resulting values, not only the incoming payload.
   */
  const resultingStartDate =
    updates.startDate ??
    goal.startDate;

  const resultingTargetDate =
    updates.targetDate ??
    goal.targetDate;

  if (
    resultingStartDate &&
    resultingTargetDate &&
    new Date(resultingTargetDate) <=
      new Date(resultingStartDate)
  ) {
    throw createError(
      "Target date must be after the start date",
      400,
      "INVALID_GOAL_DATE_RANGE"
    );
  }

  /*
   * Validate contribution limits.
   */
  const resultingMinimum =
    updates.minimumContributionAmount ??
    goal.minimumContributionAmount ??
    0;

  const resultingMaximum =
    updates.maximumContributionAmount ??
    goal.maximumContributionAmount;

  if (
    resultingMaximum !== null &&
    resultingMaximum !== undefined &&
    resultingMinimum > resultingMaximum
  ) {
    throw createError(
      "Maximum contribution cannot be less than minimum contribution",
      400,
      "INVALID_CONTRIBUTION_RANGE"
    );
  }

  Object.assign(goal, updates);

  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   PAUSE GOAL
========================================================= */

export const pauseSavingGoal = async ({
  userId,
  goalId,
  reason = "",
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId,
      session,
    });

  if (goal.status !== "active") {
    throw createError(
      "Only active saving goals can be paused",
      409,
      "INVALID_GOAL_STATUS"
    );
  }

  goal.pause();

  if (reason) {
    goal.pauseReason = String(reason)
      .trim()
      .slice(0, 500);
  }

  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   RESUME GOAL
========================================================= */

export const resumeSavingGoal = async ({
  userId,
  goalId,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId,
      session,
    });

  if (goal.status !== "paused") {
    throw createError(
      "Only paused saving goals can be resumed",
      409,
      "INVALID_GOAL_STATUS"
    );
  }

  goal.resume();

  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   CANCEL GOAL
========================================================= */

export const cancelSavingGoal = async ({
  userId,
  goalId,
  reason = "",
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId,
      session,
    });

  if (
    ["completed", "cancelled"].includes(
      goal.status
    )
  ) {
    throw createError(
      "This saving goal cannot be cancelled",
      409,
      "INVALID_GOAL_STATUS"
    );
  }

  goal.cancel();

  if (reason) {
    goal.cancellationReason =
      String(reason)
        .trim()
        .slice(0, 500);
  }

  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   SOFT DELETE
========================================================= */

/**
 * Soft delete a goal.
 *
 * Financial records are NOT deleted.
 */
export const deleteSavingGoal = async ({
  userId,
  goalId,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId,
      session,
    });

  if (goal.status === "active") {
    throw createError(
      "Active saving goals cannot be deleted. Pause or cancel the goal first.",
      409,
      "ACTIVE_GOAL_CANNOT_BE_DELETED"
    );
  }

  goal.softDelete();

  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   RESTORE GOAL
========================================================= */

export const restoreSavingGoal = async ({
  userId,
  goalId,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const goalIdObject =
    assertObjectId(
      goalId,
      "saving goal ID"
    );

  const query = SavingGoal.findOne({
    user: normalizedUserId,
    _id: goalIdObject,
    isDeleted: true,
  });

  if (session) {
    query.session(session);
  }

  const goal = await query;

  if (!goal) {
    throw createError(
      "Deleted saving goal not found",
      404,
      "SAVING_GOAL_NOT_FOUND"
    );
  }

  goal.isDeleted = false;
  goal.deletedAt = null;
  goal.updatedBy =
    normalizedUserId;

  await goal.save();

  return goal;
};

/* =========================================================
   SET PRIMARY GOAL
========================================================= */

/**
 * Make one goal the user's primary goal.
 *
 * This operation should ideally be executed inside a
 * MongoDB transaction when the application has a session.
 *
 * The SavingGoal schema should additionally have a
 * partial unique index on:
 *
 * { user: 1, isPrimary: 1 }
 *
 * for active/non-deleted primary goals.
 */
export const setPrimarySavingGoal = async ({
  userId,
  goalId,
  session = null,
}) => {
  const normalizedUserId =
    assertUserId(userId);

  const normalizedGoalId =
    assertObjectId(
      goalId,
      "saving goal ID"
    );

  const goal =
    await getSavingGoal({
      userId: normalizedUserId,
      goalId: normalizedGoalId,
      session,
    });

  if (
    ["cancelled", "expired"].includes(
      goal.status
    )
  ) {
    throw createError(
      "Cancelled or expired goals cannot be primary goals",
      409,
      "INVALID_PRIMARY_GOAL"
    );
  }

  const clearPrimaryQuery =
    SavingGoal.updateMany(
      {
        user: normalizedUserId,
        _id: {
          $ne: normalizedGoalId,
        },
        isDeleted: false,
        isPrimary: true,
      },
      {
        $set: {
          isPrimary: false,
          updatedBy: normalizedUserId,
        },
      }
    );

  if (session) {
    clearPrimaryQuery.session(session);
  }

  await clearPrimaryQuery;

  const updateQuery =
    SavingGoal.findOneAndUpdate(
      {
        user: normalizedUserId,
        _id: normalizedGoalId,
        isDeleted: false,
      },
      {
        $set: {
          isPrimary: true,
          updatedBy: normalizedUserId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (session) {
    updateQuery.session(session);
  }

  return updateQuery;
};

/* =========================================================
   REMOVE PRIMARY STATUS
========================================================= */

export const removePrimarySavingGoal =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    const normalizedUserId =
      assertUserId(userId);

    const normalizedGoalId =
      assertObjectId(
        goalId,
        "saving goal ID"
      );

    const query =
      SavingGoal.findOneAndUpdate(
        {
          user: normalizedUserId,
          _id: normalizedGoalId,
          isDeleted: false,
        },
        {
          $set: {
            isPrimary: false,
            updatedBy: normalizedUserId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (session) {
      query.session(session);
    }

    const goal = await query;

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
   GET PRIMARY GOAL
========================================================= */

export const getPrimarySavingGoal =
  async ({
    userId,
    session = null,
  }) => {
    const normalizedUserId =
      assertUserId(userId);

    const query =
      SavingGoal.findOne({
        user: normalizedUserId,
        isPrimary: true,
        isDeleted: false,
      });

    if (session) {
      query.session(session);
    }

    return query;
  };

/* =========================================================
   GOAL PROGRESS
========================================================= */

/**
 * Calculate goal intelligence without mutating
 * the financial ledger.
 */
export const getSavingGoalProgress =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    const goal =
      await getSavingGoal({
        userId,
        goalId,
        session,
      });

    const targetAmount =
      Number(goal.targetAmount || 0);

    const currentAmount =
      Number(goal.currentAmount || 0);

    const remainingAmount =
      Math.max(
        targetAmount -
          currentAmount,
        0
      );

    const percentage =
      targetAmount > 0
        ? Math.min(
            Math.round(
              (currentAmount /
                targetAmount) *
                10000
            ) / 100,
            100
          )
        : 0;

    const now = new Date();

    const targetDate =
      goal.targetDate
        ? new Date(goal.targetDate)
        : null;

    const startDate =
      goal.startDate
        ? new Date(goal.startDate)
        : null;

    const daysRemaining =
      targetDate
        ? Math.max(
            Math.ceil(
              (targetDate.getTime() -
                now.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            0
          )
        : null;

    const totalDurationDays =
      startDate && targetDate
        ? Math.max(
            Math.ceil(
              (targetDate.getTime() -
                startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            0
          )
        : null;

    const requiredDailyAmount =
      daysRemaining > 0
        ? Math.round(
            (remainingAmount /
              daysRemaining) *
              100
          ) / 100
        : remainingAmount;

    const requiredWeeklyAmount =
      Math.round(
        requiredDailyAmount * 7 * 100
      ) / 100;

    const requiredMonthlyAmount =
      Math.round(
        requiredDailyAmount *
          30.4375 *
          100
      ) / 100;

    const isCompleted =
      currentAmount >=
        targetAmount &&
      targetAmount > 0;

    const isOverdue =
      Boolean(
        targetDate &&
          now > targetDate &&
          !isCompleted &&
          !["cancelled"].includes(
            goal.status
          )
      );

    let expectedProgress = 0;

    if (
      startDate &&
      targetDate &&
      totalDurationDays > 0
    ) {
      const elapsedDays =
        Math.min(
          Math.max(
            Math.ceil(
              (now.getTime() -
                startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            0
          ),
          totalDurationDays
        );

      expectedProgress =
        Math.round(
          (elapsedDays /
            totalDurationDays) *
            10000
        ) / 100;
    }

    const isOnTrack =
      !isOverdue &&
      percentage >= expectedProgress;

    return {
      goalId: goal._id,

      targetAmount,
      currentAmount,
      remainingAmount,

      progressPercentage:
        percentage,

      expectedProgressPercentage:
        expectedProgress,

      daysRemaining,

      requiredDailyAmount,
      requiredWeeklyAmount,
      requiredMonthlyAmount,

      isCompleted,
      isOverdue,
      isOnTrack,

      status: goal.status,
      targetDate: goal.targetDate,
    };
  };

/* =========================================================
   COMPLETE GOAL
========================================================= */

/**
 * Explicitly complete a goal.
 *
 * Normally the contribution/goal reconciliation process
 * should automatically complete a goal when its target
 * is reached.
 */
export const completeSavingGoal =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    const normalizedUserId =
      assertUserId(userId);

    const goal =
      await getSavingGoal({
        userId: normalizedUserId,
        goalId,
        session,
      });

    if (goal.status === "cancelled") {
      throw createError(
        "Cancelled goals cannot be completed",
        409,
        "INVALID_GOAL_STATUS"
      );
    }

    if (
      Number(goal.currentAmount || 0) <
      Number(goal.targetAmount || 0)
    ) {
      throw createError(
        "Goal cannot be completed before reaching its target",
        409,
        "TARGET_NOT_REACHED"
      );
    }

    goal.status = "completed";

    if (!goal.completedAt) {
      goal.completedAt = new Date();
    }

    goal.updatedBy =
      normalizedUserId;

    await goal.save();

    return goal;
  };

/* =========================================================
   EXPIRE GOAL
========================================================= */

/**
 * Expire an unfinished goal whose target date has passed.
 *
 * This is useful for a scheduled background worker.
 */
export const expireSavingGoal =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    const normalizedUserId =
      assertUserId(userId);

    const goal =
      await getSavingGoal({
        userId: normalizedUserId,
        goalId,
        session,
      });

    if (
      ["completed", "cancelled"].includes(
        goal.status
      )
    ) {
      return goal;
    }

    if (
      !goal.targetDate ||
      new Date() <=
        new Date(goal.targetDate)
    ) {
      throw createError(
        "Saving goal has not reached its target date",
        409,
        "GOAL_NOT_EXPIRED"
      );
    }

    goal.status = "expired";
    goal.updatedBy =
      normalizedUserId;

    await goal.save();

    return goal;
  };

/* =========================================================
   GET GOAL SUMMARY
========================================================= */

/**
 * Lightweight summary for dashboard widgets.
 */
export const getSavingGoalSummary =
  async ({
    userId,
    session = null,
  }) => {
    const normalizedUserId =
      assertUserId(userId);

    const filter = {
      user: normalizedUserId,
      isDeleted: false,
    };

    const query =
      SavingGoal.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: null,

            totalGoals: {
              $sum: 1,
            },

            activeGoals: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "active",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            completedGoals: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            pausedGoals: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "paused",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalTargetAmount: {
              $sum: "$targetAmount",
            },

            totalCurrentAmount: {
              $sum: "$currentAmount",
            },
          },
        },
      ]);

    if (session) {
      query.session(session);
    }

    const [result] = await query;

    if (!result) {
      return {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        pausedGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        totalRemainingAmount: 0,
        overallProgressPercentage: 0,
      };
    }

    const totalTargetAmount =
      Number(
        result.totalTargetAmount || 0
      );

    const totalCurrentAmount =
      Number(
        result.totalCurrentAmount || 0
      );

    const totalRemainingAmount =
      Math.max(
        totalTargetAmount -
          totalCurrentAmount,
        0
      );

    const overallProgressPercentage =
      totalTargetAmount > 0
        ? Math.min(
            Math.round(
              (totalCurrentAmount /
                totalTargetAmount) *
                10000
            ) / 100,
            100
          )
        : 0;

    return {
      totalGoals:
        result.totalGoals || 0,

      activeGoals:
        result.activeGoals || 0,

      completedGoals:
        result.completedGoals || 0,

      pausedGoals:
        result.pausedGoals || 0,

      totalTargetAmount,

      totalCurrentAmount,

      totalRemainingAmount,

      overallProgressPercentage,
    };
  };

/* =========================================================
   FIND ACTIVE GOALS
========================================================= */

/**
 * Used by background workers and automation services.
 */
export const getActiveSavingGoals =
  async ({
    userId,
    session = null,
  }) => {
    const filter = {
      ...baseGoalFilter(userId),
      status: "active",
    };

    const query =
      SavingGoal.find(filter).sort({
        targetDate: 1,
      });

    if (session) {
      query.session(session);
    }

    return query;
  };

/* =========================================================
   EXPORT DEFAULT
========================================================= */

const savingGoalService = {
  createSavingGoal,
  getSavingGoal,
  getSavingGoals,
  updateSavingGoal,

  pauseSavingGoal,
  resumeSavingGoal,
  cancelSavingGoal,

  deleteSavingGoal,
  restoreSavingGoal,

  setPrimarySavingGoal,
  removePrimarySavingGoal,
  getPrimarySavingGoal,

  getSavingGoalProgress,
  getSavingGoalSummary,

  completeSavingGoal,
  expireSavingGoal,

  getActiveSavingGoals,
};

export default savingGoalService;