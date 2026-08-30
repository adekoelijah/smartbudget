import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  FilterX,
  PiggyBank,
  Plus,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { memo, useId } from "react";

/* =========================================================
   CONTENT
========================================================= */

const EMPTY_STATE_CONTENT = {
  default: {
    eyebrow: "Savings activity",
    title: "Your savings activity will appear here",
    description:
      "Your contributions, scheduled savings, automatic transfers, and completed savings activity will be organized here so you can easily monitor how your money is moving.",
    primaryLabel: "Start saving",
  },

  filtered: {
    eyebrow: "No matching activity",
    title: "Nothing matches your current filters",
    description:
      "We couldn't find any savings activity matching your selected filters. Adjust your filters or clear them to view your complete activity history.",
    primaryLabel: "Clear filters",
  },
};

/* =========================================================
   HINTS
========================================================= */

const DEFAULT_HINTS = [
  {
    id: "contributions",
    icon: CircleDollarSign,
    title: "Contributions",
    text: "Deposits and completed savings contributions will appear here.",
  },
  {
    id: "scheduled",
    icon: CalendarClock,
    title: "Scheduled savings",
    text: "Scheduled and automatic savings activity will be recorded here.",
  },
];

const FILTERED_HINTS = [
  {
    id: "filters",
    icon: FilterX,
    title: "Review your filters",
    text: "Remove unnecessary filters to broaden your activity results.",
  },
  {
    id: "date-range",
    icon: CalendarClock,
    title: "Expand the date range",
    text: "A wider date range may reveal older savings activity.",
  },
];

/* =========================================================
   EMPTY STATE ICON
========================================================= */

const EmptyStateIcon = memo(function EmptyStateIcon({
  filtered = false,
}) {
  const Icon = filtered ? FilterX : PiggyBank;

  return (
    <div
      aria-hidden="true"
      className="
        relative flex justify-center items-center
        w-16 h-16
        text-white
        bg-slate-950
        rounded-2xl
        shadow-lg shadow-slate-950/10
      "
    >
      <div
        className="
          absolute inset-0
          bg-blue-600/10
          rounded-2xl
        "
        /
      >

      <Icon
        size={28}
        strokeWidth={1.7}
        className="
          relative
        "
        /
      >
    </div>
  );
});

EmptyStateIcon.displayName = "EmptyStateIcon";

/* =========================================================
   HINT ITEM
========================================================= */

const ActivityHint = memo(function ActivityHint({
  icon: Icon,
  title,
  text,
}) {
  if (
    typeof Icon !== "function" ||
    !title ||
    !text
  ) {
    return null;
  }

  return (
    <div
      className="
        flex items-start
        min-w-0
        p-4
        bg-slate-50/80
        border border-slate-200/80 rounded-2xl
        gap-3
      "
    >
      <div
        className="
          flex justify-center items-center
          w-9 h-9
          text-slate-600
          bg-white
          border border-slate-200 rounded-xl
          shrink-0
        "
        aria-hidden="true"
      >
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            font-semibold text-slate-900 text-sm
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-slate-500 text-xs leading-5
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
});

ActivityHint.displayName = "ActivityHint";

/* =========================================================
   SECURITY / TRUST STRIP
========================================================= */

const ActivityTrustStrip = memo(
  function ActivityTrustStrip() {
    return (
      <div
        className="
          flex items-start
          mt-6 p-4
          bg-blue-50/70
          border border-blue-100 rounded-2xl
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            text-blue-600
            bg-white
            border border-blue-100 rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <ShieldCheck
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-blue-950 text-sm
            "
          >
            One place for your savings history
          </p>

          <p
            className="
              mt-1
              text-blue-800/70 text-xs leading-5
            "
          >
            SmartBudget keeps your savings activity organized
            so you can understand your progress at a glance.
          </p>
        </div>
      </div>
    );
  }
);

ActivityTrustStrip.displayName =
  "ActivityTrustStrip";

/* =========================================================
   MAIN COMPONENT
========================================================= */

/**
 * SavingsActivityEmptyState
 *
 * Presentational empty state for SmartSave activity.
 *
 * IMPORTANT:
 * This component does not:
 * - fetch data
 * - mutate savings
 * - navigate
 * - call APIs
 * - contain financial business logic
 *
 * The parent page owns all actions.
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
     CONTENT
  ======================================================= */

  const content = filtered
    ? EMPTY_STATE_CONTENT.filtered
    : EMPTY_STATE_CONTENT.default;

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const hasCreateHandler =
    typeof onCreateSaving === "function";

  const hasClearHandler =
    typeof onClearFilters === "function";

  const hasRefreshHandler =
    typeof onRefresh === "function";

  /*
   * We deliberately do not render a disabled
   * "Start saving" button.
   *
   * A financial application should not present
   * an action that appears available but has no
   * real flow behind it.
   */

  const showPrimaryAction = filtered
    ? hasClearHandler
    : hasCreateHandler;

  const primaryActionDisabled =
    disabled || refreshing;

  const refreshDisabled =
    disabled || refreshing;

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handlePrimaryAction = () => {
    if (primaryActionDisabled) {
      return;
    }

    if (filtered) {
      if (hasClearHandler) {
        onClearFilters();
      }

      return;
    }

    if (hasCreateHandler) {
      onCreateSaving();
    }
  };

  const handleRefresh = () => {
    if (
      refreshDisabled ||
      !hasRefreshHandler
    ) {
      return;
    }

    onRefresh();
  };

  /* =======================================================
     HINTS
  ======================================================= */

  const hints = filtered
    ? FILTERED_HINTS
    : DEFAULT_HINTS;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={refreshing}
      className="
        relative overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* =================================================
          BACKGROUND ACCENTS
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          absolute
          w-64 h-64
          bg-blue-100/50
          rounded-full
          blur-3xl
          pointer-events-none
          -top-24 -right-24
        "
        /
      >

      <div
        aria-hidden="true"
        className="
          absolute
          w-60 h-60
          bg-slate-100/80
          rounded-full
          blur-3xl
          pointer-events-none
          -bottom-28 -left-20
        "
        /
      >

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="
          relative
          max-w-3xl
          mx-auto px-5 sm:px-8 py-10 sm:py-12
        "
      >
        {/* =================================================
            ICON + EYEBROW
        ================================================= */}

        <div
          className="
            flex flex-col items-center
            text-center
          "
        >
          <EmptyStateIcon
            filtered={filtered}
          />

          <div
            className="
              inline-flex items-center
              mt-5 px-3 py-1.5
              bg-slate-50
              border border-slate-200 rounded-full
              gap-2
            "
          >
            {filtered ? (
              <FilterX
                size={13}
                strokeWidth={2}
                className="
                  text-slate-500
                "
                aria-hidden="true"
              /
              >
            ) : (
              <WalletCards
                size={13}
                strokeWidth={2}
                className="
                  text-blue-600
                "
                aria-hidden="true"
              /
              >
            )}

            <span
              className="
                font-semibold text-[11px] text-slate-600 uppercase
                tracking-[0.12em]
              "
            >
              {content.eyebrow}
            </span>
          </div>
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          id={titleId}
          className="
            max-w-2xl
            mx-auto mt-4
            font-bold text-slate-950 text-xl text-center sm:text-2xl
            tracking-tight
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
            max-w-2xl
            mx-auto mt-3
            text-slate-500 text-sm text-center sm:text-base
            leading-6 sm:leading-7
          "
        >
          {content.description}
        </p>

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(showPrimaryAction ||
          (!filtered && hasRefreshHandler)) && (
          <div
            className="
              flex flex-col sm:flex-row justify-center
              items-stretch sm:items-center
              mt-7
              gap-3
            "
          >
            {/* =============================================
                PRIMARY ACTION
            ============================================= */}

            {showPrimaryAction && (
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={primaryActionDisabled}
                aria-disabled={
                  primaryActionDisabled
                }
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-950 hover:bg-slate-800 disabled:bg-slate-950
                  rounded-xl focus:outline-none
                  disabled:opacity-50 shadow-slate-950/10 shadow-sm transition
                  duration-200
                  disabled:cursor-not-allowed
                  gap-2
                  focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2
                "
              >
                {filtered ? (
                  <RotateCcw
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                ) : (
                  <Plus
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}

                <span>
                  {content.primaryLabel}
                </span>

                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* =============================================
                REFRESH
            ============================================= */}

            {!filtered &&
              hasRefreshHandler && (
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
                    disabled:opacity-50 transition duration-200
                    disabled:cursor-not-allowed
                    gap-2
                    focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2
                  "
                >
                  <RotateCcw
                    size={17}
                    strokeWidth={2}
                    className={
                      refreshing
                        ? "animate-spin"
                        : undefined
                    }
                    aria-hidden="true"
                  />

                  <span>
                    {refreshing
                      ? "Refreshing..."
                      : "Refresh activity"}
                  </span>
                </button>
              )}
          </div>
        )}

        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <div
          className="
            grid grid-cols-1 sm:grid-cols-2
            mt-8 pt-7
            border-slate-100 border-t
            gap-3
          "
        >
          {hints.map(
            ({
              id,
              icon,
              title,
              text,
            }) => (
              <ActivityHint
                key={id}
                icon={icon}
                title={title}
                text={text}
              />
            )
          )}
        </div>

        {/* =================================================
            TRUST / CONTEXT
        ================================================= */}

        {!filtered && (
          <ActivityTrustStrip />
        )}

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