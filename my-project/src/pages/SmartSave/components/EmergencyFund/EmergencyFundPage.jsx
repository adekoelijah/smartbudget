import {
  AlertTriangle,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import useSmartSave from "../../../../hooks/useSmartSave";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

import EmergencyFundProgress from "./EmergencyFundProgress";
import EmergencyFundCoverage from "./EmergencyFundCoverage";
import EmergencyFundRecommendation from "./EmergencyFundRecommendation";
import EmergencyFundInsights from "./EmergencyFundInsights";

import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

/* =========================================================
   SAFE OBJECT RESOLVER
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

/* =========================================================
   SMARTSAVE RESPONSE RESOLVER
========================================================= */

const resolveData = (data) => {
  if (!isObject(data)) {
    return {};
  }

  if (isObject(data.data)) {
    return data.data;
  }

  if (isObject(data.result)) {
    return data.result;
  }

  return data;
};

/* =========================================================
   EMERGENCY FUND RESOLVER
========================================================= */

const resolveEmergencyFund = (data) =>
  data.emergencyFund ??
  data.emergencyFundStatus ??
  null;

/* =========================================================
   PAGE
========================================================= */

const EmergencyFundPage = () => {
  const smartSave = useSmartSave();

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
  } = smartSave ?? {};

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const savingsData = resolveData(data);

  const emergencyFund =
    resolveEmergencyFund(savingsData);

  const currency =
    DEFAULT_CURRENCY ?? "NGN";

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleRefresh = async () => {
    if (typeof refresh !== "function") {
      return;
    }

    try {
      await refresh();
    } catch {
      /*
       * Refresh state and error handling
       * remain owned by useSmartSave.
       */
    }
  };

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
        aria-busy="true"
        aria-label="Loading emergency fund"
      >
        <div
          className="
            w-full max-w-7xl
            mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8
          "
        >
          <SavingsSkeleton module="page" />
        </div>
      </main>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (error && !data) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
      >
        <div
          className="
            flex items-center
            w-full max-w-7xl min-h-screen
            mx-auto px-4 sm:px-6 lg:px-8 py-8
          "
        >
          <div
            className="
              w-full
            "
          >
            <SavingsErrorState
              error={error}
              onRetry={handleRefresh}
            />
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

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
              <ShieldCheck
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
                Emergency Fund
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                Build a financial safety net that
                protects you from unexpected expenses
                without disrupting your long-term
                savings goals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              isRefreshing ||
              typeof refresh !== "function"
            }
            className="
              inline-flex justify-center items-center
              w-full sm:w-auto
              px-4 py-2.5
              font-semibold text-slate-700 text-sm
              bg-white hover:bg-slate-100
              border border-slate-200 rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-300
              disabled:opacity-50 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
            aria-label="Refresh emergency fund data"
          >
            <RefreshCw
              size={15}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />

            {isRefreshing
              ? "Updating..."
              : "Refresh"}
          </button>
        </header>

        {/* =================================================
            REFRESH STATUS
        ================================================= */}

        {isRefreshing && (
          <div
            className="
              flex items-center
              mt-4 px-4 py-2.5
              font-medium text-slate-500 text-xs
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
              gap-2
            "
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={13}
              className="
                animate-spin
              "
              aria-hidden="true"
            /
            >

            Updating your emergency fund data...
          </div>
        )}

        {/* =================================================
            PARTIAL ERROR
        ================================================= */}

        {error && data && (
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              mt-4 p-4
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-3
            "
            role="alert"
          >
            <div
              className="
                flex items-start
                min-w-0
                gap-3
              "
            >
              <AlertTriangle
                size={17}
                className="
                  mt-0.5
                  text-amber-600
                  shrink-0
                "
                aria-hidden="true"
              /
              >

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-amber-900 text-sm
                  "
                >
                  Emergency fund data may be
                  out of date.
                </p>

                <p
                  className="
                    mt-0.5
                    text-amber-700 text-xs leading-5
                  "
                >
                  Your previously loaded information
                  remains available.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto
                px-3 py-2
                font-semibold text-amber-800 text-xs
                bg-white hover:bg-amber-100
                border border-amber-200 rounded-lg
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
                gap-2 shrink-0
              "
            >
              <RefreshCw
                size={13}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />

              Retry
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!emergencyFund && (
          <section
            className="
              mt-6 sm:mt-8 p-6 sm:p-8
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
            aria-labelledby="emergency-fund-empty-title"
          >
            <div
              className="
                flex flex-col items-center
                max-w-xl
                mx-auto
                text-center
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-14 h-14
                  bg-slate-100
                  rounded-2xl
                "
                aria-hidden="true"
              >
                <PiggyBank
                  size={26}
                  className="
                    text-slate-700
                  "
                  /
                >
              </div>

              <h2
                id="emergency-fund-empty-title"
                className="
                  mt-5
                  font-bold text-slate-900 text-lg sm:text-xl tracking-tight
                "
              >
                Your emergency fund starts here
              </h2>

              <p
                className="
                  mt-2
                  text-slate-500 text-sm leading-6
                "
              >
                SmartSave will use your savings
                information to help you understand
                your emergency-fund target, current
                coverage, and the actions that can
                move you toward greater financial
                resilience.
              </p>

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-3 overflow-hidden
                  w-full
                  mt-6
                  border border-slate-200 rounded-xl
                "
              >
                <div
                  className="
                    p-4
                    border-slate-200 border-b sm:border-r sm:border-b-0
                  "
                >
                  <p
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Target
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-500 text-xs leading-5
                    "
                  >
                    Know how much protection you need.
                  </p>
                </div>

                <div
                  className="
                    p-4
                    border-slate-200 border-b sm:border-r sm:border-b-0
                  "
                >
                  <p
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Coverage
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-500 text-xs leading-5
                    "
                  >
                    Track how much of your target is
                    covered.
                  </p>
                </div>

                <div
                  className="
                    p-4
                  "
                >
                  <p
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Guidance
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-500 text-xs leading-5
                    "
                  >
                    Get recommendations based on your
                    savings position.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            EMERGENCY FUND CONTENT
        ================================================= */}

        {emergencyFund && (
          <>
            {/* =============================================
                HERO / SUMMARY
            ============================================= */}

            <section
              className="
                overflow-hidden
                mt-6 sm:mt-8 p-5 sm:p-6
                bg-slate-900
                rounded-2xl
                shadow-sm
              "
              aria-labelledby="emergency-fund-summary"
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
                    <ShieldCheck
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
                        font-semibold text-slate-300 text-xs uppercase
                        tracking-wide
                      "
                    >
                      Financial protection
                    </p>

                    <h2
                      id="emergency-fund-summary"
                      className="
                        mt-1
                        font-bold text-white text-lg sm:text-xl
                      "
                    >
                      Your emergency fund position
                    </h2>

                    <p
                      className="
                        max-w-2xl
                        mt-1
                        text-slate-300 text-sm leading-6
                      "
                    >
                      Monitor your emergency savings,
                      understand your coverage, and
                      follow SmartSave recommendations
                      toward a stronger financial buffer.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    px-3 py-2
                    font-medium text-slate-200 text-xs
                    bg-white/10
                    border border-white/10 rounded-lg
                    shrink-0
                  "
                >
                  Currency: {currency}
                </div>
              </div>
            </section>

            {/* =============================================
                PROGRESS
            ============================================= */}

            <section
              className="
                mt-5 sm:mt-6
              "
              aria-labelledby="emergency-fund-progress"
            >
              <h2
                id="emergency-fund-progress"
                className="
                  sr-only
                "
              >
                Emergency fund progress
              </h2>

              <EmergencyFundProgress
                data={emergencyFund}
              />
            </section>

            {/* =============================================
                COVERAGE
            ============================================= */}

            <section
              className="
                mt-5 sm:mt-6
              "
              aria-labelledby="emergency-fund-coverage"
            >
              <h2
                id="emergency-fund-coverage"
                className="
                  sr-only
                "
              >
                Emergency fund coverage
              </h2>

              <EmergencyFundCoverage
                data={emergencyFund}
              />
            </section>

            {/* =============================================
                RECOMMENDATION
            ============================================= */}

            <section
              className="
                mt-5 sm:mt-6
              "
              aria-labelledby="emergency-fund-recommendation"
            >
              <h2
                id="emergency-fund-recommendation"
                className="
                  sr-only
                "
              >
                Emergency fund recommendation
              </h2>

              <EmergencyFundRecommendation
                data={emergencyFund}
              />
            </section>

            {/* =============================================
                INSIGHTS
            ============================================= */}

            <section
              className="
                mt-5 sm:mt-6
              "
              aria-labelledby="emergency-fund-insights"
            >
              <h2
                id="emergency-fund-insights"
                className="
                  sr-only
                "
              >
                Emergency fund insights
              </h2>

              <EmergencyFundInsights
                data={emergencyFund}
              />
            </section>
          </>
        )}

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
              SmartSave helps you build financial
              resilience through intentional saving.
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

export default EmergencyFundPage;