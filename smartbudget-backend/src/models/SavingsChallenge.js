import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================================================
   ENUMS
========================================================= */

const CHALLENGE_TYPES = [
  "fixed_amount",
  "incremental",
  "percentage",
  "round_up",
  "no_spend",
  "streak",
  "custom",
];

const FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "custom",
];

const STATUS = [
  "draft",
  "active",
  "paused",
  "completed",
  "failed",
  "expired",
  "cancelled",
];

const SOURCE_TYPES = [
  "system",
  "user",
  "admin",
];

const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

const VISIBILITY_TYPES = [
  "private",
  "public",
];

const CURRENCY_CODES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
];

/* =========================================================
   SUB-SCHEMAS
========================================================= */

/**
 * Challenge target configuration.
 *
 * This allows different challenge algorithms without
 * creating separate collections.
 */
const TargetSchema = new Schema(
  {
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    startingAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    incrementAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    maximumAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    targetAmount: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  {
    _id: false,
  }
);

/**
 * Challenge frequency configuration.
 */
const FrequencySchema = new Schema(
  {
    type: {
      type: String,
      enum: FREQUENCIES,
      required: true,
      default: "weekly",
    },

    interval: {
      type: Number,
      min: 1,
      default: 1,
    },

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },

    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/**
 * Streak tracking.
 */
const StreakSchema = new Schema(
  {
    current: {
      type: Number,
      min: 0,
      default: 0,
    },

    longest: {
      type: Number,
      min: 0,
      default: 0,
    },

    lastContributionAt: {
      type: Date,
      default: null,
    },

    lastSuccessfulPeriod: {
      type: String,
      default: null,
    },

    missedPeriods: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

/**
 * Progress snapshot.
 *
 * These values are denormalized intentionally so dashboard
 * queries do not need to calculate everything from the
 * contribution ledger.
 */
const ProgressSchema = new Schema(
  {
    contributedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    expectedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    contributionCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    successfulPeriods: {
      type: Number,
      min: 0,
      default: 0,
    },

    missedPeriods: {
      type: Number,
      min: 0,
      default: 0,
    },

    lastCalculatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/**
 * Reward configuration.
 */
const RewardSchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: [
        "badge",
        "points",
        "cashback",
        "interest_bonus",
        "none",
      ],
      default: "none",
    },

    value: {
      type: Number,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    awarded: {
      type: Boolean,
      default: false,
    },

    awardedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/**
 * Completion information.
 */
const CompletionSchema = new Schema(
  {
    completedAt: {
      type: Date,
      default: null,
    },

    completedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    rewardGranted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/**
 * Pause information.
 */
const PauseSchema = new Schema(
  {
    pausedAt: {
      type: Date,
      default: null,
    },

    pausedUntil: {
      type: Date,
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    totalPauseDays: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   MAIN SCHEMA
========================================================= */

const SavingsChallengeSchema = new Schema(
  {
    /* =====================================================
       OWNERSHIP
    ===================================================== */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =====================================================
       IDENTITY
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 160,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    /* =====================================================
       CHALLENGE CLASSIFICATION
    ===================================================== */

    challengeType: {
      type: String,
      enum: CHALLENGE_TYPES,
      required: true,
      default: "fixed_amount",
      index: true,
    },

    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: "beginner",
    },

    source: {
      type: String,
      enum: SOURCE_TYPES,
      required: true,
      default: "user",
    },

    visibility: {
      type: String,
      enum: VISIBILITY_TYPES,
      default: "private",
    },

    /* =====================================================
       TEMPLATE REFERENCE
    ===================================================== */

    templateId: {
      type: Schema.Types.ObjectId,
      ref: "SavingsChallenge",
      default: null,
      index: true,
    },

    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =====================================================
       CURRENCY
    ===================================================== */

    currency: {
      type: String,
      enum: CURRENCY_CODES,
      default: "NGN",
      uppercase: true,
      required: true,
    },

    /* =====================================================
       TARGET
    ===================================================== */

    target: {
      type: TargetSchema,
      required: true,
    },

    /* =====================================================
       FREQUENCY
    ===================================================== */

    frequency: {
      type: FrequencySchema,
      required: true,
    },

    /* =====================================================
       DURATION
    ===================================================== */

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    durationDays: {
      type: Number,
      min: 1,
      default: null,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    status: {
      type: String,
      enum: STATUS,
      default: "draft",
      required: true,
      index: true,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    paused: {
      type: PauseSchema,
      default: () => ({}),
    },

    /* =====================================================
       PROGRESS
    ===================================================== */

    progress: {
      type: ProgressSchema,
      default: () => ({}),
    },

    /* =====================================================
       STREAK
    ===================================================== */

    streak: {
      type: StreakSchema,
      default: () => ({}),
    },

    /* =====================================================
       REWARD
    ===================================================== */

    reward: {
      type: RewardSchema,
      default: () => ({}),
    },

    /* =====================================================
       COMPLETION
    ===================================================== */

    completion: {
      type: CompletionSchema,
      default: () => ({}),
    },

    /* =====================================================
       CONTRIBUTION LINK
    ===================================================== */

    contributionCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    lastContribution: {
      type: Schema.Types.ObjectId,
      ref: "SavingContribution",
      default: null,
    },

    /* =====================================================
       ACCOUNT LINK
    ===================================================== */

    savingAccount: {
      type: Schema.Types.ObjectId,
      ref: "SavingAccount",
      default: null,
      index: true,
    },

    savingPlan: {
      type: Schema.Types.ObjectId,
      ref: "SavingPlan",
      default: null,
      index: true,
    },

    /* =====================================================
       AUTOMATION
    ===================================================== */

    autoSaveEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    autoSave: {
      type: Schema.Types.ObjectId,
      ref: "AutoSave",
      default: null,
    },

    /* =====================================================
       PARTICIPATION
    ===================================================== */

    participantCount: {
      type: Number,
      min: 1,
      default: 1,
    },

    /* =====================================================
       SETTINGS
    ===================================================== */

    allowEarlyCompletion: {
      type: Boolean,
      default: true,
    },

    allowPartialContribution: {
      type: Boolean,
      default: true,
    },

    allowOverContribution: {
      type: Boolean,
      default: false,
    },

    rolloverMissedContribution: {
      type: Boolean,
      default: false,
    },

    notifyBeforeDue: {
      type: Boolean,
      default: true,
    },

    notificationDaysBefore: {
      type: Number,
      min: 0,
      max: 30,
      default: 1,
    },

    /* =====================================================
       IDEMPOTENCY / AUDIT
    ===================================================== */

    creationReference: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },

    lastOperationReference: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
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

    versionKey: "__v",

    minimize: false,
  }
);

/* =========================================================
   INDEXES
========================================================= */

/**
 * User's active challenges.
 */
SavingsChallengeSchema.index({
  user: 1,
  status: 1,
  startDate: -1,
});

/**
 * User's challenge history.
 */
SavingsChallengeSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Challenges approaching expiration.
 */
SavingsChallengeSchema.index({
  status: 1,
  endDate: 1,
});

/**
 * Auto-save challenges.
 */
SavingsChallengeSchema.index({
  user: 1,
  autoSaveEnabled: 1,
  status: 1,
});

/**
 * Saving account relationships.
 */
SavingsChallengeSchema.index({
  savingAccount: 1,
  status: 1,
});

/**
 * Template discovery.
 */
SavingsChallengeSchema.index({
  isTemplate: 1,
  visibility: 1,
  difficulty: 1,
});

/* =========================================================
   VALIDATION
========================================================= */

SavingsChallengeSchema.pre("validate", function (next) {
  /* -----------------------------------------------
     DATE VALIDATION
  ----------------------------------------------- */

  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    return next(
      new Error(
        "Challenge end date cannot be earlier than start date."
      )
    );
  }

  /* -----------------------------------------------
     DURATION
  ----------------------------------------------- */

  if (this.startDate && this.endDate) {
    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    this.durationDays =
      Math.ceil(
        (this.endDate.getTime() -
          this.startDate.getTime()) /
          millisecondsPerDay
      ) + 1;
  }

  /* -----------------------------------------------
     TARGET VALIDATION
  ----------------------------------------------- */

  if (
    this.target &&
    this.target.targetAmount <= 0
  ) {
    return next(
      new Error(
        "Challenge target amount must be greater than zero."
      )
    );
  }

  /* -----------------------------------------------
     PERCENTAGE CHALLENGE
  ----------------------------------------------- */

  if (
    this.challengeType === "percentage" &&
    (
      this.target?.percentage === null ||
      this.target?.percentage === undefined
    )
  ) {
    return next(
      new Error(
        "Percentage challenges require a target percentage."
      )
    );
  }

  /* -----------------------------------------------
     INCREMENTAL CHALLENGE
  ----------------------------------------------- */

  if (
    this.challengeType === "incremental" &&
    (
      this.target?.startingAmount === null ||
      this.target?.incrementAmount === null
    )
  ) {
    return next(
      new Error(
        "Incremental challenges require starting and increment amounts."
      )
    );
  }

  /* -----------------------------------------------
     AUTO-SAVE
  ----------------------------------------------- */

  if (
    this.autoSaveEnabled &&
    !this.autoSave
  ) {
    return next(
      new Error(
        "Auto-save enabled challenges must reference an AutoSave configuration."
      )
    );
  }

  /* -----------------------------------------------
     TEMPLATE VALIDATION
  ----------------------------------------------- */

  if (
    this.isTemplate &&
    this.source !== "system" &&
    this.source !== "admin"
  ) {
    return next(
      new Error(
        "Only system or admin challenges can be templates."
      )
    );
  }

  next();
});

/* =========================================================
   STATUS METHODS
========================================================= */

SavingsChallengeSchema.methods.activate = function () {
  if (
    this.status !== "draft" &&
    this.status !== "paused"
  ) {
    throw new Error(
      "Only draft or paused challenges can be activated."
    );
  }

  this.status = "active";

  if (!this.activatedAt) {
    this.activatedAt = new Date();
  }

  return this;
};

SavingsChallengeSchema.methods.pause = function (
  reason = null,
  pausedUntil = null
) {
  if (this.status !== "active") {
    throw new Error(
      "Only active challenges can be paused."
    );
  }

  this.status = "paused";

  this.paused.pausedAt = new Date();
  this.paused.pausedUntil = pausedUntil;
  this.paused.reason = reason;

  return this;
};

SavingsChallengeSchema.methods.resume = function () {
  if (this.status !== "paused") {
    throw new Error(
      "Only paused challenges can be resumed."
    );
  }

  this.status = "active";

  if (this.paused.pausedAt) {
    const end =
      new Date();

    const pauseDays = Math.max(
      0,
      Math.ceil(
        (end.getTime() -
          this.paused.pausedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    this.paused.totalPauseDays += pauseDays;
  }

  this.paused.pausedAt = null;
  this.paused.pausedUntil = null;
  this.paused.reason = null;

  return this;
};

SavingsChallengeSchema.methods.complete = function () {
  if (
    this.status !== "active" &&
    this.status !== "paused"
  ) {
    throw new Error(
      "Only active or paused challenges can be completed."
    );
  }

  this.status = "completed";

  this.completion.completedAt =
    new Date();

  this.completion.completedAmount =
    this.progress.contributedAmount;

  this.completion.completionPercentage =
    Math.min(
      100,
      this.progress.percentage
    );

  return this;
};

SavingsChallengeSchema.methods.cancel = function () {
  if (
    this.status === "completed" ||
    this.status === "cancelled"
  ) {
    throw new Error(
      "This challenge cannot be cancelled."
    );
  }

  this.status = "cancelled";

  return this;
};

SavingsChallengeSchema.methods.fail = function () {
  if (
    this.status !== "active" &&
    this.status !== "paused"
  ) {
    throw new Error(
      "Only active or paused challenges can fail."
    );
  }

  this.status = "failed";

  return this;
};

/* =========================================================
   PROGRESS METHODS
========================================================= */

SavingsChallengeSchema.methods.updateProgress =
  function (amount) {
    const contribution =
      Number(amount) || 0;

    if (contribution <= 0) {
      throw new Error(
        "Contribution amount must be greater than zero."
      );
    }

    const current =
      Number(
        this.progress.contributedAmount
      ) || 0;

    const target =
      Number(
        this.target.targetAmount
      ) || 0;

    const newAmount =
      current + contribution;

    this.progress.contributedAmount =
      newAmount;

    this.progress.remainingAmount =
      Math.max(
        0,
        target - newAmount
      );

    this.progress.percentage =
      target > 0
        ? Math.min(
            100,
            (newAmount / target) * 100
          )
        : 0;

    this.progress.lastCalculatedAt =
      new Date();

    this.contributionCount += 1;

    return this;
  };

/* =========================================================
   STREAK METHODS
========================================================= */

SavingsChallengeSchema.methods.registerSuccessfulPeriod =
  function () {
    this.streak.current += 1;

    if (
      this.streak.current >
      this.streak.longest
    ) {
      this.streak.longest =
        this.streak.current;
    }

    this.streak.successfulPeriods =
      (this.progress.successfulPeriods || 0) + 1;

    this.progress.missedPeriods = 0;

    this.streak.missedPeriods = 0;

    this.streak.lastSuccessfulPeriod =
      new Date().toISOString().slice(0, 10);

    return this;
  };

SavingsChallengeSchema.methods.registerMissedPeriod =
  function () {
    this.streak.current = 0;

    this.streak.missedPeriods += 1;

    this.progress.missedPeriods += 1;

    return this;
  };

/* =========================================================
   SOFT DELETE
========================================================= */

SavingsChallengeSchema.methods.softDelete =
  function () {
    this.isDeleted = true;
    this.deletedAt = new Date();

    if (
      this.status !== "completed"
    ) {
      this.status = "cancelled";
    }

    return this;
  };

/* =========================================================
   QUERY HELPERS
========================================================= */

SavingsChallengeSchema.query.notDeleted =
  function () {
    return this.where({
      isDeleted: false,
    });
  };

SavingsChallengeSchema.query.active =
  function () {
    return this.where({
      status: "active",
      isDeleted: false,
    });
  };

/* =========================================================
   VIRTUALS
========================================================= */

SavingsChallengeSchema.virtual(
  "isCompleted"
).get(function () {
  return this.status === "completed";
});

SavingsChallengeSchema.virtual(
  "isActive"
).get(function () {
  return this.status === "active";
});

SavingsChallengeSchema.virtual(
  "isPaused"
).get(function () {
  return this.status === "paused";
});

SavingsChallengeSchema.virtual(
  "isExpired"
).get(function () {
  return (
    this.status === "expired" ||
    (
      this.endDate &&
      new Date() > this.endDate &&
      this.status === "active"
    )
  );
});

SavingsChallengeSchema.virtual(
  "remainingPercentage"
).get(function () {
  return Math.max(
    0,
    100 -
      Number(
        this.progress.percentage || 0
      )
  );
});

/* =========================================================
   JSON CONFIGURATION
========================================================= */

SavingsChallengeSchema.set(
  "toJSON",
  {
    virtuals: true,
  }
);

SavingsChallengeSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);

/* =========================================================
   MODEL
========================================================= */

const SavingsChallenge =
  mongoose.models.SavingsChallenge ||
  mongoose.model(
    "SavingsChallenge",
    SavingsChallengeSchema
  );

export default SavingsChallenge;