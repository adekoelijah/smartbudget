// SavingsInsightsPage.jsx

import {
  createElement,
  memo,
  useCallback,
  useMemo,
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
  "We couldn't load your savings insights.";

/* =========================================================
   SAFE HELPERS
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
   INSIGHT CLASSIFICATION
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

const isRecommendation = (
  insight
) =>
  getInsightType(insight) ===
  getRecommendationType();

/* =========================================================
   RESPONSE RESOLUTION
========================================================= */

/**
 * Resolves the insight collection from supported
 * SmartSave response envelopes.
 *
 * Supported:
 *
 * []
 * { insights: [] }
 * { data: [] }
 * { data: { insights: [] } }
 * { items: [] }
 * { data: { items: [] } }
 * { results: [] }
 * { data: { results: [] } }
 */
const resolveInsights = (
  value
) => {
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

  if (Array.isArray(value.data)) {
    return value.data;
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.results)) {
    return value.results;
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
   NORMALIZATION
========================================================= */

const normalizeInsightCollection = (
  value
) => {
  const resolved =
    resolveInsights(value);

  if (!resolved.length) {
    return [];
  }

  try {
    const normalized =
      normalizeSavingsInsights(
        resolved
      );

    return Array.isArray(normalized)
      ? normalized.filter(Boolean)
      : [];
  } catch {
    /*
     * A malformed insight should not crash
     * the entire SmartSave UI.
     */
    return resolved.filter(Boolean);
  }
};

/* =========================================================
   LIMIT
========================================================= */

const resolveLimit = (
  value
) => {
  const numericValue = Number(value);

  if (
    !Number.isFinite(
      numericValue
    ) ||
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
   ICON HELPERS
========================================================= */

/**
 * Icons are resolved from static imports.
 *
 * We deliberately return React elements rather than
 * assigning dynamically selected component types such as:
 *
 * const Icon = config.icon;
 *
 * inside the component render path.
 *
 * This keeps the render path compatible with React's
 * static-components/compiler rules.
 */

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
  strokeWidth = 1.9,
} = {}) =>
  createElement(BrainCircuit, {
    size,
    strokeWidth,
  });

const renderSparklesIcon = ({
  size = 17,
  strokeWidth = 2,
} = {}) =>
  createElement(Sparkles, {
    size,
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
  }) => (
    <header
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
            text-white
            bg-slate-950
            rounded-xl
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
                  px-2 py-0.5
                  font-semibold text-[11px] text-slate-600
                  bg-slate-100
                  rounded-full
                "
                aria-label={`${count} insights`}
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
                text-slate-500 text-sm leading-5
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
            font-semibold text-slate-700 text-sm
            bg-white hover:bg-slate-50
            border border-slate-200 hover:border-slate-300 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-slate-400/30
            disabled:opacity-60 shadow-sm transition
            disabled:cursor-not-allowed
            gap-2 shrink-0
          "
          aria-label={
            refreshing
              ? "Refreshing savings insights"
              : "Refresh savings insights"
          }
        >
          {renderRefreshIcon({
            size: 15,
            className:
              refreshing
                ? "animate-spin"
                : undefined,
          })}

          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      )}
    </header>
  )
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
          mt-5
          gap-3
        "
      >
        {/* Total insights */}

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
                  font-semibold text-[11px] text-slate-400 uppercase
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
                rounded-xl
              "
              aria-hidden="true"
            >
              {renderSparklesIcon()}
            </div>
          </div>
        </div>

        {/* Recommendations */}

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
                  font-semibold text-[11px] text-slate-400 uppercase
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
                rounded-xl
              "
              aria-hidden="true"
            >
              {renderTrendingIcon()}
            </div>
          </div>
        </div>

        {/* Analytical */}

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
                  font-semibold text-[11px] text-slate-400 uppercase
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
                rounded-xl
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
   MAIN COMPONENT
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
     HOOK
  ======================================================= */

  const savingsInsights =
    useSavingsInsights({
      goalId,
      asOfDate,
    }) ?? {};

  const {
    insights: hookInsights,
    data,
    loading: hookLoading,
    isLoading,
    refreshing,
    isRefreshing,
    error,
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
     NORMALIZED INSIGHTS
  ======================================================= */

  const insights = useMemo(() => {
    if (Array.isArray(hookInsights)) {
      return normalizeInsightCollection(
        hookInsights
      );
    }

    return normalizeInsightCollection(
      data
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
    const recommendationsList = [];
    const analyticalList = [];

    for (const insight of insights) {
      if (isRecommendation(insight)) {
        recommendationsList.push(
          insight
        );
      } else {
        analyticalList.push(
          insight
        );
      }
    }

    return {
      recommendations:
        recommendationsList,
      analyticalInsights:
        analyticalList,
    };
  }, [insights]);

  /* =======================================================
     DISPLAY LIMITS
  ======================================================= */

  const safeLimit = useMemo(
    () => resolveLimit(limit),
    [limit]
  );

  const visibleInsights =
    useMemo(
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

  const errorMessage =
    useMemo(
      () => getErrorMessage(error),
      [error]
    );

  const canRefresh =
    typeof refresh === "function" ||
    typeof refetch === "function" ||
    typeof fetchInsights === "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      if (refreshingState) {
        return undefined;
      }

      if (
        typeof refresh === "function"
      ) {
        return refresh();
      }

      if (
        typeof refetch === "function"
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
      refresh,
      refetch,
      fetchInsights,
      refreshingState,
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
    }, [
      onExploreSavings,
    ]);

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
        aria-labelledby="savings-insights-heading"
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
                  w-11 h-11
                  bg-slate-100
                  rounded-xl
                  animate-pulse
                "
                aria-hidden="true"
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
                  aria-hidden="true"
                /
                >

                <div
                  className="
                    w-72 max-w-full h-3
                    bg-slate-100
                    rounded
                    animate-pulse
                  "
                  aria-hidden="true"
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
     INITIAL ERROR
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
          bg-slate-50/50
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
            onRefresh={() =>
              void handleRefresh()
            }
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            p-5 sm:p-6
          "
        >
          {/* =================================================
              REFRESH ERROR
          ================================================= */}

          {error && hasInsights && (
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
                  Some insights may be
                  outdated
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
                  onClick={() =>
                    void handleRefresh()
                  }
                  disabled={
                    refreshingState
                  }
                  className="disabled:opacity-50 font-semibold text-amber-800 text-xs underline underline-offset-2 disabled:cursor-not-allowed shrink-0"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          <IntelligenceSummary
            total={insights.length}
            recommendations={
              recommendations.length
            }
            analytical={
              analyticalInsights.length
            }
          />

          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          {visibleRecommendations.length >
            0 && (
            <section
              className="
                mt-5
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
                    rounded-xl
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

          {/* =================================================
              ANALYTICAL INSIGHTS
          ================================================= */}

          {visibleInsights.length >
            0 && (
            <section
              className={
                visibleRecommendations.length >
                0
                  ? "mt-7"
                  : "mt-5"
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

          {/* =================================================
              BACKGROUND REFRESH
          ================================================= */}

          {refreshingState && (
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
              <span aria-hidden="true">
                {renderRefreshIcon({
                  size: 13,
                  className:
                    "animate-spin",
                })}
              </span>

              Updating savings
              intelligence…
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   COMPONENT METADATA
========================================================= */

SavingsInsightsPage.displayName =
  "SavingsInsightsPage";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsInsightsPage
);