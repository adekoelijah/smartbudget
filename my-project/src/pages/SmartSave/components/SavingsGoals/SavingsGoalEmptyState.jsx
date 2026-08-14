import { Target, Plus, Sparkles } from "lucide-react";

/**
 * SavingsGoalEmptyState
 *
 * Presentation-only empty state for the SmartSave goals section.
 *
 * Responsibilities:
 * - Explain that no savings goals exist
 * - Provide a clear CTA to create the first goal
 * - Support optional secondary action
 * - Remain reusable across dashboard/pages
 *
 * Non-responsibilities:
 * - API calls
 * - Goal creation
 * - Fetching goals
 * - Business calculations
 * - Navigation
 *
 * Those responsibilities belong to the SmartSave service/hook/page layer.
 */
const SavingsGoalEmptyState = ({
  onCreate,
  onExplore,
  title = "No savings goals yet",
  description = "Create your first savings goal and start turning your plans into measurable progress.",
  createLabel = "Create savings goal",
  exploreLabel = "Explore SmartSave",
  compact = false,
  className = "",
}) => {
  const handleCreate = () => {
    if (typeof onCreate === "function") {
      onCreate();
    }
  };

  const handleExplore = () => {
    if (typeof onExplore === "function") {
      onExplore();
    }
  };

  return (
    <section
      aria-labelledby="savings-goal-empty-title"
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
      {/* Decorative background */}
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
        {/* Icon */}
        <div
          className="
            flex justify-center items-center
            w-14 h-14
            text-blue-600
            bg-blue-50
            border border-blue-100 rounded-2xl
          "
          aria-hidden="true"
        >
          <Target size={27} strokeWidth={1.8} />
        </div>

        {/* Content */}
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
              id="savings-goal-empty-title"
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

        {/* Actions */}
        <div
          className="
            flex flex-col sm:flex-row justify-center items-stretch
            w-full sm:w-auto
            gap-3
          "
        >
          <button
            type="button"
            onClick={handleCreate}
            disabled={typeof onCreate !== "function"}
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5 py-2.5
              font-semibold text-white text-sm
              bg-blue-600 hover:bg-blue-700
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <Plus size={17} strokeWidth={2.2} />
            {createLabel}
          </button>

          {typeof onExplore === "function" && (
            <button
              type="button"
              onClick={handleExplore}
              className="
                inline-flex justify-center items-center
                min-h-11
                px-5 py-2.5
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 hover:border-slate-300 rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                transition
              "
            >
              {exploreLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default SavingsGoalEmptyState;