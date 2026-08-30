import { memo } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

/**
 * =========================================================
 * ChallengeEmptyState
 * =========================================================
 *
 * Presentational empty state for SmartSave Challenges.
 *
 * Responsibilities:
 * - Display an empty state.
 * - Support normal and filtered states.
 * - Expose optional create/view actions.
 * - Remain independent of API/service/business logic.
 *
 * No:
 * - API calls
 * - useEffect
 * - data fetching
 * - mutations
 * - business logic
 * =========================================================
 */

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_STATE_IDS = {
  title: "savings-challenge-empty-title",
  description: "savings-challenge-empty-description",
};

const DEFAULT_CONTENT = {
  title: "Start your first savings challenge",
  description:
    "Turn your savings goal into a structured plan and build momentum with consistent progress.",
};

const FILTERED_CONTENT = {
  title: "No challenges found",
  description:
    "There are no challenges matching your current filters. Adjust your filters or view all challenges.",
};

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
   FEATURE ITEM
========================================================= */

const FeatureItem = memo(
  ({ icon: Icon, title, description }) => {
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
            text-slate-700
            bg-slate-50
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

          {description ? (
            <p
              className="
                mt-0.5
                text-slate-500 text-xs leading-5
              "
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
);

FeatureItem.displayName = "ChallengeFeatureItem";

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
  const isLoading = loading === true;

  const hasCreateHandler =
    typeof onCreateChallenge === "function";

  const hasViewHandler =
    typeof onViewChallenges === "function";

  const content = filtered
    ? FILTERED_CONTENT
    : DEFAULT_CONTENT;

  const EmptyIcon = filtered
    ? Target
    : Trophy;

  const handleCreate =
    !isLoading && hasCreateHandler
      ? onCreateChallenge
      : undefined;

  const handleView =
    !isLoading && hasViewHandler
      ? onViewChallenges
      : undefined;

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
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >
        {/* =================================================
            TOP ACCENT
        ================================================= */}

        <div
          className="
            w-full h-1
            bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500
          "
          aria-hidden="true"
        /
        >

        {/* =================================================
            BACKGROUND DECORATION
        ================================================= */}

        <div
          className="
            absolute
            w-64 h-64
            bg-blue-50
            rounded-full
            blur-3xl
            pointer-events-none
            -top-24 -right-24
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            absolute
            w-64 h-64
            bg-indigo-50
            rounded-full
            blur-3xl
            pointer-events-none
            -bottom-28 -left-20
          "
          aria-hidden="true"
        /
        >

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            relative
            px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12
          "
        >
          <div
            className="
              max-w-3xl
              mx-auto
              text-center
            "
          >
            {/* =================================================
                ICON
            ================================================= */}

            <div
              className="
                relative
                w-fit
                mx-auto
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-16 h-16
                  text-white
                  bg-slate-950
                  rounded-2xl ring-8 ring-slate-100
                  shadow-lg shadow-slate-950/15
                "
                aria-hidden="true"
              >
                <EmptyIcon
                  size={28}
                  strokeWidth={1.7}
                />
              </div>

              {!filtered ? (
                <span
                  className="
                    absolute flex justify-center items-center
                    w-6 h-6
                    text-white
                    bg-blue-600
                    rounded-full ring-4 ring-white
                    -top-1 -right-1
                  "
                  aria-hidden="true"
                >
                  <Sparkles
                    size={12}
                    strokeWidth={2}
                  />
                </span>
              ) : null}
            </div>

            {/* =================================================
                PRODUCT LABEL
            ================================================= */}

            <div
              className="
                inline-flex items-center
                mt-7 px-3 py-1.5
                font-bold text-[11px] text-blue-700 uppercase tracking-wider
                bg-blue-50
                border border-blue-100 rounded-full
                gap-1.5
              "
            >
              <Sparkles
                size={12}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>
                SmartSave Challenges
              </span>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <h2
              id={EMPTY_STATE_IDS.title}
              className="
                mt-5
                font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
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
                max-w-2xl
                mx-auto mt-3
                text-slate-500 text-sm sm:text-base leading-7
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
                  mt-8
                  gap-3
                "
              >
                {!filtered &&
                hasCreateHandler ? (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    className="
                      inline-flex justify-center items-center
                      min-h-11
                      px-5 py-2.5
                      font-semibold text-white text-sm
                      bg-slate-950 hover:bg-slate-800 disabled:bg-slate-950
                      rounded-xl focus:outline-none
                      focus:ring-2 focus:ring-slate-950/20 focus:ring-offset-2
                      disabled:opacity-60 shadow-lg shadow-slate-950/10
                      transition-all duration-200
                      disabled:cursor-not-allowed
                      group gap-2 hover:-translate-y-0.5
                    "
                  >
                    <Plus
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="
                        transition-transform duration-200
                        group-hover:rotate-90
                      "
                      /
                    >

                    <span>
                      {isLoading
                        ? "Please wait..."
                        : "Create a Challenge"}
                    </span>
                  </button>
                ) : null}

                {hasViewHandler ? (
                  <button
                    type="button"
                    onClick={handleView}
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    className="
                      inline-flex justify-center items-center
                      min-h-11
                      px-5 py-2.5
                      font-semibold text-slate-700 text-sm
                      bg-white hover:bg-slate-50
                      border border-slate-200 hover:border-slate-300 rounded-xl
                      focus:outline-none
                      focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
                      disabled:opacity-60 transition-all duration-200
                      disabled:cursor-not-allowed
                      group gap-2
                    "
                  >
                    <span>
                      {filtered
                        ? "View All Challenges"
                        : "Explore Challenges"}
                    </span>

                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="
                        transition-transform duration-200
                        group-hover:translate-x-0.5
                      "
                      /
                    >
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* =================================================
              VALUE PROPOSITION
          ================================================= */}

          {!filtered ? (
            <div
              className="
                max-w-3xl
                mx-auto mt-10 pt-7
                border-slate-100 border-t
              "
            >
              <div
                className="
                  grid grid-cols-1 sm:grid-cols-3
                  gap-5
                "
              >
                <FeatureItem
                  icon={Target}
                  title="Goal focused"
                  description="Turn targets into measurable milestones."
                />

                <FeatureItem
                  icon={CheckCircle2}
                  title="Track progress"
                  description="See how consistently you're saving."
                />

                <FeatureItem
                  icon={ShieldCheck}
                  title="Stay consistent"
                  description="Build habits that strengthen your finances."
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* =================================================
            TRUST FOOTER
        ================================================= */}

        {!filtered ? (
          <div
            className="
              relative flex justify-center items-center
              px-5 py-3
              font-medium text-[11px] text-slate-400
              bg-slate-50
              border-slate-100 border-t
              gap-2
            "
          >
            <ShieldCheck
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Designed to help you save with structure and consistency
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
};

ChallengeEmptyState.displayName =
  "ChallengeEmptyState";

export default memo(
  ChallengeEmptyState
);