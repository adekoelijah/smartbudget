import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { memo, useMemo } from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_LOCALE = "en-NG";

const DEFAULT_TITLE = "Savings forecast";

const DEFAULT_DESCRIPTION =
  "A projection based on your current savings progress.";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't calculate your savings forecast right now.";

const DEFAULT_FORECAST = Object.freeze({
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
});

/* =========================================================
   SAFE HELPERS
========================================================= */

const isFiniteNumber = (value) =>
  typeof value === "number" &&
  Number.isFinite(value);

const toNumber = (
  value,
  fallback = 0
) => {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const clamp = (
  value,
  min = 0,
  max = 100
) => {
  const numeric = toNumber(value, min);

  return Math.min(
    Math.max(numeric, min),
    max
  );
};

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const normalizeText = (
  value,
  fallback = ""
) =>
  typeof value === "string" &&
  value.trim()
    ? value.trim()
    : fallback;

const normalizeCurrency = (
  value
) =>
  normalizeText(
    value,
    DEFAULT_CURRENCY
  ).toUpperCase();

const normalizeLocale = (
  value
) =>
  normalizeText(
    value,
    DEFAULT_LOCALE
  );

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const getErrorMessage = (
  error
) => {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof error === "string") {
    return (
      error.trim() ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  if (error instanceof Error) {
    return (
      error.message?.trim() ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  if (
    typeof error === "object"
  ) {
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.data?.message ??
      error?.data?.error ??
      error?.message ??
      error?.error;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message.trim();
    }
  }

  return DEFAULT_ERROR_MESSAGE;
};

/* =========================================================
   FORECAST NORMALIZER
========================================================= */

const normalizeForecast = (
  forecast
) => {
  if (
    !forecast ||
    typeof forecast !== "object" ||
    Array.isArray(forecast)
  ) {
    return DEFAULT_FORECAST;
  }

  const currentAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        forecast.currentAmount,
        forecast.currentBalance,
        forecast.savedAmount,
        forecast.current
      )
    )
  );

  const targetAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        forecast.targetAmount,
        forecast.goalAmount,
        forecast.target
      )
    )
  );

  const projectedAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        forecast.projectedAmount,
        forecast.projectedBalance,
        forecast.forecastAmount
      )
    )
  );

  const calculatedRemaining = Math.max(
    0,
    targetAmount - currentAmount
  );

  const remainingAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        forecast.remainingAmount,
        forecast.amountRemaining,
        calculatedRemaining
      )
    )
  );

  const rawProjectedProgress =
    firstDefined(
      forecast.projectedProgress,
      forecast.projectedPercentage
    );

  const projectedProgress =
    rawProjectedProgress !==
      undefined
      ? clamp(
          rawProjectedProgress
        )
      : targetAmount > 0
        ? clamp(
            (projectedAmount /
              targetAmount) *
              100
          )
        : 0;

  const projectedDate =
    firstDefined(
      forecast.projectedDate,
      forecast.estimatedCompletionDate,
      forecast.expectedCompletionDate
    ) ?? null;

  const requiredAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        forecast.requiredAmount,
        forecast.requiredContribution,
        forecast.requiredPerPeriod
      )
    )
  );

  const confidenceValue =
    forecast.confidence;

  const confidence =
    confidenceValue !==
      undefined &&
    confidenceValue !== null &&
    confidenceValue !== ""
      ? clamp(
          confidenceValue
        )
      : null;

  const daysValue =
    forecast.daysRemaining;

  const daysRemaining =
    daysValue !==
      undefined &&
    daysValue !== null &&
    daysValue !== ""
      ? Math.max(
          0,
          Math.round(
            toNumber(daysValue)
          )
        )
      : null;

  const onTrack =
    typeof forecast.onTrack ===
    "boolean"
      ? forecast.onTrack
      : null;

  return {
    currentAmount,
    targetAmount,
    remainingAmount,
    projectedAmount,
    projectedProgress,
    projectedDate,
    requiredAmount,
    onTrack,
    confidence,
    daysRemaining,
  };
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (
  value,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
) => {
  const safeCurrency =
    normalizeCurrency(currency);

  const safeLocale =
    normalizeLocale(locale);

  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat(
      safeLocale,
      {
        style: "currency",
        currency: safeCurrency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toLocaleString(
      safeLocale
    )}`;
  }
};

const formatDate = (
  value,
  locale = DEFAULT_LOCALE
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat(
      normalizeLocale(locale),
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return "Not available";
  }
};

/* =========================================================
   FORECAST STATUS
========================================================= */

const getForecastStatus = ({
  onTrack,
  projectedProgress,
  targetAmount,
  currentAmount,
}) => {
  if (
    targetAmount > 0 &&
    currentAmount >= targetAmount
  ) {
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

  if (
    projectedProgress >= 100
  ) {
    return {
      label:
        "Projected to reach goal",
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

const STATUS_STYLES = Object.freeze({
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
});

/* =========================================================
   FORECAST METRIC
========================================================= */

const ForecastMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
  }) => {
    if (
      typeof Icon !== "function"
    ) {
      return null;
    }

    return (
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
            aria-hidden="true"
          >
            <Icon
              size={17}
              className="
                text-slate-600
              "
              strokeWidth={2}
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
                  mt-1
                  text-slate-500 text-xs
                "
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

ForecastMetric.displayName =
  "ForecastMetric";

/* =========================================================
   LOADING STATE
========================================================= */

const LoadingState = memo(
  () => (
    <section
      className="
        w-full
        p-5
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
      role="status"
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
          aria-hidden="true"
        /
        >

        <div
          className="
            w-56 h-10
            bg-slate-200
            rounded
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            w-full h-3
            bg-slate-200
            rounded
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            grid grid-cols-1 sm:grid-cols-3
            gap-3
          "
        >
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-20
                bg-slate-100
                rounded-2xl
              "
              aria-hidden="true"
            /
            >
          ))}
        </div>
      </div>

      <span
        className="
          sr-only
        "
      >
        Loading savings forecast.
        Please wait.
      </span>
    </section>
  )
);

LoadingState.displayName =
  "GoalForecastLoadingState";

/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = memo(
  ({
    message,
    onRetry,
  }) => {
    const safeMessage =
      getErrorMessage(message);

    const canRetry =
      typeof onRetry ===
      "function";

    return (
      <section
        className="
          w-full
          p-5
          bg-white
          border border-red-100 rounded-3xl
          shadow-sm
        "
        role="alert"
        aria-live="assertive"
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
            aria-hidden="true"
          >
            <AlertTriangle
              size={18}
              className="
                text-red-600
              "
              strokeWidth={2}
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
              {safeMessage}
            </p>

            {canRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-3 px-4 py-2
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800 active:bg-slate-700
                  rounded-xl focus:outline-none
                  transition-colors
                  focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
                "
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }
);

ErrorState.displayName =
  "GoalForecastErrorState";

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = memo(
  () => (
    <section
      className="
        w-full
        p-6
        text-center
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
      role="status"
      aria-live="polite"
    >
      <div
        className="
          flex justify-center items-center
          w-12 h-12
          mx-auto
          bg-slate-100
          rounded-2xl
        "
        aria-hidden="true"
      >
        <Target
          size={21}
          className="
            text-slate-600
          "
          strokeWidth={2}
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
        Add a savings target and
        some contribution activity
        to generate a meaningful
        forecast.
      </p>
    </section>
  )
);

EmptyState.displayName =
  "GoalForecastEmptyState";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const GoalForecast = ({
  forecast = null,

  loading = false,

  error = null,

  onRetry,

  currency = DEFAULT_CURRENCY,

  locale = DEFAULT_LOCALE,

  title = DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  className = "",
}) => {
  /* =======================================================
     NORMALIZED FORECAST
  ======================================================= */

  const normalized =
    useMemo(
      () =>
        normalizeForecast(
          forecast
        ),
      [forecast]
    );

  /* =======================================================
     STATUS
  ======================================================= */

  const status =
    useMemo(
      () =>
        getForecastStatus({
          onTrack:
            normalized.onTrack,

          projectedProgress:
            normalized.projectedProgress,

          targetAmount:
            normalized.targetAmount,

          currentAmount:
            normalized.currentAmount,
        }),
      [normalized]
    );

  const statusStyles =
    STATUS_STYLES[
      status.tone
    ] ??
    STATUS_STYLES.neutral;

  /* =======================================================
     SAFE DISPLAY VALUES
  ======================================================= */

  const safeCurrency =
    normalizeCurrency(
      currency
    );

  const safeLocale =
    normalizeLocale(locale);

  const progress =
    clamp(
      normalized.projectedProgress
    );

  const hasForecast =
    normalized.targetAmount >
      0 ||
    normalized.currentAmount >
      0 ||
    normalized.projectedAmount >
      0;

  const hasAdditionalMetrics =
    normalized.requiredAmount >
      0 ||
    normalized.daysRemaining !==
      null ||
    normalized.confidence !==
      null;

  /* =======================================================
     EARLY STATES
  ======================================================= */

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={
          typeof onRetry ===
          "function"
            ? onRetry
            : undefined
        }
      />
    );
  }

  if (!hasForecast) {
    return <EmptyState />;
  }

  const StatusIcon =
    status.icon;

  return (
    <section
      className={[
        "w-full rounded-3xl",
        "border border-slate-200",
        "bg-white p-5 shadow-sm",
        typeof className ===
        "string"
          ? className.trim()
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
            aria-hidden="true"
          >
            <TrendingUp
              size={20}
              className="
                text-white
              "
              strokeWidth={2}
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
              {normalizeText(
                title,
                DEFAULT_TITLE
              )}
            </h2>

            <p
              className="
                mt-1
                text-slate-500 text-sm leading-5
              "
            >
              {normalizeText(
                description,
                DEFAULT_DESCRIPTION
              )}
            </p>
          </div>
        </div>

        <div
          className={[
            "inline-flex w-fit",
            "items-center gap-1.5",
            "rounded-full",
            "px-3 py-1.5",
            "text-xs font-semibold",
            "ring-1",
            statusStyles.badge,
          ].join(" ")}
          role="status"
          aria-label={`Forecast status: ${status.label}`}
        >
          {typeof StatusIcon ===
          "function" ? (
            <StatusIcon
              size={14}
              className={
                statusStyles.icon
              }
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}

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
              {Math.round(
                progress
              )}
              %
            </p>
          </div>

          {normalized.projectedDate ? (
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
                  {formatDate(
                    normalized.projectedDate,
                    safeLocale
                  )}
                </strong>
              </span>
            </div>
          ) : null}
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
            aria-valuenow={Math.round(
              progress
            )}
            aria-label="Projected savings progress"
          >
            <div
              className="
                h-full
                bg-slate-900
                rounded-full
                transition-[width] duration-500 ease-out
              "
              style={{
                width: `${progress}%`,
              }}
            /
            >
          </div>
        </div>
      </div>

      {/* ===================================================
          CORE METRICS
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
            safeCurrency,
            safeLocale
          )}
        />

        <ForecastMetric
          icon={Target}
          label="Remaining"
          value={formatCurrency(
            normalized.remainingAmount,
            safeCurrency,
            safeLocale
          )}
        />

        <ForecastMetric
          icon={TrendingUp}
          label="Projected amount"
          value={formatCurrency(
            normalized.projectedAmount,
            safeCurrency,
            safeLocale
          )}
        />
      </div>

      {/* ===================================================
          ADDITIONAL INFORMATION
      =================================================== */}

      {hasAdditionalMetrics ? (
        <div
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            mt-3
            gap-3
          "
        >
          {normalized.requiredAmount >
          0 ? (
            <ForecastMetric
              icon={TrendingDown}
              label="Required contribution"
              value={formatCurrency(
                normalized.requiredAmount,
                safeCurrency,
                safeLocale
              )}
              description="Based on the current forecast."
            />
          ) : null}

          {normalized.daysRemaining !==
          null ? (
            <ForecastMetric
              icon={Clock3}
              label="Days remaining"
              value={normalized.daysRemaining.toLocaleString(
                safeLocale
              )}
            />
          ) : null}

          {normalized.confidence !==
          null ? (
            <ForecastMetric
              icon={CheckCircle2}
              label="Forecast confidence"
              value={`${Math.round(
                normalized.confidence
              )}%`}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

GoalForecast.displayName =
  "GoalForecast";

export default memo(
  GoalForecast
);