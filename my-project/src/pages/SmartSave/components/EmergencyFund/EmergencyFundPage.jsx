import {
  AlertCircle,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useMemo,
} from "react";

import useEmergencyFund from "../../../../hooks/useEmergencyFund";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

import EmergencyFundCalculator from "./EmergencyFundCalculator";
import EmergencyFundCoverage from "./EmergencyFundCoverage";
import EmergencyFundInsights from "./EmergencyFundInsights";
import EmergencyFundProgress from "./EmergencyFundProgress";
import EmergencyFundRecommendation from "./EmergencyFundRecommendation";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_RECOMMENDED_MONTHS = 6;

const DEFAULT_DESCRIPTION =
  "Build a financial safety buffer that can help protect you from unexpected expenses.";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const resolveData = (value) => {
  if (!isObject(value)) {
    return {};
  }

  /*
   * Handle:
   *
   * {
   *   data: {...}
   * }
   *
   * and:
   *
   * {
   *   result: {...}
   * }
   */

  if (isObject(value.data)) {
    return {
      ...value.data,
      ...value,
    };
  }

  if (isObject(value.result)) {
    return {
      ...value.result,
      ...value,
    };
  }

  return value;
};

const resolveArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    if (Array.isArray(value?.items)) {
      return value.items;
    }

    if (Array.isArray(value?.results)) {
      return value.results;
    }

    if (Array.isArray(value?.insights)) {
      return value.insights;
    }

    if (
      Array.isArray(
        value?.recommendations
      )
    ) {
      return value.recommendations;
    }
  }

  return [];
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error?.error ||
    error?.data?.message ||
    "We could not load your emergency fund information."
  );
};

/* =========================================================
   EMERGENCY FUND NORMALIZER
========================================================= */

const normalizeEmergencyFund = ({
  source,
  fallbackCurrency,
  recommendedMonths,
}) => {
  const rawData = resolveData(source);

  /* -------------------------------------------------------
     CURRENT AMOUNT
  ------------------------------------------------------- */

  const currentAmount = toNumber(
    firstDefined(
      rawData.currentAmount,
      rawData.currentBalance,
      rawData.balance,
      rawData.amountSaved,
      rawData.savedAmount,
      rawData.progress?.current
    )
  );

  /* -------------------------------------------------------
     MONTHLY EXPENSES
  ------------------------------------------------------- */

  const monthlyExpenses = toNumber(
    firstDefined(
      rawData.monthlyExpenses,
      rawData.monthlyEssentialExpenses,
      rawData.essentialMonthlyExpenses,
      rawData.expenses?.monthly
    )
  );

  /* -------------------------------------------------------
     TARGET AMOUNT
  ------------------------------------------------------- */

  const backendTargetAmount =
    toNumber(
      firstDefined(
        rawData.targetAmount,
        rawData.emergencyFundTarget,
        rawData.recommendedAmount,
        rawData.goalAmount
      )
    );

  /* -------------------------------------------------------
     RECOMMENDED MONTHS
  ------------------------------------------------------- */

  const resolvedRecommendedMonths =
    Math.max(
      1,
      toNumber(
        firstDefined(
          rawData.recommendedMonths,
          rawData.coverageTargetMonths,
          rawData.targetMonths,
          recommendedMonths
        ),
        recommendedMonths
      )
    );

  /* -------------------------------------------------------
     TARGET MONTHS
  ------------------------------------------------------- */

  const targetMonths =
    Math.max(
      resolvedRecommendedMonths,
      toNumber(
        firstDefined(
          rawData.targetMonths,
          rawData.coverageTargetMonths,
          resolvedRecommendedMonths
        ),
        resolvedRecommendedMonths
      )
    );

  /* -------------------------------------------------------
     RESOLVED TARGET
  ------------------------------------------------------- */

  const targetAmount =
    backendTargetAmount > 0
      ? backendTargetAmount
      : monthlyExpenses * targetMonths;

  /* -------------------------------------------------------
     MONTHS COVERED
  ------------------------------------------------------- */

  const monthsCovered =
    toNumber(
      firstDefined(
        rawData.monthsCovered,
        rawData.coverageMonths,
        rawData.monthsOfCoverage,
        monthlyExpenses > 0
          ? currentAmount /
            monthlyExpenses
          : 0
      )
    );

  /* -------------------------------------------------------
     REMAINING AMOUNT
  ------------------------------------------------------- */

  const remainingAmount =
    Math.max(
      0,
      toNumber(
        firstDefined(
          rawData.remainingAmount,
          rawData.amountRemaining,
          targetAmount -
            currentAmount
        )
      )
    );

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  const calculatedProgress =
    targetAmount > 0
      ? (currentAmount /
          targetAmount) *
        100
      : 0;

  const progressPercentage =
    Math.min(
      100,
      Math.max(
        0,
        toNumber(
          firstDefined(
            rawData.progressPercentage,
            rawData.progressPercent,
            rawData.progress?.percentage,
            calculatedProgress
          )
        )
      )
    );

  /* -------------------------------------------------------
     CONTRIBUTION
  ------------------------------------------------------- */

  const recommendedContribution =
    toNumber(
      firstDefined(
        rawData.recommendedContribution,
        rawData.requiredContribution,
        rawData.monthlyContribution,
        rawData.contributionAmount
      )
    );

  const contributionFrequency =
    firstDefined(
      rawData.contributionFrequency,
      rawData.frequency,
      rawData.interval
    );

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const status =
    firstDefined(
      rawData.status,
      rawData.health,
      rawData.coverageStatus
    );

  /* -------------------------------------------------------
     RECOMMENDATION
  ------------------------------------------------------- */

  const recommendation =
    firstDefined(
      rawData.recommendation,
      rawData.primaryRecommendation
    );

  /* -------------------------------------------------------
     INSIGHTS
  ------------------------------------------------------- */

  const insights =
    resolveArray(
      rawData.insights,
      rawData.recommendations
    );

  /* -------------------------------------------------------
     PROJECTION
  ------------------------------------------------------- */

  const projection =
    firstDefined(
      rawData.projection,
      rawData.forecast,
      rawData.savingsProjection
    );

  /* -------------------------------------------------------
     FINAL NORMALIZED OBJECT
  ------------------------------------------------------- */

  return {
    ...rawData,

    currentAmount,

    monthlyExpenses,

    targetAmount,

    targetMonths,

    recommendedMonths:
      resolvedRecommendedMonths,

    monthsCovered,

    remainingAmount,

    progressPercentage,

    recommendedContribution,

    contributionFrequency,

    status,

    recommendation,

    insights,

    projection,

    currency:
      firstDefined(
        rawData.currency,
        fallbackCurrency
      ),
  };
};

/* =========================================================
   PAGE
========================================================= */

const EmergencyFundPage = ({
  goalId = null,
  planId = null,

  emergencyFund:
    suppliedEmergencyFund = null,

  title = "Emergency Fund",

  description =
    DEFAULT_DESCRIPTION,

  currency =
    DEFAULT_CURRENCY || "NGN",

  recommendedMonths =
    DEFAULT_RECOMMENDED_MONTHS,

  onCreateFund,

  onContribute,

  onAction,

  onRefresh,

  showCalculator = true,

  showCoverage = true,

  showProgress = true,

  showRecommendation = true,

  showInsights = true,

  showRefresh = true,

  className = "",
}) => {
  /* =======================================================
     SINGLE DATA OWNER
  ======================================================= */

  const emergencyFundState =
    useEmergencyFund({
      goalId,
      planId,
      enabled:
        !suppliedEmergencyFund,
    }) || {};

  const {
    emergencyFund:
      hookEmergencyFund = null,

    data = null,

    loading = false,

    isLoading = false,

    refreshing = false,

    isRefreshing = false,

    error = null,

    refresh,

    refetch,
  } = emergencyFundState;

  /* =======================================================
     RESOLVE SOURCE
  ======================================================= */

  const sourceData = useMemo(
    () =>
      firstDefined(
        suppliedEmergencyFund,
        hookEmergencyFund,
        data?.emergencyFund,
        data
      ),
    [
      suppliedEmergencyFund,
      hookEmergencyFund,
      data,
    ]
  );

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const emergencyFund = useMemo(
    () =>
      normalizeEmergencyFund({
        source: sourceData,
        fallbackCurrency:
          currency,
        recommendedMonths,
      }),
    [
      sourceData,
      currency,
      recommendedMonths,
    ]
  );

  /* =======================================================
     STATE
  ======================================================= */

  const isBusy =
    Boolean(loading) ||
    Boolean(isLoading);

  const isRefreshingFund =
    Boolean(refreshing) ||
    Boolean(isRefreshing);

  const hasData =
    isObject(sourceData) &&
    Object.keys(sourceData).length >
      0;

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshFund = useCallback(
    async () => {
      let result;

      if (
        typeof refresh ===
        "function"
      ) {
        result =
          await refresh();
      } else if (
        typeof refetch ===
        "function"
      ) {
        result =
          await refetch();
      } else {
        return undefined;
      }

      if (
        typeof onRefresh ===
        "function"
      ) {
        await onRefresh(result);
      }

      return result;
    },
    [
      refresh,
      refetch,
      onRefresh,
    ]
  );

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry = useCallback(
    () => {
      void refreshFund();
    },
    [refreshFund]
  );

  /* =======================================================
     CREATE FUND
  ======================================================= */

  const handleCreateFund =
    useCallback(() => {
      if (
        typeof onCreateFund !==
        "function"
      ) {
        return;
      }

      onCreateFund();
    }, [onCreateFund]);

  /* =======================================================
     CONTRIBUTE
  ======================================================= */

  const handleContribute =
    useCallback(() => {
      if (
        typeof onContribute !==
        "function"
      ) {
        return;
      }

      onContribute(
        emergencyFund
      );
    }, [
      onContribute,
      emergencyFund,
    ]);

  /* =======================================================
     ACTION
  ======================================================= */

  const handleAction =
    useCallback(
      (...args) => {
        if (
          typeof onAction !==
          "function"
        ) {
          return;
        }

        onAction(
          emergencyFund,
          ...args
        );
      },
      [
        onAction,
        emergencyFund,
      ]
    );

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    isBusy &&
    !hasData
  ) {
    return (
      <main
        className={`
          w-full
          min-h-screen
          bg-slate-50
          ${className}
        `}
        aria-busy="true"
        aria-label="Loading emergency fund"
      >
        <div
          className="
            w-full max-w-7xl
            mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8
          "
        >
          <div
            className="
              flex justify-center items-center
              min-h-[60vh]
            "
          >
            <div
              className="
                flex flex-col items-center
                text-center
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-12 h-12
                  bg-slate-900
                  rounded-xl
                "
              >
                <RefreshCw
                  size={20}
                  className="
                    text-white
                    animate-spin
                  "
                  aria-hidden="true"
                /
                >
              </div>

              <p
                className="
                  mt-4
                  font-semibold text-slate-900 text-sm
                "
              >
                Loading your emergency fund
              </p>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs
                "
              >
                Preparing your financial
                safety overview...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (
    error &&
    !hasData
  ) {
    return (
      <main
        className={`
          w-full
          min-h-screen
          bg-slate-50
          ${className}
        `}
      >
        <div
          className="
            flex items-center
            w-full max-w-7xl min-h-screen
            mx-auto px-4 sm:px-6 lg:px-8 py-8
          "
        >
          <section
            className="
              w-full
              p-6 sm:p-8
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
            role="alert"
          >
            <div
              className="
                flex flex-col items-center
                max-w-lg
                mx-auto
                text-center
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-12 h-12
                  bg-red-50
                  rounded-xl
                "
              >
                <AlertCircle
                  size={22}
                  className="
                    text-red-600
                  "
                  aria-hidden="true"
                /
                >
              </div>

              <h1
                className="
                  mt-4
                  font-bold text-slate-900 text-lg
                "
              >
                Emergency fund unavailable
              </h1>

              <p
                className="
                  mt-2
                  text-slate-500 text-sm leading-6
                "
              >
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                disabled={
                  isRefreshingFund
                }
                className="
                  inline-flex justify-center items-center
                  mt-5 px-4 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <RefreshCw
                  size={15}
                  className={
                    isRefreshingFund
                      ? "animate-spin"
                      : ""
                  }
                />

                {isRefreshingFund
                  ? "Retrying..."
                  : "Try again"}
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className={`
        w-full
        min-h-screen
        bg-slate-50
        ${className}
      `}
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8
        "
      >
        {/* =================================================
            HEADER
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
                {title}
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                {description}
              </p>
            </div>
          </div>

          {showRefresh && (
            <button
              type="button"
              onClick={() =>
                void refreshFund()
              }
              disabled={
                isRefreshingFund ||
                (
                  typeof refresh !==
                    "function" &&
                  typeof refetch !==
                    "function"
                )
              }
              className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-100 disabled:opacity-50 shadow-sm px-4 py-2.5 border border-slate-200 rounded-xl w-full sm:w-auto font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
              aria-label={
                isRefreshingFund
                  ? "Refreshing emergency fund"
                  : "Refresh emergency fund"
              }
            >
              <RefreshCw
                size={15}
                className={
                  isRefreshingFund
                    ? "animate-spin"
                    : ""
                }
              />

              {isRefreshingFund
                ? "Updating..."
                : "Refresh"}
            </button>
          )}
        </header>

        {/* =================================================
            REFRESH STATUS
        ================================================= */}

        {isRefreshingFund && (
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

        {error && hasData && (
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
              <AlertCircle
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
                  {errorMessage ||
                    "Your previously loaded information remains available."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={
                isRefreshingFund
              }
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
                  isRefreshingFund
                    ? "animate-spin"
                    : ""
                }
              />

              Retry
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!hasData && !isBusy && (
          <section
            className="
              mt-6 sm:mt-8 p-6 sm:p-8
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
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
                className="
                  mt-5
                  font-bold text-slate-900 text-lg sm:text-xl
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
            </div>
          </section>
        )}

        {/* =================================================
            FINANCIAL SUMMARY
        ================================================= */}

        {hasData && (
          <>
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
                    self-start lg:self-auto
                    px-3 py-2
                    font-medium text-slate-200 text-xs
                    bg-white/10
                    border border-white/10 rounded-lg
                    shrink-0
                  "
                >
                  Currency:{" "}
                  {emergencyFund.currency}
                </div>
              </div>
            </section>

            {/* =================================================
                PROGRESS
            ================================================= */}

            {showProgress && (
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
                  currentAmount={
                    emergencyFund.currentAmount
                  }
                  targetAmount={
                    emergencyFund.targetAmount
                  }
                  progressPercentage={
                    emergencyFund.progressPercentage
                  }
                  monthlyExpenses={
                    emergencyFund.monthlyExpenses
                  }
                  monthsCovered={
                    emergencyFund.monthsCovered
                  }
                  recommendedMonths={
                    emergencyFund.recommendedMonths
                  }
                  currency={
                    emergencyFund.currency
                  }
                  status={
                    emergencyFund.status
                  }
                  loading={isBusy}
                  onContribute={
                    typeof onContribute ===
                    "function"
                      ? handleContribute
                      : undefined
                  }
                />
              </section>
            )}

            {/* =================================================
                COVERAGE
            ================================================= */}

            {showCoverage && (
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
                  currentAmount={
                    emergencyFund.currentAmount
                  }
                  monthlyExpenses={
                    emergencyFund.monthlyExpenses
                  }
                  monthsCovered={
                    emergencyFund.monthsCovered
                  }
                  recommendedMonths={
                    emergencyFund.recommendedMonths
                  }
                  targetMonths={
                    emergencyFund.targetMonths
                  }
                  targetAmount={
                    emergencyFund.targetAmount
                  }
                  currency={
                    emergencyFund.currency
                  }
                />
              </section>
            )}

            {/* =================================================
                RECOMMENDATION
            ================================================= */}

            {showRecommendation && (
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
                  recommendation={
                    emergencyFund.recommendation
                  }
                  currentAmount={
                    emergencyFund.currentAmount
                  }
                  targetAmount={
                    emergencyFund.targetAmount
                  }
                  remainingAmount={
                    emergencyFund.remainingAmount
                  }
                  monthsCovered={
                    emergencyFund.monthsCovered
                  }
                  recommendedMonths={
                    emergencyFund.recommendedMonths
                  }
                  currency={
                    emergencyFund.currency
                  }
                  onAction={
                    typeof onAction ===
                    "function"
                      ? handleAction
                      : undefined
                  }
                />
              </section>
            )}

            {/* =================================================
                INSIGHTS
            ================================================= */}

            {showInsights && (
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
                  insights={
                    emergencyFund.insights
                  }
                  emergencyFund={
                    emergencyFund
                  }
                  currency={
                    emergencyFund.currency
                  }
                  loading={isBusy}
                  onRefresh={
                    refreshFund
                  }
                />
              </section>
            )}

            {/* =================================================
                CALCULATOR
            ================================================= */}

            {showCalculator && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-labelledby="emergency-fund-calculator"
              >
                <h2
                  id="emergency-fund-calculator"
                  className="
                    sr-only
                  "
                >
                  Emergency fund calculator
                </h2>

                <EmergencyFundCalculator
                  currentAmount={
                    emergencyFund.currentAmount
                  }
                  monthlyExpenses={
                    emergencyFund.monthlyExpenses
                  }
                  targetAmount={
                    emergencyFund.targetAmount
                  }
                  recommendedMonths={
                    emergencyFund.recommendedMonths
                  }
                  currency={
                    emergencyFund.currency
                  }
                  onCreateFund={
                    typeof onCreateFund ===
                    "function"
                      ? handleCreateFund
                      : undefined
                  }
                  onContribute={
                    typeof onContribute ===
                    "function"
                      ? handleContribute
                      : undefined
                  }
                />
              </section>
            )}
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
              Currency:{" "}
              {emergencyFund.currency ||
                currency}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default EmergencyFundPage;