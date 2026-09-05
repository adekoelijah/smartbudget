// components/.../SavingPlanStats.js

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  memo,
  useId,
  useMemo,
} from "react";

import {
  getSavingPlanCurrency,
  getSavingPlanTargetAmount,
  getSavingPlanTargetDate,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanAmount,
  formatSavingPlanDate,
  formatSavingPlanProgress,
  formatSavingPlanRemainingDays,
} from "../../../../utils/smartSave/savingPlanFormatters";

/**
 * SavingPlanStats
 *
 * Presentational statistics component for a saving plan.
 *
 * Responsibilities:
 * - Display aggregate saving-plan statistics
 * - Display current saved amount
 * - Display target amount
 * - Display remaining amount
 * - Display progress
 * - Display contribution count
 * - Display average contribution
 * - Display target date
 * - Display remaining days
 *
 * This component intentionally does NOT:
 * - Fetch data
 * - Call APIs
 * - Update parent state
 * - Use effects
 * - Perform financial business logic
 * - Calculate authoritative financial statistics
 *
 * The backend/service layer remains the source of truth.
 */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
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

const toNonNegativeNumber = (value) => {
  const numericValue = toFiniteNumber(value);

  if (numericValue === null) {
    return null;
  }

  return Math.max(0, numericValue);
};

const clampPercentage = (value) => {
  const numericValue = toFiniteNumber(value);

  if (numericValue === null) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, numericValue),
  );
};

const firstFiniteValue = (...values) => {
  for (const value of values) {
    const numericValue = toFiniteNumber(value);

    if (numericValue !== null) {
      return numericValue;
    }
  }

  return null;
};

const getStatisticsValue = (
  statistics,
  ...keys
) => {
  if (
    !statistics ||
    typeof statistics !== "object"
  ) {
    return null;
  }

  for (const key of keys) {
    const value = statistics[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const getCurrentAmount = (
  plan,
  statistics,
  explicitValue,
) => {
  const explicit =
    toNonNegativeNumber(explicitValue);

  if (explicit !== null) {
    return explicit;
  }

  const statisticsValue =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "currentAmount",
        "savedAmount",
        "amountSaved",
        "totalSaved",
        "totalAmountSaved",
      ),
      statistics?.totals?.currentAmount,
      statistics?.totals?.savedAmount,
      statistics?.summary?.currentAmount,
      statistics?.summary?.savedAmount,
    );

  if (statisticsValue !== null) {
    return Math.max(0, statisticsValue);
  }

  return (
    toNonNegativeNumber(
      plan?.currentAmount,
    ) ??
    toNonNegativeNumber(
      plan?.savedAmount,
    ) ??
    toNonNegativeNumber(
      plan?.amountSaved,
    ) ??
    0
  );
};

const getTargetAmount = (
  plan,
  statistics,
  explicitValue,
) => {
  const explicit =
    toNonNegativeNumber(explicitValue);

  if (explicit !== null) {
    return explicit;
  }

  const statisticsValue =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "targetAmount",
        "target",
      ),
      statistics?.totals?.targetAmount,
      statistics?.summary?.targetAmount,
    );

  if (statisticsValue !== null) {
    return Math.max(0, statisticsValue);
  }

  return getSavingPlanTargetAmount(plan);
};

const getProgress = (
  plan,
  statistics,
  explicitValue,
  currentAmount,
  targetAmount,
) => {
  const explicit =
    toFiniteNumber(explicitValue);

  if (explicit !== null) {
    return clampPercentage(explicit);
  }

  const statisticsProgress =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "progress",
        "progressPercentage",
        "percentageComplete",
        "completionPercentage",
      ),
      statistics?.summary?.progress,
      statistics?.summary?.progressPercentage,
    );

  if (statisticsProgress !== null) {
    return clampPercentage(
      statisticsProgress,
    );
  }

  const planProgress =
    firstFiniteValue(
      plan?.progress,
      plan?.progressPercentage,
      plan?.percentageComplete,
    );

  if (planProgress !== null) {
    return clampPercentage(planProgress);
  }

  if (
    targetAmount !== null &&
    targetAmount > 0
  ) {
    return clampPercentage(
      (currentAmount / targetAmount) * 100,
    );
  }

  return 0;
};

const getContributionCount = (
  statistics,
  explicitValue,
) => {
  const explicit =
    toNonNegativeNumber(explicitValue);

  if (explicit !== null) {
    return Math.floor(explicit);
  }

  const value =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "contributionCount",
        "contributionsCount",
        "totalContributions",
        "numberOfContributions",
      ),
      statistics?.totals?.contributionCount,
      statistics?.totals?.totalContributions,
      statistics?.summary?.contributionCount,
    );

  return value === null
    ? null
    : Math.floor(Math.max(0, value));
};

const getAverageContribution = (
  statistics,
  explicitValue,
) => {
  const explicit =
    toNonNegativeNumber(explicitValue);

  if (explicit !== null) {
    return explicit;
  }

  const value =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "averageContribution",
        "averageContributionAmount",
        "avgContribution",
      ),
      statistics?.averages?.contribution,
      statistics?.averages?.contributionAmount,
      statistics?.summary?.averageContribution,
    );

  return value === null
    ? null
    : Math.max(0, value);
};

const getTotalContributions = (
  statistics,
  explicitValue,
) => {
  const explicit =
    toNonNegativeNumber(explicitValue);

  if (explicit !== null) {
    return explicit;
  }

  const value =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "totalContributionsAmount",
        "contributionTotal",
        "totalContributed",
      ),
      statistics?.totals?.contributions,
      statistics?.totals?.contributionAmount,
      statistics?.summary?.totalContributions,
    );

  return value === null
    ? null
    : Math.max(0, value);
};

const getLastContributionDate = (
  statistics,
  explicitValue,
) => {
  if (explicitValue !== undefined) {
    return explicitValue;
  }

  return (
    getStatisticsValue(
      statistics,
      "lastContributionDate",
      "lastContributionAt",
      "latestContributionDate",
      "latestContributionAt",
    ) ??
    statistics?.latestContribution?.date ??
    statistics?.latestContribution?.createdAt ??
    null
  );
};

const getTrendPercentage = (
  statistics,
  explicitValue,
) => {
  const explicit =
    toFiniteNumber(explicitValue);

  if (explicit !== null) {
    return explicit;
  }

  const value =
    firstFiniteValue(
      getStatisticsValue(
        statistics,
        "trendPercentage",
        "changePercentage",
        "percentageChange",
      ),
      statistics?.trend?.percentage,
      statistics?.trend?.changePercentage,
    );

  return value;
};

const getTrendDirection = (
  statistics,
  explicitDirection,
  trendPercentage,
) => {
  if (
    explicitDirection === "up" ||
    explicitDirection === "down" ||
    explicitDirection === "neutral"
  ) {
    return explicitDirection;
  }

  const direction =
    getStatisticsValue(
      statistics,
      "trendDirection",
      "direction",
    );

  if (
    direction === "up" ||
    direction === "down" ||
    direction === "neutral"
  ) {
    return direction;
  }

  if (trendPercentage === null) {
    return "neutral";
  }

  if (trendPercentage > 0) {
    return "up";
  }

  if (trendPercentage < 0) {
    return "down";
  }

  return "neutral";
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
  compact = false,
}) => {
  const toneClasses = {
    default: {
      icon:
        "bg-slate-100 text-slate-600",
      value:
        "text-slate-900",
    },

    success: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
    },

    warning: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    danger: {
      icon:
        "bg-red-50 text-red-600",
      value:
        "text-red-700",
    },
  };

  const selectedTone =
    toneClasses[tone] ??
    toneClasses.default;

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl",
        "shadow-sm",
        compact
          ? "p-3"
          : "p-4",
      )}
    >
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          aria-hidden="true"
          className={cn(
            "flex justify-center items-center rounded-xl shrink-0",
            selectedTone.icon,
            compact
              ? "h-9 w-9"
              : "h-10 w-10",
          )}
        >
          <Icon
            size={compact ? 17 : 19}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <p
            className="
              font-medium text-slate-500 text-xs
            "
          >
            {label}
          </p>

          <p
            className={cn(
              "mt-1 font-semibold truncate",
              selectedTone.value,
              compact
                ? "text-sm"
                : "text-base",
            )}
          >
            {value}
          </p>

          {description && (
            <p
              className="
                mt-1
                text-slate-400 text-xs leading-5
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = "SavingPlanStatCard";

const SavingPlanStats = ({
  plan = null,
  statistics = null,

  currentAmount,
  targetAmount,
  progress,

  contributionCount,
  averageContribution,
  totalContributions,

  lastContributionDate,

  trendPercentage,
  trendDirection,

  currency,

  targetDate,

  completed = false,

  loading = false,
  error = null,

  showOverview = true,
  showContributions = true,
  showTimeline = true,
  showTrend = false,

  compact = false,

  className = "",
  testId = "saving-plan-stats",
}) => {
  const titleId = useId();
  const statusId = useId();

  const resolvedCurrency = useMemo(
    () => {
      if (
        typeof currency === "string" &&
        currency.trim()
      ) {
        return currency
          .trim()
          .toUpperCase();
      }

      return getSavingPlanCurrency(plan);
    },
    [currency, plan],
  );

  const resolvedCurrentAmount = useMemo(
    () =>
      getCurrentAmount(
        plan,
        statistics,
        currentAmount,
      ),
    [
      plan,
      statistics,
      currentAmount,
    ],
  );

  const resolvedTargetAmount = useMemo(
    () =>
      getTargetAmount(
        plan,
        statistics,
        targetAmount,
      ),
    [
      plan,
      statistics,
      targetAmount,
    ],
  );

  const resolvedProgress = useMemo(
    () =>
      getProgress(
        plan,
        statistics,
        progress,
        resolvedCurrentAmount,
        resolvedTargetAmount,
      ),
    [
      plan,
      statistics,
      progress,
      resolvedCurrentAmount,
      resolvedTargetAmount,
    ],
  );

  const resolvedContributionCount =
    useMemo(
      () =>
        getContributionCount(
          statistics,
          contributionCount,
        ),
      [
        statistics,
        contributionCount,
      ],
    );

  const resolvedAverageContribution =
    useMemo(
      () =>
        getAverageContribution(
          statistics,
          averageContribution,
        ),
      [
        statistics,
        averageContribution,
      ],
    );

  const resolvedTotalContributions =
    useMemo(
      () =>
        getTotalContributions(
          statistics,
          totalContributions,
        ),
      [
        statistics,
        totalContributions,
      ],
    );

  const resolvedLastContributionDate =
    useMemo(
      () =>
        getLastContributionDate(
          statistics,
          lastContributionDate,
        ),
      [
        statistics,
        lastContributionDate,
      ],
    );

  const resolvedTrendPercentage =
    useMemo(
      () =>
        getTrendPercentage(
          statistics,
          trendPercentage,
        ),
      [
        statistics,
        trendPercentage,
      ],
    );

  const resolvedTrendDirection =
    useMemo(
      () =>
        getTrendDirection(
          statistics,
          trendDirection,
          resolvedTrendPercentage,
        ),
      [
        statistics,
        trendDirection,
        resolvedTrendPercentage,
      ],
    );

  const resolvedTargetDate = useMemo(
    () => {
      if (targetDate !== undefined) {
        return targetDate;
      }

      return getSavingPlanTargetDate(plan);
    },
    [plan, targetDate],
  );

  const remainingAmount = useMemo(
    () => {
      if (
        resolvedTargetAmount === null ||
        resolvedTargetAmount <= 0
      ) {
        return null;
      }

      return Math.max(
        0,
        resolvedTargetAmount -
          resolvedCurrentAmount,
      );
    },
    [
      resolvedTargetAmount,
      resolvedCurrentAmount,
    ],
  );

  const formattedCurrentAmount =
    useMemo(
      () =>
        formatSavingPlanAmount(
          resolvedCurrentAmount,
          resolvedCurrency,
        ),
      [
        resolvedCurrentAmount,
        resolvedCurrency,
      ],
    );

  const formattedTargetAmount =
    useMemo(
      () => {
        if (
          resolvedTargetAmount === null
        ) {
          return null;
        }

        return formatSavingPlanAmount(
          resolvedTargetAmount,
          resolvedCurrency,
        );
      },
      [
        resolvedTargetAmount,
        resolvedCurrency,
      ],
    );

  const formattedRemainingAmount =
    useMemo(
      () => {
        if (remainingAmount === null) {
          return null;
        }

        return formatSavingPlanAmount(
          remainingAmount,
          resolvedCurrency,
        );
      },
      [
        remainingAmount,
        resolvedCurrency,
      ],
    );

  const formattedProgress = useMemo(
    () =>
      formatSavingPlanProgress(
        resolvedProgress,
      ),
    [resolvedProgress],
  );

  const formattedAverageContribution =
    useMemo(
      () => {
        if (
          resolvedAverageContribution ===
          null
        ) {
          return null;
        }

        return formatSavingPlanAmount(
          resolvedAverageContribution,
          resolvedCurrency,
        );
      },
      [
        resolvedAverageContribution,
        resolvedCurrency,
      ],
    );

  const formattedTotalContributions =
    useMemo(
      () => {
        if (
          resolvedTotalContributions ===
          null
        ) {
          return null;
        }

        return formatSavingPlanAmount(
          resolvedTotalContributions,
          resolvedCurrency,
        );
      },
      [
        resolvedTotalContributions,
        resolvedCurrency,
      ],
    );

  const formattedTargetDate = useMemo(
    () => {
      if (!resolvedTargetDate) {
        return null;
      }

      return formatSavingPlanDate(
        resolvedTargetDate,
      );
    },
    [resolvedTargetDate],
  );

  const formattedRemainingDays =
    useMemo(
      () => {
        if (!resolvedTargetDate) {
          return null;
        }

        return formatSavingPlanRemainingDays(
          resolvedTargetDate,
        );
      },
      [resolvedTargetDate],
    );

  const formattedLastContributionDate =
    useMemo(
      () => {
        if (!resolvedLastContributionDate) {
          return null;
        }

        return formatSavingPlanDate(
          resolvedLastContributionDate,
        );
      },
      [resolvedLastContributionDate],
    );

  const isCompleted =
    completed ||
    resolvedProgress >= 100 ||
    Boolean(
      plan &&
        typeof plan === "object" &&
        [
          "completed",
          "complete",
          "achieved",
        ].includes(
          String(plan.status ?? "")
            .trim()
            .toLowerCase(),
        ),
    );

  const trendLabel =
    resolvedTrendPercentage === null
      ? null
      : `${Math.abs(
          resolvedTrendPercentage,
        ).toFixed(1)}%`;

  const trendIcon =
    resolvedTrendDirection === "down"
      ? ArrowDown
      : resolvedTrendDirection === "up"
        ? ArrowUp
        : TrendingUp;

  const trendTone =
    resolvedTrendDirection === "up"
      ? "success"
      : resolvedTrendDirection === "down"
        ? "danger"
        : "default";

  if (loading) {
    return (
      <section
        data-testid={testId}
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "w-full",
          className,
        )}
      >
        <div
          className={cn(
            "gap-4 grid",
            compact
              ? "grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {Array.from({
            length: compact ? 2 : 4,
          }).map((_, index) => (
            <div
              key={`saving-plan-stat-skeleton-${index}`}
              aria-hidden="true"
              className={cn(
                "rounded-2xl animate-pulse",
                "border border-slate-200 bg-white",
                compact
                  ? "h-20"
                  : "h-28",
              )}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid={testId}
      aria-labelledby={titleId}
      className={cn(
        "w-full",
        className,
      )}
    >
      {showOverview && (
        <div
          className="
            mb-4
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-3
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h2
                id={titleId}
                className={cn(
                  "font-semibold text-slate-900",
                  compact
                    ? "text-base"
                    : "text-lg",
                )}
              >
                Saving plan statistics
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs
                "
              >
                Current performance and saving activity.
              </p>
            </div>

            {isCompleted && (
              <div
                id={statusId}
                role="status"
                aria-live="polite"
                className="
                  flex items-center
                  px-2.5 py-1
                  font-semibold text-emerald-700 text-xs
                  bg-emerald-50
                  rounded-full
                  gap-1.5 shrink-0
                "
              >
                <CheckCircle2
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          role="status"
          aria-live="polite"
          className="
            mb-4 px-4 py-3
            text-amber-800 text-sm
            bg-amber-50
            border border-amber-200 rounded-xl
          "
        >
          Statistics may be temporarily unavailable.
        </div>
      )}

      {/* Overview statistics */}
      {showOverview && (
        <div
          className={cn(
            "gap-4 grid",
            compact
              ? "grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          <StatCard
            icon={Target}
            label="Saved"
            value={formattedCurrentAmount}
            tone={
              isCompleted
                ? "success"
                : "default"
            }
            compact={compact}
          />

          {formattedTargetAmount && (
            <StatCard
              icon={Target}
              label="Target"
              value={formattedTargetAmount}
              compact={compact}
            />
          )}

          {formattedRemainingAmount !== null &&
            !isCompleted && (
              <StatCard
                icon={Clock3}
                label="Remaining"
                value={formattedRemainingAmount}
                tone={
                  remainingAmount === 0
                    ? "success"
                    : "default"
                }
                compact={compact}
              />
            )}

          <StatCard
            icon={TrendingUp}
            label="Progress"
            value={formattedProgress}
            tone={
              isCompleted
                ? "success"
                : "default"
            }
            compact={compact}
          />
        </div>
      )}

      {/* Contribution statistics */}
      {showContributions && (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            mt-4
            gap-4
          "
        >
          {resolvedContributionCount !==
            null && (
            <StatCard
              icon={CheckCircle2}
              label="Contributions"
              value={String(
                resolvedContributionCount,
              )}
              description="Total recorded contributions"
              compact={compact}
            />
          )}

          {formattedAverageContribution && (
            <StatCard
              icon={TrendingUp}
              label="Average contribution"
              value={
                formattedAverageContribution
              }
              compact={compact}
            />
          )}

          {formattedTotalContributions && (
            <StatCard
              icon={ArrowUp}
              label="Total contributed"
              value={
                formattedTotalContributions
              }
              compact={compact}
            />
          )}
        </div>
      )}

      {/* Timeline */}
      {showTimeline &&
        (formattedTargetDate ||
          formattedRemainingDays ||
          formattedLastContributionDate) && (
          <div
            className={cn(
              "bg-white mt-4 border border-slate-200 rounded-2xl",
              "shadow-sm",
              compact
                ? "p-3"
                : "p-4",
            )}
          >
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                gap-4
              "
            >
              {formattedTargetDate && (
                <div
                  className="
                    flex items-start
                    gap-3
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      flex justify-center items-center
                      w-9 h-9
                      text-slate-600
                      bg-slate-100
                      rounded-xl
                      shrink-0
                    "
                  >
                    <CalendarDays
                      size={17}
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        font-medium text-slate-500 text-xs
                      "
                    >
                      Target date
                    </p>

                    <p
                      className="
                        mt-1
                        font-semibold text-slate-900 text-sm
                      "
                    >
                      {formattedTargetDate}
                    </p>
                  </div>
                </div>
              )}

              {formattedRemainingDays && (
                <div
                  className="
                    flex items-start
                    gap-3
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      flex justify-center items-center
                      w-9 h-9
                      text-slate-600
                      bg-slate-100
                      rounded-xl
                      shrink-0
                    "
                  >
                    <Clock3
                      size={17}
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        font-medium text-slate-500 text-xs
                      "
                    >
                      Time remaining
                    </p>

                    <p
                      className="
                        mt-1
                        font-semibold text-slate-900 text-sm
                      "
                    >
                      {formattedRemainingDays}
                    </p>
                  </div>
                </div>
              )}

              {formattedLastContributionDate && (
                <div
                  className="
                    flex items-start
                    gap-3
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      flex justify-center items-center
                      w-9 h-9
                      text-slate-600
                      bg-slate-100
                      rounded-xl
                      shrink-0
                    "
                  >
                    <CheckCircle2
                      size={17}
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        font-medium text-slate-500 text-xs
                      "
                    >
                      Last contribution
                    </p>

                    <p
                      className="
                        mt-1
                        font-semibold text-slate-900 text-sm
                      "
                    >
                      {formattedLastContributionDate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Trend */}
      {showTrend &&
        trendLabel && (
          <div
            className={cn(
              "flex items-center gap-3 mt-4 rounded-2xl",
              "border border-slate-200 bg-white shadow-sm",
              compact
                ? "p-3"
                : "p-4",
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "flex justify-center items-center rounded-xl w-9 h-9 shrink-0",
                trendTone === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : trendTone === "danger"
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-600",
              )}
            >
              {(() => {
                const TrendIcon =
                  trendIcon;

                return (
                  <TrendIcon
                    size={17}
                    strokeWidth={2}
                  />
                );
              })()}
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Saving trend
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-sm
                "
              >
                {trendLabel}
              </p>
            </div>
          </div>
        )}
    </section>
  );
};

SavingPlanStats.displayName =
  "SavingPlanStats";

export default memo(SavingPlanStats);