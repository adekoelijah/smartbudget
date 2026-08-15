import {
  AlertTriangle,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";

import SavingsGoalSection from "./SavingsGoalsSection";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   PAGE
========================================================= */

const SavingsGoalsPage = () => {
  const currency =
    DEFAULT_CURRENCY ?? "NGN";

  return (
    <main
      className="
        w-full min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            gap-4
          "
        >
          <div
            className="
              flex items-start
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-11 h-11
                bg-slate-900
                rounded-xl
                shadow-sm
                shrink-0
              "
              aria-hidden="true"
            >
              <Target
                size={20}
                className="
                  text-white
                "
                /
              >
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-semibold text-slate-500 text-xs uppercase tracking-wide
                "
              >
                SmartSave
              </p>

              <h1
                className="
                  mt-1
                  font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
                "
              >
                Savings Goals
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                Create, manage, and track the savings
                goals that matter most to you.
              </p>
            </div>
          </div>

          <div
            className="
              inline-flex items-center self-start sm:self-auto
              px-3 py-2
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
              gap-2
            "
          >
            <TrendingUp
              size={15}
              className="
                text-slate-600
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                font-semibold text-slate-600 text-xs
              "
            >
              Currency: {currency}
            </span>
          </div>
        </header>

        {/* =================================================
            INFORMATION BANNER
        ================================================= */}

        <section
          className="
            flex flex-col sm:flex-row sm:items-center
            mt-6 p-4
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm
            gap-3
          "
          aria-label="Savings goals information"
        >
          <div
            className="
              flex justify-center items-center
              w-9 h-9
              bg-slate-100
              rounded-xl
              shrink-0
            "
            aria-hidden="true"
          >
            <Target
              size={17}
              className="
                text-slate-700
              "
              /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                font-semibold text-slate-800 text-sm
              "
            >
              Build your savings around clear targets.
            </p>

            <p
              className="
                mt-0.5
                text-slate-500 text-xs leading-5
              "
            >
              Set a target, monitor your progress, and
              adjust your goals as your financial plans
              evolve.
            </p>
          </div>
        </section>

        {/* =================================================
            GOALS SECTION
        ================================================= */}

        <section
          className="
            mt-6 sm:mt-8
          "
          aria-label="Savings goals management"
        >
          <SavingsGoalSection
            title="Your savings goals"
            description="Track your progress toward the things that matter most."
            allowCreate
            compact={false}
          />
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mt-8 sm:mt-10 pt-5
            border-slate-200 border-t
          "
        >
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              text-slate-400 text-xs
              gap-2
            "
          >
            <p>
              SmartSave keeps your savings goals
              organized and measurable.
            </p>

            <p
              className="
                font-medium
              "
            >
              Currency: {currency}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default SavingsGoalsPage;