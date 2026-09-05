/**
 * savingPlanHelpers.js
 *
 * Pure, reusable helper functions for SmartSave saving plans.
 *
 * Responsibilities:
 * - Saving-plan object inspection
 * - Safe value extraction
 * - ID resolution
 * - Field normalization
 * - Date comparisons
 * - Numeric comparisons
 * - Plan state checks
 * - Collection helpers
 *
 * This module must remain:
 * - Pure
 * - Side-effect free
 * - Framework independent
 * - API independent
 * - Safe to use from hooks, components, services, and formatters
 *
 * Financial calculations and business rules belong on the backend.
 */

const DEFAULT_CURRENCY = "NGN";

/* -------------------------------------------------------------------------- */
/* Object helpers                                                             */
/* -------------------------------------------------------------------------- */

export const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

export const isNonEmptyObject = (value) =>
  isObject(value) && Object.keys(value).length > 0;

export const isArray = (value) => Array.isArray(value);

export const isNonEmptyArray = (value) =>
  Array.isArray(value) && value.length > 0;

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                          */
/* -------------------------------------------------------------------------- */

export const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export const isPositiveNumber = (value) =>
  isFiniteNumber(value) && value > 0;

export const isNonNegativeNumber = (value) =>
  isFiniteNumber(value) && value >= 0;

export const toSafeString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
};

export const hasValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};

/* -------------------------------------------------------------------------- */
/* Currency helpers                                                           */
/* -------------------------------------------------------------------------- */

export const normalizeCurrency = (
  currency,
  fallback = DEFAULT_CURRENCY,
) => {
  const normalized = toSafeString(currency, fallback).toUpperCase();

  return normalized || fallback;
};

/* -------------------------------------------------------------------------- */
/* Saving-plan ID helpers                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Resolves a saving-plan identifier from common backend representations.
 *
 * Supported:
 * - plan.id
 * - plan._id
 * - plan.planId
 * - primitive ID values
 */
export const getSavingPlanId = (plan) => {
  if (!plan) {
    return null;
  }

  if (
    typeof plan === "string" ||
    typeof plan === "number"
  ) {
    return toSafeString(plan) || null;
  }

  if (!isObject(plan)) {
    return null;
  }

  const id =
    plan.id ??
    plan._id ??
    plan.planId ??
    null;

  return toSafeString(id) || null;
};

export const hasSavingPlanId = (plan) =>
  Boolean(getSavingPlanId(plan));

export const areSavingPlanIdsEqual = (first, second) => {
  const firstId = getSavingPlanId(first);
  const secondId = getSavingPlanId(second);

  if (!firstId || !secondId) {
    return false;
  }

  return firstId === secondId;
};

/* -------------------------------------------------------------------------- */
/* Field extraction helpers                                                   */
/* -------------------------------------------------------------------------- */

export const getSavingPlanName = (plan) => {
  if (!isObject(plan)) {
    return "";
  }

  return toSafeString(plan.name);
};

export const getSavingPlanDescription = (plan) => {
  if (!isObject(plan)) {
    return "";
  }

  return toSafeString(plan.description);
};

export const getSavingPlanCurrency = (
  plan,
  fallback = DEFAULT_CURRENCY,
) => {
  if (!isObject(plan)) {
    return normalizeCurrency(fallback);
  }

  return normalizeCurrency(
    plan.currency,
    fallback,
  );
};

export const getSavingPlanTargetAmount = (plan) => {
  if (!isObject(plan)) {
    return null;
  }

  const value =
    plan.targetAmount ??
    plan.amount ??
    plan.target ??
    null;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

export const getSavingPlanTargetDate = (plan) => {
  if (!isObject(plan)) {
    return null;
  }

  return (
    plan.targetDate ??
    plan.deadline ??
    plan.endDate ??
    null
  );
};

export const getSavingPlanStatus = (plan) => {
  if (!isObject(plan)) {
    return "";
  }

  return toSafeString(plan.status).toLowerCase();
};

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Converts a supported date value into a Date instance.
 *
 * Returns null for invalid dates.
 */
export const toValidDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getTime());
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

/**
 * Date-only values such as "2026-09-30" should be interpreted
 * as a calendar date rather than relying on UTC parsing.
 */
export const toLocalDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getTime());
  }

  const stringValue = toSafeString(value);

  if (!stringValue) {
    return null;
  }

  const dateOnlyMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(stringValue);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  return toValidDate(stringValue);
};

export const isValidSavingPlanDate = (value) =>
  Boolean(toValidDate(value));

export const isSavingPlanDatePast = (
  value,
  referenceDate = new Date(),
) => {
  const targetDate = toLocalDate(value);
  const reference = toLocalDate(referenceDate);

  if (!targetDate || !reference) {
    return false;
  }

  return targetDate.getTime() < reference.getTime();
};

export const isSavingPlanDateToday = (
  value,
  referenceDate = new Date(),
) => {
  const targetDate = toLocalDate(value);
  const reference = toLocalDate(referenceDate);

  if (!targetDate || !reference) {
    return false;
  }

  return (
    targetDate.getFullYear() === reference.getFullYear() &&
    targetDate.getMonth() === reference.getMonth() &&
    targetDate.getDate() === reference.getDate()
  );
};

export const isSavingPlanDateFuture = (
  value,
  referenceDate = new Date(),
) => {
  const targetDate = toLocalDate(value);
  const reference = toLocalDate(referenceDate);

  if (!targetDate || !reference) {
    return false;
  }

  return targetDate.getTime() > reference.getTime();
};

export const getDaysUntilSavingPlanDate = (
  value,
  referenceDate = new Date(),
) => {
  const targetDate = toLocalDate(value);
  const reference = toLocalDate(referenceDate);

  if (!targetDate || !reference) {
    return null;
  }

  const targetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  const referenceDay = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );

  const difference =
    targetDay.getTime() - referenceDay.getTime();

  return Math.round(
    difference / (1000 * 60 * 60 * 24),
  );
};

/* -------------------------------------------------------------------------- */
/* Plan state helpers                                                         */
/* -------------------------------------------------------------------------- */

const ACTIVE_STATUSES = new Set([
  "active",
  "in_progress",
  "in-progress",
  "ongoing",
]);

const COMPLETED_STATUSES = new Set([
  "completed",
  "complete",
  "achieved",
]);

const PAUSED_STATUSES = new Set([
  "paused",
  "pause",
]);

const CANCELLED_STATUSES = new Set([
  "cancelled",
  "canceled",
]);

const FAILED_STATUSES = new Set([
  "failed",
]);

export const isSavingPlanActive = (plan) =>
  ACTIVE_STATUSES.has(getSavingPlanStatus(plan));

export const isSavingPlanCompleted = (plan) =>
  COMPLETED_STATUSES.has(getSavingPlanStatus(plan));

export const isSavingPlanPaused = (plan) =>
  PAUSED_STATUSES.has(getSavingPlanStatus(plan));

export const isSavingPlanCancelled = (plan) =>
  CANCELLED_STATUSES.has(getSavingPlanStatus(plan));

export const isSavingPlanFailed = (plan) =>
  FAILED_STATUSES.has(getSavingPlanStatus(plan));

export const isSavingPlanClosed = (plan) =>
  isSavingPlanCompleted(plan) ||
  isSavingPlanCancelled(plan) ||
  isSavingPlanFailed(plan);

/* -------------------------------------------------------------------------- */
/* Plan eligibility helpers                                                   */
/* -------------------------------------------------------------------------- */

export const hasSavingPlanName = (plan) =>
  Boolean(getSavingPlanName(plan));

export const hasSavingPlanTargetAmount = (plan) =>
  isPositiveNumber(getSavingPlanTargetAmount(plan));

export const hasSavingPlanTargetDate = (plan) =>
  isValidSavingPlanDate(getSavingPlanTargetDate(plan));

export const isSavingPlanStructurallyValid = (plan) =>
  isObject(plan) &&
  hasSavingPlanName(plan) &&
  hasSavingPlanTargetAmount(plan) &&
  hasSavingPlanTargetDate(plan);

/* -------------------------------------------------------------------------- */
/* Plan comparison helpers                                                    */
/* -------------------------------------------------------------------------- */

export const compareSavingPlansByName = (
  first,
  second,
) => {
  const firstName = getSavingPlanName(first).toLowerCase();
  const secondName = getSavingPlanName(second).toLowerCase();

  return firstName.localeCompare(secondName);
};

export const compareSavingPlansByTargetDate = (
  first,
  second,
) => {
  const firstDate = toLocalDate(
    getSavingPlanTargetDate(first),
  );

  const secondDate = toLocalDate(
    getSavingPlanTargetDate(second),
  );

  if (!firstDate && !secondDate) {
    return 0;
  }

  if (!firstDate) {
    return 1;
  }

  if (!secondDate) {
    return -1;
  }

  return (
    firstDate.getTime() -
    secondDate.getTime()
  );
};

export const compareSavingPlansByTargetAmount = (
  first,
  second,
) => {
  const firstAmount =
    getSavingPlanTargetAmount(first);

  const secondAmount =
    getSavingPlanTargetAmount(second);

  if (firstAmount === null && secondAmount === null) {
    return 0;
  }

  if (firstAmount === null) {
    return 1;
  }

  if (secondAmount === null) {
    return -1;
  }

  return firstAmount - secondAmount;
};

/* -------------------------------------------------------------------------- */
/* Collection helpers                                                         */
/* -------------------------------------------------------------------------- */

export const findSavingPlanById = (
  plans,
  planId,
) => {
  if (!Array.isArray(plans) || !planId) {
    return null;
  }

  const normalizedId = toSafeString(planId);

  return (
    plans.find(
      (plan) =>
        getSavingPlanId(plan) === normalizedId,
    ) ?? null
  );
};

export const hasSavingPlanWithId = (
  plans,
  planId,
) =>
  Boolean(findSavingPlanById(plans, planId));

export const removeSavingPlanById = (
  plans,
  planId,
) => {
  if (!Array.isArray(plans)) {
    return [];
  }

  if (!planId) {
    return [...plans];
  }

  const normalizedId = toSafeString(planId);

  return plans.filter(
    (plan) =>
      getSavingPlanId(plan) !== normalizedId,
  );
};

export const upsertSavingPlan = (
  plans,
  nextPlan,
) => {
  if (!Array.isArray(plans)) {
    return nextPlan ? [nextPlan] : [];
  }

  const nextId = getSavingPlanId(nextPlan);

  if (!nextId) {
    return [...plans, nextPlan];
  }

  let found = false;

  const updatedPlans = plans.map((plan) => {
    if (getSavingPlanId(plan) !== nextId) {
      return plan;
    }

    found = true;
    return nextPlan;
  });

  return found
    ? updatedPlans
    : [nextPlan, ...updatedPlans];
};

/* -------------------------------------------------------------------------- */
/* Safe plan cloning                                                          */
/* -------------------------------------------------------------------------- */

export const cloneSavingPlan = (plan) => {
  if (!isObject(plan)) {
    return null;
  }

  return {
    ...plan,
  };
};

/* -------------------------------------------------------------------------- */
/* Plan normalization                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes the structural fields commonly required by the
 * SmartSave frontend without applying financial business rules.
 */
export const normalizeSavingPlan = (
  plan,
  fallbackCurrency = DEFAULT_CURRENCY,
) => {
  if (!isObject(plan)) {
    return null;
  }

  return {
    ...plan,
    id: getSavingPlanId(plan),
    name: getSavingPlanName(plan),
    description: getSavingPlanDescription(plan),
    targetAmount: getSavingPlanTargetAmount(plan),
    currency: getSavingPlanCurrency(
      plan,
      fallbackCurrency,
    ),
    targetDate: getSavingPlanTargetDate(plan),
    status: getSavingPlanStatus(plan),
  };
};

/* -------------------------------------------------------------------------- */
/* Default export                                                             */
/* -------------------------------------------------------------------------- */

const savingPlanHelpers = {
  isObject,
  isNonEmptyObject,
  isArray,
  isNonEmptyArray,

  isFiniteNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  toSafeString,
  hasValue,

  normalizeCurrency,

  getSavingPlanId,
  hasSavingPlanId,
  areSavingPlanIdsEqual,

  getSavingPlanName,
  getSavingPlanDescription,
  getSavingPlanCurrency,
  getSavingPlanTargetAmount,
  getSavingPlanTargetDate,
  getSavingPlanStatus,

  toValidDate,
  toLocalDate,
  isValidSavingPlanDate,
  isSavingPlanDatePast,
  isSavingPlanDateToday,
  isSavingPlanDateFuture,
  getDaysUntilSavingPlanDate,

  isSavingPlanActive,
  isSavingPlanCompleted,
  isSavingPlanPaused,
  isSavingPlanCancelled,
  isSavingPlanFailed,
  isSavingPlanClosed,

  hasSavingPlanName,
  hasSavingPlanTargetAmount,
  hasSavingPlanTargetDate,
  isSavingPlanStructurallyValid,

  compareSavingPlansByName,
  compareSavingPlansByTargetDate,
  compareSavingPlansByTargetAmount,

  findSavingPlanById,
  hasSavingPlanWithId,
  removeSavingPlanById,
  upsertSavingPlan,

  cloneSavingPlan,
  normalizeSavingPlan,
};

export default savingPlanHelpers;