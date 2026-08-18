// pages/SmartSave/SavingsActivityPage.jsx

import {
  Activity,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
} from "react";

import useSavingsActivity from "../../../../hooks/useSavingsActivity";

import {
  normalizeSavingsActivity,
} from "../../../../utils/smartSave/savingsNormalizers";

import SavingsActivityList from "./SavingsActivityList";
import SavingsActivityEmptyState from "./SavingsActivityEmptyState";

import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE =
  "Savings Activity";

const DEFAULT_DESCRIPTION =
  "Track your recent savings contributions, executions, and progress.";

const DEFAULT_EMPTY_TITLE =
  "No savings activity yet";

const DEFAULT_EMPTY_DESCRIPTION =
  "Your savings activity will appear here as you start contributing to your goals and strategies.";

const DEFAULT_LIMIT =
  20;

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Safely extract a human-readable error message.
 *
 * This is intentionally presentation-only.
 * Business/service error normalization belongs
 * in the service/hook layer.
 */
const getErrorMessage = (
  error
) => {
  if (!error) {
    return null;
  }

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.details ||
    error?.data?.message ||
    "We couldn't load your savings activity. Please try again."
  );
};

/**
 * Resolve common API collection envelopes.
 */
const resolveActivities = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    Array.isArray(
      value?.data
    )
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value?.items
    )
  ) {
    return value.items;
  }

  if (
    Array.isArray(
      value?.results
    )
  ) {
    return value.results;
  }

  if (
    Array.isArray(
      value?.activities
    )
  ) {
    return value.activities;
  }

  if (
    Array.isArray(
      value?.data?.activities
    )
  ) {
    return value.data.activities;
  }

  return [];
};

/**
 * Safely convert a numeric activity amount.
 */
const toAmount = (
  value
) => {
  const amount =
    Number(value);

  return Number.isFinite(
    amount
  ) && amount > 0
    ? amount
    : 0;
};

/* =========================================================
   QUERY NORMALIZATION
========================================================= */

/**
 * Keep the hook query reference stable.
 *
 * This is especially important when the parent passes
 * an inline object:
 *
 *     query={{ page: 1, limit: 20 }}
 *
 * Without normalization/memoization, a hook that depends
 * on query identity may repeatedly execute its effect.
 */
const normalizeQuery = (
 query
) => {
  if (
    !query ||
    typeof query !==
      "object" ||
    Array.isArray(query)
  ) {
    return {};
  }

  return query;
};

/* =========================================================
   HEADER
========================================================= */

const PageHeader = memo(
  ({
    title,
    description,
    activityCount,
    refreshing,
    onRefresh,
    onViewAll,
  }) => {
    return (
      <header
        className="
          flex flex-col
          px-5 sm:px-6 py-5
          bg-white
          border-slate-100 border-b
          gap-4
        "
      >
        <div
          className="
            flex flex-col lg:flex-row lg:justify-between lg:items-center
            gap-4
          "
        >
          {/* =========================================
              TITLE
          ========================================== */}

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
                bg-slate-100
                border border-slate-200 rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Activity
                size={19}
                className="
                  text-slate-700
                "
                /
              >
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
                <h1
                  id="savings-activity-title"
                  className="
                    font-bold text-slate-950 text-lg sm:text-xl tracking-tight
                  "
                >
                  {title}
                </h1>

                {Number.isInteger(
                  activityCount
                ) && (
                  <span
                    className="
                      inline-flex items-center
                      px-2.5 py-1
                      font-semibold text-[11px] text-slate-600
                      bg-slate-100
                      border border-slate-200 rounded-full
                    "
                  >
                    {activityCount}
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

          {/* =========================================
              ACTIONS
          ========================================== */}

          <div
            className="
              flex items-center
              gap-2 shrink-0
            "
          >
            {typeof onRefresh ===
              "function" && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-3.5 py-2
                  font-semibold text-slate-700 text-xs sm:text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 hover:border-slate-300 rounded-xl
                  focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  gap-2
                "
                aria-label={
                  refreshing
                    ? "Refreshing savings activity"
                    : "Refresh savings activity"
                }
              >
                <RefreshCw
                  size={14}
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
            )}

            {typeof onViewAll ===
              "function" && (
              <button
                type="button"
                onClick={onViewAll}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2
                  font-semibold text-white text-xs sm:text-sm
                  bg-slate-950 hover:bg-slate-800
                  border border-slate-200 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                View all

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }
);

PageHeader.displayName =
  "SavingsActivityPageHeader";

/* =========================================================
   SUMMARY
========================================================= */

const ActivitySummary = memo(
  ({
    count,
    totalAmount,
    currency,
  }) => {
    if (
      !count
    ) {
      return null;
    }

    const formattedAmount =
      new Intl.NumberFormat(
        "en-NG",
        {
          style: "currency",
          currency:
            currency ||
            "NGN",
          maximumFractionDigits:
            2,
        }
      ).format(
        totalAmount
      );

    return (
      <div
        className="
          grid grid-cols-1 sm:grid-cols-2
          gap-3
        "
      >
        <div
          className="
            px-4 py-4
            bg-slate-50
            border border-slate-200 rounded-2xl
          "
        >
          <p
            className="
              font-semibold text-[11px] text-slate-500 uppercase tracking-wider
            "
          >
            Activities
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-xl
            "
          >
            {count}
          </p>
        </div>

        <div
          className="
            px-4 py-4
            bg-slate-50
            border border-slate-200 rounded-2xl
          "
        >
          <p
            className="
              font-semibold text-[11px] text-slate-500 uppercase tracking-wider
            "
          >
            Activity value
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-xl break-words
            "
          >
            {formattedAmount}
          </p>
        </div>
      </div>
    );
  }
);

ActivitySummary.displayName =
  "SavingsActivitySummary";

/* =========================================================
   PAGE
========================================================= */

const SavingsActivityPage = ({
  title =
    DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  query: incomingQuery = {},

  limit =
    DEFAULT_LIMIT,

  currency =
    "NGN",

  onViewAll,

  onActivityClick,

  emptyAction,

  emptyActionLabel,

  className = "",

  compact = false,

  showEmptyState = true,

  showSummary = true,

  showHeader = true,

  showRefresh = true,
}) => {
  /* =======================================================
     STABLE QUERY
  ======================================================= */

  const query = useMemo(
    () =>
      normalizeQuery(
        incomingQuery
      ),
    [
      incomingQuery,
    ]
  );

  /* =======================================================
     HOOK
  ======================================================= */

  const activityState =
    useSavingsActivity(
      query
    ) || {};

  const {
    activities:
      hookActivities,

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

    fetchActivities,

    refetch,

    refresh,
  } =
    activityState;

  /* =======================================================
     LOADING STATE
  ======================================================= */

  const initialLoading =
    Boolean(
      loading ||
      isLoading
    );

  const backgroundRefreshing =
    Boolean(
      refreshing ||
      isRefreshing
    );

  /* =======================================================
     RESOLVE SOURCE
  ======================================================= */

  const activities = useMemo(
    () => {
      const source =
        hookActivities ??
        data ??
        [];

      const resolved =
        resolveActivities(
          source
        );

      const normalized =
        resolved
          .map(
            (activity) =>
              normalizeSavingsActivity(
                activity
              )
          )
          .filter(
            Boolean
          );

      if (
        Number.isInteger(
          limit
        ) &&
        limit > 0
      ) {
        return normalized.slice(
          0,
          limit
        );
      }

      return normalized;
    },
    [
      hookActivities,
      data,
      limit,
    ]
  );

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activityCount =
    activities.length;

  const hasActivities =
    activityCount > 0;

  const activitySummary =
    useMemo(
      () => {
        if (
          !hasActivities
        ) {
          return {
            count: 0,
            totalAmount: 0,
          };
        }

        const totalAmount =
          activities.reduce(
            (
              total,
              activity
            ) =>
              total +
              toAmount(
                activity?.amount ??
                  activity?.value
              ),
            0
          );

        return {
          count:
            activityCount,

          totalAmount,
        };
      },
      [
        activities,
        activityCount,
        hasActivities,
      ]
    );

  /* =======================================================
     ERROR
  ======================================================= */

  const errorMessage =
    useMemo(
      () =>
        getErrorMessage(
          error
        ),
      [
        error,
      ]
    );

  /* =======================================================
     RETRY / REFRESH
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

        if (
          typeof fetchActivities ===
          "function"
        ) {
          return fetchActivities(
            query
          );
        }

        return undefined;
      },
      [
        refresh,
        refetch,
        fetchActivities,
        query,
      ]
    );

  const handleRetry =
    useCallback(
      () => {
        void handleRefresh();
      },
      [
        handleRefresh,
      ]
    );

  /* =======================================================
     VIEW ALL
  ======================================================= */

  const handleViewAll =
    useCallback(
      () => {
        if (
          typeof onViewAll ===
          "function"
        ) {
          onViewAll();
        }
      },
      [
        onViewAll,
      ]
    );

  /* =======================================================
     ACTIVITY CLICK
  ======================================================= */

  const handleActivityClick =
    useCallback(
      (
        activity,
        ...args
      ) => {
        if (
          typeof onActivityClick !==
          "function"
        ) {
          return;
        }

        onActivityClick(
          activity,
          ...args
        );
      },
      [
        onActivityClick,
      ]
    );

  /* =======================================================
     EMPTY ACTION
  ======================================================= */

  const handleEmptyAction =
    useCallback(
      () => {
        if (
          typeof emptyAction ===
          "function"
        ) {
          return emptyAction();
        }

        return undefined;
      },
      [
        emptyAction,
      ]
    );

  /* =======================================================
     PAGE CONTAINER
  ======================================================= */

  const containerClassName =
    `
      w-full
      overflow-hidden
      rounded-3xl
      border border-slate-200
      bg-white
      shadow-sm
      ${className}
    `;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    initialLoading &&
    !hasActivities
  ) {
    return (
      <section
        className={
          containerClassName
        }
        aria-labelledby="savings-activity-title"
        aria-busy="true"
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={
              description
            }
            activityCount={
              null
            }
            refreshing={
              false
            }
            onRefresh={
              undefined
            }
            onViewAll={
              undefined
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-5 sm:py-6
          "
        >
          <SavingsSkeleton
            count={
              compact
                ? 3
                : 5
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR WITHOUT EXISTING DATA
  ======================================================= */

  if (
    errorMessage &&
    !hasActivities
  ) {
    return (
      <section
        className={
          containerClassName
        }
        aria-labelledby="savings-activity-title"
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={
              description
            }
            activityCount={
              null
            }
            refreshing={
              false
            }
            onRefresh={
              showRefresh
                ? handleRefresh
                : undefined
            }
            onViewAll={
              undefined
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-6
          "
        >
          <SavingsErrorState
            error={
              errorMessage
            }
            onRetry={
              handleRetry
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    !hasActivities &&
    showEmptyState
  ) {
    return (
      <section
        className={
          containerClassName
        }
        aria-labelledby="savings-activity-title"
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={
              description
            }
            activityCount={
              0
            }
            refreshing={
              backgroundRefreshing
            }
            onRefresh={
              showRefresh
                ? handleRefresh
                : undefined
            }
            onViewAll={
              undefined
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-6
          "
        >
          <SavingsActivityEmptyState
            title={
              DEFAULT_EMPTY_TITLE
            }
            description={
              DEFAULT_EMPTY_DESCRIPTION
            }
            actionLabel={
              emptyActionLabel
            }
            onAction={
              typeof emptyAction ===
              "function"
                ? handleEmptyAction
                : undefined
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main
      className={`
        w-full
        ${className}
      `}
      aria-labelledby="savings-activity-title"
    >
      <section
        className="
          overflow-hidden
          w-full
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >
        {/* ===============================================
            HEADER
        ================================================ */}

        {showHeader && (
          <PageHeader
            title={title}
            description={
              description
            }
            activityCount={
              activityCount
            }
            refreshing={
              backgroundRefreshing
            }
            onRefresh={
              showRefresh
                ? handleRefresh
                : undefined
            }
            onViewAll={
              typeof onViewAll ===
              "function"
                ? handleViewAll
                : undefined
            }
          />
        )}

        {/* ===============================================
            CONTENT
        ================================================ */}

        <div
          className="
            px-5 sm:px-6 py-5 sm:py-6
          "
        >
          {/* =============================================
              SUMMARY
          ============================================== */}

          {showSummary && (
            <div
              className="
                mb-5
              "
            >
              <ActivitySummary
                count={
                  activitySummary.count
                }
                totalAmount={
                  activitySummary.totalAmount
                }
                currency={
                  currency
                }
              />
            </div>
          )}

          {/* =============================================
              BACKGROUND ERROR
          ============================================== */}

          {errorMessage &&
            hasActivities && (
              <div
                className="
                  flex items-start
                  mb-5 p-3.5
                  bg-amber-50
                  border border-amber-200 rounded-xl
                  gap-3
                "
                role="status"
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
                    Activity data may be outdated
                  </p>

                  <p
                    className="
                      mt-1
                      text-amber-800 text-xs leading-5
                    "
                  >
                    {errorMessage}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRetry
                  }
                  disabled={
                    backgroundRefreshing
                  }
                  className="
                    inline-flex justify-center items-center
                    min-h-8
                    px-3
                    font-semibold text-amber-800 text-xs
                    bg-white hover:bg-amber-100
                    border border-amber-200 rounded-lg
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    shrink-0
                  "
                >
                  Retry
                </button>
              </div>
            )}

          {/* =============================================
              ACTIVITY LIST
          ============================================== */}

          <div
            className="
              relative
            "
            aria-busy={
              backgroundRefreshing
            }
          >
            {backgroundRefreshing && (
              <div
                className="
                  flex justify-end items-center
                  mb-3
                "
                aria-live="polite"
              >
                <span
                  className="
                    inline-flex items-center
                    font-medium text-[11px] text-slate-500
                    gap-1.5
                  "
                >
                  <RefreshCw
                    size={12}
                    className="
                      animate-spin
                    "
                    aria-hidden="true"
                  /
                  >

                  Syncing activity
                </span>
              </div>
            )}

            <SavingsActivityList
              activities={
                activities
              }
              loading={
                initialLoading
              }
              error={
                errorMessage
              }
              onRetry={
                handleRetry
              }
              onActivityClick={
                handleActivityClick
              }
              emptyAction={
                typeof emptyAction ===
                "function"
                  ? handleEmptyAction
                  : undefined
              }
              emptyActionLabel={
                emptyActionLabel
              }
              compact={
                compact
              }
            />
          </div>
        </div>

        {/* ===============================================
            FOOTER
        ================================================ */}

        <footer
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            px-5 sm:px-6 py-3
            bg-slate-50
            border-slate-100 border-t
            gap-2
          "
        >
          <p
            className="
              text-[11px] text-slate-400 leading-5
            "
          >
            Savings activity reflects transactions and
            executions currently available in your account.
          </p>

          {backgroundRefreshing && (
            <span
              className="
                inline-flex items-center
                font-medium text-[11px] text-slate-500
                gap-1.5 shrink-0
              "
              aria-live="polite"
            >
              <RefreshCw
                size={11}
                className="
                  animate-spin
                "
                aria-hidden="true"
              /
              >

              Updating
            </span>
          )}
        </footer>
      </section>
    </main>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsActivityPage
);