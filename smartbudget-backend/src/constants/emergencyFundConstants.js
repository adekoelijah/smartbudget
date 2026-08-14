/**
 * ============================================================
 * EMERGENCY FUND CONSTANTS
 * ============================================================
 */

export const EMERGENCY_FUND_DEFAULTS = Object.freeze({
  targetMonths: 6,
  minimumTargetMonths: 3,
  recommendedTargetMonths: 6,
  maximumTargetMonths: 12,
  defaultCurrency: "NGN",
});

export const EMERGENCY_FUND_HEALTH = Object.freeze({
  CRITICAL: "critical",
  LOW: "low",
  FAIR: "fair",
  HEALTHY: "healthy",
  STRONG: "strong",
});

export const EMERGENCY_FUND_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  BUILDING: "building",
  HEALTHY: "healthy",
  COMPLETE: "complete",
});

export const EMERGENCY_FUND_LIMITS = Object.freeze({
  minimumMonthlyExpense: 0,
  maximumTargetMonths: 12,
  maximumMonthlyContribution: 1000000000,
});