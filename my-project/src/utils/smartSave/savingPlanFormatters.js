/**
 * savingPlanFormatters.js
 *
 * Pure formatting and normalization utilities for SmartSave saving plans.
 *
 * Responsibilities:
 * - Normalize saving-plan values received from the API.
 * - Format monetary values safely.
 * - Format target dates consistently.
 * - Format plan names and descriptions.
 * - Format plan status and progress.
 * - Extract common plan identifiers.
 *
 * This module:
 * - Has no React dependencies.
 * - Has no state.
 * - Makes no API calls.
 * - Does not mutate input objects.
 * - Does not perform financial business calculations.
 *
 * Backend remains the source of truth for financial calculations.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_SAVING_PLAN_CURRENCY = "NGN";
const DEFAULT_LOCALE = "en-NG";
const DEFAULT_DATE_LOCALE = "en-NG";

const MAX_PLAN_NAME_LENGTH = 100;
const MAX_PLAN_DESCRIPTION_LENGTH = 500;

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
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const normalizeWhitespace = (value) =>
  toStringValue(value)
    .replace(/\s+/g, " ")
    .trim();

/* -------------------------------------------------------------------------- */
/* Currency                                                                   */
/* -------------------------------------------------------------------------- */

const normalizeCurrency = (
  currency,
  fallback = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  const normalized = toStringValue(currency)
    .trim()
    .toUpperCase();

  if (normalized) {
    return normalized;
  }

  const normalizedFallback = toStringValue(fallback)
    .trim()
    .toUpperCase();

  return (
    normalizedFallback ||
    DEFAULT_SAVING_PLAN_CURRENCY
  );
};

const getCurrencySymbol = (
  currency,
  locale = DEFAULT_LOCALE
) => {
  const normalizedCurrency =
    normalizeCurrency(currency);

  try {
    const parts = new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency: normalizedCurrency,
        currencyDisplay: "narrowSymbol",
      }
    ).formatToParts(0);

    return (
      parts.find(
        (part) => part.type === "currency"
      )?.value ||
      normalizedCurrency
    );
  } catch {
    return normalizedCurrency;
  }
};

/* -------------------------------------------------------------------------- */
/* Amounts                                                                    */
/* -------------------------------------------------------------------------- */

const normalizeAmount = (value) => {
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

  const normalized = toStringValue(value)
    .replace(/,/g, "")
    .trim();

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

const formatSavingPlanAmount = (
  amount,
  currency = DEFAULT_SAVING_PLAN_CURRENCY,
  options = {}
) => {
  const numericAmount =
    normalizeAmount(amount);

  if (numericAmount === null) {
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
        currency: normalizedCurrency,
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

const formatSavingPlanNumber = (
  amount,
  options = {}
) => {
  const numericAmount =
    normalizeAmount(amount);

  if (numericAmount === null) {
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

const normalizePercentage = (value) => {
  const numericValue =
    normalizeAmount(value);

  if (numericValue === null) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, numericValue)
  );
};

const formatPercentage = (
  value,
  options = {}
) => {
  const percentage =
    normalizePercentage(value);

  if (percentage === null) {
    return "—";
  }

  const {
    maximumFractionDigits = 1,
    minimumFractionDigits = 0,
    locale = DEFAULT_LOCALE,
  } = options;

  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: "percent",
        minimumFractionDigits,
        maximumFractionDigits,
      }
    ).format(percentage / 100);
  } catch {
    return `${percentage}%`;
  }
};

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const toDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();

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

  const match = stringValue.match(
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

  return formatDateForInput(parsedDate);
};

const formatSavingPlanDate = (
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
    return formatDateForInput(date);
  }
};

const formatSavingPlanDateShort = (
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
    return formatDateForInput(date);
  }
};

/* -------------------------------------------------------------------------- */
/* Relative dates                                                             */
/* -------------------------------------------------------------------------- */

const isSavingPlanDatePast = (
  value,
  referenceDate = new Date()
) => {
  const targetDate = toDate(value);
  const reference = toDate(referenceDate);

  if (!targetDate || !reference) {
    return false;
  }

  return (
    targetDate.getTime() <
    reference.getTime()
  );
};

const getDaysUntilSavingPlanDate = (
  value,
  referenceDate = new Date()
) => {
  const targetDate = toDate(value);
  const reference = toDate(referenceDate);

  if (!targetDate || !reference) {
    return null;
  }

  const targetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  const referenceDay = new Date(
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

const formatSavingPlanRemainingDays = (
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
    const elapsed = Math.abs(days);

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
/* Identity                                                                   */
/* -------------------------------------------------------------------------- */

const getSavingPlanId = (plan) => {
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

const normalizeSavingPlanId = (value) => {
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
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

const formatSavingPlanName = (
  value,
  fallback = "Untitled saving plan"
) => {
  const normalized =
    normalizeWhitespace(value);

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(
    0,
    MAX_PLAN_NAME_LENGTH
  );
};

const formatSavingPlanDescription = (
  value,
  fallback = "No description provided."
) => {
  const normalized =
    normalizeWhitespace(value);

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(
    0,
    MAX_PLAN_DESCRIPTION_LENGTH
  );
};

const truncateSavingPlanDescription = (
  value,
  maxLength = 120
) => {
  const normalized =
    normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  const safeMaxLength = Math.max(
    1,
    Number(maxLength) || 120
  );

  if (
    normalized.length <=
    safeMaxLength
  ) {
    return normalized;
  }

  return `${normalized
    .slice(0, safeMaxLength - 1)
    .trimEnd()}…`;
};

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS = Object.freeze({
  active: "Active",
  in_progress: "In Progress",
  "in-progress": "In Progress",
  ongoing: "Ongoing",
  paused: "Paused",
  completed: "Completed",
  complete: "Completed",
  achieved: "Achieved",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  draft: "Draft",
  pending: "Pending",
  failed: "Failed",
  expired: "Expired",
  archived: "Archived",
});

const normalizeSavingPlanStatus = (
  status
) => {
  const normalized =
    normalizeWhitespace(status)
      .toLowerCase()
      .replace(/\s+/g, "_");

  return normalized || null;
};

const formatSavingPlanStatus = (
  status
) => {
  const normalized =
    normalizeSavingPlanStatus(status);

  if (!normalized) {
    return "Unknown";
  }

  return (
    STATUS_LABELS[normalized] ||
    normalized
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  );
};

const getSavingPlanStatusTone = (
  status
) => {
  const normalized =
    normalizeSavingPlanStatus(status);

  switch (normalized) {
    case "active":
    case "completed":
    case "complete":
    case "achieved":
      return "success";

    case "paused":
      return "warning";

    case "pending":
    case "draft":
    case "in_progress":
    case "ongoing":
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
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

const getSavingPlanProgress = (plan) => {
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
      normalizePercentage(value);

    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
};

const formatSavingPlanProgress = (plan) => {
  const progress =
    getSavingPlanProgress(plan);

  return formatPercentage(progress);
};

/* -------------------------------------------------------------------------- */
/* Plan normalization                                                         */
/* -------------------------------------------------------------------------- */

const normalizeSavingPlan = (
  plan,
  fallbackCurrency = DEFAULT_SAVING_PLAN_CURRENCY
) => {
  if (!isObject(plan)) {
    return null;
  }

  const id = getSavingPlanId(plan);

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
    ).slice(
      0,
      MAX_PLAN_DESCRIPTION_LENGTH
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
      normalizeSavingPlanId(id),

    name,

    description,

    targetAmount,

    currency,

    targetDate,

    status,

    progress:
      getSavingPlanProgress(plan),
  };
};

/* -------------------------------------------------------------------------- */
/* Display model                                                              */
/* -------------------------------------------------------------------------- */

const formatSavingPlanForDisplay = (
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
          locale: dateLocale,
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
/* Form normalization                                                         */
/* -------------------------------------------------------------------------- */

const savingPlanToFormValues = (
  plan,
  fallbackCurrency =
    DEFAULT_SAVING_PLAN_CURRENCY
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
/* Payload                                                                    */
/* -------------------------------------------------------------------------- */

const formatSavingPlanPayload = (
  values,
  fallbackCurrency =
    DEFAULT_SAVING_PLAN_CURRENCY
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
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

const getSavingPlanLabel = (plan) => {
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

  const id = getSavingPlanId(plan);

  if (id) {
    return `Saving plan ${String(id).slice(
      -6
    )}`;
  }

  return "Saving plan";
};

/* -------------------------------------------------------------------------- */
/* Named exports                                                              */
/* -------------------------------------------------------------------------- */

export {
  DEFAULT_SAVING_PLAN_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_DATE_LOCALE,
  MAX_PLAN_NAME_LENGTH,
  MAX_PLAN_DESCRIPTION_LENGTH,

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

/* -------------------------------------------------------------------------- */
/* Default export                                                             */
/* -------------------------------------------------------------------------- */

const savingPlanFormatters = Object.freeze({
  DEFAULT_SAVING_PLAN_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_DATE_LOCALE,
  MAX_PLAN_NAME_LENGTH,
  MAX_PLAN_DESCRIPTION_LENGTH,

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
});

export default savingPlanFormatters;