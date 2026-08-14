import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ============================================================
 * SMARTSAVE — AUTO SAVE MODEL
 * ============================================================
 *
 * AutoSave represents a user's automatic saving configuration.
 *
 * IMPORTANT:
 *
 * AutoSave is NOT a financial transaction.
 *
 * It defines the user's automatic-saving preference/rule.
 *
 * Financial lifecycle:
 *
 * SavingGoal
 *     ↓
 * AutoSave
 *     ↓
 * SavingSchedule
 *     ↓
 * SavingExecution
 *     ↓
 * SavingContribution
 *
 * Responsibilities:
 *
 * AutoSave
 *   → what should happen
 *
 * SavingSchedule
 *   → when it should happen
 *
 * SavingExecution
 *   → attempt/result of execution
 *
 * SavingContribution
 *   → authoritative financial record
 *
 * ============================================================
 */


/**
 * ============================================================
 * ENUMS
 * ============================================================
 */

const AUTO_SAVE_METHODS = [
  "fixed_amount",
  "percentage",
];

const AUTO_SAVE_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

const AUTO_SAVE_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
];

const AUTO_SAVE_SOURCES = [
  "internal_balance",
  "bank_account",
  "card",
  "wallet",
];

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];


/**
 * ============================================================
 * AUTO SAVE SCHEMA
 * ============================================================
 */

const AutoSaveSchema = new Schema(
  {
    /**
     * ========================================================
     * OWNERSHIP
     * ========================================================
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      immutable: true,
      index: true,
    },

    /**
     * ========================================================
     * SAVING GOAL
     * ========================================================
     */

    savingGoal: {
      type: Schema.Types.ObjectId,
      ref: "SavingGoal",
      required: [true, "Saving goal is required"],
      immutable: true,
      index: true,
    },

    /**
     * ========================================================
     * SAVING ACCOUNT
     * ========================================================
     *
     * Optional source account for internal saving accounts.
     */

    savingAccount: {
      type: Schema.Types.ObjectId,
      ref: "SavingAccount",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * SAVING SCHEDULE
     * ========================================================
     *
     * Created/managed by savingScheduleService.
     */

    savingSchedule: {
      type: Schema.Types.ObjectId,
      ref: "SavingSchedule",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * BASIC INFORMATION
     * ========================================================
     */

    name: {
      type: String,
      required: [true, "Auto-save name is required"],
      trim: true,
      minlength: [2, "Auto-save name is too short"],
      maxlength: [100, "Auto-save name is too long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description is too long"],
      default: "",
    },

    /**
     * ========================================================
     * SAVING METHOD
     * ========================================================
     */

    method: {
      type: String,
      required: [true, "Auto-save method is required"],
      enum: AUTO_SAVE_METHODS,
      lowercase: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      min: [0.01, "Amount must be greater than zero"],
      default: null,
      validate: {
        validator(value) {
          return (
            value === null ||
            value === undefined ||
            Number.isFinite(value)
          );
        },
        message: "Amount must be a valid number",
      },
    },

    percentage: {
      type: Number,
      min: [0.01, "Percentage must be greater than zero"],
      max: [100, "Percentage cannot exceed 100"],
      default: null,
      validate: {
        validator(value) {
          return (
            value === null ||
            value === undefined ||
            Number.isFinite(value)
          );
        },
        message: "Percentage must be a valid number",
      },
    },

    currency: {
      type: String,
      required: true,
      default: "NGN",
      uppercase: true,
      trim: true,
      enum: ["NGN"],
    },

    /**
     * ========================================================
     * FUNDING SOURCE
     * ========================================================
     */

    source: {
      type: String,
      required: true,
      enum: AUTO_SAVE_SOURCES,
      default: "internal_balance",
      lowercase: true,
      trim: true,
      index: true,
    },

    sourceAccount: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * FREQUENCY
     * ========================================================
     */

    frequency: {
      type: String,
      required: true,
      enum: AUTO_SAVE_FREQUENCIES,
      default: "monthly",
      lowercase: true,
      trim: true,
      index: true,
    },

    dayOfWeek: {
      type: String,
      enum: DAYS_OF_WEEK,
      default: null,
    },

    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },

    executionTime: {
      type: String,
      trim: true,
      default: "09:00",
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Execution time must use HH:mm format",
      ],
    },

    timezone: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Africa/Lagos",
    },

    /**
     * ========================================================
     * LIFECYCLE
     * ========================================================
     */

    status: {
      type: String,
      required: true,
      enum: AUTO_SAVE_STATUSES,
      default: "draft",
      lowercase: true,
      trim: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },

    endDate: {
      type: Date,
      default: null,
      index: true,
    },

    nextExecutionAt: {
      type: Date,
      default: null,
      index: true,
    },

    lastExecutionAt: {
      type: Date,
      default: null,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * EXECUTION STATISTICS
     * ========================================================
     *
     * Reporting counters only.
     *
     * SavingExecution remains the source of execution history.
     * SavingContribution remains the source of financial truth.
     */

    executionCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    successfulExecutionCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    failedExecutionCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalSaved: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * ========================================================
     * FAILURE MANAGEMENT
     * ========================================================
     */

    consecutiveFailures: {
      type: Number,
      min: 0,
      default: 0,
    },

    maximumConsecutiveFailures: {
      type: Number,
      min: 1,
      max: 20,
      default: 3,
    },

    lastFailureAt: {
      type: Date,
      default: null,
    },

    lastFailureReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    /**
     * ========================================================
     * SAFETY LIMITS
     * ========================================================
     */

    minimumBalanceRequired: {
      type: Number,
      min: 0,
      default: 0,
    },

    maximumPerExecution: {
      type: Number,
      min: 0.01,
      default: null,
    },

    maximumTotalAmount: {
      type: Number,
      min: 0.01,
      default: null,
    },

    /**
     * ========================================================
     * PROVIDER REFERENCES
     * ========================================================
     *
     * These are integration references.
     *
     * They are NOT authoritative financial records.
     */

    provider: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
      default: null,
    },

    providerReference: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    bankReference: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    /**
     * ========================================================
     * SOFT DELETE
     * ========================================================
     */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * AUDIT
     * ========================================================
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

    /**
     * ========================================================
     * EXTENSIBLE METADATA
     * ========================================================
     */

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: true,
    minimize: true,
  }
);


/**
 * ============================================================
 * INDEXES
 * ============================================================
 */

/**
 * Active auto-saves waiting for execution.
 */
AutoSaveSchema.index({
  status: 1,
  nextExecutionAt: 1,
});

/**
 * User auto-save configuration.
 */
AutoSaveSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

/**
 * Goal auto-save configuration.
 */
AutoSaveSchema.index({
  savingGoal: 1,
  status: 1,
});

/**
 * Account-based lookup.
 */
AutoSaveSchema.index({
  savingAccount: 1,
  status: 1,
});

/**
 * External funding lookup.
 */
AutoSaveSchema.index({
  source: 1,
  sourceAccount: 1,
  status: 1,
});


/**
 * ============================================================
 * VALIDATION
 * ============================================================
 */

AutoSaveSchema.pre("validate", function (next) {
  /**
   * Fixed amount requires amount.
   */
  if (this.method === "fixed_amount") {
    if (!Number.isFinite(this.amount) || this.amount <= 0) {
      return next(
        new Error(
          "Fixed amount auto-save requires a positive amount."
        )
      );
    }

    this.percentage = null;
  }

  /**
   * Percentage requires percentage.
   */
  if (this.method === "percentage") {
    if (
      !Number.isFinite(this.percentage) ||
      this.percentage <= 0 ||
      this.percentage > 100
    ) {
      return next(
        new Error(
          "Percentage auto-save requires a value between 0 and 100."
        )
      );
    }

    this.amount = null;
  }

  /**
   * Weekly / biweekly require day.
   */
  if (
    ["weekly", "biweekly"].includes(this.frequency) &&
    !this.dayOfWeek
  ) {
    return next(
      new Error(
        "Weekly and biweekly auto-saves require dayOfWeek."
      )
    );
  }

  /**
   * Monthly requires day.
   */
  if (
    this.frequency === "monthly" &&
    !this.dayOfMonth
  ) {
    return next(
      new Error(
        "Monthly auto-saves require dayOfMonth."
      )
    );
  }

  /**
   * Daily does not use calendar day settings.
   */
  if (this.frequency === "daily") {
    this.dayOfWeek = null;
    this.dayOfMonth = null;
  }

  /**
   * Date range validation.
   */
  if (
    this.endDate &&
    this.startDate &&
    this.endDate < this.startDate
  ) {
    return next(
      new Error(
        "End date cannot be earlier than start date."
      )
    );
  }

  /**
   * Maximum per execution.
   */
  if (
    this.maximumPerExecution !== null &&
    this.maximumPerExecution !== undefined
  ) {
    const configuredAmount =
      this.method === "fixed_amount"
        ? this.amount
        : null;

    if (
      configuredAmount !== null &&
      configuredAmount > this.maximumPerExecution
    ) {
      return next(
        new Error(
          "Configured amount exceeds maximumPerExecution."
        )
      );
    }
  }

  /**
   * Maximum total amount.
   */
  if (
    this.maximumTotalAmount !== null &&
    this.maximumTotalAmount !== undefined &&
    this.maximumTotalAmount <= 0
  ) {
    return next(
      new Error(
        "maximumTotalAmount must be greater than zero."
      )
    );
  }

  /**
   * External funding sources require source account.
   */
  if (
    ["bank_account", "card", "wallet"].includes(this.source) &&
    !this.sourceAccount
  ) {
    return next(
      new Error(
        "sourceAccount is required for external funding sources."
      )
    );
  }

  /**
   * Internal balance must not reference external account.
   */
  if (this.source === "internal_balance") {
    this.sourceAccount = null;
  }

  next();
});


/**
 * ============================================================
 * STATUS / LIFECYCLE VALIDATION
 * ============================================================
 */

AutoSaveSchema.pre("validate", function (next) {
  /**
   * Cancelled configurations cannot be reactivated.
   */
  if (
    this.isModified("status") &&
    this.status === "active" &&
    this.cancelledAt
  ) {
    return next(
      new Error(
        "Cancelled auto-saves cannot be reactivated."
      )
    );
  }

  /**
   * Completed configurations cannot have future execution.
   */
  if (this.status === "completed") {
    this.nextExecutionAt = null;
  }

  /**
   * Cancelled configurations cannot have future execution.
   */
  if (this.status === "cancelled") {
    this.nextExecutionAt = null;
  }

  next();
});


/**
 * ============================================================
 * STATUS TIMESTAMPS
 * ============================================================
 */

AutoSaveSchema.pre("save", function (next) {
  if (!this.isModified("status")) {
    return next();
  }

  if (this.status === "active" && !this.activatedAt) {
    this.activatedAt = new Date();
  }

  if (this.status === "paused" && !this.pausedAt) {
    this.pausedAt = new Date();
  }

  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.status === "cancelled" && !this.cancelledAt) {
    this.cancelledAt = new Date();
    this.nextExecutionAt = null;
  }

  next();
});


/**
 * ============================================================
 * IMMUTABILITY PROTECTION
 * ============================================================
 *
 * Ownership and financial relationships should not be
 * silently reassigned after creation.
 */

AutoSaveSchema.pre(
  "findOneAndUpdate",
  function (next) {
    const update = this.getUpdate() || {};

    const blockedFields = [
      "user",
      "savingGoal",
      "createdBy",
    ];

    const directUpdates = Object.keys(update).filter(
      (key) => !key.startsWith("$")
    );

    const setUpdates = Object.keys(
      update.$set || {}
    );

    const attemptedMutation = [
      ...directUpdates,
      ...setUpdates,
    ].some((field) =>
      blockedFields.includes(field)
    );

    if (attemptedMutation) {
      return next(
        new Error(
          "Auto-save ownership fields cannot be modified."
        )
      );
    }

    next();
  }
);


/**
 * ============================================================
 * VIRTUALS
 * ============================================================
 */

AutoSaveSchema.virtual("isActive").get(function () {
  return (
    this.status === "active" &&
    !this.isDeleted
  );
});


AutoSaveSchema.virtual("hasReachedMaximum").get(
  function () {
    if (this.maximumTotalAmount === null) {
      return false;
    }

    return (
      this.totalSaved >=
      this.maximumTotalAmount
    );
  }
);


AutoSaveSchema.virtual("remainingMaximum").get(
  function () {
    if (this.maximumTotalAmount === null) {
      return null;
    }

    return Math.max(
      0,
      this.maximumTotalAmount -
        this.totalSaved
    );
  }
);


AutoSaveSchema.virtual("failureRisk").get(
  function () {
    if (this.consecutiveFailures >= 3) {
      return "high";
    }

    if (this.consecutiveFailures >= 1) {
      return "medium";
    }

    return "low";
  }
);


/**
 * ============================================================
 * INSTANCE METHODS
 * ============================================================
 */

AutoSaveSchema.methods.activate = function () {
  if (this.isDeleted) {
    throw new Error(
      "Deleted auto-save cannot be activated."
    );
  }

  if (this.status === "cancelled") {
    throw new Error(
      "Cancelled auto-save cannot be activated."
    );
  }

  if (this.status === "completed") {
    throw new Error(
      "Completed auto-save cannot be activated."
    );
  }

  this.status = "active";
  this.activatedAt =
    this.activatedAt || new Date();

  return this.save();
};


AutoSaveSchema.methods.pause = function () {
  if (this.status !== "active") {
    throw new Error(
      "Only an active auto-save can be paused."
    );
  }

  this.status = "paused";
  this.pausedAt = new Date();

  return this.save();
};


AutoSaveSchema.methods.cancel = function () {
  if (this.status === "cancelled") {
    return this;
  }

  if (this.status === "completed") {
    throw new Error(
      "Completed auto-save cannot be cancelled."
    );
  }

  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.nextExecutionAt = null;

  return this.save();
};


/**
 * ============================================================
 * EXECUTION RESULT METHODS
 * ============================================================
 *
 * These methods update reporting state only.
 *
 * SavingExecution remains the execution authority.
 * SavingContribution remains the financial authority.
 */

AutoSaveSchema.methods.recordSuccessfulExecution =
  async function (
    amount,
    executionDate = new Date()
  ) {
    const normalizedAmount = Number(amount);

    if (
      !Number.isFinite(normalizedAmount) ||
      normalizedAmount <= 0
    ) {
      throw new Error(
        "A valid positive amount is required."
      );
    }

    this.executionCount += 1;
    this.successfulExecutionCount += 1;

    this.totalSaved += normalizedAmount;

    this.consecutiveFailures = 0;
    this.lastFailureAt = null;
    this.lastFailureReason = null;

    this.lastExecutionAt =
      executionDate;

    /**
     * Maximum total reached.
     */
    if (
      this.maximumTotalAmount !== null &&
      this.totalSaved >=
        this.maximumTotalAmount
    ) {
      this.totalSaved =
        this.maximumTotalAmount;

      this.status = "completed";
      this.completedAt =
        executionDate;

      this.nextExecutionAt = null;
    }

    /**
     * End date reached.
     */
    if (
      this.endDate &&
      executionDate >= this.endDate
    ) {
      this.status = "completed";
      this.completedAt =
        executionDate;

      this.nextExecutionAt = null;
    }

    return this.save();
  };


AutoSaveSchema.methods.recordFailedExecution =
  async function (
    reason,
    failureDate = new Date()
  ) {
    this.executionCount += 1;
    this.failedExecutionCount += 1;
    this.consecutiveFailures += 1;

    this.lastFailureAt =
      failureDate;

    this.lastFailureReason = String(
      reason ||
        "Auto-save execution failed"
    ).slice(0, 500);

    /**
     * Repeated failures should pause the
     * configuration rather than permanently
     * mark the configuration as failed.
     */
    if (
      this.consecutiveFailures >=
        this.maximumConsecutiveFailures
    ) {
      this.status = "paused";
      this.pausedAt = failureDate;
      this.nextExecutionAt = null;
    }

    return this.save();
  };


/**
 * ============================================================
 * SOFT DELETE
 * ============================================================
 */

AutoSaveSchema.methods.softDelete =
  async function () {
    if (this.isDeleted) {
      return this;
    }

    this.isDeleted = true;
    this.deletedAt = new Date();
    this.status = "cancelled";
    this.cancelledAt =
      this.cancelledAt || new Date();
    this.nextExecutionAt = null;

    return this.save();
  };


/**
 * ============================================================
 * QUERY HELPERS
 * ============================================================
 */

AutoSaveSchema.query.active =
  function () {
    return this.where({
      status: "active",
      isDeleted: false,
    });
  };


AutoSaveSchema.query.due =
  function (date = new Date()) {
    return this.where({
      status: "active",
      isDeleted: false,
      nextExecutionAt: {
        $lte: date,
      },
    });
  };


AutoSaveSchema.query.forUser =
  function (userId) {
    return this.where({
      user: userId,
      isDeleted: false,
    });
  };


AutoSaveSchema.query.forGoal =
  function (goalId) {
    return this.where({
      savingGoal: goalId,
      isDeleted: false,
    });
  };


/**
 * ============================================================
 * JSON TRANSFORMATION
 * ============================================================
 */

AutoSaveSchema.set(
  "toJSON",
  {
    virtuals: true,

    transform: (_doc, ret) => {
      ret.id = ret._id;

      delete ret._id;
      delete ret.__v;

      /**
       * Never expose deletion metadata
       * to normal API consumers.
       */
      if (!ret.isDeleted) {
        delete ret.deletedAt;
      }

      return ret;
    },
  }
);


AutoSaveSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);


/**
 * ============================================================
 * MODEL
 * ============================================================
 */

const AutoSave =
  mongoose.models.AutoSave ||
  mongoose.model(
    "AutoSave",
    AutoSaveSchema
  );

export default AutoSave;