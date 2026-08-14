// services/savingCalculationService.js

/**
 * ============================================================
 * SAVING CALCULATION SERVICE
 * ============================================================
 *
 * Pure calculation/domain utility service for SmartBudget
 * savings.
 *
 * RESPONSIBILITIES
 * ------------------------------------------------------------
 * - Monetary calculations
 * - Goal progress calculations
 * - Remaining amount calculations
 * - Contribution calculations
 * - Frequency calculations
 * - Date calculations
 * - Saving pace calculations
 * - Goal health calculations
 * - Percentage calculations
 * - Projection calculations
 *
 * THIS SERVICE MUST NOT
 * ------------------------------------------------------------
 * - Access MongoDB
 * - Import mongoose
 * - Create database records
 * - Update database records
 * - Delete database records
 * - Execute financial transactions
 * - Modify SavingGoal documents
 * - Modify SavingContribution documents
 * - Modify SavingExecution documents
 * - Modify SavingSchedule documents
 * - Modify AutoSave documents
 * - Orchestrate saving plans
 *
 * PLAN ORCHESTRATION
 * ------------------------------------------------------------
 * savingPlanService.js is responsible for combining these
 * calculations into a complete saving plan.
 *
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_CURRENCY = "NGN";

const DAYS_PER_WEEK = 7;

const DAYS_PER_MONTH = 30.4375;

const DAYS_PER_YEAR = 365.25;

const HOURS_PER_DAY = 24;

const MINUTES_PER_HOUR = 60;

const SECONDS_PER_MINUTE = 60;

const MILLISECONDS_PER_SECOND = 1000;

const MILLISECONDS_PER_DAY =
  MILLISECONDS_PER_SECOND *
  SECONDS_PER_MINUTE *
  MINUTES_PER_HOUR *
  HOURS_PER_DAY;

const SUPPORTED_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
];

const FREQUENCY_DAYS = Object.freeze({
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: DAYS_PER_MONTH,
  quarterly: DAYS_PER_MONTH * 3,
  yearly: DAYS_PER_YEAR,
});

const FREQUENCY_PERIODS_PER_YEAR = Object.freeze({
  daily: DAYS_PER_YEAR,
  weekly: DAYS_PER_YEAR / 7,
  biweekly: DAYS_PER_YEAR / 14,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
});

/* ============================================================
   ERROR CLASS
============================================================ */

class SavingCalculationServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVING_CALCULATION_ERROR",
    details = null
  ) {
    super(message);

    this.name =
      "SavingCalculationServiceError";

    this.statusCode = statusCode;

    this.code = code;

    this.details = details;

    Error.captureStackTrace?.(
      this,
      SavingCalculationServiceError
    );
  }
}

/* ============================================================
   NUMBER HELPERS
============================================================ */

/**
 * Convert a value into a finite number.
 */
const toNumber = (
  value,
  fieldName = "Value"
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new SavingCalculationServiceError(
      `${fieldName} must be a valid number`,
      400,
      "INVALID_NUMBER"
    );
  }

  return number;
};

/**
 * Require a non-negative number.
 */
const toNonNegativeNumber = (
  value,
  fieldName = "Value"
) => {
  const number = toNumber(
    value,
    fieldName
  );

  if (number < 0) {
    throw new SavingCalculationServiceError(
      `${fieldName} cannot be negative`,
      400,
      "NEGATIVE_VALUE"
    );
  }

  return number;
};

/**
 * Require a positive number.
 */
const toPositiveNumber = (
  value,
  fieldName = "Value"
) => {
  const number = toNumber(
    value,
    fieldName
  );

  if (number <= 0) {
    throw new SavingCalculationServiceError(
      `${fieldName} must be greater than zero`,
      400,
      "INVALID_POSITIVE_VALUE"
    );
  }

  return number;
};

/**
 * Require an integer greater than zero.
 */
const toPositiveInteger = (
  value,
  fieldName = "Value"
) => {
  const number = toPositiveNumber(
    value,
    fieldName
  );

  if (!Number.isInteger(number)) {
    throw new SavingCalculationServiceError(
      `${fieldName} must be a whole number`,
      400,
      "INVALID_INTEGER"
    );
  }

  return number;
};

/* ============================================================
   MONEY PRECISION
============================================================ */

/**
 * Round a monetary value.
 *
 * Important:
 * JavaScript Number is NOT the authoritative representation
 * for persisted financial ledger values.
 *
 * Decimal128 should remain the persistence-layer representation.
 *
 * This function is intended for deterministic calculations
 * and API-level projections.
 */
export const roundMoney = (
  value,
  decimals = 2
) => {
  const number = toNumber(
    value,
    "Amount"
  );

  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 10
  ) {
    throw new SavingCalculationServiceError(
      "Money precision must be a whole number between 0 and 10",
      400,
      "INVALID_PRECISION"
    );
  }

  const factor =
    10 ** decimals;

  return (
    Math.round(
      (number + Number.EPSILON) *
        factor
    ) / factor
  );
};

/**
 * Round a percentage.
 */
export const roundPercentage = (
  value,
  decimals = 2
) => {
  const number = toNumber(
    value,
    "Percentage"
  );

  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 10
  ) {
    throw new SavingCalculationServiceError(
      "Percentage precision must be a whole number between 0 and 10",
      400,
      "INVALID_PRECISION"
    );
  }

  const factor =
    10 ** decimals;

  return (
    Math.round(
      (number + Number.EPSILON) *
        factor
    ) / factor
  );
};

/* ============================================================
   DATE HELPERS
============================================================ */

/**
 * Normalize a date without mutating the original.
 */
export const normalizeDate = (
  value,
  fieldName = "Date"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    throw new SavingCalculationServiceError(
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
    throw new SavingCalculationServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

/**
 * Calculate exact elapsed days between two dates.
 *
 * Returns zero when endDate occurs before startDate.
 */
export const daysBetween = (
  startDate,
  endDate
) => {
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

  const difference =
    end.getTime() -
    start.getTime();

  return Math.max(
    0,
    difference /
      MILLISECONDS_PER_DAY
  );
};

/**
 * Add days to a date.
 */
export const addDays = (
  date,
  days
) => {
  const normalizedDate =
    normalizeDate(
      date,
      "Date"
    );

  const normalizedDays =
    toNonNegativeNumber(
      days,
      "Days"
    );

  return new Date(
    normalizedDate.getTime() +
      normalizedDays *
        MILLISECONDS_PER_DAY
  );
};

/* ============================================================
   CURRENCY
============================================================ */

/**
 * Normalize an ISO-style three-letter currency code.
 */
export const normalizeCurrency = (
  currency = DEFAULT_CURRENCY
) => {
  const normalized =
    String(
      currency ||
        DEFAULT_CURRENCY
    )
      .trim()
      .toUpperCase();

  if (
    !/^[A-Z]{3}$/.test(
      normalized
    )
  ) {
    throw new SavingCalculationServiceError(
      "Currency must be a valid 3-letter currency code",
      400,
      "INVALID_CURRENCY"
    );
  }

  return normalized;
};

/* ============================================================
   GOAL AMOUNT CALCULATIONS
============================================================ */

/**
 * Calculate amount remaining before a goal is reached.
 */
export const calculateRemainingAmount = ({
  targetAmount,
  currentAmount = 0,
}) => {
  const target =
    toNonNegativeNumber(
      targetAmount,
      "Target amount"
    );

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  return roundMoney(
    Math.max(
      target - current,
      0
    )
  );
};

/**
 * Calculate completion percentage.
 */
export const calculateProgressPercentage = ({
  targetAmount,
  currentAmount = 0,
}) => {
  const target =
    toPositiveNumber(
      targetAmount,
      "Target amount"
    );

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const progress =
    (current / target) * 100;

  return roundPercentage(
    Math.min(
      Math.max(progress, 0),
      100
    )
  );
};

/**
 * Calculate remaining percentage.
 */
export const calculateRemainingPercentage = ({
  targetAmount,
  currentAmount = 0,
}) => {
  const progress =
    calculateProgressPercentage({
      targetAmount,
      currentAmount,
    });

  return roundPercentage(
    Math.max(
      100 - progress,
      0
    )
  );
};

/**
 * Calculate amount after contribution.
 *
 * This function does not persist the result.
 */
export const calculateAmountAfterContribution = ({
  currentAmount = 0,
  contributionAmount,
}) => {
  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const contribution =
    toPositiveNumber(
      contributionAmount,
      "Contribution amount"
    );

  return roundMoney(
    current + contribution
  );
};

/**
 * Determine whether a goal has reached its target.
 */
export const hasReachedGoal = ({
  targetAmount,
  currentAmount = 0,
}) => {
  const target =
    toPositiveNumber(
      targetAmount,
      "Target amount"
    );

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  return current >= target;
};

/* ============================================================
   CONTRIBUTION CALCULATIONS
============================================================ */

/**
 * Calculate contribution required per period.
 */
export const calculateContributionPerPeriod = ({
  targetAmount,
  currentAmount = 0,
  periods,
}) => {
  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  if (remaining <= 0) {
    return 0;
  }

  const normalizedPeriods =
    toPositiveNumber(
      periods,
      "Periods"
    );

  return roundMoney(
    remaining /
      normalizedPeriods
  );
};

/**
 * Calculate required daily contribution.
 */
export const calculateDailyContribution = ({
  targetAmount,
  currentAmount = 0,
  days,
}) => {
  return calculateContributionPerPeriod({
    targetAmount,
    currentAmount,
    periods: days,
  });
};

/**
 * Calculate required weekly contribution.
 */
export const calculateWeeklyContribution = ({
  targetAmount,
  currentAmount = 0,
  weeks,
}) => {
  return calculateContributionPerPeriod({
    targetAmount,
    currentAmount,
    periods: weeks,
  });
};

/**
 * Calculate required monthly contribution.
 */
export const calculateMonthlyContribution = ({
  targetAmount,
  currentAmount = 0,
  months,
}) => {
  return calculateContributionPerPeriod({
    targetAmount,
    currentAmount,
    periods: months,
  });
};

/* ============================================================
   FREQUENCY CALCULATIONS
============================================================ */

/**
 * Validate and normalize saving frequency.
 */
export const normalizeFrequency = (
  frequency
) => {
  const normalized =
    String(
      frequency || ""
    )
      .trim()
      .toLowerCase();

  if (
    !SUPPORTED_FREQUENCIES.includes(
      normalized
    )
  ) {
    throw new SavingCalculationServiceError(
      `Unsupported saving frequency: ${frequency}`,
      400,
      "INVALID_FREQUENCY"
    );
  }

  return normalized;
};

/**
 * Return approximate number of periods per year.
 */
export const getPeriodsPerYear = (
  frequency
) => {
  const normalized =
    normalizeFrequency(
      frequency
    );

  return FREQUENCY_PERIODS_PER_YEAR[
    normalized
  ];
};

/**
 * Return approximate number of days per period.
 */
export const getDaysPerPeriod = (
  frequency
) => {
  const normalized =
    normalizeFrequency(
      frequency
    );

  return FREQUENCY_DAYS[
    normalized
  ];
};

/**
 * Calculate contribution required for a selected frequency.
 */
export const calculateContributionByFrequency = ({
  targetAmount,
  currentAmount = 0,
  remainingPeriods,
  frequency,
}) => {
  normalizeFrequency(
    frequency
  );

  return calculateContributionPerPeriod({
    targetAmount,
    currentAmount,
    periods: remainingPeriods,
  });
};

/* ============================================================
   TIME-TO-GOAL CALCULATIONS
============================================================ */

/**
 * Calculate number of contributions required.
 */
export const calculatePeriodsRequired = ({
  targetAmount,
  currentAmount = 0,
  contributionAmount,
}) => {
  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  if (remaining <= 0) {
    return 0;
  }

  const contribution =
    toPositiveNumber(
      contributionAmount,
      "Contribution amount"
    );

  return Math.ceil(
    remaining / contribution
  );
};

/**
 * Calculate projected completion date.
 */
export const calculateProjectedCompletionDate = ({
  targetAmount,
  currentAmount = 0,
  contributionAmount,
  frequency,
  startDate = new Date(),
}) => {
  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const periods =
    calculatePeriodsRequired({
      targetAmount,
      currentAmount,
      contributionAmount,
    });

  const normalizedStart =
    normalizeDate(
      startDate,
      "Start date"
    );

  if (periods === 0) {
    return normalizedStart;
  }

  const daysPerPeriod =
    getDaysPerPeriod(
      normalizedFrequency
    );

  return addDays(
    normalizedStart,
    periods *
      daysPerPeriod
  );
};

/* ============================================================
   TARGET DATE CALCULATIONS
============================================================ */

/**
 * Calculate required contribution to reach a goal
 * by a target date.
 */
export const calculateRequiredContributionForTargetDate = ({
  targetAmount,
  currentAmount = 0,
  targetDate,
  startDate = new Date(),
  frequency = "monthly",
}) => {
  const normalizedStart =
    normalizeDate(
      startDate,
      "Start date"
    );

  const normalizedTarget =
    normalizeDate(
      targetDate,
      "Target date"
    );

  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  if (remaining <= 0) {
    return 0;
  }

  if (
    normalizedTarget <=
    normalizedStart
  ) {
    throw new SavingCalculationServiceError(
      "Target date must be in the future",
      400,
      "INVALID_TARGET_DATE"
    );
  }

  const days =
    daysBetween(
      normalizedStart,
      normalizedTarget
    );

  const daysPerPeriod =
    getDaysPerPeriod(
      frequency
    );

  const periods =
    Math.max(
      1,
      Math.ceil(
        days /
          daysPerPeriod
      )
    );

  return calculateContributionPerPeriod({
    targetAmount,
    currentAmount,
    periods,
  });
};

/* ============================================================
   SAVING PACE
============================================================ */

/**
 * Calculate actual saving pace.
 */
export const calculateSavingPace = ({
  currentAmount = 0,
  startDate,
  asOfDate = new Date(),
}) => {
  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const days =
    daysBetween(
      startDate,
      asOfDate
    );

  if (days <= 0) {
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    };
  }

  const daily =
    current / days;

  return {
    daily: roundMoney(
      daily
    ),

    weekly: roundMoney(
      daily * DAYS_PER_WEEK
    ),

    monthly: roundMoney(
      daily * DAYS_PER_MONTH
    ),

    yearly: roundMoney(
      daily * DAYS_PER_YEAR
    ),
  };
};

/* ============================================================
   EXPECTED PROGRESS
============================================================ */

/**
 * Calculate expected progress based on elapsed time.
 */
export const calculateExpectedProgress = ({
  startDate,
  targetDate,
  asOfDate = new Date(),
}) => {
  const start =
    normalizeDate(
      startDate,
      "Start date"
    );

  const target =
    normalizeDate(
      targetDate,
      "Target date"
    );

  const current =
    normalizeDate(
      asOfDate,
      "Current date"
    );

  if (
    target <= start
  ) {
    throw new SavingCalculationServiceError(
      "Target date must be after the start date",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  if (
    current <= start
  ) {
    return 0;
  }

  if (
    current >= target
  ) {
    return 100;
  }

  const totalDays =
    daysBetween(
      start,
      target
    );

  const elapsedDays =
    daysBetween(
      start,
      current
    );

  return roundPercentage(
    (elapsedDays /
      totalDays) *
      100
  );
};

/**
 * Calculate variance between actual and expected progress.
 *
 * Positive  = ahead
 * Zero      = on track
 * Negative  = behind
 */
export const calculateProgressVariance = ({
  actualProgress,
  expectedProgress,
}) => {
  const actual =
    toNumber(
      actualProgress,
      "Actual progress"
    );

  const expected =
    toNumber(
      expectedProgress,
      "Expected progress"
    );

  return roundPercentage(
    actual - expected
  );
};

/* ============================================================
   GOAL HEALTH
============================================================ */

/**
 * Determine financial health of a saving goal.
 */
export const calculateGoalHealth = ({
  actualProgress,
  expectedProgress,
}) => {
  const variance =
    calculateProgressVariance({
      actualProgress,
      expectedProgress,
    });

  if (variance >= 10) {
    return {
      status: "ahead",
      variance,
      score: 100,
    };
  }

  if (variance >= 0) {
    return {
      status: "on_track",
      variance,
      score: 80,
    };
  }

  if (variance >= -10) {
    return {
      status: "slightly_behind",
      variance,
      score: 60,
    };
  }

  if (variance >= -25) {
    return {
      status: "behind",
      variance,
      score: 40,
    };
  }

  return {
    status: "at_risk",
    variance,
    score: 20,
  };
};

/* ============================================================
   GOAL SNAPSHOT
============================================================ */

/**
 * Produce a deterministic calculation snapshot.
 *
 * This function combines calculations only.
 * It does not load or modify a SavingGoal.
 */
export const calculateGoalSnapshot = ({
  targetAmount,
  currentAmount = 0,
  startDate = null,
  targetDate = null,
  asOfDate = new Date(),
}) => {
  const target =
    toPositiveNumber(
      targetAmount,
      "Target amount"
    );

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const remaining =
    calculateRemainingAmount({
      targetAmount: target,
      currentAmount: current,
    });

  const progress =
    calculateProgressPercentage({
      targetAmount: target,
      currentAmount: current,
    });

  const snapshot = {
    targetAmount:
      roundMoney(target),

    currentAmount:
      roundMoney(current),

    remainingAmount:
      remaining,

    progressPercentage:
      progress,

    remainingPercentage:
      calculateRemainingPercentage({
        targetAmount: target,
        currentAmount: current,
      }),

    isCompleted:
      current >= target,
  };

  if (
    startDate &&
    targetDate
  ) {
    const expectedProgress =
      calculateExpectedProgress({
        startDate,
        targetDate,
        asOfDate,
      });

    const health =
      calculateGoalHealth({
        actualProgress:
          progress,
        expectedProgress,
      });

    snapshot.expectedProgress =
      expectedProgress;

    snapshot.progressVariance =
      health.variance;

    snapshot.health =
      health.status;

    snapshot.healthScore =
      health.score;
  }

  return snapshot;
};

/* ============================================================
   PERCENTAGE SAVING
============================================================ */

/**
 * Calculate a percentage of a base amount.
 */
export const calculatePercentageSaving = ({
  baseAmount,
  percentage,
}) => {
  const base =
    toNonNegativeNumber(
      baseAmount,
      "Base amount"
    );

  const rate =
    toNumber(
      percentage,
      "Percentage"
    );

  if (
    rate < 0 ||
    rate > 100
  ) {
    throw new SavingCalculationServiceError(
      "Percentage must be between 0 and 100",
      400,
      "INVALID_PERCENTAGE"
    );
  }

  return roundMoney(
    base *
      (rate / 100)
  );
};

/* ============================================================
   CONTRIBUTION LIMITS
============================================================ */

/**
 * Apply a maximum contribution limit.
 */
export const applyContributionLimit = ({
  contributionAmount,
  maximumAmount = null,
}) => {
  const contribution =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  if (
    maximumAmount === null ||
    maximumAmount === undefined
  ) {
    return roundMoney(
      contribution
    );
  }

  const maximum =
    toPositiveNumber(
      maximumAmount,
      "Maximum amount"
    );

  return roundMoney(
    Math.min(
      contribution,
      maximum
    )
  );
};

/**
 * Calculate remaining capacity under a maximum amount.
 */
export const calculateRemainingCapacity = ({
  maximumAmount,
  currentAmount = 0,
}) => {
  const maximum =
    toPositiveNumber(
      maximumAmount,
      "Maximum amount"
    );

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  return roundMoney(
    Math.max(
      maximum - current,
      0
    )
  );
};

/* ============================================================
   PROJECTED FINAL AMOUNT
============================================================ */

/**
 * Calculate projected amount after future contributions.
 */
export const calculateProjectedAmount = ({
  currentAmount = 0,
  contributionAmount,
  numberOfContributions,
}) => {
  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const contribution =
    toPositiveNumber(
      contributionAmount,
      "Contribution amount"
    );

  const count =
    toNonNegativeNumber(
      numberOfContributions,
      "Number of contributions"
    );

  return roundMoney(
    current +
      contribution *
        count
  );
};

/* ============================================================
   SAVING RATE
============================================================ */

/**
 * Calculate saving rate against income.
 */
export const calculateSavingRate = ({
  savedAmount,
  incomeAmount,
}) => {
  const saved =
    toNonNegativeNumber(
      savedAmount,
      "Saved amount"
    );

  const income =
    toPositiveNumber(
      incomeAmount,
      "Income amount"
    );

  return roundPercentage(
    (saved / income) *
      100
  );
};

/* ============================================================
   CONTRIBUTION SCHEDULE
============================================================ */

/**
 * Determine whether a contribution occurred within the
 * expected frequency window.
 *
 * A 15% tolerance is allowed to accommodate weekends,
 * holidays, processing delays, and real-world behaviour.
 */
export const isContributionOnSchedule = ({
  previousContributionDate,
  contributionDate = new Date(),
  frequency,
}) => {
  const previous =
    normalizeDate(
      previousContributionDate,
      "Previous contribution date"
    );

  const current =
    normalizeDate(
      contributionDate,
      "Contribution date"
    );

  if (
    current < previous
  ) {
    throw new SavingCalculationServiceError(
      "Contribution date cannot be before previous contribution date",
      400,
      "INVALID_CONTRIBUTION_DATE"
    );
  }

  const expectedDays =
    getDaysPerPeriod(
      frequency
    );

  const actualDays =
    daysBetween(
      previous,
      current
    );

  const tolerance =
    Math.max(
      1,
      expectedDays * 0.15
    );

  return (
    actualDays <=
    expectedDays +
      tolerance
  );
};

/* ============================================================
   CONTRIBUTION PROJECTION
============================================================ */

/**
 * Calculate the amount required after applying a contribution
 * limit and the remaining goal capacity.
 *
 * This is intentionally a calculation primitive.
 *
 * Business decisions such as whether excess money should be
 * rejected, refunded, or redirected belong to savingPlanService
 * or the contribution/transaction service.
 */
export const calculateContributionCapacity = ({
  targetAmount,
  currentAmount = 0,
  requestedAmount,
  maximumPerContribution = null,
}) => {
  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  if (remaining <= 0) {
    return {
      requestedAmount: 0,
      maximumAllowed: 0,
      acceptedAmount: 0,
      remainingAmount: 0,
      exceedsGoal: true,
      exceedsMaximum: false,
    };
  }

  const requested =
    toPositiveNumber(
      requestedAmount,
      "Requested contribution"
    );

  const limited =
    applyContributionLimit({
      contributionAmount:
        requested,
      maximumAmount:
        maximumPerContribution,
    });

  const accepted =
    roundMoney(
      Math.min(
        limited,
        remaining
      )
    );

  return {
    requestedAmount:
      roundMoney(requested),

    maximumAllowed:
      roundMoney(limited),

    acceptedAmount:
      accepted,

    remainingAmount:
      remaining,

    exceedsGoal:
      requested > remaining,

    exceedsMaximum:
      maximumPerContribution !==
        null &&
      requested >
        Number(
          maximumPerContribution
        ),
  };
};

/* ============================================================
   EXPORT CONSTANTS
============================================================ */

export {
  DEFAULT_CURRENCY,
  SUPPORTED_FREQUENCIES,
  FREQUENCY_DAYS,
  FREQUENCY_PERIODS_PER_YEAR,
  DAYS_PER_WEEK,
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  SavingCalculationServiceError,
};

/* ============================================================
   DEFAULT SERVICE EXPORT
============================================================ */

export default {
  roundMoney,
  roundPercentage,

  normalizeDate,
  normalizeCurrency,

  daysBetween,
  addDays,

  calculateRemainingAmount,
  calculateProgressPercentage,
  calculateRemainingPercentage,
  calculateAmountAfterContribution,
  hasReachedGoal,

  calculateContributionPerPeriod,
  calculateDailyContribution,
  calculateWeeklyContribution,
  calculateMonthlyContribution,

  normalizeFrequency,
  getPeriodsPerYear,
  getDaysPerPeriod,
  calculateContributionByFrequency,

  calculatePeriodsRequired,
  calculateProjectedCompletionDate,
  calculateRequiredContributionForTargetDate,

  calculateSavingPace,

  calculateExpectedProgress,
  calculateProgressVariance,

  calculateGoalHealth,
  calculateGoalSnapshot,

  calculatePercentageSaving,

  applyContributionLimit,
  calculateRemainingCapacity,
  calculateContributionCapacity,

  calculateProjectedAmount,
  calculateSavingRate,

  isContributionOnSchedule,
};