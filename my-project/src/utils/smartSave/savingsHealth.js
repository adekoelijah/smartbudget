// utils/savingsHealth.js

/**
 * ============================================================
 * SMARTSAVE — SAVINGS HEALTH
 * ============================================================
 *
 * Pure financial-health utilities for the SmartSave frontend.
 *
 * Responsibilities:
 * - Evaluate savings health
 * - Normalize financial metrics
 * - Calculate health scores
 * - Classify health status
 * - Identify strengths
 * - Identify risks
 * - Generate recommendations
 * - Compare health snapshots
 *
 * This module MUST remain pure.
 *
 * It does NOT:
 * - call APIs
 * - access React state
 * - mutate input objects
 * - fetch backend data
 * - perform network requests
 *
 * Financial calculations that belong to forecasting or
 * contribution planning should remain in:
 *
 *   savingsCalculations.js
 *   savingsForecast.js
 *
 * API communication belongs to:
 *
 *   smartSaveService.js
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

export const SAVINGS_HEALTH_STATUS = Object.freeze({
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  AT_RISK: "at_risk",
  CRITICAL: "critical",
  UNKNOWN: "unknown",
});

export const SAVINGS_HEALTH_THRESHOLDS = Object.freeze({
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 50,
  AT_RISK: 30,
});

export const SAVINGS_HEALTH_WEIGHTS = Object.freeze({
  SAVINGS_RATE: 25,
  GOAL_PROGRESS: 25,
  CONSISTENCY: 20,
  EMERGENCY_FUND: 20,
  AFFORDABILITY: 10,
});

/* ============================================================
   INTERNAL HELPERS
============================================================ */

/**
 * Safely convert a value to a finite number.
 */
const toNumber = (value, fallback = 0) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/,/g, "")
      .trim();

    if (!cleaned) return fallback;

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  return fallback;
};

/**
 * Clamp a value between min and max.
 */
const clamp = (
  value,
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(min, toNumber(value))
  );

/**
 * Normalize a percentage.
 *
 * Supports:
 * 75     -> 75
 * 0.75   -> 75
 */
const normalizePercentage = (value) => {
  const number = toNumber(value);

  if (Math.abs(number) <= 1) {
    return clamp(number * 100);
  }

  return clamp(number);
};

/**
 * Normalize ratio.
 *
 * Supports:
 * 0.75 -> 0.75
 * 75   -> 0.75
 */
const normalizeRatio = (value) => {
  const number = toNumber(value);

  if (Math.abs(number) > 1) {
    return clamp(number / 100, 0, 1);
  }

  return clamp(number, 0, 1);
};

/**
 * Normalize an optional boolean.
 */
const normalizeBoolean = (
  value,
  fallback = false
) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return fallback;
};

/**
 * Round to a specific number of decimal places.
 */
const round = (
  value,
  decimals = 2
) => {
  const factor = 10 ** decimals;

  return (
    Math.round(
      toNumber(value) * factor
    ) / factor
  );
};

/* ============================================================
   INPUT NORMALIZATION
============================================================ */

/**
 * Normalize the metrics used by the health engine.
 *
 * Supported fields:
 *
 * savingsRate
 * goalProgress
 * consistency
 * emergencyFundProgress
 * affordability
 * monthlyIncome
 * monthlyExpenses
 * monthlySavings
 * targetAmount
 * currentAmount
 * emergencyFund
 * emergencyFundTarget
 * completedContributions
 * expectedContributions
 */
export const normalizeSavingsHealthInput = (
  input = {}
) => {
  const data =
    input &&
    typeof input === "object"
      ? input
      : {};

  const monthlyIncome = Math.max(
    0,
    toNumber(data.monthlyIncome)
  );

  const monthlyExpenses = Math.max(
    0,
    toNumber(data.monthlyExpenses)
  );

  const monthlySavings = Math.max(
    0,
    toNumber(
      data.monthlySavings ??
        data.monthlyContribution
    )
  );

  const currentAmount = Math.max(
    0,
    toNumber(
      data.currentAmount ??
        data.currentSavings ??
        data.savedAmount
    )
  );

  const targetAmount = Math.max(
    0,
    toNumber(
      data.targetAmount ??
        data.savingsTarget ??
        data.goalTarget
    )
  );

  const emergencyFund = Math.max(
    0,
    toNumber(
      data.emergencyFund ??
        data.emergencyFundAmount
    )
  );

  const emergencyFundTarget = Math.max(
    0,
    toNumber(
      data.emergencyFundTarget ??
        data.emergencyTarget
    )
  );

  const completedContributions = Math.max(
    0,
    toNumber(
      data.completedContributions
    )
  );

  const expectedContributions = Math.max(
    0,
    toNumber(
      data.expectedContributions
    )
  );

  const calculatedSavingsRate =
    monthlyIncome > 0
      ? (monthlySavings / monthlyIncome) * 100
      : 0;

  const calculatedGoalProgress =
    targetAmount > 0
      ? (currentAmount / targetAmount) * 100
      : 0;

  const calculatedConsistency =
    expectedContributions > 0
      ? (completedContributions /
          expectedContributions) *
        100
      : 0;

  const calculatedEmergencyProgress =
    emergencyFundTarget > 0
      ? (emergencyFund /
          emergencyFundTarget) *
        100
      : 0;

  const calculatedAffordability =
    monthlyIncome > 0
      ? ((monthlyIncome -
          monthlyExpenses) /
          monthlyIncome) *
        100
      : 0;

  return Object.freeze({
    savingsRate: normalizePercentage(
      data.savingsRate ??
        calculatedSavingsRate
    ),

    goalProgress: normalizePercentage(
      data.goalProgress ??
        calculatedGoalProgress
    ),

    consistency: normalizePercentage(
      data.consistency ??
        calculatedConsistency
    ),

    emergencyFundProgress:
      normalizePercentage(
        data.emergencyFundProgress ??
          calculatedEmergencyProgress
      ),

    affordability: normalizePercentage(
      data.affordability ??
        calculatedAffordability
    ),

    monthlyIncome,

    monthlyExpenses,

    monthlySavings,

    currentAmount,

    targetAmount,

    emergencyFund,

    emergencyFundTarget,

    completedContributions,

    expectedContributions,

    hasIncomeData: monthlyIncome > 0,

    hasGoalData: targetAmount > 0,

    hasEmergencyFundData:
      emergencyFundTarget > 0,

    hasContributionData:
      expectedContributions > 0,
  });
};

/* ============================================================
   INDIVIDUAL HEALTH SCORES
============================================================ */

/**
 * Score savings rate.
 *
 * General scoring model:
 *
 * 20%+ = excellent
 * 15%  = strong
 * 10%  = moderate
 * 5%   = weak
 * <5%  = poor
 */
export const scoreSavingsRate = (
  savingsRate
) => {
  const rate =
    normalizePercentage(savingsRate);

  if (rate >= 20) return 100;
  if (rate >= 15) return 90;
  if (rate >= 10) return 75;
  if (rate >= 5) return 50;

  return clamp(rate * 10);
};

/**
 * Score goal progress.
 */
export const scoreGoalProgress = (
  progress
) => {
  const value =
    normalizePercentage(progress);

  if (value >= 100) return 100;
  if (value >= 80) return 95;
  if (value >= 60) return 85;
  if (value >= 40) return 70;
  if (value >= 20) return 50;

  return clamp(value * 2.5);
};

/**
 * Score contribution consistency.
 */
export const scoreConsistency = (
  consistency
) => {
  const value =
    normalizePercentage(consistency);

  if (value >= 95) return 100;
  if (value >= 85) return 90;
  if (value >= 75) return 80;
  if (value >= 60) return 65;
  if (value >= 40) return 45;

  return clamp(value);
};

/**
 * Score emergency fund progress.
 */
export const scoreEmergencyFund = (
  progress
) => {
  const value =
    normalizePercentage(progress);

  if (value >= 100) return 100;
  if (value >= 75) return 90;
  if (value >= 50) return 75;
  if (value >= 25) return 55;
  if (value > 0) return 30;

  return 0;
};

/**
 * Score affordability.
 *
 * Affordability represents the amount of income remaining
 * after essential expenses, expressed as a percentage.
 */
export const scoreAffordability = (
  affordability
) => {
  const value =
    normalizePercentage(affordability);

  if (value >= 30) return 100;
  if (value >= 20) return 90;
  if (value >= 15) return 80;
  if (value >= 10) return 65;
  if (value >= 5) return 45;

  return 20;
};

/* ============================================================
   COMPONENT SCORE
============================================================ */

/**
 * Calculate weighted health components.
 */
export const calculateHealthComponents = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  return Object.freeze({
    savingsRate: round(
      scoreSavingsRate(
        metrics.savingsRate
      )
    ),

    goalProgress: round(
      scoreGoalProgress(
        metrics.goalProgress
      )
    ),

    consistency: round(
      scoreConsistency(
        metrics.consistency
      )
    ),

    emergencyFund: round(
      scoreEmergencyFund(
        metrics.emergencyFundProgress
      )
    ),

    affordability: round(
      scoreAffordability(
        metrics.affordability
      ),
    ),
  });
};

/* ============================================================
   OVERALL HEALTH SCORE
============================================================ */

/**
 * Calculate weighted overall savings health.
 *
 * Returns a score from 0–100.
 */
export const calculateSavingsHealthScore = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const components =
    calculateHealthComponents(metrics);

  const weights =
    SAVINGS_HEALTH_WEIGHTS;

  const score =
    components.savingsRate *
      (weights.SAVINGS_RATE / 100) +
    components.goalProgress *
      (weights.GOAL_PROGRESS / 100) +
    components.consistency *
      (weights.CONSISTENCY / 100) +
    components.emergencyFund *
      (weights.EMERGENCY_FUND / 100) +
    components.affordability *
      (weights.AFFORDABILITY / 100);

  /*
   * If there is almost no financial information,
   * do not pretend the user's health is genuinely measurable.
   */
  const availableSignals = [
    metrics.hasIncomeData,
    metrics.hasGoalData,
    metrics.hasEmergencyFundData,
    metrics.hasContributionData,
  ].filter(Boolean).length;

  if (availableSignals === 0) {
    return null;
  }

  return round(
    clamp(score),
    0
  );
};

/* ============================================================
   HEALTH STATUS
============================================================ */

/**
 * Convert score into health status.
 */
export const getSavingsHealthStatus = (
  score
) => {
  if (
    score === null ||
    score === undefined ||
    !Number.isFinite(
      Number(score)
    )
  ) {
    return SAVINGS_HEALTH_STATUS.UNKNOWN;
  }

  const value = clamp(score);

  if (
    value >=
    SAVINGS_HEALTH_THRESHOLDS.EXCELLENT
  ) {
    return SAVINGS_HEALTH_STATUS.EXCELLENT;
  }

  if (
    value >=
    SAVINGS_HEALTH_THRESHOLDS.GOOD
  ) {
    return SAVINGS_HEALTH_STATUS.GOOD;
  }

  if (
    value >=
    SAVINGS_HEALTH_THRESHOLDS.FAIR
  ) {
    return SAVINGS_HEALTH_STATUS.FAIR;
  }

  if (
    value >=
    SAVINGS_HEALTH_THRESHOLDS.AT_RISK
  ) {
    return SAVINGS_HEALTH_STATUS.AT_RISK;
  }

  return SAVINGS_HEALTH_STATUS.CRITICAL;
};

/**
 * Human-readable health label.
 */
export const getSavingsHealthLabel = (
  status
) => {
  const labels = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    at_risk: "At Risk",
    critical: "Critical",
    unknown: "Not Enough Data",
  };

  return (
    labels[status] ??
    "Not Enough Data"
  );
};

/* ============================================================
   HEALTH SUMMARY
============================================================ */

/**
 * Generate a complete health assessment.
 */
export const calculateSavingsHealth = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const components =
    calculateHealthComponents(metrics);

  const score =
    calculateSavingsHealthScore(metrics);

  const status =
    getSavingsHealthStatus(score);

  return Object.freeze({
    score,

    status,

    label:
      getSavingsHealthLabel(status),

    components,

    metrics,
  });
};

/* ============================================================
   STRENGTHS
============================================================ */

/**
 * Identify strong areas.
 */
export const getSavingsHealthStrengths = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const strengths = [];

  if (metrics.savingsRate >= 20) {
    strengths.push({
      key: "savings_rate",
      title: "Strong savings rate",
      message:
        "You are consistently directing a strong portion of your income toward savings.",
      score: scoreSavingsRate(
        metrics.savingsRate
      ),
    });
  }

  if (metrics.goalProgress >= 80) {
    strengths.push({
      key: "goal_progress",
      title: "Strong goal progress",
      message:
        "You are making substantial progress toward your savings target.",
      score: scoreGoalProgress(
        metrics.goalProgress
      ),
    });
  }

  if (metrics.consistency >= 85) {
    strengths.push({
      key: "consistency",
      title: "Excellent consistency",
      message:
        "Your savings contributions are highly consistent.",
      score: scoreConsistency(
        metrics.consistency
      ),
    });
  }

  if (metrics.emergencyFundProgress >= 75) {
    strengths.push({
      key: "emergency_fund",
      title: "Healthy emergency fund",
      message:
        "Your emergency savings provide a strong financial buffer.",
      score: scoreEmergencyFund(
        metrics.emergencyFundProgress
      ),
    });
  }

  if (metrics.affordability >= 20) {
    strengths.push({
      key: "affordability",
      title: "Good savings capacity",
      message:
        "Your current income-to-expense position provides room for saving.",
      score: scoreAffordability(
        metrics.affordability
      ),
    });
  }

  return strengths;
};

/* ============================================================
   RISKS
============================================================ */

/**
 * Identify financial-health risks.
 */
export const getSavingsHealthRisks = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const risks = [];

  if (
    metrics.hasIncomeData &&
    metrics.savingsRate < 5
  ) {
    risks.push({
      key: "low_savings_rate",
      severity: "high",
      title: "Low savings rate",
      message:
        "Your current savings rate is relatively low compared with your income.",
    });
  }

  if (
    metrics.hasGoalData &&
    metrics.goalProgress < 25
  ) {
    risks.push({
      key: "slow_goal_progress",
      severity: "medium",
      title: "Goal progress is slow",
      message:
        "Your current progress may require a higher or more consistent contribution.",
    });
  }

  if (
    metrics.hasContributionData &&
    metrics.consistency < 60
  ) {
    risks.push({
      key: "inconsistent_saving",
      severity: "high",
      title: "Inconsistent saving",
      message:
        "Several expected contributions may not have been completed.",
    });
  }

  if (
    metrics.hasEmergencyFundData &&
    metrics.emergencyFundProgress < 25
  ) {
    risks.push({
      key: "low_emergency_fund",
      severity: "high",
      title: "Emergency fund needs attention",
      message:
        "Your emergency fund is still below a meaningful portion of its target.",
    });
  }

  if (
    metrics.hasIncomeData &&
    metrics.affordability < 5
  ) {
    risks.push({
      key: "low_affordability",
      severity: "critical",
      title: "Limited savings capacity",
      message:
        "Most of your income is currently being absorbed by expenses.",
    });
  }

  return risks;
};

/* ============================================================
   RECOMMENDATIONS
============================================================ */

/**
 * Generate practical recommendations.
 */
export const getSavingsHealthRecommendations = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const recommendations = [];

  if (
    metrics.hasIncomeData &&
    metrics.savingsRate < 10
  ) {
    recommendations.push({
      key: "increase_savings_rate",
      priority: "high",
      title: "Increase your savings rate",
      message:
        "Consider gradually increasing your automatic savings contribution.",
    });
  }

  if (
    metrics.hasContributionData &&
    metrics.consistency < 75
  ) {
    recommendations.push({
      key: "improve_consistency",
      priority: "high",
      title: "Improve contribution consistency",
      message:
        "An automatic saving schedule can help reduce missed contributions.",
    });
  }

  if (
    metrics.hasEmergencyFundData &&
    metrics.emergencyFundProgress < 50
  ) {
    recommendations.push({
      key: "build_emergency_fund",
      priority: "high",
      title: "Strengthen your emergency fund",
      message:
        "Prioritize building your emergency reserve before increasing discretionary saving targets.",
    });
  }

  if (
    metrics.hasGoalData &&
    metrics.goalProgress < 50
  ) {
    recommendations.push({
      key: "review_goal",
      priority: "medium",
      title: "Review your savings goal",
      message:
        "Consider checking whether your target and contribution schedule are realistic for your current capacity.",
    });
  }

  if (
    metrics.hasIncomeData &&
    metrics.affordability < 15
  ) {
    recommendations.push({
      key: "review_expenses",
      priority: "high",
      title: "Review your expenses",
      message:
        "Reducing avoidable expenses may create more room for consistent saving.",
    });
  }

  if (
    recommendations.length === 0
  ) {
    recommendations.push({
      key: "maintain_progress",
      priority: "low",
      title: "Maintain your current strategy",
      message:
        "Your current savings indicators are healthy. Continue monitoring your progress.",
    });
  }

  return recommendations;
};

/* ============================================================
   HEALTH TREND
============================================================ */

/**
 * Compare two health scores.
 */
export const compareSavingsHealth = (
  currentScore,
  previousScore
) => {
  const current =
    toNumber(currentScore);

  const previous =
    toNumber(previousScore);

  const change =
    round(
      current - previous,
      0
    );

  let direction = "stable";

  if (change > 0) {
    direction = "improving";
  }

  if (change < 0) {
    direction = "declining";
  }

  return Object.freeze({
    current,
    previous,
    change,
    direction,
  });
};

/**
 * Determine whether health is improving.
 */
export const isHealthImproving = (
  currentScore,
  previousScore
) =>
  toNumber(currentScore) >
  toNumber(previousScore);

/**
 * Determine whether health is declining.
 */
export const isHealthDeclining = (
  currentScore,
  previousScore
) =>
  toNumber(currentScore) <
  toNumber(previousScore);

/* ============================================================
   HEALTH COLOR / UI SEMANTICS
============================================================ */

/**
 * Return semantic UI key.
 *
 * Components can map this key to the application's own
 * design tokens/classes.
 *
 * No Tailwind classes are hard-coded here.
 */
export const getSavingsHealthTone = (
  status
) => {
  switch (status) {
    case SAVINGS_HEALTH_STATUS.EXCELLENT:
      return "positive";

    case SAVINGS_HEALTH_STATUS.GOOD:
      return "positive";

    case SAVINGS_HEALTH_STATUS.FAIR:
      return "neutral";

    case SAVINGS_HEALTH_STATUS.AT_RISK:
      return "warning";

    case SAVINGS_HEALTH_STATUS.CRITICAL:
      return "negative";

    default:
      return "neutral";
  }
};

/* ============================================================
   VALIDATION
============================================================ */

/**
 * Determine whether enough information exists to calculate
 * a meaningful savings-health score.
 */
export const hasSavingsHealthData = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  return Boolean(
    metrics.hasIncomeData ||
      metrics.hasGoalData ||
      metrics.hasContributionData ||
      metrics.hasEmergencyFundData
  );
};

/**
 * Validate health input.
 */
export const validateSavingsHealthInput = (
  input = {}
) => {
  const metrics =
    normalizeSavingsHealthInput(input);

  const warnings = [];

  if (!metrics.hasIncomeData) {
    warnings.push(
      "Monthly income data is unavailable."
    );
  }

  if (!metrics.hasGoalData) {
    warnings.push(
      "Savings goal data is unavailable."
    );
  }

  if (!metrics.hasContributionData) {
    warnings.push(
      "Contribution consistency data is unavailable."
    );
  }

  if (!metrics.hasEmergencyFundData) {
    warnings.push(
      "Emergency fund target data is unavailable."
    );
  }

  return Object.freeze({
    valid: hasSavingsHealthData(
      metrics
    ),
    warnings,
    metrics,
  });
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

const savingsHealth = Object.freeze({
  normalizeSavingsHealthInput,

  scoreSavingsRate,
  scoreGoalProgress,
  scoreConsistency,
  scoreEmergencyFund,
  scoreAffordability,

  calculateHealthComponents,
  calculateSavingsHealthScore,
  getSavingsHealthStatus,
  getSavingsHealthLabel,
  calculateSavingsHealth,

  getSavingsHealthStrengths,
  getSavingsHealthRisks,
  getSavingsHealthRecommendations,

  compareSavingsHealth,
  isHealthImproving,
  isHealthDeclining,

  getSavingsHealthTone,

  hasSavingsHealthData,
  validateSavingsHealthInput,
});

export default savingsHealth;