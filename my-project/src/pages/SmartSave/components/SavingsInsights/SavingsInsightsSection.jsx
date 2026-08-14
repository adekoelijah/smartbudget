
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

const DEFAULT_TITLE =
  "Savings insights";

const DEFAULT_DESCRIPTION =
  "SmartSave analyzes your savings activity and goals to surface useful financial intelligence.";

const DEFAULT_ERROR =
  "We could not load your savings insights.";

/* =========================================================
   LOCAL HELPERS
========================================================= */

/**
 * Safely resolve the collection returned by the hook.
 *
 * The service/hook layer should normally provide normalized
 * data, but this boundary protects the UI from legacy or
 * differently-shaped API responses.
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

  if (
    Array.isArray(
      value?.data?.insights
    )
  ) {
    return value.data.insights;
  }

  if (
    Array.isArray(
      value?.items
    )
  ) {
    return value.items;
  }

  return [];
};

/**
 * Safely resolve an insight identifier.
 *
 * Backend-generated IDs are preferred.
 */
const getInsightId = (
  insight
) => {
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
 * Resolve a stable React key.
 *
 * Index is only a final defensive fallback.
 */
const getInsightKey = (
  insight,
  index
) => {
  const id =
    getInsightId(
      insight
    );

  if (id) {
    return `insight-${String(id)}`;
  }

  return `insight-${index}`;
};

/**
 * Normalize insight type.
 */
const getInsightType = (
  insight
) =>
  String(
    insight?.type ??
      insight?.insightType ??
      insight?.category ??
      ""
  ).toLowerCase();

/**
 * Determine whether an insight represents an actionable
 * recommendation.
 *
 * Supports both the canonical SmartSave constant and
 * defensive string fallback.
 */
const isRecommendation = (
  insight
) => {
  const type =
    getInsightType(
      insight
    );

  const recommendationType =
    String(
      SAVINGS_INSIGHT_TYPES
        ?.RECOMMENDATION ??
        "recommendation"
    ).toLowerCase();

  return (
    type ===
    recommendationType
  );
};

/**
 * Normalize an error into a UI-safe message.
 */
const getErrorMessage = (
  error
) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data
      ?.message ||
    error?.data?.message ||
    DEFAULT_ERROR
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsInsightsSection = ({
  goalId = null,

  asOfDate = null,

  limit = DEFAULT_LIMIT,

  title =
    DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  onCreateGoal,

  onExploreSavings,

  /*
   * Optional callbacks for actionable recommendations.
   *
   * The recommendation component remains responsible for
   * rendering its own action UI.
   */
  onRecommendationAction,

  className = "",
}) => {
  /* =======================================================
     SMARTSAVE HOOK
  ======================================================= */

  const {
    insights:
      hookInsights,

    data,

    loading =
      false,

    isLoading =
      false,

    refreshing =
      false,

    isRefreshing =
      false,

    error,

    refresh,

    refetch,
  } =
    useSavingsInsights({
      goalId,
      asOfDate,
    });

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const pending =
    Boolean(
      loading ||
        isLoading
    );

  const refreshingInsights =
    Boolean(
      refreshing ||
        isRefreshing
    );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
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

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const normalizedInsights =
    useMemo(() => {
      const source =
        resolveInsights(
          hookInsights ??
            data
        );

      if (
        source.length === 0
      ) {
        return [];
      }

      const normalized =
        normalizeSavingsInsights(
          source
        );

      if (
        !Array.isArray(
          normalized
        )
      ) {
        return [];
      }

      return normalized
        .filter(Boolean);
    }, [
      hookInsights,
      data,
    ]);

  /* =======================================================
     SPLIT INSIGHTS / RECOMMENDATIONS
  ======================================================= */

  const {
    insights,
    recommendations,
  } = useMemo(() => {
    const analyticalInsights =
      [];

    const actionableRecommendations =
      [];

    normalizedInsights.forEach(
      (item) => {
        if (
          isRecommendation(
            item
          )
        ) {
          actionableRecommendations.push(
            item
          );
        } else {
          analyticalInsights.push(
            item
          );
        }
      }
    );

    return {
      insights:
        analyticalInsights,
      recommendations:
        actionableRecommendations,
    };
  }, [
    normalizedInsights,
  ]);

  /* =======================================================
     DISPLAY LIMIT
  ======================================================= */

  const visibleInsights =
    useMemo(() => {
      const safeLimit =
        Number.isFinite(
          Number(limit)
        ) &&
        Number(limit) > 0
          ? Number(limit)
          : DEFAULT_LIMIT;

      return insights.slice(
        0,
        safeLimit
      );
    }, [
      insights,
      limit,
    ]);

  /*
   * Recommendations are intentionally kept separate from
   * the insight limit.
   *
   * A recommendation is an actionable item and should not
   * disappear merely because the analytical insight limit
   * has been reached.
   */
  const visibleRecommendations =
    useMemo(() => {
      return recommendations.slice(
        0,
        3
      );
    }, [
      recommendations,
    ]);

  /* =======================================================
     ERROR
  ======================================================= */

  const errorMessage =
    useMemo(
      () =>
        getErrorMessage(
          error
        ),
      [error]
    );

  /* =======================================================
     EMPTY
  ======================================================= */

  const isEmpty =
    !pending &&
    !error &&
    visibleInsights.length ===
      0 &&
    visibleRecommendations.length ===
      0;

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

  if (pending) {
    return (
      <section
        aria-label="Savings insights"
        className={`
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          ${className}
        `}
      >
        <SavingsSkeleton
          count={3}
        />
      </section>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (
    error &&
    normalizedInsights.length ===
      0
  ) {
    return (
      <section
        aria-label="Savings insights"
        className={`
          ${className}
        `}
      >
        <SavingsErrorState
          error={
            errorMessage
          }
          onRetry={
            handleRefresh
          }
          retrying={
            refreshingInsights
          }
        />
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (isEmpty) {
    return (
      <section
        aria-label="Savings insights"
        className={
          className
        }
      >
        <SavingsInsightEmptyState
          onRefresh={
            handleRefresh
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
            refreshingInsights
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
      aria-labelledby="savings-insights-heading"
      className={`
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-start
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
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-slate-700
                bg-slate-100
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Sparkles
                size={18}
                strokeWidth={2}
              />
            </div>

            <h2
              id="savings-insights-heading"
              className="
                font-semibold text-slate-900 text-base sm:text-lg tracking-tight
              "
            >
              {title}
            </h2>

            {normalizedInsights.length >
              0 && (
              <span
                className="
                  px-2 py-0.5
                  font-semibold text-[11px] text-slate-600
                  bg-slate-100
                  rounded-full
                "
              >
                {normalizedInsights.length}
              </span>
            )}
          </div>

          <p
            className="
              max-w-2xl
              mt-2
              text-slate-600 text-sm leading-5
            "
          >
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void handleRefresh()
          }
          disabled={
            refreshingInsights
          }
          className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 min-h-9 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed shrink-0"
          aria-label={
            refreshingInsights
              ? "Refreshing savings insights"
              : "Refresh savings insights"
          }
        >
          <RefreshCw
            size={15}
            className={
              refreshingInsights
                ? "animate-spin"
                : ""
            }
            aria-hidden="true"
          />

          {refreshingInsights
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {/* ===================================================
          NON-BLOCKING REFRESH ERROR
      =================================================== */}

      {error &&
        normalizedInsights.length >
          0 && (
          <div
            className="
              flex items-center
              mt-4 px-4 py-3
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
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span>
              Some savings intelligence
              could not be refreshed.
            </span>

            <button
              type="button"
              onClick={() =>
                void handleRefresh()
              }
              disabled={
                refreshingInsights
              }
              className="disabled:opacity-50 ml-auto font-semibold underline underline-offset-2 disabled:cursor-not-allowed shrink-0"
            >
              Retry
            </button>
          </div>
        )}

      {/* ===================================================
          RECOMMENDATIONS
      =================================================== */}

      {visibleRecommendations.length >
        0 && (
        <div
          className="
            mt-5
          "
        >
          <div
            className="
              flex items-center
              mb-3
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-8 h-8
                text-blue-600
                bg-blue-50
                rounded-lg
              "
              aria-hidden="true"
            >
              <Sparkles
                size={15}
              />
            </div>

            <div>
              <h3
                className="
                  font-semibold text-slate-900 text-sm
                "
              >
                Smart recommendations
              </h3>

              <p
                className="
                  text-slate-500 text-xs
                "
              >
                Practical actions based on
                your savings behavior.
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
        </div>
      )}

      {/* ===================================================
          ANALYTICAL INSIGHTS
      =================================================== */}

      {visibleInsights.length >
        0 && (
        <div
          className="
            mt-6
          "
        >
          <div
            className="
              mb-3
            "
          >
            <h3
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
              Understand what your savings
              data is telling you.
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
                  insight={
                    insight
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* ===================================================
          REFRESHING INDICATOR
      =================================================== */}

      {refreshingInsights && (
        <div
          className="
            flex justify-center items-center
            mt-4
            text-slate-500 text-xs
            gap-2
          "
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

          Updating savings intelligence...
        </div>
      )}
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsInsightsSection
);
