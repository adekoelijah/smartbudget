
// src/config/smartSaveConfig.js

/**
 * ============================================================
 * SMARTSAVE CONFIGURATION
 * ============================================================
 *
 * Central configuration for the SmartSave frontend module.
 *
 * Responsibilities:
 * - SmartSave API endpoint definitions
 * - Resource names
 * - HTTP methods
 * - Pagination defaults
 * - Query parameter contracts
 * - Domain statuses
 * - Strategies
 * - Challenge configuration
 * - Insight configuration
 * - Lifecycle actions
 * - Cache keys
 * - UI limits
 * - Feature flags
 *
 * IMPORTANT:
 *
 * - No API requests belong here.
 * - No Axios calls belong here.
 * - No server-side business logic belongs here.
 * - No React state belongs here.
 * - No UI components belong here.
 * - smartSaveService.js remains the API boundary.
 *
 * Backward compatibility:
 *
 * This module intentionally exposes both the original
 * production names and compatibility aliases used by
 * existing SmartSave components.
 *
 * ============================================================
 */

/* ============================================================
   API RESOURCE PATHS
============================================================ */

export const SMART_SAVE_ENDPOINTS = Object.freeze({
  accounts: "/savings/accounts",
  goals: "/savings/goals",
  plans: "/savings/plans",
  schedules: "/savings/schedules",
  executions: "/savings/executions",
  challenges: "/savings/challenges",
  insights: "/savings/insights",
  autoSave: "/savings/auto-save",
});







// src/config/smartSave/smartSaveCurrency.js

/**
 * ============================================================
 * SMARTSAVE CURRENCY CONFIGURATION
 * ============================================================
 *
 * Centralized currency configuration for the SmartSave module.
 *
 * Responsibilities:
 * - Define the application's primary savings currency
 * - Provide currency metadata
 * - Provide Intl.NumberFormat configuration
 * - Keep currency presentation consistent across SmartSave
 *
 * This file contains configuration only.
 *
 * It MUST NOT:
 * - Perform financial calculations
 * - Make API requests
 * - Read React state
 * - Contain component/UI logic
 * - Contain business rules
 * ============================================================
 */

export const SMART_SAVE_CURRENCY = Object.freeze({
  /**
   * ISO 4217 currency code.
   *
   * SmartBudget's default currency is Nigerian Naira.
   */
  code: "NGN",

  /**
   * Currency symbol.
   */
  symbol: "₦",

  /**
   * Human-readable currency name.
   */
  name: "Nigerian Naira",

  /**
   * Locale used for currency formatting.
   */
  locale: "en-NG",

  /**
   * ISO country code associated with the default currency.
   */
  country: "NG",

  /**
   * Number of decimal places normally displayed.
   */
  decimalPlaces: 2,

  /**
   * Intl.NumberFormat configuration.
   *
   * Keeping this here prevents different SmartSave components
   * from formatting currency differently.
   */
  formatOptions: Object.freeze({
    style: "currency",
    currency: "NGN",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
});

/* ============================================================
   NAMED CONFIG EXPORTS
============================================================ */

export const SMART_SAVE_CURRENCY_CODE =
  SMART_SAVE_CURRENCY.code;

export const SMART_SAVE_CURRENCY_SYMBOL =
  SMART_SAVE_CURRENCY.symbol;

export const SMART_SAVE_CURRENCY_LOCALE =
  SMART_SAVE_CURRENCY.locale;

/* ============================================================
   DEFAULT EXPORT
============================================================ */



/* ============================================================
   RESOURCE NAMES
============================================================ */

export const SMART_SAVE_RESOURCES = Object.freeze({
  ACCOUNT: "account",
  GOAL: "goal",
  PLAN: "plan",
  SCHEDULE: "schedule",
  EXECUTION: "execution",
  CHALLENGE: "challenge",
  INSIGHT: "insight",
  AUTO_SAVE: "autoSave",
});

/* ============================================================
   HTTP METHODS
============================================================ */

export const SMART_SAVE_HTTP_METHODS = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

/* ============================================================
   DEFAULT PAGINATION
============================================================ */

export const SMART_SAVE_PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
});

/* ============================================================
   DEFAULT QUERY OPTIONS
============================================================ */

export const SMART_SAVE_QUERY_DEFAULTS = Object.freeze({
  page: SMART_SAVE_PAGINATION.DEFAULT_PAGE,
  limit: SMART_SAVE_PAGINATION.DEFAULT_LIMIT,
});

/* ============================================================
   ACCOUNT STATUSES
============================================================ */

export const SAVING_ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  LOCKED: "locked",
  CLOSED: "closed",
});

/* ============================================================
   ACCOUNT TYPES
============================================================ */

export const SAVING_ACCOUNT_TYPES = Object.freeze({
  SAVINGS: "savings",
});

/* ============================================================
   GOAL STATUSES
============================================================ */

export const SAVING_GOAL_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
});

/* ============================================================
   PLAN STATUSES
============================================================ */

export const SAVING_PLAN_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

/* ============================================================
   SCHEDULE STATUSES
============================================================ */

export const SAVING_SCHEDULE_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

/* ============================================================
   EXECUTION STATUSES
============================================================ */

export const SAVING_EXECUTION_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  RETRYING: "retrying",
});

/* ============================================================
   CHALLENGE STATUSES
============================================================ */

export const SAVINGS_CHALLENGE_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  EXPIRED: "expired",
  ARCHIVED: "archived",
});

/**
 * Compatibility export.
 *
 * Existing SmartSave components import:
 *
 *   CHALLENGE_STATUS
 *
 * Keep this alias instead of forcing production components
 * to be rewritten.
 */
export const CHALLENGE_STATUS =
  SAVINGS_CHALLENGE_STATUS;

/* ============================================================
   INSIGHT TYPES
============================================================ */

export const SAVING_INSIGHT_TYPES = Object.freeze({
  PROGRESS: "progress",
  PACE: "pace",
  HEALTH: "health",
  RISK: "risk",
  MILESTONE: "milestone",
  CONTRIBUTION: "contribution",
  COMPLETION: "completion",
  RECOMMENDATION: "recommendation",
});

/**
 * Compatibility export.
 *
 * Existing SmartSave components use the plural form.
 */
export const SAVINGS_INSIGHT_TYPES =
  SAVING_INSIGHT_TYPES;


  export const DEFAULT_CURRENCY = "NGN";

/* ============================================================
   INSIGHT SEVERITIES
============================================================ */

export const SAVING_INSIGHT_SEVERITIES = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
});

/**
 * Compatibility alias for consumers using the plural
 * SAVINGS naming convention.
 */
export const SAVINGS_INSIGHT_SEVERITIES =
  SAVING_INSIGHT_SEVERITIES;

/* ============================================================
   SAVING FREQUENCIES
============================================================ */

export const SAVING_FREQUENCIES = Object.freeze({
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
});

/* ============================================================
   SAVING STRATEGIES
============================================================ */

/**
 * SmartSave strategies are frontend domain concepts.
 *
 * They are NOT backend endpoints.
 *
 * Strategy behavior is composed through:
 *
 * - saving plans
 * - saving schedules
 * - AutoSave
 *
 * There is intentionally no /strategies API endpoint.
 */
export const SAVINGS_STRATEGIES = Object.freeze({
  FIXED: "fixed",
  FLEXIBLE: "flexible",
  GOAL_BASED: "goal_based",
  AUTOMATIC: "automatic",
});

/**
 * Singular compatibility alias.
 *
 * Some older consumers may use SAVING_STRATEGIES.
 */
export const SAVING_STRATEGIES =
  SAVINGS_STRATEGIES;

/* ============================================================
   SMART SAVE STRATEGY CONFIGURATION
============================================================ */

/**
 * UI/domain metadata for SmartSave strategies.
 *
 * This configuration does not perform any business operation
 * and does not imply the existence of a backend strategy route.
 *
 * The values are deliberately kept aligned with the canonical
 * SAVINGS_STRATEGIES constants above.
 */
export const SMART_SAVE_STRATEGY_CONFIG =
  Object.freeze({
    [SAVINGS_STRATEGIES.FIXED]: Object.freeze({
      key: SAVINGS_STRATEGIES.FIXED,
      label: "Fixed Savings",
      description:
        "Save a consistent amount according to a defined contribution schedule.",
      frequencySupported: true,
      goalBased: false,
      automatic: false,
    }),

    [SAVINGS_STRATEGIES.FLEXIBLE]: Object.freeze({
      key: SAVINGS_STRATEGIES.FLEXIBLE,
      label: "Flexible Savings",
      description:
        "Make flexible contributions without requiring a fixed contribution amount.",
      frequencySupported: true,
      goalBased: false,
      automatic: false,
    }),

    [SAVINGS_STRATEGIES.GOAL_BASED]: Object.freeze({
      key: SAVINGS_STRATEGIES.GOAL_BASED,
      label: "Goal-Based Savings",
      description:
        "Structure contributions around a specific savings goal and target amount.",
      frequencySupported: true,
      goalBased: true,
      automatic: false,
    }),

    [SAVINGS_STRATEGIES.AUTOMATIC]: Object.freeze({
      key: SAVINGS_STRATEGIES.AUTOMATIC,
      label: "Automatic Savings",
      description:
        "Automatically contribute according to an active AutoSave or schedule configuration.",
      frequencySupported: true,
      goalBased: false,
      automatic: true,
    }),
  });

/* ============================================================
   CHALLENGE TYPES
============================================================ */

export const SAVINGS_CHALLENGE_TYPES = Object.freeze({
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
  STREAK: "streak",
  CUSTOM: "custom",
});

/* ============================================================
   CHALLENGE DIFFICULTIES
============================================================ */

export const SAVINGS_CHALLENGE_DIFFICULTIES =
  Object.freeze({
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
  });

/* ============================================================
   FUNDING SOURCES
============================================================ */

export const SAVING_FUNDING_SOURCES = Object.freeze({
  WALLET: "wallet",
});

/* ============================================================
   PLAN AUTOMATION
============================================================ */

export const SAVING_AUTOMATION_TYPES = Object.freeze({
  AUTO_SAVE: "autoSave",
  SCHEDULE: "schedule",
});

/* ============================================================
   DEFAULTS
============================================================ */

export const SMART_SAVE_DEFAULTS = Object.freeze({
  currency: "NGN",

  contributionFrequency:
    SAVING_FREQUENCIES.MONTHLY,

  priority: "medium",

  goalStatus:
    SAVING_GOAL_STATUS.ACTIVE,

  accountStatus:
    SAVING_ACCOUNT_STATUS.ACTIVE,

  planStatus:
    SAVING_PLAN_STATUS.DRAFT,

  challengeStatus:
    SAVINGS_CHALLENGE_STATUS.ACTIVE,

  insightType:
    SAVING_INSIGHT_TYPES.PROGRESS,

  insightSeverity:
    SAVING_INSIGHT_SEVERITIES.INFO,

  strategy:
    SAVINGS_STRATEGIES.FIXED,
});

/* ============================================================
   MILESTONES
============================================================ */

export const SAVING_MILESTONES =
  Object.freeze([
    25,
    50,
    75,
    90,
    100,
  ]);

/* ============================================================
   QUERY PARAMETER WHITELISTS
============================================================ */

export const SMART_SAVE_QUERY_PARAMS =
  Object.freeze({
    accounts: Object.freeze([
      "page",
      "limit",
      "status",
      "accountType",
      "currency",
      "search",
      "includeClosed",
    ]),

    goals: Object.freeze([
      "page",
      "limit",
      "status",
    ]),

    plans: Object.freeze([
      "page",
      "limit",
      "status",
      "goal",
      "savingAccount",
      "automated",
    ]),

    schedules: Object.freeze([
      "page",
      "limit",
      "status",
      "savingGoal",
      "fundingSource",
      "strategy",
      "frequency",
      "isAutomatic",
      "includeCancelled",
    ]),

    executions: Object.freeze([
      "savingGoalId",
      "savingScheduleId",
      "status",
      "page",
      "limit",
    ]),

    challenges: Object.freeze([
      "page",
      "limit",
      "status",
      "challengeType",
      "difficulty",
      "savingPlan",
      "savingAccount",
      "includeTemplates",
    ]),

    insights: Object.freeze([
      "asOfDate",
    ]),
  });

/* ============================================================
   ID PARAMETER NAMES
============================================================ */

export const SMART_SAVE_ID_PARAMS =
  Object.freeze({
    accountId: "accountId",
    goalId: "goalId",
    planId: "planId",
    scheduleId: "scheduleId",
    executionId: "executionId",
    challengeId: "challengeId",
    autoSaveId: "autoSaveId",
  });

/* ============================================================
   LIFECYCLE ACTIONS
============================================================ */

export const SMART_SAVE_LIFECYCLE_ACTIONS =
  Object.freeze({
    account: Object.freeze({
      setPrimary: "primary",
      pause: "pause",
      activate: "activate",
      lock: "lock",
      close: "close",
    }),

    plan: Object.freeze({
      activate: "activate",
      pause: "pause",
      resume: "resume",
      complete: "complete",
      cancel: "cancel",
      recalculateMetrics:
        "recalculate-metrics",
      refreshProgress:
        "refresh-progress",
    }),

    schedule: Object.freeze({
      activate: "activate",
      pause: "pause",
      resume: "resume",
      cancel: "cancel",
      complete: "complete",
    }),

    execution: Object.freeze({
      cancel: "cancel",
      retry: "retry",
    }),

    challenge: Object.freeze({
      activate: "activate",
      pause: "pause",
      resume: "resume",
      complete: "complete",
      cancel: "cancel",
      fail: "fail",
      expire: "expire",
      restore: "restore",
      contributions: "contributions",
      successfulPeriod:
        "periods/success",
      missedPeriod:
        "periods/missed",
    }),

    autoSave: Object.freeze({
      activate: "activate",
      pause: "pause",
      resume: "resume",
      cancel: "cancel",
    }),
  });

/* ============================================================
   CACHE KEYS
============================================================ */

export const SMART_SAVE_CACHE_KEYS =
  Object.freeze({
    root: "smart-save",

    accounts:
      "smart-save-accounts",

    primaryAccount:
      "smart-save-primary-account",

    goals:
      "smart-save-goals",

    plans:
      "smart-save-plans",

    schedules:
      "smart-save-schedules",

    executions:
      "smart-save-executions",

    challenges:
      "smart-save-challenges",

    activeChallenges:
      "smart-save-active-challenges",

    pausedChallenges:
      "smart-save-paused-challenges",

    completedChallenges:
      "smart-save-completed-challenges",

    insights:
      "smart-save-insights",

    autoSaves:
      "smart-save-auto-saves",
  });

/* ============================================================
   REQUEST CONFIGURATION
============================================================ */

export const SMART_SAVE_REQUEST_CONFIG =
  Object.freeze({
    timeout: 15000,
    retries: 2,
    retryDelay: 500,
    credentialsRequired: true,
  });

/* ============================================================
   ERROR CODES
============================================================ */

export const SMART_SAVE_ERROR_CODES =
  Object.freeze({
    INVALID_ID: "INVALID_ID",
    INVALID_QUERY: "INVALID_QUERY",
    INVALID_PAYLOAD: "INVALID_PAYLOAD",

    NETWORK_ERROR:
      "NETWORK_ERROR",

    TIMEOUT:
      "TIMEOUT",

    UNAUTHORIZED:
      "UNAUTHORIZED",

    FORBIDDEN:
      "FORBIDDEN",

    NOT_FOUND:
      "NOT_FOUND",

    VALIDATION_ERROR:
      "VALIDATION_ERROR",

    SERVER_ERROR:
      "SERVER_ERROR",

    UNKNOWN_ERROR:
      "UNKNOWN_ERROR",
  });

/* ============================================================
   UI CONFIGURATION
============================================================ */

export const SMART_SAVE_UI =
  Object.freeze({
    maxVisibleInsights: 20,
    maxRecentActivity: 10,
    maxDashboardGoals: 5,
    maxDashboardChallenges: 5,
  });

/* ============================================================
   FEATURE FLAGS
============================================================ */

export const SMART_SAVE_FEATURES =
  Object.freeze({
    accounts: true,
    goals: true,
    plans: true,
    schedules: true,
    executions: true,
    challenges: true,
    insights: true,
    autoSave: true,
    forecasting: true,
    emergencyFund: true,
    strategies: true,
  });

/* ============================================================
   CONFIGURATION VALIDATION
============================================================ */

export const validateSmartSaveConfig = () => {
  const endpointEntries =
    Object.entries(
      SMART_SAVE_ENDPOINTS
    );

  const invalidEndpoints =
    endpointEntries.filter(
      ([, endpoint]) =>
        typeof endpoint !== "string" ||
        !endpoint.startsWith(
          "/savings/"
        )
    );

  if (
    invalidEndpoints.length > 0
  ) {
    throw new Error(
      "Invalid SmartSave endpoint configuration."
    );
  }

  const strategyEntries =
    Object.entries(
      SMART_SAVE_STRATEGY_CONFIG
    );

  const invalidStrategies =
    strategyEntries.some(
      ([key, config]) =>
        !Object.values(
          SAVINGS_STRATEGIES
        ).includes(key) ||
        config.key !== key
    );

  if (invalidStrategies) {
    throw new Error(
      "Invalid SmartSave strategy configuration."
    );
  }

  return true;
};

/* ============================================================
   COMPLETE CONFIGURATION OBJECT
============================================================ */

export const SMART_SAVE_CONFIG =
  Object.freeze({
    endpoints:
      SMART_SAVE_ENDPOINTS,

    resources:
      SMART_SAVE_RESOURCES,

    methods:
      SMART_SAVE_HTTP_METHODS,

    pagination:
      SMART_SAVE_PAGINATION,

    queryDefaults:
      SMART_SAVE_QUERY_DEFAULTS,

    queryParams:
      SMART_SAVE_QUERY_PARAMS,

    ids:
      SMART_SAVE_ID_PARAMS,

    lifecycle:
      SMART_SAVE_LIFECYCLE_ACTIONS,

    statuses: Object.freeze({
      account:
        SAVING_ACCOUNT_STATUS,

      goal:
        SAVING_GOAL_STATUS,

      plan:
        SAVING_PLAN_STATUS,

      schedule:
        SAVING_SCHEDULE_STATUS,

      execution:
        SAVING_EXECUTION_STATUS,

      challenge:
        SAVINGS_CHALLENGE_STATUS,
    }),

    insightTypes:
      SAVING_INSIGHT_TYPES,

    insightSeverities:
      SAVING_INSIGHT_SEVERITIES,

    frequencies:
      SAVING_FREQUENCIES,

    strategies:
      SAVINGS_STRATEGIES,

    strategyConfig:
      SMART_SAVE_STRATEGY_CONFIG,

    challengeTypes:
      SAVINGS_CHALLENGE_TYPES,

    challengeDifficulties:
      SAVINGS_CHALLENGE_DIFFICULTIES,

    fundingSources:
      SAVING_FUNDING_SOURCES,

    automationTypes:
      SAVING_AUTOMATION_TYPES,

    defaults:
      SMART_SAVE_DEFAULTS,

    milestones:
      SAVING_MILESTONES,

    cacheKeys:
      SMART_SAVE_CACHE_KEYS,

    request:
      SMART_SAVE_REQUEST_CONFIG,

    errorCodes:
      SMART_SAVE_ERROR_CODES,

    ui:
      SMART_SAVE_UI,

    features:
      SMART_SAVE_FEATURES,
  });

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default SMART_SAVE_CONFIG;
