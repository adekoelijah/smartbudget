// services/savingsChallengeService.js

import mongoose from "mongoose";

import SavingsChallenge from "../models/SavingsChallenge.js";

/* =========================================================
   CONSTANTS
========================================================= */

const CHALLENGE_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "failed",
  "expired",
  "cancelled",
];

const ACTIVE_STATUSES = [
  "active",
  "paused",
];

const TERMINAL_STATUSES = [
  "completed",
  "failed",
  "expired",
  "cancelled",
];

const NON_DELETED_FILTER = {
  isDeleted: false,
};

const VALID_OBJECT_ID =
  mongoose.Types.ObjectId.isValid;

/* =========================================================
   ERROR CLASS
========================================================= */

class SavingsChallengeServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVINGS_CHALLENGE_ERROR",
    details = null
  ) {
    super(message);

    this.name =
      "SavingsChallengeServiceError";

    this.statusCode = statusCode;

    this.code = code;

    this.details = details;

    Error.captureStackTrace?.(
      this,
      SavingsChallengeServiceError
    );
  }
}

/* =========================================================
   ID VALIDATION
========================================================= */

const assertObjectId = (
  value,
  fieldName = "ID"
) => {
  if (
    !value ||
    !VALID_OBJECT_ID(value)
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_ID"
    );
  }
};

const assertUserId = (userId) => {
  assertObjectId(
    userId,
    "User ID"
  );
};

const toObjectId = (
  value,
  fieldName = "ID"
) => {
  assertObjectId(
    value,
    fieldName
  );

  return value instanceof
    mongoose.Types.ObjectId
    ? value
    : new mongoose.Types.ObjectId(
        value
      );
};

/* =========================================================
   SESSION HELPERS
========================================================= */

const withSession = (
  query,
  session = null
) => {
  if (session) {
    query.session(session);
  }

  return query;
};

const assertSession = (session) => {
  if (!session) {
    throw new SavingsChallengeServiceError(
      "Database transaction session is required for this operation",
      500,
      "TRANSACTION_REQUIRED"
    );
  }
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeAmount = (
  value,
  fieldName = "Amount",
  {
    allowZero = false,
  } = {}
) => {
  const amount = Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} must be a valid number`,
      400,
      "INVALID_AMOUNT"
    );
  }

  if (
    allowZero
      ? amount < 0
      : amount <= 0
  ) {
    throw new SavingsChallengeServiceError(
      allowZero
        ? `${fieldName} cannot be negative`
        : `${fieldName} must be greater than zero`,
      400,
      allowZero
        ? "NEGATIVE_AMOUNT"
        : "INVALID_AMOUNT"
    );
  }

  return Math.round(
    (amount + Number.EPSILON) *
      100
  ) / 100;
};

const normalizePercentage = (
  value,
  fieldName = "Percentage"
) => {
  const percentage = Number(value);

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} must be between 0 and 100`,
      400,
      "INVALID_PERCENTAGE"
    );
  }

  return Math.round(
    (percentage + Number.EPSILON) *
      100
  ) / 100;
};

const normalizeDate = (
  value,
  fieldName = "Date"
) => {
  if (!value) {
    throw new SavingsChallengeServiceError(
      `${fieldName} is required`,
      400,
      "DATE_REQUIRED"
    );
  }

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizeOptionalDate = (
  value,
  fieldName = "Date"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return normalizeDate(
    value,
    fieldName
  );
};

const normalizeString = (
  value,
  fieldName,
  {
    required = false,
    maxLength = null,
  } = {}
) => {
  const normalized =
    String(value ?? "")
      .trim();

  if (
    required &&
    !normalized
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} is required`,
      400,
      "FIELD_REQUIRED"
    );
  }

  if (
    maxLength &&
    normalized.length >
      maxLength
  ) {
    throw new SavingsChallengeServiceError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      400,
      "FIELD_TOO_LONG"
    );
  }

  return normalized;
};

const normalizePagination = ({
  page = 1,
  limit = 20,
} = {}) => {
  const normalizedPage =
    Math.max(
      Number.parseInt(
        page,
        10
      ) || 1,
      1
    );

  const normalizedLimit =
    Math.min(
      Math.max(
        Number.parseInt(
          limit,
          10
        ) || 20,
        1
      ),
      100
    );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip:
      (normalizedPage - 1) *
      normalizedLimit,
  };
};

/* =========================================================
   OWNERSHIP / ACCESS
========================================================= */

const findUserChallenge = async ({
  userId,
  challengeId,
  session = null,
  allowDeleted = false,
  allowTerminal = true,
}) => {
  assertUserId(userId);

  assertObjectId(
    challengeId,
    "Savings challenge ID"
  );

  const filter = {
    _id: challengeId,
    user: userId,
  };

  if (!allowDeleted) {
    filter.isDeleted = false;
  }

  const query =
    SavingsChallenge.findOne(
      filter
    );

  withSession(
    query,
    session
  );

  const challenge =
    await query;

  if (!challenge) {
    throw new SavingsChallengeServiceError(
      "Savings challenge not found",
      404,
      "CHALLENGE_NOT_FOUND"
    );
  }

  if (
    !allowTerminal &&
    TERMINAL_STATUSES.includes(
      challenge.status
    )
  ) {
    throw new SavingsChallengeServiceError(
      "Savings challenge is no longer active",
      409,
      "CHALLENGE_NOT_ACTIVE"
    );
  }

  return challenge;
};

/* =========================================================
   CHALLENGE VALIDATION
========================================================= */

const validateChallengeDates = ({
  startDate,
  endDate,
}) => {
  const start =
    normalizeDate(
      startDate,
      "Start date"
    );

  const end =
    normalizeDate(
      endDate,
      "End date"
    );

  if (end < start) {
    throw new SavingsChallengeServiceError(
      "Challenge end date cannot be earlier than start date",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  return {
    startDate: start,
    endDate: end,
  };
};

const validateTarget = (
  target = {},
  challengeType
) => {
  const targetAmount =
    normalizeAmount(
      target.targetAmount,
      "Target amount"
    );

  const normalizedTarget = {
    ...target,
    targetAmount,
  };

  if (
    challengeType ===
    "percentage"
  ) {
    if (
      target.percentage ===
        null ||
      target.percentage ===
        undefined
    ) {
      throw new SavingsChallengeServiceError(
        "Percentage challenges require a target percentage",
        400,
        "PERCENTAGE_TARGET_REQUIRED"
      );
    }

    normalizedTarget.percentage =
      normalizePercentage(
        target.percentage,
        "Target percentage"
      );
  }

  if (
    challengeType ===
    "incremental"
  ) {
    if (
      target.startingAmount ===
        null ||
      target.startingAmount ===
        undefined
    ) {
      throw new SavingsChallengeServiceError(
        "Incremental challenges require a starting amount",
        400,
        "STARTING_AMOUNT_REQUIRED"
      );
    }

    if (
      target.incrementAmount ===
        null ||
      target.incrementAmount ===
        undefined
    ) {
      throw new SavingsChallengeServiceError(
        "Incremental challenges require an increment amount",
        400,
        "INCREMENT_AMOUNT_REQUIRED"
      );
    }

    normalizedTarget.startingAmount =
      normalizeAmount(
        target.startingAmount,
        "Starting amount",
        {
          allowZero: true,
        }
      );

    normalizedTarget.incrementAmount =
      normalizeAmount(
        target.incrementAmount,
        "Increment amount",
        {
          allowZero: true,
        }
      );
  }

  if (
    target.maximumAmount !==
      null &&
    target.maximumAmount !==
      undefined
  ) {
    normalizedTarget.maximumAmount =
      normalizeAmount(
        target.maximumAmount,
        "Maximum amount",
        {
          allowZero: true,
        }
      );
  }

  return normalizedTarget;
};

const validateFrequency = (
  frequency = {}
) => {
  const allowed = [
    "daily",
    "weekly",
    "biweekly",
    "monthly",
    "custom",
  ];

  const type =
    String(
      frequency.type ||
        "weekly"
    )
      .trim()
      .toLowerCase();

  if (
    !allowed.includes(type)
  ) {
    throw new SavingsChallengeServiceError(
      `Unsupported challenge frequency: ${type}`,
      400,
      "INVALID_FREQUENCY"
    );
  }

  const interval =
    Number(
      frequency.interval || 1
    );

  if (
    !Number.isInteger(
      interval
    ) ||
    interval < 1
  ) {
    throw new SavingsChallengeServiceError(
      "Frequency interval must be a positive integer",
      400,
      "INVALID_FREQUENCY_INTERVAL"
    );
  }

  return {
    ...frequency,
    type,
    interval,
  };
};

/* =========================================================
   CREATE CHALLENGE
========================================================= */

/**
 * Creates a new savings challenge.
 *
 * This method only creates challenge state.
 *
 * It does NOT:
 * - create a SavingContribution
 * - move money
 * - execute AutoSave
 * - modify a SavingPlan
 */
export const createSavingsChallenge =
  async ({
    userId,
    name,
    slug = null,
    description = "",
    challengeType = "fixed_amount",
    difficulty = "beginner",
    source = "user",
    visibility = "private",
    templateId = null,
    isTemplate = false,
    currency = "NGN",
    target,
    frequency,
    startDate,
    endDate,
    status = "draft",
    savingAccount = null,
    savingPlan = null,
    autoSaveEnabled = false,
    autoSave = null,
    participantCount = 1,
    allowEarlyCompletion = true,
    allowPartialContribution = true,
    allowOverContribution = false,
    rolloverMissedContribution = false,
    notifyBeforeDue = true,
    notificationDaysBefore = 1,
    reward = {},
    creationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    const normalizedName =
      normalizeString(
        name,
        "Challenge name",
        {
          required: true,
          maxLength: 120,
        }
      );

    const normalizedDescription =
      normalizeString(
        description,
        "Description",
        {
          maxLength: 1000,
        }
      );

    const {
      startDate:
        normalizedStartDate,
      endDate:
        normalizedEndDate,
    } =
      validateChallengeDates({
        startDate,
        endDate,
      });

    const normalizedTarget =
      validateTarget(
        target,
        challengeType
      );

    const normalizedFrequency =
      validateFrequency(
        frequency
      );

    if (
      participantCount <
      1
    ) {
      throw new SavingsChallengeServiceError(
        "Participant count must be at least one",
        400,
        "INVALID_PARTICIPANT_COUNT"
      );
    }

    if (
      notificationDaysBefore <
        0 ||
      notificationDaysBefore >
        30
    ) {
      throw new SavingsChallengeServiceError(
        "Notification days before must be between 0 and 30",
        400,
        "INVALID_NOTIFICATION_DAYS"
      );
    }

    if (
      autoSaveEnabled &&
      !autoSave
    ) {
      throw new SavingsChallengeServiceError(
        "Auto-save enabled challenges must reference an AutoSave configuration",
        400,
        "AUTOSAVE_REFERENCE_REQUIRED"
      );
    }

    if (
      isTemplate &&
      ![
        "system",
        "admin",
      ].includes(source)
    ) {
      throw new SavingsChallengeServiceError(
        "Only system or admin challenges can be templates",
        400,
        "INVALID_TEMPLATE_SOURCE"
      );
    }

    if (
      templateId
    ) {
      assertObjectId(
        templateId,
        "Template ID"
      );
    }

    if (
      savingAccount
    ) {
      assertObjectId(
        savingAccount,
        "Saving account ID"
      );
    }

    if (
      savingPlan
    ) {
      assertObjectId(
        savingPlan,
        "Saving plan ID"
      );
    }

    if (
      autoSave
    ) {
      assertObjectId(
        autoSave,
        "AutoSave ID"
      );
    }

    const challengePayload = {
      user: userId,

      name:
        normalizedName,

      slug:
        slug
          ? normalizeString(
              slug,
              "Slug",
              {
                maxLength: 160,
              }
            )
          : null,

      description:
        normalizedDescription,

      challengeType,

      difficulty,

      source,

      visibility,

      templateId,

      isTemplate,

      currency:
        String(currency)
          .trim()
          .toUpperCase(),

      target:
        normalizedTarget,

      frequency:
        normalizedFrequency,

      startDate:
        normalizedStartDate,

      endDate:
        normalizedEndDate,

      status,

      savingAccount,

      savingPlan,

      autoSaveEnabled,

      autoSave,

      participantCount,

      allowEarlyCompletion,

      allowPartialContribution,

      allowOverContribution,

      rolloverMissedContribution,

      notifyBeforeDue,

      notificationDaysBefore,

      reward,

      creationReference,

      progress: {
        contributedAmount: 0,
        remainingAmount:
          normalizedTarget.targetAmount,
        percentage: 0,
        expectedAmount: 0,
        contributionCount: 0,
        successfulPeriods: 0,
        missedPeriods: 0,
      },

      streak: {
        current: 0,
        longest: 0,
        lastContributionAt: null,
        lastSuccessfulPeriod: null,
        missedPeriods: 0,
      },

      contributionCount: 0,

      lastContribution: null,

      isDeleted: false,
      deletedAt: null,
    };

    try {
      const [
        challenge,
      ] =
        await SavingsChallenge.create(
          [challengePayload],
          session
            ? { session }
            : undefined
        );

      return challenge;
    } catch (error) {
      if (
        error?.code === 11000
      ) {
        throw new SavingsChallengeServiceError(
          "A savings challenge with this reference already exists",
          409,
          "DUPLICATE_CHALLENGE"
        );
      }

      throw error;
    }
  };

/* =========================================================
   GET CHALLENGE
========================================================= */

export const getSavingsChallenge =
  async ({
    userId,
    challengeId,
    session = null,
  }) => {
    return findUserChallenge({
      userId,
      challengeId,
      session,
      allowDeleted: false,
      allowTerminal: true,
    });
  };

/* =========================================================
   LIST USER CHALLENGES
========================================================= */

export const getUserSavingsChallenges =
  async ({
    userId,
    page = 1,
    limit = 20,
    status = null,
    challengeType = null,
    difficulty = null,
    savingPlan = null,
    savingAccount = null,
    includeTemplates = false,
    session = null,
  }) => {
    assertUserId(userId);

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const filter = {
      user: userId,
      isDeleted: false,
    };

    if (
      status
    ) {
      if (
        !CHALLENGE_STATUSES.includes(
          status
        )
      ) {
        throw new SavingsChallengeServiceError(
          "Invalid challenge status",
          400,
          "INVALID_STATUS"
        );
      }

      filter.status =
        status;
    }

    if (
      challengeType
    ) {
      filter.challengeType =
        challengeType;
    }

    if (
      difficulty
    ) {
      filter.difficulty =
        difficulty;
    }

    if (
      savingPlan
    ) {
      assertObjectId(
        savingPlan,
        "Saving plan ID"
      );

      filter.savingPlan =
        savingPlan;
    }

    if (
      savingAccount
    ) {
      assertObjectId(
        savingAccount,
        "Saving account ID"
      );

      filter.savingAccount =
        savingAccount;
    }

    if (
      !includeTemplates
    ) {
      filter.isTemplate = false;
    }

    const query =
      SavingsChallenge.find(
        filter
      )
        .sort({
          createdAt: -1,
        })
        .skip(
          pagination.skip
        )
        .limit(
          pagination.limit
        );

    const countQuery =
      SavingsChallenge.countDocuments(
        filter
      );

    withSession(
      query,
      session
    );

    withSession(
      countQuery,
      session
    );

    const [
      items,
      total,
    ] =
      await Promise.all([
        query,
        countQuery,
      ]);

    const totalPages =
      Math.ceil(
        total /
          pagination.limit
      );

    return {
      items,

      pagination: {
        page:
          pagination.page,

        limit:
          pagination.limit,

        total,

        totalPages,

        hasNextPage:
          pagination.page <
          totalPages,

        hasPreviousPage:
          pagination.page >
          1,
      },
    };
  };

/* =========================================================
   UPDATE DRAFT CHALLENGE
========================================================= */

/**
 * Only draft challenges should be freely editable.
 *
 * Active/paused challenges require dedicated lifecycle
 * operations instead of arbitrary field mutation.
 */
export const updateSavingsChallenge =
  async ({
    userId,
    challengeId,
    updates = {},
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: true,
      });

    if (
      challenge.status !==
      "draft"
    ) {
      throw new SavingsChallengeServiceError(
        "Only draft savings challenges can be edited",
        409,
        "CHALLENGE_NOT_EDITABLE"
      );
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "difficulty",
      "visibility",
      "currency",
      "target",
      "frequency",
      "startDate",
      "endDate",
      "savingAccount",
      "savingPlan",
      "autoSaveEnabled",
      "autoSave",
      "participantCount",
      "allowEarlyCompletion",
      "allowPartialContribution",
      "allowOverContribution",
      "rolloverMissedContribution",
      "notifyBeforeDue",
      "notificationDaysBefore",
      "reward",
    ];

    for (
      const field of
        allowedFields
    ) {
      if (
        !Object.prototype.hasOwnProperty.call(
          updates,
          field
        )
      ) {
        continue;
      }

      challenge[field] =
        updates[field];
    }

    if (
      updates.name !==
        undefined
    ) {
      challenge.name =
        normalizeString(
          updates.name,
          "Challenge name",
          {
            required: true,
            maxLength: 120,
          }
        );
    }

    if (
      updates.description !==
        undefined
    ) {
      challenge.description =
        normalizeString(
          updates.description,
          "Description",
          {
            maxLength: 1000,
          }
        );
    }

    if (
      updates.target !==
        undefined
    ) {
      challenge.target =
        validateTarget(
          updates.target,
          challenge.challengeType
        );
    }

    if (
      updates.frequency !==
        undefined
    ) {
      challenge.frequency =
        validateFrequency(
          updates.frequency
        );
    }

    if (
      updates.startDate !==
        undefined ||
      updates.endDate !==
        undefined
    ) {
      const dates =
        validateChallengeDates({
          startDate:
            updates.startDate ??
            challenge.startDate,

          endDate:
            updates.endDate ??
            challenge.endDate,
        });

      challenge.startDate =
        dates.startDate;

      challenge.endDate =
        dates.endDate;
    }

    if (
      updates.savingAccount
    ) {
      assertObjectId(
        updates.savingAccount,
        "Saving account ID"
      );
    }

    if (
      updates.savingPlan
    ) {
      assertObjectId(
        updates.savingPlan,
        "Saving plan ID"
      );
    }

    if (
      updates.autoSave
    ) {
      assertObjectId(
        updates.autoSave,
        "AutoSave ID"
      );
    }

    if (
      challenge.autoSaveEnabled &&
      !challenge.autoSave
    ) {
      throw new SavingsChallengeServiceError(
        "Auto-save enabled challenges must reference an AutoSave configuration",
        400,
        "AUTOSAVE_REFERENCE_REQUIRED"
      );
    }

    challenge.lastOperationReference =
      updates.operationReference ??
      challenge.lastOperationReference;

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   ACTIVATE
========================================================= */

export const activateSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: true,
      });

    if (
      ![
        "draft",
        "paused",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "Only draft or paused challenges can be activated",
        409,
        "INVALID_ACTIVATION"
      );
    }

    challenge.activate();

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   PAUSE
========================================================= */

export const pauseSavingsChallenge =
  async ({
    userId,
    challengeId,
    reason = null,
    pausedUntil = null,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      challenge.status !==
      "active"
    ) {
      throw new SavingsChallengeServiceError(
        "Only active challenges can be paused",
        409,
        "INVALID_PAUSE"
      );
    }

    const normalizedPausedUntil =
      normalizeOptionalDate(
        pausedUntil,
        "Paused until"
      );

    if (
      normalizedPausedUntil &&
      normalizedPausedUntil <=
        new Date()
    ) {
      throw new SavingsChallengeServiceError(
        "Paused-until date must be in the future",
        400,
        "INVALID_PAUSE_DATE"
      );
    }

    challenge.pause(
      reason
        ? normalizeString(
            reason,
            "Pause reason",
            {
              maxLength: 500,
            }
          )
        : null,
      normalizedPausedUntil
    );

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   RESUME
========================================================= */

export const resumeSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      challenge.status !==
      "paused"
    ) {
      throw new SavingsChallengeServiceError(
        "Only paused challenges can be resumed",
        409,
        "INVALID_RESUME"
      );
    }

    challenge.resume();

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   COMPLETE
========================================================= */

export const completeSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      ![
        "active",
        "paused",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "Only active or paused challenges can be completed",
        409,
        "INVALID_COMPLETION"
      );
    }

    const contributed =
      Number(
        challenge.progress
          ?.contributedAmount
      ) || 0;

    const target =
      Number(
        challenge.target
          ?.targetAmount
      ) || 0;

    if (
      contributed <
        target &&
      !challenge.allowEarlyCompletion
    ) {
      throw new SavingsChallengeServiceError(
        "Challenge target has not been reached",
        409,
        "TARGET_NOT_REACHED"
      );
    }

    challenge.complete();

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   CANCEL
========================================================= */

export const cancelSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: true,
      });

    if (
      [
        "completed",
        "cancelled",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "This challenge cannot be cancelled",
        409,
        "INVALID_CANCELLATION"
      );
    }

    challenge.cancel();

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   FAIL
========================================================= */

export const failSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      ![
        "active",
        "paused",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "Only active or paused challenges can fail",
        409,
        "INVALID_FAILURE"
      );
    }

    challenge.fail();

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   EXPIRE
========================================================= */

/**
 * Expires an active challenge whose end date has passed.
 *
 * This is intentionally separate from fail().
 */
export const expireSavingsChallenge =
  async ({
    userId,
    challengeId,
    now = new Date(),
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      ![
        "active",
        "paused",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "Only active or paused challenges can expire",
        409,
        "INVALID_EXPIRATION"
      );
    }

    const currentDate =
      normalizeDate(
        now,
        "Current date"
      );

    if (
      challenge.endDate >
      currentDate
    ) {
      throw new SavingsChallengeServiceError(
        "Challenge has not reached its end date",
        409,
        "CHALLENGE_NOT_EXPIRED"
      );
    }

    challenge.status =
      "expired";

    if (
      operationReference
    ) {
      challenge.lastOperationReference =
        operationReference;
    }

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   APPLY CONTRIBUTION
========================================================= */

/**
 * Applies an already-confirmed SavingContribution to the
 * challenge's denormalized progress snapshot.
 *
 * IMPORTANT:
 *
 * This method does NOT create a SavingContribution.
 *
 * The contribution/ledger service must first create and
 * confirm the financial transaction.
 *
 * Both operations should normally run inside the SAME
 * MongoDB transaction.
 */
export const applyContributionToChallenge =
  async ({
    userId,
    challengeId,
    contributionId,
    amount,
    contributionDate = new Date(),
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    assertObjectId(
      contributionId,
      "Contribution ID"
    );

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      ![
        "active",
        "paused",
      ].includes(
        challenge.status
      )
    ) {
      throw new SavingsChallengeServiceError(
        "Only active or paused challenges can receive contributions",
        409,
        "CHALLENGE_NOT_CONTRIBUTABLE"
      );
    }

    const contribution =
      normalizeAmount(
        amount,
        "Contribution amount"
      );

    /*
     * Idempotency protection.
     *
     * If this exact contribution has already been applied
     * to the challenge, return the current challenge rather
     * than incrementing progress twice.
     */
    if (
      challenge.lastContribution &&
      String(
        challenge.lastContribution
      ) ===
        String(contributionId)
    ) {
      return challenge;
    }

    /*
     * Secondary operation-reference protection.
     */
    if (
      operationReference &&
      challenge.lastOperationReference ===
        operationReference
    ) {
      return challenge;
    }

    const current =
      Number(
        challenge.progress
          ?.contributedAmount
      ) || 0;

    const target =
      Number(
        challenge.target
          ?.targetAmount
      ) || 0;

    const remaining =
      Math.max(
        target - current,
        0
      );

    if (
      remaining <= 0 &&
      !challenge.allowOverContribution
    ) {
      throw new SavingsChallengeServiceError(
        "Challenge target has already been reached",
        409,
        "CHALLENGE_TARGET_REACHED"
      );
    }

    if (
      contribution >
        remaining &&
      !challenge.allowOverContribution
    ) {
      if (
        challenge.allowPartialContribution
      ) {
        throw new SavingsChallengeServiceError(
          `Contribution exceeds the remaining challenge amount of ${remaining}`,
          409,
          "CONTRIBUTION_EXCEEDS_REMAINING"
        );
      }

      throw new SavingsChallengeServiceError(
        "Contribution exceeds the remaining challenge amount and partial contributions are disabled",
        409,
        "CONTRIBUTION_NOT_ALLOWED"
      );
    }

    const contributionDateValue =
      normalizeDate(
        contributionDate,
        "Contribution date"
      );

    const newAmount =
      current +
      contribution;

    const cappedAmount =
      challenge.allowOverContribution
        ? newAmount
        : Math.min(
            newAmount,
            target
          );

    const newRemaining =
      Math.max(
        target -
          cappedAmount,
        0
      );

    const newPercentage =
      target > 0
        ? Math.min(
            100,
            Math.round(
              (cappedAmount /
                target) *
                10000
            ) / 100
          )
        : 0;

    /*
     * Atomic update guard.
     *
     * This protects against two concurrent requests reading
     * the same progress snapshot and both overwriting it.
     */
    const filter = {
      _id: challenge._id,
      user: userId,
      isDeleted: false,
      __v: challenge.__v,
    };

    if (
      !challenge.allowOverContribution
    ) {
      filter[
        "progress.contributedAmount"
      ] = {
        $lte:
          Math.max(
            target -
              contribution,
            0
          ),
      };
    }

    const update = {
      $set: {
        "progress.contributedAmount":
          cappedAmount,

        "progress.remainingAmount":
          newRemaining,

        "progress.percentage":
          newPercentage,

        "progress.lastCalculatedAt":
          contributionDateValue,

        "streak.lastContributionAt":
          contributionDateValue,

        lastContribution:
          contributionId,

        lastOperationReference:
          operationReference ??
          challenge.lastOperationReference,
      },

      $inc: {
        contributionCount: 1,

        "progress.contributionCount": 1,

        __v: 1,
      },
    };

    if (
      newAmount >= target
    ) {
      update.$set.status =
        "completed";

      update.$set[
        "completion.completedAt"
      ] =
        contributionDateValue;

      update.$set[
        "completion.completedAmount"
      ] =
        cappedAmount;

      update.$set[
        "completion.completionPercentage"
      ] =
        newPercentage;
    }

    const updated =
      await SavingsChallenge.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
          session,
          runValidators: true,
        }
      );

    if (!updated) {
      throw new SavingsChallengeServiceError(
        "Challenge progress changed concurrently. Please retry the operation",
        409,
        "CONCURRENT_CHALLENGE_UPDATE"
      );
    }

    return updated;
  };

/* =========================================================
   REGISTER SUCCESSFUL PERIOD
========================================================= */

/**
 * Records successful challenge-period completion.
 *
 * This does not create a financial contribution.
 */
export const registerSuccessfulChallengePeriod =
  async ({
    userId,
    challengeId,
    periodDate = new Date(),
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      challenge.status !==
      "active"
    ) {
      throw new SavingsChallengeServiceError(
        "Only active challenges can register a successful period",
        409,
        "INVALID_PERIOD_STATUS"
      );
    }

    challenge.registerSuccessfulPeriod();

    challenge.streak.lastContributionAt =
      normalizeDate(
        periodDate,
        "Period date"
      );

    challenge.lastOperationReference =
      operationReference ??
      challenge.lastOperationReference;

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   REGISTER MISSED PERIOD
========================================================= */

export const registerMissedChallengePeriod =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: false,
      });

    if (
      challenge.status !==
      "active"
    ) {
      throw new SavingsChallengeServiceError(
        "Only active challenges can register missed periods",
        409,
        "INVALID_PERIOD_STATUS"
      );
    }

    challenge.registerMissedPeriod();

    challenge.lastOperationReference =
      operationReference ??
      challenge.lastOperationReference;

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   GET CHALLENGE SNAPSHOT
========================================================= */

/**
 * Returns a normalized challenge snapshot for dashboards,
 * reports and API responses.
 *
 * No database mutation occurs here.
 */
export const getChallengeSnapshot =
  async ({
    userId,
    challengeId,
    session = null,
  }) => {
    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: true,
      });

    const target =
      Number(
        challenge.target
          ?.targetAmount
      ) || 0;

    const contributed =
      Number(
        challenge.progress
          ?.contributedAmount
      ) || 0;

    const remaining =
      Math.max(
        target -
          contributed,
        0
      );

    const percentage =
      target > 0
        ? Math.min(
            100,
            Math.round(
              (contributed /
                target) *
                10000
            ) / 100
          )
        : 0;

    const now =
      new Date();

    const start =
      new Date(
        challenge.startDate
      );

    const end =
      new Date(
        challenge.endDate
      );

    const totalDurationMs =
      end.getTime() -
      start.getTime();

    const elapsedMs =
      now.getTime() -
      start.getTime();

    const expectedPercentage =
      totalDurationMs > 0
        ? Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (elapsedMs /
                  totalDurationMs) *
                  10000
              ) / 100
            )
          )
        : 0;

    const variance =
      Math.round(
        (percentage -
          expectedPercentage) *
          100
      ) / 100;

    let health =
      "on_track";

    if (
      variance >= 10
    ) {
      health = "ahead";
    } else if (
      variance >= 0
    ) {
      health = "on_track";
    } else if (
      variance >= -10
    ) {
      health =
        "slightly_behind";
    } else if (
      variance >= -25
    ) {
      health = "behind";
    } else {
      health = "at_risk";
    }

    return {
      challenge,

      financial: {
        targetAmount:
          target,

        contributedAmount:
          contributed,

        remainingAmount:
          remaining,

        progressPercentage:
          percentage,

        remainingPercentage:
          Math.max(
            100 -
              percentage,
            0
          ),
      },

      timeline: {
        startDate:
          challenge.startDate,

        endDate:
          challenge.endDate,

        durationDays:
          challenge.durationDays,

        expectedProgress:
          expectedPercentage,

        progressVariance:
          variance,
      },

      health,

      streak: {
        current:
          challenge.streak
            ?.current || 0,

        longest:
          challenge.streak
            ?.longest || 0,

        missedPeriods:
          challenge.streak
            ?.missedPeriods || 0,

        lastSuccessfulPeriod:
          challenge.streak
            ?.lastSuccessfulPeriod ||
          null,
      },

      completion: {
        isCompleted:
          challenge.status ===
          "completed",

        completedAt:
          challenge.completion
            ?.completedAt ||
          null,

        completedAmount:
          challenge.completion
            ?.completedAmount ||
          0,
      },
    };
  };

/* =========================================================
   CHALLENGE SUMMARY
========================================================= */

export const getSavingsChallengeSummary =
  async ({
    userId,
    session = null,
  }) => {
    assertUserId(userId);

    const userObjectId =
      toObjectId(
        userId,
        "User ID"
      );

    const [
      statusStats,
      typeStats,
      totalStats,
    ] =
      await Promise.all([
        SavingsChallenge.aggregate([
          {
            $match: {
              user:
                userObjectId,
              isDeleted:
                false,
            },
          },

          {
            $group: {
              _id:
                "$status",

              count: {
                $sum: 1,
              },
            },
          },
        ]),

        SavingsChallenge.aggregate([
          {
            $match: {
              user:
                userObjectId,
              isDeleted:
                false,
            },
          },

          {
            $group: {
              _id:
                "$challengeType",

              count: {
                $sum: 1,
              },
            },
          },
        ]),

        SavingsChallenge.aggregate([
          {
            $match: {
              user:
                userObjectId,
              isDeleted:
                false,
            },
          },

          {
            $group: {
              _id: null,

              totalTarget:
                {
                  $sum:
                    "$target.targetAmount",
                },

              totalContributed:
                {
                  $sum:
                    "$progress.contributedAmount",
                },

              totalContributions:
                {
                  $sum:
                    "$contributionCount",
                },
            },
          },
        ]),
      ]);

    /*
     * Aggregation session support.
     *
     * Mongoose requires the session to be attached before
     * execution. Since Promise.all above executes immediately,
     * the session-aware branch below is intentionally kept
     * separate for production callers that need transactional
     * reads.
     */

    if (
      session
    ) {
      const [
        sessionStatusStats,
        sessionTypeStats,
        sessionTotalStats,
      ] =
        await Promise.all([
          SavingsChallenge.aggregate([
            {
              $match: {
                user:
                  userObjectId,
                isDeleted:
                  false,
              },
            },

            {
              $group: {
                _id:
                  "$status",

                count: {
                  $sum: 1,
                },
              },
            },
          ]).session(
            session
          ),

          SavingsChallenge.aggregate([
            {
              $match: {
                user:
                  userObjectId,
                isDeleted:
                  false,
              },
            },

            {
              $group: {
                _id:
                  "$challengeType",

                count: {
                  $sum: 1,
                },
              },
            },
          ]).session(
            session
          ),

          SavingsChallenge.aggregate([
            {
              $match: {
                user:
                  userObjectId,
                isDeleted:
                  false,
              },
            },

            {
              $group: {
                _id: null,

                totalTarget:
                  {
                    $sum:
                      "$target.targetAmount",
                  },

                totalContributed:
                  {
                    $sum:
                      "$progress.contributedAmount",
                  },

                totalContributions:
                  {
                    $sum:
                      "$contributionCount",
                  },
              },
            },
          ]).session(
            session
          ),
        ]);

      return buildChallengeSummary(
        sessionStatusStats,
        sessionTypeStats,
        sessionTotalStats
      );
    }

    return buildChallengeSummary(
      statusStats,
      typeStats,
      totalStats
    );
  };

/* =========================================================
   SUMMARY BUILDER
========================================================= */

const buildChallengeSummary = (
  statusStats,
  typeStats,
  totalStats
) => {
  const statuses = {
    total: 0,
    draft: 0,
    active: 0,
    paused: 0,
    completed: 0,
    failed: 0,
    expired: 0,
    cancelled: 0,
  };

  for (
    const item of
      statusStats
  ) {
    statuses.total +=
      item.count;

    if (
      Object.prototype.hasOwnProperty.call(
        statuses,
        item._id
      )
    ) {
      statuses[item._id] =
        item.count;
    }
  }

  const types = {};

  for (
    const item of
      typeStats
  ) {
    types[item._id] =
      item.count;
  }

  const aggregate =
    totalStats[0] || {
      totalTarget: 0,
      totalContributed: 0,
      totalContributions: 0,
    };

  const totalTarget =
    Number(
      aggregate.totalTarget
    ) || 0;

  const totalContributed =
    Number(
      aggregate.totalContributed
    ) || 0;

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          100,
          Math.round(
            (totalContributed /
              totalTarget) *
              10000
          ) / 100
        )
      : 0;

  return {
    statuses,

    types,

    financial: {
      totalTarget,
      totalContributed,

      remainingAmount:
        Math.max(
          totalTarget -
            totalContributed,
          0
        ),

      overallProgress,

      totalContributions:
        aggregate.totalContributions ||
        0,
    },
  };
};

/* =========================================================
   DELETE / ARCHIVE
========================================================= */

/**
 * Soft-delete only.
 *
 * Challenge financial history is never physically deleted.
 */
export const archiveSavingsChallenge =
  async ({
    userId,
    challengeId,
    operationReference = null,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: false,
        allowTerminal: true,
      });

    if (
      challenge.isDeleted
    ) {
      return challenge;
    }

    if (
      challenge.status ===
      "active"
    ) {
      throw new SavingsChallengeServiceError(
        "An active savings challenge cannot be archived",
        409,
        "ACTIVE_CHALLENGE_CANNOT_BE_ARCHIVED"
      );
    }

    challenge.softDelete();

    challenge.lastOperationReference =
      operationReference ??
      challenge.lastOperationReference;

    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   RESTORE
========================================================= */

export const restoreSavingsChallenge =
  async ({
    userId,
    challengeId,
    session = null,
  }) => {
    assertUserId(userId);

    assertSession(session);

    const challenge =
      await findUserChallenge({
        userId,
        challengeId,
        session,
        allowDeleted: true,
        allowTerminal: true,
      });

    if (
      !challenge.isDeleted
    ) {
      return challenge;
    }

    challenge.isDeleted =
      false;

    challenge.deletedAt =
      null;

    /*
     * Do not automatically reactivate the challenge.
     *
     * Restoration returns the document to the state it had
     * before deletion; lifecycle activation remains explicit.
     */
    await challenge.save({
      session,
    });

    return challenge;
  };

/* =========================================================
   FIND DUE CHALLENGES
========================================================= */

/**
 * Used by workers/cron jobs.
 *
 * Returns active challenges whose end date has passed.
 */
export const getExpiredChallenges =
  async ({
    before = new Date(),
    limit = 100,
    session = null,
  } = {}) => {
    const normalizedLimit =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 100,
          1
        ),
        500
      );

    const normalizedDate =
      normalizeDate(
        before,
        "Expiration date"
      );

    const query =
      SavingsChallenge.find({
        status: {
          $in: [
            "active",
            "paused",
          ],
        },

        isDeleted: false,

        endDate: {
          $lte:
            normalizedDate,
        },
      })
        .sort({
          endDate: 1,
        })
        .limit(
          normalizedLimit
        );

    withSession(
      query,
      session
    );

    return query;
  };

/* =========================================================
   GET ACTIVE CHALLENGES
========================================================= */

export const getActiveSavingsChallenges =
  async ({
    userId,
    page = 1,
    limit = 20,
    session = null,
  }) => {
    return getUserSavingsChallenges({
      userId,
      page,
      limit,
      status: "active",
      session,
    });
  };

/* =========================================================
   GET PAUSED CHALLENGES
========================================================= */

export const getPausedSavingsChallenges =
  async ({
    userId,
    page = 1,
    limit = 20,
    session = null,
  }) => {
    return getUserSavingsChallenges({
      userId,
      page,
      limit,
      status: "paused",
      session,
    });
  };

/* =========================================================
   GET COMPLETED CHALLENGES
========================================================= */

export const getCompletedSavingsChallenges =
  async ({
    userId,
    page = 1,
    limit = 20,
    session = null,
  }) => {
    return getUserSavingsChallenges({
      userId,
      page,
      limit,
      status: "completed",
      session,
    });
  };

/* =========================================================
   ERROR EXPORT
========================================================= */

export {
  SavingsChallengeServiceError,
};

/* =========================================================
   DEFAULT SERVICE EXPORT
========================================================= */

export default {
  createSavingsChallenge,

  getSavingsChallenge,

  getUserSavingsChallenges,

  updateSavingsChallenge,

  activateSavingsChallenge,

  pauseSavingsChallenge,

  resumeSavingsChallenge,

  completeSavingsChallenge,

  cancelSavingsChallenge,

  failSavingsChallenge,

  expireSavingsChallenge,

  applyContributionToChallenge,

  registerSuccessfulChallengePeriod,

  registerMissedChallengePeriod,

  getChallengeSnapshot,

  getSavingsChallengeSummary,

  archiveSavingsChallenge,

  restoreSavingsChallenge,

  getExpiredChallenges,

  getActiveSavingsChallenges,

  getPausedSavingsChallenges,

  getCompletedSavingsChallenges,
};