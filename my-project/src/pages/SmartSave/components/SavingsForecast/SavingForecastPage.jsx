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
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings Forecast";

const DEFAULT_DESCRIPTION =
  "Understand where your savings are heading and what it may take to reach your target.";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings forecast.";

const EMPTY_STRING = "";

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Returns the first meaningful value.
 *
 * Important:
 * - 0 is considered valid.
 * - false is considered valid.
 * - null / undefined / empty string are ignored.
 */
const firstDefined = (...values) => {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== EMPTY_STRING
  );
};

/**
 * Safely resolve an error into a user-facing message.
 *
 * Raw Axios/backend error objects should never be rendered
 * directly by presentation components.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return EMPTY_STRING;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    DEFAULT_ERROR_MESSAGE
  );
};

/**
 * Resolve the forecast from supported hook/service envelopes.
 *
 * The hook/service layer remains the source of truth.
 * This function only protects the presentation boundary
 * against inconsistent response wrappers.
 */
const resolveForecast = ({
  suppliedForecast,
  hookForecast,
  data,
}) => {
  const resolved = firstDefined(
    suppliedForecast,
    hookForecast,
    data?.forecast,
    data
  );

  if (
    !resolved ||
    typeof resolved !== "object" ||
    Array.isArray(resolved)
  ) {
    return null;
  }

  return resolved;
};

/**
 * Resolve a stable savings-goal identifier.
 */
const resolveGoalId = (
  forecast,
  fallback = null
) => {
  return firstDefined(
    forecast?.goalId,
    forecast?.goal?._id,
    forecast?.goal?.id,
    fallback
  ) ?? null;
};

/**
 * Resolve a stable savings-plan identifier.
 */
const resolvePlanId = (
  forecast,
  fallback = null
) => {
  return firstDefined(
    forecast?.planId,
    forecast?.plan?._id,
    forecast?.plan?.id,
    fallback
  ) ?? null;
};

/**
 * Resolve projection/timeline data.
 *
 * Chart-specific transformation remains inside
 * SavingsProjectionChart.
 */
const resolveProjectionData = (
  forecast
) => {
  if (!forecast) {
    return [];
  }

  const candidates = [
    forecast?.projections,
    forecast?.projection,
    forecast?.timeline,
    forecast?.forecast,
    forecast?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

/* =========================================================
   HEADER
========================================================= */

const ForecastHeader = memo(
  ({
    title,
    description,
    showRefresh,
    refreshing,
    canRefresh,
    onRefresh,
  }) => {
    return (
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

            {description ? (
              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-xs sm:text-sm leading-5
                "
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {showRefresh && canRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
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
              refreshing
                ? "Refreshing savings forecast"
                : "Refresh savings forecast"
            }
            title="Refresh forecast"
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
          </button>
        ) : null}
      </header>
    );
  }
);

ForecastHeader.displayName =
  "ForecastHeader";

/* =========================================================
   NON-BLOCKING ERROR
========================================================= */

const ForecastRefreshWarning = memo(
  ({
    message,
    refreshing,
    canRefresh,
    onRetry,
  }) => {
    return (
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
        aria-live="polite"
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
            min-w-0
          "
        >
          <p
            className="
              font-medium
            "
          >
            Forecast may be outdated.
          </p>

          {message ? (
            <p
              className="
                mt-0.5
                text-amber-700
              "
            >
              {message}
            </p>
          ) : null}
        </div>

        {canRefresh ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={refreshing}
            className="
              font-semibold underline underline-offset-2
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
  ({
    refreshing,
  }) => {
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
   PAGE
========================================================= */

const SavingForecastPage = ({
  goalId = null,
  planId = null,

  /**
   * Optional externally supplied forecast.
   *
   * When supplied, the page does not need to request
   * forecast data again.
   */
  forecast: suppliedForecast = null,

  title = DEFAULT_TITLE,

  description = DEFAULT_DESCRIPTION,

  className = "",

  showRefresh = true,

  showSummary = true,

  showGoalForecast = true,

  showProjectionChart = true,

  onViewGoal,

  onViewPlan,
}) => {
  /* =======================================================
     FORECAST DATA OWNER
  ======================================================= */

  /**
   * IMPORTANT ARCHITECTURAL RULE:
   *
   * This is the ONLY component in this forecast tree
   * that owns useSavingsForecast().
   *
   * SavingsForecastSummary
   * SavingsGoalForecast
   * SavingsProjectionChart
   * SavingsForecastSkeleton
   * SavingsForecastEmptyState
   * SavingsForecastErrorState
   *
   * must remain presentation components.
   */
  const forecastState =
    useSavingsForecast({
      goalId,
      planId,
      enabled:
        !suppliedForecast,
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
     RESOLVE FORECAST
  ======================================================= */

  const rawForecast =
    useMemo(
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
     NORMALIZE FORECAST
  ======================================================= */

  const forecast =
    useMemo(() => {
      if (!rawForecast) {
        return null;
      }

      const normalized =
        normalizeForecast(
          rawForecast
        );

      return normalized || null;
    }, [
      rawForecast,
    ]);

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const isLoadingForecast =
    Boolean(
      loading ||
        isLoading
    );

  const isRefreshingForecast =
    Boolean(
      refreshing ||
        isRefreshing
    );

  /* =======================================================
     REFRESH CAPABILITY
  ======================================================= */

  const canRefresh =
    typeof refresh ===
      "function" ||
    typeof refetch ===
      "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshForecast =
    useCallback(
      async () => {
        if (
          typeof refresh ===
          "function"
        ) {
          return refresh();
        }

        if (
          typeof refetch ===
          "function"
        ) {
          return refetch();
        }

        return undefined;
      },
      [
        refresh,
        refetch,
      ]
    );

  const handleRefresh =
    useCallback(() => {
      void refreshForecast();
    }, [
      refreshForecast,
    ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const projectionData =
    useMemo(
      () =>
        resolveProjectionData(
          forecast
        ),
      [forecast]
    );

  const resolvedGoalId =
    useMemo(
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

  const resolvedPlanId =
    useMemo(
      () =>
        resolvePlanId(
          forecast,
          planId
        ),
      [
        forecast,
        planId,
      ]
    );

  const errorMessage =
    useMemo(
      () =>
        getErrorMessage(
          error
        ),
      [error]
    );

  const hasForecast =
    Boolean(forecast);

  const hasProjectionData =
    projectionData.length > 0;

  const showInitialLoading =
    isLoadingForecast &&
    !hasForecast;

  const showInitialError =
    Boolean(error) &&
    !hasForecast;

  const showEmpty =
    !isLoadingForecast &&
    !error &&
    !hasForecast;

  /* =======================================================
     VIEW GOAL
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
     VIEW PLAN
  ======================================================= */

  const handleViewPlan =
    useCallback(() => {
      if (
        typeof onViewPlan !==
          "function" ||
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
     SHARED SHELL
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
          showRefresh={false}
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
          showRefresh={false}
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
              errorMessage
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
     EMPTY STATE
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
          showRefresh={showRefresh}
          refreshing={
            isRefreshingForecast
          }
          canRefresh={
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
     MAIN RENDER
  ======================================================= */

  return (
    <section
      className={shellClassName}
      aria-labelledby="savings-forecast-title"
      aria-busy={
        isRefreshingForecast
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <ForecastHeader
        title={title}
        description={description}
        showRefresh={
          showRefresh
        }
        refreshing={
          isRefreshingForecast
        }
        canRefresh={
          canRefresh
        }
        onRefresh={
          handleRefresh
        }
      />

      {/* =================================================
          NON-BLOCKING REFRESH ERROR
      ================================================= */}

      {error && hasForecast ? (
        <ForecastRefreshWarning
          message={
            errorMessage
          }
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

      {/* =================================================
          FORECAST CONTENT
      ================================================= */}

      <div
        className="
          space-y-5 p-5 sm:p-6
        "
      >
        {/* ===============================================
            SUMMARY
        =============================================== */}

        {showSummary ? (
          <SavingsForecastSummary
            forecast={
              forecast
            }
          />
        ) : null}

        {/* ===============================================
            GOAL FORECAST
        =============================================== */}

        {showGoalForecast ? (
          <SavingsGoalForecast
            forecast={
              forecast
            }
            goalId={
              resolvedGoalId
            }
            onViewGoal={
              typeof onViewGoal ===
              "function"
                ? handleViewGoal
                : undefined
            }
          />
        ) : null}

        {/* ===============================================
            PROJECTION CHART
        =============================================== */}

        {showProjectionChart &&
        hasProjectionData ? (
          <SavingsProjectionChart
            forecast={
              forecast
            }
            projections={
              projectionData
            }
            goalId={
              resolvedGoalId
            }
            planId={
              resolvedPlanId
            }
            onViewGoal={
              typeof onViewGoal ===
              "function"
                ? handleViewGoal
                : undefined
            }
            onViewPlan={
              typeof onViewPlan ===
              "function"
                ? handleViewPlan
                : undefined
            }
          />
        ) : null}

        {/* ===============================================
            BACKGROUND REFRESH
        =============================================== */}

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
   MEMOIZATION
========================================================= */

export default memo(
  SavingForecastPage
);