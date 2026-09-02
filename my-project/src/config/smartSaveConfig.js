/**
 * SmartSave Configuration
 *
 * Centralized configuration for the SmartSave frontend.
 *
 * IMPORTANT:
 * - Backend/Mongoose remains the source of truth for business rules.
 * - This file contains frontend configuration, constants, labels,
 *   endpoint definitions, and safe UI defaults.
 * - Do not place financial calculations or business logic here.
 */

/* -------------------------------------------------------------------------- */
/* API Endpoints                                                              */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_ENDPOINTS = Object.freeze({
  accounts: "/savings/accounts",
  primaryAccount: "/savings/accounts/primary",
  goals: "/savings/goals",
  plans: "/savings/plans",
  schedules: "/savings/schedules",
  executions: "/savings/executions",
  contributions: "/savings/contributions",
  milestones: "/savings/milestones",
  challenges: "/savings/challenges",
  insights: "/savings/insights",
  autoSave: "/savings/auto-save",
  forecast: "/savings/forecast",
  analytics: "/savings/analytics",
});

/* -------------------------------------------------------------------------- */
/* HTTP Methods                                                               */
/* -------------------------------------------------------------------------- */

export const HTTP_METHODS = Object.freeze({
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
});

/* -------------------------------------------------------------------------- */
/* Default Currency                                                           */
/* -------------------------------------------------------------------------- */

export const DEFAULT_CURRENCY = "NGN";

export const SMART_SAVE_CURRENCY = Object.freeze({
  code: "NGN",
  symbol: "₦",
  locale: "en-NG",
  currency: "NGN",
});

/* -------------------------------------------------------------------------- */
/* Currency Configuration                                                     */
/* -------------------------------------------------------------------------- */

export const SUPPORTED_CURRENCIES = Object.freeze([
  "NGN",
  "USD",
  "GBP",
  "EUR",
]);

export const SMART_SAVE_CURRENCIES = Object.freeze([
  Object.freeze({
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    locale: "en-NG",
  }),

  Object.freeze({
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  }),

  Object.freeze({
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
  }),

  Object.freeze({
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
  }),
]);

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 20;

export const MAX_LIMIT = 100;

export const SMART_SAVE_PAGINATION = Object.freeze({
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
});

/* -------------------------------------------------------------------------- */
/* Savings Goal Statuses                                                      */
/* -------------------------------------------------------------------------- */

export const SAVINGS_GOAL_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  ARCHIVED: "archived",
});

export const SAVINGS_GOAL_STATUSES = Object.freeze(
  Object.values(SAVINGS_GOAL_STATUS),
);

/* -------------------------------------------------------------------------- */
/* Savings Challenge Types                                                    */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_TYPE = Object.freeze({
  FIXED_AMOUNT: "fixed_amount",
  INCREMENTAL: "incremental",
  PERCENTAGE: "percentage",
  ROUND_UP: "round_up",
  NO_SPEND: "no_spend",
  STREAK: "streak",
  CUSTOM: "custom",
});

/*
 * Compatibility:
 *
 * Some existing SmartSave files may use:
 *
 * SAVINGS_CHALLENGE_TYPES.FIXED_AMOUNT
 *
 * while newer code may iterate over the values.
 *
 * Keep the object export available and expose a separate values array.
 */

export const SAVINGS_CHALLENGE_TYPES =
  SAVINGS_CHALLENGE_TYPE;

export const SAVINGS_CHALLENGE_TYPE_VALUES =
  Object.freeze(
    Object.values(SAVINGS_CHALLENGE_TYPE),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Type Labels                                                      */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_TYPE_LABELS =
  Object.freeze({
    [SAVINGS_CHALLENGE_TYPE.FIXED_AMOUNT]:
      "Fixed Amount",

    [SAVINGS_CHALLENGE_TYPE.INCREMENTAL]:
      "Incremental",

    [SAVINGS_CHALLENGE_TYPE.PERCENTAGE]:
      "Percentage",

    [SAVINGS_CHALLENGE_TYPE.ROUND_UP]:
      "Round Up",

    [SAVINGS_CHALLENGE_TYPE.NO_SPEND]:
      "No Spend",

    [SAVINGS_CHALLENGE_TYPE.STREAK]:
      "Savings Streak",

    [SAVINGS_CHALLENGE_TYPE.CUSTOM]:
      "Custom",
  });

/* -------------------------------------------------------------------------- */
/* Challenge Difficulty                                                       */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_DIFFICULTY =
  Object.freeze({
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
    EXPERT: "expert",
  });

/*
 * Backward-compatible object export.
 */

export const SAVINGS_CHALLENGE_DIFFICULTIES =
  SAVINGS_CHALLENGE_DIFFICULTY;

export const SAVINGS_CHALLENGE_DIFFICULTY_VALUES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_DIFFICULTY,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Difficulty Labels                                                */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_DIFFICULTY_LABELS =
  Object.freeze({
    [SAVINGS_CHALLENGE_DIFFICULTY.BEGINNER]:
      "Beginner",

    [SAVINGS_CHALLENGE_DIFFICULTY.INTERMEDIATE]:
      "Intermediate",

    [SAVINGS_CHALLENGE_DIFFICULTY.ADVANCED]:
      "Advanced",

    [SAVINGS_CHALLENGE_DIFFICULTY.EXPERT]:
      "Expert",
  });

/* -------------------------------------------------------------------------- */
/* Challenge Frequency                                                        */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_FREQUENCY =
  Object.freeze({
    DAILY: "daily",
    WEEKLY: "weekly",
    BIWEEKLY: "biweekly",
    MONTHLY: "monthly",
    CUSTOM: "custom",
  });

/*
 * Backward-compatible object export.
 */

export const SAVINGS_CHALLENGE_FREQUENCIES =
  SAVINGS_CHALLENGE_FREQUENCY;

export const SAVINGS_CHALLENGE_FREQUENCY_VALUES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_FREQUENCY,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Frequency Labels                                                 */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_FREQUENCY_LABELS =
  Object.freeze({
    [SAVINGS_CHALLENGE_FREQUENCY.DAILY]:
      "Daily",

    [SAVINGS_CHALLENGE_FREQUENCY.WEEKLY]:
      "Weekly",

    [SAVINGS_CHALLENGE_FREQUENCY.BIWEEKLY]:
      "Every 2 Weeks",

    [SAVINGS_CHALLENGE_FREQUENCY.MONTHLY]:
      "Monthly",

    [SAVINGS_CHALLENGE_FREQUENCY.CUSTOM]:
      "Custom",
  });

/* -------------------------------------------------------------------------- */
/* Challenge Status                                                           */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_STATUS =
  Object.freeze({
    DRAFT: "draft",
    ACTIVE: "active",
    PAUSED: "paused",
    COMPLETED: "completed",
    FAILED: "failed",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
  });

export const CHALLENGE_STATUS =
  SAVINGS_CHALLENGE_STATUS;

export const SAVINGS_CHALLENGE_STATUSES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_STATUS,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Status Labels                                                    */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_STATUS_LABELS =
  Object.freeze({
    [SAVINGS_CHALLENGE_STATUS.DRAFT]:
      "Draft",

    [SAVINGS_CHALLENGE_STATUS.ACTIVE]:
      "Active",

    [SAVINGS_CHALLENGE_STATUS.PAUSED]:
      "Paused",

    [SAVINGS_CHALLENGE_STATUS.COMPLETED]:
      "Completed",

    [SAVINGS_CHALLENGE_STATUS.FAILED]:
      "Failed",

    [SAVINGS_CHALLENGE_STATUS.EXPIRED]:
      "Expired",

    [SAVINGS_CHALLENGE_STATUS.CANCELLED]:
      "Cancelled",
  });

/* -------------------------------------------------------------------------- */
/* Challenge Source                                                           */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_SOURCE =
  Object.freeze({
    SYSTEM: "system",
    USER: "user",
    ADMIN: "admin",
  });

export const SAVINGS_CHALLENGE_SOURCES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_SOURCE,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Visibility                                                       */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_VISIBILITY =
  Object.freeze({
    PRIVATE: "private",
    PUBLIC: "public",
  });

export const SAVINGS_CHALLENGE_VISIBILITIES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_VISIBILITY,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Reward                                                           */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_REWARD_TYPE =
  Object.freeze({
    BADGE: "badge",
    POINTS: "points",
    CASHBACK: "cashback",
    INTEREST_BONUS: "interest_bonus",
    NONE: "none",
  });

export const SAVINGS_CHALLENGE_REWARD_TYPES =
  Object.freeze(
    Object.values(
      SAVINGS_CHALLENGE_REWARD_TYPE,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Challenge Defaults                                                         */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_DEFAULTS =
  Object.freeze({
    challengeType:
      SAVINGS_CHALLENGE_TYPE.FIXED_AMOUNT,

    difficulty:
      SAVINGS_CHALLENGE_DIFFICULTY.BEGINNER,

    currency:
      DEFAULT_CURRENCY,

    frequency:
      SAVINGS_CHALLENGE_FREQUENCY.WEEKLY,

    source:
      SAVINGS_CHALLENGE_SOURCE.USER,

    visibility:
      SAVINGS_CHALLENGE_VISIBILITY.PRIVATE,

    status:
      SAVINGS_CHALLENGE_STATUS.DRAFT,

    autoSaveEnabled: false,

    allowEarlyCompletion: true,

    allowPartialContribution: true,

    allowOverContribution: false,

    rolloverMissedContribution: false,

    notifyBeforeDue: true,

    notificationDaysBefore: 1,

    participantCount: 1,
  });

/* -------------------------------------------------------------------------- */
/* Challenge UI Options                                                       */
/* -------------------------------------------------------------------------- */

export const SAVINGS_CHALLENGE_TYPE_OPTIONS =
  Object.freeze(
    SAVINGS_CHALLENGE_TYPE_VALUES.map(
      (value) =>
        Object.freeze({
          value,
          label:
            SAVINGS_CHALLENGE_TYPE_LABELS[
              value
            ] || value,
        }),
    ),
  );

export const SAVINGS_CHALLENGE_DIFFICULTY_OPTIONS =
  Object.freeze(
    SAVINGS_CHALLENGE_DIFFICULTY_VALUES.map(
      (value) =>
        Object.freeze({
          value,
          label:
            SAVINGS_CHALLENGE_DIFFICULTY_LABELS[
              value
            ] || value,
        }),
    ),
  );

export const SAVINGS_CHALLENGE_FREQUENCY_OPTIONS =
  Object.freeze(
    SAVINGS_CHALLENGE_FREQUENCY_VALUES.map(
      (value) =>
        Object.freeze({
          value,
          label:
            SAVINGS_CHALLENGE_FREQUENCY_LABELS[
              value
            ] || value,
        }),
    ),
  );

/* -------------------------------------------------------------------------- */
/* SmartSave Resource Names                                                   */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_RESOURCES =
  Object.freeze({
    ACCOUNTS: "accounts",
    GOALS: "goals",
    PLANS: "plans",
    SCHEDULES: "schedules",
    EXECUTIONS: "executions",
    CONTRIBUTIONS: "contributions",
    MILESTONES: "milestones",
    CHALLENGES: "challenges",
    INSIGHTS: "insights",
    AUTO_SAVE: "autoSave",
    FORECAST: "forecast",
    ANALYTICS: "analytics",
  });

/* -------------------------------------------------------------------------- */
/* Insight Types                                                              */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_INSIGHT_TYPES =
  Object.freeze({
    SAVING_OPPORTUNITY:
      "saving_opportunity",

    SPENDING_PATTERN:
      "spending_pattern",

    GOAL_PROGRESS:
      "goal_progress",

    GOAL_RISK:
      "goal_risk",

    FORECAST:
      "forecast",

    RECOMMENDATION:
      "recommendation",

    ACHIEVEMENT:
      "achievement",

    WARNING:
      "warning",
  });

export const SMART_SAVE_INSIGHT_TYPE_VALUES =
  Object.freeze(
    Object.values(
      SMART_SAVE_INSIGHT_TYPES,
    ),
  );

/* -------------------------------------------------------------------------- */
/* Savings Strategy                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Strategy identifiers.
 *
 * These values should remain aligned with the strategy
 * identifiers consumed by the SmartSave strategy UI/backend.
 */

export const SAVINGS_STRATEGIES =
  Object.freeze({
    FIXED_AMOUNT: "fixed_amount",
    PERCENTAGE: "percentage",
    ROUND_UP: "round_up",
    INCREMENTAL: "incremental",
    SMART: "smart",
    CUSTOM: "custom",
  });

export const SAVINGS_STRATEGY_VALUES =
  Object.freeze(
    Object.values(
      SAVINGS_STRATEGIES,
    ),
  );

/**
 * Human-readable strategy labels.
 */

export const SAVINGS_STRATEGY_LABELS =
  Object.freeze({
    [SAVINGS_STRATEGIES.FIXED_AMOUNT]:
      "Fixed Amount",

    [SAVINGS_STRATEGIES.PERCENTAGE]:
      "Percentage",

    [SAVINGS_STRATEGIES.ROUND_UP]:
      "Round Up",

    [SAVINGS_STRATEGIES.INCREMENTAL]:
      "Incremental",

    [SAVINGS_STRATEGIES.SMART]:
      "Smart Saving",

    [SAVINGS_STRATEGIES.CUSTOM]:
      "Custom",
  });

/**
 * Central strategy configuration.
 *
 * This export is required by:
 * - SavingsStrategiesPage.jsx
 * - SavingsEmptyState.jsx
 * - SavingsErrorState.jsx
 *
 * Keep this configuration descriptive only.
 * Financial calculations belong in the backend/service layer.
 */

export const SMART_SAVE_STRATEGY_CONFIG =
  Object.freeze({
    strategies:
      SAVINGS_STRATEGIES,

    values:
      SAVINGS_STRATEGY_VALUES,

    labels:
      SAVINGS_STRATEGY_LABELS,

    options:
      Object.freeze(
        SAVINGS_STRATEGY_VALUES.map(
          (value) =>
            Object.freeze({
              value,
              label:
                SAVINGS_STRATEGY_LABELS[
                  value
                ] || value,
            }),
        ),
      ),

    defaults: Object.freeze({
      strategy:
        SAVINGS_STRATEGIES.SMART,
    }),

    supported:
      Object.freeze(
        SAVINGS_STRATEGY_VALUES,
      ),
  });

/* -------------------------------------------------------------------------- */
/* UI Limits                                                                  */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_UI_LIMITS =
  Object.freeze({
    MAX_NAME_LENGTH: 120,

    MAX_DESCRIPTION_LENGTH: 1000,

    MAX_GOAL_NAME_LENGTH: 100,

    MAX_CHALLENGE_NAME_LENGTH: 120,

    MAX_SLUG_LENGTH: 160,

    MAX_REFERENCE_LENGTH: 150,

    MAX_NOTIFICATION_DAYS: 30,

    MAX_PERCENTAGE: 100,

    MAX_AMOUNT:
      Number.MAX_SAFE_INTEGER,
  });

/* -------------------------------------------------------------------------- */
/* SmartSave Defaults                                                         */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_DEFAULTS =
  Object.freeze({
    page: DEFAULT_PAGE,

    limit: DEFAULT_LIMIT,

    maxLimit: MAX_LIMIT,

    currency: DEFAULT_CURRENCY,

    locale:
      SMART_SAVE_CURRENCY.locale,
  });

/* -------------------------------------------------------------------------- */
/* Configuration Object                                                       */
/* -------------------------------------------------------------------------- */

export const SMART_SAVE_CONFIG =
  Object.freeze({
    endpoints:
      SMART_SAVE_ENDPOINTS,

    httpMethods:
      HTTP_METHODS,

    currency:
      SMART_SAVE_CURRENCY,

    currencies:
      SMART_SAVE_CURRENCIES,

    supportedCurrencies:
      SUPPORTED_CURRENCIES,

    pagination:
      SMART_SAVE_PAGINATION,

    resources:
      SMART_SAVE_RESOURCES,

    goals: Object.freeze({
      statuses:
        SAVINGS_GOAL_STATUSES,
    }),

    challenges: Object.freeze({
      types:
        SAVINGS_CHALLENGE_TYPE_VALUES,

      typeConfig:
        SAVINGS_CHALLENGE_TYPE,

      typeOptions:
        SAVINGS_CHALLENGE_TYPE_OPTIONS,

      difficulties:
        SAVINGS_CHALLENGE_DIFFICULTY_VALUES,

      difficultyConfig:
        SAVINGS_CHALLENGE_DIFFICULTY,

      difficultyOptions:
        SAVINGS_CHALLENGE_DIFFICULTY_OPTIONS,

      frequencies:
        SAVINGS_CHALLENGE_FREQUENCY_VALUES,

      frequencyConfig:
        SAVINGS_CHALLENGE_FREQUENCY,

      frequencyOptions:
        SAVINGS_CHALLENGE_FREQUENCY_OPTIONS,

      statuses:
        SAVINGS_CHALLENGE_STATUSES,

      sources:
        SAVINGS_CHALLENGE_SOURCES,

      visibility:
        SAVINGS_CHALLENGE_VISIBILITIES,

      rewardTypes:
        SAVINGS_CHALLENGE_REWARD_TYPES,

      defaults:
        SAVINGS_CHALLENGE_DEFAULTS,
    }),

    insights:
      SMART_SAVE_INSIGHT_TYPE_VALUES,

    strategies:
      SAVINGS_STRATEGY_VALUES,

    strategyConfig:
      SMART_SAVE_STRATEGY_CONFIG,

    uiLimits:
      SMART_SAVE_UI_LIMITS,

    defaults:
      SMART_SAVE_DEFAULTS,
  });

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export const validateSmartSaveConfig = () => {
  const errors = [];

  if (!SMART_SAVE_ENDPOINTS.accounts) {
    errors.push(
      "Savings accounts endpoint is missing",
    );
  }

  if (!SMART_SAVE_ENDPOINTS.goals) {
    errors.push(
      "Savings goals endpoint is missing",
    );
  }

  if (!SMART_SAVE_ENDPOINTS.challenges) {
    errors.push(
      "Savings challenges endpoint is missing",
    );
  }

  if (!SMART_SAVE_ENDPOINTS.insights) {
    errors.push(
      "Savings insights endpoint is missing",
    );
  }

  if (
    !SUPPORTED_CURRENCIES.includes(
      DEFAULT_CURRENCY,
    )
  ) {
    errors.push(
      "Default currency is not supported",
    );
  }

  if (DEFAULT_PAGE < 1) {
    errors.push(
      "Default page must be at least 1",
    );
  }

  if (
    DEFAULT_LIMIT < 1 ||
    DEFAULT_LIMIT > MAX_LIMIT
  ) {
    errors.push(
      "Default limit is outside the allowed pagination range",
    );
  }

  if (
    SAVINGS_CHALLENGE_TYPE_VALUES.length ===
    0
  ) {
    errors.push(
      "No savings challenge types are configured",
    );
  }

  if (
    SAVINGS_CHALLENGE_DIFFICULTY_VALUES.length ===
    0
  ) {
    errors.push(
      "No savings challenge difficulties are configured",
    );
  }

  if (
    SAVINGS_CHALLENGE_FREQUENCY_VALUES.length ===
    0
  ) {
    errors.push(
      "No savings challenge frequencies are configured",
    );
  }

  if (
    SAVINGS_STRATEGY_VALUES.length ===
    0
  ) {
    errors.push(
      "No savings strategies are configured",
    );
  }

  if (
    !SMART_SAVE_STRATEGY_CONFIG.defaults
      .strategy
  ) {
    errors.push(
      "Default savings strategy is missing",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Convenience Helpers                                                        */
/* -------------------------------------------------------------------------- */

export const getChallengeTypeLabel = (
  value,
) => {
  const normalizedValue =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    SAVINGS_CHALLENGE_TYPE_LABELS[
      normalizedValue
    ] || normalizedValue
  );
};

export const getChallengeDifficultyLabel = (
  value,
) => {
  const normalizedValue =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    SAVINGS_CHALLENGE_DIFFICULTY_LABELS[
      normalizedValue
    ] || normalizedValue
  );
};

export const getChallengeFrequencyLabel = (
  value,
) => {
  const normalizedValue =
    String(value || "")
      .trim()
      .toLowerCase();

  return (
    SAVINGS_CHALLENGE_FREQUENCY_LABELS[
      normalizedValue
    ] || normalizedValue
  );
};

export const isSupportedCurrency = (
  currency,
) =>
  SUPPORTED_CURRENCIES.includes(
    String(currency || "")
      .trim()
      .toUpperCase(),
  );

export const isSupportedChallengeType = (
  value,
) =>
  SAVINGS_CHALLENGE_TYPE_VALUES.includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );

export const isSupportedChallengeDifficulty = (
  value,
) =>
  SAVINGS_CHALLENGE_DIFFICULTY_VALUES.includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );

export const isSupportedChallengeFrequency = (
  value,
) =>
  SAVINGS_CHALLENGE_FREQUENCY_VALUES.includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );

export const isSupportedSavingsStrategy = (
  value,
) =>
  SAVINGS_STRATEGY_VALUES.includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );

/* -------------------------------------------------------------------------- */
/* Default Export                                                             */
/* -------------------------------------------------------------------------- */

export default SMART_SAVE_CONFIG;