
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ============================================================
 * SMARTSAVE — SAVING SCHEDULE MODEL
 * ============================================================
 *
 * Defines the rules SmartSave uses to automatically generate
 * saving contributions toward a SavingGoal.
 *
 * IMPORTANT:
 *
 * SavingSchedule is NOT a financial transaction.
 *
 * It defines an instruction:
 *
 *      "Save ₦10,000 every week toward my Emergency Fund."
 *
 * SavingContribution records what actually happened:
 *
 *      "₦10,000 was successfully contributed on Aug 11."
 *
 * ============================================================
 *
 * SUPPORTED STRATEGIES
 *
 * fixed
 *   Save a fixed monetary amount.
 *
 * percentage
 *   Save a percentage of a configured income/source amount.
 *
 * payday
 *   Save around the user's expected payday.
 *
 * round_up
 *   Future support for transaction round-ups.
 *
 * smart
 *   Future SmartBudget/AI-driven saving recommendations.
 *
 * ============================================================
 */

const SavingScheduleSchema = new Schema(
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
      index: true,
    },

    savingGoal: {
      type: Schema.Types.ObjectId,
      ref: "SavingGoal",
      required: [true, "Saving goal is required"],
      index: true,
    },

    /**
     * ========================================================
     * BASIC INFORMATION
     * ========================================================
     */

    name: {
      type: String,
      required: [true, "Schedule name is required"],
      trim: true,
      minlength: [2, "Schedule name is too short"],
      maxlength: [120, "Schedule name is too long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description is too long"],
      default: "",
    },

    /**
     * ========================================================
     * SAVING STRATEGY
     * ========================================================
     */

    strategy: {
      type: String,
      required: true,
      enum: [
        "fixed",
        "percentage",
        "payday",
        "round_up",
        "smart",
      ],
      default: "fixed",
      lowercase: true,
      trim: true,
      index: true,
    },

    /**
     * ========================================================
     * AMOUNT CONFIGURATION
     * ========================================================
     *
     * Fixed strategy:
     *
     *   amount = ₦10,000
     *
     * Percentage strategy:
     *
     *   percentage = 10
     *
     * Payday strategy can use amount or percentage depending
     * on the configuration.
     */

    amount: {
      type: Number,
      min: [0.01, "Saving amount must be greater than zero"],
      default: null,
      validate: {
        validator(value) {
          return (
            value === null ||
            value === undefined ||
            Number.isFinite(value)
          );
        },
        message: "Saving amount must be a valid number",
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
     * FREQUENCY
     * ========================================================
     */

    frequency: {
      type: String,
      required: true,
      enum: [
        "daily",
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "yearly",
        "payday",
        "custom",
      ],
      default: "monthly",
      lowercase: true,
      trim: true,
      index: true,
    },

    /**
     * ========================================================
     * WEEKLY CONFIGURATION
     * ========================================================
     *
     * 0 = Sunday
     * 1 = Monday
     * ...
     * 6 = Saturday
     */

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },

    /**
     * ========================================================
     * MONTHLY CONFIGURATION
     * ========================================================
     *
     * 1 - 31
     *
     * If the selected day does not exist in a month, the
     * execution service should fall back to the last valid
     * day of that month.
     */

    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },

    /**
     * ========================================================
     * PAYDAY CONFIGURATION
     * ========================================================
     */

    paydayOffset: {
      type: Number,
      min: [-31, "Payday offset is too early"],
      max: [31, "Payday offset is too late"],
      default: 0,
    },

    /**
     * ========================================================
     * CUSTOM INTERVAL
     * ========================================================
     *
     * Example:
     *
     * frequency = custom
     * interval = 3
     * intervalUnit = days
     *
     * Means:
     *
     * Every 3 days.
     */

    interval: {
      type: Number,
      min: [1, "Interval must be at least 1"],
      max: [365, "Interval is too large"],
      default: null,
    },

    intervalUnit: {
      type: String,
      enum: [
        "days",
        "weeks",
        "months",
      ],
      default: null,
    },

    /**
     * ========================================================
     * EXECUTION TIME
     * ========================================================
     */

    executionTime: {
      type: String,
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Execution time must use HH:mm format",
      ],
      default: "09:00",
    },

    timezone: {
      type: String,
      trim: true,
      default: "Africa/Lagos",
      maxlength: 100,
    },

    /**
     * ========================================================
     * DATE RANGE
     * ========================================================
     */

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

    /**
     * ========================================================
     * NEXT / LAST EXECUTION
     * ========================================================
     *
     * These fields are maintained by the schedule service.
     *
     * They should NOT be calculated by the frontend.
     */

    nextExecutionAt: {
      type: Date,
      default: null,
      index: true,
    },

    lastExecutionAt: {
      type: Date,
      default: null,
    },

    /**
     * ========================================================
     * EXECUTION STATUS
     * ========================================================
     */

    status: {
      type: String,
      required: true,
      enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "cancelled",
        "failed",
      ],
      default: "active",
      lowercase: true,
      trim: true,
      index: true,
    },

    /**
     * ========================================================
     * AUTO-SAVE CONTROL
     * ========================================================
     */

    isAutomatic: {
      type: Boolean,
      default: true,
      index: true,
    },

    autoResume: {
      type: Boolean,
      default: false,
    },

    /**
     * ========================================================
     * FUNDING SOURCE
     * ========================================================
     *
     * This prepares SmartSave for future bank integrations.
     *
     * manual
     *   User manually funds the saving.
     *
     * wallet
     *   SmartSave internal wallet/balance.
     *
     * bank
     *   Linked bank account.
     *
     * payment
     *   Payment provider.
     */

    fundingSource: {
      type: String,
      enum: [
        "manual",
        "wallet",
        "bank",
        "payment",
      ],
      default: "manual",
      lowercase: true,
      trim: true,
      index: true,
    },

    bankAccount: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
      index: true,
    },

    /**
     * ========================================================
     * EXECUTION LIMITS
     * ========================================================
     */

    maximumContribution: {
      type: Number,
      min: [0.01, "Maximum contribution must be greater than zero"],
      default: null,
    },

    minimumBalanceRequired: {
      type: Number,
      min: [0, "Minimum balance cannot be negative"],
      default: null,
    },

    /**
     * ========================================================
     * GOAL COMPLETION BEHAVIOUR
     * ========================================================
     *
     * stop
     *   Stop when the goal reaches its target.
     *
     * continue
     *   Continue contributing after target is reached.
     *
     * pause
     *   Automatically pause the schedule.
     */

    goalCompletionAction: {
      type: String,
      enum: [
        "stop",
        "pause",
        "continue",
      ],
      default: "stop",
      lowercase: true,
    },

    /**
     * ========================================================
     * EXECUTION COUNTERS
     * ========================================================
     */

    totalExecutions: {
      type: Number,
      min: 0,
      default: 0,
    },

    successfulExecutions: {
      type: Number,
      min: 0,
      default: 0,
    },

    failedExecutions: {
      type: Number,
      min: 0,
      default: 0,
    },

    skippedExecutions: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * ========================================================
     * TOTAL SAVED THROUGH THIS SCHEDULE
     * ========================================================
     *
     * This is a denormalized reporting value.
     *
     * The authoritative financial history remains
     * SavingContribution.
     */

    totalContributed: {
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

    lastFailureCode: {
      type: String,
      trim: true,
      maxlength: 100,
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
     * IDEMPOTENCY / EXECUTION CONTROL
     * ========================================================
     *
     * Critical when using:
     *
     * - cron jobs
     * - queues
     * - serverless functions
     * - bank webhooks
     * - payment webhooks
     *
     * Prevents the same schedule execution from generating
     * multiple contributions.
     */

    lastExecutionKey: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    /**
     * ========================================================
     * PAUSE INFORMATION
     * ========================================================
     */

    pausedAt: {
      type: Date,
      default: null,
    },

    pauseReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    /**
     * ========================================================
     * CANCELLATION
     * ========================================================
     */

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    /**
     * ========================================================
     * AUDIT INFORMATION
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
     *
     * Keep provider-specific information here rather than
     * continuously modifying the schema.
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
 * User's schedules.
 */
SavingScheduleSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Goal schedules.
 */
SavingScheduleSchema.index({
  savingGoal: 1,
  createdAt: -1,
});

/**
 * Active schedules waiting for execution.
 *
 * This index is extremely important for a background worker
 * or cron process.
 */
SavingScheduleSchema.index({
  status: 1,
  nextExecutionAt: 1,
});

/**
 * User + active schedules.
 */
SavingScheduleSchema.index({
  user: 1,
  status: 1,
  nextExecutionAt: 1,
});

/**
 * Bank-funded schedules.
 */
SavingScheduleSchema.index({
  fundingSource: 1,
  bankAccount: 1,
  status: 1,
});

/**
 * Automatic schedule processing.
 */
SavingScheduleSchema.index({
  isAutomatic: 1,
  status: 1,
  nextExecutionAt: 1,
});

/**
 * ============================================================
 * UNIQUE SCHEDULE PROTECTION
 * ============================================================
 *
 * A goal can have multiple schedules in the future, but we
 * prevent accidental duplicate schedule records when an
 * idempotency key is supplied.
 */

SavingScheduleSchema.index(
  {
    user: 1,
    metadata: 1,
  },
  {
    sparse: true,
  }
);

/**
 * ============================================================
 * VALIDATION — AMOUNT STRATEGY
 * ============================================================
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    /**
     * Fixed savings require amount.
     */
    if (
      this.strategy === "fixed" &&
      (!this.amount || this.amount <= 0)
    ) {
      return next(
        new Error(
          "Fixed saving schedules require a valid amount"
        )
      );
    }

    /**
     * Percentage savings require percentage.
     */
    if (
      this.strategy === "percentage" &&
      (!this.percentage ||
        this.percentage <= 0)
    ) {
      return next(
        new Error(
          "Percentage saving schedules require a valid percentage"
        )
      );
    }

    /**
     * Payday schedules require either amount or percentage.
     */
    if (
      this.strategy === "payday" &&
      !this.amount &&
      !this.percentage
    ) {
      return next(
        new Error(
          "Payday schedules require an amount or percentage"
        )
      );
    }

    next();
  }
);

/**
 * ============================================================
 * VALIDATION — FREQUENCY
 * ============================================================
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    /**
     * Weekly and biweekly schedules require a day.
     */
    if (
      ["weekly", "biweekly"].includes(
        this.frequency
      ) &&
      (this.dayOfWeek === null ||
        this.dayOfWeek === undefined)
    ) {
      return next(
        new Error(
          "Weekly schedules require a day of week"
        )
      );
    }

    /**
     * Monthly schedules require a day.
     */
    if (
      this.frequency === "monthly" &&
      (this.dayOfMonth === null ||
        this.dayOfMonth === undefined)
    ) {
      return next(
        new Error(
          "Monthly schedules require a day of month"
        )
      );
    }

    /**
     * Custom schedules require interval configuration.
     */
    if (this.frequency === "custom") {
      if (!this.interval) {
        return next(
          new Error(
            "Custom schedules require an interval"
          )
        );
      }

      if (!this.intervalUnit) {
        return next(
          new Error(
            "Custom schedules require an interval unit"
          )
        );
      }
    }

    next();
  }
);

/**
 * ============================================================
 * VALIDATION — DATE RANGE
 * ============================================================
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    if (
      this.endDate &&
      this.startDate &&
      this.endDate < this.startDate
    ) {
      return next(
        new Error(
          "End date cannot be before start date"
        )
      );
    }

    next();
  }
);

/**
 * ============================================================
 * VALIDATION — FUNDING SOURCE
 * ============================================================
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    /**
     * Bank funding must reference a bank account.
     */
    if (
      this.fundingSource === "bank" &&
      !this.bankAccount
    ) {
      return next(
        new Error(
          "Bank-funded schedules require a bank account"
        )
      );
    }

    /**
     * Non-bank schedules should not accidentally contain
     * a bank account reference.
     */
    if (
      this.fundingSource !== "bank" &&
      this.bankAccount
    ) {
      this.bankAccount = null;
    }

    next();
  }
);

/**
 * ============================================================
 * VALIDATION — AUTOMATIC EXECUTION
 * ============================================================
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    if (
      this.isAutomatic &&
      this.status === "active" &&
      !this.nextExecutionAt
    ) {
      /**
       * The actual execution service should calculate the
       * correct next execution date.
       *
       * We intentionally do not calculate complex timezone
       * schedules inside the MongoDB model.
       */
    }

    next();
  }
);

/**
 * ============================================================
 * FAILURE STATE PROTECTION
 * ============================================================
 */

SavingScheduleSchema.pre(
  "save",
  function (next) {
    /**
     * Automatically pause a schedule after too many
     * consecutive failures.
     */
    if (
      this.consecutiveFailures >=
        this.maximumConsecutiveFailures &&
      this.status === "active"
    ) {
      this.status = "paused";
      this.pausedAt = new Date();
      this.pauseReason =
        "Maximum consecutive execution failures reached";
    }

    next();
  }
);

/**
 * ============================================================
 * STATUS TRANSITION PROTECTION
 * ============================================================
 *
 * Prevent invalid lifecycle transitions.
 */

SavingScheduleSchema.pre(
  "validate",
  function (next) {
    /**
     * Cancelled schedules cannot become active again.
     *
     * A new schedule should be created instead.
     */
    if (
      this.isModified("status") &&
      this.status === "active" &&
      this.cancelledAt
    ) {
      return next(
        new Error(
          "Cancelled schedules cannot be reactivated"
        )
      );
    }

    /**
     * Completed schedules should not have a future execution.
     */
    if (this.status === "completed") {
      this.nextExecutionAt = null;
    }

    /**
     * Cancelled schedules should not have a future execution.
     */
    if (this.status === "cancelled") {
      this.nextExecutionAt = null;
    }

    next();
  }
);

/**
 * ============================================================
 * JSON TRANSFORMATION
 * ============================================================
 */

SavingScheduleSchema.set(
  "toJSON",
  {
    transform: (_doc, ret) => {
      ret.id = ret._id;

      delete ret._id;
      delete ret.__v;

      return ret;
    },
  }
);

/**
 * ============================================================
 * MODEL
 * ============================================================
 */

const SavingSchedule =
  mongoose.models.SavingSchedule ||
  mongoose.model(
    "SavingSchedule",
    SavingScheduleSchema
  );

export default SavingSchedule;
