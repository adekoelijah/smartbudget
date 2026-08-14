import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

export const SAVING_PLAN_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
  "expired",
];

export const SAVING_PLAN_TYPES = [
  "fixed_amount",
  "percentage_income",
  "round_up",
  "target_date",
  "flexible",
  "custom",
];

export const SAVING_PLAN_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "custom",
];

export const SAVING_PLAN_METHODS = [
  "manual",
  "automatic",
  "bank_transfer",
  "wallet",
  "round_up",
  "income_percentage",
];

export const SAVING_PLAN_WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SAVING_PLAN_COMPLETION_REASONS = [
  "target_reached",
  "target_date_reached",
  "manually_completed",
  "goal_completed",
];

export const SAVING_PLAN_CANCELLATION_REASONS = [
  "user_cancelled",
  "goal_cancelled",
  "account_closed",
  "financial_difficulty",
  "duplicate_plan",
  "system",
  "other",
];

/* =========================================================
   MONEY HELPERS
========================================================= */

/**
 * Convert Decimal128 / Number / String to Number.
 *
 * IMPORTANT:
 * Financial truth must remain in SavingContribution /
 * ledger records. These numbers are for planning and
 * cached calculations.
 */
const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(
    typeof value?.toString === "function"
      ? value.toString()
      : value
  );

  return Number.isFinite(parsed) ? parsed : 0;
};

const decimal = (value) => {
  return mongoose.Types.Decimal128.fromString(
    Number(value || 0).toFixed(2)
  );
};

/* =========================================================
   SCHEMA
========================================================= */

const savingPlanSchema = new Schema(
  {
    /* =====================================================
       OWNERSHIP
    ===================================================== */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      immutable: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      immutable: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =====================================================
       IDENTITY
    ===================================================== */

    name: {
      type: String,
      required: [true, "Saving plan name is required"],
      trim: true,
      minlength: [
        2,
        "Saving plan name must contain at least 2 characters",
      ],
      maxlength: [
        100,
        "Saving plan name cannot exceed 100 characters",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Saving plan description cannot exceed 500 characters",
      ],
      default: "",
    },

    planType: {
      type: String,
      enum: {
        values: SAVING_PLAN_TYPES,
        message: "{VALUE} is not a valid saving plan type",
      },
      required: true,
      default: "fixed_amount",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: SAVING_PLAN_STATUSES,
        message: "{VALUE} is not a valid saving plan status",
      },
      default: "draft",
      index: true,
    },

    /* =====================================================
       GOAL RELATIONSHIP
    ===================================================== */

    goal: {
      type: Schema.Types.ObjectId,
      ref: "SavingsGoal",
      required: [true, "Savings goal is required"],
      immutable: true,
      index: true,
    },

    savingAccount: {
      type: Schema.Types.ObjectId,
      ref: "SavingAccount",
      default: null,
      index: true,
    },

    /* =====================================================
       TARGET
       
       This is a planning snapshot of SavingsGoal.
       
       Source of truth:
         SavingsGoal.targetAmount
         SavingsGoal.targetDate
         SavingsGoal.currency
    ===================================================== */

    target: {
      amount: {
        type: Schema.Types.Decimal128,
        required: [true, "Target amount is required"],
        min: [
          0.01,
          "Target amount must be greater than zero",
        ],
      },

      currency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
        match: [
          /^[A-Z]{3}$/,
          "Currency must be a valid ISO 4217 code",
        ],
        default: "NGN",
      },

      targetDate: {
        type: Date,
        default: null,
      },

      startingBalance: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Starting balance cannot be negative",
        ],
        default: () => decimal(0),
      },
    },

    /* =====================================================
       CONTRIBUTION STRATEGY
    ===================================================== */

    contribution: {
      method: {
        type: String,
        enum: {
          values: SAVING_PLAN_METHODS,
          message:
            "{VALUE} is not a valid contribution method",
        },
        default: "manual",
      },

      frequency: {
        type: String,
        enum: {
          values: SAVING_PLAN_FREQUENCIES,
          message:
            "{VALUE} is not a valid contribution frequency",
        },
        default: "monthly",
      },

      amount: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Contribution amount cannot be negative",
        ],
        default: null,
      },

      percentage: {
        type: Number,
        min: [
          0,
          "Contribution percentage cannot be negative",
        ],
        max: [
          100,
          "Contribution percentage cannot exceed 100",
        ],
        default: null,
      },

      minimumAmount: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Minimum contribution cannot be negative",
        ],
        default: null,
      },

      maximumAmount: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Maximum contribution cannot be negative",
        ],
        default: null,
      },

      dayOfWeek: {
        type: String,
        enum: {
          values: SAVING_PLAN_WEEK_DAYS,
          message: "{VALUE} is not a valid day of week",
        },
        default: null,
      },

      dayOfMonth: {
        type: Number,
        min: [1, "Day of month must be at least 1"],
        max: [31, "Day of month cannot exceed 31"],
        default: null,
      },

      executionTime: {
        type: String,
        trim: true,
        match: [
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Execution time must use HH:mm format",
        ],
        default: null,
      },

      customIntervalDays: {
        type: Number,
        min: [
          1,
          "Custom interval must be at least one day",
        ],
        default: null,
      },
    },

    /* =====================================================
       PLAN PERIOD
    ===================================================== */

    period: {
      startDate: {
        type: Date,
        default: Date.now,
        immutable: true,
      },

      endDate: {
        type: Date,
        default: null,
      },

      durationDays: {
        type: Number,
        min: [
          1,
          "Duration must be at least one day",
        ],
        default: null,
      },
    },

    /* =====================================================
       CACHED PROGRESS
       
       NOT FINANCIAL SOURCE OF TRUTH.
       
       Updated from confirmed SavingContribution records
       by the service layer.
    ===================================================== */

    progress: {
      contributedAmount: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Contributed amount cannot be negative",
        ],
        default: () => decimal(0),
      },

      remainingAmount: {
        type: Schema.Types.Decimal128,
        min: [
          0,
          "Remaining amount cannot be negative",
        ],
        default: () => decimal(0),
      },

      percentage: {
        type: Number,
        min: [
          0,
          "Progress percentage cannot be negative",
        ],
        max: [
          100,
          "Progress percentage cannot exceed 100",
        ],
        default: 0,
      },

      contributionCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      successfulContributionCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      missedContributionCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      lastContributionAt: {
        type: Date,
        default: null,
      },

      lastProgressCalculatedAt: {
        type: Date,
        default: null,
      },
    },

    /* =====================================================
       PLANNING METRICS
    ===================================================== */

    metrics: {
      requiredContributionPerDay: {
        type: Schema.Types.Decimal128,
        min: 0,
        default: () => decimal(0),
      },

      requiredContributionPerWeek: {
        type: Schema.Types.Decimal128,
        min: 0,
        default: () => decimal(0),
      },

      requiredContributionPerMonth: {
        type: Schema.Types.Decimal128,
        min: 0,
        default: () => decimal(0),
      },

      estimatedTotalContributions: {
        type: Number,
        min: 0,
        default: 0,
      },

      averageContribution: {
        type: Schema.Types.Decimal128,
        min: 0,
        default: () => decimal(0),
      },
    },

    /* =====================================================
       FLEXIBILITY
    ===================================================== */

    flexibility: {
      allowExtraContributions: {
        type: Boolean,
        default: true,
      },

      allowPartialContributions: {
        type: Boolean,
        default: true,
      },

      allowMissedContributions: {
        type: Boolean,
        default: true,
      },

      carryMissedAmountForward: {
        type: Boolean,
        default: false,
      },

      autoAdjustContribution: {
        type: Boolean,
        default: false,
      },
    },

    /* =====================================================
       AUTOMATION
    ===================================================== */

    automation: {
      enabled: {
        type: Boolean,
        default: false,
        index: true,
      },

      autoSave: {
        type: Schema.Types.ObjectId,
        ref: "AutoSave",
        default: null,
        index: true,
      },

      schedule: {
        type: Schema.Types.ObjectId,
        ref: "SavingSchedule",
        default: null,
        index: true,
      },
    },

    /* =====================================================
       EXECUTION
    ===================================================== */

    execution: {
      nextExecutionAt: {
        type: Date,
        default: null,
        index: true,
      },

      lastExecutionAt: {
        type: Date,
        default: null,
      },

      executionCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      failedExecutionCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      consecutiveFailures: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    /* =====================================================
       COMPLETION
    ===================================================== */

    completion: {
      completedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        enum: {
          values: SAVING_PLAN_COMPLETION_REASONS,
          message: "{VALUE} is not a valid completion reason",
        },
        default: null,
      },
    },

    /* =====================================================
       CANCELLATION
    ===================================================== */

    cancellation: {
      cancelledAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        enum: {
          values: SAVING_PLAN_CANCELLATION_REASONS,
          message:
            "{VALUE} is not a valid cancellation reason",
        },
        default: null,
      },

      note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
    },

    /* =====================================================
       PAUSE
    ===================================================== */

    pause: {
      pausedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        trim: true,
        maxlength: 300,
        default: null,
      },

      resumeAt: {
        type: Date,
        default: null,
      },

      totalPausedDays: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    /* =====================================================
       VERSION / AUDIT
    ===================================================== */

    version: {
      type: Number,
      min: 1,
      default: 1,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,

    strict: true,

    versionKey: "__v",

    minimize: true,

    toJSON: {
      virtuals: true,

      transform: (_doc, ret) => {
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
 * Remaining amount.
 */
savingPlanSchema.virtual("remainingTarget").get(
  function () {
    const target = toNumber(this.target?.amount);
    const contributed = toNumber(
      this.progress?.contributedAmount
    );

    return Math.max(target - contributed, 0);
  }
);

/**
 * Progress percentage.
 */
savingPlanSchema.virtual("progressPercentage").get(
  function () {
    const target = toNumber(this.target?.amount);

    if (target <= 0) {
      return 0;
    }

    const contributed = toNumber(
      this.progress?.contributedAmount
    );

    return Math.min(
      Math.round((contributed / target) * 10000) / 100,
      100
    );
  }
);

/**
 * Whether the plan reached its target.
 */
savingPlanSchema.virtual("targetReached").get(
  function () {
    const target = toNumber(this.target?.amount);
    const contributed = toNumber(
      this.progress?.contributedAmount
    );

    return target > 0 && contributed >= target;
  }
);

/**
 * Whether plan is executable.
 */
savingPlanSchema.virtual("isExecutable").get(
  function () {
    return (
      this.status === "active" &&
      !this.targetReached &&
      !this.automation?.enabled === false
    );
  }
);

/**
 * Whether automation is configured.
 */
savingPlanSchema.virtual("isAutomated").get(
  function () {
    return (
      this.automation?.enabled === true &&
      Boolean(
        this.automation?.autoSave ||
        this.automation?.schedule
      )
    );
  }
);

/**
 * Whether target date has passed.
 */
savingPlanSchema.virtual("isExpired").get(
  function () {
    if (!this.target?.targetDate) {
      return false;
    }

    if (this.targetReached) {
      return false;
    }

    return new Date() > new Date(this.target.targetDate);
  }
);

/**
 * Days remaining.
 */
savingPlanSchema.virtual("daysRemaining").get(
  function () {
    if (!this.target?.targetDate) {
      return null;
    }

    const difference =
      new Date(this.target.targetDate).getTime() -
      Date.now();

    return Math.max(
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      ),
      0
    );
  }
);

/* =========================================================
   VALIDATION
========================================================= */

/**
 * Validate relationship with SavingsGoal.
 *
 * This requires the goal document to be available.
 * The service should normally perform the authoritative
 * ownership/account validation.
 */
savingPlanSchema.pre(
  "validate",
  async function (next) {
    if (!this.goal) {
      return next(
        new Error("Savings goal is required")
      );
    }

    const SavingsGoal =
      mongoose.models.SavingsGoal ||
      mongoose.model("SavingsGoal");

    const goal =
      await SavingsGoal.findById(this.goal).select(
        "user savingAccount targetAmount currency targetDate status isDeleted"
      );

    if (!goal) {
      return next(
        new Error("Savings goal does not exist")
      );
    }

    if (
      this.user.toString() !==
      goal.user.toString()
    ) {
      return next(
        new Error(
          "Saving plan and savings goal must belong to the same user"
        )
      );
    }

    if (
      goal.isDeleted
    ) {
      return next(
        new Error(
          "A saving plan cannot use a deleted savings goal"
        )
      );
    }

    if (
      goal.savingAccount &&
      this.savingAccount &&
      goal.savingAccount.toString() !==
        this.savingAccount.toString()
    ) {
      return next(
        new Error(
          "Saving plan account must match the savings goal account"
        )
      );
    }

    /*
     * Synchronize planning snapshot with goal.
     */
    this.target.amount =
      goal.targetAmount;

    this.target.currency =
      goal.currency;

    this.target.targetDate =
      goal.targetDate;

    if (!this.savingAccount && goal.savingAccount) {
      this.savingAccount =
        goal.savingAccount;
    }

    /*
     * A plan cannot be active against a terminal goal.
     */
    if (
      this.status === "active" &&
      [
        "completed",
        "cancelled",
        "expired",
      ].includes(goal.status)
    ) {
      return next(
        new Error(
          `A plan cannot be active for a ${goal.status} savings goal`
        )
      );
    }

    next();
  }
);

/**
 * Validate target configuration.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    const target =
      toNumber(this.target?.amount);

    const starting =
      toNumber(this.target?.startingBalance);

    if (target <= 0) {
      return next(
        new Error(
          "Saving plan target amount must be greater than zero"
        )
      );
    }

    if (starting > target) {
      return next(
        new Error(
          "Starting balance cannot exceed target amount"
        )
      );
    }

    next();
  }
);

/**
 * Validate target date.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    if (!this.target?.targetDate) {
      return next();
    }

    const targetDate =
      new Date(this.target.targetDate);

    if (Number.isNaN(targetDate.getTime())) {
      return next(
        new Error("Invalid target date")
      );
    }

    if (
      this.isNew &&
      targetDate.getTime() < Date.now()
    ) {
      return next(
        new Error(
          "Target date cannot be in the past"
        )
      );
    }

    next();
  }
);

/**
 * Validate contribution strategy.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    const method =
      this.contribution?.method;

    const amount =
      toNumber(this.contribution?.amount);

    const percentage =
      this.contribution?.percentage;

    if (
      [
        "manual",
        "automatic",
        "bank_transfer",
      ].includes(method) &&
      this.planType === "fixed_amount" &&
      amount <= 0
    ) {
      return next(
        new Error(
          "Contribution amount is required for fixed amount plans"
        )
      );
    }

    if (
      method === "income_percentage" ||
      this.planType === "percentage_income"
    ) {
      if (
        percentage === null ||
        percentage === undefined ||
        percentage <= 0
      ) {
        return next(
          new Error(
            "Contribution percentage is required for percentage-based plans"
          )
        );
      }
    }

    if (
      this.planType === "round_up" &&
      method !== "round_up"
    ) {
      return next(
        new Error(
          "Round-up plans must use the round_up contribution method"
        )
      );
    }

    next();
  }
);

/**
 * Validate contribution boundaries.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    const minimum =
      this.contribution?.minimumAmount === null
        ? null
        : toNumber(
            this.contribution?.minimumAmount
          );

    const maximum =
      this.contribution?.maximumAmount === null
        ? null
        : toNumber(
            this.contribution?.maximumAmount
          );

    if (
      minimum !== null &&
      maximum !== null &&
      maximum < minimum
    ) {
      return next(
        new Error(
          "Maximum contribution cannot be lower than minimum contribution"
        )
      );
    }

    next();
  }
);

/**
 * Validate frequency-specific configuration.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    const frequency =
      this.contribution?.frequency;

    if (
      ["weekly", "biweekly"].includes(
        frequency
      ) &&
      !this.contribution?.dayOfWeek
    ) {
      return next(
        new Error(
          "Day of week is required for weekly and biweekly plans"
        )
      );
    }

    if (
      ["monthly", "quarterly"].includes(
        frequency
      ) &&
      !this.contribution?.dayOfMonth
    ) {
      return next(
        new Error(
          "Day of month is required for monthly and quarterly plans"
        )
      );
    }

    if (
      frequency === "custom" &&
      !this.contribution?.customIntervalDays
    ) {
      return next(
        new Error(
          "Custom interval is required for custom contribution schedules"
        )
      );
    }

    next();
  }
);

/**
 * Validate automation.
 */
savingPlanSchema.pre(
  "validate",
  function (next) {
    if (!this.automation?.enabled) {
      return next();
    }

    if (
      !this.automation.autoSave &&
      !this.automation.schedule
    ) {
      return next(
        new Error(
          "Automated plans require an AutoSave or SavingSchedule"
        )
      );
    }

    if (
      this.contribution?.method === "manual"
    ) {
      return next(
        new Error(
          "Automated plans cannot use the manual contribution method"
        )
      );
    }

    next();
  }
);

/**
 * Normalize cached progress.
 *
 * This NEVER queries SavingContribution.
 */
savingPlanSchema.pre(
  "save",
  function (next) {
    const target =
      toNumber(this.target?.amount);

    const contributed =
      Math.max(
        toNumber(
          this.progress?.contributedAmount
        ),
        0
      );

    this.progress.remainingAmount =
      decimal(
        Math.max(
          target - contributed,
          0
        )
      );

    this.progress.percentage =
      target > 0
        ? Math.min(
            Math.round(
              (contributed / target) *
                10000
            ) / 100,
            100
          )
        : 0;

    this.progress.lastProgressCalculatedAt =
      new Date();

    this.lastModifiedAt =
      new Date();

    /*
     * Automatically complete the plan when
     * cached progress reaches its target.
     */
    if (
      contributed >= target &&
      target > 0 &&
      this.status === "active"
    ) {
      this.status = "completed";

      this.completion.completedAt ??=
        new Date();

      this.completion.reason ??=
        "target_reached";

      this.execution.nextExecutionAt =
        null;

      this.automation.enabled =
        false;
    }

    next();
  }
);

/* =========================================================
   INSTANCE METHODS
========================================================= */

/**
 * Calculate required contribution.
 *
 * Pure calculation.
 */
savingPlanSchema.methods.calculateRequiredContribution =
  function () {
    const target =
      toNumber(this.target?.amount);

    const contributed =
      toNumber(
        this.progress?.contributedAmount
      );

    const remaining =
      Math.max(
        target - contributed,
        0
      );

    if (
      remaining <= 0 ||
      !this.target?.targetDate
    ) {
      return {
        remaining: Number(
          remaining.toFixed(2)
        ),
        daily: 0,
        weekly: 0,
        monthly: 0,
      };
    }

    const targetDate =
      new Date(this.target.targetDate);

    const daysRemaining =
      Math.max(
        Math.ceil(
          (
            targetDate.getTime() -
            Date.now()
          ) /
            (1000 * 60 * 60 * 24)
        ),
        1
      );

    const daily =
      remaining / daysRemaining;

    return {
      remaining: Number(
        remaining.toFixed(2)
      ),

      daily: Number(
        daily.toFixed(2)
      ),

      weekly: Number(
        (daily * 7).toFixed(2)
      ),

      monthly: Number(
        (daily * 30.4375).toFixed(2)
      ),
    };
  };

/**
 * Update planning metrics.
 */
savingPlanSchema.methods.updatePlanMetrics =
  function () {
    const metrics =
      this.calculateRequiredContribution();

    this.metrics.requiredContributionPerDay =
      decimal(metrics.daily);

    this.metrics.requiredContributionPerWeek =
      decimal(metrics.weekly);

    this.metrics.requiredContributionPerMonth =
      decimal(metrics.monthly);

    return metrics;
  };

/* =========================================================
   LIFECYCLE METHODS
========================================================= */

/**
 * Activate plan.
 */
savingPlanSchema.methods.activatePlan =
  function () {
    if (
      [
        "completed",
        "cancelled",
        "expired",
      ].includes(this.status)
    ) {
      throw new Error(
        "Completed, cancelled, or expired plans cannot be activated"
      );
    }

    this.status = "active";

    this.activatedAt ??=
      new Date();

    this.pause.resumeAt =
      new Date();

    return this;
  };

/**
 * Pause plan.
 */
savingPlanSchema.methods.pausePlan =
  function (reason = null) {
    if (this.status !== "active") {
      throw new Error(
        "Only active plans can be paused"
      );
    }

    this.status = "paused";

    this.pause.pausedAt =
      new Date();

    this.pause.reason =
      reason?.trim() || null;

    this.execution.nextExecutionAt =
      null;

    return this;
  };

/**
 * Complete plan.
 */
savingPlanSchema.methods.completePlan =
  function (
    reason = "target_reached"
  ) {
    if (this.status === "cancelled") {
      throw new Error(
        "Cancelled plans cannot be completed"
      );
    }

    if (
      !SAVING_PLAN_COMPLETION_REASONS.includes(
        reason
      )
    ) {
      throw new Error(
        "Invalid plan completion reason"
      );
    }

    this.status = "completed";

    this.completion.completedAt =
      new Date();

    this.completion.reason =
      reason;

    this.execution.nextExecutionAt =
      null;

    this.automation.enabled =
      false;

    return this;
  };

/**
 * Cancel plan.
 */
savingPlanSchema.methods.cancelPlan =
  function (
    reason = "user_cancelled",
    note = null
  ) {
    if (this.status === "completed") {
      throw new Error(
        "Completed plans cannot be cancelled"
      );
    }

    if (
      !SAVING_PLAN_CANCELLATION_REASONS.includes(
        reason
      )
    ) {
      throw new Error(
        "Invalid plan cancellation reason"
      );
    }

    this.status = "cancelled";

    this.cancellation.cancelledAt =
      new Date();

    this.cancellation.reason =
      reason;

    this.cancellation.note =
      note?.trim() || null;

    this.execution.nextExecutionAt =
      null;

    this.automation.enabled =
      false;

    return this;
  };

/**
 * Mark plan expired.
 */
savingPlanSchema.methods.expirePlan =
  function () {
    if (
      [
        "completed",
        "cancelled",
      ].includes(this.status)
    ) {
      throw new Error(
        "Completed or cancelled plans cannot expire"
      );
    }

    this.status = "expired";

    this.execution.nextExecutionAt =
      null;

    this.automation.enabled =
      false;

    return this;
  };

/* =========================================================
   QUERY HELPERS
========================================================= */

savingPlanSchema.query.forUser =
  function (userId) {
    return this.where({
      user: userId,
    });
  };

savingPlanSchema.query.active =
  function () {
    return this.where({
      status: "active",
    });
  };

savingPlanSchema.query.forGoal =
  function (goalId) {
    return this.where({
      goal: goalId,
    });
  };

savingPlanSchema.query.automated =
  function () {
    return this.where({
      status: "active",
      "automation.enabled": true,
    });
  };

savingPlanSchema.query.executionDue =
  function (date = new Date()) {
    return this.where({
      status: "active",
      "automation.enabled": true,
      "execution.nextExecutionAt": {
        $lte: date,
      },
    });
  };

/* =========================================================
   INDEXES
========================================================= */

savingPlanSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

savingPlanSchema.index({
  user: 1,
  goal: 1,
});

savingPlanSchema.index({
  user: 1,
  savingAccount: 1,
});

savingPlanSchema.index({
  status: 1,
  "automation.enabled": 1,
  "execution.nextExecutionAt": 1,
});

// savingPlanSchema.index({
//   "automation.autoSave": 1,
// });

// savingPlanSchema.index({
//   "automation.schedule": 1,
// });

/* =========================================================
   MODEL
========================================================= */

const SavingPlan =
  mongoose.models.SavingPlan ||
  mongoose.model(
    "SavingPlan",
    savingPlanSchema
  );

export default SavingPlan;