import {
  memo,
  useId,
} from "react";

import {
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE =
  "No savings goals yet";

const DEFAULT_DESCRIPTION =
  "Create your first savings goal and start turning your plans into measurable progress.";

const DEFAULT_CREATE_LABEL =
  "Create savings goal";

const DEFAULT_EXPLORE_LABEL =
  "Explore SmartSave";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalEmptyState = ({
  onCreate,
  onExplore,

  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,

  createLabel =
    DEFAULT_CREATE_LABEL,

  exploreLabel =
    DEFAULT_EXPLORE_LABEL,

  compact = false,

  className = "",
}) => {
  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  const titleId = useId();

  /* =======================================================
     CAPABILITY FLAGS
  ======================================================= */

  const canCreate =
    typeof onCreate === "function";

  const canExplore =
    typeof onExplore === "function";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby={titleId}
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border border-slate-200/80
        bg-white
        shadow-sm
        ${compact ? "p-5" : "p-6 sm:p-8"}
        ${className}
      `}
    >
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          absolute
          w-40 h-40
          bg-blue-50
          rounded-full
          blur-2xl
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
          bg-indigo-50
          rounded-full
          blur-2xl
          pointer-events-none
          -bottom-20 -left-16
        "
        /
      >

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className={`
          relative
          flex
          flex-col
          items-center
          text-center
          ${compact ? "gap-4" : "gap-5"}
        `}
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div
          aria-hidden="true"
          className="
            flex justify-center items-center
            w-14 h-14
            text-blue-600
            bg-blue-50
            border border-blue-100 rounded-2xl
          "
        >
          <Target
            size={27}
            strokeWidth={1.8}
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            max-w-xl
          "
        >
          <div
            className="
              flex justify-center items-center
              mb-2
              gap-2
            "
          >
            <h2
              id={titleId}
              className="
                font-semibold text-slate-900 text-base sm:text-lg tracking-tight
              "
            >
              {title}
            </h2>

            <Sparkles
              size={16}
              className="
                text-blue-500
                shrink-0
              "
              aria-hidden="true"
            /
            >
          </div>

          <p
            className="
              text-slate-500 text-sm sm:text-[15px] leading-6
            "
          >
            {description}
          </p>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(canCreate || canExplore) && (
          <div
            className="
              flex flex-col sm:flex-row justify-center items-stretch
              w-full sm:w-auto
              gap-3
            "
          >
            {/* =============================================
                CREATE
            ============================================= */}

            {canCreate && (
              <button
                type="button"
                onClick={onCreate}
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  shadow-sm transition
                  gap-2
                "
              >
                <Plus
                  size={17}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />

                <span>
                  {createLabel}
                </span>
              </button>
            )}

            {/* =============================================
                EXPLORE
            ============================================= */}

            {canExplore && (
              <button
                type="button"
                onClick={onExplore}
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50 active:bg-slate-100
                  border border-slate-200 hover:border-slate-300 rounded-xl
                  focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                <span>
                  {exploreLabel}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsGoalEmptyState
);