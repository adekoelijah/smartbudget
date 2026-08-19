import {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Trophy,
  Plus,
  Sparkles,
  ArrowRight,
  Target,
  ShieldCheck,
} from "lucide-react";

/**
 * =========================================================
 * ChallengeEmptyState
 * =========================================================
 *
 * Pure presentational component for the SmartSave
 * Savings Challenges page.
 *
 * Responsibilities:
 * - Display an empty state.
 * - Distinguish between:
 *   1. No challenges at all.
 *   2. No challenges matching current filters.
 * - Provide optional navigation/actions.
 * - Remain independent of API/service/business logic.
 *
 * Architecture:
 *
 * ChallengeEmptyState
 *        ↓
 * Parent/Page
 *        ↓
 * useSavingsChallenges
 *        ↓
 * smartSaveService
 *
 * IMPORTANT:
 * This component does NOT:
 * - fetch data
 * - mutate application state
 * - call smartSaveService
 * - know backend endpoints
 * - contain challenge business rules
 * =========================================================
 */

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_STATE_IDS = {
  title: "savings-challenge-empty-title",
  description:
    "savings-challenge-empty-description",
};

const DEFAULT_TITLE =
  "Start your first savings challenge";

const DEFAULT_DESCRIPTION =
  "Turn your savings goal into a structured challenge and build momentum with consistent progress.";

const FILTERED_TITLE =
  "No challenges found";

const FILTERED_DESCRIPTION =
  "We couldn't find any challenges matching your current filters. Try adjusting your filters or view all challenges.";

/* =========================================================
   CLASS NAME UTILITY
========================================================= */

const cn = (...classes) =>
  classes
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .join(" ");

/* =========================================================
   SUPPORT ITEM
========================================================= */

const SupportItem = memo(
  ({
    icon: Icon,
    title,
    description,
  }) => {
    if (
      typeof Icon !== "function" ||
      !title
    ) {
      return null;
    }

    return (
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            text-blue-600 dark:text-blue-400
            bg-blue-50 dark:bg-blue-950/40
            rounded-xl ring-1 ring-blue-100 dark:ring-blue-900/50
            shrink-0
          "
          aria-hidden="true"
        >
          <Icon
            size={17}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-slate-900 dark:text-white text-sm
            "
          >
            {title}
          </p>

          {description && (
            <p
              className="
                mt-0.5
                text-slate-500 dark:text-slate-400 text-xs leading-5
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SupportItem.displayName =
  "SupportItem";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ChallengeEmptyState = ({
  onCreateChallenge,
  onViewChallenges,
  loading = false,
  filtered = false,
  className = "",
}) => {
  /* =======================================================
     NORMALIZED FLAGS
  ======================================================= */

  const isLoading =
    loading === true;

  const hasCreateHandler =
    typeof onCreateChallenge ===
    "function";

  const hasViewHandler =
    typeof onViewChallenges ===
    "function";

  /* =======================================================
     CONTENT
  ======================================================= */

  const content = useMemo(
    () => ({
      title: filtered
        ? FILTERED_TITLE
        : DEFAULT_TITLE,

      description: filtered
        ? FILTERED_DESCRIPTION
        : DEFAULT_DESCRIPTION,

      icon: filtered
        ? Target
        : Trophy,

      primaryLabel: isLoading
        ? "Please wait..."
        : "Create a Challenge",

      secondaryLabel: filtered
        ? "View All Challenges"
        : "Explore Challenges",
    }),
    [filtered, isLoading]
  );

  const EmptyStateIcon =
    content.icon;

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleCreateChallenge =
    useCallback(() => {
      if (
        isLoading ||
        !hasCreateHandler
      ) {
        return;
      }

      onCreateChallenge();
    }, [
      isLoading,
      hasCreateHandler,
      onCreateChallenge,
    ]);

  const handleViewChallenges =
    useCallback(() => {
      if (
        isLoading ||
        !hasViewHandler
      ) {
        return;
      }

      onViewChallenges();
    }, [
      isLoading,
      hasViewHandler,
      onViewChallenges,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={cn(
        "w-full",
        className
      )}
      aria-labelledby={
        EMPTY_STATE_IDS.title
      }
      aria-describedby={
        EMPTY_STATE_IDS.description
      }
      aria-busy={isLoading}
    >
      <div
        className="
          relative overflow-hidden
          w-full
          px-6 sm:px-10 py-10 sm:py-12
          bg-white dark:bg-slate-950
          border border-slate-200 dark:border-slate-800 rounded-3xl
          shadow-sm
        "
      >
        {/* =================================================
            DECORATIVE BACKGROUND
        ================================================= */}

        <div
          className="
            absolute
            w-40 h-40
            bg-blue-100/60 dark:bg-blue-900/20
            rounded-full
            blur-3xl
            pointer-events-none
            -top-16 -right-16
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            absolute
            w-40 h-40
            bg-indigo-100/50 dark:bg-indigo-900/20
            rounded-full
            blur-3xl
            pointer-events-none
            -bottom-20 -left-10
          "
          aria-hidden="true"
        /
        >

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            relative
            max-w-2xl
            mx-auto
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
              mx-auto
              text-white
              bg-gradient-to-br from-blue-600 to-indigo-600
              rounded-2xl
              shadow-blue-500/20 shadow-lg
            "
            aria-hidden="true"
          >
            <EmptyStateIcon
              size={30}
              strokeWidth={1.8}
            />
          </div>

          {/* =================================================
              BADGE
          ================================================= */}

          <div
            className="
              inline-flex items-center
              mt-5 px-3 py-1
              font-semibold text-blue-700 dark:text-blue-300 text-xs
              bg-blue-50 dark:bg-blue-950/40
              border border-blue-100 dark:border-blue-900/50 rounded-full
              gap-1.5
            "
          >
            <Sparkles
              size={13}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>
              SmartSave Challenges
            </span>
          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <h2
            id={EMPTY_STATE_IDS.title}
            className="
              mt-4
              font-bold text-slate-950 dark:text-white text-xl sm:text-2xl
              tracking-tight
            "
          >
            {content.title}
          </h2>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            id={
              EMPTY_STATE_IDS.description
            }
            className="
              max-w-xl
              mx-auto mt-3
              text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-6
            "
          >
            {content.description}
          </p>

          {/* =================================================
              ACTIONS
          ================================================= */}

          {(hasCreateHandler ||
            hasViewHandler) && (
            <div
              className="
                flex flex-col sm:flex-row justify-center
                items-stretch sm:items-center
                mt-7
                gap-3
              "
            >
              {/* Primary action */}

              {!filtered &&
                hasCreateHandler && (
                  <button
                    type="button"
                    onClick={
                      handleCreateChallenge
                    }
                    disabled={isLoading}
                    aria-disabled={
                      isLoading
                    }
                    className="
                      inline-flex justify-center items-center
                      min-h-11
                      px-5 py-2.5
                      font-semibold text-white text-sm
                      bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600
                      rounded-xl focus:outline-none
                      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
                      disabled:opacity-60 shadow-blue-600/20 shadow-sm
                      transition
                      disabled:cursor-not-allowed
                      gap-2
                    "
                    aria-label="Create a new savings challenge"
                  >
                    <Plus
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    <span>
                      {content.primaryLabel}
                    </span>
                  </button>
                )}

              {/* Secondary action */}

              {hasViewHandler && (
                <button
                  type="button"
                  onClick={
                    handleViewChallenges
                  }
                  disabled={isLoading}
                  aria-disabled={
                    isLoading
                  }
                  className="
                    inline-flex justify-center items-center
                    min-h-11
                    px-5 py-2.5
                    font-semibold text-slate-700 dark:text-slate-200 text-sm
                    bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800
                    border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600
                    rounded-xl focus:outline-none
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
                    disabled:opacity-60 transition
                    disabled:cursor-not-allowed
                    gap-2
                  "
                >
                  <span>
                    {content.secondaryLabel}
                  </span>

                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          )}

          {/* =================================================
              VALUE PROPOSITIONS
          ================================================= */}

          {!filtered && (
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2
                max-w-xl
                mx-auto mt-10 pt-7
                text-left
                border-slate-100 dark:border-slate-800 border-t
                gap-5
              "
            >
              <SupportItem
                icon={Target}
                title="Stay goal-focused"
                description="Turn a savings target into measurable milestones."
              />

              <SupportItem
                icon={ShieldCheck}
                title="Build consistency"
                description="Track progress and maintain your savings momentum."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   DISPLAY NAME
========================================================= */

ChallengeEmptyState.displayName =
  "ChallengeEmptyState";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  ChallengeEmptyState
);