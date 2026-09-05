
/**
 * savingPlanFormatters.js
 *
 * Pure formatting and normalization utilities for SmartSave saving plans.
 *
 * Responsibilities:
 * - Normalize saving-plan values received from the API.
 * - Format monetary values for display.
 * - Format target dates consistently.
 * - Format plan names and descriptions.
 * - Format plan status and progress.
 * - Extract common plan identifiers.
 * - Convert saving-plan data between API, form, and display shapes.
 *
 * This module intentionally contains:
 * - No React dependencies.
 * - No state.
 * - No API calls.
 * - No side effects.
 * - No financial calculations.
 * - No validation rules.
 *
 * The backend remains the source of truth for financial calculations
 * and domain-level business rules.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SAVING_PLAN_CURRENCY =
  "NGN";

export const DEFAULT_LOCALE =
  "en-NG";

export const DEFAULT_DATE_LOCALE =
  "en-NG";

/* -------------------------------------------------------------------------- */
/* Generic helpers                                                            */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isFiniteNumber = (value) =>
  typeof value === "number" &&
  Number.isFinite(value);

const toStringValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
};

const normalizeWhitespace = (
  value
) =>
  toStringValue(value)
    .replace(/\s+/g, " ")
    .trim();

/* -------------------------------------------------------------------------- */
/* Currency                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a currency code.
 *
 * Examples:
 * normalizeCurrency("ngn") → "NGN"
 * normalizeCurrency(" NGN ") → "NGN"
 * normalizeCurrency(null) → "NGN"
 */
export const normalizeCurrency = (
  currency,
  fallback = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  const normalized =
    toStringValue(currency)
      .trim()
      .toUpperCase();

  if (!normalized) {
    const normalizedFallback =
      toStringValue(fallback)
        .trim()
        .toUpperCase();

    return (
      normalizedFallback ||
      DEFAULT_SAVING_PLAN_CURRENCY
    );
  }

  return normalized;
};

/**
 * Safely obtain a currency symbol.
 */
export const getCurrencySymbol = (
  currency,
  locale = DEFAULT_LOCALE
) => {
  const normalizedCurrency =
    normalizeCurrency(currency);

  try {
    const parts =
      new Intl.NumberFormat(
        locale,
        {
          style: "currency",
          currency:
            normalizedCurrency,
          currencyDisplay:
            "narrowSymbol",
        }
      ).formatToParts(0);

    return (
      parts.find(
        (part) =>
          part.type === "currency"
      )?.value ||
      normalizedCurrency
    );
  } catch {
    return normalizedCurrency;
  }
};

/* -------------------------------------------------------------------------- */
/* Amount normalization                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Convert an amount into a safe numeric value.
 *
 * Invalid values return null instead of silently becoming zero.
 *
 * Examples:
 * normalizeAmount("100,000") → 100000
 * normalizeAmount("100000") → 100000
 * normalizeAmount(100000) → 100000
 * normalizeAmount("") → null
 * normalizeAmount("abc") → null
 */
export const normalizeAmount = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (isFiniteNumber(value)) {
    return value;
  }

  const normalized =
    toStringValue(value)
      .replace(/,/g, "")
      .trim();

  if (!normalized) {
    return null;
  }

  const numericValue =
    Number(normalized);

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : null;
};

/**
 * Format a monetary amount.
 *
 * Invalid or missing amounts return an em dash instead of
 * displaying misleading financial information.
 */
export const formatSavingPlanAmount = (
  amount,
  currency = DEFAULT_SAVING_PLAN_CURRENCY,
  options = {}
) => {
  const numericAmount =
    normalizeAmount(amount);

  if (
    numericAmount === null
  ) {
    return "—";
  }

  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    currencyDisplay = "symbol",
    useGrouping = true,
  } = options;

  const normalizedCurrency =
    normalizeCurrency(currency);

  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency:
          normalizedCurrency,
        currencyDisplay,
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      }
    ).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(
      maximumFractionDigits
    )}`;
  }
};

/**
 * Format an amount without a currency symbol.
 */
export const formatSavingPlanNumber = (
  amount,
  options = {}
) => {
  const numericAmount =
    normalizeAmount(amount);

  if (
    numericAmount === null
  ) {
    return "—";
  }

  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options;

  try {
    return new Intl.NumberFormat(
      locale,
      {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping,
      }
    ).format(numericAmount);
  } catch {
    return numericAmount.toFixed(
      maximumFractionDigits
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Percentage                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a percentage for presentation.
 *
 * This helper clamps the display value between 0 and 100.
 * It does not calculate financial progress.
 */
export const normalizePercentage = (
  value
) => {
  const numericValue =
    normalizeAmount(value);

  if (
    numericValue === null
  ) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, numericValue)
  );
};

/**
 * Format a percentage for display.
 */
export const formatPercentage = (
  value,
  options = {}
) => {
  const percentage =
    normalizePercentage(value);

  if (
    percentage === null
  ) {
    return "—";
  }

  const {
    locale = DEFAULT_LOCALE,
    maximumFractionDigits = 1,
    minimumFractionDigits = 0,
  } = options;

  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: "percent",
        minimumFractionDigits,
        maximumFractionDigits,
      }
    ).format(
      percentage / 100
    );
  } catch {
    return `${percentage}%`;
  }
};

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Safely convert a value to a Date.
 */
export const toDate = (
  value
) => {
  if (!value) {
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

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

/**
 * Convert an API date into a YYYY-MM-DD input value.
 *
 * Handles:
 * - ISO timestamps
 * - YYYY-MM-DD
 * - Date instances
 */
export const formatDateForInput = (
  value
) => {
  if (!value) {
    return "";
  }

  if (
    value instanceof Date
  ) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }

    const year =
      value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const stringValue =
    toStringValue(value).trim();

  if (!stringValue) {
    return "";
  }

  const match =
    stringValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsedDate =
    new Date(stringValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  return formatDateForInput(
    parsedDate
  );
};

/**
 * Format a saving-plan target date.
 */
export const formatSavingPlanDate = (
  value,
  options = {}
) => {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  const {
    locale = DEFAULT_DATE_LOCALE,
    dateStyle = "medium",
  } = options;

  try {
    return new Intl.DateTimeFormat(
      locale,
      {
        dateStyle,
      }
    ).format(date);
  } catch {
    return formatDateForInput(
      date
    );
  }
};

/**
 * Format a target date for compact UI elements.
 */
export const formatSavingPlanDateShort = (
  value,
  locale = DEFAULT_DATE_LOCALE
) => {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      locale,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return formatDateForInput(
      date
    );
  }
};

/* -------------------------------------------------------------------------- */
/* Relative date information                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Determine whether a target date has passed.
 *
 * This is a presentation helper only.
 * It does not determine whether a plan is expired according to
 * backend business rules.
 */
export const isSavingPlanDatePast = (
  value,
  referenceDate = new Date()
) => {
  const targetDate =
    toDate(value);

  const reference =
    toDate(referenceDate);

  if (
    !targetDate ||
    !reference
  ) {
    return false;
  }

  return (
    targetDate.getTime() <
    reference.getTime()
  );
};

/**
 * Calculate whole calendar days between two dates.
 *
 * This helper is intended for presentation only.
 */
export const getDaysUntilSavingPlanDate = (
  value,
  referenceDate = new Date()
) => {
  const targetDate =
    toDate(value);

  const reference =
    toDate(referenceDate);

  if (
    !targetDate ||
    !reference
  ) {
    return null;
  }

  const targetDay =
    new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

  const referenceDay =
    new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate()
    );

  const difference =
    targetDay.getTime() -
    referenceDay.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};

/**
 * Format remaining days for presentation.
 */
export const formatSavingPlanRemainingDays = (
  value,
  referenceDate = new Date()
) => {
  const days =
    getDaysUntilSavingPlanDate(
      value,
      referenceDate
    );

  if (days === null) {
    return "—";
  }

  if (days < 0) {
    const elapsed =
      Math.abs(days);

    return elapsed === 1
      ? "1 day overdue"
      : `${elapsed} days overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "1 day remaining";
  }

  return `${days} days remaining`;
};

/* -------------------------------------------------------------------------- */
/* Plan identity                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Extract a saving-plan identifier from an API response.
 */
export const getSavingPlanId = (
  plan
) => {
  if (!isObject(plan)) {
    return null;
  }

  return (
    plan._id ??
    plan.id ??
    plan.planId ??
    null
  );
};

/**
 * Normalize a plan identifier.
 */
export const normalizeSavingPlanId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized =
    toStringValue(value).trim();

  return normalized || null;
};

/* -------------------------------------------------------------------------- */
/* Text formatting                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Format a saving-plan name.
 */
export const formatSavingPlanName = (
  value,
  fallback = "Untitled saving plan"
) => {
  const normalized =
    normalizeWhitespace(value);

  return (
    normalized ||
    fallback
  );
};

/**
 * Format a saving-plan description.
 */
export const formatSavingPlanDescription = (
  value,
  fallback = "No description provided."
) => {
  const normalized =
    normalizeWhitespace(value);

  return (
    normalized ||
    fallback
  );
};

/**
 * Create a shortened description for cards and lists.
 */
export const truncateSavingPlanDescription = (
  value,
  maxLength = 120
) => {
  const normalized =
    normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  if (
    normalized.length <=
    maxLength
  ) {
    return normalized;
  }

  return `${normalized
    .slice(
      0,
      Math.max(
        0,
        maxLength - 1
      )
    )
    .trimEnd()}…`;
};

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  draft: "Draft",
  pending: "Pending",
  failed: "Failed",
  expired: "Expired",
  archived: "Archived",
};

export const normalizeSavingPlanStatus = (
  status
) => {
  const normalized =
    normalizeWhitespace(
      status
    ).toLowerCase();

  return normalized || null;
};

export const formatSavingPlanStatus = (
  status
) => {
  const normalized =
    normalizeSavingPlanStatus(
      status
    );

  if (!normalized) {
    return "Unknown";
  }

  return (
    STATUS_LABELS[
      normalized
    ] ||
    normalized
      .replace(
        /[_-]+/g,
        " "
      )
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      )
  );
};

/**
 * Return a predictable semantic status category
 * for presentation components.
 */
export const getSavingPlanStatusTone = (
  status
) => {
  const normalized =
    normalizeSavingPlanStatus(
      status
    );

  switch (normalized) {
    case "active":
    case "completed":
      return "success";

    case "paused":
      return "warning";

    case "pending":
    case "draft":
      return "info";

    case "failed":
    case "cancelled":
    case "canceled":
    case "expired":
      return "danger";

    default:
      return "neutral";
  }
};

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Extract backend-provided progress.
 *
 * The backend remains authoritative for the progress value.
 */
export const getSavingPlanProgress = (
  plan
) => {
  if (!isObject(plan)) {
    return null;
  }

  const candidates = [
    plan.progress,
    plan.progressPercentage,
    plan.percentage,
    plan.completionPercentage,
  ];

  for (const value of candidates) {
    const normalized =
      normalizePercentage(
        value
      );

    if (
      normalized !== null
    ) {
      return normalized;
    }
  }

  return null;
};

/**
 * Format backend-provided progress.
 */
export const formatSavingPlanProgress = (
  plan
) => {
  const progress =
    getSavingPlanProgress(
      plan
    );

  return formatPercentage(
    progress
  );
};

/* -------------------------------------------------------------------------- */
/* Plan normalization                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a raw saving plan for safe UI consumption.
 *
 * This function standardizes representation only.
 * It does not calculate financial values.
 */
export const normalizeSavingPlan = (
  plan,
  fallbackCurrency = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  if (!isObject(plan)) {
    return null;
  }

  const id =
    getSavingPlanId(plan);

  const currency =
    normalizeCurrency(
      plan.currency,
      fallbackCurrency
    );

  const targetAmount =
    normalizeAmount(
      plan.targetAmount ??
        plan.amount ??
        plan.target
    );

  const name =
    formatSavingPlanName(
      plan.name ??
        plan.title
    );

  const description =
    normalizeWhitespace(
      plan.description
    );

  const targetDate =
    formatDateForInput(
      plan.targetDate ??
        plan.deadline ??
        plan.endDate
    );

  const status =
    normalizeSavingPlanStatus(
      plan.status
    );

  return {
    ...plan,

    id,

    planId:
      normalizeSavingPlanId(
        id
      ),

    name,

    description,

    targetAmount,

    currency,

    targetDate,

    status,

    progress:
      getSavingPlanProgress(
        plan
      ),
  };
};

/* -------------------------------------------------------------------------- */
/* Display model                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Convert a raw saving plan into a UI-friendly display object.
 *
 * Useful for:
 * - Saving plan cards
 * - Tables
 * - Dashboard summaries
 * - Detail views
 */
export const formatSavingPlanForDisplay = (
  plan,
  options = {}
) => {
  const normalized =
    normalizeSavingPlan(
      plan,
      options.currency ||
        DEFAULT_SAVING_PLAN_CURRENCY
    );

  if (!normalized) {
    return null;
  }

  const {
    locale = DEFAULT_LOCALE,
    dateLocale = DEFAULT_DATE_LOCALE,
  } = options;

  return {
    ...normalized,

    displayName:
      formatSavingPlanName(
        normalized.name
      ),

    displayDescription:
      formatSavingPlanDescription(
        normalized.description
      ),

    displayTargetAmount:
      formatSavingPlanAmount(
        normalized.targetAmount,
        normalized.currency,
        {
          locale,
        }
      ),

    displayTargetDate:
      formatSavingPlanDate(
        normalized.targetDate,
        {
          locale:
            dateLocale,
        }
      ),

    displayTargetDateShort:
      formatSavingPlanDateShort(
        normalized.targetDate,
        dateLocale
      ),

    displayStatus:
      formatSavingPlanStatus(
        normalized.status
      ),

    displayProgress:
      formatSavingPlanProgress(
        normalized
      ),

    displayRemainingDays:
      formatSavingPlanRemainingDays(
        normalized.targetDate
      ),
  };
};

/* -------------------------------------------------------------------------- */
/* Form normalization                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Convert a saving plan into values suitable for a form.
 */
export const savingPlanToFormValues = (
  plan,
  fallbackCurrency = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  if (!isObject(plan)) {
    return {
      name: "",
      targetAmount: "",
      currency:
        normalizeCurrency(
          fallbackCurrency
        ),
      targetDate: "",
      description: "",
    };
  }

  return {
    name: toStringValue(
      plan.name ??
        plan.title
    ),

    targetAmount:
      plan.targetAmount ??
      plan.amount ??
      plan.target ??
      "",

    currency:
      normalizeCurrency(
        plan.currency,
        fallbackCurrency
      ),

    targetDate:
      formatDateForInput(
        plan.targetDate ??
          plan.deadline ??
          plan.endDate
      ),

    description:
      toStringValue(
        plan.description
      ),
  };
};

/* -------------------------------------------------------------------------- */
/* Payload formatting                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Normalize form values before handing them to the API layer.
 *
 * This function does not validate the payload.
 * Validation belongs to the form/domain validation layer.
 */
export const formatSavingPlanPayload = (
  values,
  fallbackCurrency = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  if (!isObject(values)) {
    return null;
  }

  return {
    name: normalizeWhitespace(
      values.name
    ),

    targetAmount:
      normalizeAmount(
        values.targetAmount
      ),

    currency:
      normalizeCurrency(
        values.currency,
        fallbackCurrency
      ),

    targetDate:
      formatDateForInput(
        values.targetDate
      ),

    description:
      normalizeWhitespace(
        values.description
      ),
  };
};

/* -------------------------------------------------------------------------- */
/* Safe labels                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Return a compact plan label suitable for:
 * - Navigation
 * - Select controls
 * - Activity lists
 * - Empty-state fallbacks
 */
export const getSavingPlanLabel = (
  plan
) => {
  if (!isObject(plan)) {
    return "Saving plan";
  }

  const name =
    formatSavingPlanName(
      plan.name ??
        plan.title,
      ""
    );

  if (name) {
    return name;
  }

  const id =
    getSavingPlanId(plan);

  if (id) {
    return `Saving plan ${String(
      id
    ).slice(-6)}`;
  }

  return "Saving plan";
};

/* -------------------------------------------------------------------------- */
/* Default export                                                              */
/* -------------------------------------------------------------------------- */

export default {
  normalizeCurrency,
  getCurrencySymbol,

  normalizeAmount,
  formatSavingPlanAmount,
  formatSavingPlanNumber,

  normalizePercentage,
  formatPercentage,

  toDate,
  formatDateForInput,
  formatSavingPlanDate,
  formatSavingPlanDateShort,

  isSavingPlanDatePast,
  getDaysUntilSavingPlanDate,
  formatSavingPlanRemainingDays,

  getSavingPlanId,
  normalizeSavingPlanId,

  formatSavingPlanName,
  formatSavingPlanDescription,
  truncateSavingPlanDescription,

  normalizeSavingPlanStatus,
  formatSavingPlanStatus,
  getSavingPlanStatusTone,

  getSavingPlanProgress,
  formatSavingPlanProgress,

  normalizeSavingPlan,
  formatSavingPlanForDisplay,

  savingPlanToFormValues,
  formatSavingPlanPayload,

  getSavingPlanLabel,
};
