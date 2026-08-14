
import mongoose from "mongoose";

/**
 * =========================================================
 * SAVING ACCOUNT MODEL
 * =========================================================
 *
 * Represents a user's SmartSave savings destination/account.
 *
 * Responsibilities:
 * - Own a savings balance
 * - Track savings account lifecycle
 * - Support multiple savings accounts per user
 * - Support manual and automated savings
 * - Support future bank/open-banking integrations
 * - Maintain financial metadata and audit information
 *
 * Important:
 * This model must NOT store:
 * - Bank passwords
 * - PINs
 * - OTPs
 * - Card CVVs
 * - Raw banking credentials
 *
 * External banking credentials/tokens should live in a
 * dedicated encrypted banking integration model/service.
 * =========================================================
 */

/* =========================================================
   ENUMS
========================================================= */

const SAVING_ACCOUNT_TYPES = [
  "general",
  "emergency",
  "goal",
  "fixed",
  "flexible",
  "challenge",
];

const ACCOUNT_STATUSES = [
  "active",
  "paused",
  "locked",
  "closed",
];

const ACCOUNT_SOURCES = [
  "smartsave",
  "bank",
  "wallet",
  "cash",
  "external",
];

const CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
];

const INTEREST_FREQUENCIES = [
  "none",
  "daily",
  "monthly",
  "quarterly",
  "yearly",
];

/* =========================================================
   SAVING ACCOUNT SCHEMA
========================================================= */

const savingAccountSchema = new mongoose.Schema(
  {
    /* =====================================================
       OWNERSHIP
    ===================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    /* =====================================================
       ACCOUNT IDENTITY
    ===================================================== */

    name: {
      type: String,
      required: [true, "Saving account name is required"],
      trim: true,
      minlength: [2, "Account name must contain at least 2 characters"],
      maxlength: [100, "Account name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    accountType: {
      type: String,
      enum: {
        values: SAVING_ACCOUNT_TYPES,
        message: "Invalid saving account type",
      },
      default: "general",
      index: true,
    },

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    status: {
      type: String,
      enum: {
        values: ACCOUNT_STATUSES,
        message: "Invalid saving account status",
      },
      default: "active",
      index: true,
    },

    /* =====================================================
       CURRENCY
    ===================================================== */

    currency: {
      type: String,
      enum: {
        values: CURRENCIES,
        message: "Unsupported currency",
      },
      default: "NGN",
      uppercase: true,
      index: true,
    },

    /* =====================================================
       BALANCE
    ===================================================== */

    balance: {
      type: Number,
      required: true,
      min: [0, "Balance cannot be negative"],
      default: 0,
    },

    totalDeposited: {
      type: Number,
      min: [0, "Total deposited cannot be negative"],
      default: 0,
    },

    totalWithdrawn: {
      type: Number,
      min: [0, "Total withdrawn cannot be negative"],
      default: 0,
    },

    /* =====================================================
       TARGET / ACCOUNT CAPACITY
    ===================================================== */

    targetAmount: {
      type: Number,
      min: [0, "Target amount cannot be negative"],
      default: null,
    },

    minimumBalance: {
      type: Number,
      min: [0, "Minimum balance cannot be negative"],
      default: 0,
    },

    maximumBalance: {
      type: Number,
      min: [0, "Maximum balance cannot be negative"],
      default: null,
    },

    /* =====================================================
       INTEREST
    ===================================================== */

    interest: {
      enabled: {
        type: Boolean,
        default: false,
      },

      rate: {
        type: Number,
        min: [0, "Interest rate cannot be negative"],
        max: [100, "Interest rate cannot exceed 100"],
        default: 0,
      },

      frequency: {
        type: String,
        enum: {
          values: INTEREST_FREQUENCIES,
          message: "Invalid interest frequency",
        },
        default: "none",
      },

      accruedAmount: {
        type: Number,
        min: [0, "Accrued interest cannot be negative"],
        default: 0,
      },

      lastAccruedAt: {
        type: Date,
        default: null,
      },
    },

    /* =====================================================
       SOURCE
    ===================================================== */

    source: {
      type: String,
      enum: {
        values: ACCOUNT_SOURCES,
        message: "Invalid account source",
      },
      default: "smartsave",
      index: true,
    },

    /* =====================================================
       BANK CONNECTION METADATA
    =====================================================
    
    These fields identify an external financial institution
    without storing sensitive authentication credentials.
    ===================================================== */

    bankConnection: {
      connected: {
        type: Boolean,
        default: false,
      },

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

      externalAccountId: {
        type: String,
        trim: true,
        maxlength: 255,
        default: null,
      },

      accountType: {
        type: String,
        trim: true,
        maxlength: 50,
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
        maxlength: 50,
        default: null,
      },

      lastSyncedAt: {
        type: Date,
        default: null,
      },

      syncStatus: {
        type: String,
        enum: [
          "not_connected",
          "pending",
          "syncing",
          "synced",
          "failed",
          "disconnected",
        ],
        default: "not_connected",
      },

      syncError: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
    },

    /* =====================================================
       DEFAULT ACCOUNT
    ===================================================== */

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =====================================================
       AUTO-SAVE
    ===================================================== */

    autoSaveEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =====================================================
       WITHDRAWAL CONTROL
    ===================================================== */

    withdrawal: {
      enabled: {
        type: Boolean,
        default: true,
      },

      requiresConfirmation: {
        type: Boolean,
        default: true,
      },

      cooldownHours: {
        type: Number,
        min: [0, "Cooldown cannot be negative"],
        default: 0,
      },
    },

    /* =====================================================
       GOAL RELATIONSHIP
    ===================================================== */

    primaryGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingGoal",
      default: null,
      index: true,
    },

    /* =====================================================
       CHALLENGE RELATIONSHIP
    ===================================================== */

    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingChallenge",
      default: null,
      index: true,
    },

    /* =====================================================
       ACCOUNT DATES
    ===================================================== */

    openedAt: {
      type: Date,
      default: Date.now,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    lastTransactionAt: {
      type: Date,
      default: null,
      index: true,
    },

    /* =====================================================
       AUDIT
    ===================================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,

    versionKey: false,

    strict: true,

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
 * Remaining amount required to reach target.
 */
savingAccountSchema.virtual("remainingTarget").get(function () {
  if (
    this.targetAmount === null ||
    this.targetAmount === undefined
  ) {
    return null;
  }

  return Math.max(this.targetAmount - this.balance, 0);
});

/**
 * Target completion percentage.
 */
savingAccountSchema.virtual("progressPercentage").get(function () {
  if (
    !this.targetAmount ||
    this.targetAmount <= 0
  ) {
    return 0;
  }

  return Math.min(
    Number(
      ((this.balance / this.targetAmount) * 100).toFixed(2)
    ),
    100
  );
});

/**
 * Whether the target has been reached.
 */
savingAccountSchema.virtual("targetReached").get(function () {
  if (
    this.targetAmount === null ||
    this.targetAmount === undefined
  ) {
    return false;
  }

  return this.balance >= this.targetAmount;
});

/**
 * Whether the account can currently receive money.
 */
savingAccountSchema.virtual("canReceiveFunds").get(function () {
  return (
    this.status === "active" &&
    (
      this.maximumBalance === null ||
      this.maximumBalance === undefined ||
      this.balance < this.maximumBalance
    )
  );
});

/**
 * Whether withdrawals are currently permitted.
 */
savingAccountSchema.virtual("canWithdraw").get(function () {
  return (
    this.status === "active" &&
    this.withdrawal?.enabled === true
  );
});

/* =========================================================
   VALIDATION
========================================================= */

/**
 * Prevent maximum balance from being below minimum balance.
 */
savingAccountSchema.pre("validate", function (next) {
  if (
    this.maximumBalance !== null &&
    this.maximumBalance !== undefined &&
    this.maximumBalance < this.minimumBalance
  ) {
    return next(
      new Error(
        "Maximum balance cannot be lower than minimum balance"
      )
    );
  }

  next();
});

/**
 * Validate target amount.
 */
savingAccountSchema.pre("validate", function (next) {
  if (
    this.targetAmount !== null &&
    this.targetAmount !== undefined &&
    this.targetAmount <= 0
  ) {
    return next(
      new Error("Target amount must be greater than zero")
    );
  }

  next();
});

/**
 * Validate interest configuration.
 */
savingAccountSchema.pre("validate", function (next) {
  if (this.interest?.enabled) {
    if (!this.interest.rate || this.interest.rate <= 0) {
      return next(
        new Error(
          "Interest rate must be greater than zero when interest is enabled"
        )
      );
    }

    if (this.interest.frequency === "none") {
      return next(
        new Error(
          "Interest frequency must be specified when interest is enabled"
        )
      );
    }
  }

  next();
});

/* =========================================================
   BUSINESS-SAFETY VALIDATION
========================================================= */

/**
 * Balance accounting invariant.
 *
 * The account balance should normally correspond to:
 *
 * totalDeposited - totalWithdrawn + accruedInterest
 *
 * We intentionally do not automatically overwrite balance here.
 * Balance mutations should happen through a dedicated service/
 * transaction layer so financial operations remain atomic.
 */
savingAccountSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.balance < 0) {
      return next(
        new Error("Saving account balance cannot be negative")
      );
    }
  }

  next();
});

/* =========================================================
   INDEXES
========================================================= */

/**
 * User's active accounts.
 */
savingAccountSchema.index({
  user: 1,
  status: 1,
});

/**
 * User's account types.
 */
savingAccountSchema.index({
  user: 1,
  accountType: 1,
});

/**
 * User's default account lookup.
 */
savingAccountSchema.index({
  user: 1,
  isDefault: 1,
});

/**
 * Auto-save account lookup.
 */
savingAccountSchema.index({
  user: 1,
  autoSaveEnabled: 1,
  status: 1,
});

/**
 * Bank synchronization lookup.
 */
savingAccountSchema.index({
  "bankConnection.connected": 1,
  "bankConnection.syncStatus": 1,
});

/**
 * External banking account lookup.
 */
savingAccountSchema.index({
  "bankConnection.provider": 1,
  "bankConnection.externalAccountId": 1,
});

/**
 * Goal-based lookup.
 */
savingAccountSchema.index({
  user: 1,
  primaryGoal: 1,
});

/* =========================================================
   MODEL
========================================================= */

const SavingAccount =
  mongoose.models.SavingAccount ||
  mongoose.model(
    "SavingAccount",
    savingAccountSchema
  );

export default SavingAccount;
