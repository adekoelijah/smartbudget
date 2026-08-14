
import {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  ArrowRight,
  Activity,
} from "lucide-react";

import SavingsActivityList from "./SavingsActivityList";
import SavingsActivityEmptyState from "./SavingsActivityEmptyState";
import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

import useSavingsActivity from "../../../../hooks/useSavingsActivity";

import {
  normalizeSavingsActivity,
} from "../../../../utils/smartSave/savingsNormalizers";

// import {
//   formatSavingsAmount,
// } from "../../utils/savingsFormatters";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_TITLE =
  "Savings Activity";

const DEFAULT_DESCRIPTION =
  "Track your recent savings contributions, executions, and progress.";

const DEFAULT_EMPTY_TITLE =
  "No savings activity yet";

const DEFAULT_EMPTY_DESCRIPTION =
  "Your savings activity will appear here as you start contributing to your goals and strategies.";

/* =========================================================
   INTERNAL HELPERS
========================================================= */

/**
 * Safely resolve an error message for presentation.
 *
 * Business/service error normalization should happen
 * inside the service/hook layer. This is only the final
 * presentation boundary.
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
    "We couldn't load your savings activity. Please try again."
  );
};

/**
 * Resolve a collection from common API envelopes.
 *
 * This is intentionally defensive. The normalizer remains
 * the authoritative transformation layer.
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

  return [];
};

/**
 * Resolve an activity identifier safely.
 */
// const getActivityId = (
//   activity
// ) =>
//   activity?._id ??
//   activity?.id ??
//   activity?.activityId ??
//   null;

/* =========================================================
   COMPONENT
========================================================= */

const SavingsActivitySection = ({
  title =
    DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  query = {},

  limit,

  onViewAll,

  onActivityClick,

  emptyAction,

  emptyActionLabel,

  className = "",

  /*
   * Allows the parent to control whether the section
   * should display a compact activity feed.
   */
  compact = false,

  /*
   * Allows the section to remain visually useful even
   * when the backend returns no activities.
   */
  showEmptyState = true,
}) => {
  /* =======================================================
     ACTIVITY HOOK
  ======================================================= */

  const activityState =
    useSavingsActivity(
      query
    );

  const {
    activities:
      hookActivities,

    data,

    loading = false,

    error,

    fetchActivities,

    refetch,
  } =
    activityState ?? {};

  /* =======================================================
     NORMALIZE ACTIVITIES
  ======================================================= */

  const activities =
    useMemo(() => {
      const source =
        hookActivities ??
        data ??
        [];

      const resolved =
        resolveActivities(
          source
        );

      /*
       * The normalizer is responsible
       * for producing the frontend-safe
       * activity contract.
       */
      const normalized =
        resolved.map(
          (activity) =>
            normalizeSavingsActivity(
              activity
            )
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
    }, [
      hookActivities,
      data,
      limit,
    ]);

  /* =======================================================
     ERROR
  ======================================================= */

  const normalizedError =
    useMemo(
      () =>
        getErrorMessage(
          error
        ),
      [error]
    );

  /* =======================================================
     ACTIVITY METADATA
  ======================================================= */

  const activityCount =
    activities.length;

  const hasActivities =
    activityCount > 0;

  const activitySummary =
    useMemo(() => {
      if (
        !hasActivities
      ) {
        return null;
      }

      let totalAmount = 0;

      activities.forEach(
        (activity) => {
          const amount =
            Number(
              activity?.amount ??
                activity?.value ??
                0
            );

          if (
            Number.isFinite(
              amount
            ) &&
            amount > 0
          ) {
            totalAmount += amount;
          }
        }
      );

      return {
        count:
          activityCount,

        totalAmount,
      };
    }, [
      activities,
      activityCount,
      hasActivities,
    ]);

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry =
    useCallback(() => {
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
      refetch,
      fetchActivities,
      query,
    ]);

  /* =======================================================
     VIEW ALL
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

  /* =======================================================
     ACTIVITY CLICK
  ======================================================= */

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

  /* =======================================================
     EMPTY ACTION
  ======================================================= */

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
     LOADING
  ======================================================= */

  if (
    loading &&
    !hasActivities
  ) {
    return (
      <section
        className={`
          w-full
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-sm
          overflow-hidden
          ${className}
        `}
        aria-labelledby="savings-activity-title"
        aria-busy="true"
      >
        {/* =============================================
            HEADER
        ============================================== */}

        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            px-4 sm:px-6 py-4
            border-slate-100 border-b
            gap-3
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-10 h-10
                bg-slate-100
                rounded-xl
                shrink-0
              "
            >
              <Activity
                size={18}
                className="
                  text-slate-600
                "
                aria-hidden="true"
              /
              >
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="savings-activity-title"
                className="
                  font-bold text-slate-900 text-base sm:text-lg truncate
                  tracking-tight
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
        </header>

        {/* =============================================
            SKELETON
        ============================================== */}

        <div
          className="
            px-4 sm:px-6 py-4 sm:py-5
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
     ERROR
  ======================================================= */

  if (
    normalizedError &&
    !hasActivities
  ) {
    return (
      <section
        className={`
          w-full
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-sm
          overflow-hidden
          ${className}
        `}
        aria-labelledby="savings-activity-title"
      >
        <header
          className="
            flex items-center
            px-4 sm:px-6 py-4
            border-slate-100 border-b
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-10 h-10
              bg-slate-100
              rounded-xl
              shrink-0
            "
          >
            <Activity
              size={18}
              className="
                text-slate-600
              "
              aria-hidden="true"
            /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h2
              id="savings-activity-title"
              className="
                font-bold text-slate-900 text-base sm:text-lg tracking-tight
              "
            >
              {title}
            </h2>

            {description && (
              <p
                className="
                  mt-1
                  text-slate-500 text-xs sm:text-sm
                "
              >
                {description}
              </p>
            )}
          </div>
        </header>

        <div
          className="
            px-4 sm:px-6 py-5
          "
        >
          <SavingsErrorState
            error={
              normalizedError
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
        className={`
          w-full
          rounded-3xl
          border border-slate-200
          bg-white
          shadow-sm
          overflow-hidden
          ${className}
        `}
        aria-labelledby="savings-activity-title"
      >
        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            px-4 sm:px-6 py-4
            border-slate-100 border-b
            gap-3
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-10 h-10
                bg-slate-100
                rounded-xl
                shrink-0
              "
            >
              <Activity
                size={18}
                className="
                  text-slate-600
                "
                aria-hidden="true"
              /
              >
            </div>

            <div>
              <h2
                id="savings-activity-title"
                className="
                  font-bold text-slate-900 text-base sm:text-lg tracking-tight
                "
              >
                {title}
              </h2>

              {description && (
                <p
                  className="
                    mt-1
                    text-slate-500 text-xs sm:text-sm leading-5
                  "
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </header>

        <div
          className="
            px-4 sm:px-6 py-5
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
     MAIN RENDER
  ======================================================= */

  return (
    <section
      className={`
        w-full
        overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
        ${className}
      `}
      aria-labelledby="savings-activity-title"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          px-4 sm:px-6 py-4
          border-slate-100 border-b
          gap-3
        "
      >
        <div
          className="
            flex items-center
            min-w-0
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-10 h-10
              bg-slate-100
              rounded-xl
              shrink-0
            "
          >
            <Activity
              size={18}
              className="
                text-slate-600
              "
              aria-hidden="true"
            /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h2
              id="savings-activity-title"
              className="
                font-bold text-slate-900 text-base sm:text-lg truncate
                tracking-tight
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

        <div
          className="
            flex items-center
            gap-2 shrink-0
          "
        >
          {activitySummary && (
            <div
              className="
                hidden sm:block
                px-3 py-2
                font-medium text-slate-600 text-xs
                bg-slate-50
                rounded-lg
              "
            >
              {activitySummary.count}{" "}
              {activitySummary.count ===
              1
                ? "activity"
                : "activities"}
            </div>
          )}

          {typeof onViewAll ===
            "function" && (
            <button
              type="button"
              onClick={
                handleViewAll
              }
              className="
                inline-flex justify-center items-center
                min-h-10
                px-4 py-2
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 hover:border-slate-300 rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                transition
                gap-2 shrink-0
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
      </header>

      {/* ===================================================
          ACTIVITY CONTENT
      =================================================== */}

      <div
        className="
          px-4 sm:px-6 py-4 sm:py-5
        "
      >
        <SavingsActivityList
          activities={
            activities
          }
          loading={
            loading
          }
          error={
            normalizedError
          }
          onRetry={
            handleRetry
          }
          onActivityClick={
            handleActivityClick
          }
          emptyAction={
            emptyAction
          }
          emptyActionLabel={
            emptyActionLabel
          }
          compact={
            compact
          }
        />
      </div>
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsActivitySection
);
