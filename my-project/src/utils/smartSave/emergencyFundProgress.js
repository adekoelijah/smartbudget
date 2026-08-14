
/* =========================================================
   EMERGENCY FUND PROGRESS UTILITIES

   Purpose:
   - Calculate emergency-fund progress safely
   - Prevent invalid financial calculations
   - Keep percentage calculations consistent
   - Provide reusable progress/status helpers
   - Remain independent from React and API layers

   This module contains pure functions only.
========================================================= */

/* =========================================================
   CONSTANTS
========================================================= */

export const EMERGENCY_FUND_PROGRESS = {
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  DEFAULT_CURRENT_AMOUNT: 0,
  DEFAULT_TARGET_AMOUNT: 0,
};

/* =========================================================
   SAFE NUMBER
========================================================= */

/**
 * Converts a value into a finite number.
 *
 * Invalid values become 0.
 *
 * @param {*} value
 * @returns {number}
 */
export const toSafeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/* =========================================================
   CLAMP PERCENTAGE
========================================================= */

/**
 * Keeps a percentage between 0 and 100.
 *
 * @param {*} value
 * @returns {number}
 */
export const clampProgressPercentage = (
  value
) => {
  const percentage = toSafeNumber(value);

  return Math.min(
    EMERGENCY_FUND_PROGRESS.MAX_PERCENTAGE,
    Math.max(
      EMERGENCY_FUND_PROGRESS.MIN_PERCENTAGE,
      percentage
    )
  );
};

/* =========================================================
   CALCULATE PROGRESS PERCENTAGE
========================================================= */

/**
 * Calculates emergency-fund progress.
 *
 * Formula:
 *
 *     currentAmount / targetAmount * 100
 *
 * The result is always clamped between 0 and 100.
 *
 * Examples:
 *
 * calculateProgressPercentage(25000, 100000)
 * → 25
 *
 * calculateProgressPercentage(150000, 100000)
 * → 100
 *
 * calculateProgressPercentage(0, 100000)
 * → 0
 *
 * @param {number|string} currentAmount
 * @param {number|string} targetAmount
 * @returns {number}
 */
export const calculateProgressPercentage = (
  currentAmount,
  targetAmount
) => {
  const current = Math.max(
    0,
    toSafeNumber(currentAmount)
  );

  const target = Math.max(
    0,
    toSafeNumber(targetAmount)
  );

  /*
   * A zero target cannot produce a meaningful
   * progress percentage.
   */
  if (target <= 0) {
    return 0;
  }

  const percentage =
    (current / target) * 100;

  return clampProgressPercentage(
    percentage
  );
};

/* =========================================================
   CALCULATE REMAINING AMOUNT
========================================================= */

/**
 * Calculates the amount still required to reach
 * the emergency-fund target.
 *
 * @param {number|string} currentAmount
 * @param {number|string} targetAmount
 * @returns {number}
 */
export const calculateRemainingAmount = (
  currentAmount,
  targetAmount
) => {
  const current = Math.max(
    0,
    toSafeNumber(currentAmount)
  );

  const target = Math.max(
    0,
    toSafeNumber(targetAmount)
  );

  return Math.max(
    0,
    target - current
  );
};

/* =========================================================
   CALCULATE CONTRIBUTION
========================================================= */

/**
 * Calculates how much of a contribution should be
 * counted toward the remaining emergency-fund target.
 *
 * This prevents the calculated contribution from
 * exceeding the remaining target.
 *
 * @param {number|string} contribution
 * @param {number|string} remainingAmount
 * @returns {number}
 */
export const calculateApplicableContribution = (
  contribution,
  remainingAmount
) => {
  const amount = Math.max(
    0,
    toSafeNumber(contribution)
  );

  const remaining = Math.max(
    0,
    toSafeNumber(remainingAmount)
  );

  return Math.min(
    amount,
    remaining
  );
};

/* =========================================================
   CALCULATE UPDATED PROGRESS
========================================================= */

/**
 * Calculates progress after applying a contribution.
 *
 * Useful when the UI needs an optimistic progress
 * calculation before the backend response arrives.
 *
 * @param {number|string} currentAmount
 * @param {number|string} contribution
 * @param {number|string} targetAmount
 * @returns {number}
 */
export const calculateUpdatedProgressPercentage = (
  currentAmount,
  contribution,
  targetAmount
) => {
  const current = Math.max(
    0,
    toSafeNumber(currentAmount)
  );

  const amount = Math.max(
    0,
    toSafeNumber(contribution)
  );

  const target = Math.max(
    0,
    toSafeNumber(targetAmount)
  );

  return calculateProgressPercentage(
    current + amount,
    target
  );
};

/* =========================================================
   CALCULATE REMAINING PERCENTAGE
========================================================= */

/**
 * Returns the percentage still required to reach
 * the emergency-fund target.
 *
 * @param {number|string} currentAmount
 * @param {number|string} targetAmount
 * @returns {number}
 */
export const calculateRemainingPercentage = (
  currentAmount,
  targetAmount
) => {
  const progress =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );

  return Math.max(
    0,
    100 - progress
  );
};

/* =========================================================
   FUND STATUS
========================================================= */

/**
 * Determines the current emergency-fund status.
 *
 * Status thresholds:
 *
 * 100% → complete
 * 75–99.99% → strong
 * 50–74.99% → progressing
 * 25–49.99% → building
 * 0–24.99% → starting
 *
 * @param {number|string} currentAmount
 * @param {number|string} targetAmount
 * @returns {{
 *   key: string,
 *   label: string,
 *   percentage: number,
 *   completed: boolean
 * }}
 */
export const getEmergencyFundProgressStatus = (
  currentAmount,
  targetAmount
) => {
  const percentage =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );

  if (percentage >= 100) {
    return {
      key: "complete",
      label: "Emergency fund complete",
      percentage,
      completed: true,
    };
  }

  if (percentage >= 75) {
    return {
      key: "strong",
      label: "Strong progress",
      percentage,
      completed: false,
    };
  }

  if (percentage >= 50) {
    return {
      key: "progressing",
      label: "Good progress",
      percentage,
      completed: false,
    };
  }

  if (percentage >= 25) {
    return {
      key: "building",
      label: "Building your safety net",
      percentage,
      completed: false,
    };
  }

  return {
    key: "starting",
    label: "Just getting started",
    percentage,
    completed: false,
  };
};

/* =========================================================
   EMERGENCY FUND SUMMARY
========================================================= */

/**
 * Creates a complete progress summary.
 *
 * Keeping this calculation here prevents components from
 * independently calculating the same financial values.
 *
 * @param {Object} params
 * @param {number|string} params.currentAmount
 * @param {number|string} params.targetAmount
 * @returns {Object}
 */
export const calculateEmergencyFundProgress = ({
  currentAmount = 0,
  targetAmount = 0,
} = {}) => {
  const current = Math.max(
    0,
    toSafeNumber(currentAmount)
  );

  const target = Math.max(
    0,
    toSafeNumber(targetAmount)
  );

  const percentage =
    calculateProgressPercentage(
      current,
      target
    );

  const remainingAmount =
    calculateRemainingAmount(
      current,
      target
    );

  const remainingPercentage =
    calculateRemainingPercentage(
      current,
      target
    );

  const status =
    getEmergencyFundProgressStatus(
      current,
      target
    );

  return {
    currentAmount: current,

    targetAmount: target,

    percentage,

    remainingAmount,

    remainingPercentage,

    completed:
      percentage >= 100,

    status,
  };
};

/* =========================================================
   PROGRESS BAR WIDTH
========================================================= */

/**
 * Returns a safe CSS-ready progress width.
 *
 * Example:
 *
 * getEmergencyFundProgressWidth(45)
 * → "45%"
 *
 * @param {number|string} percentage
 * @returns {string}
 */
export const getEmergencyFundProgressWidth = (
  percentage
) => {
  return `${clampProgressPercentage(
    percentage
  )}%`;
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  toSafeNumber,

  clampProgressPercentage,

  calculateProgressPercentage,

  calculateRemainingAmount,

  calculateApplicableContribution,

  calculateUpdatedProgressPercentage,

  calculateRemainingPercentage,

  getEmergencyFundProgressStatus,

  calculateEmergencyFundProgress,

  getEmergencyFundProgressWidth,
};
