import {
  ArrowUpRight,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import SavingsStrategiesSection from "./SavingsStrategiesSection";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   PAGE
========================================================= */

const SavingsStrategiesPage = () => {
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
              <Sparkles
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
                Savings Strategies
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                Choose and manage the saving methods
                that help you build consistently toward
                your financial goals.
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
            STRATEGY OVERVIEW
        ================================================= */}

        <section
          className="
            mt-6 p-5 sm:p-6
            bg-slate-900
            rounded-2xl
            shadow-sm
          "
          aria-labelledby="strategy-overview-heading"
        >
          <div
            className="
              flex flex-col lg:flex-row lg:justify-between lg:items-center
              gap-5
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
                  w-10 h-10
                  bg-white/10
                  rounded-xl
                  shrink-0
                "
                aria-hidden="true"
              >
                <Target
                  size={19}
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
                    font-semibold text-slate-300 text-xs uppercase tracking-wide
                  "
                >
                  Automated saving
                </p>

                <h2
                  id="strategy-overview-heading"
                  className="
                    mt-1
                    font-bold text-white text-lg sm:text-xl
                  "
                >
                  Save with a method that fits you.
                </h2>

                <p
                  className="
                    max-w-2xl
                    mt-1
                    text-slate-300 text-sm leading-6
                  "
                >
                  Use fixed amounts, percentages,
                  income-based saving, round-ups, or
                  custom strategies to create a saving
                  routine that works with your finances.
                </p>
              </div>
            </div>

            <div
              className="
                inline-flex items-center self-start lg:self-auto
                px-3 py-2
                font-medium text-slate-200 text-xs
                bg-white/10
                border border-white/10 rounded-lg
                gap-2 shrink-0
              "
            >
              <Sparkles
                size={13}
                aria-hidden="true"
              />

              SmartSave strategies
            </div>
          </div>
        </section>

        {/* =================================================
            STRATEGY TYPES
        ================================================= */}

        <section
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
            mt-6
            gap-3
          "
          aria-label="Savings strategy benefits"
        >
          <div
            className="
              p-4
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
            "
          >
            <div
              className="
                flex justify-between items-center
                gap-3
              "
            >
              <span
                className="
                  font-semibold text-slate-800 text-sm
                "
              >
                Flexible
              </span>

              <ArrowUpRight
                size={15}
                className="
                  text-slate-500
                "
                aria-hidden="true"
              /
              >
            </div>

            <p
              className="
                mt-1.5
                text-slate-500 text-xs leading-5
              "
            >
              Select a saving method that matches your
              income and spending pattern.
            </p>
          </div>

          <div
            className="
              p-4
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
            "
          >
            <div
              className="
                flex justify-between items-center
                gap-3
              "
            >
              <span
                className="
                  font-semibold text-slate-800 text-sm
                "
              >
                Consistent
              </span>

              <TrendingUp
                size={15}
                className="
                  text-slate-500
                "
                aria-hidden="true"
              /
              >
            </div>

            <p
              className="
                mt-1.5
                text-slate-500 text-xs leading-5
              "
            >
              Turn your preferred saving method into a
              repeatable financial habit.
            </p>
          </div>

          <div
            className="
              p-4
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
            "
          >
            <div
              className="
                flex justify-between items-center
                gap-3
              "
            >
              <span
                className="
                  font-semibold text-slate-800 text-sm
                "
              >
                Goal-focused
              </span>

              <Target
                size={15}
                className="
                  text-slate-500
                "
                aria-hidden="true"
              /
              >
            </div>

            <p
              className="
                mt-1.5
                text-slate-500 text-xs leading-5
              "
            >
              Build strategies around the financial
              goals you want to accomplish.
            </p>
          </div>

          <div
            className="
              p-4
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
            "
          >
            <div
              className="
                flex justify-between items-center
                gap-3
              "
            >
              <span
                className="
                  font-semibold text-slate-800 text-sm
                "
              >
                Automated
              </span>

              <Sparkles
                size={15}
                className="
                  text-slate-500
                "
                aria-hidden="true"
              /
              >
            </div>

            <p
              className="
                mt-1.5
                text-slate-500 text-xs leading-5
              "
            >
              Let SmartSave manage the strategy
              lifecycle while you focus on your goals.
            </p>
          </div>
        </section>

        {/* =================================================
            STRATEGIES
        ================================================= */}

        <section
          className="
            mt-6 sm:mt-8
          "
          aria-label="Savings strategies management"
        >
          <SavingsStrategiesSection
            title="Your savings strategies"
            description="Manage the saving methods you currently use and create new strategies when your financial needs change."
            showHeader
            showCreateButton
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
              SmartSave strategies help make saving
              consistent and intentional.
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

export default SavingsStrategiesPage;