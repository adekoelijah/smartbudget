import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";

import { memo } from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_LOCALE = "en-NG";

const DEFAULT_CLASS_NAME = "";

/* =========================================================
   SAFE HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeText = (
  value,
  fallback = ""
) => {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return normalized
    ? normalized
    : fallback;
};

const normalizeCurrency = (
  value
) =>
  normalizeText(
    value,
    DEFAULT_CURRENCY
  ).toUpperCase();

const joinClasses = (...classes) =>
  classes
    .filter(
      (className) =>
        typeof className ===
          "string" &&
        className.trim()
    )
    .join(" ");

/* =========================================================
   CURRENCY
========================================================= */

const formatAmount = (
  value,
  currency = DEFAULT_CURRENCY
) => {
  const amount =
    toNumber(value);

  const safeCurrency =
    normalizeCurrency(
      currency
    );

  try {
    return new Intl.NumberFormat(
      DEFAULT_LOCALE,
      {
        style: "currency",
        currency: safeCurrency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toLocaleString(
      DEFAULT_LOCALE,
      {
        maximumFractionDigits: 2,
      }
    )}`;
  }
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  value
) => {
  if (!value) {
    return "Not set";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not set";
  }

  try {
    return new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return "Not set";
  }
};

/* =========================================================
   DAYS
========================================================= */

const formatDays = (
  value
) => {
  const days = Math.max(
    0,
    Math.round(
      toNumber(value)
    )
  );

  if (days === 0) {
    return "Today";
  }

  if (days === 1) {
    return "1 day";
  }

  return `${days} days`;
};

/* =========================================================
   PROGRESS
========================================================= */

const calculateProgress = ({
  currentAmount,
  targetAmount,
  progress,
}) => {
  const explicitProgress =
    Number(progress);

  if (
    progress !== undefined &&
    progress !== null &&
    Number.isFinite(
      explicitProgress
    )
  ) {
    return Math.min(
      100,
      Math.max(
        0,
        explicitProgress
      )
    );
  }

  const current =
    toNumber(currentAmount);

  const target =
    toNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (current / target) *
        100
    )
  );
};

/* =========================================================
   FORECAST STATUS
========================================================= */

const getForecastStatus = ({
  projectedAmount,
  targetAmount,
  progress,
}) => {
  const projected =
    toNumber(projectedAmount);

  const target =
    toNumber(targetAmount);

  const percentage =
    toNumber(progress);

  if (
    target > 0 &&
    projected >= target
  ) {
    return {
      label: "On track",
      description:
        "Your current saving pace can reach this goal.",
      Icon: TrendingUp,
      tone: "emerald",
    };
  }

  if (percentage >= 75) {
    return {
      label: "Nearly there",
      description:
        "You are making strong progress toward your target.",
      Icon: ArrowUpRight,
      tone: "blue",
    };
  }

  if (percentage >= 40) {
    return {
      label: "In progress",
      description:
        "Keep contributing consistently to stay on course.",
      Icon: TrendingUp,
      tone: "amber",
    };
  }

  return {
    label: "Needs attention",
    description:
      "Consider increasing your contributions to reach the target sooner.",
    Icon: ArrowDownRight,
    tone: "rose",
  };
};

/* =========================================================
   TONE CONFIG
========================================================= */

const TONE_STYLES = Object.freeze({
  emerald: {
    wrapper:
      "border-emerald-200 bg-emerald-50",
    icon:
      "bg-emerald-100 text-emerald-600",
    label:
      "text-emerald-700",
  },

  blue: {
    wrapper:
      "border-blue-200 bg-blue-50",
    icon:
      "bg-blue-100 text-blue-600",
    label:
      "text-blue-700",
  },

  amber: {
    wrapper:
      "border-amber-200 bg-amber-50",
    icon:
      "bg-amber-100 text-amber-600",
    label:
      "text-amber-700",
  },

  rose: {
    wrapper:
      "border-rose-200 bg-rose-50",
    icon:
      "bg-rose-100 text-rose-600",
    label:
      "text-rose-700",
  },
});

/* =========================================================
   SUMMARY STAT
========================================================= */

const SummaryStat = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
  }) => {
    const SafeIcon =
      typeof Icon === "function"
        ? Icon
        : CircleDollarSign;

    return (
      <div
        className="
          flex items-start
          p-4
          bg-white
          border border-slate-200 rounded-xl
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            text-slate-600
            bg-slate-100
            rounded-lg
            shrink-0
          "
          aria-hidden="true"
        >
          <SafeIcon
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
              text-slate-500 text-xs
            "
          >
            {label}
          </p>

          <p
            className="
              mt-0.5
              font-semibold text-slate-900 text-sm truncate
            "
            title={
              typeof value ===
              "string"
                ? value
                : undefined
            }
          >
            {value}
          </p>

          {description ? (
            <p
              className="
                mt-0.5
                text-slate-400 text-xs leading-4
              "
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
);

SummaryStat.displayName =
  "SavingsForecastSummaryStat";

/* =========================================================
   CONTRIBUTION ITEM
========================================================= */

const ContributionItem = memo(
  ({
    label,
    amount,
    currency,
  }) => (
    <div
      className="
        p-3
        bg-white
        border border-slate-200 rounded-lg
      "
    >
      <p
        className="
          text-slate-400 text-xs
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-semibold text-slate-900 text-sm
        "
      >
        {formatAmount(
          amount,
          currency
        )}
      </p>
    </div>
  )
);

ContributionItem.displayName =
  "SavingsForecastContributionItem";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastSummary = ({
  forecast = null,
  goal = null,

  currentAmount,
  targetAmount,
  projectedAmount,

  targetDate,
  projectedDate,

  remainingAmount,
  requiredDailyAmount,
  requiredMonthlyAmount,

  progress,

  daysRemaining,
  currency = DEFAULT_CURRENCY,

  className = DEFAULT_CLASS_NAME,
}) => {
  /* =======================================================
     SAFE OBJECTS
  ======================================================= */

  const forecastData =
    forecast &&
    typeof forecast ===
      "object" &&
    !Array.isArray(forecast)
      ? forecast
      : {};

  const goalData =
    goal &&
    typeof goal ===
      "object" &&
    !Array.isArray(goal)
      ? goal
      : {};

  /* =======================================================
     RESOLVE CURRENCY
  ======================================================= */

  const resolvedCurrency =
    normalizeCurrency(
      forecastData.currency ??
        goalData.currency ??
        currency
    );

  /* =======================================================
     RESOLVE AMOUNTS
  ======================================================= */

  const resolvedCurrentAmount =
    toNumber(
      forecastData.currentAmount ??
        forecastData.currentSaved ??
        forecastData.savedAmount ??
        goalData.currentAmount ??
        goalData.savedAmount ??
        currentAmount
    );

  const resolvedTargetAmount =
    toNumber(
      forecastData.targetAmount ??
        forecastData.target ??
        goalData.targetAmount ??
        targetAmount
    );

  const resolvedProjectedAmount =
    toNumber(
      forecastData.projectedAmount ??
        forecastData.projectedTotal ??
        forecastData.forecastAmount ??
        projectedAmount ??
        resolvedCurrentAmount
    );

  const resolvedRemainingAmount =
    Math.max(
      0,
      toNumber(
        forecastData.remainingAmount ??
          forecastData.amountRemaining ??
          remainingAmount ??
          resolvedTargetAmount -
            resolvedCurrentAmount
      )
    );

  /* =======================================================
     RESOLVE PROGRESS
  ======================================================= */

  const resolvedProgress =
    calculateProgress({
      currentAmount:
        resolvedCurrentAmount,

      targetAmount:
        resolvedTargetAmount,

      progress:
        forecastData.progress ??
        forecastData.progressPercentage ??
        progress,
    });

  /* =======================================================
     RESOLVE DATES
  ======================================================= */

  const resolvedTargetDate =
    forecastData.targetDate ??
    forecastData.deadline ??
    goalData.targetDate ??
    goalData.deadline ??
    targetDate;

  const resolvedProjectedDate =
    forecastData.projectedDate ??
    forecastData.forecastDate ??
    forecastData.expectedCompletionDate ??
    projectedDate;

  const resolvedCompletionDate =
    resolvedProjectedDate ||
    resolvedTargetDate;

  /* =======================================================
     RESOLVE TIME
  ======================================================= */

  const resolvedDaysRemaining =
    forecastData.daysRemaining ??
    forecastData.remainingDays ??
    daysRemaining;

  /* =======================================================
     RESOLVE CONTRIBUTION
  ======================================================= */

  const resolvedDailyAmount =
    forecastData.requiredDailyAmount ??
    forecastData.dailyRequired ??
    requiredDailyAmount;

  const resolvedMonthlyAmount =
    forecastData.requiredMonthlyAmount ??
    forecastData.monthlyRequired ??
    requiredMonthlyAmount;

  const hasDailyAmount =
    Number.isFinite(
      Number(resolvedDailyAmount)
    ) &&
    Number(resolvedDailyAmount) >
      0;

  const hasMonthlyAmount =
    Number.isFinite(
      Number(resolvedMonthlyAmount)
    ) &&
    Number(resolvedMonthlyAmount) >
      0;

  /* =======================================================
     STATUS
  ======================================================= */

  const status =
    getForecastStatus({
      projectedAmount:
        resolvedProjectedAmount,

      targetAmount:
        resolvedTargetAmount,

      progress:
        resolvedProgress,
    });

  const StatusIcon =
    typeof status.Icon ===
    "function"
      ? status.Icon
      : TrendingUp;

  const tone =
    TONE_STYLES[
      status.tone
    ] ??
    TONE_STYLES.blue;

  /* =======================================================
     CLASS NAME
  ======================================================= */

  const safeClassName =
    typeof className ===
    "string"
      ? className.trim()
      : "";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={joinClasses(
        "space-y-4",
        safeClassName
      )}
      aria-label="Savings forecast summary"
    >
      {/* =================================================
          FORECAST STATUS
      ================================================= */}

      <div
        className={joinClasses(
          `
            flex items-start
            p-4
            border
            rounded-xl
            gap-3
          `,
          tone.wrapper
        )}
      >
        <div
          className={joinClasses(
            `
              flex justify-center items-center
              w-10 h-10
              rounded-lg
              shrink-0
            `,
            tone.icon
          )}
          aria-hidden="true"
        >
          <StatusIcon
            size={19}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className={joinClasses(
              "font-semibold text-sm",
              tone.label
            )}
          >
            {status.label}
          </p>

          <p
            className="
              mt-1
              text-slate-600 text-xs leading-5
            "
          >
            {status.description}
          </p>
        </div>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div
        className="
          p-4
          bg-white
          border border-slate-200 rounded-xl
        "
      >
        <div
          className="
            flex justify-between items-center
            mb-2
            gap-3
          "
        >
          <div
            className="
              flex items-center
              text-slate-600 text-xs
              gap-2
            "
          >
            <Target
              size={15}
              aria-hidden="true"
            />

            <span>
              Goal progress
            </span>
          </div>

          <span
            className="
              font-semibold text-slate-900 text-xs
            "
          >
            {resolvedProgress.toFixed(
              1
            )}
            %
          </span>
        </div>

        <div
          className="
            overflow-hidden
            w-full h-2
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuenow={Math.round(
            resolvedProgress
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Savings goal progress"
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-[width] duration-500
            "
            style={{
              width: `${resolvedProgress}%`,
            }}
          /
          >
        </div>

        <div
          className="
            flex justify-between
            mt-2
            text-slate-400 text-xs
            gap-3
          "
        >
          <span>
            {formatAmount(
              resolvedCurrentAmount,
              resolvedCurrency
            )}{" "}
            saved
          </span>

          <span>
            {formatAmount(
              resolvedTargetAmount,
              resolvedCurrency
            )}{" "}
            target
          </span>
        </div>
      </div>

      {/* =================================================
          CORE FORECAST STATS
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-2
          gap-3
        "
      >
        <SummaryStat
          icon={CircleDollarSign}
          label="Projected amount"
          value={formatAmount(
            resolvedProjectedAmount,
            resolvedCurrency
          )}
          description="Estimated savings at the current pace"
        />

        <SummaryStat
          icon={ArrowUpRight}
          label="Amount remaining"
          value={formatAmount(
            resolvedRemainingAmount,
            resolvedCurrency
          )}
          description="Still needed to reach your goal"
        />

        <SummaryStat
          icon={CalendarDays}
          label="Expected completion"
          value={formatDate(
            resolvedCompletionDate
          )}
          description={
            resolvedProjectedDate
              ? "Based on your current savings pace"
              : "Target date"
          }
        />

        <SummaryStat
          icon={Clock3}
          label="Time remaining"
          value={
            resolvedDaysRemaining !==
              undefined &&
            resolvedDaysRemaining !==
              null
              ? formatDays(
                  resolvedDaysRemaining
                )
              : "Not available"
          }
          description="Estimated time to target"
        />
      </div>

      {/* =================================================
          CONTRIBUTION REQUIREMENT
      ================================================= */}

      {(hasDailyAmount ||
        hasMonthlyAmount) && (
        <div
          className="
            p-4
            bg-slate-50
            border border-slate-200 rounded-xl
          "
        >
          <div
            className="
              flex items-center
              mb-3
              text-slate-700
              gap-2
            "
          >
            <TrendingUp
              size={16}
              aria-hidden="true"
            />

            <h3
              className="
                font-semibold text-sm
              "
            >
              Suggested contribution pace
            </h3>
          </div>

          <div
            className="
              grid grid-cols-1 sm:grid-cols-2
              gap-3
            "
          >
            {hasDailyAmount && (
              <ContributionItem
                label="Per day"
                amount={
                  resolvedDailyAmount
                }
                currency={
                  resolvedCurrency
                }
              />
            )}

            {hasMonthlyAmount && (
              <ContributionItem
                label="Per month"
                amount={
                  resolvedMonthlyAmount
                }
                currency={
                  resolvedCurrency
                }
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

SavingsForecastSummary.displayName =
  "SavingsForecastSummary";

export default memo(
  SavingsForecastSummary
);