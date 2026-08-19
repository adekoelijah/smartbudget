// SavingsInsightEmptyState.jsx

import { memo } from "react";

import {
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_VARIANT = "empty";
const FILTERED_VARIANT = "filtered";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsInsightEmptyState = ({
  variant = EMPTY_VARIANT,

  onRefresh,
  onCreateGoal,
  onExploreSavings,

  isRefreshing = false,

  title,
  description,

  className = "",
  compact = false,
}) => {
  /* =======================================================
     NORMALIZATION
  ======================================================= */

  const isFiltered = variant === FILTERED_VARIANT;

  const resolvedTitle =
    typeof title === "string" && title.trim()
      ? title.trim()
      : isFiltered
        ? "No matching insights"
        : "No savings insights yet";

  const resolvedDescription =
    typeof description === "string" &&
    description.trim()
      ? description.trim()
      : isFiltered
        ? "There are no savings insights matching your current filters. Try adjusting your filters or refresh your savings data."
        : "SmartSave will surface useful recommendations when enough savings activity, goals, or progress data is available.";

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const canCreateGoal =
    typeof onCreateGoal === "function";

  const canExploreSavings =
    typeof onExploreSavings === "function";

  const canRefresh =
    typeof onRefresh === "function";

  const hasPrimaryAction =
    canCreateGoal || canExploreSavings;

  /* =======================================================
     SAFE ACTION HANDLERS
  ======================================================= */

  const handleRefresh = () => {
    if (!canRefresh || isRefreshing) {
      return;
    }

    try {
      const result = onRefresh();

      /*
       * The parent owns async error state.
       * We intentionally do not create another error state
       * inside this presentational component.
       */
      if (
        result &&
        typeof result.catch === "function"
      ) {
        result.catch(() => {
          // Parent hook owns refresh errors.
        });
      }
    } catch {
      // Parent callback owns error handling.
    }
  };

  const handleCreateGoal = () => {
    if (!canCreateGoal) {
      return;
    }

    onCreateGoal();
  };

  const handleExploreSavings = () => {
    if (!canExploreSavings) {
      return;
    }

    onExploreSavings();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`
        relative
        overflow-hidden
        w-full
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-sm
        ${compact ? "p-6" : "p-8"}
        ${className}
      `}
      aria-labelledby="savings-insight-empty-title"
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          w-40 h-40
          bg-slate-100
          rounded-full
          opacity-70 blur-2xl
          pointer-events-none
          -top-16 -right-16
        "
        /
      >

      <div
        aria-hidden="true"
        className="
          absolute
          w-40 h-40
          bg-slate-100
          rounded-full
          opacity-60 blur-2xl
          pointer-events-none
          -bottom-20 -left-16
        "
        /
      >

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative flex flex-col items-center
          text-center
        "
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div
          className="
            flex justify-center items-center
            w-16 h-16
            text-slate-700
            bg-slate-50
            border border-slate-200 rounded-2xl
            shadow-sm
          "
          aria-hidden="true"
        >
          {isFiltered ? (
            <Target
              size={28}
              strokeWidth={1.8}
            />
          ) : (
            <Sparkles
              size={28}
              strokeWidth={1.8}
            />
          )}
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          id="savings-insight-empty-title"
          className="
            mt-5
            font-semibold text-slate-900 text-base sm:text-lg tracking-tight
          "
        >
          {resolvedTitle}
        </h2>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          className="
            max-w-xl
            mt-2
            text-slate-600 text-sm leading-6
          "
        >
          {resolvedDescription}
        </p>

        {/* =================================================
            INSIGHT EXPLANATION
        ================================================= */}

        {!isFiltered && (
          <div
            className="
              flex items-start
              max-w-lg
              mt-5 p-4
              text-left
              bg-slate-50
              border border-slate-200 rounded-xl
              gap-3
            "
          >
            <div
              className="
                mt-0.5
                text-slate-600
                shrink-0
              "
              aria-hidden="true"
            >
              <Lightbulb
                size={17}
                strokeWidth={2}
              />
            </div>

            <p
              className="
                text-slate-600 text-xs leading-5
              "
            >
              Keep your savings goals and activity
              up to date. SmartSave can use available
              data to surface opportunities, risks,
              recommendations, and progress worth
              paying attention to.
            </p>
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(hasPrimaryAction || canRefresh) && (
          <div
            className="
              flex flex-col sm:flex-row justify-center items-center
              mt-6
              gap-2.5
            "
          >
            {/* =============================================
                CREATE GOAL
            ============================================= */}

            {canCreateGoal && (
              <button
                type="button"
                onClick={handleCreateGoal}
                disabled={isRefreshing}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  disabled:opacity-60 shadow-sm transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <Target
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>
                  Create savings goal
                </span>

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* =============================================
                EXPLORE
            ============================================= */}

            {canExploreSavings && (
              <button
                type="button"
                onClick={handleExploreSavings}
                disabled={isRefreshing}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  disabled:opacity-60 transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <span>
                  Explore savings
                </span>

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* =============================================
                REFRESH
            ============================================= */}

            {canRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-3.5 py-2.5
                  font-medium text-slate-600 hover:text-slate-800 text-sm
                  hover:bg-slate-100
                  rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  gap-2
                "
                aria-label={
                  isRefreshing
                    ? "Refreshing savings insights"
                    : "Refresh savings insights"
                }
              >
                <RefreshCw
                  size={16}
                  strokeWidth={2}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : undefined
                  }
                  aria-hidden="true"
                />

                <span>
                  {isRefreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </span>
              </button>
            )}
          </div>
        )}

        {/* =================================================
            SYSTEM INFORMATION
        ================================================= */}

        <p
          className="
            max-w-md
            mt-5
            text-[11px] text-slate-400 leading-5
          "
        >
          Savings intelligence is generated from
          available SmartSave data.
        </p>
      </div>
    </section>
  );
};

/* =========================================================
   EXPORT
========================================================= */

SavingsInsightEmptyState.displayName =
  "SavingsInsightEmptyState";

export default memo(
  SavingsInsightEmptyState
);