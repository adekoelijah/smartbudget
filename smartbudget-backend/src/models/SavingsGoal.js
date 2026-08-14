import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

export const SAVINGS_GOAL_CATEGORIES = [
  "emergency",
  "rent",
  "housing",
  "education",
  "healthcare",
  "transportation",
  "business",
  "investment",
  "travel",
  "wedding",
  "family",
  "technology",
  "debt",
  "retirement",
  "personal",
  "other",
];

export const SAVINGS_GOAL_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
];

export const SAVINGS_GOAL_STATUSES = [
  "active",
  "completed",
  "paused",
  "cancelled",
  "expired",
];

export const SAVINGS_GOAL_TYPES = [
  "target",
  "recurring",
];

export const SAVINGS_CONTRIBUTION_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "custom",
];

export const SAVINGS_FUNDING_METHODS = [
  "manual",
  "scheduled",
  "automatic",
  "bank_transfer",
];

/* =========================================================
   MONEY HELPERS
========================================================= */

/**
 * Convert a MongoDB Decimal128 value or number to Number.
 *
 * Important:
 * Monetary calculations involving the actual ledger should
 * preferably remain Decimal128-based in the service layer.
 *
 * These helpers are mainly for cached goal projections.
 */
const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (
    value &&
    typeof value.toString === "function"
  ) {
    const parsed = Number(value.toString());

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

/* =========================================================
   SAVINGS GOAL SCHEMA
========================================================= */

const savingsGoalSchema = new Schema(
  {
    /* =====================================================
       OWNER
    ===================================================== */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
      immutable: true,
    },

    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    name: {
      type: String,
      required: [true, "Savings goal name is required"],
      trim: true,
      minlength: [
        2,
        "Savings goal name must contain at least 2 characters",
      ],
      maxlength: [
        100,
        "Savings goal name cannot exceed 100 characters",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Savings goal description cannot exceed 500 characters",
      ],
      default: "",
    },

    category: {
      type: String,
      enum: {
        values: SAVINGS_GOAL_CATEGORIES,
        message:
          "{VALUE} is not a valid savings goal category",
      },
      default: "personal",
      index: true,
    },

    goalType: {
      type: String,
      enum: {
        values: SAVINGS_GOAL_TYPES,
        message:
          "{VALUE} is not a valid savings goal type",
      },
      default: "target",
      index: true,
    },

    priority: {
      type: String,
      enum: {
        values: SAVINGS_GOAL_PRIORITIES,
        message:
          "{VALUE} is not a valid savings goal priority",
      },
      default: "medium",
      index: true,
    },

    /* =====================================================
       FINANCIAL TARGET
    ===================================================== */

    targetAmount: {
      type: Schema.Types.Decimal128,
      required: [true, "Target amount is required"],
      min: [
        0.01,
        "Target amount must be greater than zero",
      ],
    },

    /**
     * Cached aggregate.
     *
     * DO NOT accept this directly from frontend update
     * requests.
     *
     * The source of truth is SavingContribution.
     */
    currentAmount: {
      type: Schema.Types.Decimal128,
      default: () =>
        mongoose.Types.Decimal128.fromString("0"),
      min: [
        0,
        "Current amount cannot be negative",
      ],
    },

    /**
     * Cached projection.
     */
    remainingAmount: {
      type: Schema.Types.Decimal128,
      default: () =>
        mongoose.Types.Decimal128.fromString("0"),
      min: [
        0,
        "Remaining amount cannot be negative",
      ],
    },

    /**
     * Cached projection.
     */
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /**
     * Currency belonging to the goal.
     *
     * In the future this should be validated against the
     * associated SavingAccount.
     */
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: [
        3,
        "Currency must be a valid ISO 4217 code",
      ],
      maxlength: [
        3,
        "Currency must be a valid ISO 4217 code",
      ],
      match: [
        /^[A-Z]{3}$/,
        "Currency must be a valid ISO 4217 code",
      ],
      default: "NGN",
    },

    /* =====================================================
       DATE MANAGEMENT
    ===================================================== */

    startDate: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },

    targetDate: {
      type: Date,
      required: [
        true,
        "Target date is required",
      ],
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       CONTRIBUTION CONFIGURATION
    ===================================================== */

    contributionFrequency: {
      type: String,
      enum: {
        values:
          SAVINGS_CONTRIBUTION_FREQUENCIES,
        message:
          "{VALUE} is not a valid contribution frequency",
      },
      default: "monthly",
    },

    plannedContributionAmount: {
      type: Schema.Types.Decimal128,
      default: () =>
        mongoose.Types.Decimal128.fromString("0"),
      min: [
        0,
        "Planned contribution cannot be negative",
      ],
    },

    minimumContributionAmount: {
      type: Schema.Types.Decimal128,
      default: () =>
        mongoose.Types.Decimal128.fromString("0"),
      min: [
        0,
        "Minimum contribution cannot be negative",
      ],
    },

    maximumContributionAmount: {
      type: Schema.Types.Decimal128,
      default: null,
      min: [
        0,
        "Maximum contribution cannot be negative",
      ],
    },

    fundingMethod: {
      type: String,
      enum: {
        values: SAVINGS_FUNDING_METHODS,
        message:
          "{VALUE} is not a valid funding method",
      },
      default: "manual",
      index: true,
    },

    /* =====================================================
       AUTOMATION
    ===================================================== */

    automationEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    nextContributionDate: {
      type: Date,
      default: null,
      index: true,
    },

    lastContributionAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       ACCOUNT ASSOCIATION
    ===================================================== */

    /**
     * The SavingAccount where this goal is held.
     *
     * A goal can exist before an account is assigned,
     * depending on the SmartSave onboarding flow.
     */
    savingAccount: {
      type: Schema.Types.ObjectId,
      ref: "SavingAccount",
      default: null,
      index: true,
    },

    /* =====================================================
       PRIMARY GOAL
    ===================================================== */

    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =====================================================
       CONTRIBUTION BEHAVIOUR
    ===================================================== */

    allowExtraContributions: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
       NOTIFICATION PREFERENCES
    ===================================================== */

    notifyOnContribution: {
      type: Boolean,
      default: true,
    },

    notifyOnMilestone: {
      type: Boolean,
      default: true,
    },

    notifyBeforeContribution: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
       PRESENTATION METADATA
    ===================================================== */

    icon: {
      type: String,
      trim: true,
      maxlength: [
        50,
        "Icon identifier cannot exceed 50 characters",
      ],
      default: "target",
    },

    color: {
      type: String,
      trim: true,
      maxlength: [
        30,
        "Color identifier cannot exceed 30 characters",
      ],
      default: "slate",
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tags) {
          return tags.length <= 10;
        },
        message:
          "A savings goal cannot have more than 10 tags",
      },
    },

    /* =====================================================
       SOFT DELETE
    ===================================================== */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    /**
     * Keep Mongoose versioning enabled.
     *
     * This is useful when multiple processes are updating
     * financial projections concurrently.
     */
    versionKey: "__v",

    strict: true,

    minimize: true,

    toJSON: {
      virtuals: true,

      transform: (_, ret) => {
        delete ret.__v;

        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  }
);

/* =========================================================
   VIRTUALS
========================================================= */

/**
 * Amount remaining before completion.
 */
savingsGoalSchema.virtual("amountRemaining").get(
  function () {
    const target = toNumber(this.targetAmount);
    const current = toNumber(this.currentAmount);

    return Math.max(target - current, 0);
  }
);

/**
 * Completion percentage.
 */
savingsGoalSchema.virtual("completionPercentage").get(
  function () {
    const target = toNumber(this.targetAmount);
    const current = toNumber(this.currentAmount);

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      Math.round((current / target) * 10000) / 100,
      100
    );
  }
);

/**
 * Whether the goal has reached its target.
 */
savingsGoalSchema.virtual("isCompleted").get(
  function () {
    const target = toNumber(this.targetAmount);
    const current = toNumber(this.currentAmount);

    return (
      target > 0 &&
      current >= target
    );
  }
);

/**
 * Whether the goal is currently active.
 */
savingsGoalSchema.virtual("isActive").get(
  function () {
    return (
      this.status === "active" &&
      !this.isDeleted
    );
  }
);

/**
 * Whether the goal is overdue.
 */
savingsGoalSchema.virtual("isOverdue").get(
  function () {
    if (
      this.isDeleted ||
      this.status === "completed" ||
      this.status === "cancelled" ||
      this.status === "expired"
    ) {
      return false;
    }

    if (!this.targetDate) {
      return false;
    }

    return new Date() > new Date(this.targetDate);
  }
);

/**
 * Number of calendar days remaining.
 */
savingsGoalSchema.virtual("daysRemaining").get(
  function () {
    if (!this.targetDate) {
      return null;
    }

    const now = new Date();
    const target = new Date(this.targetDate);

    const difference =
      target.getTime() - now.getTime();

    return Math.max(
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      ),
      0
    );
  }
);

/* =========================================================
   INDEXES
========================================================= */

/**
 * Main user goal lookup.
 */
savingsGoalSchema.index({
  user: 1,
  isDeleted: 1,
  status: 1,
});

/**
 * User goals ordered by target date.
 */
savingsGoalSchema.index({
  user: 1,
  targetDate: 1,
});

/**
 * Automation worker lookup.
 */
savingsGoalSchema.index({
  user: 1,
  automationEnabled: 1,
  nextContributionDate: 1,
  status: 1,
  isDeleted: 1,
});

/**
 * Saving account lookup.
 */
savingsGoalSchema.index({
  savingAccount: 1,
  status: 1,
  isDeleted: 1,
});

/**
 * Category analytics.
 */
savingsGoalSchema.index({
  user: 1,
  category: 1,
  isDeleted: 1,
});

/**
 * Primary goal lookup.
 *
 * Partial index means only non-deleted primary goals
 * participate in this uniqueness constraint.
 */
savingsGoalSchema.index(
  {
    user: 1,
    isPrimary: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isPrimary: true,
      isDeleted: false,
    },
  }
);

/* =========================================================
   VALIDATION
========================================================= */

/**
 * Validate target date.
 */
savingsGoalSchema.pre(
  "validate",
  function (next) {
    if (
      this.startDate &&
      this.targetDate &&
      new Date(this.targetDate) <=
        new Date(this.startDate)
    ) {
      this.invalidate(
        "targetDate",
        "Target date must be after the start date"
      );
    }

    next();
  }
);

/**
 * Validate contribution boundaries.
 */
savingsGoalSchema.pre(
  "validate",
  function (next) {
    const minimum =
      toNumber(
        this.minimumContributionAmount
      );

    const maximum =
      this.maximumContributionAmount === null
        ? null
        : toNumber(
            this.maximumContributionAmount
          );

    if (
      maximum !== null &&
      minimum > maximum
    ) {
      this.invalidate(
        "maximumContributionAmount",
        "Maximum contribution cannot be less than minimum contribution"
      );
    }

    next();
  }
);

/**
 * Validate planned contribution.
 */
savingsGoalSchema.pre(
  "validate",
  function (next) {
    const planned =
      toNumber(
        this.plannedContributionAmount
      );

    const minimum =
      toNumber(
        this.minimumContributionAmount
      );

    const maximum =
      this.maximumContributionAmount === null
        ? null
        : toNumber(
            this.maximumContributionAmount
          );

    if (
      planned > 0 &&
      planned < minimum
    ) {
      this.invalidate(
        "plannedContributionAmount",
        "Planned contribution cannot be below the minimum contribution"
      );
    }

    if (
      maximum !== null &&
      planned > maximum
    ) {
      this.invalidate(
        "plannedContributionAmount",
        "Planned contribution cannot exceed the maximum contribution"
      );
    }

    next();
  }
);

/**
 * Validate automation configuration.
 */
savingsGoalSchema.pre(
  "validate",
  function (next) {
    if (
      this.automationEnabled &&
      this.fundingMethod === "manual"
    ) {
      this.invalidate(
        "fundingMethod",
        "Automatic savings cannot use manual funding"
      );
    }

    next();
  }
);

/**
 * Keep cached financial projections synchronized.
 *
 * IMPORTANT:
 * This does NOT calculate the balance from the ledger.
 * The service responsible for recording a confirmed
 * SavingContribution must update currentAmount.
 *
 * This hook only keeps the projections synchronized
 * with the cached currentAmount.
 */
savingsGoalSchema.pre(
  "save",
  function (next) {
    const target =
      toNumber(this.targetAmount);

    const current =
      toNumber(this.currentAmount);

    if (target <= 0) {
      this.progressPercentage = 0;

      this.remainingAmount =
        mongoose.Types.Decimal128.fromString(
          "0"
        );

      return next();
    }

    const progress = Math.min(
      Math.round(
        (current / target) * 10000
      ) / 100,
      100
    );

    const remaining =
      Math.max(
        target - current,
        0
      );

    this.progressPercentage =
      progress;

    this.remainingAmount =
      mongoose.Types.Decimal128.fromString(
        remaining.toFixed(2)
      );

    /**
     * Automatically complete an active goal
     * once the cached aggregate reaches target.
     */
    if (
      current >= target &&
      this.status === "active"
    ) {
      this.status = "completed";

      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    }

    next();
  }
);

/* =========================================================
   INSTANCE METHODS
========================================================= */

/**
 * Add to cached contribution aggregate.
 *
 * IMPORTANT:
 * This method should only be called from the backend
 * contribution service after a valid contribution has
 * been created/confirmed.
 */
savingsGoalSchema.methods.addContribution =
  function (amount) {
    const contribution =
      toNumber(amount);

    if (
      !Number.isFinite(contribution) ||
      contribution <= 0
    ) {
      throw new Error(
        "Contribution amount must be greater than zero"
      );
    }

    const minimum =
      toNumber(
        this.minimumContributionAmount
      );

    const maximum =
      this.maximumContributionAmount === null
        ? null
        : toNumber(
            this.maximumContributionAmount
          );

    if (
      minimum > 0 &&
      contribution < minimum
    ) {
      throw new Error(
        "Contribution amount is below the minimum allowed"
      );
    }

    if (
      maximum !== null &&
      contribution > maximum &&
      !this.allowExtraContributions
    ) {
      throw new Error(
        "Contribution amount exceeds the maximum allowed"
      );
    }

    const current =
      toNumber(this.currentAmount);

    const target =
      toNumber(this.targetAmount);

    /**
     * Do not allow the aggregate to exceed the target
     * for target-based goals.
     *
     * The contribution service should separately decide
     * whether the excess should be rejected/refunded.
     */
    const newAmount =
      this.goalType === "target"
        ? Math.min(
            current + contribution,
            target
          )
        : current + contribution;

    this.currentAmount =
      mongoose.Types.Decimal128.fromString(
        newAmount.toFixed(2)
      );

    this.lastContributionAt =
      new Date();

    return this;
  };

/**
 * Pause an active goal.
 */
savingsGoalSchema.methods.pause =
  function () {
    if (this.status !== "active") {
      throw new Error(
        "Only active savings goals can be paused"
      );
    }

    this.status = "paused";
    this.pausedAt = new Date();

    return this;
  };

/**
 * Resume a paused goal.
 */
savingsGoalSchema.methods.resume =
  function () {
    if (this.status !== "paused") {
      throw new Error(
        "Only paused savings goals can be resumed"
      );
    }

    this.status = "active";
    this.pausedAt = null;

    return this;
  };

/**
 * Cancel a goal.
 */
savingsGoalSchema.methods.cancel =
  function () {
    if (
      this.status === "completed" ||
      this.status === "cancelled"
    ) {
      throw new Error(
        "This savings goal cannot be cancelled"
      );
    }

    this.status = "cancelled";
    this.cancelledAt = new Date();

    /**
     * Scheduled automation should no longer
     * attempt to execute this goal.
     */
    this.automationEnabled = false;
    this.nextContributionDate = null;

    return this;
  };

/**
 * Expire an overdue goal.
 */
savingsGoalSchema.methods.expire =
  function () {
    if (
      this.status === "completed" ||
      this.status === "cancelled"
    ) {
      throw new Error(
        "This savings goal cannot be expired"
      );
    }

    this.status = "expired";
    this.expiredAt = new Date();

    this.automationEnabled = false;
    this.nextContributionDate = null;

    return this;
  };

/**
 * Mark the goal as completed.
 *
 * Normally this should happen automatically when the
 * contribution aggregate reaches the target.
 */
savingsGoalSchema.methods.complete =
  function () {
    if (this.status === "cancelled") {
      throw new Error(
        "A cancelled savings goal cannot be completed"
      );
    }

    this.status = "completed";

    if (!this.completedAt) {
      this.completedAt = new Date();
    }

    this.automationEnabled = false;
    this.nextContributionDate = null;

    return this;
  };

/**
 * Soft delete.
 */
savingsGoalSchema.methods.softDelete =
  function () {
    if (this.isDeleted) {
      return this;
    }

    this.isDeleted = true;
    this.deletedAt = new Date();

    /**
     * Prevent automation against deleted goals.
     */
    this.automationEnabled = false;
    this.nextContributionDate = null;

    return this;
  };

/**
 * Restore soft-deleted goal.
 */
savingsGoalSchema.methods.restore =
  function () {
    if (!this.isDeleted) {
      return this;
    }

    this.isDeleted = false;
    this.deletedAt = null;

    return this;
  };

/* =========================================================
   QUERY HELPERS
========================================================= */

/**
 * Active goals.
 */
savingsGoalSchema.query.active =
  function () {
    return this.where({
      status: "active",
      isDeleted: false,
    });
  };

/**
 * Non-deleted goals.
 */
savingsGoalSchema.query.notDeleted =
  function () {
    return this.where({
      isDeleted: false,
    });
  };

/**
 * Goals belonging to a user.
 */
savingsGoalSchema.query.forUser =
  function (userId) {
    return this.where({
      user: userId,
      isDeleted: false,
    });
  };

/**
 * Goals belonging to a SavingAccount.
 */
savingsGoalSchema.query.forAccount =
  function (accountId) {
    return this.where({
      savingAccount: accountId,
      isDeleted: false,
    });
  };

/**
 * Goals requiring automation.
 */
savingsGoalSchema.query.automationDue =
  function (date = new Date()) {
    return this.where({
      automationEnabled: true,
      status: "active",
      isDeleted: false,
      nextContributionDate: {
        $lte: date,
      },
    });
  };

/**
 * Primary goal.
 */
savingsGoalSchema.query.primary =
  function () {
    return this.where({
      isPrimary: true,
      isDeleted: false,
    });
  };

/* =========================================================
   MODEL
========================================================= */

const SavingsGoal =
  mongoose.models.SavingsGoal ||
  mongoose.model(
    "SavingsGoal",
    savingsGoalSchema
  );

export default SavingsGoal;