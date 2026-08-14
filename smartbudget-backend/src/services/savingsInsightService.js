// services/savingInsightService.js

/**
 * ============================================================
 * SAVING INSIGHT SERVICE
 * ============================================================
 *
 * Read-only intelligence/orchestration service for SmartBudget.
 *
 * Responsibilities:
 *
 * - Analyze saving goals
 * - Analyze saving progress
 * - Analyze saving pace
 * - Analyze contribution behaviour
 * - Detect saving risks
 * - Generate actionable recommendations
 * - Generate milestone insights
 * - Generate goal-level insight summaries
 * - Generate dashboard-level saving insights
 *
 * IMPORTANT:
 *
 * This service MUST NOT:
 *
 * - Create database records
 * - Update database records
 * - Delete database records
 * - Execute financial transactions
 * - Modify SavingGoal
 * - Modify SavingContribution
 * - Modify SavingExecution
 * - Modify SavingSchedule
 * - Modify AutoSave
 * - Modify SavingsChallenge
 *
 * Database access belongs to the appropriate service layer.
 *
 * Calculations belong to:
 *
 *   savingCalculationService.js
 *
 * Plan calculations belong to:
 *
 *   savingPlanService.js
 *
 * Challenge calculations belong to:
 *
 *   savingsChallengeService.js
 *
 * This service combines those outputs into user-facing
 * financial intelligence.
 *
 * ============================================================
 */

import {
  calculateRemainingAmount,
  calculateProgressPercentage,
  calculateRemainingPercentage,
  calculateSavingPace,
  calculateExpectedProgress,
  calculateProgressVariance,
  calculateGoalHealth,
  calculatePeriodsRequired,
  calculateProjectedCompletionDate,
  roundMoney,
  roundPercentage,
  normalizeFrequency,
} from "./savingCalculationService.js";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_CURRENCY = "NGN";

const INSIGHT_TYPES = {
  PROGRESS: "progress",
  PACE: "pace",
  HEALTH: "health",
  RISK: "risk",
  MILESTONE: "milestone",
  CONTRIBUTION: "contribution",
  COMPLETION: "completion",
  RECOMMENDATION: "recommendation",
};

const INSIGHT_SEVERITY = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
};

const MILESTONES = [
  25,
  50,
  75,
  90,
  100,
];

const RISK_THRESHOLDS = {
  SLIGHTLY_BEHIND: -10,
  BEHIND: -25,
};

const MAX_INSIGHTS = 20;

/* ============================================================
   ERROR CLASS
============================================================ */

class SavingInsightServiceError extends Error {
  constructor(
    message,
    statusCode = 400,
    code = "SAVING_INSIGHT_ERROR",
    details = null
  ) {
    super(message);

    this.name = "SavingInsightServiceError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(
      this,
      SavingInsightServiceError
    );
  }
}

/* ============================================================
   NORMALIZATION HELPERS
============================================================ */

const toNumber = (
  value,
  fieldName = "Value"
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new SavingInsightServiceError(
      `${fieldName} must be a valid number`,
      400,
      "INVALID_NUMBER"
    );
  }

  return number;
};

const toNonNegativeNumber = (
  value,
  fieldName = "Value"
) => {
  const number = toNumber(
    value,
    fieldName
  );

  if (number < 0) {
    throw new SavingInsightServiceError(
      `${fieldName} cannot be negative`,
      400,
      "NEGATIVE_VALUE"
    );
  }

  return number;
};

const normalizeDate = (
  value,
  fieldName = "Date"
) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SavingInsightServiceError(
      `${fieldName} is invalid`,
      400,
      "INVALID_DATE"
    );
  }

  return date;
};

const normalizeCurrency = (
  currency = DEFAULT_CURRENCY
) => {
  const normalized = String(
    currency || DEFAULT_CURRENCY
  )
    .trim()
    .toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new SavingInsightServiceError(
      "Currency must be a valid 3-letter currency code",
      400,
      "INVALID_CURRENCY"
    );
  }

  return normalized;
};

const normalizeGoal = (goal) => {
  if (!goal || typeof goal !== "object") {
    throw new SavingInsightServiceError(
      "Saving goal is required",
      400,
      "GOAL_REQUIRED"
    );
  }

  return goal;
};

/* ============================================================
   INSIGHT FACTORY
============================================================ */

const createInsight = ({
  type,
  severity = INSIGHT_SEVERITY.INFO,
  title,
  message,
  recommendation = null,
  priority = 0,
  metadata = {},
}) => ({
  type,
  severity,
  title,
  message,
  recommendation,
  priority,
  metadata,
});

/* ============================================================
   GOAL SNAPSHOT
============================================================ */

/**
 * Creates the normalized financial state used by the rest
 * of the insight engine.
 */
export const buildGoalInsightSnapshot = ({
  goal,
  asOfDate = new Date(),
}) => {
  normalizeGoal(goal);

  const targetAmount = toNonNegativeNumber(
    goal.targetAmount,
    "Target amount"
  );

  const currentAmount = toNonNegativeNumber(
    goal.currentAmount ?? 0,
    "Current amount"
  );

  const startDate = goal.startDate
    ? normalizeDate(
        goal.startDate,
        "Start date"
      )
    : null;

  const targetDate = goal.targetDate
    ? normalizeDate(
        goal.targetDate,
        "Target date"
      )
    : null;

  const currentDate = normalizeDate(
    asOfDate,
    "Current date"
  );

  const remainingAmount =
    calculateRemainingAmount({
      targetAmount,
      currentAmount,
    });

  const progressPercentage =
    calculateProgressPercentage({
      targetAmount,
      currentAmount,
    });

  const remainingPercentage =
    calculateRemainingPercentage({
      targetAmount,
      currentAmount,
    });

  return {
    targetAmount: roundMoney(
      targetAmount
    ),

    currentAmount: roundMoney(
      currentAmount
    ),

    remainingAmount,

    progressPercentage,

    remainingPercentage,

    currency: normalizeCurrency(
      goal.currency
    ),

    status:
      goal.status || "active",

    goalType:
      goal.goalType || "target",

    category:
      goal.category || "personal",

    priority:
      goal.priority || "medium",

    frequency:
      goal.contributionFrequency
        ? normalizeFrequency(
            goal.contributionFrequency
          )
        : null,

    startDate,

    targetDate,

    asOfDate: currentDate,

    isCompleted:
      progressPercentage >= 100 ||
      goal.status === "completed",

    isPaused:
      goal.status === "paused",

    isCancelled:
      goal.status === "cancelled",

    isExpired:
      goal.status === "expired",
  };
};

/* ============================================================
   PROGRESS INSIGHTS
============================================================ */

export const generateProgressInsights = ({
  snapshot,
}) => {
  const insights = [];

  if (
    snapshot.isCompleted ||
    snapshot.progressPercentage >= 100
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.PROGRESS,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title: "Goal completed",
        message:
          "You have reached your savings target.",
        recommendation:
          "Consider creating a new savings goal or redirecting future contributions toward another priority.",
        priority: 100,
        metadata: {
          progress:
            snapshot.progressPercentage,
        },
      })
    );

    return insights;
  }

  if (
    snapshot.progressPercentage >= 90
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.PROGRESS,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title: "Almost there",
        message:
          `You are ${snapshot.progressPercentage}% of the way to your goal.`,
        recommendation:
          "Maintain your current saving behaviour to finish the goal.",
        priority: 90,
        metadata: {
          progress:
            snapshot.progressPercentage,
          remaining:
            snapshot.remainingAmount,
        },
      })
    );

    return insights;
  }

  if (
    snapshot.progressPercentage >= 75
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.PROGRESS,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title: "Strong progress",
        message:
          `You have completed ${snapshot.progressPercentage}% of your savings target.`,
        recommendation:
          "Keep your contribution schedule consistent.",
        priority: 70,
        metadata: {
          progress:
            snapshot.progressPercentage,
        },
      })
    );

    return insights;
  }

  if (
    snapshot.progressPercentage >= 50
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.PROGRESS,
        severity:
          INSIGHT_SEVERITY.INFO,
        title: "Halfway there",
        message:
          `You have saved ${snapshot.progressPercentage}% of your target.`,
        recommendation:
          "Continue following your saving plan to maintain momentum.",
        priority: 60,
        metadata: {
          progress:
            snapshot.progressPercentage,
        },
      })
    );

    return insights;
  }

  if (
    snapshot.progressPercentage >= 25
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.PROGRESS,
        severity:
          INSIGHT_SEVERITY.INFO,
        title: "Good start",
        message:
          `You have reached ${snapshot.progressPercentage}% of your savings target.`,
        recommendation:
          "Consistency is more important than large occasional contributions.",
        priority: 40,
        metadata: {
          progress:
            snapshot.progressPercentage,
        },
      })
    );

    return insights;
  }

  insights.push(
    createInsight({
      type: INSIGHT_TYPES.PROGRESS,
      severity:
        INSIGHT_SEVERITY.INFO,
      title: "Goal just getting started",
      message:
        `You have saved ${snapshot.progressPercentage}% of your target.`,
      recommendation:
        "Focus on establishing a consistent contribution routine.",
      priority: 20,
      metadata: {
        progress:
          snapshot.progressPercentage,
      },
    })
  );

  return insights;
};

/* ============================================================
   PACE INSIGHTS
============================================================ */

export const generatePaceInsights = ({
  snapshot,
}) => {
  if (!snapshot.startDate) {
    return [];
  }

  const pace =
    calculateSavingPace({
      currentAmount:
        snapshot.currentAmount,
      startDate:
        snapshot.startDate,
      asOfDate:
        snapshot.asOfDate,
    });

  if (pace.daily <= 0) {
    return [
      createInsight({
        type: INSIGHT_TYPES.PACE,
        severity:
          INSIGHT_SEVERITY.WARNING,
        title: "Saving pace has not started",
        message:
          "There is currently no recorded saving pace for this goal.",
        recommendation:
          "Make your first contribution and establish a consistent saving routine.",
        priority: 80,
        metadata: {
          pace,
        },
      }),
    ];
  }

  return [
    createInsight({
      type: INSIGHT_TYPES.PACE,
      severity:
        INSIGHT_SEVERITY.INFO,
      title: "Current saving pace",
      message:
        `Your current saving pace is approximately ${pace.monthly} per month.`,
      recommendation:
        "Use this pace as a baseline when reviewing whether your target date is realistic.",
      priority: 30,
      metadata: {
        pace,
      },
    }),
  ];
};

/* ============================================================
   TARGET DATE INSIGHTS
============================================================ */

export const generateTargetDateInsights = ({
  snapshot,
}) => {
  if (
    !snapshot.startDate ||
    !snapshot.targetDate
  ) {
    return [];
  }

  if (snapshot.isCompleted) {
    return [];
  }

  const expectedProgress =
    calculateExpectedProgress({
      startDate:
        snapshot.startDate,
      targetDate:
        snapshot.targetDate,
      asOfDate:
        snapshot.asOfDate,
    });

  const variance =
    calculateProgressVariance({
      actualProgress:
        snapshot.progressPercentage,
      expectedProgress,
    });

  const health =
    calculateGoalHealth({
      actualProgress:
        snapshot.progressPercentage,
      expectedProgress,
    });

  const insights = [];

  if (variance >= 10) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.HEALTH,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title: "Ahead of schedule",
        message:
          `You are ${Math.abs(variance)} percentage points ahead of the expected progress.`,
        recommendation:
          "Maintain your current contribution behaviour.",
        priority: 90,
        metadata: {
          expectedProgress,
          actualProgress:
            snapshot.progressPercentage,
          variance,
          health,
        },
      })
    );
  } else if (variance >= 0) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.HEALTH,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title: "On track",
        message:
          "Your savings progress is currently aligned with your target date.",
        recommendation:
          "Keep your contributions consistent.",
        priority: 70,
        metadata: {
          expectedProgress,
          actualProgress:
            snapshot.progressPercentage,
          variance,
          health,
        },
      })
    );
  } else if (
    variance >=
    RISK_THRESHOLDS.SLIGHTLY_BEHIND
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.RISK,
        severity:
          INSIGHT_SEVERITY.WARNING,
        title: "Slightly behind schedule",
        message:
          `Your progress is ${Math.abs(variance)} percentage points behind the expected pace.`,
        recommendation:
          "Consider increasing your contribution slightly or making an additional contribution.",
        priority: 80,
        metadata: {
          expectedProgress,
          actualProgress:
            snapshot.progressPercentage,
          variance,
          health,
        },
      })
    );
  } else if (
    variance >=
    RISK_THRESHOLDS.BEHIND
  ) {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.RISK,
        severity:
          INSIGHT_SEVERITY.WARNING,
        title: "Behind schedule",
        message:
          `Your savings progress is ${Math.abs(variance)} percentage points behind the expected pace.`,
        recommendation:
          "Review your contribution amount and consider increasing the frequency or amount of future contributions.",
        priority: 95,
        metadata: {
          expectedProgress,
          actualProgress:
            snapshot.progressPercentage,
          variance,
          health,
        },
      })
    );
  } else {
    insights.push(
      createInsight({
        type: INSIGHT_TYPES.RISK,
        severity:
          INSIGHT_SEVERITY.CRITICAL,
        title: "Goal at risk",
        message:
          `Your savings progress is ${Math.abs(variance)} percentage points behind the expected pace.`,
        recommendation:
          "Reassess the contribution plan and target date before the goal becomes difficult to achieve.",
        priority: 100,
        metadata: {
          expectedProgress,
          actualProgress:
            snapshot.progressPercentage,
          variance,
          health,
        },
      })
    );
  }

  return insights;
};

/* ============================================================
   CONTRIBUTION INSIGHTS
============================================================ */

export const generateContributionInsights = ({
  snapshot,
  contributionCount = 0,
  averageContribution = 0,
  largestContribution = 0,
  }) => {
  const count =
    toNonNegativeNumber(
      contributionCount,
      "Contribution count"
    );

  const average =
    toNonNegativeNumber(
      averageContribution,
      "Average contribution"
    );

  const largest =
    toNonNegativeNumber(
      largestContribution,
      "Largest contribution"
    );

  const insights = [];

  if (count === 0) {
    insights.push(
      createInsight({
        type:
          INSIGHT_TYPES.CONTRIBUTION,
        severity:
          INSIGHT_SEVERITY.WARNING,
        title:
          "No contributions recorded",
        message:
          "This goal does not have any completed contributions yet.",
        recommendation:
          "Make your first contribution to establish momentum.",
        priority: 85,
      })
    );

    return insights;
  }

  insights.push(
    createInsight({
      type:
        INSIGHT_TYPES.CONTRIBUTION,
      severity:
        INSIGHT_SEVERITY.INFO,
      title:
        "Contribution activity",
      message:
        `You have made ${count} completed contribution${count === 1 ? "" : "s"}.`,
      recommendation:
        average > 0
          ? `Your average contribution is ${roundMoney(average)}.`
          : "Continue contributing consistently.",
      priority: 25,
      metadata: {
        contributionCount: count,
        averageContribution:
          roundMoney(average),
        largestContribution:
          roundMoney(largest),
      },
    })
  );

  return insights;
};

/* ============================================================
   MILESTONE INSIGHTS
============================================================ */

export const calculateReachedMilestones = ({
  progressPercentage,
}) => {
  const progress =
    toNonNegativeNumber(
      progressPercentage,
      "Progress percentage"
    );

  return MILESTONES.filter(
    (milestone) =>
      progress >= milestone
  );
};

export const calculateNextMilestone = ({
  progressPercentage,
}) => {
  const progress =
    toNonNegativeNumber(
      progressPercentage,
      "Progress percentage"
    );

  return (
    MILESTONES.find(
      (milestone) =>
        milestone > progress
    ) || null
  );
};

export const generateMilestoneInsights = ({
  snapshot,
}) => {
  const reached =
    calculateReachedMilestones({
      progressPercentage:
        snapshot.progressPercentage,
    });

  const next =
    calculateNextMilestone({
      progressPercentage:
        snapshot.progressPercentage,
    });

  const insights = [];

  if (reached.length > 0) {
    const latest =
      reached[reached.length - 1];

    insights.push(
      createInsight({
        type:
          INSIGHT_TYPES.MILESTONE,
        severity:
          latest >= 100
            ? INSIGHT_SEVERITY.SUCCESS
            : INSIGHT_SEVERITY.INFO,
        title:
          `${latest}% milestone reached`,
        message:
          `You have reached the ${latest}% milestone for this goal.`,
        recommendation:
          next
            ? `Your next milestone is ${next}%.`
            : "You have reached the final milestone.",
        priority:
          latest >= 90 ? 75 : 35,
        metadata: {
          reachedMilestones:
            reached,
          nextMilestone:
            next,
        },
      })
    );
  }

  return insights;
};

/* ============================================================
   COMPLETION PROJECTION
============================================================ */

export const calculateCompletionInsight = ({
  snapshot,
  contributionAmount,
  frequency,
}) => {
  if (
    snapshot.isCompleted
  ) {
    return null;
  }

  if (
    !contributionAmount ||
    !frequency
  ) {
    return null;
  }

  const contribution =
    toNonNegativeNumber(
      contributionAmount,
      "Contribution amount"
    );

  if (contribution <= 0) {
    return null;
  }

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  const periods =
    calculatePeriodsRequired({
      targetAmount:
        snapshot.targetAmount,
      currentAmount:
        snapshot.currentAmount,
      contributionAmount:
        contribution,
    });

  const projectedCompletionDate =
    calculateProjectedCompletionDate({
      targetAmount:
        snapshot.targetAmount,
      currentAmount:
        snapshot.currentAmount,
      contributionAmount:
        contribution,
      frequency:
        normalizedFrequency,
      startDate:
        snapshot.asOfDate,
    });

  return {
    contributionAmount:
      roundMoney(contribution),

    frequency:
      normalizedFrequency,

    periodsRequired:
      periods,

    projectedCompletionDate,
  };
};

export const generateCompletionInsights = ({
  snapshot,
  contributionAmount,
  frequency,
}) => {
  const projection =
    calculateCompletionInsight({
      snapshot,
      contributionAmount,
      frequency,
    });

  if (!projection) {
    return [];
  }

  return [
    createInsight({
      type:
        INSIGHT_TYPES.COMPLETION,
      severity:
        INSIGHT_SEVERITY.INFO,
      title:
        "Projected completion",
      message:
        `At ${roundMoney(projection.contributionAmount)} ${projection.frequency}, the goal requires approximately ${projection.periodsRequired} contribution${projection.periodsRequired === 1 ? "" : "s"}.`,
      recommendation:
        "Keep this contribution level consistent to stay close to the projected completion timeline.",
      priority: 45,
      metadata: projection,
    }),
  ];
};

/* ============================================================
   GOAL RECOMMENDATIONS
============================================================ */

export const generateGoalRecommendations = ({
  snapshot,
  contributionAmount = null,
  frequency = null,
}) => {
  const recommendations = [];

  if (snapshot.isCompleted) {
    recommendations.push(
      createInsight({
        type:
          INSIGHT_TYPES.RECOMMENDATION,
        severity:
          INSIGHT_SEVERITY.SUCCESS,
        title:
          "Choose your next financial target",
        message:
          "This savings goal is complete.",
        recommendation:
          "Consider redirecting the same saving capacity toward your next important goal.",
        priority: 70,
      })
    );

    return recommendations;
  }

  if (
    snapshot.isPaused
  ) {
    recommendations.push(
      createInsight({
        type:
          INSIGHT_TYPES.RECOMMENDATION,
        severity:
          INSIGHT_SEVERITY.WARNING,
        title:
          "Resume your saving plan",
        message:
          "This goal is currently paused.",
        recommendation:
          "Resume contributions when your cash flow allows.",
        priority: 90,
      })
    );
  }

  if (
    snapshot.remainingAmount > 0 &&
    snapshot.progressPercentage < 25
  ) {
    recommendations.push(
      createInsight({
        type:
          INSIGHT_TYPES.RECOMMENDATION,
        severity:
          INSIGHT_SEVERITY.INFO,
        title:
          "Build consistency first",
        message:
          "The goal is still in its early stage.",
        recommendation:
          "Prioritize regular contributions rather than waiting for large lump-sum contributions.",
        priority: 50,
      })
    );
  }

  if (
    contributionAmount &&
    frequency
  ) {
    const projection =
      calculateCompletionInsight({
        snapshot,
        contributionAmount,
        frequency,
      });

    if (projection) {
      recommendations.push(
        createInsight({
          type:
            INSIGHT_TYPES.RECOMMENDATION,
          severity:
            INSIGHT_SEVERITY.INFO,
          title:
            "Maintain your contribution plan",
          message:
            `Your current plan is ${roundMoney(projection.contributionAmount)} ${projection.frequency}.`,
          recommendation:
            "Review this amount periodically as your income and expenses change.",
          priority: 30,
          metadata: projection,
        })
      );
    }
  }

  return recommendations;
};

/* ============================================================
   GOAL INSIGHT ENGINE
============================================================ */

/**
 * Generate all relevant insights for a single goal.
 *
 * This function is intentionally deterministic.
 */
export const generateGoalInsights = ({
  goal,
  asOfDate = new Date(),
  contributionCount = 0,
  averageContribution = 0,
  largestContribution = 0,
  contributionAmount = null,
  frequency = null,
}) => {
  const snapshot =
    buildGoalInsightSnapshot({
      goal,
      asOfDate,
    });

  const insights = [
    ...generateProgressInsights({
      snapshot,
    }),

    ...generatePaceInsights({
      snapshot,
    }),

    ...generateTargetDateInsights({
      snapshot,
    }),

    ...generateContributionInsights({
      snapshot,
      contributionCount,
      averageContribution,
      largestContribution,
    }),

    ...generateMilestoneInsights({
      snapshot,
    }),

    ...generateCompletionInsights({
      snapshot,
      contributionAmount,
      frequency,
    }),

    ...generateGoalRecommendations({
      snapshot,
      contributionAmount,
      frequency,
    }),
  ];

  insights.sort(
    (a, b) =>
      b.priority - a.priority
  );

  return {
    snapshot,

    insights:
      insights.slice(
        0,
        MAX_INSIGHTS
      ),
  };
};

/* ============================================================
   DASHBOARD INSIGHTS
============================================================ */

/**
 * Generate portfolio-level saving intelligence.
 *
 * Expected goal structure:
 *
 * [
 *   {
 *     goal,
 *     contributionCount,
 *     averageContribution,
 *     largestContribution,
 *     contributionAmount,
 *     frequency
 *   }
 * ]
 */
export const generateDashboardSavingInsights = ({
  goals = [],
  asOfDate = new Date(),
}) => {
  if (!Array.isArray(goals)) {
    throw new SavingInsightServiceError(
      "Goals must be an array",
      400,
      "INVALID_GOALS"
    );
  }

  const normalizedDate =
    normalizeDate(
      asOfDate,
      "Current date"
    );

  const goalResults =
    goals.map((item) =>
      generateGoalInsights({
        goal: item.goal || item,
        asOfDate:
          normalizedDate,
        contributionCount:
          item.contributionCount || 0,
        averageContribution:
          item.averageContribution || 0,
        largestContribution:
          item.largestContribution || 0,
        contributionAmount:
          item.contributionAmount ||
          null,
        frequency:
          item.frequency || null,
      })
    );

  const allInsights =
    goalResults.flatMap(
      (result) =>
        result.insights
    );

  const completedGoals =
    goalResults.filter(
      (result) =>
        result.snapshot.isCompleted
    ).length;

  const activeGoals =
    goalResults.filter(
      (result) =>
        result.snapshot.status ===
        "active"
    ).length;

  const atRiskGoals =
    goalResults.filter(
      (result) =>
        result.insights.some(
          (insight) =>
            insight.type ===
              INSIGHT_TYPES.RISK &&
            insight.severity ===
              INSIGHT_SEVERITY.CRITICAL
        )
    ).length;

  const behindGoals =
    goalResults.filter(
      (result) =>
        result.insights.some(
          (insight) =>
            insight.type ===
              INSIGHT_TYPES.RISK
        )
    ).length;

  allInsights.sort(
    (a, b) =>
      b.priority - a.priority
  );

  return {
    summary: {
      totalGoals:
        goalResults.length,

      activeGoals,

      completedGoals,

      atRiskGoals,

      goalsWithRisk:
        behindGoals,
    },

    insights:
      allInsights.slice(
        0,
        MAX_INSIGHTS
      ),

    goals:
      goalResults,
  };
};

/* ============================================================
   TOP INSIGHT
============================================================ */

export const getTopSavingInsight = ({
  insights = [],
}) => {
  if (!Array.isArray(insights)) {
    throw new SavingInsightServiceError(
      "Insights must be an array",
      400,
      "INVALID_INSIGHTS"
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return [...insights].sort(
    (a, b) =>
      (b.priority || 0) -
      (a.priority || 0)
  )[0];
};

/* ============================================================
   INSIGHT COUNTS
============================================================ */

export const summarizeInsights = ({
  insights = [],
}) => {
  if (!Array.isArray(insights)) {
    throw new SavingInsightServiceError(
      "Insights must be an array",
      400,
      "INVALID_INSIGHTS"
    );
  }

  const summary = {
    total: insights.length,

    info: 0,

    success: 0,

    warning: 0,

    critical: 0,

    progress: 0,

    pace: 0,

    health: 0,

    risk: 0,

    milestone: 0,

    contribution: 0,

    completion: 0,

    recommendation: 0,
  };

  insights.forEach(
    (insight) => {
      if (
        Object.prototype.hasOwnProperty.call(
          summary,
          insight.severity
        )
      ) {
        summary[
          insight.severity
        ] += 1;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          summary,
          insight.type
        )
      ) {
        summary[
          insight.type
        ] += 1;
      }
    }
  );

  return summary;
};

/* ============================================================
   EXPORT ERROR
============================================================ */

export {
  SavingInsightServiceError,
  INSIGHT_TYPES,
  INSIGHT_SEVERITY,
  MILESTONES,
};

/* ============================================================
   DEFAULT SERVICE EXPORT
============================================================ */

export default {
  buildGoalInsightSnapshot,

  generateProgressInsights,
  generatePaceInsights,
  generateTargetDateInsights,

  generateContributionInsights,

  calculateReachedMilestones,
  calculateNextMilestone,
  generateMilestoneInsights,

  calculateCompletionInsight,
  generateCompletionInsights,

  generateGoalRecommendations,

  generateGoalInsights,
  generateDashboardSavingInsights,

  getTopSavingInsight,
  summarizeInsights,
};