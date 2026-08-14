import mongoose from "mongoose";

const { Schema } = mongoose;

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SAVING MILESTONE SCHEMA
|--------------------------------------------------------------------------
|
| A SavingMilestone represents a measurable checkpoint inside a
| SavingGoal.
|
| Example:
|
| SavingGoal
|   Target: ₦500,000
|
| SavingMilestones
|   20%  → ₦100,000
|   40%  → ₦200,000
|   60%  → ₦300,000
|   80%  → ₦400,000
|   100% → ₦500,000
|
|--------------------------------------------------------------------------
*/

const SavingMilestoneSchema = new Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SAVING GOAL
    |--------------------------------------------------------------------------
    */

    goal: {
      type: Schema.Types.ObjectId,
      ref: "SavingGoal",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | MILESTONE NAME
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Milestone name is too short"],
      maxlength: [120, "Milestone name cannot exceed 120 characters"],
    },

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Milestone description cannot exceed 500 characters"],
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | MILESTONE TYPE
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: MILESTONE_TYPES,
      default: "amount",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TARGET AMOUNT
    |--------------------------------------------------------------------------
    |
    | The amount required for this milestone to be considered complete.
    |
    */

    targetAmount: {
      type: Number,
      required: true,
      min: [0.01, "Milestone target amount must be greater than zero"],
    },

    /*
    |--------------------------------------------------------------------------
    | CURRENCY
    |--------------------------------------------------------------------------
    */

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TARGET PERCENTAGE
    |--------------------------------------------------------------------------
    |
    | Optional percentage representation of the parent goal.
    |
    | Example:
    |
    | targetAmount = ₦100,000
    | goal target = ₦500,000
    | percentage = 20
    |
    */

    targetPercentage: {
      type: Number,
      min: [0, "Target percentage cannot be negative"],
      max: [100, "Target percentage cannot exceed 100"],
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CURRENT AMOUNT
    |--------------------------------------------------------------------------
    |
    | Denormalized progress value.
    |
    | This should be updated by the SmartSave service whenever a
    | successful SavingContribution is applied.
    |
    */

    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },

    /*
    |--------------------------------------------------------------------------
    | PROGRESS
    |--------------------------------------------------------------------------
    |
    | Cached percentage for fast dashboard rendering.
    |
    */

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER
    |--------------------------------------------------------------------------
    |
    | Determines the order in which milestones appear and can be unlocked.
    |
    */

    order: {
      type: Number,
      required: true,
      min: [1, "Milestone order must start from 1"],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: "locked",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AUTO UNLOCK
    |--------------------------------------------------------------------------
    |
    | If true, completing the previous milestone automatically unlocks
    | this milestone.
    |
    */

    autoUnlock: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | UNLOCKED AT
    |--------------------------------------------------------------------------
    */

    unlockedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | COMPLETED AT
    |--------------------------------------------------------------------------
    */

    completedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | SKIPPED AT
    |--------------------------------------------------------------------------
    */

    skippedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CANCELLED AT
    |--------------------------------------------------------------------------
    */

    cancelledAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | PREVIOUS MILESTONE
    |--------------------------------------------------------------------------
    |
    | Used when milestones form a sequential progression.
    |
    */

    previousMilestone: {
      type: Schema.Types.ObjectId,
      ref: "SavingMilestone",
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | NEXT MILESTONE
    |--------------------------------------------------------------------------
    */

    nextMilestone: {
      type: Schema.Types.ObjectId,
      ref: "SavingMilestone",
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | REWARD
    |--------------------------------------------------------------------------
    |
    | Allows SmartSave to support gamification without changing the
    | financial model.
    |
    */

    reward: {
      enabled: {
        type: Boolean,
        default: false,
      },

      title: {
        type: String,
        trim: true,
        maxlength: 120,
        default: null,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 300,
        default: null,
      },

      points: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION SETTINGS
    |--------------------------------------------------------------------------
    */

    notifications: {
      onUnlock: {
        type: Boolean,
        default: true,
      },

      onCompletion: {
        type: Boolean,
        default: true,
      },

      reminderBeforeCompletion: {
        type: Boolean,
        default: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | COMPLETION NOTIFICATION
    |--------------------------------------------------------------------------
    |
    | Prevents duplicate milestone completion notifications.
    |
    */

    completionNotificationSent: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | METADATA
    |--------------------------------------------------------------------------
    */

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    /*
    |--------------------------------------------------------------------------
    | AUDIT
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,

    strict: true,

    minimize: false,

    versionKey: "__v",
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

/*
 * Retrieve all milestones for a goal in the correct order.
 */
SavingMilestoneSchema.index({
  goal: 1,
  order: 1,
});

/*
 * Retrieve user's milestones.
 */
SavingMilestoneSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Find active milestones.
 */
SavingMilestoneSchema.index({
  goal: 1,
  status: 1,
});

/*
 * Find incomplete milestones.
 */
SavingMilestoneSchema.index({
  goal: 1,
  progressPercentage: 1,
});

/*
|--------------------------------------------------------------------------
| UNIQUE MILESTONE ORDER
|--------------------------------------------------------------------------
|
| A goal should not contain two milestones with the same order.
|
*/

SavingMilestoneSchema.index(
  {
    goal: 1,
    order: 1,
  },
  {
    unique: true,
    name: "unique_goal_milestone_order",
  }
);

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

/*
 * Normalize progress before validation.
 */
SavingMilestoneSchema.pre(
  "validate",
  function (next) {
    if (this.targetAmount > 0) {
      const calculatedProgress =
        (this.currentAmount /
          this.targetAmount) *
        100;

      this.progressPercentage =
        Math.min(
          100,
          Math.max(
            0,
            Number(
              calculatedProgress.toFixed(2)
            )
          )
        );
    } else {
      this.progressPercentage = 0;
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| STATUS VALIDATION
|--------------------------------------------------------------------------
*/

SavingMilestoneSchema.pre(
  "validate",
  function (next) {
    /*
     * Completed milestone must have completedAt.
     */
    if (
      this.status === "completed" &&
      !this.completedAt
    ) {
      this.completedAt = new Date();
    }

    /*
     * Active milestone must have unlockedAt.
     */
    if (
      this.status === "active" &&
      !this.unlockedAt
    ) {
      this.unlockedAt = new Date();
    }

    /*
     * Skipped milestone.
     */
    if (
      this.status === "skipped" &&
      !this.skippedAt
    ) {
      this.skippedAt = new Date();
    }

    /*
     * Cancelled milestone.
     */
    if (
      this.status === "cancelled" &&
      !this.cancelledAt
    ) {
      this.cancelledAt = new Date();
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| COMPLETION VALIDATION
|--------------------------------------------------------------------------
*/

SavingMilestoneSchema.pre(
  "validate",
  function (next) {
    if (
      this.currentAmount >=
        this.targetAmount &&
      this.status !== "cancelled" &&
      this.status !== "skipped"
    ) {
      this.currentAmount =
        this.targetAmount;

      this.progressPercentage = 100;

      this.status = "completed";

      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

/**
 * Calculate current milestone progress.
 */
SavingMilestoneSchema.methods.calculateProgress =
  function () {
    if (this.targetAmount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Number(
        (
          (this.currentAmount /
            this.targetAmount) *
          100
        ).toFixed(2)
      )
    );
  };

/**
 * Check whether milestone is complete.
 */
SavingMilestoneSchema.methods.isCompleted =
  function () {
    return (
      this.status === "completed" ||
      this.currentAmount >=
        this.targetAmount
    );
  };

/**
 * Check whether milestone can receive contributions.
 */
SavingMilestoneSchema.methods.canReceiveContribution =
  function () {
    return [
      "active",
      "locked",
    ].includes(this.status);
  };

/**
 * Calculate remaining amount.
 */
SavingMilestoneSchema.methods.getRemainingAmount =
  function () {
    return Math.max(
      0,
      this.targetAmount -
        this.currentAmount
    );
  };

/**
 * Apply a successful contribution.
 *
 * IMPORTANT:
 * This method should only be called from the
 * SavingContribution service after the contribution
 * has been successfully created/confirmed.
 */
SavingMilestoneSchema.methods.applyContribution =
  function (amount) {
    const contributionAmount =
      Number(amount);

    if (
      !Number.isFinite(
        contributionAmount
      ) ||
      contributionAmount <= 0
    ) {
      throw new Error(
        "Contribution amount must be greater than zero"
      );
    }

    if (
      this.status === "cancelled" ||
      this.status === "skipped"
    ) {
      throw new Error(
        "Cannot contribute to this milestone"
      );
    }

    this.currentAmount +=
      contributionAmount;

    /*
     * Never allow the displayed milestone progress
     * to exceed the target.
     */
    if (
      this.currentAmount >=
      this.targetAmount
    ) {
      this.currentAmount =
        this.targetAmount;

      this.progressPercentage = 100;

      this.status = "completed";

      this.completedAt =
        this.completedAt ||
        new Date();
    } else {
      this.progressPercentage =
        this.calculateProgress();
    }

    return this;
  };

/**
 * Unlock milestone.
 */
SavingMilestoneSchema.methods.unlock =
  function () {
    if (
      this.status !== "locked"
    ) {
      return this;
    }

    this.status = "active";

    this.unlockedAt =
      this.unlockedAt ||
      new Date();

    return this;
  };

/**
 * Skip milestone.
 */
SavingMilestoneSchema.methods.skip =
  function () {
    if (
      this.status === "completed"
    ) {
      throw new Error(
        "Completed milestones cannot be skipped"
      );
    }

    this.status = "skipped";

    this.skippedAt =
      new Date();

    return this;
  };

/**
 * Cancel milestone.
 */
SavingMilestoneSchema.methods.cancel =
  function () {
    if (
      this.status === "completed"
    ) {
      throw new Error(
        "Completed milestones cannot be cancelled"
      );
    }

    this.status = "cancelled";

    this.cancelledAt =
      new Date();

    return this;
  };

/**
 * Get safe progress information.
 */
SavingMilestoneSchema.methods.getProgress =
  function () {
    return {
      targetAmount:
        this.targetAmount,

      currentAmount:
        this.currentAmount,

      remainingAmount:
        this.getRemainingAmount(),

      progressPercentage:
        this.calculateProgress(),

      status:
        this.status,

      completed:
        this.isCompleted(),
    };
  };

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

/**
 * Get all milestones belonging to a goal.
 */
SavingMilestoneSchema.statics.findByGoal =
  function (
    goalId,
    {
      includeInactive = true,
    } = {}
  ) {
    const query = {
      goal: goalId,
    };

    if (!includeInactive) {
      query.status = {
        $nin: [
          "cancelled",
          "skipped",
        ],
      };
    }

    return this.find(query)
      .sort({
        order: 1,
      });
  };

/**
 * Get the currently active milestone.
 */
SavingMilestoneSchema.statics.findActive =
  function (goalId) {
    return this.findOne({
      goal: goalId,
      status: "active",
    }).sort({
      order: 1,
    });
  };

/**
 * Get the next incomplete milestone.
 */
SavingMilestoneSchema.statics.findNext =
  function (goalId) {
    return this.findOne({
      goal: goalId,
      status: {
        $in: [
          "locked",
          "active",
        ],
      },
    }).sort({
      order: 1,
    });
  };

/**
 * Count completed milestones.
 */
SavingMilestoneSchema.statics.countCompleted =
  function (goalId) {
    return this.countDocuments({
      goal: goalId,
      status: "completed",
    });
  };

/**
 * Get milestone summary.
 */
SavingMilestoneSchema.statics.getSummary =
  async function (goalId) {
    const milestones =
      await this.find({
        goal: goalId,
      }).lean();

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
          milestone.status === "active"
      ).length;

    const skipped =
      milestones.filter(
        (milestone) =>
          milestone.status === "skipped"
      ).length;

    const cancelled =
      milestones.filter(
        (milestone) =>
          milestone.status === "cancelled"
      ).length;

    const totalTarget =
      milestones.reduce(
        (sum, milestone) =>
          sum +
          Number(
            milestone.targetAmount || 0
          ),
        0
      );

    const totalSaved =
      milestones.reduce(
        (sum, milestone) =>
          sum +
          Number(
            milestone.currentAmount || 0
          ),
        0
      );

    return {
      total,
      completed,
      active,
      skipped,
      cancelled,
      totalTarget,
      totalSaved,
      remainingAmount: Math.max(
        0,
        totalTarget -
          totalSaved
      ),
      completionPercentage:
        totalTarget > 0
          ? Number(
              (
                (totalSaved /
                  totalTarget) *
                100
              ).toFixed(2)
            )
          : 0,
    };
  };

/*
|--------------------------------------------------------------------------
| JSON TRANSFORMATION
|--------------------------------------------------------------------------
*/

SavingMilestoneSchema.set(
  "toJSON",
  {
    transform: (_doc, ret) => {
      delete ret.__v;

      return ret;
    },
  }
);

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const SavingMilestone =
  mongoose.models.SavingMilestone ||
  mongoose.model(
    "SavingMilestone",
    SavingMilestoneSchema
  );

export default SavingMilestone;