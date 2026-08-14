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
 * CHALLENGE EMPTY STATE
 * =========================================================
 *
 * Presentational component for the SmartSave challenges area.
 *
 * Responsibilities:
 * - Explain that no challenges are currently available.
 * - Provide a clear primary CTA for creating a challenge.
 * - Optionally provide a secondary CTA.
 * - Remain completely independent of API/service calls.
 *
 * Architecture:
 *
 * ChallengeEmptyState
 *        ↓
 * useSavingsChallenges
 *        ↓
 * smartSaveService
 *        ↓
 * api.js
 *        ↓
 * SmartSave backend
 *
 * IMPORTANT:
 * This component intentionally does NOT:
 * - fetch challenges
 * - mutate React state during render
 * - call smartSaveService directly
 * - invent backend endpoints
 * - contain business logic
 */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

/* =========================================================
   SUPPORT ITEM
========================================================= */

const SupportItem = ({
  icon: Icon,
  title,
  description,
}) => {
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
        <Icon size={17} strokeWidth={2} />
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

        <p
          className="
            mt-0.5
            text-slate-500 dark:text-slate-400 text-xs leading-5
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ChallengeEmptyState = ({
  onCreateChallenge,
  onViewChallenges,

  loading = false,

  /**
   * Allows the parent to communicate that the current
   * filter/search produced no results rather than the
   * user having no challenges at all.
   */
  filtered = false,

  className = "",
}) => {
  const handleCreateChallenge = () => {
    if (loading) return;

    if (typeof onCreateChallenge === "function") {
      onCreateChallenge();
    }
  };

  const handleViewChallenges = () => {
    if (loading) return;

    if (typeof onViewChallenges === "function") {
      onViewChallenges();
    }
  };

  const title = filtered
    ? "No challenges found"
    : "Start your first savings challenge";

  const description = filtered
    ? "We couldn't find any challenges matching your current filters. Try adjusting your filters or view all challenges."
    : "Turn your savings goal into a structured challenge and build momentum with consistent progress.";

  return (
    <section
      className={cn(
        "w-full",
        className
      )}
      aria-labelledby="savings-challenge-empty-title"
      aria-describedby="savings-challenge-empty-description"
    >
      <div
        className="
          relative overflow-hidden
          px-6 sm:px-10 py-10 sm:py-12
          bg-white dark:bg-slate-950
          border border-slate-200 dark:border-slate-800 rounded-3xl
          shadow-sm
        "
      >
        {/* Decorative background */}
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

        <div
          className="
            relative
            max-w-2xl
            mx-auto
            text-center
          "
        >
          {/* Icon */}
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
            {filtered ? (
              <Target
                size={30}
                strokeWidth={1.8}
              />
            ) : (
              <Trophy
                size={30}
                strokeWidth={1.8}
              />
            )}
          </div>

          {/* Badge */}
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

          {/* Heading */}
          <h2
            id="savings-challenge-empty-title"
            className="
              mt-4
              font-bold text-slate-950 dark:text-white text-xl sm:text-2xl
              tracking-tight
            "
          >
            {title}
          </h2>

          {/* Description */}
          <p
            id="savings-challenge-empty-description"
            className="
              max-w-xl
              mx-auto mt-3
              text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-6
            "
          >
            {description}
          </p>

          {/* Actions */}
          <div
            className="
              flex flex-col sm:flex-row justify-center
              items-stretch sm:items-center
              mt-7
              gap-3
            "
          >
            {!filtered && (
              <button
                type="button"
                onClick={handleCreateChallenge}
                disabled={loading}
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-blue-600 hover:bg-blue-700
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
                  disabled:opacity-60 shadow-blue-600/20 shadow-sm transition
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
                  {loading
                    ? "Please wait..."
                    : "Create a Challenge"}
                </span>
              </button>
            )}

            {typeof onViewChallenges === "function" && (
              <button
                type="button"
                onClick={handleViewChallenges}
                disabled={loading}
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
                  {filtered
                    ? "View All Challenges"
                    : "Explore Challenges"}
                </span>

                <ArrowRight
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* Value propositions */}
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

export default ChallengeEmptyState;