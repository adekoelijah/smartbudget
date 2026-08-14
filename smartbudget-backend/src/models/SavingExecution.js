import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

export const SAVING_EXECUTION_STATUSES = [
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
];

export const SAVING_EXECUTION_TYPES = [
  "scheduled",
  "manual",
  "retry",
];

export const SAVING_EXECUTION_SOURCE_TYPES = [
  "internal_balance",
  "bank_account",
  "card",
  "wallet",
  "unknown",
];

export const SAVING_EXECUTION_FAILURE_CODES = [
  "INSUFFICIENT_FUNDS",
  "ACCOUNT_UNAVAILABLE",
  "BANK_REJECTED",
  "PAYMENT_REJECTED",
  "NETWORK_ERROR",
  "TIMEOUT",
  "AUTHENTICATION_ERROR",
  "LIMIT_EXCEEDED",
  "INVALID_ACCOUNT",
  "DUPLICATE_EXECUTION",
  "CANCELLED",
  "UNKNOWN_ERROR",
];

/* =========================================================
   LIMITS
========================================================= */

const MAX_AMOUNT = 999999999999999;

const MAX_RETRIES = 20;

const MAX_METADATA_KEYS = 50;

/* =========================================================
   HELPERS
========================================================= */

const isFinitePositiveNumber = (value) =>
  Number.isFinite(value) && value > 0;

const isFiniteNonNegativeNumber = (value) =>
  Number.isFinite(value) && value >= 0;

/* =========================================================
   SAVING EXECUTION SCHEMA
========================================================= */

/**
 * Represents one attempt to execute an automated/manual saving.
 *
 * IMPORTANT:
 *
 * SavingExecution does NOT represent the financial ledger.
 *
 * It represents:
 *
 *   "SmartSave attempted to move ₦10,000."
 *
 * SavingContribution represents:
 *
 *   "₦10,000 was successfully credited to the saving goal."
 *
 * Architecture:
 *
 * SavingGoal
 *      ↓
 * SavingSchedule
 *      ↓
 * SavingExecution
 *      ↓
 * SavingContribution
 */

const SavingExecutionSchema = new Schema(
  {
    /* =====================================================
       OWNERSHIP
    ===================================================== */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
      immutable: true,
    },

    /* =====================================================
       SAVING GOAL
    ===================================================== */

    savingGoal: {
      type: Schema.Types.ObjectId,
      ref: "SavingGoal",
      required: [true, "Saving goal is required"],
      index: true,
      immutable: true,
    },

    /* =====================================================
       SAVING SCHEDULE
    ===================================================== */

    savingSchedule: {
      type: Schema.Types.ObjectId,
      ref: "SavingSchedule",
      default: null,
      index: true,
      immutable: true,
    },

    /* =====================================================
       CONTRIBUTION
       =====================================================

       Populated only after a successful execution creates
       or links to a SavingContribution.
    */

    savingContribution: {
      type: Schema.Types.ObjectId,
      ref: "SavingContribution",
      default: null,
      index: true,
    },

    /* =====================================================
       EXECUTION TYPE
    ===================================================== */

    executionType: {
      type: String,
      enum: {
        values: SAVING_EXECUTION_TYPES,
        message: "{VALUE} is not a valid execution type",
      },
      required: [true, "Execution type is required"],
      default: "scheduled",
      lowercase: true,
      trim: true,
      index: true,
      immutable: true,
    },

    /* =====================================================
       EXECUTION STATUS
    ===================================================== */

    status: {
      type: String,
      enum: {
        values: SAVING_EXECUTION_STATUSES,
        message: "{VALUE} is not a valid execution status",
      },
      required: [true, "Execution status is required"],
      default: "pending",
      lowercase: true,
      trim: true,
      index: true,
    },

    /* =====================================================
       FINANCIAL INFORMATION
    ===================================================== */

    amount: {
      type: Number,
      required: [true, "Execution amount is required"],
      min: [
        0.01,
        "Execution amount must be greater than zero",
      ],
      max: [
        MAX_AMOUNT,
        "Execution amount exceeds the supported limit",
      ],
      validate: {
        validator(value) {
          return isFinitePositiveNumber(value);
        },
        message: "Execution amount must be a valid positive number",
      },
      immutable: true,
    },

    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "NGN",
      uppercase: true,
      trim: true,
      minlength: [
        3,
        "Currency must be a valid ISO currency code",
      ],
      maxlength: [
        3,
        "Currency must be a valid ISO currency code",
      ],
      immutable: true,
    },

    /* =====================================================
       SOURCE
    ===================================================== */

    sourceType: {
      type: String,
      enum: {
        values: SAVING_EXECUTION_SOURCE_TYPES,
        message: "{VALUE} is not a valid source type",
      },
      required: [true, "Source type is required"],
      default: "internal_balance",
      lowercase: true,
      trim: true,
      index: true,
      immutable: true,
    },

    /* =====================================================
       SOURCE ACCOUNT
    ===================================================== */

    sourceAccount: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
      index: true,
      immutable: true,
    },

    /* =====================================================
       SOURCE ACCOUNT SNAPSHOT
    =====================================================

       Historical snapshot of the funding source.

       NEVER store:
       - PIN
       - CVV
       - password
       - access token
       - refresh token
       - authorization secret
       - full sensitive credentials
    */

    sourceAccountSnapshot: {
      provider: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      institutionName: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null,
      },

      accountName: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null,
      },

      accountNumberMasked: {
        type: String,
        trim: true,
        maxlength: 30,
        default: null,
      },

      accountId: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null,
      },
    },

    /* =====================================================
       SCHEDULED EXECUTION
    ===================================================== */

    scheduledFor: {
      type: Date,
      required: [true, "Scheduled execution date is required"],
      index: true,
      immutable: true,
    },

    /* =====================================================
       PROCESSING TIMESTAMPS
    ===================================================== */

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       FAILURE INFORMATION
    ===================================================== */

    failureCode: {
      type: String,
      enum: {
        values: SAVING_EXECUTION_FAILURE_CODES,
        message: "{VALUE} is not a valid failure code",
      },
      default: null,
      index: true,
    },

    failureMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    /* =====================================================
       RETRY MANAGEMENT
    ===================================================== */

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
      max: MAX_RETRIES,
    },

    maxRetries: {
      type: Number,
      default: 3,
      min: 0,
      max: MAX_RETRIES,
    },

    nextRetryAt: {
      type: Date,
      default: null,
      index: true,
    },

    /* =====================================================
       IDEMPOTENCY
    =====================================================

       Prevents duplicate financial execution attempts.

       Example:

       user + schedule + execution date

       must not accidentally generate two executions.
    */

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      trim: true,
      minlength: [
        8,
        "Idempotency key is too short",
      ],
      maxlength: [
        200,
        "Idempotency key is too long",
      ],
      immutable: true,
      index: true,
    },

    /* =====================================================
       PROVIDER INFORMATION
    ===================================================== */

    providerName: {
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
      index: true,
    },

    providerResponse: {
      code: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      status: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      message: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
    },

    /* =====================================================
       EXECUTION METADATA
    ===================================================== */

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
      validate: {
        validator(value) {
          if (!(value instanceof Map)) {
            return true;
          }

          return value.size <= MAX_METADATA_KEYS;
        },
        message: `Metadata cannot contain more than ${MAX_METADATA_KEYS} keys`,
      },
    },

    /* =====================================================
       INTERNAL ERROR INFORMATION
    =====================================================

       Stack traces are never returned by toJSON().
    */

    error: {
      code: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      message: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: null,
      },

      stack: {
        type: String,
        maxlength: 5000,
        default: null,
      },
    },

    /* =====================================================
       CANCELLATION
    ===================================================== */

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    /* =====================================================
       AUDIT
    ===================================================== */

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
  },
  {
    timestamps: true,

    versionKey: "__v",

    strict: true,

    minimize: false,

    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

/*
 * User execution history.
 */
SavingExecutionSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Goal execution history.
 */
SavingExecutionSchema.index({
  savingGoal: 1,
  scheduledFor: -1,
});

/*
 * Schedule execution history.
 */
SavingExecutionSchema.index({
  savingSchedule: 1,
  scheduledFor: -1,
});

/*
 * Pending executions waiting to be processed.
 *
 * Very important for:
 * - cron workers
 * - queues
 * - background workers
 */
SavingExecutionSchema.index({
  status: 1,
  scheduledFor: 1,
});

/*
 * Retry queue.
 */
SavingExecutionSchema.index({
  status: 1,
  nextRetryAt: 1,
});

/*
 * Bank-account execution history.
 */
SavingExecutionSchema.index({
  sourceAccount: 1,
  createdAt: -1,
});

/*
 * Provider reconciliation.
 */
SavingExecutionSchema.index({
  providerName: 1,
  providerReference: 1,
});

/*
 * Unique financial execution idempotency.
 */
SavingExecutionSchema.index(
  {
    user: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,
    name: "unique_user_saving_execution_idempotency",
  }
);

/*
 * Prevent the same provider transaction from being
 * associated with multiple executions.
 *
 * Partial index is important because providerReference
 * is optional.
 */
SavingExecutionSchema.index(
  {
    providerName: 1,
    providerReference: 1,
  },
  {
    unique: true,
    name: "unique_provider_execution_reference",
    partialFilterExpression: {
      providerReference: {
        $type: "string",
      },
    },
  }
);

/* =========================================================
   VALIDATION
========================================================= */

/*
 * Source-account consistency.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      this.sourceType === "bank_account" &&
      !this.sourceAccount
    ) {
      return next(
        new Error(
          "Bank-account executions require a source account"
        )
      );
    }

    if (
      this.sourceType !== "bank_account" &&
      this.sourceAccount
    ) {
      this.sourceAccount = null;
    }

    next();
  }
);

/*
 * Scheduled executions should normally reference a schedule.
 *
 * Manual executions are allowed without one.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      ["scheduled", "retry"].includes(
        this.executionType
      ) &&
      !this.savingSchedule
    ) {
      return next(
        new Error(
          `${this.executionType} executions require a saving schedule`
        )
      );
    }

    next();
  }
);

/*
 * Retry executions must have retry history.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      this.executionType === "retry" &&
      this.retryCount < 1
    ) {
      this.retryCount = 1;
    }

    next();
  }
);

/*
 * Processing timestamp.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      this.status === "processing" &&
      !this.startedAt
    ) {
      this.startedAt = new Date();
    }

    next();
  }
);

/*
 * Successful execution validation.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (this.status === "successful") {
      if (!this.completedAt) {
        this.completedAt = new Date();
      }

      this.failureCode = null;
      this.failureMessage = null;
      this.nextRetryAt = null;
    }

    next();
  }
);

/*
 * Failed execution validation.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (this.status === "failed") {
      if (!this.failureCode) {
        this.failureCode = "UNKNOWN_ERROR";
      }

      if (
        !this.failureMessage &&
        this.error?.message
      ) {
        this.failureMessage =
          this.error.message;
      }
    }

    next();
  }
);

/*
 * Cancelled execution validation.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (this.status === "cancelled") {
      if (!this.cancelledAt) {
        this.cancelledAt = new Date();
      }

      this.nextRetryAt = null;
    }

    next();
  }
);

/*
 * Successful execution must reference a contribution.
 *
 * This is an important SmartSave invariant:
 *
 * successful execution
 *       ↓
 * SavingContribution
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      this.status === "successful" &&
      !this.savingContribution
    ) {
      return next(
        new Error(
          "Successful executions must reference a saving contribution"
        )
      );
    }

    next();
  }
);

/*
 * Cancelled executions cannot be retried.
 */
SavingExecutionSchema.pre(
  "validate",
  function (next) {
    if (
      this.status === "cancelled" &&
      this.nextRetryAt
    ) {
      this.nextRetryAt = null;
    }

    next();
  }
);

/* =========================================================
   QUERY HELPERS
========================================================= */

SavingExecutionSchema.query.pending = function () {
  return this.where({
    status: "pending",
  });
};

SavingExecutionSchema.query.processing = function () {
  return this.where({
    status: "processing",
  });
};

SavingExecutionSchema.query.failed = function () {
  return this.where({
    status: "failed",
  });
};

SavingExecutionSchema.query.successful = function () {
  return this.where({
    status: "successful",
  });
};

SavingExecutionSchema.query.cancelled = function () {
  return this.where({
    status: "cancelled",
  });
};

SavingExecutionSchema.query.forUser =
  function (userId) {
    return this.where({
      user: userId,
    });
  };

SavingExecutionSchema.query.forGoal =
  function (goalId) {
    return this.where({
      savingGoal: goalId,
    });
  };

SavingExecutionSchema.query.forSchedule =
  function (scheduleId) {
    return this.where({
      savingSchedule: scheduleId,
    });
  };

/* =========================================================
   INSTANCE METHODS
========================================================= */

/*
 * Is this execution terminal?
 */
SavingExecutionSchema.methods.isTerminal =
  function () {
    return [
      "successful",
      "failed",
      "cancelled",
    ].includes(this.status);
  };

/*
 * Can this execution be processed?
 */
SavingExecutionSchema.methods.canProcess =
  function () {
    return this.status === "pending";
  };

/*
 * Can this execution be retried?
 */
SavingExecutionSchema.methods.canRetry =
  function () {
    return (
      this.status === "failed" &&
      this.retryCount < this.maxRetries
    );
  };

/*
 * Can this execution be cancelled?
 */
SavingExecutionSchema.methods.canCancel =
  function () {
    return [
      "pending",
      "processing",
      "failed",
    ].includes(this.status);
  };

/*
 * Mark execution as processing.
 */
SavingExecutionSchema.methods.markProcessing =
  function () {
    if (!this.canProcess()) {
      throw new Error(
        `Execution cannot be processed from ${this.status} status`
      );
    }

    this.status = "processing";

    if (!this.startedAt) {
      this.startedAt = new Date();
    }

    return this;
  };

/*
 * Mark execution as successful.
 */
SavingExecutionSchema.methods.markSuccessful =
  function ({
    contribution,
    providerName = null,
    providerReference = null,
    providerResponse = null,
  } = {}) {
    if (!contribution) {
      throw new Error(
        "Successful execution requires a saving contribution"
      );
    }

    if (
      !["pending", "processing"].includes(
        this.status
      )
    ) {
      throw new Error(
        `Execution cannot be marked successful from ${this.status} status`
      );
    }

    this.status = "successful";

    this.savingContribution =
      contribution;

    this.providerName =
      providerName;

    this.providerReference =
      providerReference;

    if (providerResponse) {
      this.providerResponse =
        providerResponse;
    }

    this.completedAt = new Date();

    this.failureCode = null;
    this.failureMessage = null;
    this.nextRetryAt = null;

    return this;
  };

/*
 * Mark execution as failed.
 */
SavingExecutionSchema.methods.markFailed =
  function ({
    failureCode = "UNKNOWN_ERROR",
    failureMessage = null,
    error = null,
    retry = false,
    nextRetryAt = null,
  } = {}) {
    if (
      ![
        "processing",
        "pending",
      ].includes(this.status)
    ) {
      throw new Error(
        `Execution cannot be marked failed from ${this.status} status`
      );
    }

    this.status = "failed";

    this.failureCode =
      failureCode;

    this.failureMessage =
      failureMessage;

    this.completedAt = new Date();

    this.nextRetryAt = retry
      ? nextRetryAt
      : null;

    if (retry) {
      if (
        this.retryCount >=
        this.maxRetries
      ) {
        throw new Error(
          "Maximum retry limit has been reached"
        );
      }

      this.retryCount += 1;
    }

    if (error) {
      this.error = {
        code:
          error.code ||
          failureCode ||
          null,

        message:
          error.message ||
          failureMessage ||
          null,

        stack:
          error.stack ||
          null,
      };
    }

    return this;
  };

/*
 * Mark execution as cancelled.
 */
SavingExecutionSchema.methods.markCancelled =
  function ({
    cancelledBy = null,
    reason = null,
  } = {}) {
    if (!this.canCancel()) {
      throw new Error(
        `Execution cannot be cancelled from ${this.status} status`
      );
    }

    this.status = "cancelled";

    this.cancelledAt =
      new Date();

    this.cancelledBy =
      cancelledBy;

    this.cancellationReason =
      reason;

    this.nextRetryAt = null;

    this.completedAt =
      this.completedAt ||
      new Date();

    return this;
  };

/*
 * Generate safe API representation.
 */
SavingExecutionSchema.methods.toSafeObject =
  function () {
    const execution =
      this.toObject({
        flattenMaps: true,
      });

    if (execution.error) {
      delete execution.error.stack;
    }

    return execution;
  };

/* =========================================================
   STATIC METHODS
========================================================= */

/*
 * Find pending executions ready for processing.
 */
SavingExecutionSchema.statics.findPendingExecutions =
  function ({
    limit = 50,
    now = new Date(),
  } = {}) {
    return this.find({
      status: "pending",
      scheduledFor: {
        $lte: now,
      },
    })
      .sort({
        scheduledFor: 1,
      })
      .limit(limit);
  };

/*
 * Find failed executions ready for retry.
 */
SavingExecutionSchema.statics.findRetryableExecutions =
  function ({
    limit = 50,
    now = new Date(),
  } = {}) {
    return this.find({
      status: "failed",
      nextRetryAt: {
        $ne: null,
        $lte: now,
      },
      $expr: {
        $lt: [
          "$retryCount",
          "$maxRetries",
        ],
      },
    })
      .sort({
        nextRetryAt: 1,
      })
      .limit(limit);
  };

/*
 * Find user execution history.
 */
SavingExecutionSchema.statics.findUserExecutions =
  function (
    userId,
    {
      limit = 50,
      skip = 0,
    } = {}
  ) {
    return this.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);
  };

/*
 * Find goal execution history.
 */
SavingExecutionSchema.statics.findGoalExecutions =
  function (
    goalId,
    {
      limit = 50,
      skip = 0,
    } = {}
  ) {
    return this.find({
      savingGoal: goalId,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);
  };

/*
 * Find schedule execution history.
 */
SavingExecutionSchema.statics.findScheduleExecutions =
  function (
    scheduleId,
    {
      limit = 50,
      skip = 0,
    } = {}
  ) {
    return this.find({
      savingSchedule: scheduleId,
    })
      .sort({
        scheduledFor: -1,
      })
      .skip(skip)
      .limit(limit);
  };

/* =========================================================
   JSON TRANSFORMATION
========================================================= */

SavingExecutionSchema.set(
  "toJSON",
  {
    virtuals: true,

    transform: (_doc, ret) => {
      ret.id = ret._id;

      delete ret._id;
      delete ret.__v;

      /*
       * Never expose internal stack traces.
       */
      if (ret.error) {
        delete ret.error.stack;
      }

      return ret;
    },
  }
);

/* =========================================================
   OBJECT TRANSFORMATION
========================================================= */

SavingExecutionSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);

/* =========================================================
   MODEL
========================================================= */

const SavingExecution =
  mongoose.models.SavingExecution ||
  mongoose.model(
    "SavingExecution",
    SavingExecutionSchema
  );

export default SavingExecution;