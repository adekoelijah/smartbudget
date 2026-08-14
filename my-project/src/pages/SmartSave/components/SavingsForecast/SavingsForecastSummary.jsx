
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   SAFE HELPERS
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeText = (value, fallback = "") =>
  typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;

const formatAmount = (
  value,
  currency = "NGN"
) => {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency:
        normalizeText(currency, "NGN").toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "NGN"} ${amount.toLocaleString()}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDays = (value) => {
  const days = Math.max(
    0,
    Math.round(toNumber(value))
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
  if (
    progress !== undefined &&
    progress !== null &&
    Number.isFinite(Number(progress))
  ) {
    return Math.min(
      100,
      Math.max(0, Number(progress))
    );
  }

  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (current / target) * 100)
  );
};

/* =========================================================
   STATUS
========================================================= */

const getForecastStatus = ({
  projectedAmount,
  targetAmount,
  progress,
}) => {
  const projected = toNumber(projectedAmount);
  const target = toNumber(targetAmount);
  const percentage = toNumber(progress);

  if (
    target > 0 &&
    projected >= target
  ) {
    return {
      label: "On track",
      description:
        "Your current saving pace can reach this goal.",
      icon: TrendingUp,
      tone: "emerald",
    };
  }

  if (percentage >= 75) {
    return {
      label: "Nearly there",
      description:
        "You are making strong progress toward your target.",
      icon: ArrowUpRight,
      tone: "blue",
    };
  }

  if (percentage >= 40) {
    return {
      label: "In progress",
      description:
        "Keep contributing consistently to stay on course.",
      icon: TrendingUp,
      tone: "amber",
    };
  }

  return {
    label: "Needs attention",
    description:
      "Consider increasing your contributions to reach the target sooner.",
    icon: ArrowDownRight,
    tone: "rose",
  };
};

/* =========================================================
   TONE CONFIG
========================================================= */

const TONE_STYLES = {
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
};

/* =========================================================
   STAT ITEM
========================================================= */

const SummaryStat = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
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
    >
      <Icon
        size={17}
        strokeWidth={2}
        aria-hidden="true"
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
      >
        {value}
      </p>

      {description && (
        <p
          className="
            mt-0.5
            text-slate-400 text-xs
          "
        >
          {description}
        </p>
      )}
    </div>
  </div>
);

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
  currency = "NGN",

  className = "",
}) => {
  /*
   * Support both:
   *
   * <SavingsForecastSummary
   *   forecast={forecast}
   * />
   *
   * and direct props.
   *
   * This makes the component resilient to changes
   * in the forecast service response shape.
   */

  const data =
    forecast &&
    typeof forecast === "object"
      ? forecast
      : {};

  const goalData =
    goal &&
    typeof goal === "object"
      ? goal
      : {};

  const resolvedCurrency =
    normalizeText(
      data.currency ||
        goalData.currency ||
        currency,
      "NGN"
    ).toUpperCase();

  const resolvedCurrentAmount =
    data.currentAmount ??
    data.currentSaved ??
    data.savedAmount ??
    goalData.currentAmount ??
    goalData.savedAmount ??
    currentAmount ??
    0;

  const resolvedTargetAmount =
    data.targetAmount ??
    data.target ??
    goalData.targetAmount ??
    targetAmount ??
    0;

  const resolvedProjectedAmount =
    data.projectedAmount ??
    data.projectedTotal ??
    data.forecastAmount ??
    projectedAmount ??
    resolvedCurrentAmount;

  const resolvedRemainingAmount =
    data.remainingAmount ??
    data.amountRemaining ??
    Math.max(
      0,
      toNumber(resolvedTargetAmount) -
        toNumber(resolvedCurrentAmount)
    );

  const resolvedProgress =
    calculateProgress({
      currentAmount:
        resolvedCurrentAmount,
      targetAmount:
        resolvedTargetAmount,
      progress:
        data.progress ??
        data.progressPercentage ??
        progress,
    });

  const resolvedTargetDate =
    data.targetDate ??
    data.deadline ??
    goalData.targetDate ??
    goalData.deadline ??
    targetDate;

  const resolvedProjectedDate =
    data.projectedDate ??
    data.forecastDate ??
    data.expectedCompletionDate ??
    projectedDate;

  const resolvedDaysRemaining =
    data.daysRemaining ??
    data.remainingDays ??
    daysRemaining;

  const resolvedDailyAmount =
    data.requiredDailyAmount ??
    data.dailyRequired ??
    requiredDailyAmount;

  const resolvedMonthlyAmount =
    data.requiredMonthlyAmount ??
    data.monthlyRequired ??
    requiredMonthlyAmount;

  const status = getForecastStatus({
    projectedAmount:
      resolvedProjectedAmount,
    targetAmount:
      resolvedTargetAmount,
    progress:
      resolvedProgress,
  });

  const StatusIcon = status.icon;

  const tone =
    TONE_STYLES[status.tone] ||
    TONE_STYLES.blue;

  const safeProjectedDate =
    resolvedProjectedDate ||
    resolvedTargetDate;

  return (
    <section
      className={`
        space-y-4
        ${className}
      `}
      aria-label="Savings forecast summary"
    >
      {/* =================================================
          FORECAST STATUS
      ================================================= */}

      <div
        className={`
          flex items-start
          p-4
          border
          rounded-xl
          gap-3
          ${tone.wrapper}
        `}
      >
        <div
          className={`
            flex justify-center items-center
            w-10 h-10
            rounded-lg
            shrink-0
            ${tone.icon}
          `}
        >
          <StatusIcon
            size={19}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className={`
              font-semibold text-sm
              ${tone.label}
            `}
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

            <span>Goal progress</span>
          </div>

          <span
            className="
              font-semibold text-slate-900 text-xs
            "
          >
            {resolvedProgress.toFixed(1)}%
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
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Savings goal progress"
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-all duration-500
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
            )} saved
          </span>

          <span>
            {formatAmount(
              resolvedTargetAmount,
              resolvedCurrency
            )} target
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
            safeProjectedDate
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
            resolvedDaysRemaining !== null
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

      {(resolvedDailyAmount ||
        resolvedMonthlyAmount) && (
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
            {resolvedDailyAmount && (
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
                  Per day
                </p>

                <p
                  className="
                    mt-1
                    font-semibold text-slate-900 text-sm
                  "
                >
                  {formatAmount(
                    resolvedDailyAmount,
                    resolvedCurrency
                  )}
                </p>
              </div>
            )}

            {resolvedMonthlyAmount && (
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
                  Per month
                </p>

                <p
                  className="
                    mt-1
                    font-semibold text-slate-900 text-sm
                  "
                >
                  {formatAmount(
                    resolvedMonthlyAmount,
                    resolvedCurrency
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SavingsForecastSummary;
