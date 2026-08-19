import {
  memo,
  useMemo,
} from "react";
import PropTypes from "prop-types";

import SavingsActivityItem from "./SavingsActivityItem";
import SavingsActivityEmptyState from "./SavingsActivityEmptyState";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_SKELETON_COUNT = 5;

const DEFAULT_ARIA_LABEL =
  "Savings activity";

/* =========================================================
   INTERNAL HELPERS
========================================================= */

/**
 * Safely extracts an activity array from supported
 * collection shapes.
 *
 * The preferred contract is already an array.
 * These fallbacks provide a defensive presentation boundary
 * for legacy/wrapped responses.
 */
const normalizeActivityCollection = (
  value
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    if (Array.isArray(value.data)) {
      return value.data;
    }

    if (Array.isArray(value.items)) {
      return value.items;
    }

    if (Array.isArray(value.results)) {
      return value.results;
    }
  }

  return [];
};

/**
 * Resolves a stable React key.
 *
 * Backend-provided identifiers are preferred.
 * Index is deliberately retained only as a final defensive
 * fallback because stable backend IDs should be available
 * for normalized SmartSave activity.
 */
const getActivityKey = (
  activity,
  index
) => {
  if (
    activity?.id !== undefined &&
    activity?.id !== null
  ) {
    return String(activity.id);
  }

  if (
    activity?._id !== undefined &&
    activity?._id !== null
  ) {
    return String(activity._id);
  }

  if (
    activity?.activityId !== undefined &&
    activity?.activityId !== null
  ) {
    return String(activity.activityId);
  }

  if (
    activity?.executionId !== undefined &&
    activity?.executionId !== null
  ) {
    return `execution-${String(
      activity.executionId
    )}`;
  }

  if (
    activity?.contributionId !== undefined &&
    activity?.contributionId !== null
  ) {
    return `contribution-${String(
      activity.contributionId
    )}`;
  }

  if (
    activity?.transactionId !== undefined &&
    activity?.transactionId !== null
  ) {
    return `transaction-${String(
      activity.transactionId
    )}`;
  }

  return `activity-${index}`;
};

/**
 * Safely extracts an error message for presentation.
 */
const getErrorMessage = (error) => {
  if (typeof error === "string") {
    const message = error.trim();

    if (message) {
      return message;
    }
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const message =
      typeof error.message === "string"
        ? error.message.trim()
        : "";

    if (message) {
      return message;
    }
  }

  return "Something went wrong while loading your savings activity.";
};

/* =========================================================
   SKELETON
========================================================= */

const ActivitySkeletonItem = memo(
  function ActivitySkeletonItem() {
    return (
      <div
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
        {/* Icon */}
        <div
          className="
            w-11 h-11
            bg-slate-200
            rounded-full
            shrink-0
          "
          /
        >

        {/* Main content */}
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

        {/* Amount */}
        <div
          className="
            w-20 h-4
            bg-slate-200
            rounded
            shrink-0
          "
          /
        >
      </div>
    );
  }
);

ActivitySkeletonItem.displayName =
  "ActivitySkeletonItem";

/* =========================================================
   LOADING STATE
========================================================= */

const SavingsActivitySkeleton = memo(
  function SavingsActivitySkeleton({
    ariaLabel,
    count = DEFAULT_SKELETON_COUNT,
    className = "",
  }) {
    const safeCount =
      Number.isInteger(count) &&
      count > 0
        ? count
        : DEFAULT_SKELETON_COUNT;

    return (
      <section
        className={[
          "w-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-busy="true"
      >
        <div
          className="
            space-y-3
          "
        >
          {Array.from({
            length: safeCount,
          }).map((_, index) => (
            <ActivitySkeletonItem
              key={`activity-skeleton-${index}`}
            />
          ))}
        </div>

        <span
          className="
            sr-only
          "
          role="status"
          aria-live="polite"
        >
          Loading savings activity.
        </span>
      </section>
    );
  }
);

SavingsActivitySkeleton.displayName =
  "SavingsActivitySkeleton";

/* =========================================================
   ERROR STATE
========================================================= */

const SavingsActivityErrorState = memo(
  function SavingsActivityErrorState({
    error,
    onRetry,
    ariaLabel,
    className = "",
    disabled = false,
  }) {
    const errorMessage =
      getErrorMessage(error);

    const canRetry =
      typeof onRetry === "function";

    return (
      <section
        className={[
          "w-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
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
            <div
              className="
                min-w-0
              "
            >
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
                  text-red-600 break-words
                "
              >
                {errorMessage}
              </p>
            </div>

            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={disabled}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2
                  font-semibold text-red-700 text-sm
                  bg-white hover:bg-red-50
                  border border-red-300 rounded-xl focus:outline-none
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
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
);

SavingsActivityErrorState.displayName =
  "SavingsActivityErrorState";

/* =========================================================
   COMPONENT
========================================================= */

/**
 * SavingsActivityList
 *
 * Presentational collection component for SmartSave activity.
 *
 * Responsibilities:
 * - Normalize supported collection wrappers.
 * - Render loading state.
 * - Render initial error state.
 * - Render empty state.
 * - Render activity items.
 * - Surface user interactions to the parent.
 *
 * Non-responsibilities:
 * - No API requests.
 * - No mutations.
 * - No pagination logic.
 * - No financial calculations.
 * - No business-rule decisions.
 *
 * Data ownership remains:
 *
 * smartSaveService
 *        ↓
 * useSavingsActivity
 *        ↓
 * SavingsActivityPage
 *        ↓
 * SavingsActivityList
 *        ↓
 * SavingsActivityItem
 */
const SavingsActivityList = ({
  activities,
  loading = false,
  error = null,

  onActivityClick,
  onRetry,

  onCreateSaving,
  onClearFilters,
  onRefresh,

  filtered = false,
  refreshing = false,
  disabled = false,

  className = "",
  itemClassName = "",

  ariaLabel = DEFAULT_ARIA_LABEL,
}) => {
  /* =======================================================
     NORMALIZE INPUT
  ======================================================= */

  const normalizedActivities =
    useMemo(
      () =>
        normalizeActivityCollection(
          activities
        ),
      [activities]
    );

  const hasActivities =
    normalizedActivities.length > 0;

  const hasError =
    Boolean(error);

  const initialLoading =
    Boolean(loading) &&
    !hasActivities;

  const initialError =
    hasError &&
    !hasActivities &&
    !initialLoading;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (initialLoading) {
    return (
      <SavingsActivitySkeleton
        ariaLabel={ariaLabel}
        className={className}
      />
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (initialError) {
    return (
      <SavingsActivityErrorState
        error={error}
        onRetry={onRetry}
        ariaLabel={ariaLabel}
        className={className}
        disabled={disabled}
      />
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!hasActivities) {
    return (
      <SavingsActivityEmptyState
        filtered={filtered}
        onCreateSaving={onCreateSaving}
        onClearFilters={onClearFilters}
        onRefresh={onRefresh}
        refreshing={refreshing}
        disabled={disabled}
      />
    );
  }

  /* =======================================================
     ACTIVITY LIST
  ======================================================= */

  return (
    <section
      className={[
        "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
                onClick={
                  onActivityClick
                }
              />
            </div>
          )
        )}
      </div>

      {/* =================================================
          BACKGROUND REFRESH
      ================================================= */}

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
   PROP TYPES
========================================================= */

const activityShape =
  PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

    _id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

    activityId:
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

    executionId:
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

    contributionId:
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

    transactionId:
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

    reference:
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),

    type: PropTypes.string,
    activityType: PropTypes.string,
    eventType: PropTypes.string,
    category: PropTypes.string,

    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    message: PropTypes.string,
    note: PropTypes.string,

    amount: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),
        currency: PropTypes.string,
      }),
    ]),

    currency: PropTypes.string,
    status: PropTypes.string,

    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    occurredAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    executedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    updatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    goalName: PropTypes.string,

    savingGoal: PropTypes.shape({
      name: PropTypes.string,
    }),

    goal: PropTypes.shape({
      name: PropTypes.string,
    }),
  });

SavingsActivityList.propTypes = {
  activities: PropTypes.oneOfType([
    PropTypes.arrayOf(
      activityShape
    ),
    PropTypes.shape({
      data: PropTypes.arrayOf(
        activityShape
      ),
      items: PropTypes.arrayOf(
        activityShape
      ),
      results: PropTypes.arrayOf(
        activityShape
      ),
    }),
  ]),

  loading: PropTypes.bool,

  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
    }),
  ]),

  onActivityClick:
    PropTypes.func,

  onRetry: PropTypes.func,

  onCreateSaving:
    PropTypes.func,

  onClearFilters:
    PropTypes.func,

  onRefresh:
    PropTypes.func,

  filtered: PropTypes.bool,

  refreshing: PropTypes.bool,

  disabled: PropTypes.bool,

  className: PropTypes.string,

  itemClassName:
    PropTypes.string,

  ariaLabel:
    PropTypes.string,
};

SavingsActivityList.defaultProps = {
  activities: [],
  loading: false,
  error: null,

  onActivityClick:
    undefined,

  onRetry:
    undefined,

  onCreateSaving:
    undefined,

  onClearFilters:
    undefined,

  onRefresh:
    undefined,

  filtered: false,
  refreshing: false,
  disabled: false,

  className: "",
  itemClassName: "",

  ariaLabel:
    DEFAULT_ARIA_LABEL,
};

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsActivityList
);