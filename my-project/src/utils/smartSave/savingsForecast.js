/**
 * savingsForecast.js
 *
 * Pure frontend utilities for SmartSave forecasting.
 *
 * IMPORTANT:
 * - No API calls
 * - No React state
 * - No mutation
 * - No backend business-rule duplication
 * - No dependency on browser APIs
 *
 * Backend/service calculations remain authoritative.
 */

/* =========================================================
   CONSTANTS
========================================================= */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

const MIN_AMOUNT = 0;


/* =========================================================
   INTERNAL NORMALIZERS
========================================================= */

/**
 * Convert a value to a finite number.
 */
const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


/**
 * Return a non-negative number.
 */
const nonNegative = (value, fallback = 0) =>
  Math.max(
    MIN_AMOUNT,
    toNumber(value, fallback)
  );


/**
 * Safely convert a date-like value to Date.
 */
const toDate = (value, fallback = new Date()) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  return new Date(fallback);
};


/**
 * Round monetary/forecast values.
 */
const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return Math.round(
    toNumber(value) * factor
  ) / factor;
};


/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Difference between two dates in days.
 */
export const differenceInDays = (
  startDate,
  endDate
) => {
  const start = toDate(startDate);
  const end = toDate(endDate);

  return Math.max(
    0,
    Math.ceil(
      (end.getTime() - start.getTime()) /
        MS_PER_DAY
    )
  );
};


/**
 * Add days to a date.
 */
export const addDays = (
  date,
  days
) => {
  const result = toDate(date);

  result.setDate(
    result.getDate() +
      Math.max(
        0,
        Math.floor(
          toNumber(days)
        )
      )
  );

  return result;
};


/* =========================================================
   SAVINGS PROGRESS
========================================================= */

/**
 * Calculate savings progress percentage.
 *
 * Example:
 * target = 100000
 * current = 25000
 * result = 25
 */
export const calculateProgress = ({
  currentAmount = 0,
  targetAmount = 0,
} = {}) => {
  const current = nonNegative(currentAmount);
  const target = nonNegative(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return round(
    Math.min(
      100,
      (current / target) * 100
    )
  );
};


/**
 * Calculate remaining amount.
 */
export const calculateRemainingAmount = ({
  currentAmount = 0,
  targetAmount = 0,
} = {}) => {
  const current = nonNegative(currentAmount);
  const target = nonNegative(targetAmount);

  return round(
    Math.max(
      0,
      target - current
    )
  );
};


/* =========================================================
   REQUIRED SAVINGS RATE
========================================================= */

/**
 * Calculate required daily savings.
 */
export const calculateRequiredDailySavings = ({
  currentAmount = 0,
  targetAmount = 0,
  remainingDays = 0,
} = {}) => {
  const remaining = calculateRemainingAmount({
    currentAmount,
    targetAmount,
  });

  const days = Math.max(
    0,
    Math.ceil(
      toNumber(remainingDays)
    )
  );

  if (remaining <= 0) {
    return 0;
  }

  if (days <= 0) {
    return remaining;
  }

  return round(
    remaining / days
  );
};


/**
 * Calculate required weekly savings.
 */
export const calculateRequiredWeeklySavings = ({
  currentAmount = 0,
  targetAmount = 0,
  remainingDays = 0,
} = {}) => {
  const daily = calculateRequiredDailySavings({
    currentAmount,
    targetAmount,
    remainingDays,
  });

  return round(
    daily * DAYS_PER_WEEK
  );
};


/**
 * Calculate required monthly savings.
 */
export const calculateRequiredMonthlySavings = ({
  currentAmount = 0,
  targetAmount = 0,
  remainingDays = 0,
} = {}) => {
  const daily = calculateRequiredDailySavings({
    currentAmount,
    targetAmount,
    remainingDays,
  });

  return round(
    daily * DAYS_PER_MONTH
  );
};


/* =========================================================
   SAVINGS RATE
========================================================= */

/**
 * Calculate average daily savings rate.
 */
export const calculateAverageDailySavings = ({
  savedAmount = 0,
  elapsedDays = 0,
} = {}) => {
  const amount = nonNegative(savedAmount);

  const days = Math.max(
    0,
    Math.ceil(
      toNumber(elapsedDays)
    )
  );

  if (amount <= 0 || days <= 0) {
    return 0;
  }

  return round(
    amount / days
  );
};


/**
 * Calculate average weekly savings.
 */
export const calculateAverageWeeklySavings = ({
  savedAmount = 0,
  elapsedDays = 0,
} = {}) => {
  const daily = calculateAverageDailySavings({
    savedAmount,
    elapsedDays,
  });

  return round(
    daily * DAYS_PER_WEEK
  );
};


/**
 * Calculate average monthly savings.
 */
export const calculateAverageMonthlySavings = ({
  savedAmount = 0,
  elapsedDays = 0,
} = {}) => {
  const daily = calculateAverageDailySavings({
    savedAmount,
    elapsedDays,
  });

  return round(
    daily * DAYS_PER_MONTH
  );
};


/* =========================================================
   ETA / TIME TO GOAL
========================================================= */

/**
 * Estimate number of days required to reach a goal.
 */
export const estimateDaysToGoal = ({
  currentAmount = 0,
  targetAmount = 0,
  dailySavings = 0,
} = {}) => {
  const remaining = calculateRemainingAmount({
    currentAmount,
    targetAmount,
  });

  const daily = nonNegative(dailySavings);

  if (remaining <= 0) {
    return 0;
  }

  if (daily <= 0) {
    return null;
  }

  return Math.ceil(
    remaining / daily
  );
};


/**
 * Estimate goal completion date.
 *
 * Returns null when the goal cannot currently be projected.
 */
export const estimateGoalDate = ({
  currentAmount = 0,
  targetAmount = 0,
  dailySavings = 0,
  startDate = new Date(),
} = {}) => {
  const days = estimateDaysToGoal({
    currentAmount,
    targetAmount,
    dailySavings,
  });

  if (days === null) {
    return null;
  }

  return addDays(
    startDate,
    days
  );
};


/* =========================================================
   TARGET DATE FORECAST
========================================================= */

/**
 * Calculate the daily savings required to hit
 * a specific target date.
 */
export const calculateDailySavingsForTargetDate = ({
  currentAmount = 0,
  targetAmount = 0,
  targetDate,
  startDate = new Date(),
} = {}) => {
  const remaining = calculateRemainingAmount({
    currentAmount,
    targetAmount,
  });

  if (remaining <= 0) {
    return 0;
  }

  const days = differenceInDays(
    startDate,
    targetDate
  );

  return calculateRequiredDailySavings({
    currentAmount,
    targetAmount,
    remainingDays: days,
  });
};


/* =========================================================
   PROJECTION
========================================================= */

/**
 * Project future savings using a fixed savings rate.
 */
export const projectSavings = ({
  currentAmount = 0,
  dailySavings = 0,
  days = 0,
  targetAmount = null,
} = {}) => {
  const current = nonNegative(currentAmount);
  const daily = nonNegative(dailySavings);

  const periodDays = Math.max(
    0,
    Math.floor(
      toNumber(days)
    )
  );

  const projectedAmount = round(
    current +
      daily * periodDays
  );

  const target =
    targetAmount === null
      ? null
      : nonNegative(targetAmount);

  const remaining =
    target === null
      ? null
      : round(
          Math.max(
            0,
            target - projectedAmount
          )
        );

  const progress =
    target === null
      ? null
      : calculateProgress({
          currentAmount:
            projectedAmount,
          targetAmount:
            target,
        });

  return {
    currentAmount: round(current),
    dailySavings: round(daily),
    days: periodDays,
    projectedAmount,
    targetAmount: target,
    remainingAmount: remaining,
    progress,
  };
};


/* =========================================================
   SHORTFALL / SURPLUS
========================================================= */

/**
 * Compare actual savings rate with required rate.
 */
export const calculateSavingsGap = ({
  actualDailySavings = 0,
  requiredDailySavings = 0,
} = {}) => {
  const actual =
    nonNegative(actualDailySavings);

  const required =
    nonNegative(requiredDailySavings);

  const gap = round(
    actual - required
  );

  return {
    actualDailySavings: round(actual),
    requiredDailySavings: round(required),
    gap,
    shortfall: round(
      Math.max(
        0,
        required - actual
      )
    ),
    surplus: round(
      Math.max(
        0,
        actual - required
      )
    ),
    isOnTrack: actual >= required,
  };
};


/* =========================================================
   ON-TRACK ANALYSIS
========================================================= */

/**
 * Determine whether a savings goal is on track.
 *
 * This is a frontend projection only.
 */
export const calculateOnTrackStatus = ({
  currentAmount = 0,
  targetAmount = 0,
  targetDate,
  dailySavings = 0,
  asOfDate = new Date(),
} = {}) => {
  const remaining =
    calculateRemainingAmount({
      currentAmount,
      targetAmount,
    });

  if (remaining <= 0) {
    return {
      isOnTrack: true,
      status: "completed",
      requiredDailySavings: 0,
      actualDailySavings:
        round(nonNegative(dailySavings)),
      shortfall: 0,
      projectedCompletionDate:
        toDate(asOfDate),
    };
  }

  const requiredDailySavings =
    calculateDailySavingsForTargetDate({
      currentAmount,
      targetAmount,
      targetDate,
      startDate: asOfDate,
    });

  const gap =
    calculateSavingsGap({
      actualDailySavings:
        dailySavings,
      requiredDailySavings,
    });

  const projectedCompletionDate =
    estimateGoalDate({
      currentAmount,
      targetAmount,
      dailySavings,
      startDate: asOfDate,
    });

  return {
    isOnTrack: gap.isOnTrack,
    status: gap.isOnTrack
      ? "on_track"
      : "behind",
    requiredDailySavings:
      round(requiredDailySavings),
    actualDailySavings:
      round(
        nonNegative(dailySavings)
      ),
    shortfall: gap.shortfall,
    surplus: gap.surplus,
    projectedCompletionDate,
  };
};


/* =========================================================
   FORECAST SUMMARY
========================================================= */

/**
 * Build a complete frontend forecast.
 *
 * This function intentionally does not call the API.
 */
export const buildSavingsForecast = ({
  currentAmount = 0,
  targetAmount = 0,
  targetDate = null,
  dailySavings = 0,
  startDate = new Date(),
} = {}) => {
  const current =
    nonNegative(currentAmount);

  const target =
    nonNegative(targetAmount);

  const daily =
    nonNegative(dailySavings);

  const remaining =
    calculateRemainingAmount({
      currentAmount: current,
      targetAmount: target,
    });

  const progress =
    calculateProgress({
      currentAmount: current,
      targetAmount: target,
    });

  const daysToGoal =
    estimateDaysToGoal({
      currentAmount: current,
      targetAmount: target,
      dailySavings: daily,
    });

  const projectedCompletionDate =
    estimateGoalDate({
      currentAmount: current,
      targetAmount: target,
      dailySavings: daily,
      startDate,
    });

  const requiredDailySavings =
    targetDate
      ? calculateDailySavingsForTargetDate({
          currentAmount: current,
          targetAmount: target,
          targetDate,
          startDate,
        })
      : 0;

  const gap =
    targetDate
      ? calculateSavingsGap({
          actualDailySavings: daily,
          requiredDailySavings,
        })
      : null;

  return {
    currentAmount: round(current),
    targetAmount: round(target),
    remainingAmount: remaining,
    progress,

    dailySavings: round(daily),

    weeklySavings:
      round(
        daily * DAYS_PER_WEEK
      ),

    monthlySavings:
      round(
        daily * DAYS_PER_MONTH
      ),

    requiredDailySavings:
      round(requiredDailySavings),

    requiredWeeklySavings:
      round(
        requiredDailySavings *
          DAYS_PER_WEEK
      ),

    requiredMonthlySavings:
      round(
        requiredDailySavings *
          DAYS_PER_MONTH
      ),

    daysToGoal,

    projectedCompletionDate,

    targetDate:
      targetDate
        ? toDate(targetDate)
        : null,

    savingsGap: gap,

    isComplete:
      remaining <= 0,

    isFundable:
      daily > 0,
  };
};


/* =========================================================
   FORECAST PERIODS
========================================================= */

/**
 * Generate simple future forecast points.
 *
 * Useful for charts.
 */
export const generateForecastPoints = ({
  currentAmount = 0,
  dailySavings = 0,
  periods = 6,
  intervalDays = DAYS_PER_MONTH,
} = {}) => {
  const current =
    nonNegative(currentAmount);

  const daily =
    nonNegative(dailySavings);

  const count = Math.max(
    0,
    Math.floor(
      toNumber(periods)
    )
  );

  const interval = Math.max(
    1,
    Math.floor(
      toNumber(intervalDays)
    )
  );

  return Array.from(
    { length: count + 1 },
    (_, index) => {
      const days =
        index * interval;

      return {
        period: index,
        days,
        amount: round(
          current +
            daily * days
        ),
      };
    }
  );
};


/* =========================================================
   EXPORT DEFAULT SERVICE
========================================================= */

const savingsForecast = {
  differenceInDays,
  addDays,

  calculateProgress,
  calculateRemainingAmount,

  calculateRequiredDailySavings,
  calculateRequiredWeeklySavings,
  calculateRequiredMonthlySavings,

  calculateAverageDailySavings,
  calculateAverageWeeklySavings,
  calculateAverageMonthlySavings,

  estimateDaysToGoal,
  estimateGoalDate,

  calculateDailySavingsForTargetDate,

  projectSavings,

  calculateSavingsGap,

  calculateOnTrackStatus,

  buildSavingsForecast,

  generateForecastPoints,
};

export default savingsForecast;