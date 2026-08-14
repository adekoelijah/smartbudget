/**
 * ============================================================
 * EMERGENCY FUND SERVICE
 * ============================================================
 *
 * Domain service for SmartSave emergency-fund intelligence.
 *
 * RESPONSIBILITIES
 * ------------------------------------------------------------
 * - Calculate recommended emergency-fund target
 * - Calculate months of expense coverage
 * - Calculate emergency-fund progress
 * - Calculate remaining amount
 * - Calculate required contribution
 * - Calculate projected completion date
 * - Calculate emergency-fund health
 * - Produce a complete emergency-fund snapshot
 *
 * THIS SERVICE MUST NOT
 * ------------------------------------------------------------
 * - Access MongoDB directly
 * - Modify transactions
 * - Modify saving goals
 * - Create financial records
 * - Execute payments
 *
 * Persistence/orchestration belongs to controllers and
 * persistence services.
 * ============================================================
 */

import {
  roundMoney,
  roundPercentage,
  calculateRemainingAmount,
  calculateProgressPercentage,
  calculateRequiredContributionForTargetDate,
  calculateProjectedCompletionDate,
  calculateSavingRate,
  normalizeDate,
} from "./savingCalculationService.js";

import {
  EMERGENCY_FUND_DEFAULTS,
  EMERGENCY_FUND_HEALTH,
  EMERGENCY_FUND_STATUS,
  EMERGENCY_FUND_LIMITS,
} from "../constants/emergencyFundConstants.js";

/* ============================================================
   LOCAL HELPERS
============================================================ */

const toNumber = (
  value,
  fieldName,
  {
    allowZero = true,
  } = {}
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(
      `${fieldName} must be a valid number`
    );
  }

  if (!allowZero && number <= 0) {
    throw new Error(
      `${fieldName} must be greater than zero`
    );
  }

  if (number < 0) {
    throw new Error(
      `${fieldName} cannot be negative`
    );
  }

  return number;
};

const clamp = (
  value,
  minimum,
  maximum
) =>
  Math.min(
    maximum,
    Math.max(minimum, value)
  );

/* ============================================================
   TARGET MONTHS
============================================================ */

export const normalizeTargetMonths = (
  value
) => {
  const months =
    value === undefined ||
    value === null ||
    value === ""
      ? EMERGENCY_FUND_DEFAULTS.targetMonths
      : toNumber(
          value,
          "Target months",
          { allowZero: false }
        );

  if (
    months <
    EMERGENCY_FUND_DEFAULTS.minimumTargetMonths
  ) {
    return EMERGENCY_FUND_DEFAULTS.minimumTargetMonths;
  }

  return Math.min(
    months,
    EMERGENCY_FUND_LIMITS.maximumTargetMonths
  );
};

/* ============================================================
   TARGET CALCULATION
============================================================ */

export const calculateEmergencyFundTarget = ({
  monthlyEssentialExpenses,
  targetMonths = EMERGENCY_FUND_DEFAULTS.targetMonths,
}) => {
  const expenses = toNumber(
    monthlyEssentialExpenses,
    "Monthly essential expenses"
  );

  const months =
    normalizeTargetMonths(
      targetMonths
    );

  return roundMoney(
    expenses * months
  );
};

/* ============================================================
   MONTHS COVERED
============================================================ */

export const calculateMonthsCovered = ({
  currentFund = 0,
  monthlyEssentialExpenses,
}) => {
  const fund = toNumber(
    currentFund,
    "Current emergency fund"
  );

  const expenses = toNumber(
    monthlyEssentialExpenses,
    "Monthly essential expenses",
    { allowZero: false }
  );

  return Number(
    (fund / expenses).toFixed(2)
  );
};

/* ============================================================
   FUND HEALTH
============================================================ */

export const calculateEmergencyFundHealth = ({
  monthsCovered,
  targetMonths,
}) => {
  const covered = toNumber(
    monthsCovered,
    "Months covered"
  );

  const target = normalizeTargetMonths(
    targetMonths
  );

  const ratio =
    target > 0
      ? covered / target
      : 0;

  if (covered < 1) {
    return {
      health: EMERGENCY_FUND_HEALTH.CRITICAL,
      status: EMERGENCY_FUND_STATUS.NOT_STARTED,
      score: 10,
      label: "Critical",
      message:
        "Your emergency fund currently provides less than one month of essential expenses.",
    };
  }

  if (ratio < 0.5) {
    return {
      health: EMERGENCY_FUND_HEALTH.LOW,
      status: EMERGENCY_FUND_STATUS.BUILDING,
      score: 30,
      label: "Low",
      message:
        "Your emergency fund is still below a comfortable safety buffer.",
    };
  }

  if (ratio < 0.75) {
    return {
      health: EMERGENCY_FUND_HEALTH.FAIR,
      status: EMERGENCY_FUND_STATUS.BUILDING,
      score: 55,
      label: "Fair",
      message:
        "Your emergency fund is growing, but more coverage is recommended.",
    };
  }

  if (covered < target) {
    return {
      health: EMERGENCY_FUND_HEALTH.HEALTHY,
      status: EMERGENCY_FUND_STATUS.HEALTHY,
      score: 80,
      label: "Healthy",
      message:
        "Your emergency fund provides a strong financial buffer.",
    };
  }

  if (covered >= target) {
    return {
      health: EMERGENCY_FUND_HEALTH.STRONG,
      status: EMERGENCY_FUND_STATUS.COMPLETE,
      score: 100,
      label: "Strong",
      message:
        "Your emergency fund has reached your recommended safety target.",
    };
  }

  return {
    health: EMERGENCY_FUND_HEALTH.FAIR,
    status: EMERGENCY_FUND_STATUS.BUILDING,
    score: 55,
    label: "Fair",
    message:
      "Continue building your emergency fund.",
  };
};

/* ============================================================
   RECOMMENDED CONTRIBUTION
============================================================ */

export const calculateRecommendedEmergencyContribution = ({
  currentFund = 0,
  targetAmount,
  monthsToTarget = 6,
}) => {
  const current = toNumber(
    currentFund,
    "Current emergency fund"
  );

  const target = toNumber(
    targetAmount,
    "Emergency fund target",
    { allowZero: false }
  );

  const months = toNumber(
    monthsToTarget,
    "Months to target",
    { allowZero: false }
  );

  const remaining =
    Math.max(
      target - current,
      0
    );

  return roundMoney(
    remaining / months
  );
};

/* ============================================================
   PROJECTED COMPLETION
============================================================ */

export const calculateEmergencyFundProjection = ({
  currentFund = 0,
  targetAmount,
  monthlyContribution,
  startDate = new Date(),
}) => {
  const current = toNumber(
    currentFund,
    "Current emergency fund"
  );

  const target = toNumber(
    targetAmount,
    "Emergency fund target",
    { allowZero: false }
  );

  const contribution = toNumber(
    monthlyContribution,
    "Monthly contribution",
    { allowZero: false }
  );

  const remaining =
    Math.max(
      target - current,
      0
    );

  if (remaining <= 0) {
    return {
      contributionsRequired: 0,
      projectedCompletionDate:
        normalizeDate(startDate),
    };
  }

  const contributionsRequired =
    Math.ceil(
      remaining /
        contribution
    );

  const projectedCompletionDate =
    calculateProjectedCompletionDate({
      targetAmount: target,
      currentAmount: current,
      contributionAmount: contribution,
      frequency: "monthly",
      startDate,
    });

  return {
    contributionsRequired,
    projectedCompletionDate,
  };
};

/* ============================================================
   COMPLETE SNAPSHOT
============================================================ */

export const calculateEmergencyFundSnapshot = ({
  monthlyEssentialExpenses,
  currentFund = 0,
  targetMonths = EMERGENCY_FUND_DEFAULTS.targetMonths,
  monthlyContribution = 0,
  monthlyIncome = 0,
  targetDate = null,
  startDate = new Date(),
  asOfDate = new Date(),
  currency = EMERGENCY_FUND_DEFAULTS.defaultCurrency,
}) => {
  const expenses = toNumber(
    monthlyEssentialExpenses,
    "Monthly essential expenses",
    { allowZero: false }
  );

  const current = toNumber(
    currentFund,
    "Current emergency fund"
  );

  const contribution = toNumber(
    monthlyContribution,
    "Monthly contribution"
  );

  const income = toNumber(
    monthlyIncome,
    "Monthly income"
  );

  const months =
    normalizeTargetMonths(
      targetMonths
    );

  const targetAmount =
    calculateEmergencyFundTarget({
      monthlyEssentialExpenses:
        expenses,
      targetMonths: months,
    });

  const remainingAmount =
    calculateRemainingAmount({
      targetAmount,
      currentAmount: current,
    });

  const progressPercentage =
    calculateProgressPercentage({
      targetAmount,
      currentAmount: current,
    });

  const monthsCovered =
    calculateMonthsCovered({
      currentFund: current,
      monthlyEssentialExpenses:
        expenses,
    });

  const health =
    calculateEmergencyFundHealth({
      monthsCovered,
      targetMonths: months,
    });

  const recommendedContribution =
    calculateRecommendedEmergencyContribution({
      currentFund: current,
      targetAmount,
      monthsToTarget: months,
    });

  const projection =
    contribution > 0
      ? calculateEmergencyFundProjection({
          currentFund: current,
          targetAmount,
          monthlyContribution:
            contribution,
          startDate,
        })
      : null;

  const savingRate =
    income > 0
      ? calculateSavingRate({
          savedAmount:
            contribution,
          incomeAmount:
            income,
        })
      : 0;

  let targetDateContribution =
    null;

  if (targetDate) {
    targetDateContribution =
      calculateRequiredContributionForTargetDate({
        targetAmount,
        currentAmount: current,
        targetDate,
        startDate,
        frequency: "monthly",
      });
  }

  const remainingMonths =
    Math.max(
      targetAmount > 0
        ? remainingAmount /
            Math.max(
              contribution,
              1
            )
        : 0,
      0
    );

  return {
    currency,

    monthlyEssentialExpenses:
      roundMoney(expenses),

    currentFund:
      roundMoney(current),

    targetMonths: months,

    targetAmount,

    remainingAmount,

    progressPercentage,

    monthsCovered,

    remainingMonths:
      Number(
        remainingMonths.toFixed(2)
      ),

    monthlyContribution:
      roundMoney(contribution),

    recommendedContribution,

    targetDateContribution,

    monthlyIncome:
      roundMoney(income),

    savingRate,

    health: health.health,

    healthLabel:
      health.label,

    healthScore:
      health.score,

    healthMessage:
      health.message,

    status:
      health.status,

    isComplete:
      current >= targetAmount,

    projection,

    asOfDate:
      normalizeDate(asOfDate),
  };
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  normalizeTargetMonths,
  calculateEmergencyFundTarget,
  calculateMonthsCovered,
  calculateEmergencyFundHealth,
  calculateRecommendedEmergencyContribution,
  calculateEmergencyFundProjection,
  calculateEmergencyFundSnapshot,
};