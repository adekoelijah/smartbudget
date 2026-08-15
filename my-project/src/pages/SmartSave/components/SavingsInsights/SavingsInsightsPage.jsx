import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import SavingsInsightsSection from "./SavingsInsightsSection";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   PAGE
========================================================= */

const SavingsInsightsPage = () => {
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
              <BrainCircuit
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
                Savings Insights
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                Understand your savings behavior,
                identify opportunities, and receive
                actionable financial intelligence.
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
            INTELLIGENCE BANNER
        ================================================= */}

        <section
          className="
            mt-6 p-5 sm:p-6
            bg-slate-900
            rounded-2xl
            shadow-sm
          "
          aria-labelledby="savings-intelligence-heading"
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
                <Sparkles
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
                  SmartSave intelligence
                </p>

                <h2
                  id="savings-intelligence-heading"
                  className="
                    mt-1
                    font-bold text-white text-lg sm:text-xl
                  "
                >
                  Turn savings data into better
                  decisions.
                </h2>

                <p
                  className="
                    max-w-2xl
                    mt-1
                    text-slate-300 text-sm leading-6
                  "
                >
                  SmartSave analyzes your available
                  savings activity and goals to surface
                  useful observations and practical
                  recommendations.
                </p>
              </div>
            </div>

            <div
              className="
                flex items-center self-start lg:self-auto
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

              Financial intelligence
            </div>
          </div>
        </section>

        {/* =================================================
            INSIGHTS SECTION
        ================================================= */}

        <section
          className="
            mt-6 sm:mt-8
          "
          aria-label="Savings insights and recommendations"
        >
          <SavingsInsightsSection
            title="Savings intelligence"
            description="SmartSave analyzes your savings activity and goals to surface useful financial intelligence."
            limit={5}
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
              SmartSave insights are generated from
              your available savings data.
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

export default SavingsInsightsPage;