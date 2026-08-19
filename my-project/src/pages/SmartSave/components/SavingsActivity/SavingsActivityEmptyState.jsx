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
  useId,
} from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_STATE_CONTENT = {
  default: {
    eyebrow: "Savings activity",
    title: "Your savings activity will appear here",
    description:
      "Once you start saving, your contributions, scheduled savings, and completed saving activity will be organized here for easy tracking.",
    primaryLabel: "Start saving",
  },

  filtered: {
    eyebrow: "No matching activity",
    title: "Nothing matches your current filters",
    description:
      "We couldn't find savings activity for the filters you've selected. Adjust your filters or clear them to view your full activity history.",
    primaryLabel: "Clear filters",
  },
};

/* =========================================================
   HINTS
========================================================= */

const DEFAULT_HINTS = [
  {
    id: "completed-activity",
    icon: CircleDollarSign,
    text: "Your completed savings activity will appear here.",
  },
  {
    id: "scheduled-activity",
    icon: CalendarClock,
    text:
      "Scheduled and automatic savings can be tracked from your activity history.",
  },
];

const FILTERED_HINTS = [
  {
    id: "remove-filters",
    icon: FilterX,
    text:
      "Try removing some filters to see more activity.",
  },
  {
    id: "expand-date-range",
    icon: CalendarClock,
    text:
      "You can also expand your activity date range.",
  },
];

/* =========================================================
   ICON
========================================================= */

const EmptyStateIcon = memo(function EmptyStateIcon({
  filtered = false,
}) {
  const Icon = filtered ? FilterX : PiggyBank;

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
});

EmptyStateIcon.displayName = "EmptyStateIcon";

/* =========================================================
   SECONDARY INFORMATION
========================================================= */

const ActivityEmptyStateHints = memo(
  function ActivityEmptyStateHints({
    filtered = false,
  }) {
    const hints = filtered
      ? FILTERED_HINTS
      : DEFAULT_HINTS;

    return (
      <div
        className="
          grid sm:grid-cols-2
          w-full
          mt-6
          gap-3
        "
      >
        {hints.map(
          ({
            id,
            icon: Icon,
            text,
          }) => (
            <div
              key={id}
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
                strokeWidth={1.8}
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
 * Purely presentational empty state for SmartSave activity.
 *
 * Data ownership:
 *
 * smartSaveService
 *      ↓
 * useSavingsActivity
 *      ↓
 * SavingsActivityPage
 *      ↓
 * SavingsActivityEmptyState
 *
 * This component:
 * - Does not fetch data.
 * - Does not own activity state.
 * - Does not perform navigation.
 * - Does not contain financial business logic.
 *
 * @param {Object} props
 * @param {boolean} [props.filtered=false]
 *   Whether the empty state is caused by active filters.
 *
 * @param {Function} [props.onCreateSaving]
 *   Called when the user chooses to start saving.
 *
 * @param {Function} [props.onClearFilters]
 *   Called when the user chooses to clear active filters.
 *
 * @param {Function} [props.onRefresh]
 *   Optional callback used to refresh activity.
 *
 * @param {boolean} [props.refreshing=false]
 *   Whether activity is currently refreshing.
 *
 * @param {boolean} [props.disabled=false]
 *   Disables all interactive actions.
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
     ACCESSIBILITY
  ======================================================= */

  const titleId = useId();
  const descriptionId = `${titleId}-description`;

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const content = filtered
    ? EMPTY_STATE_CONTENT.filtered
    : EMPTY_STATE_CONTENT.default;

  const hasPrimaryAction = filtered
    ? typeof onClearFilters === "function"
    : typeof onCreateSaving === "function";

  const canRefresh =
    typeof onRefresh === "function";

  const primaryActionDisabled =
    disabled ||
    !hasPrimaryAction;

  const refreshDisabled =
    disabled ||
    refreshing;

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handlePrimaryAction = () => {
    if (primaryActionDisabled) {
      return;
    }

    if (filtered) {
      onClearFilters();
      return;
    }

    onCreateSaving();
  };

  const handleRefresh = () => {
    if (
      refreshDisabled ||
      !canRefresh
    ) {
      return;
    }

    onRefresh();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={refreshing}
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
        {/* =================================================
            ICON
        ================================================= */}

        <EmptyStateIcon
          filtered={filtered}
        />

        {/* =================================================
            EYEBROW
        ================================================= */}

        <span
          className="
            mt-5
            font-semibold text-slate-500 text-xs uppercase tracking-wider
          "
        >
          {content.eyebrow}
        </span>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          id={titleId}
          className="
            mt-2
            font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
          "
        >
          {content.title}
        </h2>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          id={descriptionId}
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
          {/* ===============================================
              PRIMARY ACTION
          =============================================== */}

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={primaryActionDisabled}
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
                strokeWidth={2}
              />
            ) : (
              <Plus
                aria-hidden="true"
                size={17}
                strokeWidth={2}
              />
            )}

            <span>
              {content.primaryLabel}
            </span>

            <ArrowRight
              aria-hidden="true"
              size={16}
              strokeWidth={2}
            />
          </button>

          {/* ===============================================
              REFRESH ACTION
          =============================================== */}

          {!filtered && canRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshDisabled}
              aria-busy={refreshing}
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
            >
              <RotateCcw
                aria-hidden="true"
                size={17}
                strokeWidth={2}
                className={
                  refreshing
                    ? "animate-spin"
                    : undefined
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          )}
        </div>

        {/* =================================================
            HINTS
        ================================================= */}

        <ActivityEmptyStateHints
          filtered={filtered}
        />

        {/* =================================================
            SCREEN READER STATUS
        ================================================= */}

        {refreshing && (
          <span
            role="status"
            aria-live="polite"
            className="
              sr-only
            "
          >
            Refreshing savings activity.
          </span>
        )}
      </div>
    </section>
  );
};

SavingsActivityEmptyState.displayName =
  "SavingsActivityEmptyState";

export default memo(
  SavingsActivityEmptyState
);