
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
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
   INTERNAL HELPERS
========================================================= */

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

/**
 * Resolve the most likely forecast object from the
 * different shapes supported by the SmartSave service/hook.
 */
const resolveForecast = ({
  suppliedForecast,
  hookForecast,
  data,
}) => {
  return firstDefined(
    suppliedForecast,
    hookForecast,
    data?.forecast,
    data
  );
};

/**
 * Normalize errors at the UI boundary.
 *
 * The service layer remains responsible for API error
 * normalization. This prevents raw Axios/backend objects
 * from reaching presentation components.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    "We couldn't load your savings forecast."
  );
};

/**
 * Resolve a stable identifier when a forecast is associated
 * with a specific savings goal.
 */
const getGoalId = (forecast, fallback) =>
  firstDefined(
    forecast?.goalId,
    forecast?.goal?._id,
    forecast?.goal?.id,
    fallback
  );

/**
 * Resolve a stable plan identifier.
 */
const getPlanId = (forecast, fallback) =>
  firstDefined(
    forecast?.planId,
    forecast?.plan?._id,
    forecast?.plan?.id,
    fallback
  );

/**
 * Safely resolve projection data.
 *
 * SavingsProjectionChart owns chart-specific formatting.
 * This helper only determines which collection to pass.
 */
const resolveProjectionData = (forecast) => {
  if (!forecast) {
    return [];
  }

  if (Array.isArray(forecast.projections)) {
    return forecast.projections;
  }

  if (Array.isArray(forecast.projection)) {
    return forecast.projection;
  }

  if (Array.isArray(forecast.timeline)) {
    return forecast.timeline;
  }

  if (Array.isArray(forecast.forecast)) {
    return forecast.forecast;
  }

  if (Array.isArray(forecast.data)) {
    return forecast.data;
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastCard = ({
  goalId = null,
  planId = null,

  /*
   * Allows a parent that already possesses forecast data
   * to render immediately without another request.
   */
  forecast: suppliedForecast = null,

  title = "Savings Forecast",

  description =
    "Understand where your savings are heading and what it may take to reach your target.",

  className = "",

  showRefresh = true,

  showProjectionChart = true,

  showGoalForecast = true,

  showSummary = true,

  onViewGoal,

  onViewPlan,
}) => {
  /* =======================================================
     FORECAST HOOK
  ======================================================= */

  const forecastState = useSavingsForecast({
    goalId,
    planId,

    /*
     * The hook should use this flag to prevent unnecessary
     * service requests when the parent already supplied data.
     */
    enabled: !suppliedForecast,
  });

  const {
    forecast: hookForecast,
    data,
    loading = false,
    isLoading = false,
    refreshing = false,
    isRefreshing = false,
    error = null,
    refresh,
    refetch,
  } = forecastState || {};

  /* =======================================================
     FORECAST RESOLUTION
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
     NORMALIZATION
  ======================================================= */

  const forecast = useMemo(() => {
    if (!rawForecast) {
      return null;
    }

    const normalized =
      normalizeForecast(rawForecast);

    return normalized || null;
  }, [rawForecast]);

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const isLoadingForecast =
    Boolean(loading) ||
    Boolean(isLoading);

  const isRefreshingForecast =
    Boolean(refreshing) ||
    Boolean(isRefreshing);

  /*
   * Refresh/refetch are resolved once and exposed to the
   * event handler through a stable callback.
   */
  const refreshForecast = useCallback(async () => {
    if (typeof refresh === "function") {
      return refresh();
    }

    if (typeof refetch === "function") {
      return refetch();
    }

    return undefined;
  }, [
    refresh,
    refetch,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const projectionData = useMemo(
    () =>
      resolveProjectionData(
        forecast
      ),
    [forecast]
  );

  const resolvedGoalId = useMemo(
    () =>
      getGoalId(
        forecast,
        goalId
      ),
    [
      forecast,
      goalId,
    ]
  );

  const resolvedPlanId = useMemo(
    () =>
      getPlanId(
        forecast,
        planId
      ),
    [
      forecast,
      planId,
    ]
  );

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  const hasForecast =
    Boolean(forecast);

  const isEmpty =
    !isLoadingForecast &&
    !error &&
    !hasForecast;

  /* =======================================================
     EVENT HANDLERS
  ======================================================= */

  const handleRefresh = useCallback(() => {
    void refreshForecast();
  }, [refreshForecast]);

  const handleViewGoal = useCallback(() => {
    if (
      typeof onViewGoal !== "function" ||
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

  const handleViewPlan = useCallback(() => {
    if (
      typeof onViewPlan !== "function" ||
      !resolvedPlanId
    ) {
      return;
    }

    onViewPlan(
      resolvedPlanId,
      forecast
    );
  }, [
    onViewPlan,
    resolvedPlanId,
    forecast,
  ]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (
    isLoadingForecast &&
    !hasForecast
  ) {
    return (
      <section
        className={`
          rounded-2xl
          border border-slate-200
          bg-white
          p-5
          shadow-sm
          ${className}
        `}
        aria-label="Savings forecast"
      >
        <SavingsForecastSkeleton />
      </section>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (
    error &&
    !hasForecast
  ) {
    return (
      <section
        className={`
          rounded-2xl
          border border-slate-200
          bg-white
          p-5
          shadow-sm
          ${className}
        `}
        aria-label="Savings forecast"
      >
        <SavingsForecastErrorState
          message={errorMessage}
          onRetry={
            typeof refreshForecast === "function"
              ? handleRefresh
              : undefined
          }
          retrying={
            isRefreshingForecast
          }
        />
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (isEmpty) {
    return (
      <section
        className={className}
        aria-label="Savings forecast"
      >
        <SavingsForecastEmptyState
          onRetry={
            typeof refreshForecast === "function"
              ? handleRefresh
              : undefined
          }
          isRefreshing={
            isRefreshingForecast
          }
        />
      </section>
    );
  }

  /* =======================================================
     MAIN CONTENT
  ======================================================= */

  return (
    <section
      className={`
        w-full
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        ${className}
      `}
      aria-labelledby="savings-forecast-title"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-10 h-10
                text-slate-700
                bg-slate-100
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <TrendingUp
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="savings-forecast-title"
                className="
                  font-bold text-slate-900 text-base sm:text-lg tracking-tight
                "
              >
                {title}
              </h2>

              {description && (
                <p
                  className="
                    max-w-2xl
                    mt-1
                    text-slate-500 text-xs sm:text-sm leading-5
                  "
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {showRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              isRefreshingForecast
            }
            className="
              inline-flex justify-center items-center self-start
              w-9 h-9
              text-slate-500 hover:text-slate-900
              bg-white hover:bg-slate-50
              border border-slate-200 hover:border-slate-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-slate-400/30
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
            aria-label={
              isRefreshingForecast
                ? "Refreshing savings forecast"
                : "Refresh savings forecast"
            }
            title="Refresh forecast"
          >
            <RefreshCw
              size={15}
              className={
                isRefreshingForecast
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />
          </button>
        )}
      </header>

      {/* ===================================================
          NON-BLOCKING ERROR
      =================================================== */}

      {error && hasForecast && (
        <div
          className="
            flex items-start
            mx-5 sm:mx-6 mt-4 p-3
            text-amber-800 text-xs
            bg-amber-50
            border border-amber-200 rounded-xl
            gap-2
          "
          role="status"
        >
          <AlertCircle
            size={15}
            className="
              mt-0.5
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <div
            className="
              flex-1
            "
          >
            <p
              className="
                font-medium
              "
            >
              Forecast may be outdated.
            </p>

            <p
              className="
                mt-0.5
                text-amber-700
              "
            >
              {errorMessage}
            </p>
          </div>

          {typeof refreshForecast === "function" && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                isRefreshingForecast
              }
              className="
                font-semibold underline underline-offset-2
                disabled:opacity-50
              "
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ===================================================
          FORECAST CONTENT
      =================================================== */}

      <div
        className="
          space-y-5 p-5 sm:p-6
        "
      >
        {/* =================================================
            FORECAST SUMMARY
        ================================================= */}

        {showSummary && (
          <SavingsForecastSummary
            forecast={forecast}
          />
        )}

        {/* =================================================
            GOAL FORECAST
        ================================================= */}

        {showGoalForecast && (
          <SavingsGoalForecast
            forecast={forecast}
            goalId={resolvedGoalId}
            onViewGoal={
              typeof onViewGoal === "function"
                ? handleViewGoal
                : undefined
            }
          />
        )}

        {/* =================================================
            PROJECTION CHART
        ================================================= */}

        {showProjectionChart &&
          projectionData.length > 0 && (
            <SavingsProjectionChart
              forecast={forecast}
              projections={
                projectionData
              }
              goalId={resolvedGoalId}
              planId={resolvedPlanId}
              onViewGoal={
                typeof onViewGoal === "function"
                  ? handleViewGoal
                  : undefined
              }
              onViewPlan={
                typeof onViewPlan === "function"
                  ? handleViewPlan
                  : undefined
              }
            />
          )}

        {/* =================================================
            BACKGROUND REFRESH
        ================================================= */}

        {isRefreshingForecast && (
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
        )}
      </div>
    </section>
  );
};

export default memo(
  SavingsForecastCard
);

