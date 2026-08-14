import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Target,
  WalletCards,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const toNumber = (value, fallback = 0) => {
  if (isFiniteNumber(value)) return value;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

/* =========================================================
   DEFAULT FORECAST MODEL
========================================================= */

const DEFAULT_FORECAST = {
  currentAmount: 0,
  targetAmount: 0,
  remainingAmount: 0,
  projectedAmount: 0,
  projectedProgress: 0,
  projectedDate: null,
  requiredAmount: 0,
  onTrack: null,
  confidence: null,
  daysRemaining: null,
};

/* =========================================================
   NORMALIZER
========================================================= */

const normalizeForecast = (forecast) => {
  if (!forecast || typeof forecast !== "object") {
    return DEFAULT_FORECAST;
  }

  const currentAmount = toNumber(
    firstDefined(
      forecast.currentAmount,
      forecast.currentBalance,
      forecast.savedAmount,
      forecast.current
    )
  );

  const targetAmount = toNumber(
    firstDefined(
      forecast.targetAmount,
      forecast.goalAmount,
      forecast.target
    )
  );

  const remainingAmount = Math.max(
    toNumber(
      firstDefined(
        forecast.remainingAmount,
        forecast.amountRemaining,
        targetAmount - currentAmount
      )
    ),
    0
  );

  const projectedAmount = toNumber(
    firstDefined(
      forecast.projectedAmount,
      forecast.projectedBalance,
      forecast.forecastAmount
    )
  );

  const projectedProgress = clamp(
    toNumber(
      firstDefined(
        forecast.projectedProgress,
        forecast.projectedPercentage,
        targetAmount > 0
          ? (projectedAmount / targetAmount) * 100
          : 0
      )
    )
  );

  return {
    currentAmount,
    targetAmount,
    remainingAmount,
    projectedAmount,
    projectedProgress,
    projectedDate: firstDefined(
      forecast.projectedDate,
      forecast.estimatedCompletionDate,
      forecast.expectedCompletionDate
    ),
    requiredAmount: toNumber(
      firstDefined(
        forecast.requiredAmount,
        forecast.requiredContribution,
        forecast.requiredPerPeriod
      )
    ),
    onTrack:
      typeof forecast.onTrack === "boolean"
        ? forecast.onTrack
        : null,
    confidence:
      forecast.confidence !== undefined
        ? clamp(toNumber(forecast.confidence))
        : null,
    daysRemaining:
      forecast.daysRemaining !== undefined
        ? Math.max(0, Math.round(toNumber(forecast.daysRemaining)))
        : null,
  };
};

/* =========================================================
   CURRENCY FORMATTER
========================================================= */

const formatCurrency = (
  value,
  currency = "NGN",
  locale = "en-NG"
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(toNumber(value));
  } catch {
    return `${currency} ${toNumber(value).toLocaleString()}`;
  }
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* =========================================================
   STATUS
========================================================= */

const getForecastStatus = ({
  onTrack,
  projectedProgress,
  targetAmount,
  currentAmount,
}) => {
  if (targetAmount > 0 && currentAmount >= targetAmount) {
    return {
      label: "Goal reached",
      tone: "success",
      icon: CheckCircle2,
    };
  }

  if (onTrack === true) {
    return {
      label: "On track",
      tone: "success",
      icon: TrendingUp,
    };
  }

  if (onTrack === false) {
    return {
      label: "Needs attention",
      tone: "warning",
      icon: AlertTriangle,
    };
  }

  if (projectedProgress >= 100) {
    return {
      label: "Projected to reach goal",
      tone: "success",
      icon: TrendingUp,
    };
  }

  return {
    label: "Forecast available",
    tone: "neutral",
    icon: Clock3,
  };
};

/* =========================================================
   STATUS STYLES
========================================================= */

const STATUS_STYLES = {
  success: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: "text-emerald-600",
  },

  warning: {
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
    icon: "text-amber-600",
  },

  neutral: {
    badge:
      "bg-slate-50 text-slate-600 ring-slate-600/10",
    icon: "text-slate-500",
  },
};

/* =========================================================
   FORECAST METRIC
========================================================= */

const ForecastMetric = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
  <div
    className="
      p-4
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <div
        className="
          flex justify-center items-center
          w-9 h-9
          bg-slate-100
          rounded-xl
          shrink-0
        "
      >
        <Icon
          size={17}
          className="
            text-slate-600
          "
          aria-hidden="true"
        /
        >
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
          {label}
        </p>

        <p
          className="
            mt-1
            font-semibold text-slate-900 text-sm truncate
          "
        >
          {value}
        </p>

        {description && (
          <p
            className="
              mt-1
              text-slate-500 text-xs
            "
          >
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

/* =========================================================
   LOADING STATE
========================================================= */

const LoadingState = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-3xl
      shadow-sm
    "
    aria-busy="true"
    aria-label="Loading savings forecast"
  >
    <div
      className="
        space-y-5
        animate-pulse
      "
    >
      <div
        className="
          w-40 h-5
          bg-slate-200
          rounded
        "
        /
      >
      <div
        className="
          w-56 h-10
          bg-slate-200
          rounded
        "
        /
      >
      <div
        className="
          w-full h-3
          bg-slate-200
          rounded
        "
        /
      >

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          gap-3
        "
      >
        <div
          className="
            h-20
            bg-slate-100
            rounded-2xl
          "
          /
        >
        <div
          className="
            h-20
            bg-slate-100
            rounded-2xl
          "
          /
        >
        <div
          className="
            h-20
            bg-slate-100
            rounded-2xl
          "
          /
        >
      </div>
    </div>
  </div>
);

/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = ({ message, onRetry }) => (
  <div
    className="
      p-5
      bg-white
      border border-red-100 rounded-3xl
      shadow-sm
    "
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <div
        className="
          flex justify-center items-center
          w-10 h-10
          bg-red-50
          rounded-xl
          shrink-0
        "
      >
        <AlertTriangle
          size={18}
          className="
            text-red-600
          "
          aria-hidden="true"
        /
        >
      </div>

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <h3
          className="
            font-semibold text-slate-900 text-sm
          "
        >
          Forecast unavailable
        </h3>

        <p
          className="
            mt-1
            text-slate-500 text-sm
          "
        >
          {message ||
            "We couldn't calculate your savings forecast right now."}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              mt-3 px-4 py-2
              font-semibold text-white text-sm
              bg-slate-900 hover:bg-slate-800
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              transition
            "
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = () => (
  <div
    className="
      p-6
      text-center
      bg-white
      border border-slate-200 rounded-3xl
      shadow-sm
    "
  >
    <div
      className="
        flex justify-center items-center
        w-12 h-12
        mx-auto
        bg-slate-100
        rounded-2xl
      "
    >
      <Target
        size={21}
        className="
          text-slate-600
        "
        aria-hidden="true"
      /
      >
    </div>

    <h3
      className="
        mt-4
        font-semibold text-slate-900 text-sm
      "
    >
      No forecast available yet
    </h3>

    <p
      className="
        max-w-md
        mx-auto mt-1
        text-slate-500 text-sm leading-6
      "
    >
      Add a savings target and some contribution activity to
      generate a meaningful forecast.
    </p>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const GoalForecast = ({
  forecast,
  loading = false,
  error = null,
  onRetry,
  currency = "NGN",
  locale = "en-NG",
  title = "Savings forecast",
  description = "A projection based on your current savings progress.",
  className = "",
}) => {
  const normalized = useMemo(
    () => normalizeForecast(forecast),
    [forecast]
  );

  const status = useMemo(
    () =>
      getForecastStatus({
        onTrack: normalized.onTrack,
        projectedProgress: normalized.projectedProgress,
        targetAmount: normalized.targetAmount,
        currentAmount: normalized.currentAmount,
      }),
    [normalized]
  );

  const statusStyles =
    STATUS_STYLES[status.tone] || STATUS_STYLES.neutral;

  const StatusIcon = status.icon;

  const hasForecast =
    normalized.targetAmount > 0 ||
    normalized.currentAmount > 0 ||
    normalized.projectedAmount > 0;

  const progress = clamp(normalized.projectedProgress);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error?.message || error}
        onRetry={onRetry}
      />
    );
  }

  if (!hasForecast) {
    return <EmptyState />;
  }

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
      aria-labelledby="goal-forecast-title"
    >
      {/* ===================================================
         HEADER
      =================================================== */}

      <div
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-start
          gap-4
        "
      >
        <div
          className="
            flex items-start
            min-w-0
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              bg-slate-900
              rounded-2xl
              shrink-0
            "
          >
            <TrendingUp
              size={20}
              className="
                text-white
              "
              aria-hidden="true"
            /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h2
              id="goal-forecast-title"
              className="
                font-bold text-slate-900 text-base
              "
            >
              {title}
            </h2>

            <p
              className="
                mt-1
                text-slate-500 text-sm leading-5
              "
            >
              {description}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusStyles.badge}`}
        >
          <StatusIcon
            size={14}
            className={statusStyles.icon}
            aria-hidden="true"
          />

          {status.label}
        </div>
      </div>

      {/* ===================================================
         PRIMARY FORECAST
      =================================================== */}

      <div
        className="
          mt-6
        "
      >
        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-end
            gap-1
          "
        >
          <div>
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Projected progress
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900 text-3xl tracking-tight
              "
            >
              {Math.round(progress)}%
            </p>
          </div>

          {normalized.projectedDate && (
            <div
              className="
                flex items-center
                text-slate-500 text-sm
                gap-2
              "
            >
              <CalendarDays
                size={16}
                aria-hidden="true"
              />

              <span>
                Estimated completion:{" "}
                <strong
                  className="
                    font-semibold text-slate-700
                  "
                >
                  {formatDate(normalized.projectedDate)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div
          className="
            mt-4
          "
        >
          <div
            className="
              overflow-hidden
              h-3
              bg-slate-100
              rounded-full
            "
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Projected savings progress"
          >
            <div
              className="
                h-full
                bg-slate-900
                rounded-full
                transition-all duration-500
              "
              style={{ width: `${progress}%` }}
            /
            >
          </div>
        </div>
      </div>

      {/* ===================================================
         METRICS
      =================================================== */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          mt-5
          gap-3
        "
      >
        <ForecastMetric
          icon={WalletCards}
          label="Current savings"
          value={formatCurrency(
            normalized.currentAmount,
            currency,
            locale
          )}
        />

        <ForecastMetric
          icon={Target}
          label="Remaining"
          value={formatCurrency(
            normalized.remainingAmount,
            currency,
            locale
          )}
        />

        <ForecastMetric
          icon={TrendingUp}
          label="Projected amount"
          value={formatCurrency(
            normalized.projectedAmount,
            currency,
            locale
          )}
        />
      </div>

      {/* ===================================================
         ADDITIONAL INFORMATION
      =================================================== */}

      {(normalized.requiredAmount > 0 ||
        normalized.daysRemaining !== null ||
        normalized.confidence !== null) && (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            mt-3
            gap-3
          "
        >
          {normalized.requiredAmount > 0 && (
            <ForecastMetric
              icon={TrendingDown}
              label="Required contribution"
              value={formatCurrency(
                normalized.requiredAmount,
                currency,
                locale
              )}
              description="Based on the current forecast."
            />
          )}

          {normalized.daysRemaining !== null && (
            <ForecastMetric
              icon={Clock3}
              label="Days remaining"
              value={normalized.daysRemaining.toLocaleString(
                locale
              )}
            />
          )}

          {normalized.confidence !== null && (
            <ForecastMetric
              icon={CheckCircle2}
              label="Forecast confidence"
              value={`${Math.round(
                normalized.confidence
              )}%`}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default GoalForecast;