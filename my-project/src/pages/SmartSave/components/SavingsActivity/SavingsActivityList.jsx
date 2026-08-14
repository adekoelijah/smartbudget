// SavingsActivityList.jsx

import { memo, useMemo } from "react";

import SavingsActivityItem from "./SavingsActivityItem";
import SavingsActivityEmptyState from "./SavingsActivityEmptyState";

/* =========================================================
   INTERNAL HELPERS
========================================================= */

/**
 * Safely extract an array from the activity hook result.
 *
 * The hook/service layer should normally already return an
 * array, but this defensive boundary prevents malformed API
 * responses from breaking the component tree.
 */
const normalizeActivityCollection = (value) => {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

/**
 * Resolve a stable React key without assuming one specific
 * backend identifier.
 *
 * Normalized activity should preferably expose `id`.
 */
const getActivityKey = (activity, index) => {
  if (activity?.id) return String(activity.id);

  if (activity?._id) return String(activity._id);

  if (activity?.activityId) {
    return String(activity.activityId);
  }

  if (activity?.executionId) {
    return `execution-${activity.executionId}`;
  }

  if (activity?.contributionId) {
    return `contribution-${activity.contributionId}`;
  }

  if (activity?.transactionId) {
    return `transaction-${activity.transactionId}`;
  }

  /*
   * Index is intentionally only the final fallback.
   * The normalizer should provide a stable identifier.
   */
  return `activity-${index}`;
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsActivityList = ({
  activities,
  loading = false,
  error = null,

  /*
   * Optional UI controls.
   *
   * These remain presentation-level callbacks. The list
   * itself does not know how mutations/API calls work.
   */
  onActivityClick,
  onRetry,

  /*
   * Optional layout customization.
   */
  className = "",
  itemClassName = "",

  /*
   * Empty-state customization.
   */
  emptyTitle,
  emptyDescription,
  emptyAction,
  emptyActionLabel,

  /*
   * Accessibility.
   */
  ariaLabel = "Savings activity",
}) => {
  /* =======================================================
     NORMALIZE INPUT
  ======================================================= */

  const normalizedActivities = useMemo(
    () => normalizeActivityCollection(activities),
    [activities]
  );

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading && normalizedActivities.length === 0) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label={ariaLabel}
        aria-busy="true"
      >
        <div
          className="
            space-y-3
          "
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`activity-skeleton-${index}`}
              className="
                flex items-center
                p-4
                bg-white
                border border-slate-200 rounded-2xl
                animate-pulse
                gap-4
              "
              aria-hidden="true"
            >
              <div
                className="
                  w-11 h-11
                  bg-slate-200
                  rounded-full
                  shrink-0
                "
                /
              >

              <div
                className="
                  flex-1
                  min-w-0
                  space-y-2
                "
              >
                <div
                  className="
                    w-2/5 h-3.5
                    bg-slate-200
                    rounded
                  "
                  /
                >
                <div
                  className="
                    w-3/5 h-3
                    bg-slate-200
                    rounded
                  "
                  /
                >
              </div>

              <div
                className="
                  w-20 h-4
                  bg-slate-200
                  rounded
                "
                /
              >
            </div>
          ))}
        </div>

        <span
          className="
            sr-only
          "
        >
          Loading savings activity.
        </span>
      </section>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (
    error &&
    normalizedActivities.length === 0
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-label={ariaLabel}
      >
        <div
          role="alert"
          className="
            px-4 py-5
            text-red-700 text-sm
            bg-red-50
            border border-red-200 rounded-2xl
          "
        >
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-semibold
                "
              >
                Unable to load savings activity
              </p>

              <p
                className="
                  mt-1
                  text-red-600
                "
              >
                {typeof error === "string"
                  ? error
                  : error?.message ||
                    "Something went wrong while loading your savings activity."}
              </p>
            </div>

            {typeof onRetry === "function" && (
              <button
                type="button"
                onClick={onRetry}
                className="
                  inline-flex justify-center items-center
                  px-4 py-2
                  font-semibold text-red-700 text-sm
                  bg-white hover:bg-red-100
                  border border-red-300 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  transition
                  shrink-0
                "
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (normalizedActivities.length === 0) {
    return (
      <SavingsActivityEmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  /* =======================================================
     ACTIVITY LIST
  ======================================================= */

  return (
    <section
      className={`w-full ${className}`}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      <div
        role="list"
        className="
          space-y-3
        "
      >
        {normalizedActivities.map(
          (activity, index) => (
            <div
              key={getActivityKey(
                activity,
                index
              )}
              role="listitem"
              className={itemClassName}
            >
              <SavingsActivityItem
                activity={activity}
                onClick={onActivityClick}
              />
            </div>
          )
        )}
      </div>

      {loading && (
        <div
          className="
            mt-3
            text-slate-500 text-xs text-center
          "
          role="status"
          aria-live="polite"
        >
          Updating savings activity…
        </div>
      )}
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(SavingsActivityList);