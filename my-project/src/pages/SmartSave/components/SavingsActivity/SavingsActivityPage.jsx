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

const DEFAULT_TITLE = "Savings Activity";

const DEFAULT_DESCRIPTION =
  "Track your recent savings contributions, executions, and progress.";

const DEFAULT_LIMIT = 20;

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_LOCALE = "en-NG";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings activity. Please try again.";

const DEFAULT_PAGE = 1;

/* =========================================================
   HELPERS
========================================================= */

const normalizePage = (value) => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0
    ? page
    : DEFAULT_PAGE;
};

const normalizeLimit = (value) => {
  const limit = Number(value);

  return Number.isInteger(limit) && limit > 0
    ? limit
    : DEFAULT_LIMIT;
};

const buildQuery = (
  incomingQuery,
  limit
) => {
  const source =
    incomingQuery &&
    typeof incomingQuery === "object" &&
    !Array.isArray(incomingQuery)
      ? incomingQuery
      : {};

  return {
    ...source,
    page: normalizePage(source.page),
    limit: normalizeLimit(limit),
  };
};

/* =========================================================
   ACTIVITY RESPONSE NORMALIZER
========================================================= */

const resolveActivities = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value.activities)) {
    return value.activities;
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

  if (Array.isArray(value.data?.activities)) {
    return value.data.activities;
  }

  if (Array.isArray(value.data?.items)) {
    return value.data.items;
  }

  if (Array.isArray(value.data?.results)) {
    return value.data.results;
  }

  return [];
};

/* =========================================================
   ERROR NORMALIZER
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return (
      error.trim() ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
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
   ACTIVITY AMOUNT
========================================================= */

const getActivityAmount = (activity) => {
  if (
    !activity ||
    typeof activity !== "object"
  ) {
    return 0;
  }

  const rawAmount =
    typeof activity.amount === "object" &&
    activity.amount !== null
      ? activity.amount.value
      : activity.amount ??
        activity.value ??
        activity.totalAmount;

  const amount = Number(rawAmount);

  return Number.isFinite(amount)
    ? amount
    : 0;
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
                    aria-label={`${activityCount} activities`}
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

          <div
            className="
              flex items-center
              gap-2 shrink-0
            "
          >
            {typeof onRefresh === "function" && (
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
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  gap-2
                  focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
                "
                aria-label={
                  refreshing
                    ? "Refreshing savings activity"
                    : "Refresh savings activity"
                }
                aria-busy={refreshing}
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : undefined
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

            {typeof onViewAll === "function" && (
              <button
                type="button"
                onClick={onViewAll}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2
                  font-semibold text-white text-xs sm:text-sm
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  transition
                  gap-2
                  focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
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
    if (count <= 0) {
      return null;
    }

    let formattedAmount;

    try {
      formattedAmount =
        new Intl.NumberFormat(
          DEFAULT_LOCALE,
          {
            style: "currency",
            currency:
              currency || DEFAULT_CURRENCY,
            maximumFractionDigits: 2,
          }
        ).format(totalAmount);
    } catch {
      formattedAmount = `${currency || DEFAULT_CURRENCY} ${Number(
        totalAmount || 0
      ).toFixed(2)}`;
    }

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
   REFRESH STATUS
========================================================= */

const RefreshStatus = memo(
  ({ refreshing }) => {
    if (!refreshing) {
      return null;
    }

    return (
      <div
        className="
          flex justify-end
          mb-3
        "
        role="status"
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
    );
  }
);

RefreshStatus.displayName =
  "SavingsActivityRefreshStatus";

/* =========================================================
   BACKGROUND ERROR
========================================================= */

const BackgroundError = memo(
  ({
    message,
    refreshing,
    onRetry,
  }) => {
    if (!message) {
      return null;
    }

    return (
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
            flex-1
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-amber-900 text-xs
            "
          >
            Activity data may be outdated.
          </p>

          <p
            className="
              mt-1
              text-amber-800 text-xs leading-5
            "
          >
            {message}
          </p>
        </div>

        {typeof onRetry === "function" && (
          <button
            type="button"
            onClick={onRetry}
            disabled={refreshing}
            className="
              inline-flex justify-center items-center
              min-h-8
              px-3
              font-semibold text-amber-800 text-xs
              bg-white hover:bg-amber-100
              border border-amber-200 rounded-lg
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            {refreshing
              ? "Retrying..."
              : "Retry"}
          </button>
        )}
      </div>
    );
  }
);

BackgroundError.displayName =
  "SavingsActivityBackgroundError";

/* =========================================================
   PAGE
========================================================= */

const SavingsActivityPage = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  query: incomingQuery = {},
  limit = DEFAULT_LIMIT,
  currency = DEFAULT_CURRENCY,

  onViewAll,
  onActivityClick,
  onCreateSaving,

  className = "",
  compact = false,
  showEmptyState = true,
  showSummary = true,
  showHeader = true,
  showRefresh = true,
}) => {
  /* =======================================================
     QUERY
  ======================================================= */

  const query = useMemo(
    () =>
      buildQuery(
        incomingQuery,
        limit
      ),
    [
      incomingQuery,
      limit,
    ]
  );

  /* =======================================================
     HOOK
  ======================================================= */

  const activityState =
    useSavingsActivity(query) || {};

  const {
    activities: hookActivities,
    items: hookItems,
    data,

    loading = false,
    isLoading = false,

    refreshing = false,
    isRefreshing = false,

    error = null,

    fetchActivities,
    refetch,
    refresh,
  } = activityState;

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const initialLoading =
    Boolean(
      loading || isLoading
    );

  const refreshingActivity =
    Boolean(
      refreshing || isRefreshing
    );

  /* =======================================================
     ACTIVITIES
  ======================================================= */

  const activities = useMemo(() => {
    const source =
      hookActivities ??
      hookItems ??
      data ??
      [];

    const collection =
      resolveActivities(source);

    return collection
      .map((activity) => {
        try {
          return normalizeSavingsActivity(
            activity
          );
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(
        0,
        normalizeLimit(limit)
      );
  }, [
    hookActivities,
    hookItems,
    data,
    limit,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activityCount =
    activities.length;

  const hasActivities =
    activityCount > 0;

  const totalAmount = useMemo(
    () =>
      activities.reduce(
        (total, activity) =>
          total +
          getActivityAmount(
            activity
          ),
        0
      ),
    [activities]
  );

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  /* =======================================================
     REFRESH CAPABILITY
  ======================================================= */

  const canRefresh =
    typeof refresh === "function" ||
    typeof refetch === "function" ||
    typeof fetchActivities ===
      "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
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
        typeof fetchActivities ===
        "function"
      ) {
        return fetchActivities(
          query
        );
      }

      return undefined;
    }, [
      refresh,
      refetch,
      fetchActivities,
      query,
    ]);

  const handleRetry =
    useCallback(() => {
      void handleRefresh();
    }, [handleRefresh]);

  /* =======================================================
     VIEW ALL
  ======================================================= */

  const handleViewAll =
    useCallback(() => {
      if (
        typeof onViewAll === "function"
      ) {
        onViewAll();
      }
    }, [onViewAll]);

  /* =======================================================
     ACTIVITY CLICK
  ======================================================= */

  const handleActivityClick =
    useCallback(
      (activity) => {
        if (
          typeof onActivityClick ===
          "function"
        ) {
          onActivityClick(activity);
        }
      },
      [onActivityClick]
    );

  /* =======================================================
     START SAVING
  ======================================================= */

  const handleCreateSaving =
    useCallback(() => {
      /*
       * This is deliberately a direct event-handler call.
       *
       * No state update.
       * No effect.
       * No API request.
       * No navigation inside this component.
       *
       * The parent owns the actual "create saving"
       * destination/modal/workflow.
       */
      if (
        typeof onCreateSaving ===
        "function"
      ) {
        onCreateSaving();
      }
    }, [onCreateSaving]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const refreshHandler =
    showRefresh && canRefresh
      ? handleRefresh
      : undefined;

  const viewAllHandler =
    typeof onViewAll === "function"
      ? handleViewAll
      : undefined;

  /*
   * IMPORTANT:
   *
   * We only pass the create handler when the parent
   * actually supplied one.
   */
  const createSavingHandler =
    typeof onCreateSaving ===
    "function"
      ? handleCreateSaving
      : undefined;

  /* =======================================================
     CONTAINER
  ======================================================= */

  const containerClassName = [
    "w-full",
    "overflow-hidden",
    "rounded-3xl",
    "border",
    "border-slate-200",
    "bg-white",
    "shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    initialLoading &&
    !hasActivities
  ) {
    return (
      <section
        className={containerClassName}
        aria-labelledby={
          showHeader
            ? "savings-activity-title"
            : undefined
        }
        aria-busy="true"
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={description}
            activityCount={null}
            refreshing={false}
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-5 sm:py-6
          "
        >
          <SavingsSkeleton
            count={
              compact ? 3 : 5
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (
    errorMessage &&
    !hasActivities
  ) {
    return (
      <section
        className={containerClassName}
        aria-labelledby={
          showHeader
            ? "savings-activity-title"
            : undefined
        }
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={description}
            activityCount={0}
            refreshing={false}
            onRefresh={
              refreshHandler
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-6
          "
        >
          <SavingsErrorState
            error={errorMessage}
            onRetry={
              canRefresh
                ? handleRetry
                : undefined
            }
            retrying={
              refreshingActivity
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    !hasActivities &&
    showEmptyState
  ) {
    return (
      <section
        className={containerClassName}
        aria-labelledby={
          showHeader
            ? "savings-activity-title"
            : undefined
        }
      >
        {showHeader && (
          <PageHeader
            title={title}
            description={description}
            activityCount={0}
            refreshing={
              refreshingActivity
            }
            onRefresh={
              refreshHandler
            }
            onViewAll={
              viewAllHandler
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-6
          "
        >
          <SavingsActivityEmptyState
            filtered={false}
            onCreateSaving={
              createSavingHandler
            }
            onRefresh={
              refreshHandler
            }
            refreshing={
              refreshingActivity
            }
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main
      className={`w-full ${className}`}
      aria-labelledby={
        showHeader
          ? "savings-activity-title"
          : undefined
      }
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
        {showHeader && (
          <PageHeader
            title={title}
            description={description}
            activityCount={
              activityCount
            }
            refreshing={
              refreshingActivity
            }
            onRefresh={
              refreshHandler
            }
            onViewAll={
              viewAllHandler
            }
          />
        )}

        <div
          className="
            px-5 sm:px-6 py-5 sm:py-6
          "
        >
          {showSummary && (
            <div
              className="
                mb-5
              "
            >
              <ActivitySummary
                count={activityCount}
                totalAmount={
                  totalAmount
                }
                currency={currency}
              />
            </div>
          )}

          {errorMessage &&
            hasActivities && (
              <BackgroundError
                message={
                  errorMessage
                }
                refreshing={
                  refreshingActivity
                }
                onRetry={
                  canRefresh
                    ? handleRetry
                    : undefined
                }
              />
            )}

          <RefreshStatus
            refreshing={
              refreshingActivity
            }
          />

          <SavingsActivityList
            activities={activities}
            loading={initialLoading}
            error={errorMessage}
            onRetry={
              canRefresh
                ? handleRetry
                : undefined
            }
            onActivityClick={
              handleActivityClick
            }
            ariaLabel="Savings activity list"
          />
        </div>

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
            Savings activity reflects
            transactions and executions
            currently available in your
            account.
          </p>

          {refreshingActivity && (
            <span
              className="
                inline-flex items-center
                font-medium text-[11px] text-slate-500
                gap-1.5 shrink-0
              "
              role="status"
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
   DISPLAY NAME
========================================================= */

SavingsActivityPage.displayName =
  "SavingsActivityPage";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsActivityPage
);