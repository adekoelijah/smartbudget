import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

const CONTRIBUTION_SOURCES = [
  "manual",
  "automatic",
  "bank",
  "payment",
];

const CONTRIBUTION_STATUSES = [
  "pending",
  "completed",
  "failed",
  "reversed",
  "cancelled",
];

const CURRENCIES = ["NGN"];

const PAYMENT_PROVIDERS = [
  "paystack",
  "flutterwave",
  "bank",
  "other",
];

/* =========================================================
   SAVING CONTRIBUTION SCHEMA
========================================================= */

const savingContributionSchema = new Schema(
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

    savingGoal: {
      type: Schema.Types.ObjectId,
      ref: "SavingGoal",
      required: [true, "Saving goal is required"],
      index: true,
      immutable: true,
    },

    /* =====================================================
       FINANCIAL INFORMATION
    ===================================================== */

    amount: {
      type: Number,
      required: [true, "Contribution amount is required"],
      min: [
        0.01,
        "Contribution amount must be greater than zero",
      ],
      max: [
        999999999999999,
        "Contribution amount exceeds the supported limit",
      ],
      validate: {
        validator(value) {
          return Number.isFinite(value);
        },
        message: "Contribution amount must be a valid number",
      },
      immutable: true,
    },

    currency: {
      type: String,
      required: true,
      enum: {
        values: CURRENCIES,
        message: "{VALUE} is not a supported currency",
      },
      uppercase: true,
      trim: true,
      default: "NGN",
      immutable: true,
    },

    /* =====================================================
       CONTRIBUTION SOURCE
    ===================================================== */

    source: {
      type: String,
      required: true,
      enum: {
        values: CONTRIBUTION_SOURCES,
        message: "{VALUE} is not a valid contribution source",
      },
      lowercase: true,
      trim: true,
      default: "manual",
      index: true,
      immutable: true,
    },

    /* =====================================================
       TRANSACTION STATUS
    ===================================================== */

    status: {
      type: String,
      required: true,
      enum: {
        values: CONTRIBUTION_STATUSES,
        message: "{VALUE} is not a valid contribution status",
      },
      lowercase: true,
      trim: true,
      default: "pending",
      index: true,
    },

    /* =====================================================
       CONTRIBUTION LIFECYCLE
    ===================================================== */

    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
      immutable: true,
    },

    completedAt: {
      type: Date,
      default: null,
      index: true,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    reversedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       IDEMPOTENCY
    ===================================================== */

    idempotencyKey: {
      type: String,
      trim: true,
      maxlength: [
        150,
        "Idempotency key cannot exceed 150 characters",
      ],
      immutable: true,
    },

    /* =====================================================
       EXTERNAL TRANSACTION REFERENCES
    ===================================================== */

    externalReference: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
      index: true,
      immutable: true,
    },

    provider: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 50,
      enum: {
        values: PAYMENT_PROVIDERS,
        message: "{VALUE} is not a supported payment provider",
      },
      default: null,
      index: true,
      immutable: true,
    },

    providerTransactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
      index: true,
      immutable: true,
    },

    /* =====================================================
       BANK TRANSACTION INFORMATION
    ===================================================== */

    bankTransactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
      index: true,
      immutable: true,
    },

    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      default: null,
      index: true,
      immutable: true,
    },

    /* =====================================================
       AUTOMATIC SAVINGS
    ===================================================== */

    isAutomatic: {
      type: Boolean,
      default: false,
      index: true,
      immutable: true,
    },

    savingSchedule: {
      type: Schema.Types.ObjectId,
      ref: "SavingSchedule",
      default: null,
      index: true,
      immutable: true,
    },

    savingPlan: {
      type: Schema.Types.ObjectId,
      ref: "SavingPlan",
      default: null,
      index: true,
      immutable: true,
    },

    autoSave: {
      type: Schema.Types.ObjectId,
      ref: "AutoSave",
      default: null,
      index: true,
      immutable: true,
    },

    /* =====================================================
       DESCRIPTION / MEMO
    ===================================================== */

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    /* =====================================================
       REVERSAL
    ===================================================== */

    reversalReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    reversedContribution: {
      type: Schema.Types.ObjectId,
      ref: "SavingContribution",
      default: null,
      index: true,
    },

    /* =====================================================
       FAILURE
    ===================================================== */

    failureCode: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    failureReason: {
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

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,

    strict: true,

    minimize: true,

    versionKey: "__v",

    toJSON: {
      virtuals: true,

      transform: (_doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
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
   INDEXES
========================================================= */

/*
 * User contribution history.
 */
savingContributionSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * User + status reporting.
 */
savingContributionSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

/*
 * Goal contribution history.
 */
savingContributionSchema.index({
  savingGoal: 1,
  createdAt: -1,
});

/*
 * Goal + status reporting.
 */
savingContributionSchema.index({
  savingGoal: 1,
  status: 1,
  createdAt: -1,
});

/*
 * Completed contributions.
 */
savingContributionSchema.index({
  savingGoal: 1,
  completedAt: -1,
});

/*
 * Automatic savings.
 */
savingContributionSchema.index({
  user: 1,
  isAutomatic: 1,
  createdAt: -1,
});

/*
 * Saving schedule execution history.
 */
savingContributionSchema.index({
  savingSchedule: 1,
  createdAt: -1,
});

/*
 * Saving plan history.
 */
savingContributionSchema.index({
  savingPlan: 1,
  createdAt: -1,
});

/*
 * AutoSave history.
 */
savingContributionSchema.index({
  autoSave: 1,
  createdAt: -1,
});

/*
 * Bank reconciliation.
 */
savingContributionSchema.index({
  bankAccountId: 1,
  bankTransactionId: 1,
});

/*
 * Provider reconciliation.
 */
savingContributionSchema.index({
  provider: 1,
  providerTransactionId: 1,
});

/*
 * External reference lookup.
 */
// savingContributionSchema.index({
//   externalReference: 1,
// });

/* =========================================================
   IDEMPOTENCY
========================================================= */

savingContributionSchema.index(
  {
    user: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      idempotencyKey: {
        $type: "string",
      },
    },
  }
);

/* =========================================================
   VALIDATION
========================================================= */

/*
 * Contribution lifecycle validation.
 */
savingContributionSchema.pre(
  "validate",
  function (next) {
    /*
     * Completed contribution.
     */
    if (
      this.status === "completed" &&
      !this.completedAt
    ) {
      this.completedAt = new Date();
    }

    /*
     * Failed contribution.
     */
    if (
      this.status === "failed" &&
      !this.failedAt
    ) {
      this.failedAt = new Date();
    }

    /*
     * Cancelled contribution.
     */
    if (
      this.status === "cancelled" &&
      !this.cancelledAt
    ) {
      this.cancelledAt = new Date();
    }

    /*
     * Reversed contribution.
     */
    if (
      this.status === "reversed" &&
      !this.reversedAt
    ) {
      this.reversedAt = new Date();
    }

    next();
  }
);

/* =========================================================
   SOURCE VALIDATION
========================================================= */

savingContributionSchema.pre(
  "validate",
  function (next) {
    /*
     * Automatic contributions must have an
     * automation source.
     */
    if (this.isAutomatic) {
      if (
        !this.savingSchedule &&
        !this.savingPlan &&
        !this.autoSave
      ) {
        return next(
          new Error(
            "Automatic contributions must reference a saving schedule, saving plan, or AutoSave configuration"
          )
        );
      }
    }

    /*
     * Bank contributions require bank transaction
     * information.
     */
    if (this.source === "bank") {
      if (
        !this.bankTransactionId &&
        !this.externalReference
      ) {
        return next(
          new Error(
            "Bank contributions require a transaction reference"
          )
        );
      }
    }

    /*
     * Payment contributions require provider data.
     */
    if (this.source === "payment") {
      if (!this.provider) {
        return next(
          new Error(
            "Payment contributions require a payment provider"
          )
        );
      }

      if (
        !this.providerTransactionId &&
        !this.externalReference
      ) {
        return next(
          new Error(
            "Payment contributions require a provider transaction reference"
          )
        );
      }
    }

    next();
  }
);

/* =========================================================
   SOURCE CONSISTENCY
========================================================= */

savingContributionSchema.pre(
  "validate",
  function (next) {
    /*
     * Automatic flag must agree with source.
     */
    if (
      this.source === "automatic" &&
      !this.isAutomatic
    ) {
      this.isAutomatic = true;
    }

    /*
     * Automatic records should not be marked
     * as manual.
     */
    if (
      this.isAutomatic &&
      this.source === "manual"
    ) {
      return next(
        new Error(
          "Automatic contributions cannot use the manual source"
        )
      );
    }

    next();
  }
);

/* =========================================================
   STATUS CONSISTENCY
========================================================= */

savingContributionSchema.pre(
  "validate",
  function (next) {
    /*
     * Completed contributions cannot simultaneously
     * be failed/cancelled/reversed.
     */
    if (
      this.status === "completed" &&
      (
        this.failedAt ||
        this.cancelledAt ||
        this.reversedAt
      )
    ) {
      return next(
        new Error(
          "Completed contribution contains invalid lifecycle timestamps"
        )
      );
    }

    /*
     * Reversed contributions must reference
     * reversal information.
     */
    if (
      this.status === "reversed" &&
      !this.reversalReason
    ) {
      return next(
        new Error(
          "Reversed contributions require a reversal reason"
        )
      );
    }

    next();
  }
);

/* =========================================================
   IMMUTABILITY PROTECTION
========================================================= */

/*
 * Financial facts should not be changed through
 * ordinary update operations.
 *
 * Reversal should create a separate financial record
 * rather than mutating the original contribution.
 */
savingContributionSchema.pre(
  "findOneAndUpdate",
  function (next) {
    const update = this.getUpdate() || {};

    const blockedFields = [
      "amount",
      "currency",
      "user",
      "savingGoal",
      "source",
      "provider",
      "providerTransactionId",
      "bankAccountId",
      "bankTransactionId",
      "externalReference",
      "idempotencyKey",
      "requestedAt",
      "createdBy",
      "savingSchedule",
      "savingPlan",
      "autoSave",
      "isAutomatic",
    ];

    const updates = {
      ...(update.$set || {}),
      ...(update.$setOnInsert || {}),
    };

    const attemptedMutation =
      Object.keys(updates).some((field) =>
        blockedFields.includes(field)
      );

    if (attemptedMutation) {
      return next(
        new Error(
          "Financial contribution fields cannot be modified after creation"
        )
      );
    }

    next();
  }
);

/* =========================================================
   INSTANCE METHODS
========================================================= */

/*
 * Determine whether the contribution is financially
 * settled.
 */
savingContributionSchema.methods.isSettled =
  function () {
    return this.status === "completed";
  };

/*
 * Determine whether the contribution can be reversed.
 */
savingContributionSchema.methods.canReverse =
  function () {
    return (
      this.status === "completed" &&
      !this.reversedAt
    );
  };

/*
 * Mark contribution as completed.
 *
 * Prefer using a dedicated service for production
 * financial workflows.
 */
savingContributionSchema.methods.markCompleted =
  function () {
    if (
      this.status === "completed"
    ) {
      return this;
    }

    if (
      ["failed", "cancelled", "reversed"].includes(
        this.status
      )
    ) {
      throw new Error(
        `A ${this.status} contribution cannot be completed`
      );
    }

    this.status = "completed";
    this.completedAt = new Date();

    this.failedAt = null;
    this.cancelledAt = null;

    return this;
  };

/*
 * Mark contribution as failed.
 */
savingContributionSchema.methods.markFailed =
  function (
    reason = "Contribution failed",
    code = null
  ) {
    if (
      this.status === "completed"
    ) {
      throw new Error(
        "Completed contributions cannot be marked as failed"
      );
    }

    this.status = "failed";
    this.failedAt = new Date();
    this.failureReason = reason;
    this.failureCode = code;

    return this;
  };

/*
 * Cancel a pending contribution.
 */
savingContributionSchema.methods.cancel =
  function () {
    if (
      this.status !== "pending"
    ) {
      throw new Error(
        "Only pending contributions can be cancelled"
      );
    }

    this.status = "cancelled";
    this.cancelledAt = new Date();

    return this;
  };

/*
 * Mark contribution as reversed.
 */
savingContributionSchema.methods.reverse =
  function (reason) {
    if (!this.canReverse()) {
      throw new Error(
        "Only completed contributions can be reversed"
      );
    }

    if (!reason?.trim()) {
      throw new Error(
        "A reversal reason is required"
      );
    }

    this.status = "reversed";
    this.reversedAt = new Date();
    this.reversalReason =
      reason.trim();

    return this;
  };

/* =========================================================
   QUERY HELPERS
========================================================= */

/*
 * User contributions.
 */
savingContributionSchema.query.forUser =
  function (userId) {
    return this.where({
      user: userId,
    });
  };

/*
 * Goal contributions.
 */
savingContributionSchema.query.forGoal =
  function (goalId) {
    return this.where({
      savingGoal: goalId,
    });
  };

/*
 * Completed contributions.
 */
savingContributionSchema.query.completed =
  function () {
    return this.where({
      status: "completed",
    });
  };

/*
 * Pending contributions.
 */
savingContributionSchema.query.pending =
  function () {
    return this.where({
      status: "pending",
    });
  };

/*
 * Automatic contributions.
 */
savingContributionSchema.query.automatic =
  function () {
    return this.where({
      isAutomatic: true,
    });
  };

/* =========================================================
   MODEL
========================================================= */

const SavingContribution =
  mongoose.models.SavingContribution ||
  mongoose.model(
    "SavingContribution",
    savingContributionSchema
  );

export default SavingContribution;