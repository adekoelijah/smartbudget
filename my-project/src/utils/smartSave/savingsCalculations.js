// utils/savingsCalculations.js

/**
 * ============================================================
 * SAVINGS CALCULATIONS
 * ============================================================
 *
 * Pure frontend financial calculation utilities for SmartSave.
 *
 * PURPOSE
 * -------
 * Provides deterministic calculations used by:
 *
 * - saving goals
 * - saving plans
 * - saving schedules
 * - savings challenges
 * - savings insights
 * - savings forecasts
 * - SmartSave dashboards
 * - safe-to-save UI
 *
 * IMPORTANT
 * ---------
 * These calculations are for frontend presentation,
 * forecasting and pre-validation.
 *
 * The backend remains the authoritative source for:
 *
 * - financial transactions
 * - contribution validation
 * - account balances
 * - execution eligibility
 * - persisted financial calculations
 *
 * This module MUST NOT:
 *
 * - call APIs
 * - access React state
 * - mutate objects
 * - access localStorage
 * - create transactions
 * - update savings records
 * - contain HTTP logic
 *
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

export const SAVING_FREQUENCIES = Object.freeze({
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
});

export const PERIODS_PER_YEAR = Object.freeze({
  daily: 365,
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
});

export const DAYS_PER_PERIOD = Object.freeze({
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 91,
  yearly: 365,
});

export const GOAL_HEALTH = Object.freeze({
  AHEAD: "ahead",
  ON_TRACK: "on_track",
  SLIGHTLY_BEHIND: "slightly_behind",
  BEHIND: "behind",
  AT_RISK: "at_risk",
});

export const DEFAULT_CALCULATION_CONFIG =
  Object.freeze({
    currency: "NGN",
    decimalPlaces: 2,
    daysPerYear: 365,
    slightlyBehindThreshold: -10,
    behindThreshold: -25,
  });

/* ============================================================
   ERROR
============================================================ */

export class SavingsCalculationError extends Error {
  constructor(
    message,
    code = "SAVINGS_CALCULATION_ERROR",
    details = null
  ) {
    super(message);

    this.name =
      "SavingsCalculationError";

    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(
      this,
      SavingsCalculationError
    );
  }
}

/* ============================================================
   NORMALIZATION
============================================================ */

export const toNumber = (
  value,
  fieldName = "Value"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new SavingsCalculationError(
      `${fieldName} must be a valid number`,
      "INVALID_NUMBER",
      {
        fieldName,
        value,
      }
    );
  }

  return number;
};

export const toNonNegativeNumber = (
  value,
  fieldName = "Value"
) => {
  const number = toNumber(
    value,
    fieldName
  );

  if (number < 0) {
    throw new SavingsCalculationError(
      `${fieldName} cannot be negative`,
      "NEGATIVE_VALUE",
      {
        fieldName,
        value,
      }
    );
  }

  return number;
};

export const normalizePercentage = (
  value,
  fieldName = "Percentage"
) => {
  const percentage = toNumber(
    value,
    fieldName
  );

  if (
    percentage < 0 ||
    percentage > 100
  ) {
    throw new SavingsCalculationError(
      `${fieldName} must be between 0 and 100`,
      "INVALID_PERCENTAGE",
      {
        fieldName,
        value,
      }
    );
  }

  return percentage;
};

export const normalizeFrequency = (
  frequency
) => {
  if (!frequency) {
    throw new SavingsCalculationError(
      "Saving frequency is required",
      "FREQUENCY_REQUIRED"
    );
  }

  const normalized =
    String(frequency)
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  const aliases = {
    day: "daily",
    days: "daily",

    week: "weekly",
    weeks: "weekly",

    bi_weekly: "biweekly",
    fortnightly: "biweekly",
    fortnight: "biweekly",

    month: "monthly",
    months: "monthly",

    quarter: "quarterly",
    quarters: "quarterly",

    year: "yearly",
    years: "yearly",
    annually: "yearly",
    annual: "yearly",
  };

  const result =
    aliases[normalized] ||
    normalized;

  if (
    !Object.prototype.hasOwnProperty.call(
      PERIODS_PER_YEAR,
      result
    )
  ) {
    throw new SavingsCalculationError(
      `Unsupported saving frequency: ${frequency}`,
      "INVALID_FREQUENCY",
      {
        frequency,
      }
    );
  }

  return result;
};

/* ============================================================
   DATE NORMALIZATION
============================================================ */

export const normalizeDate = (
  value,
  fieldName = "Date"
) => {
  if (!value) {
    throw new SavingsCalculationError(
      `${fieldName} is required`,
      "DATE_REQUIRED",
      {
        fieldName,
      }
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
    throw new SavingsCalculationError(
      `${fieldName} is invalid`,
      "INVALID_DATE",
      {
        fieldName,
        value,
      }
    );
  }

  return date;
};

export const roundMoney = (
  value,
  decimals = 2
) => {
  const number = toNumber(
    value,
    "Money value"
  );

  const factor =
    10 ** decimals;

  return (
    Math.round(
      (number + Number.EPSILON) *
        factor
    ) / factor
  );
};

export const roundPercentage = (
  value,
  decimals = 2
) => {
  const number = toNumber(
    value,
    "Percentage value"
  );

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
   BASIC GOAL CALCULATIONS
============================================================ */

export const calculateRemainingAmount = ({
  targetAmount = 0,
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
      0,
      target - current
    )
  );
};

export const calculateProgressPercentage = ({
  targetAmount = 0,
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

  if (target === 0) {
    return current >= 0
      ? 100
      : 0;
  }

  return roundPercentage(
    Math.min(
      100,
      Math.max(
        0,
        (current / target) *
          100
      )
    )
  );
};

export const calculateRemainingPercentage = ({
  targetAmount = 0,
  currentAmount = 0,
}) => {
  const progress =
    calculateProgressPercentage({
      targetAmount,
      currentAmount,
    });

  return roundPercentage(
    Math.max(
      0,
      100 - progress
    )
  );
};

/* ============================================================
   CONTRIBUTION CALCULATIONS
============================================================ */

export const calculateContributionCount = (
  contributions = []
) => {
  if (!Array.isArray(contributions)) {
    return 0;
  }

  return contributions.length;
};

export const calculateTotalContributions = (
  contributions = []
) => {
  if (!Array.isArray(contributions)) {
    return 0;
  }

  return roundMoney(
    contributions.reduce(
      (total, contribution) =>
        total +
        Math.max(
          0,
          Number(
            contribution?.amount ||
              0
          )
        ),
      0
    )
  );
};

export const calculateAverageContribution = (
  contributions = []
) => {
  if (!Array.isArray(contributions)) {
    return 0;
  }

  if (contributions.length === 0) {
    return 0;
  }

  const total =
    calculateTotalContributions(
      contributions
    );

  return roundMoney(
    total /
      contributions.length
  );
};

export const calculateLargestContribution = (
  contributions = []
) => {
  if (!Array.isArray(contributions)) {
    return 0;
  }

  return roundMoney(
    contributions.reduce(
      (largest, contribution) =>
        Math.max(
          largest,
          Number(
            contribution?.amount ||
              0
          )
        ),
      0
    )
  );
};

/* ============================================================
   DATE DIFFERENCE
============================================================ */

export const calculateDaysBetween = (
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

  const milliseconds =
    end.getTime() -
    start.getTime();

  return Math.max(
    0,
    Math.ceil(
      milliseconds /
        (1000 * 60 * 60 * 24)
    )
  );
};

export const calculateMonthsBetween = (
  startDate,
  endDate
) => {
  const days =
    calculateDaysBetween(
      startDate,
      endDate
    );

  return days / 30;
};

export const calculateYearsBetween = (
  startDate,
  endDate
) => {
  const days =
    calculateDaysBetween(
      startDate,
      endDate
    );

  return days / 365;
};

/* ============================================================
   SAVING PACE
============================================================ */

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

  const start =
    normalizeDate(
      startDate,
      "Start date"
    );

  const currentDate =
    normalizeDate(
      asOfDate,
      "Current date"
    );

  const days =
    calculateDaysBetween(
      start,
      currentDate
    );

  if (days <= 0) {
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      daysElapsed: 0,
    };
  }

  const daily =
    current / days;

  return {
    daily: roundMoney(
      daily
    ),

    weekly: roundMoney(
      daily * 7
    ),

    monthly: roundMoney(
      daily * 30
    ),

    yearly: roundMoney(
      daily * 365
    ),

    daysElapsed: days,
  };
};

/* ============================================================
   EXPECTED PROGRESS
============================================================ */

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

  const totalDays =
    calculateDaysBetween(
      start,
      target
    );

  if (totalDays <= 0) {
    return current >= target
      ? 100
      : 0;
  }

  const elapsedDays =
    calculateDaysBetween(
      start,
      current
    );

  return roundPercentage(
    Math.min(
      100,
      Math.max(
        0,
        (elapsedDays /
          totalDays) *
          100
      )
    )
  );
};

/* ============================================================
   PROGRESS VARIANCE
============================================================ */

export const calculateProgressVariance = ({
  actualProgress = 0,
  expectedProgress = 0,
}) => {
  const actual =
    normalizePercentage(
      actualProgress,
      "Actual progress"
    );

  const expected =
    normalizePercentage(
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

export const calculateGoalHealth = ({
  actualProgress = 0,
  expectedProgress = 0,
  slightlyBehindThreshold = -10,
  behindThreshold = -25,
}) => {
  const variance =
    calculateProgressVariance({
      actualProgress,
      expectedProgress,
    });

  if (variance >= 10) {
    return GOAL_HEALTH.AHEAD;
  }

  if (variance >= 0) {
    return GOAL_HEALTH.ON_TRACK;
  }

  if (
    variance >=
    slightlyBehindThreshold
  ) {
    return GOAL_HEALTH.SLIGHTLY_BEHIND;
  }

  if (
    variance >=
    behindThreshold
  ) {
    return GOAL_HEALTH.BEHIND;
  }

  return GOAL_HEALTH.AT_RISK;
};

/* ============================================================
   CONTRIBUTION REQUIREMENTS
============================================================ */

/**
 * Required total contribution from now until target.
 */
export const calculateRequiredContribution = ({
  targetAmount = 0,
  currentAmount = 0,
}) => {
  return calculateRemainingAmount({
    targetAmount,
    currentAmount,
  });
};

/**
 * Required contribution per period.
 */
export const calculateRequiredContributionPerPeriod = ({
  targetAmount = 0,
  currentAmount = 0,
  startDate,
  targetDate,
  frequency,
}) => {
  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  if (remaining <= 0) {
    return 0;
  }

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const daysRemaining =
    calculateDaysBetween(
      startDate,
      targetDate
    );

  if (daysRemaining <= 0) {
    return remaining;
  }

  const periods =
    Math.max(
      1,
      calculatePeriodsBetween(
        startDate,
        targetDate,
        normalizedFrequency
      )
    );

  return roundMoney(
    remaining / periods
  );
};

/* ============================================================
   PERIOD CALCULATIONS
============================================================ */

export const calculatePeriodsBetween = (
  startDate,
  endDate,
  frequency
) => {
  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const days =
    calculateDaysBetween(
      startDate,
      endDate
    );

  const daysPerPeriod =
    DAYS_PER_PERIOD[
      normalizedFrequency
    ];

  if (!daysPerPeriod) {
    return 0;
  }

  return Math.ceil(
    days /
      daysPerPeriod
  );
};

export const calculatePeriodsRequired = ({
  targetAmount = 0,
  currentAmount = 0,
  contributionAmount = 0,
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

  const contribution =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  const remaining =
    Math.max(
      0,
      target - current
    );

  if (remaining === 0) {
    return 0;
  }

  if (contribution <= 0) {
    return null;
  }

  return Math.ceil(
    remaining /
      contribution
  );
};

/* ============================================================
   PROJECTED COMPLETION
============================================================ */

export const calculateProjectedCompletionDate = ({
  targetAmount = 0,
  currentAmount = 0,
  contributionAmount = 0,
  frequency,
  startDate = new Date(),
}) => {
  const periods =
    calculatePeriodsRequired({
      targetAmount,
      currentAmount,
      contributionAmount,
    });

  if (
    periods === null
  ) {
    return null;
  }

  if (periods === 0) {
    return normalizeDate(
      startDate,
      "Start date"
    );
  }

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const daysPerPeriod =
    DAYS_PER_PERIOD[
      normalizedFrequency
    ];

  const start =
    normalizeDate(
      startDate,
      "Start date"
    );

  const projected =
    new Date(
      start.getTime()
    );

  projected.setDate(
    projected.getDate() +
      periods *
        daysPerPeriod
  );

  return projected;
};

/* ============================================================
   PROJECTED SAVINGS
============================================================ */

export const calculateProjectedAmount = ({
  currentAmount = 0,
  contributionAmount = 0,
  frequency,
  periods,
}) => {
  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  const contribution =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  const numberOfPeriods =
    toNonNegativeNumber(
      periods,
      "Periods"
    );

  normalizeFrequency(
    frequency
  );

  return roundMoney(
    current +
      contribution *
        numberOfPeriods
  );
};

export const calculateProjectedRemainingAmount = ({
  targetAmount = 0,
  currentAmount = 0,
  contributionAmount = 0,
  periods = 0,
}) => {
  const target =
    toNonNegativeNumber(
      targetAmount,
      "Target amount"
    );

  const projected =
    calculateProjectedAmount({
      currentAmount,
      contributionAmount,
      frequency:
        SAVING_FREQUENCIES.MONTHLY,
      periods,
    });

  return roundMoney(
    Math.max(
      0,
      target - projected
    )
  );
};

/* ============================================================
   FREQUENCY CONVERSION
============================================================ */

export const convertContributionFrequency = ({
  amount = 0,
  fromFrequency,
  toFrequency,
}) => {
  const contribution =
    toNonNegativeNumber(
      amount,
      "Contribution amount"
    );

  const from =
    normalizeFrequency(
      fromFrequency
    );

  const to =
    normalizeFrequency(
      toFrequency
    );

  const annualAmount =
    contribution *
    PERIODS_PER_YEAR[from];

  return roundMoney(
    annualAmount /
      PERIODS_PER_YEAR[to]
  );
};

/* ============================================================
   ANNUALIZED SAVING RATE
============================================================ */

export const calculateAnnualSavingAmount = ({
  contributionAmount = 0,
  frequency,
}) => {
  const amount =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  return roundMoney(
    amount *
      PERIODS_PER_YEAR[
        normalizedFrequency
      ]
  );
};

/* ============================================================
   GOAL COMPLETION
============================================================ */

export const isGoalCompleted = ({
  targetAmount = 0,
  currentAmount = 0,
  status = null,
}) => {
  const progress =
    calculateProgressPercentage({
      targetAmount,
      currentAmount,
    });

  return (
    progress >= 100 ||
    status === "completed"
  );
};

export const calculateCompletionPercentage = ({
  targetAmount = 0,
  currentAmount = 0,
}) => {
  return calculateProgressPercentage({
    targetAmount,
    currentAmount,
  });
};

/* ============================================================
   MILESTONES
============================================================ */

export const DEFAULT_SAVING_MILESTONES =
  Object.freeze([
    25,
    50,
    75,
    90,
    100,
  ]);

export const calculateReachedMilestones = ({
  progressPercentage = 0,
  milestones =
    DEFAULT_SAVING_MILESTONES,
}) => {
  const progress =
    normalizePercentage(
      progressPercentage,
      "Progress percentage"
    );

  if (!Array.isArray(milestones)) {
    return [];
  }

  return [
    ...new Set(
      milestones
        .map((milestone) =>
          Number(milestone)
        )
        .filter(
          (milestone) =>
            Number.isFinite(
              milestone
            ) &&
            milestone >= 0 &&
            milestone <= 100 &&
            progress >= milestone
        )
    ),
  ].sort(
    (a, b) => a - b
  );
};

export const calculateNextMilestone = ({
  progressPercentage = 0,
  milestones =
    DEFAULT_SAVING_MILESTONES,
}) => {
  const progress =
    normalizePercentage(
      progressPercentage,
      "Progress percentage"
    );

  if (!Array.isArray(milestones)) {
    return null;
  }

  return (
    milestones
      .map((milestone) =>
        Number(milestone)
      )
      .filter(
        (milestone) =>
          Number.isFinite(
            milestone
          ) &&
          milestone > progress &&
          milestone <= 100
      )
      .sort(
        (a, b) => a - b
      )[0] || null
  );
};

/* ============================================================
   MILESTONE AMOUNT
============================================================ */

export const calculateMilestoneAmount = ({
  targetAmount = 0,
  milestonePercentage = 0,
}) => {
  const target =
    toNonNegativeNumber(
      targetAmount,
      "Target amount"
    );

  const milestone =
    normalizePercentage(
      milestonePercentage,
      "Milestone percentage"
    );

  return roundMoney(
    target *
      (milestone / 100)
  );
};

export const calculateAmountToNextMilestone = ({
  targetAmount = 0,
  currentAmount = 0,
  progressPercentage = null,
  milestones =
    DEFAULT_SAVING_MILESTONES,
}) => {
  const progress =
    progressPercentage === null
      ? calculateProgressPercentage({
          targetAmount,
          currentAmount,
        })
      : normalizePercentage(
          progressPercentage,
          "Progress percentage"
        );

  const next =
    calculateNextMilestone({
      progressPercentage:
        progress,
      milestones,
    });

  if (next === null) {
    return {
      nextMilestone: null,
      amountRemaining: 0,
    };
  }

  const milestoneAmount =
    calculateMilestoneAmount({
      targetAmount,
      milestonePercentage:
        next,
    });

  const current =
    toNonNegativeNumber(
      currentAmount,
      "Current amount"
    );

  return {
    nextMilestone: next,

    amountRemaining:
      roundMoney(
        Math.max(
          0,
          milestoneAmount -
            current
        )
      ),
  };
};

/* ============================================================
   FORECAST
============================================================ */

export const calculateSavingsForecast = ({
  targetAmount = 0,
  currentAmount = 0,
  contributionAmount = 0,
  frequency,
  periods = 0,
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

  const contribution =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  const numberOfPeriods =
    toNonNegativeNumber(
      periods,
      "Periods"
    );

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const projectedAmount =
    calculateProjectedAmount({
      currentAmount: current,
      contributionAmount:
        contribution,
      frequency:
        normalizedFrequency,
      periods:
        numberOfPeriods,
    });

  const projectedProgress =
    calculateProgressPercentage({
      targetAmount: target,
      currentAmount:
        projectedAmount,
    });

  const remaining =
    calculateRemainingAmount({
      targetAmount: target,
      currentAmount:
        projectedAmount,
    });

  return {
    targetAmount:
      roundMoney(target),

    currentAmount:
      roundMoney(current),

    contributionAmount:
      roundMoney(contribution),

    frequency:
      normalizedFrequency,

    periods:
      numberOfPeriods,

    projectedAmount,

    projectedProgress,

    remainingAmount:
      remaining,

    projectedCompleted:
      projectedAmount >= target,
  };
};

/* ============================================================
   GOAL SNAPSHOT
============================================================ */

export const calculateGoalSnapshot = ({
  targetAmount = 0,
  currentAmount = 0,
  startDate = null,
  targetDate = null,
  asOfDate = new Date(),
}) => {
  const progress =
    calculateProgressPercentage({
      targetAmount,
      currentAmount,
    });

  const remaining =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  let expectedProgress =
    null;

  let variance = null;

  let health = null;

  if (
    startDate &&
    targetDate
  ) {
    expectedProgress =
      calculateExpectedProgress({
        startDate,
        targetDate,
        asOfDate,
      });

    variance =
      calculateProgressVariance({
        actualProgress:
          progress,
        expectedProgress,
      });

    health =
      calculateGoalHealth({
        actualProgress:
          progress,
        expectedProgress,
      });
  }

  return {
    targetAmount:
      roundMoney(
        toNonNegativeNumber(
          targetAmount,
          "Target amount"
        )
      ),

    currentAmount:
      roundMoney(
        toNonNegativeNumber(
          currentAmount,
          "Current amount"
        )
      ),

    remainingAmount:
      remaining,

    progressPercentage:
      progress,

    remainingPercentage:
      calculateRemainingPercentage({
        targetAmount,
        currentAmount,
      }),

    expectedProgress,
    variance,
    health,

    isCompleted:
      progress >= 100,
  };
};

/* ============================================================
   FORMAT HELPERS
============================================================ */

export const formatSavingPercentage = (
  value,
  decimals = 1
) => {
  return `${roundPercentage(
    value,
    decimals
  )}%`;
};

export const formatSavingFrequency = (
  frequency
) => {
  const normalized =
    normalizeFrequency(
      frequency
    );

  const labels = {
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };

  return (
    labels[normalized] ||
    normalized
  );
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  SAVING_FREQUENCIES,
  PERIODS_PER_YEAR,
  DAYS_PER_PERIOD,
  GOAL_HEALTH,
  DEFAULT_CALCULATION_CONFIG,

  SavingsCalculationError,

  DEFAULT_SAVING_MILESTONES,

  toNumber,
  toNonNegativeNumber,
  normalizePercentage,
  normalizeFrequency,
  normalizeDate,

  roundMoney,
  roundPercentage,

  calculateRemainingAmount,
  calculateProgressPercentage,
  calculateRemainingPercentage,

  calculateContributionCount,
  calculateTotalContributions,
  calculateAverageContribution,
  calculateLargestContribution,

  calculateDaysBetween,
  calculateMonthsBetween,
  calculateYearsBetween,

  calculateSavingPace,
  calculateExpectedProgress,
  calculateProgressVariance,
  calculateGoalHealth,

  calculateRequiredContribution,
  calculateRequiredContributionPerPeriod,

  calculatePeriodsBetween,
  calculatePeriodsRequired,

  calculateProjectedCompletionDate,
  calculateProjectedAmount,
  calculateProjectedRemainingAmount,

  convertContributionFrequency,
  calculateAnnualSavingAmount,

  isGoalCompleted,
  calculateCompletionPercentage,

  calculateReachedMilestones,
  calculateNextMilestone,

  calculateMilestoneAmount,
  calculateAmountToNextMilestone,

  calculateSavingsForecast,
  calculateGoalSnapshot,

  formatSavingPercentage,
  formatSavingFrequency,
};