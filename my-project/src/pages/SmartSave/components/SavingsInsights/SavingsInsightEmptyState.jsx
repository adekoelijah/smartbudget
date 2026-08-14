// :::writing{variant="document" id="48217" title="SavingsInsightEmptyState.jsx"}
import {
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

/* =========================================================
   OPTIONAL SMARTSAVE CONFIGURATION
========================================================= */

import {
  SMART_SAVE_CURRENCY,
} from "../../../../config/smartSaveConfig";

/* =========================================================
   CONSTANTS
========================================================= */

import {
  SAVINGS_INSIGHT_TYPES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsInsightEmptyState = ({
  /*
   * Controls whether this is a true empty state or a
   * filtered/search result state.
   */
  variant = "empty",

  /*
   * Optional parent actions.
   *
   * The component never performs API calls itself.
   */
  onRefresh,
  onCreateGoal,
  onExploreSavings,

  /*
   * Useful when the parent hook is currently refreshing.
   */
  isRefreshing = false,

  /*
   * Optional customization.
   */
  title,
  description,
  className = "",
  compact = false,
}) => {
  const isFiltered = variant === "filtered";

  const resolvedTitle =
    title ||
    (isFiltered
      ? "No matching insights"
      : "No savings insights yet");

  const resolvedDescription =
    description ||
    (isFiltered
      ? "There are no savings insights matching your current filters. Try adjusting your filters or refresh your savings data."
      : "SmartSave will analyze your savings activity, goals, and progress to surface useful recommendations here.");

  const handleRefresh = () => {
    if (
      typeof onRefresh !== "function" ||
      isRefreshing
    ) {
      return;
    }

    onRefresh();
  };

  const handleCreateGoal = () => {
    if (typeof onCreateGoal !== "function") {
      return;
    }

    onCreateGoal();
  };

  const handleExploreSavings = () => {
    if (typeof onExploreSavings !== "function") {
      return;
    }

    onExploreSavings();
  };

  const hasPrimaryAction =
    typeof onCreateGoal === "function" ||
    typeof onExploreSavings === "function";

  return (
    <section
      aria-label="Savings insights"
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-sm
        ${compact ? "p-6" : "p-8"}
        ${className}
      `}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

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

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative flex flex-col items-center
          text-center
        "
      >
        {/* ===================================================
            ICON
        =================================================== */}

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

        {/* ===================================================
            TITLE
        =================================================== */}

        <h3
          className="
            mt-5
            font-semibold text-slate-900 text-base sm:text-lg tracking-tight
          "
        >
          {resolvedTitle}
        </h3>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <p
          className="
            max-w-xl
            mt-2
            text-slate-600 text-sm leading-6
          "
        >
          {resolvedDescription}
        </p>

        {/* ===================================================
            INSIGHT EXPLANATION
        =================================================== */}

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
              Keep your savings goals and activity up to date.
              SmartSave can use that information to identify
              opportunities, risks, and progress worth paying
              attention to.
            </p>
          </div>
        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div
          className="
            flex flex-col sm:flex-row justify-center items-center
            mt-6
            gap-2.5
          "
        >
          {/* -------------------------------------------------
              PRIMARY ACTION
          ------------------------------------------------- */}

          {hasPrimaryAction &&
            typeof onCreateGoal === "function" && (
              <button
                type="button"
                onClick={handleCreateGoal}
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
                />

                Create savings goal

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </button>
            )}

          {/* -------------------------------------------------
              SECONDARY EXPLORE ACTION
          ------------------------------------------------- */}

          {typeof onExploreSavings === "function" && (
            <button
              type="button"
              onClick={handleExploreSavings}
              className="
                inline-flex justify-center items-center
                min-h-10
                px-4 py-2.5
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                transition
                gap-2
              "
            >
              Explore savings

              <ArrowRight
                size={15}
                strokeWidth={2}
              />
            </button>
          )}

          {/* -------------------------------------------------
              REFRESH
          ------------------------------------------------- */}

          {typeof onRefresh === "function" && (
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
                    : ""
                }
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          )}
        </div>

        {/* ===================================================
            ACCESSIBILITY / SYSTEM INFORMATION
        =================================================== */}

        <p
          className="
            mt-5
            text-[11px] text-slate-400 leading-5
          "
        >
          Savings intelligence is generated from your
          available SmartSave data.
        </p>
      </div>
    </section>
  );
};

export default SavingsInsightEmptyState;
