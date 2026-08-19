import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";

import useSavingsForecast from "../../../../hooks/useSavingsForecast";

import SavingsForecastSummary from "./SavingsForecastSummary";
import SavingsProjectionChart from "./SavingsProjectionChart";
import SavingsGoalForecast from "./SavingsGoalForecast";
import SavingsForecastSkeleton from "./SavingsForecastSkeleton";
import SavingsForecastEmptyState from "./SavingsForecastEmptyState";
import SavingsForecastErrorState from "./SavingsForecastErrorState";

import {
  normalizeForecast,
} from "../../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings Forecast";

const DEFAULT_DESCRIPTION =
  "See how your savings could grow over time and understand what it may take to reach your goals.";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings forecast. Please try again.";

const MAX_PROJECTION_POINTS = 365;

const EMPTY_STRING = "";

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isMeaningful = (value) =>
  value !== undefined &&
  value !== null &&
  value !== EMPTY_STRING;

const firstDefined = (...values) =>
  values.find(isMeaningful);

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return EMPTY_STRING;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || DEFAULT_ERROR_MESSAGE;
  }

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

  return DEFAULT_ERROR_MESSAGE;
};

/* =========================================================
   RESPONSE RESOLUTION
========================================================= */

/**
 * Resolves the actual forecast object from the supported
 * SmartSave response envelopes.
 *
 * This intentionally does NOT blindly use arbitrary `data`
 * objects because an API response envelope should not
 * automatically be interpreted as financial forecast data.
 */
const resolveForecast = ({
  suppliedForecast,
  hookForecast,
  data,
}) => {
  const candidates = [
    suppliedForecast,
    hookForecast,
    data?.forecast,
    data?.data?.forecast,
  ];

  for (const candidate of candidates) {
    if (isObject(candidate)) {
      return candidate;
    }
  }

  return null;
};

/* =========================================================
   FORECAST NORMALIZATION
========================================================= */

/**
 * Normalization is kept at the page boundary so every child
 * receives the same canonical forecast structure.
 */
const safelyNormalizeForecast = (rawForecast) => {
  if (!isObject(rawForecast)) {
    return null;
  }

  try {
    const normalized = normalizeForecast(
      rawForecast
    );

    if (!isObject(normalized)) {
      return null;
    }

    return normalized;
  } catch (error) {
    console.error(
      "SMART_SAVE_FORECAST_NORMALIZATION_ERROR",
      error
    );

    return null;
  }
};

/* =========================================================
   IDENTIFIER RESOLUTION
========================================================= */

const resolveGoalId = (
  forecast,
  fallback = null
) =>
  firstDefined(
    forecast?.goalId,
    forecast?.goal?._id,
    forecast?.goal?.id,
    fallback
  ) ?? null;

/* =========================================================
   PROJECTION RESOLUTION
========================================================= */

/**
 * Projection data should normally already be canonical after
 * normalizeForecast().
 *
 * The fallbacks are intentionally defensive because the
 * backend may expose different historical envelope names.
 */
const resolveProjectionData = (forecast) => {
  if (!isObject(forecast)) {
    return [];
  }

  const candidates = [
    forecast.projections,
    forecast.projection,
    forecast.timeline,
    forecast.forecastPoints,
    forecast.points,
    forecast.series,
  ];

  const projection = candidates.find(
    Array.isArray
  );

  if (!projection) {
    return [];
  }

  return projection
    .filter(Boolean)
    .slice(0, MAX_PROJECTION_POINTS);
};

/* =========================================================
   FORECAST VALIDATION
========================================================= */

/**
 * A forecast object existing does not necessarily mean that
 * it contains meaningful financial information.
 */
const isUsableForecast = (forecast) => {
  if (!isObject(forecast)) {
    return false;
  }

  const financialSignals = [
    forecast.currentAmount,
    forecast.currentBalance,
    forecast.savedAmount,

    forecast.targetAmount,
    forecast.goalAmount,

    forecast.projectedAmount,
    forecast.projectedBalance,
    forecast.forecastAmount,

    forecast.monthlyContribution,
    forecast.requiredContribution,
    forecast.requiredAmount,

    forecast.monthsToGoal,
    forecast.daysRemaining,

    forecast.projectedDate,
    forecast.estimatedCompletionDate,
  ];

  return financialSignals.some(
    isMeaningful
  );
};

/* =========================================================
   HEADER
========================================================= */

const ForecastHeader = memo(
  ({
    title,
    description,
    refreshing,
    canRefresh,
    onRefresh,
  }) => (
    <header
      className="
        flex flex-col sm:flex-row sm:justify-between sm:items-start
        px-5 sm:px-6 py-5
        border-slate-100 border-b
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
            text-white
            bg-slate-900
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <TrendingUp
            size={19}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h1
            id="savings-forecast-title"
            className="
              font-bold text-slate-950 text-lg sm:text-xl tracking-tight
            "
          >
            {title}
          </h1>

          {description ? (
            <p
              className="
                max-w-2xl
                mt-1
                text-slate-500 text-sm leading-6
              "
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {canRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="
            inline-flex justify-center items-center self-start
            min-h-10
            px-3.5
            font-semibold text-slate-700 text-sm
            bg-white hover:bg-slate-50
            border border-slate-200 hover:border-slate-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-slate-400/30
            disabled:opacity-50 shadow-sm transition
            disabled:cursor-not-allowed
            gap-2 shrink-0
          "
          aria-label={
            refreshing
              ? "Refreshing savings forecast"
              : "Refresh savings forecast"
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
            aria-hidden="true"
          />

          <span
            className="
              hidden sm:inline
            "
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      ) : null}
    </header>
  )
);

ForecastHeader.displayName =
  "ForecastHeader";

/* =========================================================
   REFRESH WARNING
========================================================= */

const ForecastRefreshWarning = memo(
  ({
    message,
    refreshing,
    canRefresh,
    onRetry,
  }) => {
    if (!message) {
      return null;
    }

    return (
      <div
        className="
          flex items-start
          mx-5 sm:mx-6 mt-4 p-3.5
          bg-amber-50
          border border-amber-200 rounded-xl
          gap-3
        "
        role="status"
        aria-live="polite"
      >
        <div
          className="
            flex justify-center items-center
            w-8 h-8
            text-amber-700
            bg-amber-100
            rounded-lg
            shrink-0
          "
        >
          <AlertCircle
            size={16}
            aria-hidden="true"
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
              font-semibold text-amber-900 text-sm
            "
          >
            Forecast update failed
          </p>

          <p
            className="
              mt-0.5
              text-amber-700 text-xs leading-5
            "
          >
            Your previous forecast is still
            displayed. {message}
          </p>
        </div>

        {canRefresh ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={refreshing}
            className="
              self-start
              font-semibold text-amber-800 text-xs underline underline-offset-2
              disabled:opacity-50
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            {refreshing
              ? "Retrying..."
              : "Retry"}
          </button>
        ) : null}
      </div>
    );
  }
);

ForecastRefreshWarning.displayName =
  "ForecastRefreshWarning";

/* =========================================================
   REFRESH STATUS
========================================================= */

const ForecastRefreshStatus = memo(
  ({ refreshing }) => {
    if (!refreshing) {
      return null;
    }

    return (
      <div
        className="
          flex justify-center items-center
          pt-1
          text-slate-400 text-xs
          gap-2
        "
        role="status"
        aria-live="polite"
      >
        <RefreshCw
          size={13}
          className="
            animate-spin
          "
          aria-hidden="true"
        /
        >

        Updating your savings forecast...
      </div>
    );
  }
);

ForecastRefreshStatus.displayName =
  "ForecastRefreshStatus";

/* =========================================================
   DATA STATUS
========================================================= */

const ForecastDataStatus = memo(
  ({
    projectionCount,
    refreshing,
  }) => {
    if (
      refreshing ||
      projectionCount <= 0
    ) {
      return null;
    }

    return (
      <div
        className="
          flex justify-between items-center
          pt-2
          text-slate-400 text-xs
        "
      >
        <span>
          Projection updated from your
          current savings data.
        </span>

        <span
          className="
            hidden sm:inline
          "
        >
          {projectionCount}{" "}
          {projectionCount === 1
            ? "projection"
            : "projections"}
        </span>
      </div>
    );
  }
);

ForecastDataStatus.displayName =
  "ForecastDataStatus";

/* =========================================================
   PROJECTION FALLBACK
========================================================= */

const ProjectionUnavailable = memo(
  () => (
    <div
      className="
        flex items-start
        p-4
        bg-slate-50
        border border-slate-200 rounded-xl
        gap-3
      "
    >
      <div
        className="
          flex justify-center items-center
          w-8 h-8
          text-slate-500
          bg-white
          border border-slate-200 rounded-lg
          shrink-0
        "
        aria-hidden="true"
      >
        <TrendingUp size={16} />
      </div>

      <div>
        <p
          className="
            font-semibold text-slate-800 text-sm
          "
        >
          Projection data is not
          available yet
        </p>

        <p
          className="
            mt-1
            text-slate-500 text-xs leading-5
          "
        >
          Your current forecast is
          available, but there isn't
          enough projection data to
          display the growth chart yet.
        </p>
      </div>
    </div>
  )
);

ProjectionUnavailable.displayName =
  "ProjectionUnavailable";

/* =========================================================
   MAIN PAGE
========================================================= */

const SavingForecastPage = ({
  goalId = null,
  planId = null,

  forecast: suppliedForecast = null,

  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,

  className = "",

  showRefresh = true,
  showSummary = true,
  showGoalForecast = true,
  showProjectionChart = true,

  onViewGoal,
}) => {
  /* =======================================================
     REFRESH REQUEST LOCK
  ======================================================= */

  const requestInFlightRef =
    useRef(false);

  /* =======================================================
     FORECAST HOOK
  ======================================================= */

  /**
   * The hook remains the only request integration point.
   *
   * When a forecast is supplied by the parent, fetching is
   * disabled so this page does not create a second request.
   */
  const forecastState =
    useSavingsForecast({
      goalId,
      planId,
      enabled: !suppliedForecast,
    }) || {};

  const {
    forecast: hookForecast = null,
    data = null,

    loading = false,
    isLoading = false,

    refreshing = false,
    isRefreshing = false,

    error = null,

    refresh,
    refetch,
  } = forecastState;

  /* =======================================================
     RAW FORECAST
  ======================================================= */

  const rawForecast = useMemo(
    () =>
      resolveForecast({
        suppliedForecast,
        hookForecast,
        data,
      }),
    [
      suppliedForecast,
      hookForecast,
      data,
    ]
  );

  /* =======================================================
     NORMALIZED FORECAST
  ======================================================= */

  const forecast = useMemo(
    () =>
      safelyNormalizeForecast(
        rawForecast
      ),
    [rawForecast]
  );

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const isLoadingForecast =
    Boolean(
      loading || isLoading
    );

  const isRefreshingForecast =
    Boolean(
      refreshing || isRefreshing
    );

  /* =======================================================
     REFRESH CAPABILITY
  ======================================================= */

  const canRefresh =
    !suppliedForecast &&
    (
      typeof refresh ===
        "function" ||
      typeof refetch ===
        "function"
    );

  /* =======================================================
     REFRESH HANDLER
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      if (
        requestInFlightRef.current
      ) {
        return undefined;
      }

      if (!canRefresh) {
        return undefined;
      }

      requestInFlightRef.current =
        true;

      try {
        if (
          typeof refresh ===
          "function"
        ) {
          return await refresh();
        }

        if (
          typeof refetch ===
          "function"
        ) {
          return await refetch();
        }

        return undefined;
      } catch (error) {
        /*
         * The hook remains responsible for exposing the
         * request error through its state.
         *
         * We deliberately do not throw again here because
         * this handler is triggered by a UI interaction.
         */
        console.error(
          "SMART_SAVE_FORECAST_REFRESH_ERROR",
          error
        );

        return undefined;
      } finally {
        requestInFlightRef.current =
          false;
      }
    }, [
      canRefresh,
      refresh,
      refetch,
    ]);

  /* =======================================================
     GOAL ID
  ======================================================= */

  const resolvedGoalId = useMemo(
    () =>
      resolveGoalId(
        forecast,
        goalId
      ),
    [
      forecast,
      goalId,
    ]
  );

  /* =======================================================
     PROJECTION DATA
  ======================================================= */

  const projectionData = useMemo(
    () =>
      resolveProjectionData(
        forecast
      ),
    [forecast]
  );

  /* =======================================================
     FORECAST VALIDATION
  ======================================================= */

  const hasForecast =
    isUsableForecast(
      forecast
    );

  const hasProjectionData =
    projectionData.length > 0;

  /* =======================================================
     ERROR MESSAGE
  ======================================================= */

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  /* =======================================================
     VIEW STATES
  ======================================================= */

  /**
   * Initial loading:
   *
   * Loading + no existing forecast.
   */
  const showInitialLoading =
    isLoadingForecast &&
    !hasForecast;

  /**
   * Initial error:
   *
   * Error + no usable forecast + request finished.
   */
  const showInitialError =
    Boolean(error) &&
    !isLoadingForecast &&
    !hasForecast;

  /**
   * Empty:
   *
   * No forecast, no error, no active initial request.
   */
  const showEmpty =
    !isLoadingForecast &&
    !error &&
    !hasForecast;

  /* =======================================================
     GOAL NAVIGATION
  ======================================================= */

  const handleViewGoal =
    useCallback(() => {
      if (
        typeof onViewGoal !==
          "function" ||
        !resolvedGoalId
      ) {
        return;
      }

      onViewGoal(
        resolvedGoalId,
        forecast
      );
    }, [
      onViewGoal,
      resolvedGoalId,
      forecast,
    ]);

  /* =======================================================
     SHELL CLASS
  ======================================================= */

  const shellClassName = `
    w-full
    overflow-hidden
    rounded-2xl
    border border-slate-200
    bg-white
    shadow-sm
    ${className}
  `;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (showInitialLoading) {
    return (
      <section
        className={shellClassName}
        aria-labelledby="savings-forecast-title"
        aria-busy="true"
      >
        <ForecastHeader
          title={title}
          description={description}
          refreshing={false}
          canRefresh={false}
        />

        <div
          className="
            p-5 sm:p-6
          "
        >
          <SavingsForecastSkeleton />
        </div>
      </section>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (showInitialError) {
    return (
      <section
        className={shellClassName}
        aria-labelledby="savings-forecast-title"
      >
        <ForecastHeader
          title={title}
          description={description}
          refreshing={false}
          canRefresh={false}
        />

        <div
          className="
            p-5 sm:p-6
          "
        >
          <SavingsForecastErrorState
            message={
              errorMessage ||
              DEFAULT_ERROR_MESSAGE
            }
            onRetry={
              canRefresh
                ? handleRefresh
                : undefined
            }
            retrying={
              isRefreshingForecast
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (showEmpty) {
    return (
      <section
        className={shellClassName}
        aria-labelledby="savings-forecast-title"
      >
        <ForecastHeader
          title={title}
          description={description}
          refreshing={
            isRefreshingForecast
          }
          canRefresh={
            showRefresh &&
            canRefresh
          }
          onRefresh={
            handleRefresh
          }
        />

        <div
          className="
            p-5 sm:p-6
          "
        >
          <SavingsForecastEmptyState
            onRetry={
              canRefresh
                ? handleRefresh
                : undefined
            }
            isRefreshing={
              isRefreshingForecast
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN CONTENT
  ======================================================= */

  return (
    <section
      className={shellClassName}
      aria-labelledby="savings-forecast-title"
      aria-busy={
        isRefreshingForecast
      }
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <ForecastHeader
        title={title}
        description={description}
        refreshing={
          isRefreshingForecast
        }
        canRefresh={
          showRefresh &&
          canRefresh
        }
        onRefresh={
          handleRefresh
        }
      />

      {/* ===================================================
          REFRESH ERROR
      =================================================== */}

      {error && hasForecast ? (
        <ForecastRefreshWarning
          message={errorMessage}
          refreshing={
            isRefreshingForecast
          }
          canRefresh={
            canRefresh
          }
          onRetry={
            handleRefresh
          }
        />
      ) : null}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          space-y-6 p-5 sm:p-6
        "
      >
        {/* =================================================
            SUMMARY
        ================================================= */}

        {showSummary ? (
          <section
            aria-label="Savings forecast summary"
          >
            <SavingsForecastSummary
              forecast={forecast}
            />
          </section>
        ) : null}

        {/* =================================================
            GOAL FORECAST
        ================================================= */}

        {showGoalForecast ? (
          <section
            aria-label="Savings goal forecast"
          >
            <SavingsGoalForecast
              forecast={forecast}
              goalId={resolvedGoalId}
              onViewGoal={
                typeof onViewGoal ===
                "function"
                  ? handleViewGoal
                  : undefined
              }
            />
          </section>
        ) : null}

        {/* =================================================
            PROJECTION
        ================================================= */}

        {showProjectionChart &&
        hasProjectionData ? (
          <section
            aria-label="Savings projection"
          >
            <SavingsProjectionChart
              forecast={forecast}
              goalId={resolvedGoalId}
              planId={planId}
            />
          </section>
        ) : null}

        {/* =================================================
            NO PROJECTION FALLBACK
        ================================================= */}

        {showProjectionChart &&
        hasForecast &&
        !hasProjectionData ? (
          <ProjectionUnavailable />
        ) : null}

        {/* =================================================
            DATA STATUS
        ================================================= */}

        <ForecastDataStatus
          projectionCount={
            projectionData.length
          }
          refreshing={
            isRefreshingForecast
          }
        />

        {/* =================================================
            REFRESH STATUS
        ================================================= */}

        <ForecastRefreshStatus
          refreshing={
            isRefreshingForecast
          }
        />
      </div>
    </section>
  );
};

/* =========================================================
   DISPLAY NAME
========================================================= */

SavingForecastPage.displayName =
  "SavingForecastPage";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingForecastPage
);