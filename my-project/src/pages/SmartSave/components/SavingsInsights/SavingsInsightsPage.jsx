import {
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
} from "react";

import useSavingsInsights from "../../../../hooks/useSavingsInsights";

import SavingsInsightCard from "./SavingsInsightCard";
import SavingsInsightEmptyState from "./SavingsInsightEmptyState";
import SavingsRecommendation from "./SavingsRecommendation";

import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

import {
  normalizeSavingsInsights,
} from "../../../../utils/smartSave/savingsNormalizers";

import {
  SAVINGS_INSIGHT_TYPES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_LIMIT = 5;
const MAX_RECOMMENDATIONS = 3;

const DEFAULT_TITLE = "Savings insights";

const DEFAULT_DESCRIPTION =
  "SmartSave analyzes your savings activity and goals to surface useful financial intelligence.";

const DEFAULT_ERROR =
  "We could not load your savings insights.";

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Resolve an array from the supported SmartSave response
 * shapes without allowing malformed API responses to
 * reach presentation components.
 */
const resolveInsights = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.insights)) {
    return value.insights;
  }

  if (Array.isArray(value?.data?.insights)) {
    return value.data.insights;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.data?.items)) {
    return value.data.items;
  }

  return [];
};

/**
 * Resolve the canonical insight identifier.
 */
const getInsightId = (insight) => {
  if (!insight) {
    return null;
  }

  return (
    insight?._id ??
    insight?.id ??
    insight?.insightId ??
    null
  );
};

/**
 * Generate a stable React key.
 *
 * Backend identifiers are always preferred.
 * The index is only a final defensive fallback for malformed
 * records that somehow reach the UI.
 */
const getInsightKey = (insight, index) => {
  const id = getInsightId(insight);

  if (id !== null && id !== undefined && id !== "") {
    return `insight-${String(id)}`;
  }

  return `insight-fallback-${index}`;
};

/**
 * Resolve the insight type defensively.
 */
const getInsightType = (insight) =>
  String(
    insight?.type ??
      insight?.insightType ??
      insight?.category ??
      ""
  )
    .trim()
    .toLowerCase();

/**
 * Determine whether an insight is an actionable
 * recommendation.
 *
 * The canonical SmartSave constant remains the source
 * of truth, while the fallback protects the UI if the
 * constant is unavailable.
 */
const isRecommendation = (insight) => {
  const type = getInsightType(insight);

  const recommendationType = String(
    SAVINGS_INSIGHT_TYPES?.RECOMMENDATION ??
      "recommendation"
  )
    .trim()
    .toLowerCase();

  return type === recommendationType;
};

/**
 * Convert any service/hook error into a safe presentation
 * message.
 *
 * Raw Axios/backend error objects never reach child UI
 * components.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return error.trim() || DEFAULT_ERROR;
  }

  const message =
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.data?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR;
};

/**
 * Resolve a safe positive display limit.
 */
const resolveLimit = (value) => {
  const numericLimit = Number(value);

  if (
    !Number.isFinite(numericLimit) ||
    numericLimit <= 0
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    Math.floor(numericLimit),
    100
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsInsightsPage = ({
  goalId = null,

  asOfDate = null,

  limit = DEFAULT_LIMIT,

  title = DEFAULT_TITLE,

  description = DEFAULT_DESCRIPTION,

  onCreateGoal,

  onExploreSavings,

  onRecommendationAction,

  className = "",
}) => {
  /* =======================================================
     SERVER STATE
  ======================================================= */

  const {
    insights: hookInsights,
    data,

    loading = false,
    isLoading = false,

    refreshing = false,
    isRefreshing = false,

    error = null,

    refresh,
    refetch,
  } = useSavingsInsights({
    goalId,
    asOfDate,
  });

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const isInitialLoading =
    Boolean(loading) ||
    Boolean(isLoading);

  const isRefreshingInsights =
    Boolean(refreshing) ||
    Boolean(isRefreshing);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    /*
     * Prevent accidental duplicate requests if a refresh
     * button is triggered multiple times before the hook
     * updates its state.
     */
    if (isRefreshingInsights) {
      return undefined;
    }

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
    isRefreshingInsights,
  ]);

  /* =======================================================
     RAW INSIGHT RESOLUTION
  ======================================================= */

  const rawInsights = useMemo(() => {
    /*
     * Prefer the explicit hook collection.
     *
     * Only fall back to `data` when the hook does not expose
     * a usable collection.
     */
    if (
      Array.isArray(hookInsights) &&
      hookInsights.length >= 0
    ) {
      return hookInsights;
    }

    return resolveInsights(data);
  }, [
    hookInsights,
    data,
  ]);

  /* =======================================================
     NORMALIZATION
  ======================================================= */

  const normalizedInsights = useMemo(() => {
    if (!rawInsights.length) {
      return [];
    }

    try {
      const normalized =
        normalizeSavingsInsights(
          rawInsights
        );

      if (!Array.isArray(normalized)) {
        return [];
      }

      return normalized.filter(Boolean);
    } catch {
      /*
       * A malformed insight must never crash the entire
       * SmartSave page.
       */
      return [];
    }
  }, [
    rawInsights,
  ]);

  /* =======================================================
     CLASSIFICATION
  ======================================================= */

  const {
    analyticalInsights,
    recommendations,
  } = useMemo(() => {
    const analytical = [];
    const actionable = [];

    for (
      const insight of normalizedInsights
    ) {
      if (
        isRecommendation(insight)
      ) {
        actionable.push(insight);
      } else {
        analytical.push(insight);
      }
    }

    return {
      analyticalInsights: analytical,
      recommendations: actionable,
    };
  }, [
    normalizedInsights,
  ]);

  /* =======================================================
     DISPLAY LIMITS
  ======================================================= */

  const safeLimit = useMemo(
    () => resolveLimit(limit),
    [limit]
  );

  const visibleInsights = useMemo(
    () =>
      analyticalInsights.slice(
        0,
        safeLimit
      ),
    [
      analyticalInsights,
      safeLimit,
    ]
  );

  /*
   * Recommendations intentionally have their own limit.
   * They should not be consumed by the analytical insight
   * limit because they represent actionable intelligence.
   */
  const visibleRecommendations =
    useMemo(
      () =>
        recommendations.slice(
          0,
          MAX_RECOMMENDATIONS
        ),
      [recommendations]
    );

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const hasAnyInsights =
    visibleInsights.length > 0 ||
    visibleRecommendations.length > 0;

  const hasAnyNormalizedInsights =
    normalizedInsights.length > 0;

  const isEmpty =
    !isInitialLoading &&
    !error &&
    !hasAnyInsights;

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  /*
   * If a refresh fails while existing intelligence is
   * available, keep the content visible and display a
   * non-blocking warning.
   */
  const hasRecoverableError =
    Boolean(error) &&
    hasAnyNormalizedInsights;

  /* =======================================================
     ACTION HANDLERS
  ======================================================= */

  const handleCreateGoal =
    useCallback(() => {
      if (
        typeof onCreateGoal !==
        "function"
      ) {
        return;
      }

      onCreateGoal();
    }, [
      onCreateGoal,
    ]);

  const handleExploreSavings =
    useCallback(() => {
      if (
        typeof onExploreSavings !==
        "function"
      ) {
        return;
      }

      onExploreSavings();
    }, [
      onExploreSavings,
    ]);

  const handleRecommendationAction =
    useCallback(
      (recommendation) => {
        if (
          typeof onRecommendationAction !==
          "function"
        ) {
          return;
        }

        if (!recommendation) {
          return;
        }

        onRecommendationAction(
          recommendation
        );
      },
      [
        onRecommendationAction,
      ]
    );

  /* =======================================================
     INITIAL LOADING STATE
  ======================================================= */

  if (
    isInitialLoading &&
    !hasAnyNormalizedInsights
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label="Savings insights"
        aria-busy="true"
      >
        <div
          className="
            overflow-hidden
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm
          "
        >
          <div
            className="
              px-5 sm:px-6 py-5
              border-slate-100 border-b
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
                  w-10 h-10
                  bg-slate-100
                  rounded-xl
                  animate-pulse
                "
                /
              >

              <div
                className="
                  space-y-2
                "
              >
                <div
                  className="
                    w-40 h-4
                    bg-slate-100
                    rounded
                    animate-pulse
                  "
                  /
                >

                <div
                  className="
                    w-64 sm:w-96 h-3
                    bg-slate-100
                    rounded
                    animate-pulse
                  "
                  /
                >
              </div>
            </div>
          </div>

          <div
            className="
              p-5 sm:p-6
            "
          >
            <SavingsSkeleton count={3} />
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     INITIAL ERROR STATE
  ======================================================= */

  if (
    error &&
    !hasAnyNormalizedInsights
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label="Savings insights"
      >
        <SavingsErrorState
          error={errorMessage}
          onRetry={
            typeof refresh === "function" ||
            typeof refetch === "function"
              ? handleRefresh
              : undefined
          }
          retrying={
            isRefreshingInsights
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
        className={`w-full ${className}`}
        aria-label="Savings insights"
      >
        <SavingsInsightEmptyState
          onRefresh={
            typeof refresh === "function" ||
            typeof refetch === "function"
              ? handleRefresh
              : undefined
          }
          onCreateGoal={
            typeof onCreateGoal ===
            "function"
              ? handleCreateGoal
              : undefined
          }
          onExploreSavings={
            typeof onExploreSavings ===
            "function"
              ? handleExploreSavings
              : undefined
          }
          isRefreshing={
            isRefreshingInsights
          }
        />
      </section>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <section
      className={`w-full ${className}`}
      aria-labelledby="savings-insights-heading"
    >
      <div
        className="
          overflow-hidden
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
              <Sparkles
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <h2
                  id="savings-insights-heading"
                  className="
                    font-bold text-slate-900 text-base sm:text-lg tracking-tight
                  "
                >
                  {title}
                </h2>

                {normalizedInsights.length >
                  0 && (
                  <span
                    className="
                      inline-flex items-center
                      px-2 py-0.5
                      font-semibold text-[11px] text-slate-600
                      bg-slate-100
                      rounded-full
                    "
                    aria-label={`${normalizedInsights.length} savings insights`}
                  >
                    {normalizedInsights.length}
                  </span>
                )}
              </div>

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

          {/* ===============================================
              REFRESH
          =============================================== */}

          <button
            type="button"
            onClick={() =>
              void handleRefresh()
            }
            disabled={
              isRefreshingInsights
            }
            className="inline-flex justify-center items-center self-start gap-2 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:opacity-60 px-3.5 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/30 min-h-10 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed shrink-0"
            aria-label={
              isRefreshingInsights
                ? "Refreshing savings insights"
                : "Refresh savings insights"
            }
          >
            <RefreshCw
              size={15}
              className={
                isRefreshingInsights
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />

            <span>
              {isRefreshingInsights
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            p-5 sm:p-6
          "
        >
          {/* ===============================================
              NON-BLOCKING ERROR
          =============================================== */}

          {hasRecoverableError && (
            <div
              className="
                flex items-start
                mb-5 p-3.5
                bg-amber-50
                border border-amber-200 rounded-xl
                gap-3
              "
              role="status"
              aria-live="polite"
            >
              <AlertCircle
                size={16}
                className="
                  mt-0.5
                  text-amber-700
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
                    font-semibold text-amber-900 text-xs
                  "
                >
                  Your insights may be
                  slightly outdated.
                </p>

                <p
                  className="
                    mt-0.5
                    text-amber-700 text-xs leading-5
                  "
                >
                  {errorMessage}
                </p>
              </div>

              {(typeof refresh ===
                "function" ||
                typeof refetch ===
                  "function") && (
                <button
                  type="button"
                  onClick={() =>
                    void handleRefresh()
                  }
                  disabled={
                    isRefreshingInsights
                  }
                  className="self-start disabled:opacity-50 px-1 font-semibold text-amber-800 text-xs underline underline-offset-2 hover:no-underline disabled:cursor-not-allowed shrink-0"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* ===============================================
              RECOMMENDATIONS
          =============================================== */}

          {visibleRecommendations.length >
            0 && (
            <section
              aria-labelledby="smart-recommendations-heading"
            >
              <div
                className="
                  flex items-center
                  mb-3
                  gap-2.5
                "
              >
                <div
                  className="
                    flex justify-center items-center
                    w-8 h-8
                    text-blue-600
                    bg-blue-50
                    rounded-lg
                    shrink-0
                  "
                  aria-hidden="true"
                >
                  <Sparkles size={15} />
                </div>

                <div>
                  <h3
                    id="smart-recommendations-heading"
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Smart recommendations
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-slate-500 text-xs
                    "
                  >
                    Practical actions based
                    on your savings behavior.
                  </p>
                </div>
              </div>

              <div
                className="
                  grid grid-cols-1 lg:grid-cols-2
                  gap-4
                "
              >
                {visibleRecommendations.map(
                  (
                    recommendation,
                    index
                  ) => (
                    <SavingsRecommendation
                      key={getInsightKey(
                        recommendation,
                        index
                      )}
                      recommendation={
                        recommendation
                      }
                      onAction={
                        typeof onRecommendationAction ===
                        "function"
                          ? handleRecommendationAction
                          : undefined
                      }
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* ===============================================
              ANALYTICAL INSIGHTS
          =============================================== */}

          {visibleInsights.length >
            0 && (
            <section
              className={
                visibleRecommendations.length >
                0
                  ? "mt-7"
                  : ""
              }
              aria-labelledby="financial-insights-heading"
            >
              <div
                className="
                  mb-3
                "
              >
                <h3
                  id="financial-insights-heading"
                  className="
                    font-semibold text-slate-900 text-sm
                  "
                >
                  Financial insights
                </h3>

                <p
                  className="
                    mt-0.5
                    text-slate-500 text-xs
                  "
                >
                  Understand what your
                  savings data is telling you.
                </p>
              </div>

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
                  gap-4
                "
              >
                {visibleInsights.map(
                  (
                    insight,
                    index
                  ) => (
                    <SavingsInsightCard
                      key={getInsightKey(
                        insight,
                        index
                      )}
                      insight={insight}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* ===============================================
              BACKGROUND REFRESH
          =============================================== */}

          {isRefreshingInsights && (
            <div
              className="
                flex justify-center items-center
                mt-5 pt-1
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

              <span>
                Updating savings intelligence...
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsInsightsPage
);