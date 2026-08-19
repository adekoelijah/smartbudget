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

const DEFAULT_EMPTY_TITLE =
  "No savings activity yet";

const DEFAULT_EMPTY_DESCRIPTION =
  "Your savings activity will appear here as you start contributing to your goals and strategies.";

const DEFAULT_LIMIT = 20;

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_LOCALE = "en-NG";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings activity. Please try again.";

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Resolve a backend/entity identifier.
 */
const getEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  return (
    entity?.id ??
    entity?._id ??
    entity?.activityId ??
    entity?.executionId ??
    entity?.contributionId ??
    null
  );
};

/**
 * Safely resolve an API collection.
 *
 * The backend/service should already normalize this.
 * These fallbacks protect the presentation boundary.
 */
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

/**
 * Convert unknown errors into safe UI text.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    error?.error ??
    DEFAULT_ERROR_MESSAGE
  );
};

/**
 * Safely resolve a positive financial amount.
 *
 * This is display-only logic.
 * Financial calculations remain backend-owned.
 */
const getActivityAmount = (activity) => {
  const value =
    activity?.amount ??
    activity?.value ??
    activity?.totalAmount ??
    0;

  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0
    ? amount
    : 0;
};

/**
 * Stable React key.
 */
const getActivityKey = (activity, index) => {
  const id = getEntityId(activity);

  if (id) {
    return String(id);
  }

  const timestamp =
    activity?.createdAt ??
    activity?.date ??
    activity?.executedAt ??
    "";

  const type =
    activity?.type ??
    activity?.activityType ??
    "activity";

  return `${type}-${timestamp}-${index}`;
};

/**
 * Build a stable query object.
 *
 * IMPORTANT:
 * Do not pass the caller's object directly to the hook.
 * We intentionally create a canonical object containing
 * only supported pagination/filter values.
 */
const buildQuery = ({
  incomingQuery,
  limit,
}) => {
  const source =
    incomingQuery &&
    typeof incomingQuery === "object" &&
    !Array.isArray(incomingQuery)
      ? incomingQuery
      : {};

  const normalizedLimit =
    Number.isInteger(limit) && limit > 0
      ? limit
      : DEFAULT_LIMIT;

  return {
    ...source,
    page:
      Number.isInteger(source.page) &&
      source.page > 0
        ? source.page
        : 1,
    limit: normalizedLimit,
  };
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

                {Number.isInteger(activityCount) ? (
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
                ) : null}
              </div>

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

          <div
            className="
              flex items-center
              gap-2 shrink-0
            "
          >
            {typeof onRefresh === "function" ? (
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
            ) : null}

            {typeof onViewAll === "function" ? (
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
            ) : null}
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

    const formattedAmount =
      new Intl.NumberFormat(
        DEFAULT_LOCALE,
        {
          style: "currency",
          currency:
            currency || DEFAULT_CURRENCY,
          maximumFractionDigits: 2,
        }
      ).format(totalAmount);

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

        {typeof onRetry === "function" ? (
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
      buildQuery({
        incomingQuery,
        limit,
      }),
    [
      incomingQuery,
      limit,
    ]
  );

  /* =======================================================
     DATA OWNER
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

  const hasInitialRequest =
    Boolean(
      loading ||
      isLoading
    );

  const isRefreshingActivity =
    Boolean(
      refreshing ||
      isRefreshing
    );

  /* =======================================================
     RESOLVE ACTIVITIES
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
      .map(
        (activity) =>
          normalizeSavingsActivity(
            activity
          )
      )
      .filter(Boolean)
      .slice(
        0,
        Number.isInteger(limit) &&
          limit > 0
          ? limit
          : DEFAULT_LIMIT
      );
  }, [
    hookActivities,
    hookItems,
    data,
    limit,
  ]);

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const activityCount =
    activities.length;

  const hasActivities =
    activityCount > 0;

  const totalAmount =
    useMemo(
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

  const errorMessage =
    useMemo(
      () =>
        getErrorMessage(error),
      [error]
    );

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
    }, [
      refresh,
      refetch,
      fetchActivities,
      query,
    ]);

  const handleRetry =
    useCallback(() => {
      void handleRefresh();
    }, [
      handleRefresh,
    ]);

  /* =======================================================
     CALLBACKS
  ======================================================= */

  const handleViewAll =
    useCallback(() => {
      if (
        typeof onViewAll ===
        "function"
      ) {
        onViewAll();
      }
    }, [
      onViewAll,
    ]);

  const handleActivityClick =
    useCallback(
      (activity, ...args) => {
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

  const handleEmptyAction =
    useCallback(() => {
      if (
        typeof emptyAction ===
        "function"
      ) {
        return emptyAction();
      }

      return undefined;
    }, [
      emptyAction,
    ]);

  /* =======================================================
     CAPABILITIES
  ======================================================= */

  const refreshHandler =
    showRefresh &&
    canRefresh
      ? handleRefresh
      : undefined;

  const viewAllHandler =
    typeof onViewAll ===
    "function"
      ? handleViewAll
      : undefined;

  const emptyActionHandler =
    typeof emptyAction ===
    "function"
      ? handleEmptyAction
      : undefined;

  /* =======================================================
     CONTAINER
  ======================================================= */

  const containerClassName = `
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
    hasInitialRequest &&
    !hasActivities
  ) {
    return (
      <section
        className={containerClassName}
        aria-labelledby="savings-activity-title"
        aria-busy="true"
      >
        {showHeader ? (
          <PageHeader
            title={title}
            description={description}
            activityCount={null}
            refreshing={false}
          />
        ) : null}

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
     INITIAL ERROR
  ======================================================= */

  if (
    errorMessage &&
    !hasActivities
  ) {
    return (
      <section
        className={containerClassName}
        aria-labelledby="savings-activity-title"
      >
        {showHeader ? (
          <PageHeader
            title={title}
            description={description}
            activityCount={0}
            refreshing={false}
            onRefresh={
              refreshHandler
            }
          />
        ) : null}

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
              isRefreshingActivity
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
        aria-labelledby="savings-activity-title"
      >
        {showHeader ? (
          <PageHeader
            title={title}
            description={description}
            activityCount={0}
            refreshing={
              isRefreshingActivity
            }
            onRefresh={
              refreshHandler
            }
            onViewAll={
              viewAllHandler
            }
          />
        ) : null}

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
              emptyActionHandler
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
        {/* HEADER */}

        {showHeader ? (
          <PageHeader
            title={title}
            description={description}
            activityCount={
              activityCount
            }
            refreshing={
              isRefreshingActivity
            }
            onRefresh={
              refreshHandler
            }
            onViewAll={
              viewAllHandler
            }
          />
        ) : null}

        {/* CONTENT */}

        <div
          className="
            px-5 sm:px-6 py-5 sm:py-6
          "
        >
          {/* SUMMARY */}

          {showSummary ? (
            <div
              className="
                mb-5
              "
            >
              <ActivitySummary
                count={
                  activityCount
                }
                totalAmount={
                  totalAmount
                }
                currency={
                  currency
                }
              />
            </div>
          ) : null}

          {/* BACKGROUND ERROR */}

          {errorMessage &&
          hasActivities ? (
            <BackgroundError
              message={
                errorMessage
              }
              refreshing={
                isRefreshingActivity
              }
              onRetry={
                canRefresh
                  ? handleRetry
                  : undefined
              }
            />
          ) : null}

          {/* ACTIVITY */}

          <div
            className="
              relative
            "
            aria-busy={
              isRefreshingActivity
            }
          >
            <RefreshStatus
              refreshing={
                isRefreshingActivity
              }
            />

            <SavingsActivityList
              activities={
                activities
              }
              loading={
                hasInitialRequest
              }
              error={
                errorMessage
              }
              onRetry={
                canRefresh
                  ? handleRetry
                  : undefined
              }
              onActivityClick={
                handleActivityClick
              }
              emptyAction={
                emptyActionHandler
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

        {/* FOOTER */}

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

          {isRefreshingActivity ? (
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
          ) : null}
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