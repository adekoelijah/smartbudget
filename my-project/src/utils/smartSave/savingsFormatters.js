
// src/utils/smartSave/savingsFormatters.js

/**
 * ============================================================
 * SMARTSAVE — SAVINGS FORMATTERS
 * ============================================================
 *
 * Production-ready, pure frontend presentation utilities.
 *
 * Responsibilities:
 * - Number formatting
 * - Currency formatting
 * - Percentage formatting
 * - Date/time formatting
 * - Relative time
 * - Duration formatting
 * - Status formatting
 * - Frequency formatting
 * - Strategy formatting
 * - Challenge formatting
 * - Savings progress formatting
 * - Safe text formatting
 * - Entity/display helpers
 *
 * This module:
 * - Does NOT call APIs
 * - Does NOT mutate API responses
 * - Does NOT contain React state
 * - Does NOT perform network requests
 * - Does NOT contain financial business rules
 * - Does NOT make financial decisions
 *
 * Compatibility APIs intentionally retained:
 * - formatCurrency
 * - formatDate
 * - formatSavingsDate
 * - calculateSavingsProgress
 *
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

export const DEFAULT_CURRENCY = "NGN";
export const DEFAULT_LOCALE = "en-NG";

export const CURRENCY_DECIMALS = Object.freeze({
  NGN: 2,
  USD: 2,
  GBP: 2,
  EUR: 2,
  GHS: 2,
  KES: 2,
  ZAR: 2,
});

const DEFAULT_DATE_OPTIONS = Object.freeze({
  year: "numeric",
  month: "short",
  day: "numeric",
});

const DEFAULT_DATETIME_OPTIONS = Object.freeze({
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const STATUS_LABELS = Object.freeze({
  active: "Active",
  paused: "Paused",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  failed: "Failed",
  expired: "Expired",
  draft: "Draft",
  locked: "Locked",
  closed: "Closed",
  archived: "Archived",
  inactive: "Inactive",
  scheduled: "Scheduled",
  processing: "Processing",
  retrying: "Retrying",
  successful: "Successful",
  success: "Successful",
  upcoming: "Upcoming",
  overdue: "Overdue",
});

const FREQUENCY_LABELS = Object.freeze({
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  fortnightly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  annually: "Yearly",
  once: "One-time",
});

const STRATEGY_LABELS = Object.freeze({
  fixed: "Fixed Amount",
  fixed_amount: "Fixed Amount",
  flexible: "Flexible",
  goal_based: "Goal Based",
  automatic: "Automatic",
  percentage: "Percentage",
  round_up: "Round Up",
  roundup: "Round Up",
  smart: "Smart Saving",
});

const STRATEGY_DESCRIPTIONS = Object.freeze({
  fixed:
    "Save a consistent amount at your chosen frequency.",

  fixed_amount:
    "Save a consistent amount at your chosen frequency.",

  flexible:
    "Adjust contributions while continuing toward your savings goal.",

  goal_based:
    "Structure savings around a specific financial goal.",

  automatic:
    "Automate contributions using your configured savings rules.",

  percentage:
    "Save a percentage of your available income or contribution base.",

  round_up:
    "Automatically save the difference created by rounding transactions.",

  roundup:
    "Automatically save the difference created by rounding transactions.",

  smart:
    "Use SmartSave automation to optimize your savings contributions.",
});

const CHALLENGE_TYPE_LABELS = Object.freeze({
  fixed_amount: "Fixed Amount",
  increasing: "Increasing",
  percentage: "Percentage",
  streak: "Savings Streak",
  no_spend: "No-Spend",
  round_up: "Round Up",
  roundup: "Round Up",
  custom: "Custom",
});

const DIFFICULTY_LABELS = Object.freeze({
  beginner: "Beginner",
  easy: "Easy",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
});




/* ============================================================
   SMARTSAVE SAVINGS FORMATTERS
   src/utils/smartSave/savingsFormatters.js
============================================================ */

/* ============================================================
   OPTIONAL CONFIGURATION
============================================================ */

const DEFAULT_SAVINGS_CURRENCY =
  "NGN";


/* ============================================================
   SAFE TYPE HELPERS
============================================================ */

const isObject = (
  value
) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


const firstDefined = (
  ...values
) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null
  );


const toStringValue = (
  value,
  fallback = ""
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  const result =
    String(value).trim();

  return result || fallback;
};


/* ============================================================
   ID NORMALIZER
============================================================ */

export const normalizeId = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const id =
    String(value).trim();

  return id || null;
};


/* ============================================================
   NUMBER NORMALIZER
============================================================ */

export const normalizeNumber = (
  value,
  fallback = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};


/* ============================================================
   MONEY NORMALIZER
============================================================ */

export const normalizeMoney = (
  value,
  fallback = 0
) => {
  const number =
    normalizeNumber(
      value,
      fallback
    );

  return Math.max(
    0,
    number
  );
};


/* ============================================================
   INTEGER NORMALIZER
============================================================ */

export const toInteger = (
  value,
  fallback = 0
) => {
  const number =
    normalizeNumber(
      value,
      fallback
    );

  return Math.trunc(
    number
  );
};


/* ============================================================
   PERCENTAGE HELPERS
============================================================ */

export const clampPercentage = (
  value
) => {
  const number =
    normalizeNumber(
      value
    );

  return Math.min(
    100,
    Math.max(
      0,
      number
    )
  );
};


export const calculateProgressPercentage = (
  currentAmount,
  targetAmount
) => {
  const current =
    normalizeMoney(
      currentAmount
    );

  const target =
    normalizeMoney(
      targetAmount
    );

  if (
    target <= 0
  ) {
    return 0;
  }

  return clampPercentage(
    (current / target) *
      100
  );
};


/* ============================================================
   CURRENCY
============================================================ */

export const normalizeCurrency = (
  value,
  fallback =
    DEFAULT_SAVINGS_CURRENCY
) => {
  const currency =
    toStringValue(
      value,
      fallback
    ).toUpperCase();

  return currency;
};


/* ============================================================
   DATE NORMALIZER
============================================================ */

export const normalizeDateValue = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};


/* ============================================================
   TYPE NORMALIZER
============================================================ */

export const normalizeType = (
  value,
  fallback = "custom"
) => {
  const normalized =
    toStringValue(
      value
    )
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_"
      );

  return (
    normalized ||
    fallback
  );
};


/* ============================================================
   SAVINGS STATUS
============================================================ */

const SAVINGS_STATUS_ALIASES =
  Object.freeze({
    active: "active",
    running: "active",
    ongoing: "active",
    in_progress: "active",

    pending: "pending",

    paused: "paused",

    completed: "completed",
    complete: "completed",
    successful: "completed",

    cancelled: "cancelled",
    canceled: "cancelled",

    failed: "failed",

    expired: "expired",

    archived: "archived",

    inactive: "inactive",
  });


export const normalizeSavingsStatus = (
  value,
  fallback = "active"
) => {
  const normalized =
    normalizeType(
      value,
      fallback
    );

  return (
    SAVINGS_STATUS_ALIASES[
      normalized
    ] ??
    normalized
  );
};


/* ============================================================
   RESPONSE UNWRAPPER
============================================================ */

export const unwrapResponse = (
 response
) => {
  if (
    response === undefined ||
    response === null
  ) {
    return null;
  }

  /*
   * Support Axios responses.
   */

  const payload =
    response?.data ??
    response;

  if (
    payload === undefined ||
    payload === null
  ) {
    return null;
  }

  /*
   * Support:
   *
   * {
   *   success: true,
   *   data: {...}
   * }
   */

  if (
    isObject(payload) &&
    Object.prototype.hasOwnProperty.call(
      payload,
      "data"
    )
  ) {
    return payload.data;
  }

  return payload;
};


/* ============================================================
   ARRAY RESPONSE NORMALIZER
============================================================ */

export const normalizeArrayResponse = (
  response,
  keys = []
) => {
  const payload =
    unwrapResponse(
      response
    );

  if (
    Array.isArray(payload)
  ) {
    return payload;
  }

  if (
    !isObject(payload)
  ) {
    return [];
  }

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        payload[key]
      )
    ) {
      return payload[key];
    }
  }

  if (
    Array.isArray(
      payload.items
    )
  ) {
    return payload.items;
  }

  if (
    Array.isArray(
      payload.results
    )
  ) {
    return payload.results;
  }

  return [];
};


/* ============================================================
   SAVINGS CHALLENGE NORMALIZER
============================================================ */

/**
 * Normalize one savings challenge.
 *
 * This function:
 *
 * - preserves unknown backend fields
 * - normalizes IDs
 * - normalizes financial values
 * - calculates progress
 * - normalizes challenge type
 * - normalizes difficulty
 * - normalizes status
 * - normalizes streak values
 * - normalizes period counters
 * - normalizes currency
 * - normalizes dates
 *
 * It does NOT:
 *
 * - make API requests
 * - mutate the source object
 * - perform React state management
 * - modify backend business rules
 */

export const normalizeSavingsChallenge = (
  challenge
) => {
  if (
    !isObject(challenge)
  ) {
    return null;
  }


  /* ==========================================================
     ID
  ========================================================== */

  const id =
    normalizeId(
      firstDefined(
        challenge.id,
        challenge._id,
        challenge.challengeId
      )
    );


  /* ==========================================================
     FINANCIAL VALUES
  ========================================================== */

  const targetAmount =
    normalizeMoney(
      firstDefined(
        challenge.targetAmount,
        challenge.target,
        challenge.goalAmount
      )
    );


  const currentAmount =
    normalizeMoney(
      firstDefined(
        challenge.currentAmount,
        challenge.savedAmount,
        challenge.progressAmount,
        challenge.amountSaved,
        challenge.totalSaved
      )
    );


  const remainingAmount =
    Math.max(
      0,
      targetAmount -
        currentAmount
    );


  /* ==========================================================
     PROGRESS
  ========================================================== */

  const progress =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );


  /* ==========================================================
     NAME
  ========================================================== */

  const name =
    toStringValue(
      firstDefined(
        challenge.name,
        challenge.title,
        challenge.challengeName
      ),
      "Savings Challenge"
    );


  const title =
    toStringValue(
      firstDefined(
        challenge.title,
        challenge.name,
        challenge.challengeName
      ),
      name
    );


  const description =
    toStringValue(
      challenge.description
    );


  /* ==========================================================
     CLASSIFICATION
  ========================================================== */

  const challengeType =
    normalizeType(
      firstDefined(
        challenge.challengeType,
        challenge.type
      ),
      "custom"
    );


  const difficulty =
    normalizeType(
      challenge.difficulty,
      "beginner"
    );


  /* ==========================================================
     STATUS
  ========================================================== */

  const status =
    normalizeSavingsStatus(
      challenge.status,
      "active"
    );


  /* ==========================================================
     STREAKS
  ========================================================== */

  const currentStreak =
    Math.max(
      0,
      toInteger(
        firstDefined(
          challenge.currentStreak,
          challenge.streak,
          0
        )
      )
    );


  const longestStreak =
    Math.max(
      0,
      toInteger(
        firstDefined(
          challenge.longestStreak,
          challenge.bestStreak,
          0
        )
      )
    );


  /* ==========================================================
     PERIOD COUNTERS
  ========================================================== */

  const successfulPeriods =
    Math.max(
      0,
      toInteger(
        firstDefined(
          challenge.successfulPeriods,
          challenge.completedPeriods,
          0
        )
      )
    );


  const missedPeriods =
    Math.max(
      0,
      toInteger(
        firstDefined(
          challenge.missedPeriods,
          challenge.failedPeriods,
          0
        )
      )
    );


  /* ==========================================================
     CURRENCY
  ========================================================== */

  const currency =
    normalizeCurrency(
      challenge.currency
    );


  /* ==========================================================
     DATES
  ========================================================== */

  const startDate =
    normalizeDateValue(
      challenge.startDate
    );


  const endDate =
    normalizeDateValue(
      challenge.endDate
    );


  const createdAt =
    normalizeDateValue(
      challenge.createdAt
    );


  const updatedAt =
    normalizeDateValue(
      challenge.updatedAt
    );


  /* ==========================================================
     FINAL NORMALIZED OBJECT
  ========================================================== */

  return {
    /*
     * Preserve backend fields first.
     *
     * Canonical fields below override aliases.
     */
    ...challenge,


    /* Identity */

    id,

    _id:
      id ??
      challenge._id ??
      undefined,

    challengeId:
      id ??
      challenge.challengeId ??
      undefined,


    /* Display */

    name,

    title,

    description,


    /* Classification */

    challengeType,

    difficulty,

    status,


    /* Financial */

    targetAmount,

    currentAmount,

    savedAmount:
      currentAmount,

    remainingAmount,


    /* Progress */

    progress,

    progressPercentage:
      progress,


    /* Streaks */

    currentStreak,

    longestStreak,


    /* Periods */

    successfulPeriods,

    missedPeriods,


    /* Currency */

    currency,


    /* Dates */

    startDate,

    endDate,

    createdAt,

    updatedAt,
  };
};


/* ============================================================
   CHALLENGE COLLECTION NORMALIZER
============================================================ */

export const normalizeSavingsChallenges = (
  response
) =>
  normalizeArrayResponse(
    response,
    [
      "challenges",
      "savingsChallenges",
    ]
  )
    .map(
      normalizeSavingsChallenge
    )
    .filter(Boolean);


/* ============================================================
   SINGLE CHALLENGE RESPONSE NORMALIZER
============================================================ */

export const normalizeChallengeResponse = (
  response
) => {
  const payload =
    unwrapResponse(
      response
    );

  if (
    payload === null ||
    payload === undefined
  ) {
    return null;
  }

  const challenge =
    payload?.challenge ??
    payload?.savingsChallenge ??
    payload;

  return normalizeSavingsChallenge(
    challenge
  );
};



/* ============================================================
   INTERNAL HELPERS
============================================================ */

const toFiniteNumber = (value, fallback = 0) => {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : fallback;
  }

  if (typeof value === "bigint") {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/,/g, "")
      .trim();

    if (!cleaned) {
      return fallback;
    }

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  return fallback;
};

const toSafeString = (
  value,
  fallback = ""
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const result = String(value).trim();

  return result || fallback;
};

const normalizeKey = (value) =>
  toSafeString(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const resolveDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
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
    return null;
  }

  return date;
};

const resolveId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (
    typeof value === "object"
  ) {
    if (
      value._id !== undefined
    ) {
      return resolveId(
        value._id
      );
    }

    if (
      value.id !== undefined
    ) {
      return resolveId(
        value.id
      );
    }

    if (
      value.$oid !== undefined
    ) {
      return resolveId(
        value.$oid
      );
    }
  }

  return "";
};

const readValue = (
  object,
  keys = []
) => {
  if (
    !object ||
    typeof object !== "object"
  ) {
    return undefined;
  }

  for (const key of keys) {
    const value =
      object[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
};

const normalizeCurrencyOptions = (
  currencyOrOptions = DEFAULT_CURRENCY
) => {
  if (
    currencyOrOptions &&
    typeof currencyOrOptions ===
      "object" &&
    !Array.isArray(
      currencyOrOptions
    )
  ) {
    const currency =
      toSafeString(
        currencyOrOptions.currency,
        DEFAULT_CURRENCY
      ).toUpperCase();

    const locale =
      toSafeString(
        currencyOrOptions.locale,
        DEFAULT_LOCALE
      );

    return {
      ...currencyOrOptions,
      currency,
      locale,
    };
  }

  return {
    currency: toSafeString(
      currencyOrOptions,
      DEFAULT_CURRENCY
    ).toUpperCase(),

    locale: DEFAULT_LOCALE,
  };
};

/* ============================================================
   NUMBER FORMATTERS
============================================================ */

export const formatNumber = (
  value,
  {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = {}
) => {
  const number =
    toFiniteNumber(value);

  return new Intl.NumberFormat(
    locale,
    {
      minimumFractionDigits,
      maximumFractionDigits,
    }
  ).format(number);
};

/**
 * Format a numeric amount without a currency symbol.
 */
export const formatAmount = (
  value,
  {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  } = {}
) => {
  const safeCurrency =
    toSafeString(
      currency,
      DEFAULT_CURRENCY
    ).toUpperCase();

  const decimals =
    CURRENCY_DECIMALS[
      safeCurrency
    ] ?? 2;

  return new Intl.NumberFormat(
    locale,
    {
      minimumFractionDigits:
        minimumFractionDigits ??
        decimals,

      maximumFractionDigits:
        maximumFractionDigits ??
        decimals,
    }
  ).format(
    toFiniteNumber(value)
  );
};

/* ============================================================
   CURRENCY
============================================================ */

/**
 * Canonical SmartSave currency formatter.
 *
 * Supported:
 *
 * formatCurrency(5000)
 *
 * formatCurrency(5000, "NGN")
 *
 * formatCurrency(5000, {
 *   currency: "NGN",
 *   locale: "en-NG"
 * })
 *
 * formatCurrency(5000, {
 *   currency: "NGN",
 *   compact: true
 * })
 */
export const formatCurrency = (
  amount,
  options = {}
) => {
  const numericAmount =
    toFiniteNumber(amount);

  const normalizedOptions =
    normalizeCurrencyOptions(
      options
    );

  const {
    currency,
    locale,
    compact = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = normalizedOptions;

  const decimals =
    CURRENCY_DECIMALS[
      currency
    ] ?? 2;

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,

      notation: compact
        ? "compact"
        : "standard",

      minimumFractionDigits:
        minimumFractionDigits ??
        (compact ? 0 : decimals),

      maximumFractionDigits:
        maximumFractionDigits ??
        (compact ? 1 : decimals),
    }
  ).format(
    numericAmount
  );
};

/**
 * Explicit alias for consumers that prefer
 * SmartSave-specific naming.
 */
export const formatSavingsCurrency = (
  value,
  options = {}
) =>
  formatCurrency(
    value,
    options
  );

/**
 * Compact currency.
 */
export const formatCompactCurrency = (
  value,
  options = {}
) =>
  formatCurrency(
    value,
    {
      ...options,
      compact: true,
    }
  );

/**
 * Optional currency formatter.
 */
export const formatOptionalCurrency = (
  value,
  options = {},
  fallback = "—"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return formatCurrency(
    value,
    options
  );
};

/* ============================================================
   PERCENTAGES
============================================================ */

/**
 * Format percentage points.
 *
 * 75 -> 75%
 */
export const formatPercentage = (
  value,
  {
    decimals = 0,
    includeSign = false,
  } = {}
) => {
  const number =
    toFiniteNumber(value);

  const formatted =
    number.toFixed(decimals);

  if (
    includeSign &&
    number > 0
  ) {
    return `+${formatted}%`;
  }

  return `${formatted}%`;
};

/**
 * Convert decimal ratio to percentage.
 *
 * 0.75 -> 75%
 */
export const formatRatioAsPercentage = (
  value,
  options = {}
) =>
  formatPercentage(
    toFiniteNumber(value) *
      100,
    options
  );

/**
 * Format percentage change.
 */
export const formatPercentageChange = (
  value,
  {
    decimals = 1,
  } = {}
) => {
  const number =
    toFiniteNumber(value);

  const sign =
    number > 0 ? "+" : "";

  return `${sign}${number.toFixed(
    decimals
  )}%`;
};

/* ============================================================
   DATE FORMATTERS
============================================================ */

/**
 * Primary SmartSave date formatter.
 */
export const formatSavingsDate = (
  value,
  {
    locale = DEFAULT_LOCALE,
    options = DEFAULT_DATE_OPTIONS,
  } = {}
) => {
  const date =
    resolveDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    options
  ).format(date);
};

/**
 * Generic compatibility API.
 *
 * Existing SmartSave components use:
 *
 * formatDate(value)
 */
export const formatDate = (
  value,
  options = {}
) =>
  formatSavingsDate(
    value,
    options
  );

/**
 * Explicit compatibility alias.
 */
export const formatSavingsDateValue =
  formatSavingsDate;

/**
 * Format date and time.
 */
export const formatDateTime = (
  value,
  {
    locale = DEFAULT_LOCALE,
    options =
      DEFAULT_DATETIME_OPTIONS,
  } = {}
) => {
  const date =
    resolveDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    options
  ).format(date);
};

/**
 * ISO YYYY-MM-DD.
 */
export const formatISODate = (
  value
) => {
  const date =
    resolveDate(value);

  if (!date) {
    return "";
  }

  return date
    .toISOString()
    .split("T")[0];
};

/**
 * Month/year display.
 */
export const formatMonthYear = (
  value,
  {
    locale = DEFAULT_LOCALE,
  } = {}
) => {
  const date =
    resolveDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      month: "long",
      year: "numeric",
    }
  ).format(date);
};

/* ============================================================
   RELATIVE TIME
============================================================ */

export const formatRelativeTime = (
  value,
  {
    locale = DEFAULT_LOCALE,
    now = new Date(),
  } = {}
) => {
  const date =
    resolveDate(value);

  const current =
    resolveDate(now);

  if (!date) {
    return "—";
  }

  if (!current) {
    return formatDateTime(
      date
    );
  }

  const difference =
    date.getTime() -
    current.getTime();

  const seconds =
    Math.round(
      difference / 1000
    );

  const minutes =
    Math.round(
      seconds / 60
    );

  const hours =
    Math.round(
      minutes / 60
    );

  const days =
    Math.round(
      hours / 24
    );

  const formatter =
    new Intl.RelativeTimeFormat(
      locale,
      {
        numeric: "auto",
      }
    );

  if (
    Math.abs(seconds) < 60
  ) {
    return formatter.format(
      seconds,
      "second"
    );
  }

  if (
    Math.abs(minutes) < 60
  ) {
    return formatter.format(
      minutes,
      "minute"
    );
  }

  if (
    Math.abs(hours) < 24
  ) {
    return formatter.format(
      hours,
      "hour"
    );
  }

  if (
    Math.abs(days) < 30
  ) {
    return formatter.format(
      days,
      "day"
    );
  }

  return formatSavingsDate(
    date
  );
};

/* ============================================================
   DURATION
============================================================ */

export const formatDays = (
  days
) => {
  const value =
    Math.max(
      0,
      Math.round(
        toFiniteNumber(days)
      )
    );

  return `${value} ${
    value === 1
      ? "day"
      : "days"
  }`;
};

export const formatDuration = (
  days
) => {
  const totalDays =
    Math.max(
      0,
      Math.round(
        toFiniteNumber(days)
      )
    );

  if (totalDays < 1) {
    return "Less than a day";
  }

  if (totalDays < 7) {
    return formatDays(
      totalDays
    );
  }

  if (totalDays < 30) {
    const weeks =
      Math.floor(
        totalDays / 7
      );

    const remainingDays =
      totalDays % 7;

    if (!remainingDays) {
      return `${weeks} ${
        weeks === 1
          ? "week"
          : "weeks"
      }`;
    }

    return `${weeks} ${
      weeks === 1
        ? "week"
        : "weeks"
    } ${remainingDays} ${
      remainingDays === 1
        ? "day"
        : "days"
    }`;
  }

  const months =
    Math.floor(
      totalDays / 30
    );

  const remainingDays =
    totalDays % 30;

  if (!remainingDays) {
    return `${months} ${
      months === 1
        ? "month"
        : "months"
    }`;
  }

  return `${months} ${
    months === 1
      ? "month"
      : "months"
  } ${remainingDays} ${
    remainingDays === 1
      ? "day"
      : "days"
  }`;
};

/* ============================================================
   STATUS
============================================================ */

export const normalizeStatus = (
  status
) => {
  const value =
    normalizeKey(status);

  return value || "unknown";
};

export const formatStatus = (
  status,
  fallback = "Unknown"
) => {
  const key =
    normalizeStatus(status);

  return (
    STATUS_LABELS[key] ??
    fallback
  );
};

export const isActiveStatus = (
  status
) =>
  normalizeStatus(status) ===
  "active";

export const isTerminalStatus = (
  status
) =>
  [
    "completed",
    "cancelled",
    "canceled",
    "failed",
    "expired",
    "closed",
    "archived",
  ].includes(
    normalizeStatus(status)
  );

/* ============================================================
   FREQUENCY
============================================================ */

export const formatFrequency = (
  frequency,
  fallback = "Custom"
) => {
  const key =
    normalizeKey(frequency);

  return (
    FREQUENCY_LABELS[key] ??
    fallback
  );
};

/* ============================================================
   STRATEGY
============================================================ */

export const normalizeSavingsStrategy = (
  strategy
) => {
  if (
    strategy === null ||
    strategy === undefined
  ) {
    return null;
  }

  if (
    typeof strategy ===
    "string"
  ) {
    const key =
      normalizeKey(
        strategy
      );

    return (
      STRATEGY_LABELS[key]
        ? key
        : key || null
    );
  }

  if (
    typeof strategy !==
    "object"
  ) {
    return null;
  }

  const rawValue =
    readValue(
      strategy,
      [
        "value",
        "key",
        "code",
        "type",
        "strategy",
        "name",
        "slug",
      ]
    );

  const key =
    normalizeKey(
      rawValue
    );

  const labelValue =
    readValue(
      strategy,
      [
        "label",
        "title",
        "name",
      ]
    );

  const label =
    toSafeString(
      labelValue
    ) ||
    STRATEGY_LABELS[key] ||
    formatLabel(
      rawValue
    );

  const description =
    toSafeString(
      readValue(
        strategy,
        [
          "description",
          "details",
          "summary",
        ]
      )
    ) ||
    STRATEGY_DESCRIPTIONS[
      key
    ] ||
    "";

  return {
    ...strategy,

    value:
      key || null,

    key:
      key || null,

    code:
      key || null,

    label:
      label || "Custom",

    name:
      label || "Custom",

    description,
  };
};

export const normalizeSavingsStrategies = (
  strategies
) => {
  if (
    !Array.isArray(
      strategies
    )
  ) {
    return [];
  }

  return strategies
    .map(
      normalizeSavingsStrategy
    )
    .filter(Boolean);
};

export const formatStrategy = (
  strategy,
  fallback = "Custom"
) => {
  const normalized =
    normalizeSavingsStrategy(
      strategy
    );

  if (
    normalized &&
    typeof normalized ===
      "object"
  ) {
    return (
      normalized.label ||
      fallback
    );
  }

  const key =
    normalizeKey(
      normalized ||
        strategy
    );

  return (
    STRATEGY_LABELS[key] ??
    fallback
  );
};

export const getSavingsStrategyMeta = (
  strategy
) => {
  const normalized =
    normalizeSavingsStrategy(
      strategy
    );

  const key =
    typeof normalized ===
    "object"
      ? normalized.value
      : normalized;

  const label =
    typeof normalized ===
    "object"
      ? normalized.label
      : STRATEGY_LABELS[
          key
        ] ?? "Custom";

  return {
    key:
      key || null,

    value:
      key || null,

    label,

    description:
      STRATEGY_DESCRIPTIONS[
        key
      ] || "",
  };
};




/* ============================================================
   CHALLENGES
============================================================ */

export const formatChallengeType = (
  type,
  fallback = "Custom Challenge"
) => {
  const key =
    normalizeKey(type);

  return (
    CHALLENGE_TYPE_LABELS[
      key
    ] ?? fallback
  );
};

export const formatDifficulty = (
  difficulty,
  fallback = "Custom"
) => {
  const key =
    normalizeKey(
      difficulty
    );

  return (
    DIFFICULTY_LABELS[key] ??
    fallback
  );
};

/* ============================================================
   SAVINGS PROGRESS
============================================================ */

/**
 * Return progress as percentage points.
 *
 * Example:
 *
 * current = 25000
 * target = 100000
 * result = 25
 */
export const getSavingsProgressPercentage = (
  current,
  target
) => {
  const currentValue =
    Math.max(
      0,
      toFiniteNumber(
        current
      )
    );

  const targetValue =
    toFiniteNumber(
      target
    );

  if (
    targetValue <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (currentValue /
        targetValue) *
        100
    )
  );
};

/**
 * Compatibility helper.
 *
 * Supports:
 *
 * calculateSavingsProgress(
 *   current,
 *   target
 * )
 *
 * calculateSavingsProgress({
 *   current,
 *   target
 * })
 *
 * calculateSavingsProgress({
 *   currentAmount,
 *   targetAmount
 * })
 */
export const calculateSavingsProgress = (
  currentOrOptions = 0,
  target = 0
) => {
  let currentValue =
    currentOrOptions;

  let targetValue =
    target;

  if (
    currentOrOptions &&
    typeof currentOrOptions ===
      "object"
  ) {
    currentValue =
      currentOrOptions.current ??
      currentOrOptions.currentAmount ??
      currentOrOptions.savedAmount ??
      currentOrOptions.amountSaved ??
      currentOrOptions.totalSaved ??
      0;

    targetValue =
      currentOrOptions.target ??
      currentOrOptions.targetAmount ??
      currentOrOptions.goalAmount ??
      currentOrOptions.totalTarget ??
      0;
  }

  return getSavingsProgressPercentage(
    currentValue,
    targetValue
  );
};

export const formatSavingsProgress = (
  current,
  target,
  {
    decimals = 0,
  } = {}
) =>
  formatPercentage(
    getSavingsProgressPercentage(
      current,
      target
    ),
    {
      decimals,
    }
  );

export const formatRemainingAmount = (
  target,
  current,
  options = {}
) => {
  const targetValue =
    toFiniteNumber(
      target
    );

  const currentValue =
    toFiniteNumber(
      current
    );

  const remaining =
    Math.max(
      0,
      targetValue -
        currentValue
    );

  return formatCurrency(
    remaining,
    options
  );
};

/* ============================================================
   SAVINGS RATE
============================================================ */

export const formatSavingsRate = (
  rate,
  {
    decimals = 1,
  } = {}
) => {
  const value =
    toFiniteNumber(rate);

  const percentage =
    Math.abs(value) <= 1
      ? value * 100
      : value;

  return formatPercentage(
    percentage,
    {
      decimals,
    }
  );
};

/* ============================================================
   SAFE TEXT
============================================================ */

export const formatText = (
  value,
  fallback = "—"
) => {
  const text =
    toSafeString(value);

  return (
    text || fallback
  );
};

export const capitalize = (
  value
) => {
  const text =
    toSafeString(value);

  if (!text) {
    return "";
  }

  return (
    text
      .charAt(0)
      .toUpperCase() +
    text.slice(1)
  );
};

export const formatLabel = (
  value
) => {
  const text =
    toSafeString(value);

  if (!text) {
    return "";
  }

  return text
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .split(" ")
    .map(capitalize)
    .join(" ");
};

/* ============================================================
   ACCOUNT HELPERS
============================================================ */

export const formatAccountType = (
  accountType,
  fallback = "Savings Account"
) => {
  const value =
    formatLabel(
      accountType
    );

  return (
    value || fallback
  );
};

export const formatAccountBalance = (
  balance,
  options = {}
) =>
  formatCurrency(
    balance,
    options
  );

/* ============================================================
   PLAN / GOAL METRICS
============================================================ */

export const formatContributionAmount = (
  amount,
  options = {}
) =>
  formatCurrency(
    amount,
    options
  );

export const formatTargetAmount = (
  amount,
  options = {}
) =>
  formatCurrency(
    amount,
    options
  );

export const formatExpectedContribution = (
  amount,
  frequency,
  options = {}
) => {
  const amountText =
    formatCurrency(
      amount,
      options
    );

  const frequencyText =
    formatFrequency(
      frequency
    );

  return `${amountText} ${frequencyText.toLowerCase()}`;
};

/* ============================================================
   OBJECT / ENTITY HELPERS
============================================================ */

export const getSavingsEntityId = (
  entity
) =>
  resolveId(
    readValue(
      entity,
      [
        "_id",
        "id",
        "accountId",
        "goalId",
        "planId",
        "scheduleId",
        "challengeId",
        "executionId",
        "autoSaveId",
      ]
    )
  );

export const formatSavingsTitle = (
  entity,
  fallback = "Savings"
) => {
  const value =
    readValue(
      entity,
      [
        "title",
        "name",
        "goalName",
        "planName",
        "challengeName",
        "label",
      ]
    );

  return formatText(
    value,
    fallback
  );
};

/* ============================================================
   CONFIGURATION
============================================================ */

export const SAVINGS_FORMATTER_CONFIG =
  Object.freeze({
    DEFAULT_CURRENCY,
    DEFAULT_LOCALE,
    CURRENCY_DECIMALS,
  });

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const savingsFormatters =
  Object.freeze({
    formatNumber,
    formatAmount,

    formatCurrency,
    formatSavingsCurrency,
    formatCompactCurrency,
    formatOptionalCurrency,

    formatPercentage,
    formatRatioAsPercentage,
    formatPercentageChange,

    formatSavingsDate,
    formatDate,
    formatSavingsDateValue,
    formatDateTime,
    formatISODate,
    formatMonthYear,
    formatRelativeTime,

    formatDays,
    formatDuration,

    formatStatus,
    normalizeStatus,
    isActiveStatus,
    isTerminalStatus,

    formatFrequency,

    formatStrategy,
    normalizeSavingsStrategy,
    normalizeSavingsStrategies,
    getSavingsStrategyMeta,

    formatChallengeType,
    formatDifficulty,

    formatSavingsProgress,
    calculateSavingsProgress,
    getSavingsProgressPercentage,
    formatRemainingAmount,
    formatSavingsRate,

    formatText,
    capitalize,
    formatLabel,

    formatAccountType,
    formatAccountBalance,

    formatContributionAmount,
    formatTargetAmount,
    formatExpectedContribution,

    getSavingsEntityId,
    formatSavingsTitle,
  });

export default savingsFormatters;
