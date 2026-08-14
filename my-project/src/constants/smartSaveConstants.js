// src/constants/smartSaveConstants.js

/**
 * ============================================================
 * SMARTSAVE CONSTANTS
 * ============================================================
 *
 * Canonical domain constants for the SmartSave frontend.
 *
 * Responsibilities:
 * - Domain values
 * - UI-facing labels
 * - Status definitions
 * - Feature definitions
 * - Default values
 * - Pagination limits
 * - Lifecycle values
 * - Frontend composite feature definitions
 *
 * This module MUST remain pure.
 *
 * It MUST NOT:
 * - call APIs
 * - import axios
 * - contain API URLs
 * - contain database logic
 * - perform financial calculations
 * - contain React state
 *
 * API communication:
 *   smartSaveService.js
 *   smartSaveConfig.js
 *
 * Calculations:
 *   savingsCalculations.js
 *   savingsForecast.js
 *
 * ============================================================
 */


/* ============================================================
   GENERAL
============================================================ */

export const SMART_SAVE_NAME = "SmartSave";

export const SMART_SAVE_CURRENCY = "NGN";

export const DEFAULT_CURRENCY = SMART_SAVE_CURRENCY;

export const SMART_SAVE_LOCALE = "en-NG";





export const SAVINGS_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
};


export const SAVINGS_HEALTH_STATUS = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
  CRITICAL: "critical",
};


export const SAFE_TO_SAVE_STATUS = {
  SAFE: "safe",
  CAUTION: "caution",
  NOT_SAFE: "not_safe",
};
/* ============================================================
   RESOURCE TYPES
============================================================ */

export const SMART_SAVE_RESOURCE_TYPES = Object.freeze({
  ACCOUNT: "account",
  GOAL: "goal",
  PLAN: "plan",
  SCHEDULE: "schedule",
  EXECUTION: "execution",
  CONTRIBUTION: "contribution",
  CHALLENGE: "challenge",
  INSIGHT: "insight",
  AUTO_SAVE: "autoSave",
  FORECAST: "forecast",
});


/* ============================================================
   ACCOUNT
============================================================ */

export const SAVING_ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  LOCKED: "locked",
  CLOSED: "closed",
});

export const SAVING_ACCOUNT_TYPE = Object.freeze({
  SAVINGS: "savings",
});

export const SAVING_ACCOUNT_STATUS_LABELS = Object.freeze({
  [SAVING_ACCOUNT_STATUS.ACTIVE]: "Active",
  [SAVING_ACCOUNT_STATUS.PAUSED]: "Paused",
  [SAVING_ACCOUNT_STATUS.LOCKED]: "Locked",
  [SAVING_ACCOUNT_STATUS.CLOSED]: "Closed",
});


/* ============================================================
   GOALS
============================================================ */

export const SMART_SAVE_GOAL_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
});

export const SAVING_GOAL_STATUS_LABELS = Object.freeze({
  [SMART_SAVE_GOAL_STATUS.ACTIVE]: "Active",
  [SMART_SAVE_GOAL_STATUS.PAUSED]: "Paused",
  [SMART_SAVE_GOAL_STATUS.COMPLETED]: "Completed",
  [SMART_SAVE_GOAL_STATUS.CANCELLED]: "Cancelled",
  [SMART_SAVE_GOAL_STATUS.EXPIRED]: "Expired",
});


/* ============================================================
   GOAL CATEGORIES
============================================================ */

export const SAVING_GOAL_CATEGORIES = Object.freeze({
  PERSONAL: "personal",
  EMERGENCY: "emergency",
  EDUCATION: "education",
  TRAVEL: "travel",
  HOME: "home",
  BUSINESS: "business",
  FAMILY: "family",
  VEHICLE: "vehicle",
  HEALTH: "health",
  INVESTMENT: "investment",
  OTHER: "other",
});

export const SAVING_GOAL_CATEGORY_LABELS = Object.freeze({
  [SAVING_GOAL_CATEGORIES.PERSONAL]: "Personal",
  [SAVING_GOAL_CATEGORIES.EMERGENCY]: "Emergency Fund",
  [SAVING_GOAL_CATEGORIES.EDUCATION]: "Education",
  [SAVING_GOAL_CATEGORIES.TRAVEL]: "Travel",
  [SAVING_GOAL_CATEGORIES.HOME]: "Home",
  [SAVING_GOAL_CATEGORIES.BUSINESS]: "Business",
  [SAVING_GOAL_CATEGORIES.FAMILY]: "Family",
  [SAVING_GOAL_CATEGORIES.VEHICLE]: "Vehicle",
  [SAVING_GOAL_CATEGORIES.HEALTH]: "Health",
  [SAVING_GOAL_CATEGORIES.INVESTMENT]: "Investment",
  [SAVING_GOAL_CATEGORIES.OTHER]: "Other",
});



/**
 * ============================================================
 * SMARTSAVE — SAVINGS INSIGHT PRIORITIES
 * ============================================================
 *
 * Central configuration for SmartSave financial insights.
 *
 * Responsibilities:
 * - Define supported insight priority levels
 * - Provide stable machine-readable values
 * - Provide display metadata
 * - Provide deterministic sorting order
 * - Keep priority definitions out of components/services
 *
 * This file contains configuration only.
 *
 * It MUST NOT:
 * - Perform financial calculations
 * - Fetch API data
 * - Manipulate React state
 * - Contain UI components
 * - Contain business calculations
 *
 * ============================================================
 */


/* ============================================================
   PRIORITY KEYS
============================================================ */

export const SAVINGS_INSIGHT_PRIORITIES =
  Object.freeze({
    CRITICAL: "critical",
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
    INFO: "info",
  });


/* ============================================================
   PRIORITY DEFINITIONS
============================================================ */

/**
 * Complete metadata for each insight priority.
 *
 * `order`
 * Lower numbers are more important and should appear first.
 */
export const SAVINGS_INSIGHT_PRIORITY_CONFIG =
  Object.freeze({
    [SAVINGS_INSIGHT_PRIORITIES.CRITICAL]: Object.freeze({
      value:
        SAVINGS_INSIGHT_PRIORITIES.CRITICAL,

      label: "Critical",

      description:
        "Requires immediate attention.",

      order: 1,

      severity: "critical",
    }),

    [SAVINGS_INSIGHT_PRIORITIES.HIGH]: Object.freeze({
      value:
        SAVINGS_INSIGHT_PRIORITIES.HIGH,

      label: "High",

      description:
        "Important savings issue or opportunity.",

      order: 2,

      severity: "high",
    }),

    [SAVINGS_INSIGHT_PRIORITIES.MEDIUM]: Object.freeze({
      value:
        SAVINGS_INSIGHT_PRIORITIES.MEDIUM,

      label: "Medium",

      description:
        "Worth reviewing to improve savings performance.",

      order: 3,

      severity: "medium",
    }),

    [SAVINGS_INSIGHT_PRIORITIES.LOW]: Object.freeze({
      value:
        SAVINGS_INSIGHT_PRIORITIES.LOW,

      label: "Low",

      description:
        "Useful recommendation with limited urgency.",

      order: 4,

      severity: "low",
    }),

    [SAVINGS_INSIGHT_PRIORITIES.INFO]: Object.freeze({
      value:
        SAVINGS_INSIGHT_PRIORITIES.INFO,

      label: "Information",

      description:
        "Informational savings update.",

      order: 5,

      severity: "info",
    }),
  });


/* ============================================================
   PRIORITY ORDER
============================================================ */

/**
 * Canonical priority order.
 *
 * Useful for:
 * - Sorting insights
 * - Ranking dashboard cards
 * - Selecting the highest-priority insight
 * - Deterministic API/UI rendering
 */
export const SAVINGS_INSIGHT_PRIORITY_ORDER =
  Object.freeze([
    SAVINGS_INSIGHT_PRIORITIES.CRITICAL,
    SAVINGS_INSIGHT_PRIORITIES.HIGH,
    SAVINGS_INSIGHT_PRIORITIES.MEDIUM,
    SAVINGS_INSIGHT_PRIORITIES.LOW,
    SAVINGS_INSIGHT_PRIORITIES.INFO,
  ]);


/* ============================================================
   DEFAULT PRIORITY
============================================================ */

/**
 * Safe fallback when an insight does not provide
 * a recognized priority.
 */
export const DEFAULT_SAVINGS_INSIGHT_PRIORITY =
  SAVINGS_INSIGHT_PRIORITIES.INFO;


/* ============================================================
   PRIORITY VALIDATION
============================================================ */

/**
 * Check whether a value is a supported insight priority.
 */
export const isSavingsInsightPriority = (
  value
) =>
  SAVINGS_INSIGHT_PRIORITY_ORDER.includes(
    value
  );


/* ============================================================
   PRIORITY NORMALIZATION
============================================================ */

/**
 * Normalize an incoming priority value.
 *
 * Handles:
 * - uppercase values
 * - whitespace
 * - hyphenated values
 * - invalid values
 *
 * Invalid values safely fall back to INFO.
 */
export const normalizeSavingsInsightPriority = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return DEFAULT_SAVINGS_INSIGHT_PRIORITY;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  const priority =
    normalized.replace(
      /_/g,
      ""
    );

  switch (priority) {
    case "critical":
      return SAVINGS_INSIGHT_PRIORITIES.CRITICAL;

    case "high":
      return SAVINGS_INSIGHT_PRIORITIES.HIGH;

    case "medium":
      return SAVINGS_INSIGHT_PRIORITIES.MEDIUM;

    case "low":
      return SAVINGS_INSIGHT_PRIORITIES.LOW;

    case "info":
    case "information":
      return SAVINGS_INSIGHT_PRIORITIES.INFO;

    default:
      return DEFAULT_SAVINGS_INSIGHT_PRIORITY;
  }
};


/* ============================================================
   PRIORITY RANK
============================================================ */

/**
 * Return the numerical ranking of a priority.
 *
 * Lower rank = higher importance.
 */
export const getSavingsInsightPriorityRank = (
  value
) => {
  const priority =
    normalizeSavingsInsightPriority(
      value
    );

  return (
    SAVINGS_INSIGHT_PRIORITY_CONFIG[
      priority
    ]?.order ?? 999
  );
};


/* ============================================================
   PRIORITY CONFIG GETTER
============================================================ */

/**
 * Return normalized configuration for an insight priority.
 */
export const getSavingsInsightPriorityConfig = (
  value
) => {
  const priority =
    normalizeSavingsInsightPriority(
      value
    );

  return (
    SAVINGS_INSIGHT_PRIORITY_CONFIG[
      priority
    ] ??
    SAVINGS_INSIGHT_PRIORITY_CONFIG[
      DEFAULT_SAVINGS_INSIGHT_PRIORITY
    ]
  );
};


/* ============================================================
   SORTING HELPER
============================================================ */

/**
 * Compare two insight priorities.
 *
 * Can be passed directly to Array.prototype.sort().
 *
 * Example:
 *
 * insights.sort(
 *   compareSavingsInsightPriority
 * );
 */
export const compareSavingsInsightPriority = (
  first,
  second
) =>
  getSavingsInsightPriorityRank(
    first
  ) -
  getSavingsInsightPriorityRank(
    second
  );


/* ============================================================
   DEFAULT EXPORT
============================================================ */

export const savingsInsightPrioritiesConfig =
  Object.freeze({
    values:
      SAVINGS_INSIGHT_PRIORITIES,

    definitions:
      SAVINGS_INSIGHT_PRIORITY_CONFIG,

    order:
      SAVINGS_INSIGHT_PRIORITY_ORDER,

    default:
      DEFAULT_SAVINGS_INSIGHT_PRIORITY,
  });



/* ============================================================
   GOAL PRIORITY
============================================================ */

export const SAVING_GOAL_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

export const SAVING_GOAL_PRIORITY_LABELS = Object.freeze({
  [SAVING_GOAL_PRIORITY.LOW]: "Low",
  [SAVING_GOAL_PRIORITY.MEDIUM]: "Medium",
  [SAVING_GOAL_PRIORITY.HIGH]: "High",
  [SAVING_GOAL_PRIORITY.CRITICAL]: "Critical",
});


/* ============================================================
   PLANS
============================================================ */

export const SAVINGS_PLAN_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const SAVING_PLAN_STATUS_LABELS = Object.freeze({
  [SAVINGS_PLAN_STATUS.DRAFT]: "Draft",
  [SAVINGS_PLAN_STATUS.ACTIVE]: "Active",
  [SAVINGS_PLAN_STATUS.PAUSED]: "Paused",
  [SAVINGS_PLAN_STATUS.COMPLETED]: "Completed",
  [SAVINGS_PLAN_STATUS.CANCELLED]: "Cancelled",
});


/* ============================================================
   SCHEDULES
============================================================ */

export const SAVING_SCHEDULE_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

export const SAVING_SCHEDULE_STATUS_LABELS = Object.freeze({
  [SAVING_SCHEDULE_STATUS.ACTIVE]: "Active",
  [SAVING_SCHEDULE_STATUS.PAUSED]: "Paused",
  [SAVING_SCHEDULE_STATUS.CANCELLED]: "Cancelled",
  [SAVING_SCHEDULE_STATUS.COMPLETED]: "Completed",
});


/* ============================================================
   EXECUTIONS
============================================================ */

export const SAVING_EXECUTION_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  RETRYING: "retrying",
});

export const SAVING_EXECUTION_STATUS_LABELS = Object.freeze({
  [SAVING_EXECUTION_STATUS.PENDING]: "Pending",
  [SAVING_EXECUTION_STATUS.PROCESSING]: "Processing",
  [SAVING_EXECUTION_STATUS.COMPLETED]: "Completed",
  [SAVING_EXECUTION_STATUS.FAILED]: "Failed",
  [SAVING_EXECUTION_STATUS.CANCELLED]: "Cancelled",
  [SAVING_EXECUTION_STATUS.RETRYING]: "Retrying",
});


/* ============================================================
   CONTRIBUTIONS
============================================================ */

export const SAVING_CONTRIBUTION_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

export const SAVING_CONTRIBUTION_STATUS_LABELS = Object.freeze({
  [SAVING_CONTRIBUTION_STATUS.PENDING]: "Pending",
  [SAVING_CONTRIBUTION_STATUS.PROCESSING]: "Processing",
  [SAVING_CONTRIBUTION_STATUS.COMPLETED]: "Completed",
  [SAVING_CONTRIBUTION_STATUS.FAILED]: "Failed",
  [SAVING_CONTRIBUTION_STATUS.CANCELLED]: "Cancelled",
});


/* ============================================================
   CHALLENGES
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


/* ============================================================
   SAVINGS CHALLENGE STATUS LABELS
============================================================ */

// export const SAVINGS_CHALLENGE_STATUS_LABELS = Object.freeze({
//   draft: "Draft",
//   active: "Active",
//   paused: "Paused",
//   completed: "Completed",
//   cancelled: "Cancelled",
//   expired: "Expired",
// });



export const CHALLENGE_STATUS_LABELS = Object.freeze({
  [SAVINGS_CHALLENGE_STATUS.DRAFT]: "Draft",
  [SAVINGS_CHALLENGE_STATUS.ACTIVE]: "Active",
  [SAVINGS_CHALLENGE_STATUS.PAUSED]: "Paused",
  [SAVINGS_CHALLENGE_STATUS.COMPLETED]: "Completed",
  [SAVINGS_CHALLENGE_STATUS.CANCELLED]: "Cancelled",
  [SAVINGS_CHALLENGE_STATUS.FAILED]: "Failed",
  [SAVINGS_CHALLENGE_STATUS.EXPIRED]: "Expired",
  [SAVINGS_CHALLENGE_STATUS.ARCHIVED]: "Archived",
});


export const SMART_SAVE_MODULES = Object.freeze({
  ACCOUNTS: "accounts",
  GOALS: "goals",
  PLANS: "plans",
  SCHEDULES: "schedules",
  EXECUTIONS: "executions",
  CHALLENGES: "challenges",
  INSIGHTS: "insights",
  AUTOSAVE: "autoSave",
  ACTIVITIES: "activities",
  FORECAST: "forecast",
});

export const SAVINGS_ERROR_TYPES = Object.freeze({
  NETWORK: "network",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  VALIDATION: "validation",
  NOT_FOUND: "not_found",
  SERVER: "server",
  UNKNOWN: "unknown",
});
export const SAVINGS_STAT_TYPES = Object.freeze({
  TOTAL_SAVED: "total_saved",
  TOTAL_TARGET: "total_target",
  TOTAL_REMAINING: "total_remaining",
  TOTAL_GOALS: "total_goals",
  ACTIVE_GOALS: "active_goals",
  COMPLETED_GOALS: "completed_goals",
  PROGRESS: "progress",
});



export const SAVINGS_CHALLENGE_TYPES = Object.freeze({
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
  STREAK: "streak",
  INCREASING: "increasing",
  NO_SPEND: "no_spend",
  ROUND_UP: "round_up",
  CUSTOM: "custom",
});

export const SAVINGS_CHALLENGE_DIFFICULTIES = Object.freeze({
  BEGINNER: "beginner",
  EASY: "easy",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
});

export const SAVINGS_CHALLENGE_TYPE_LABELS = Object.freeze({
  [SAVINGS_CHALLENGE_TYPES.FIXED_AMOUNT]: "Fixed Amount",
  [SAVINGS_CHALLENGE_TYPES.PERCENTAGE]: "Percentage",
  [SAVINGS_CHALLENGE_TYPES.STREAK]: "Savings Streak",
  [SAVINGS_CHALLENGE_TYPES.INCREASING]: "Increasing",
  [SAVINGS_CHALLENGE_TYPES.NO_SPEND]: "No-Spend",
  [SAVINGS_CHALLENGE_TYPES.ROUND_UP]: "Round Up",
  [SAVINGS_CHALLENGE_TYPES.CUSTOM]: "Custom",
});

export const SAVINGS_CHALLENGE_DIFFICULTY_LABELS =
  Object.freeze({
    [SAVINGS_CHALLENGE_DIFFICULTIES.BEGINNER]: "Beginner",
    [SAVINGS_CHALLENGE_DIFFICULTIES.EASY]: "Easy",
    [SAVINGS_CHALLENGE_DIFFICULTIES.INTERMEDIATE]:
      "Intermediate",
    [SAVINGS_CHALLENGE_DIFFICULTIES.ADVANCED]: "Advanced",
    [SAVINGS_CHALLENGE_DIFFICULTIES.EXPERT]: "Expert",
  });


/* ============================================================
   FRONTEND CHALLENGE COMPATIBILITY EXPORT
============================================================ */

/**
 * Existing SmartSave components consume CHALLENGE_STATUS.
 *
 * Keep SAVINGS_CHALLENGE_STATUS as the canonical domain name,
 * while exposing CHALLENGE_STATUS as a stable frontend alias.
 */
export const CHALLENGE_STATUS = SAVINGS_CHALLENGE_STATUS;

export const CHALLENGE_TYPES = SAVINGS_CHALLENGE_TYPES;

export const CHALLENGE_DIFFICULTIES =
  SAVINGS_CHALLENGE_DIFFICULTIES;


/* ============================================================
   FREQUENCY
============================================================ */

export const SAVINGS_FREQUENCIES = Object.freeze({
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  FORTNIGHTLY: "fortnightly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
  ANNUALLY: "annually",
  ONCE: "once",
});

export const SAVING_FREQUENCY_LABELS = Object.freeze({
  [SAVINGS_FREQUENCIES.DAILY]: "Daily",
  [SAVINGS_FREQUENCIES.WEEKLY]: "Weekly",
  [SAVINGS_FREQUENCIES.BIWEEKLY]: "Every 2 weeks",
  [SAVINGS_FREQUENCIES.FORTNIGHTLY]: "Every 2 weeks",
  [SAVINGS_FREQUENCIES.MONTHLY]: "Monthly",
  [SAVINGS_FREQUENCIES.QUARTERLY]: "Quarterly",
  [SAVINGS_FREQUENCIES.YEARLY]: "Yearly",
  [SAVINGS_FREQUENCIES.ANNUALLY]: "Yearly",
  [SAVINGS_FREQUENCIES.ONCE]: "One-time",
});


/* ============================================================
   FUNDING SOURCES
============================================================ */

export const SAVING_FUNDING_SOURCE = Object.freeze({
  WALLET: "wallet",
});

export const SAVING_FUNDING_SOURCE_LABELS = Object.freeze({
  [SAVING_FUNDING_SOURCE.WALLET]: "Wallet",
});


/* ============================================================
   SAVING STRATEGIES
============================================================ */

export const SAVINGS_STRATEGIES = Object.freeze({
  FIXED: "fixed",
  FIXED_AMOUNT: "fixed_amount",
  FLEXIBLE: "flexible",
  GOAL_BASED: "goal_based",
  AUTOMATIC: "automatic",
  PERCENTAGE: "percentage",
  ROUND_UP: "round_up",
  SMART: "smart",
});

export const SAVING_STRATEGY_LABELS = Object.freeze({
  [SAVINGS_STRATEGIES.FIXED]: "Fixed",
  [SAVINGS_STRATEGIES.FIXED_AMOUNT]: "Fixed Amount",
  [SAVINGS_STRATEGIES.FLEXIBLE]: "Flexible",
  [SAVINGS_STRATEGIES.GOAL_BASED]: "Goal Based",
  [SAVINGS_STRATEGIES.AUTOMATIC]: "Automatic",
  [SAVINGS_STRATEGIES.PERCENTAGE]: "Percentage",
  [SAVINGS_STRATEGIES.ROUND_UP]: "Round Up",
  [SAVINGS_STRATEGIES.SMART]: "Smart Saving",
});


/* ============================================================
   FRONTEND STRATEGY COMPATIBILITY EXPORT
============================================================ */

/**
 * Existing SmartSave UI consumes SAVINGS_STRATEGIES.
 *
 * This is intentionally an alias of the canonical strategy
 * definitions. No additional API endpoint is implied.
 */


export const SAVINGS_STRATEGY_LABELS =
  SAVING_STRATEGY_LABELS;


/* ============================================================
   AUTOMATION
============================================================ */

export const SAVING_AUTOMATION_TYPE = Object.freeze({
  AUTO_SAVE: "autoSave",
  SCHEDULE: "schedule",
});


/* ============================================================
   AUTOSAVE
============================================================ */

export const AUTO_SAVE_STATUS = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
});

export const AUTO_SAVE_STATUS_LABELS = Object.freeze({
  [AUTO_SAVE_STATUS.ACTIVE]: "Active",
  [AUTO_SAVE_STATUS.PAUSED]: "Paused",
  [AUTO_SAVE_STATUS.CANCELLED]: "Cancelled",
});


/* ============================================================
   INSIGHTS
============================================================ */

export const SAVINGS_INSIGHT_TYPES = Object.freeze({
  PROGRESS: "progress",
  PACE: "pace",
  HEALTH: "health",
  RISK: "risk",
  MILESTONE: "milestone",
  CONTRIBUTION: "contribution",
  COMPLETION: "completion",
  RECOMMENDATION: "recommendation",
});

export const SAVING_INSIGHT_SEVERITY = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
});

export const SAVING_INSIGHT_TYPE_LABELS = Object.freeze({
  [SAVINGS_INSIGHT_TYPES.PROGRESS]: "Progress",
  [SAVINGS_INSIGHT_TYPES.PACE]: "Saving Pace",
  [SAVINGS_INSIGHT_TYPES.HEALTH]: "Goal Health",
  [SAVINGS_INSIGHT_TYPES.RISK]: "Risk",
  [SAVINGS_INSIGHT_TYPES.MILESTONE]: "Milestone",
  [SAVINGS_INSIGHT_TYPES.CONTRIBUTION]: "Contribution",
  [SAVINGS_INSIGHT_TYPES.COMPLETION]: "Completion",
  [SAVINGS_INSIGHT_TYPES.RECOMMENDATION]: "Recommendation",
});


/* ============================================================
   FRONTEND INSIGHT COMPATIBILITY EXPORT
============================================================ */



export const SAVINGS_INSIGHT_SEVERITIES =
  SAVING_INSIGHT_SEVERITY;


/* ============================================================
   MILESTONES
============================================================ */

export const SAVING_MILESTONES = Object.freeze([
  25,
  50,
  75,
  90,
  100,
]);


/* ============================================================
   PRIORITY
============================================================ */

export const SAVING_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});


/* ============================================================
   RISK LEVELS
============================================================ */

export const SAVING_RISK_LEVEL = Object.freeze({
  NONE: "none",
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical",
});


/* ============================================================
   PAGINATION
============================================================ */

export const SAVING_PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
});


/* ============================================================
   UI LIMITS
============================================================ */

export const SMART_SAVE_UI_LIMITS = Object.freeze({
  MAX_INSIGHTS: 20,
  MAX_RECENT_ACTIVITY: 10,
  MAX_DASHBOARD_GOALS: 5,
  MAX_DASHBOARD_PLANS: 5,
  MAX_DASHBOARD_CHALLENGES: 5,
  MAX_DASHBOARD_SCHEDULES: 5,
  MAX_RECENT_EXECUTIONS: 10,
});


/* ============================================================
   DEFAULT VALUES
============================================================ */

export const SMART_SAVE_DEFAULTS = Object.freeze({
  currency: SMART_SAVE_CURRENCY,
  locale: SMART_SAVE_LOCALE,

  frequency: SAVINGS_FREQUENCIES.MONTHLY,

  goalStatus: SMART_SAVE_GOAL_STATUS.ACTIVE,

  planStatus: SAVINGS_PLAN_STATUS.DRAFT,

  accountStatus: SAVING_ACCOUNT_STATUS.ACTIVE,

  challengeStatus: SAVINGS_CHALLENGE_STATUS.ACTIVE,

  priority: SAVING_PRIORITY.MEDIUM,

  page: SAVING_PAGINATION.DEFAULT_PAGE,

  limit: SAVING_PAGINATION.DEFAULT_LIMIT,
});


/* ============================================================
   EMPTY STATE VALUES
============================================================ */

export const SMART_SAVE_EMPTY = Object.freeze({
  accounts: [],
  goals: [],
  plans: [],
  schedules: [],
  executions: [],
  contributions: [],
  challenges: [],
  insights: [],
  autoSaves: [],
  contributionHistory: [],
  forecasts: [],
});


/* ============================================================
   DASHBOARD SECTIONS
============================================================ */

export const SMART_SAVE_DASHBOARD_SECTIONS =
  Object.freeze({
    OVERVIEW: "overview",
    ACCOUNTS: "accounts",
    GOALS: "goals",
    PLANS: "plans",
    SCHEDULES: "schedules",
    CHALLENGES: "challenges",
    ACTIVITY: "activity",
    INSIGHTS: "insights",
    FORECAST: "forecast",
  });


/* ============================================================
   ACTIVITY TYPES
============================================================ */

export const SAVING_ACTIVITY_TYPE = Object.freeze({
  CONTRIBUTION: "contribution",
  EXECUTION: "execution",
  GOAL: "goal",
  PLAN: "plan",
  SCHEDULE: "schedule",
  CHALLENGE: "challenge",
  AUTO_SAVE: "autoSave",
});


/* ============================================================
   LIFECYCLE ACTIONS
============================================================ */

export const SAVING_LIFECYCLE_ACTION = Object.freeze({
  ACTIVATE: "activate",
  PAUSE: "pause",
  RESUME: "resume",
  COMPLETE: "complete",
  CANCEL: "cancel",
  FAIL: "fail",
  EXPIRE: "expire",
  RESTORE: "restore",
  LOCK: "lock",
  CLOSE: "close",
  PRIMARY: "primary",
});


/* ============================================================
   ERROR CATEGORIES
============================================================ */

export const SMART_SAVE_ERROR = Object.freeze({
  INVALID_ID: "INVALID_ID",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  INVALID_QUERY: "INVALID_QUERY",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION_ERROR",
  NETWORK: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
});


/* ============================================================
   DATE FORMATS
============================================================ */

export const SMART_SAVE_DATE_FORMAT = Object.freeze({
  API: "YYYY-MM-DD",
  DISPLAY: "DD MMM YYYY",
  DISPLAY_LONG: "DD MMMM YYYY",
  DATE_TIME: "DD MMM YYYY, HH:mm",
});


/* ============================================================
   FEATURE KEYS
============================================================ */

export const SMART_SAVE_FEATURE = Object.freeze({
  ACCOUNTS: "accounts",
  GOALS: "goals",
  PLANS: "plans",
  SCHEDULES: "schedules",
  EXECUTIONS: "executions",
  CONTRIBUTIONS: "contributions",
  CHALLENGES: "challenges",
  INSIGHTS: "insights",
  AUTO_SAVE: "autoSave",
  FORECAST: "forecast",
  EMERGENCY_FUND: "emergencyFund",
  STRATEGIES: "strategies",
});


/* ============================================================
   FRONTEND COMPOSITE FEATURES
============================================================ */

export const SMART_SAVE_COMPOSITE_FEATURES =
  Object.freeze({
    ACTIVITY: Object.freeze([
      SAVING_ACTIVITY_TYPE.CONTRIBUTION,
      SAVING_ACTIVITY_TYPE.EXECUTION,
      SAVING_ACTIVITY_TYPE.GOAL,
      SAVING_ACTIVITY_TYPE.PLAN,
      SAVING_ACTIVITY_TYPE.SCHEDULE,
      SAVING_ACTIVITY_TYPE.CHALLENGE,
      SAVING_ACTIVITY_TYPE.AUTO_SAVE,
    ]),

    FORECAST: Object.freeze([
      SMART_SAVE_RESOURCE_TYPES.GOAL,
      SMART_SAVE_RESOURCE_TYPES.PLAN,
      SMART_SAVE_RESOURCE_TYPES.CONTRIBUTION,
      SMART_SAVE_RESOURCE_TYPES.SCHEDULE,
    ]),

    EMERGENCY_FUND: Object.freeze([
      SMART_SAVE_RESOURCE_TYPES.ACCOUNT,
      SMART_SAVE_RESOURCE_TYPES.GOAL,
      SMART_SAVE_RESOURCE_TYPES.PLAN,
      SMART_SAVE_RESOURCE_TYPES.CONTRIBUTION,
    ]),

    STRATEGIES: Object.freeze([
      SMART_SAVE_RESOURCE_TYPES.PLAN,
      SMART_SAVE_RESOURCE_TYPES.SCHEDULE,
      SMART_SAVE_RESOURCE_TYPES.AUTO_SAVE,
    ]),
  });


/* ============================================================
   STATUS HELPERS
============================================================ */

export const isActiveStatus = (status) =>
  [
    SAVING_ACCOUNT_STATUS.ACTIVE,
    SMART_SAVE_GOAL_STATUS.ACTIVE,
    SAVINGS_PLAN_STATUS.ACTIVE,
    SAVING_SCHEDULE_STATUS.ACTIVE,
    SAVINGS_CHALLENGE_STATUS.ACTIVE,
    AUTO_SAVE_STATUS.ACTIVE,
  ].includes(status);


export const isPausedStatus = (status) =>
  [
    SAVING_ACCOUNT_STATUS.PAUSED,
    SMART_SAVE_GOAL_STATUS.PAUSED,
    SAVINGS_PLAN_STATUS.PAUSED,
    SAVING_SCHEDULE_STATUS.PAUSED,
    SAVINGS_CHALLENGE_STATUS.PAUSED,
    AUTO_SAVE_STATUS.PAUSED,
  ].includes(status);


export const isCompletedStatus = (status) =>
  [
    SMART_SAVE_GOAL_STATUS.COMPLETED,
    SAVINGS_PLAN_STATUS.COMPLETED,
    SAVING_SCHEDULE_STATUS.COMPLETED,
    SAVINGS_CHALLENGE_STATUS.COMPLETED,
    SAVING_EXECUTION_STATUS.COMPLETED,
  ].includes(status);


export const isTerminalStatus = (status) =>
  [
    SAVING_ACCOUNT_STATUS.CLOSED,

    SMART_SAVE_GOAL_STATUS.COMPLETED,
    SMART_SAVE_GOAL_STATUS.CANCELLED,
    SMART_SAVE_GOAL_STATUS.EXPIRED,

    SAVINGS_PLAN_STATUS.COMPLETED,
    SAVINGS_PLAN_STATUS.CANCELLED,

    SAVING_SCHEDULE_STATUS.CANCELLED,
    SAVING_SCHEDULE_STATUS.COMPLETED,

    SAVING_EXECUTION_STATUS.COMPLETED,
    SAVING_EXECUTION_STATUS.FAILED,
    SAVING_EXECUTION_STATUS.CANCELLED,

    SAVINGS_CHALLENGE_STATUS.COMPLETED,
    SAVINGS_CHALLENGE_STATUS.CANCELLED,
    SAVINGS_CHALLENGE_STATUS.FAILED,
    SAVINGS_CHALLENGE_STATUS.EXPIRED,
    SAVINGS_CHALLENGE_STATUS.ARCHIVED,

    AUTO_SAVE_STATUS.CANCELLED,
  ].includes(status);


/* ============================================================
   DEFAULT EXPORT
============================================================ */

const SMART_SAVE_CONSTANTS = Object.freeze({
  name: SMART_SAVE_NAME,
  currency: SMART_SAVE_CURRENCY,
  locale: SMART_SAVE_LOCALE,

  resources: SMART_SAVE_RESOURCE_TYPES,

  account: {
    status: SAVING_ACCOUNT_STATUS,
    type: SAVING_ACCOUNT_TYPE,
    labels: SAVING_ACCOUNT_STATUS_LABELS,
  },

  goal: {
    status: SMART_SAVE_GOAL_STATUS,
    categories: SAVING_GOAL_CATEGORIES,
    priorities: SAVING_GOAL_PRIORITY,
    statusLabels: SAVING_GOAL_STATUS_LABELS,
    categoryLabels: SAVING_GOAL_CATEGORY_LABELS,
    priorityLabels: SAVING_GOAL_PRIORITY_LABELS,
  },

  plan: {
    status: SAVINGS_PLAN_STATUS,
    statusLabels: SAVING_PLAN_STATUS_LABELS,
  },

  schedule: {
    status: SAVING_SCHEDULE_STATUS,
    statusLabels: SAVING_SCHEDULE_STATUS_LABELS,
  },

  execution: {
    status: SAVING_EXECUTION_STATUS,
    statusLabels: SAVING_EXECUTION_STATUS_LABELS,
  },

  contribution: {
    status: SAVING_CONTRIBUTION_STATUS,
    statusLabels: SAVING_CONTRIBUTION_STATUS_LABELS,
  },

  challenge: {
    status: SAVINGS_CHALLENGE_STATUS,
    types: SAVINGS_CHALLENGE_TYPES,
    difficulties: SAVINGS_CHALLENGE_DIFFICULTIES,
    statusLabels: CHALLENGE_STATUS_LABELS,
    typeLabels: SAVINGS_CHALLENGE_TYPE_LABELS,
    difficultyLabels:
      SAVINGS_CHALLENGE_DIFFICULTY_LABELS,
  },

  autoSave: {
    status: AUTO_SAVE_STATUS,
    statusLabels: AUTO_SAVE_STATUS_LABELS,
  },

  frequency: SAVINGS_FREQUENCIES,

  frequencyLabels: SAVING_FREQUENCY_LABELS,

  fundingSource: SAVING_FUNDING_SOURCE,

  fundingSourceLabels:
    SAVING_FUNDING_SOURCE_LABELS,

  strategy: SAVINGS_STRATEGIES,

  strategyLabels: SAVING_STRATEGY_LABELS,

  automation: SAVING_AUTOMATION_TYPE,

  insight: {
    types: SAVINGS_INSIGHT_TYPES,
    severities: SAVING_INSIGHT_SEVERITY,
    typeLabels: SAVING_INSIGHT_TYPE_LABELS,
  },

  milestones: SAVING_MILESTONES,

  priority: SAVING_PRIORITY,

  riskLevel: SAVING_RISK_LEVEL,

  pagination: SAVING_PAGINATION,

  ui: SMART_SAVE_UI_LIMITS,

  defaults: SMART_SAVE_DEFAULTS,

  empty: SMART_SAVE_EMPTY,

  dashboard: SMART_SAVE_DASHBOARD_SECTIONS,

  activity: SAVING_ACTIVITY_TYPE,

  lifecycle: SAVING_LIFECYCLE_ACTION,

  errors: SMART_SAVE_ERROR,

  dateFormat: SMART_SAVE_DATE_FORMAT,

  features: SMART_SAVE_FEATURE,

  composite: SMART_SAVE_COMPOSITE_FEATURES,
});


export default SMART_SAVE_CONSTANTS;