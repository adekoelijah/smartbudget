
// pages/SmartSave/SavingsInsightsPage.jsx

import {
  memo,
  useCallback,
  useMemo,
  createElement,
} from "react";

import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 100;
const MAX_RECOMMENDATIONS = 3;

const DEFAULT_TITLE = "Savings intelligence";

const DEFAULT_DESCRIPTION =
  "Personalized insights and recommendations based on your savings activity.";

const DEFAULT_ERROR =
  "We couldn't load your savings data.";

/* =========================================================
   SAFE ERROR MESSAGE
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || DEFAULT_ERROR;
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

  return DEFAULT_ERROR;
};

/* =========================================================
   LIMIT
========================================================= */

const resolveLimit = (value) => {
  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    Math.floor(numericValue),
    MAX_LIMIT
  );
};

/* =========================================================
   INSIGHT IDENTITY
========================================================= */

const getInsightId = (insight) => {
  if (
    !insight ||
    typeof insight !== "object"
  ) {
    return null;
  }

  const id =
    insight._id ??
    insight.id ??
    insight.insightId;

  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    return null;
  }

  return String(id);
};

const getInsightKey = (
  insight,
  index
) => {
  const id = getInsightId(insight);

  return id
    ? `savings-insight-${id}`
    : `savings-insight-${index}`;
};

/* =========================================================
   INSIGHT TYPE
========================================================= */

const getInsightType = (insight) =>
  String(
    insight?.type ??
      insight?.insightType ??
      insight?.category ??
      ""
  )
    .trim()
    .toLowerCase();

const getRecommendationType = () =>
  String(
    SAVINGS_INSIGHT_TYPES?.RECOMMENDATION ??
      "recommendation"
  )
    .trim()
    .toLowerCase();

const isRecommendation = (insight) =>
  getInsightType(insight) ===
  getRecommendationType();

/* =========================================================
   RESPONSE RESOLUTION
========================================================= */

const resolveInsights = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return [];
  }

  if (Array.isArray(value.insights)) {
    return value.insights;
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.results)) {
    return value.results;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  if (
    value.data &&
    typeof value.data === "object"
  ) {
    if (
      Array.isArray(
        value.data.insights
      )
    ) {
      return value.data.insights;
    }

    if (
      Array.isArray(
        value.data.items
      )
    ) {
      return value.data.items;
    }

    if (
      Array.isArray(
        value.data.results
      )
    ) {
      return value.data.results;
    }
  }

  return [];
};

/* =========================================================
   NORMALIZE INSIGHTS
========================================================= */

const normalizeInsightCollection = (
  value
) => {
  const resolved = resolveInsights(value);

  if (!resolved.length) {
    return [];
  }

  try {
    const normalized =
      normalizeSavingsInsights(
        resolved
      );

    if (Array.isArray(normalized)) {
      return normalized.filter(Boolean);
    }

    return [];
  } catch (normalizationError) {
    console.error(
      "[SavingsInsightsPage] Insight normalization failed:",
      normalizationError
    );

    return resolved.filter(Boolean);
  }
};

/* =========================================================
   ICON HELPERS
========================================================= */

const renderAlertIcon = ({
  size = 17,
  className,
  strokeWidth = 2,
} = {}) =>
  createElement(AlertCircle, {
    size,
    className,
    strokeWidth,
  });

const renderRefreshIcon = ({
  size = 15,
  className,
  strokeWidth = 2,
} = {}) =>
  createElement(RefreshCw, {
    size,
    className,
    strokeWidth,
  });

const renderBrainIcon = ({
  size = 20,
  className,
  strokeWidth = 1.9,
} = {}) =>
  createElement(BrainCircuit, {
    size,
    className,
    strokeWidth,
  });

const renderSparklesIcon = ({
  size = 17,
  className,
  strokeWidth = 2,
} = {}) =>
  createElement(Sparkles, {
    size,
    className,
    strokeWidth,
  });

const renderTrendingIcon = ({
  size = 17,
  className,
  strokeWidth = 2,
} = {}) =>
  createElement(TrendingUp, {
    size,
    className,
    strokeWidth,
  });

const renderCheckIcon = ({
  size = 17,
  className,
  strokeWidth = 2,
} = {}) =>
  createElement(CheckCircle2, {
    size,
    className,
    strokeWidth,
  });

/* =========================================================
   HEADER
========================================================= */

const InsightsHeader = memo(
  ({
    title,
    description,
    count,
    refreshing,
    canRefresh,
    onRefresh,
  }) => {
    return (
      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
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
              bg-slate-950
              rounded-2xl
              shadow-sm
              shrink-0
            "
            aria-hidden="true"
          >
            {renderBrainIcon()}
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
                  font-bold text-slate-950 text-base sm:text-lg tracking-tight
                "
              >
                {title}
              </h2>

              {count > 0 && (
                <span
                  className="
                    inline-flex items-center
                    px-2.5 py-1
                    font-semibold text-[11px] text-slate-600
                    bg-slate-100
                    border border-slate-200 rounded-full
                  "
                >
                  {count}
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

        {canRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="
              inline-flex justify-center items-center
              h-10
              px-3.5
              font-semibold text-slate-700 text-xs sm:text-sm
              bg-white hover:bg-slate-50
              border border-slate-200 hover:border-slate-300 rounded-xl
              focus:outline-none
              disabled:opacity-50 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
              focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
              shrink-0
            "
            aria-label={
              refreshing
                ? "Refreshing savings insights"
                : "Refresh savings insights"
            }
            aria-busy={refreshing}
          >
            {renderRefreshIcon({
              size: 15,
              className:
                refreshing
                  ? "animate-spin"
                  : undefined,
            })}

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>
        )}
      </header>
    );
  }
);

InsightsHeader.displayName =
  "InsightsHeader";

/* =========================================================
   SUMMARY
========================================================= */

const IntelligenceSummary = memo(
  ({
    total,
    recommendations,
    analytical,
  }) => {
    if (total <= 0) {
      return null;
    }

    return (
      <div
        className="
          grid grid-cols-2 lg:grid-cols-3
          gap-3
        "
      >
        <div
          className="
            p-4
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-semibold text-[10px] text-slate-400 uppercase
                  tracking-[0.08em]
                "
              >
                Total insights
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-950 text-xl tracking-tight
                "
              >
                {total}
              </p>
            </div>

            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-slate-500
                bg-slate-50
                border border-slate-100 rounded-xl
              "
              aria-hidden="true"
            >
              {renderSparklesIcon()}
            </div>
          </div>
        </div>

        <div
          className="
            p-4
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-semibold text-[10px] text-slate-400 uppercase
                  tracking-[0.08em]
                "
              >
                Recommendations
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-950 text-xl tracking-tight
                "
              >
                {recommendations}
              </p>
            </div>

            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-blue-600
                bg-blue-50
                border border-blue-100 rounded-xl
              "
              aria-hidden="true"
            >
              {renderTrendingIcon()}
            </div>
          </div>
        </div>

        <div
          className="
            p-4
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm
            col-span-2 lg:col-span-1
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-semibold text-[10px] text-slate-400 uppercase
                  tracking-[0.08em]
                "
              >
                Financial insights
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-950 text-xl tracking-tight
                "
              >
                {analytical}
              </p>
            </div>

            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-emerald-600
                bg-emerald-50
                border border-emerald-100 rounded-xl
              "
              aria-hidden="true"
            >
              {renderCheckIcon()}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IntelligenceSummary.displayName =
  "IntelligenceSummary";

/* =========================================================
   LOADING HEADER
========================================================= */

const LoadingHeader = memo(() => {
  return (
    <div
      className="
        flex flex-col sm:flex-row sm:justify-between sm:items-center
        gap-4
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
            w-11 h-11
            bg-slate-100
            rounded-2xl
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
              w-44 h-5
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >

          <div
            className="
              w-72 max-w-full h-3
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >
        </div>
      </div>

      <div
        className="
          w-24 h-10
          bg-slate-100
          rounded-xl
          animate-pulse
        "
        /
      >
    </div>
  );
});

LoadingHeader.displayName =
  "SavingsInsightsLoadingHeader";

/* =========================================================
   MAIN PAGE
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
     STABLE QUERY
  ======================================================= */

  const insightsQuery = useMemo(
    () => ({
      goalId: goalId || null,
      asOfDate: asOfDate || null,
    }),
    [
      goalId,
      asOfDate,
    ]
  );

  /* =======================================================
     HOOK
  ======================================================= */

  const savingsInsights =
    useSavingsInsights(
      insightsQuery
    ) ?? {};

  const {
    insights: hookInsights,
    data,
    loading: hookLoading = false,
    isLoading = false,
    refreshing = false,
    isRefreshing = false,
    error = null,
    refresh,
    refetch,
    fetchInsights,
  } = savingsInsights;

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const loading =
    Boolean(hookLoading) ||
    Boolean(isLoading);

  const refreshingState =
    Boolean(refreshing) ||
    Boolean(isRefreshing);

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const insights = useMemo(() => {
    const source =
      Array.isArray(hookInsights)
        ? hookInsights
        : data;

    return normalizeInsightCollection(
      source
    );
  }, [
    hookInsights,
    data,
  ]);

  /* =======================================================
     CLASSIFICATION
  ======================================================= */

  const {
    recommendations,
    analyticalInsights,
  } = useMemo(() => {
    const recommendationItems = [];
    const analyticalItems = [];

    for (
      const insight of insights
    ) {
      if (
        isRecommendation(insight)
      ) {
        recommendationItems.push(
          insight
        );
      } else {
        analyticalItems.push(
          insight
        );
      }
    }

    return {
      recommendations:
        recommendationItems,
      analyticalInsights:
        analyticalItems,
    };
  }, [insights]);

  /* =======================================================
     LIMIT
  ======================================================= */

  const safeLimit = useMemo(
    () => resolveLimit(limit),
    [limit]
  );

  /* =======================================================
     VISIBLE CONTENT
  ======================================================= */

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
     DISPLAY STATE
  ======================================================= */

  const hasInsights =
    insights.length > 0;

  const hasVisibleContent =
    visibleInsights.length > 0 ||
    visibleRecommendations.length > 0;

  const errorMessage = useMemo(
    () => getErrorMessage(error),
    [error]
  );

  /* =======================================================
     REFRESH CAPABILITY
  ======================================================= */

  const canRefresh =
    typeof refresh === "function" ||
    typeof refetch === "function" ||
    typeof fetchInsights ===
      "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      if (refreshingState) {
        return undefined;
      }

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

      if (
        typeof fetchInsights ===
        "function"
      ) {
        return fetchInsights();
      }

      return undefined;
    }, [
      refreshingState,
      refresh,
      refetch,
      fetchInsights,
    ]);

  /* =======================================================
     USER ACTIONS
  ======================================================= */

  const handleCreateGoal =
    useCallback(() => {
      if (
        typeof onCreateGoal ===
        "function"
      ) {
        onCreateGoal();
      }
    }, [onCreateGoal]);

  const handleExploreSavings =
    useCallback(() => {
      if (
        typeof onExploreSavings ===
        "function"
      ) {
        onExploreSavings();
      }
    }, [onExploreSavings]);

  const handleRecommendationAction =
    useCallback(
      (recommendation) => {
        if (
          typeof onRecommendationAction !==
            "function" ||
          !recommendation
        ) {
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
     INITIAL LOADING
  ======================================================= */

  if (
    loading &&
    !hasInsights
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label="Savings intelligence"
        aria-busy="true"
      >
        <div
          className="
            overflow-hidden
            w-full
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              px-5 sm:px-6 py-5
              bg-white
              border-slate-100 border-b
            "
          >
            <LoadingHeader />
          </div>

          <div
            className="
              p-5 sm:p-6
              bg-slate-50/50
            "
          >
            <SavingsSkeleton count={3} />
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !hasInsights &&
    !loading
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label="Savings intelligence"
      >
        <div
          className="
            overflow-hidden
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              flex items-start
              px-5 sm:px-6 py-5
              bg-white
              border-slate-100 border-b
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-11 h-11
                text-amber-700
                bg-amber-50
                border border-amber-100 rounded-2xl
                shrink-0
              "
            >
              {renderAlertIcon()}
            </div>

            <div>
              <h2
                className="
                  font-bold text-slate-950 text-base
                "
              >
                Savings intelligence
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs sm:text-sm
                "
              >
                We were unable to retrieve
                your savings intelligence.
              </p>
            </div>
          </div>

          <div
            className="
              p-5 sm:p-6
            "
          >
            <SavingsErrorState
              error={errorMessage}
              onRetry={
                canRefresh
                  ? handleRefresh
                  : undefined
              }
              retrying={
                refreshingState
              }
            />
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    !loading &&
    !error &&
    !hasVisibleContent
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label="Savings intelligence"
      >
        <SavingsInsightEmptyState
          onRefresh={
            canRefresh
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
            refreshingState
          }
        />
      </section>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <section
      className={`w-full ${className}`}
      aria-labelledby="savings-insights-heading"
    >
      <div
        className="
          overflow-hidden
          w-full
          bg-slate-50/50
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >
        {/* HEADER */}

        <div
          className="
            px-5 sm:px-6 py-5
            bg-white
            border-slate-100 border-b
          "
        >
          <InsightsHeader
            title={title}
            description={description}
            count={insights.length}
            refreshing={
              refreshingState
            }
            canRefresh={
              canRefresh
            }
            onRefresh={
              handleRefresh
            }
          />
        </div>

        {/* CONTENT */}

        <div
          className="
            p-5 sm:p-6
          "
        >
          {/* REFRESH ERROR */}

          {error &&
            hasInsights && (
              <div
                className="
                  flex items-start
                  mb-5 p-3.5
                  bg-amber-50
                  border border-amber-200 rounded-2xl
                  gap-3
                "
                role="status"
                aria-live="polite"
              >
                <div
                  className="
                    mt-0.5
                    text-amber-700
                    shrink-0
                  "
                  aria-hidden="true"
                >
                  {renderAlertIcon({
                    size: 17,
                  })}
                </div>

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
                    Some insights may
                    be outdated.
                  </p>

                  <p
                    className="
                      mt-1
                      text-amber-700 text-xs leading-5
                    "
                  >
                    {errorMessage}
                  </p>
                </div>

                {canRefresh && (
                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshingState
                    }
                    className="
                      font-semibold text-amber-800 text-xs
                      underline underline-offset-2
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      shrink-0
                    "
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

          {/* SUMMARY */}

          <IntelligenceSummary
            total={insights.length}
            recommendations={
              recommendations.length
            }
            analytical={
              analyticalInsights.length
            }
          />

          {/* RECOMMENDATIONS */}

          {visibleRecommendations.length >
            0 && (
            <section
              className="
                mt-6
              "
              aria-labelledby="smart-recommendations-heading"
            >
              <div
                className="
                  flex items-center
                  mb-4
                  gap-3
                "
              >
                <div
                  className="
                    flex justify-center items-center
                    w-9 h-9
                    text-blue-600
                    bg-blue-50
                    border border-blue-100 rounded-xl
                    shrink-0
                  "
                  aria-hidden="true"
                >
                  {renderSparklesIcon()}
                </div>

                <div>
                  <h3
                    id="smart-recommendations-heading"
                    className="
                      font-semibold text-slate-950 text-sm
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
                    Actions that can improve
                    your savings progress.
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

          {/* ANALYTICAL INSIGHTS */}

          {visibleInsights.length >
            0 && (
            <section
              className={
                visibleRecommendations.length >
                0
                  ? "mt-8"
                  : "mt-6"
              }
              aria-labelledby="financial-insights-heading"
            >
              <div
                className="
                  mb-4
                "
              >
                <div
                  className="
                    flex items-center
                    gap-2
                  "
                >
                  <div
                    className="
                      text-slate-600
                    "
                    aria-hidden="true"
                  >
                    {renderTrendingIcon({
                      size: 16,
                    })}
                  </div>

                  <h3
                    id="financial-insights-heading"
                    className="
                      font-semibold text-slate-950 text-sm
                    "
                  >
                    Financial insights
                  </h3>
                </div>

                <p
                  className="
                    mt-1
                    text-slate-500 text-xs
                  "
                >
                  Understand the patterns
                  behind your savings activity.
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

          {/* BACKGROUND REFRESH */}

          {refreshingState && (
            <div
              className="
                flex justify-center items-center
                mt-6 pt-1
                text-slate-400 text-xs
                gap-2
              "
              role="status"
              aria-live="polite"
            >
              {renderRefreshIcon({
                size: 13,
                className:
                  "animate-spin",
              })}

              <span>
                Updating savings
                intelligence…
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   DISPLAY NAME
========================================================= */

SavingsInsightsPage.displayName =
  "SavingsInsightsPage";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsInsightsPage
);
