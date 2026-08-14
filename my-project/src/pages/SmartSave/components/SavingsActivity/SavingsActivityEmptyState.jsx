import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  FilterX,
  PiggyBank,
  Plus,
  RotateCcw,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
} from "react";

/* =========================================================
   ICON
========================================================= */

const EmptyStateIcon = memo(
  ({ filtered = false }) => {
    const Icon = filtered
      ? FilterX
      : PiggyBank;

    return (
      <div
        aria-hidden="true"
        className="
          flex justify-center items-center
          w-16 h-16
          text-slate-500
          bg-slate-50
          border border-slate-200 rounded-2xl
          shadow-sm
          shrink-0
        "
      >
        <Icon
          size={28}
          strokeWidth={1.8}
        />
      </div>
    );
  }
);

EmptyStateIcon.displayName =
  "EmptyStateIcon";

/* =========================================================
   SECONDARY INFORMATION
========================================================= */

const ActivityEmptyStateHints = memo(
  ({ filtered }) => {
    const hints = useMemo(
      () =>
        filtered
          ? [
              {
                icon: FilterX,
                text:
                  "Try removing some filters to see more activity.",
              },
              {
                icon: CalendarClock,
                text:
                  "You can also expand your activity date range.",
              },
            ]
          : [
              {
                icon: CircleDollarSign,
                text:
                  "Your completed savings activity will appear here.",
              },
              {
                icon: CalendarClock,
                text:
                  "Scheduled and automatic savings can be tracked from your activity history.",
              },
            ],
      [filtered]
    );

    return (
      <div
        className="
          grid sm:grid-cols-2
          mt-6
          gap-3
        "
      >
        {hints.map(
          ({
            icon: Icon,
            text,
          }) => (
            <div
              key={text}
              className="
                flex items-start
                px-4 py-3
                text-left
                bg-white
                border border-slate-100 rounded-xl
                gap-3
              "
            >
              <Icon
                aria-hidden="true"
                size={18}
                className="
                  mt-0.5
                  text-slate-400
                  shrink-0
                "
                /
              >

              <p
                className="
                  text-slate-600 text-sm leading-5
                "
              >
                {text}
              </p>
            </div>
          )
        )}
      </div>
    );
  }
);

ActivityEmptyStateHints.displayName =
  "ActivityEmptyStateHints";

/* =========================================================
   MAIN COMPONENT
========================================================= */

/**
 * SavingsActivityEmptyState
 *
 * Presentational empty state for SmartSave activity.
 *
 * IMPORTANT:
 * This component intentionally does not fetch data.
 *
 * Data ownership:
 *
 * smartSaveService
 *      ↓
 * useSavingsActivity
 *      ↓
 * SavingsActivityEmptyState
 *
 * Props:
 *
 * @param {boolean} filtered
 *   Whether the empty state is caused by active filters.
 *
 * @param {Function} onCreateSaving
 *   Called when the user wants to start saving.
 *
 * @param {Function} onClearFilters
 *   Called when active filters should be removed.
 *
 * @param {Function} onRefresh
 *   Optional activity refresh callback.
 *
 * @param {boolean} refreshing
 *   Whether activity is currently refreshing.
 *
 * @param {boolean} disabled
 *   Disables interactive actions.
 */
const SavingsActivityEmptyState = ({
  filtered = false,
  onCreateSaving,
  onClearFilters,
  onRefresh,
  refreshing = false,
  disabled = false,
}) => {
  /* =======================================================
     CALLBACKS
  ======================================================= */

  const handlePrimaryAction =
    useCallback(() => {
      if (disabled) {
        return;
      }

      if (filtered) {
        onClearFilters?.();
        return;
      }

      onCreateSaving?.();
    }, [
      disabled,
      filtered,
      onClearFilters,
      onCreateSaving,
    ]);

  const handleRefresh =
    useCallback(() => {
      if (
        disabled ||
        refreshing
      ) {
        return;
      }

      onRefresh?.();
    }, [
      disabled,
      onRefresh,
      refreshing,
    ]);

  /* =======================================================
     CONTENT
  ======================================================= */

  const content = useMemo(() => {
    if (filtered) {
      return {
        eyebrow: "No matching activity",
        title:
          "Nothing matches your current filters",
        description:
          "We couldn't find savings activity for the filters you've selected. Adjust your filters or clear them to view your full activity history.",
        primaryLabel:
          "Clear filters",
      };
    }

    return {
      eyebrow: "Savings activity",
      title:
        "Your savings activity will appear here",
      description:
        "Once you start saving, your contributions, scheduled savings, and completed saving activity will be organized here for easy tracking.",
      primaryLabel:
        "Start saving",
    };
  }, [filtered]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby="savings-activity-empty-title"
      className="
        w-full
        px-5 sm:px-8 py-8 sm:py-10
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm
      "
    >
      <div
        className="
          flex flex-col items-center
          max-w-2xl
          mx-auto
          text-center
        "
      >
        <EmptyStateIcon
          filtered={filtered}
        />

        <span
          className="
            mt-5
            font-semibold text-slate-500 text-xs uppercase tracking-wider
          "
        >
          {content.eyebrow}
        </span>

        <h2
          id="savings-activity-empty-title"
          className="
            mt-2
            font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
          "
        >
          {content.title}
        </h2>

        <p
          className="
            max-w-xl
            mt-3
            text-slate-600 text-sm sm:text-base leading-6
          "
        >
          {content.description}
        </p>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            flex flex-col sm:flex-row justify-center
            items-stretch sm:items-center
            w-full sm:w-auto
            mt-6
            gap-3
          "
        >
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={
              disabled ||
              (filtered
                ? !onClearFilters
                : !onCreateSaving)
            }
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5 py-2.5
              font-semibold text-white text-sm
              bg-slate-900 hover:bg-slate-800
              rounded-xl focus:outline-none
              disabled:opacity-50 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
              focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
            "
          >
            {filtered ? (
              <RotateCcw
                aria-hidden="true"
                size={17}
              />
            ) : (
              <Plus
                aria-hidden="true"
                size={17}
              />
            )}

            {content.primaryLabel}

            <ArrowRight
              aria-hidden="true"
              size={16}
            />
          </button>

          {!filtered &&
            onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={
                  disabled ||
                  refreshing
                }
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 hover:border-slate-300 rounded-xl
                  focus:outline-none
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  gap-2
                  focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
                "
                aria-busy={refreshing}
              >
                <RotateCcw
                  aria-hidden="true"
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : undefined
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            )}
        </div>

        <ActivityEmptyStateHints
          filtered={filtered}
        />
      </div>
    </section>
  );
};

SavingsActivityEmptyState.displayName ="SavingsActivityEmptyState";

export default memo(
  SavingsActivityEmptyState
);