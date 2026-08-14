import mongoose from "mongoose";

import SavingMilestone from "../models/SavingMilestone.js";
import SavingGoal from "../models/SavingsGoal.js";
import SavingContribution from "../models/SavingContribution.js";

/* =========================================================
   CONSTANTS
========================================================= */

const MILESTONE_STATUSES = [
  "locked",
  "active",
  "completed",
  "skipped",
  "cancelled",
];

const MILESTONE_TYPES = [
  "percentage",
  "amount",
  "custom",
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* =========================================================
   ERRORS
========================================================= */

class SavingMilestoneServiceError extends Error {
  constructor(
    message,
    {
      code = "SAVING_MILESTONE_ERROR",
      statusCode = 400,
      details = null,
    } = {}
  ) {
    super(message);

    this.name =
      "SavingMilestoneServiceError";

    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/* =========================================================
   HELPERS
========================================================= */

/**
 * Validate MongoDB ObjectId.
 */
const assertObjectId = (
  value,
  fieldName = "ID"
) => {
  if (
    !value ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new SavingMilestoneServiceError(
      `${fieldName} is invalid`,
      {
        code: "INVALID_ID",
        statusCode: 400,
      }
    );
  }
};

/**
 * Convert value to ObjectId.
 */
const toObjectId = (value) =>
  new mongoose.Types.ObjectId(value);

/**
 * Convert a number safely.
 */
const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/**
 * Clamp percentage between 0 and 100.
 */
const clampPercentage = (value) =>
  Math.min(
    Math.max(toNumber(value), 0),
    100
  );

/**
 * Normalize pagination.
 */
const normalizePagination = ({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
} = {}) => {
  const normalizedPage = Math.max(
    Number(page) || DEFAULT_PAGE,
    1
  );

  const normalizedLimit = Math.min(
    Math.max(
      Number(limit) || DEFAULT_LIMIT,
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

/**
 * Validate session.
 */
const assertSession = (session) => {
  if (!session) {
    throw new SavingMilestoneServiceError(
      "A MongoDB transaction session is required for this operation",
      {
        code: "SESSION_REQUIRED",
        statusCode: 500,
      }
    );
  }
};

/**
 * Execute a callback using an existing session
 * or create a new transaction.
 */
const withTransaction = async (
  session,
  callback
) => {
  if (session) {
    return callback(session);
  }

  const newSession =
    await mongoose.startSession();

  try {
    let result;

    await newSession.withTransaction(
      async () => {
        result = await callback(
          newSession
        );
      }
    );

    return result;
  } finally {
    await newSession.endSession();
  }
};

/* =========================================================
   OWNERSHIP
========================================================= */

/**
 * Find one milestone belonging to the authenticated user.
 */
const findOwnedMilestone = async ({
  milestoneId,
  userId,
  session,
  populate = false,
}) => {
  assertObjectId(
    milestoneId,
    "Milestone ID"
  );

  assertObjectId(
    userId,
    "User ID"
  );

  let query =
    SavingMilestone.findOne({
      _id: milestoneId,
      user: userId,
    });

  if (populate) {
    query = query
      .populate({
        path: "goal",
        select:
          "name targetAmount currentAmount currency status",
      })
      .populate({
        path: "previousMilestone",
        select:
          "name order status targetAmount targetPercentage",
      })
      .populate({
        path: "nextMilestone",
        select:
          "name order status targetAmount targetPercentage",
      });
  }

  if (session) {
    query = query.session(session);
  }

  const milestone =
    await query.exec();

  if (!milestone) {
    throw new SavingMilestoneServiceError(
      "Saving milestone not found",
      {
        code: "MILESTONE_NOT_FOUND",
        statusCode: 404,
      }
    );
  }

  return milestone;
};

/**
 * Verify goal ownership.
 */
const findOwnedGoal = async ({
  goalId,
  userId,
  session,
}) => {
  assertObjectId(
    goalId,
    "Saving goal ID"
  );

  assertObjectId(
    userId,
    "User ID"
  );

  let query =
    SavingGoal.findOne({
      _id: goalId,
      user: userId,
      isDeleted: false,
    });

  if (session) {
    query = query.session(session);
  }

  const goal =
    await query.exec();

  if (!goal) {
    throw new SavingMilestoneServiceError(
      "Saving goal not found",
      {
        code: "GOAL_NOT_FOUND",
        statusCode: 404,
      }
    );
  }

  return goal;
};

/* =========================================================
   MILESTONE TARGET CALCULATION
========================================================= */

/**
 * Resolve the monetary target represented by
 * a milestone.
 *
 * Percentage milestone:
 *
 *   goal target = ₦500,000
 *   milestone = 50%
 *
 *   target = ₦250,000
 */
const resolveMilestoneTarget = ({
  milestone,
  goal,
}) => {
  if (
    milestone.type === "amount"
  ) {
    return Math.max(
      toNumber(
        milestone.targetAmount
      ),
      0
    );
  }

  if (
    milestone.type ===
    "percentage"
  ) {
    return (
      toNumber(
        goal.targetAmount
      ) *
      clampPercentage(
        milestone.targetPercentage
      ) /
      100
    );
  }

  /*
   * Custom milestones may already have
   * a target amount assigned by the model.
   */
  return Math.max(
    toNumber(
      milestone.targetAmount
    ),
    0
  );
};

/**
 * Calculate milestone progress.
 */
const calculateMilestoneProgress = ({
  milestone,
  goal,
}) => {
  const target =
    resolveMilestoneTarget({
      milestone,
      goal,
    });

  const current =
    Math.max(
      toNumber(
        goal.currentAmount
      ),
      0
    );

  if (target <= 0) {
    return {
      targetAmount: 0,
      currentAmount: current,
      progressPercentage: 0,
      reached: false,
    };
  }

  const progress =
    clampPercentage(
      (current / target) *
        100
    );

  return {
    targetAmount: target,
    currentAmount: current,
    progressPercentage:
      Math.round(
        progress * 100
      ) / 100,
    reached:
      current >= target,
  };
};

/* =========================================================
   GET MILESTONES
========================================================= */

/**
 * Get all milestones for a goal.
 */
export const getGoalMilestones =
  async ({
    userId,
    goalId,
    status = null,
    session = null,
  }) => {
    assertObjectId(
      userId,
      "User ID"
    );

    await findOwnedGoal({
      goalId,
      userId,
      session,
    });

    const filter = {
      user: userId,
      goal: goalId,
    };

    if (
      status &&
      MILESTONE_STATUSES.includes(
        status
      )
    ) {
      filter.status = status;
    }

    let query =
      SavingMilestone.find(
        filter
      ).sort({
        order: 1,
        createdAt: 1,
      });

    if (session) {
      query =
        query.session(session);
    }

    return query.exec();
  };

/**
 * Get one milestone.
 */
export const getMilestoneById =
  async ({
    userId,
    milestoneId,
    session = null,
  }) => {
    return findOwnedMilestone({
      milestoneId,
      userId,
      session,
      populate: true,
    });
  };

/**
 * Paginated milestone history.
 */
export const getMilestoneHistory =
  async ({
    userId,
    goalId,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    session = null,
  }) => {
    assertObjectId(
      userId,
      "User ID"
    );

    await findOwnedGoal({
      goalId,
      userId,
      session,
    });

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const filter = {
      user: userId,
      goal: goalId,
    };

    let countQuery =
      SavingMilestone.countDocuments(
        filter
      );

    let dataQuery =
      SavingMilestone.find(
        filter
      )
        .sort({
          order: 1,
          createdAt: 1,
        })
        .skip(pagination.skip)
        .limit(pagination.limit);

    if (session) {
      countQuery =
        countQuery.session(session);

      dataQuery =
        dataQuery.session(session);
    }

    const [
      total,
      milestones,
    ] = await Promise.all([
      countQuery.exec(),
      dataQuery.exec(),
    ]);

    return {
      milestones,
      pagination: {
        page:
          pagination.page,
        limit:
          pagination.limit,
        total,
        totalPages:
          Math.ceil(
            total /
              pagination.limit
          ),
      },
    };
  };

/* =========================================================
   CREATE MILESTONE
========================================================= */

/**
 * Create a milestone.
 *
 * This service does NOT change the goal balance.
 */
export const createMilestone =
  async ({
    userId,
    goalId,
    data,
    session = null,
  }) => {
    assertObjectId(
      userId,
      "User ID"
    );

    const goal =
      await findOwnedGoal({
        goalId,
        userId,
        session,
      });

    const {
      name,
      description = "",
      type = "amount",
      targetAmount = null,
      targetPercentage = null,
      order = 0,
      autoUnlock = true,
      reward = null,
      notifications = {},
      metadata = {},
    } = data || {};

    if (
      !name ||
      String(name).trim().length <
        2
    ) {
      throw new SavingMilestoneServiceError(
        "Milestone name is required",
        {
          code: "INVALID_MILESTONE_NAME",
          statusCode: 400,
        }
      );
    }

    if (
      !MILESTONE_TYPES.includes(
        type
      )
    ) {
      throw new SavingMilestoneServiceError(
        "Invalid milestone type",
        {
          code: "INVALID_MILESTONE_TYPE",
          statusCode: 400,
        }
      );
    }

    if (
      type === "amount" ||
      type === "custom"
    ) {
      if (
        !isFinitePositiveNumber(
          Number(targetAmount)
        )
      ) {
        throw new SavingMilestoneServiceError(
          "Amount milestones require a valid target amount",
          {
            code: "INVALID_TARGET_AMOUNT",
            statusCode: 400,
          }
        );
      }
    }

    if (
      type === "percentage"
    ) {
      const percentage =
        Number(
          targetPercentage
        );

      if (
        !Number.isFinite(
          percentage
        ) ||
        percentage <= 0 ||
        percentage > 100
      ) {
        throw new SavingMilestoneServiceError(
          "Percentage milestones require a value between 0 and 100",
          {
            code: "INVALID_TARGET_PERCENTAGE",
            statusCode: 400,
          }
        );
      }
    }

    const milestone =
      new SavingMilestone({
        user: userId,
        goal: goal._id,

        name:
          String(name).trim(),

        description:
          String(
            description
          ).trim(),

        type,

        targetAmount:
          targetAmount === null
            ? null
            : Number(
                targetAmount
              ),

        targetPercentage:
          targetPercentage === null
            ? null
            : Number(
                targetPercentage
              ),

        order:
          Math.max(
            Number(order) || 0,
            0
          ),

        autoUnlock:
          Boolean(
            autoUnlock
          ),

        status:
          autoUnlock
            ? "active"
            : "locked",

        reward,

        notifications,

        metadata,

        currentAmount:
          Math.max(
            toNumber(
              goal.currentAmount
            ),
            0
          ),

        progressPercentage: 0,

        createdBy: userId,
        updatedBy: userId,
      });

    const progress =
      calculateMilestoneProgress({
        milestone,
        goal,
      });

    milestone.currentAmount =
      progress.currentAmount;

    milestone.progressPercentage =
      progress.progressPercentage;

    if (progress.reached) {
      milestone.status =
        "completed";

      milestone.completedAt =
        new Date();
    }

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   UPDATE MILESTONE
========================================================= */

/**
 * Update milestone configuration.
 *
 * Financial progress itself should be updated through
 * processGoalProgress(), not arbitrary API writes.
 */
export const updateMilestone =
  async ({
    userId,
    milestoneId,
    data,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    if (
      milestone.status ===
        "completed" ||
      milestone.status ===
        "cancelled"
    ) {
      throw new SavingMilestoneServiceError(
        "Completed or cancelled milestones cannot be modified",
        {
          code: "MILESTONE_LOCKED",
          statusCode: 409,
        }
      );
    }

    const allowedFields = [
      "name",
      "description",
      "targetAmount",
      "targetPercentage",
      "autoUnlock",
      "reward",
      "notifications",
      "metadata",
    ];

    for (
      const field of allowedFields
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          data || {},
          field
        )
      ) {
        milestone[field] =
          data[field];
      }
    }

    milestone.updatedBy =
      userId;

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   REFRESH MILESTONE PROGRESS
========================================================= */

/**
 * Recalculate one milestone against the current
 * SavingGoal balance.
 *
 * This does NOT modify the goal.
 */
export const refreshMilestone =
  async ({
    userId,
    milestoneId,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    const goal =
      await findOwnedGoal({
        goalId:
          milestone.goal,
        userId,
        session,
      });

    const progress =
      calculateMilestoneProgress({
        milestone,
        goal,
      });

    milestone.currentAmount =
      progress.currentAmount;

    milestone.progressPercentage =
      progress.progressPercentage;

    if (
      progress.reached &&
      milestone.status !==
        "completed"
    ) {
      milestone.status =
        "completed";

      milestone.completedAt =
        new Date();
    }

    if (
      !progress.reached &&
      milestone.status ===
        "completed"
    ) {
      /*
       * Do not silently reopen a financial milestone.
       *
       * A completed milestone is an immutable achievement
       * unless a dedicated reversal/recalculation process
       * explicitly handles it.
       */
    }

    milestone.updatedBy =
      userId;

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   PROCESS GOAL PROGRESS
========================================================= */

/**
 * Process every milestone belonging to a goal.
 *
 * This is the central milestone orchestration method.
 *
 * It should normally be called after a successful
 * SavingContribution has updated the goal balance.
 */
export const processGoalProgress =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    assertObjectId(
      userId,
      "User ID"
    );

    return withTransaction(
      session,
      async (transactionSession) => {
        const goal =
          await findOwnedGoal({
            goalId,
            userId,
            session:
              transactionSession,
          });

        const milestones =
          await SavingMilestone.find({
            user: userId,
            goal: goal._id,
            status: {
              $nin: [
                "cancelled",
                "skipped",
              ],
            },
          })
            .sort({
              order: 1,
            })
            .session(
              transactionSession
            );

        const completed = [];
        const unlocked = [];

        for (
          let index = 0;
          index <
          milestones.length;
          index += 1
        ) {
          const milestone =
            milestones[index];

          const progress =
            calculateMilestoneProgress({
              milestone,
              goal,
            });

          milestone.currentAmount =
            progress.currentAmount;

          milestone.progressPercentage =
            progress.progressPercentage;

          /*
           * Locked milestone.
           */
          if (
            milestone.status ===
            "locked"
          ) {
            const previous =
              milestones[
                index - 1
              ];

            const previousCompleted =
              !previous ||
              previous.status ===
                "completed";

            if (
              milestone.autoUnlock &&
              previousCompleted
            ) {
              milestone.status =
                "active";

              milestone.unlockedAt =
                milestone.unlockedAt ||
                new Date();

              unlocked.push(
                milestone
              );
            }
          }

          /*
           * Only active milestones can complete.
           */
          if (
            milestone.status ===
              "active" &&
            progress.reached
          ) {
            milestone.status =
              "completed";

            milestone.completedAt =
              milestone.completedAt ||
              new Date();

            completed.push(
              milestone
            );
          }

          milestone.updatedBy =
            userId;

          await milestone.save({
            session:
              transactionSession,
          });
        }

        /*
         * Explicitly connect previous/next milestone
         * relationships by order.
         */
        for (
          let index = 0;
          index <
          milestones.length;
          index += 1
        ) {
          const current =
            milestones[index];

          const previous =
            milestones[index - 1] ||
            null;

          const next =
            milestones[index + 1] ||
            null;

          let changed = false;

          if (
            String(
              current.previousMilestone ||
                ""
            ) !==
            String(
              previous?._id || ""
            )
          ) {
            current.previousMilestone =
              previous?._id ||
              null;

            changed = true;
          }

          if (
            String(
              current.nextMilestone ||
                ""
            ) !==
            String(
              next?._id || ""
            )
          ) {
            current.nextMilestone =
              next?._id ||
              null;

            changed = true;
          }

          if (changed) {
            current.updatedBy =
              userId;

            await current.save({
              session:
                transactionSession,
            });
          }
        }

        /*
         * Return events instead of sending notifications
         * directly from this service.
         *
         * This keeps notification infrastructure decoupled.
         */
        const events = [
          ...completed.map(
            (milestone) => ({
              type:
                "milestone.completed",
              milestoneId:
                milestone._id,
              goalId:
                goal._id,
              userId:
                goal.user,
              reward:
                milestone.reward ||
                null,
            })
          ),

          ...unlocked.map(
            (milestone) => ({
              type:
                "milestone.unlocked",
              milestoneId:
                milestone._id,
              goalId:
                goal._id,
              userId:
                goal.user,
            })
          ),
        ];

        return {
          goal,
          milestones,
          completed,
          unlocked,
          events,
        };
      }
    );
  };

/* =========================================================
   COMPLETE MILESTONE
========================================================= */

/**
 * Explicitly complete a milestone.
 *
 * This should primarily be used by trusted internal
 * services after validating the financial condition.
 */
export const completeMilestone =
  async ({
    userId,
    milestoneId,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    if (
      milestone.status ===
      "completed"
    ) {
      return milestone;
    }

    if (
      [
        "cancelled",
        "skipped",
      ].includes(
        milestone.status
      )
    ) {
      throw new SavingMilestoneServiceError(
        "This milestone cannot be completed",
        {
          code: "INVALID_MILESTONE_STATE",
          statusCode: 409,
        }
      );
    }

    milestone.status =
      "completed";

    milestone.completedAt =
      new Date();

    milestone.progressPercentage =
      100;

    milestone.updatedBy =
      userId;

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   SKIP MILESTONE
========================================================= */

export const skipMilestone =
  async ({
    userId,
    milestoneId,
    reason = null,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        milestone.status
      )
    ) {
      throw new SavingMilestoneServiceError(
        "This milestone cannot be skipped",
        {
          code: "INVALID_MILESTONE_STATE",
          statusCode: 409,
        }
      );
    }

    milestone.status =
      "skipped";

    milestone.skippedAt =
      new Date();

    if (reason) {
      milestone.metadata =
        milestone.metadata ||
        {};

      milestone.metadata.set?.(
        "skipReason",
        reason
      );
    }

    milestone.updatedBy =
      userId;

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   CANCEL MILESTONE
========================================================= */

export const cancelMilestone =
  async ({
    userId,
    milestoneId,
    reason = null,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    if (
      milestone.status ===
      "completed"
    ) {
      throw new SavingMilestoneServiceError(
        "Completed milestones cannot be cancelled",
        {
          code: "MILESTONE_ALREADY_COMPLETED",
          statusCode: 409,
        }
      );
    }

    milestone.status =
      "cancelled";

    milestone.cancelledAt =
      new Date();

    if (reason) {
      milestone.metadata =
        milestone.metadata ||
        {};

      milestone.metadata.set?.(
        "cancellationReason",
        reason
      );
    }

    milestone.updatedBy =
      userId;

    if (session) {
      await milestone.save({
        session,
      });
    } else {
      await milestone.save();
    }

    return milestone;
  };

/* =========================================================
   UNLOCK NEXT MILESTONE
========================================================= */

/**
 * Unlock the next milestone after a milestone completes.
 */
export const unlockNextMilestone =
  async ({
    userId,
    milestoneId,
    session = null,
  }) => {
    const milestone =
      await findOwnedMilestone({
        milestoneId,
        userId,
        session,
      });

    if (
      milestone.status !==
      "completed"
    ) {
      throw new SavingMilestoneServiceError(
        "Only completed milestones can unlock the next milestone",
        {
          code: "MILESTONE_NOT_COMPLETED",
          statusCode: 409,
        }
      );
    }

    if (
      !milestone.nextMilestone
    ) {
      return null;
    }

    const next =
      await findOwnedMilestone({
        milestoneId:
          milestone.nextMilestone,
        userId,
        session,
      });

    if (
      next.status === "locked"
    ) {
      next.status =
        "active";

      next.unlockedAt =
        next.unlockedAt ||
        new Date();

      next.updatedBy =
        userId;

      if (session) {
        await next.save({
          session,
        });
      } else {
        await next.save();
      }
    }

    return next;
  };

/* =========================================================
   DELETE MILESTONE
========================================================= */

/**
 * Milestones are soft-deleted by cancellation rather
 * than physically removed.
 */
export const deleteMilestone =
  async ({
    userId,
    milestoneId,
    session = null,
  }) => {
    return cancelMilestone({
      userId,
      milestoneId,
      reason:
        "Milestone deleted by user",
      session,
    });
  };

/* =========================================================
   SUMMARY
========================================================= */

/**
 * Return a goal-level milestone summary.
 */
export const getMilestoneSummary =
  async ({
    userId,
    goalId,
    session = null,
  }) => {
    assertObjectId(
      userId,
      "User ID"
    );

    const goal =
      await findOwnedGoal({
        goalId,
        userId,
        session,
      });

    let query =
      SavingMilestone.find({
        user: userId,
        goal: goal._id,
      });

    if (session) {
      query =
        query.session(session);
    }

    const milestones =
      await query.exec();

    const total =
      milestones.length;

    const completed =
      milestones.filter(
        (milestone) =>
          milestone.status ===
          "completed"
      ).length;

    const active =
      milestones.filter(
        (milestone) =>
          milestone.status ===
          "active"
      ).length;

    const locked =
      milestones.filter(
        (milestone) =>
          milestone.status ===
          "locked"
      ).length;

    const skipped =
      milestones.filter(
        (milestone) =>
          milestone.status ===
          "skipped"
      ).length;

    const cancelled =
      milestones.filter(
        (milestone) =>
          milestone.status ===
          "cancelled"
      ).length;

    return {
      total,
      completed,
      active,
      locked,
      skipped,
      cancelled,

      completionPercentage:
        total > 0
          ? Math.round(
              (completed /
                total) *
                100 *
                100
            ) / 100
          : 0,

      goalProgressPercentage:
        clampPercentage(
          goal.progressPercentage
        ),
    };
  };

/* =========================================================
   EXPORT
========================================================= */

export default {
  getGoalMilestones,
  getMilestoneById,
  getMilestoneHistory,

  createMilestone,
  updateMilestone,

  refreshMilestone,
  processGoalProgress,

  completeMilestone,
  skipMilestone,
  cancelMilestone,

  unlockNextMilestone,

  deleteMilestone,

  getMilestoneSummary,
};