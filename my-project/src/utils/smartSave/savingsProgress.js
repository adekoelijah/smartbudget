/**
 * savingsProgress.js
 *
 * Production-ready savings progress utilities.
 *
 * Responsibilities:
 * - Normalize savings progress data
 * - Calculate progress percentages
 * - Calculate remaining amounts
 * - Calculate target deltas
 * - Determine progress status
 * - Calculate contribution progress
 * - Calculate schedule/plan progress
 * - Safely handle malformed/null values
 *
 * This module does NOT:
 * - Call APIs
 * - Mutate backend data
 * - Perform financial transactions
 * - Replace backend financial/business rules
 */

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_PERCENTAGE = 0;
const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

const PROGRESS_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  NEAR_TARGET: "near_target",
  COMPLETED: "completed",
  EXCEEDED: "exceeded",
});

/* =========================================================
   INTERNAL HELPERS
========================================================= */

/**
 * Safely convert a value to a finite number.
 */
const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/**
 * Prevent negative financial values where appropriate.
 */
const nonNegative = (value) =>
  Math.max(0, toNumber(value));

/**
 * Clamp a percentage between 0 and 100.
 */
export const clampPercentage = (value) =>
  Math.min(
    MAX_PERCENTAGE,
    Math.max(MIN_PERCENTAGE, toNumber(value))
  );

/**
 * Safely divide two numbers.
 */
const safeDivide = (numerator, denominator) => {
  const safeNumerator = toNumber(numerator);
  const safeDenominator = toNumber(denominator);

  if (safeDenominator <= 0) {
    return 0;
  }

  return safeNumerator / safeDenominator;
};

/* =========================================================
   BASIC PROGRESS CALCULATIONS
========================================================= */

/**
 * Calculate progress percentage.
 *
 * Example:
 * current = 25000
 * target = 100000
 * => 25
 */
export const calculateProgressPercentage = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  if (targetAmount <= 0) {
    return DEFAULT_PERCENTAGE;
  }

  return clampPercentage(
    safeDivide(currentAmount, targetAmount) * 100
  );
};

/**
 * Calculate raw progress percentage without clamping.
 *
 * Useful when determining whether a target has been exceeded.
 */
export const calculateRawProgressPercentage = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  if (targetAmount <= 0) {
    return DEFAULT_PERCENTAGE;
  }

  return safeDivide(currentAmount, targetAmount) * 100;
};

/**
 * Calculate remaining amount required to reach target.
 */
export const calculateRemainingAmount = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  return Math.max(
    0,
    targetAmount - currentAmount
  );
};

/**
 * Calculate amount already saved toward target.
 */
export const calculateSavedAmount = (current) =>
  nonNegative(current);

/**
 * Calculate amount by which target has been exceeded.
 */
export const calculateExceededAmount = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  return Math.max(
    0,
    currentAmount - targetAmount
  );
};

/* =========================================================
   TARGET STATE
========================================================= */

/**
 * Determine whether target has been reached.
 */
export const isTargetReached = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  return (
    targetAmount > 0 &&
    currentAmount >= targetAmount
  );
};

/**
 * Determine whether target has been exceeded.
 */
export const isTargetExceeded = (
  current,
  target
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  return (
    targetAmount > 0 &&
    currentAmount > targetAmount
  );
};

/**
 * Determine whether progress has started.
 */
export const hasSavingsProgress = (current) =>
  nonNegative(current) > 0;

/* =========================================================
   PROGRESS STATUS
========================================================= */

/**
 * Determine a normalized progress status.
 *
 * nearTargetThreshold:
 * percentage at which progress becomes "near_target".
 */
export const getProgressStatus = (
  current,
  target,
  nearTargetThreshold = 80
) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  if (targetAmount <= 0) {
    return PROGRESS_STATUS.NOT_STARTED;
  }

  if (currentAmount > targetAmount) {
    return PROGRESS_STATUS.EXCEEDED;
  }

  if (currentAmount >= targetAmount) {
    return PROGRESS_STATUS.COMPLETED;
  }

  if (
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    ) >= clampPercentage(nearTargetThreshold)
  ) {
    return PROGRESS_STATUS.NEAR_TARGET;
  }

  if (currentAmount > 0) {
    return PROGRESS_STATUS.IN_PROGRESS;
  }

  return PROGRESS_STATUS.NOT_STARTED;
};

/* =========================================================
   PROGRESS OBJECT
========================================================= */

/**
 * Build a complete normalized progress object.
 */
export const calculateSavingsProgress = ({
  current = 0,
  target = 0,
  nearTargetThreshold = 80,
} = {}) => {
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  const percentage = calculateProgressPercentage(
    currentAmount,
    targetAmount
  );

  const rawPercentage =
    calculateRawProgressPercentage(
      currentAmount,
      targetAmount
    );

  const remaining = calculateRemainingAmount(
    currentAmount,
    targetAmount
  );

  const exceeded = calculateExceededAmount(
    currentAmount,
    targetAmount
  );

  const completed = isTargetReached(
    currentAmount,
    targetAmount
  );

  return {
    current: currentAmount,
    target: targetAmount,
    percentage,
    rawPercentage,
    remaining,
    exceeded,
    completed,
    status: getProgressStatus(
      currentAmount,
      targetAmount,
      nearTargetThreshold
    ),
  };
};

/* =========================================================
   CONTRIBUTION PROGRESS
========================================================= */

/**
 * Calculate progress created by a contribution.
 */
export const calculateContributionProgress = ({
  contributionAmount = 0,
  currentAmount = 0,
  targetAmount = 0,
} = {}) => {
  const contribution = nonNegative(
    contributionAmount
  );

  const before = nonNegative(currentAmount);

  const target = nonNegative(targetAmount);

  const after = before + contribution;

  return {
    contribution,
    before,
    after,
    target,
    progressBefore:
      calculateProgressPercentage(
        before,
        target
      ),
    progressAfter:
      calculateProgressPercentage(
        after,
        target
      ),
    remainingBefore:
      calculateRemainingAmount(
        before,
        target
      ),
    remainingAfter:
      calculateRemainingAmount(
        after,
        target
      ),
    targetReached:
      isTargetReached(after, target),
  };
};

/* =========================================================
   MULTI-PERIOD PROGRESS
========================================================= */

/**
 * Calculate progress across contribution periods.
 *
 * periods:
 * [
 *   { amount: 10000 },
 *   { amount: 15000 }
 * ]
 */
export const calculatePeriodProgress = (
  periods = [],
  target = 0
) => {
  if (!Array.isArray(periods)) {
    return calculateSavingsProgress({
      current: 0,
      target,
    });
  }

  const total = periods.reduce(
    (sum, period) =>
      sum +
      nonNegative(
        period?.amount ??
          period?.contribution ??
          period?.savedAmount ??
          0
      ),
    0
  );

  return calculateSavingsProgress({
    current: total,
    target,
  });
};

/* =========================================================
   PLAN PROGRESS
========================================================= */

/**
 * Calculate savings-plan progress.
 */
export const calculatePlanProgress = ({
  targetAmount = 0,
  currentAmount = 0,
  requiredAmount = 0,
} = {}) => {
  const progress = calculateSavingsProgress({
    current: currentAmount,
    target: targetAmount,
  });

  const required = nonNegative(requiredAmount);

  return {
    ...progress,
    requiredAmount: required,
    contributionGap: Math.max(
      0,
      required - progress.current
    ),
    requirementMet:
      required <= 0 ||
      progress.current >= required,
  };
};

/* =========================================================
   CHALLENGE PROGRESS
========================================================= */

/**
 * Calculate challenge progress.
 */
export const calculateChallengeProgress = ({
  completedPeriods = 0,
  totalPeriods = 0,
  successfulPeriods = 0,
  missedPeriods = 0,
  targetAmount = 0,
  currentAmount = 0,
} = {}) => {
  const completed = Math.max(
    0,
    Math.trunc(toNumber(completedPeriods))
  );

  const total = Math.max(
    0,
    Math.trunc(toNumber(totalPeriods))
  );

  const successful = Math.max(
    0,
    Math.trunc(toNumber(successfulPeriods))
  );

  const missed = Math.max(
    0,
    Math.trunc(toNumber(missedPeriods))
  );

  const periodPercentage =
    total > 0
      ? clampPercentage(
          (completed / total) * 100
        )
      : 0;

  const successRate =
    completed > 0
      ? clampPercentage(
          (successful / completed) * 100
        )
      : 0;

  return {
    ...calculateSavingsProgress({
      current: currentAmount,
      target: targetAmount,
    }),

    completedPeriods: completed,
    totalPeriods: total,
    successfulPeriods: successful,
    missedPeriods: missed,

    periodPercentage,
    successRate,

    periodsRemaining: Math.max(
      0,
      total - completed
    ),
  };
};

/* =========================================================
   SCHEDULE PROGRESS
========================================================= */

/**
 * Calculate execution/schedule progress.
 */
export const calculateScheduleProgress = ({
  executedCount = 0,
  expectedCount = 0,
  successfulCount = 0,
  failedCount = 0,
  totalSaved = 0,
  targetAmount = 0,
} = {}) => {
  const executed = Math.max(
    0,
    Math.trunc(toNumber(executedCount))
  );

  const expected = Math.max(
    0,
    Math.trunc(toNumber(expectedCount))
  );

  const successful = Math.max(
    0,
    Math.trunc(toNumber(successfulCount))
  );

  const failed = Math.max(
    0,
    Math.trunc(toNumber(failedCount))
  );

  return {
    ...calculateSavingsProgress({
      current: totalSaved,
      target: targetAmount,
    }),

    executedCount: executed,
    expectedCount: expected,
    successfulCount: successful,
    failedCount: failed,

    executionPercentage:
      expected > 0
        ? clampPercentage(
            (executed / expected) * 100
          )
        : 0,

    successRate:
      executed > 0
        ? clampPercentage(
            (successful / executed) * 100
          )
        : 0,

    failureRate:
      executed > 0
        ? clampPercentage(
            (failed / executed) * 100
          )
        : 0,

    executionsRemaining: Math.max(
      0,
      expected - executed
    ),
  };
};

/* =========================================================
   PROGRESS DELTA
========================================================= */

/**
 * Compare two savings states.
 */
export const calculateProgressDelta = ({
  previous = 0,
  current = 0,
  target = 0,
} = {}) => {
  const previousAmount = nonNegative(previous);
  const currentAmount = nonNegative(current);
  const targetAmount = nonNegative(target);

  const amountDelta =
    currentAmount - previousAmount;

  const previousPercentage =
    calculateProgressPercentage(
      previousAmount,
      targetAmount
    );

  const currentPercentage =
    calculateProgressPercentage(
      currentAmount,
      targetAmount
    );

  return {
    amountDelta,
    percentageDelta:
      currentPercentage - previousPercentage,

    increased: amountDelta > 0,
    decreased: amountDelta < 0,
    unchanged: amountDelta === 0,

    previous: previousAmount,
    current: currentAmount,
    target: targetAmount,
  };
};

/* =========================================================
   NORMALIZATION
========================================================= */

/**
 * Extract common progress fields from a backend
 * savings resource.
 *
 * This intentionally supports common response shapes
 * without inventing backend fields.
 */
export const normalizeSavingsProgress = (
  resource = {}
) => {
  const data =
    resource?.data ??
    resource?.progress ??
    resource ??
    {};

  const current =
    data.currentAmount ??
    data.current ??
    data.savedAmount ??
    data.amountSaved ??
    data.totalSaved ??
    0;

  const target =
    data.targetAmount ??
    data.target ??
    data.goalAmount ??
    0;

  return calculateSavingsProgress({
    current,
    target,
  });
};

/* =========================================================
   AGGREGATE PROGRESS
========================================================= */

/**
 * Calculate aggregate progress across multiple
 * savings resources.
 */
export const calculateAggregateProgress = (
  resources = []
) => {
  if (!Array.isArray(resources)) {
    return calculateSavingsProgress();
  }

  const totals = resources.reduce(
    (result, resource) => {
      const data =
        resource?.data ??
        resource ??
        {};

      result.current += nonNegative(
        data.currentAmount ??
          data.current ??
          data.savedAmount ??
          data.amountSaved ??
          data.totalSaved ??
          0
      );

      result.target += nonNegative(
        data.targetAmount ??
          data.target ??
          data.goalAmount ??
          0
      );

      return result;
    },
    {
      current: 0,
      target: 0,
    }
  );

  return calculateSavingsProgress(totals);
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  PROGRESS_STATUS,
};

const savingsProgress = Object.freeze({
  calculateProgressPercentage,
  calculateRawProgressPercentage,
  calculateRemainingAmount,
  calculateSavedAmount,
  calculateExceededAmount,

  isTargetReached,
  isTargetExceeded,
  hasSavingsProgress,

  getProgressStatus,
  calculateSavingsProgress,

  calculateContributionProgress,
  calculatePeriodProgress,
  clampPercentage,

  calculatePlanProgress,
  calculateChallengeProgress,
  calculateScheduleProgress,

  calculateProgressDelta,

  normalizeSavingsProgress,
  calculateAggregateProgress,

  PROGRESS_STATUS,
});

export default savingsProgress;