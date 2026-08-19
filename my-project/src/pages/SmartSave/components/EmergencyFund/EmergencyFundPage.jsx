import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Info,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  memo,
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
  "Build a financial safety buffer that helps protect your essentials when unexpected expenses arise.";


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

const clamp = (
  value,
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(
      min,
      toNumber(value)
    )
  );

/* =========================================================
   CURRENCY
========================================================= */

const formatCurrency = (
  value,
  currency = DEFAULT_CURRENCY
) => {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency:
          currency ||
          DEFAULT_CURRENCY,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency || DEFAULT_CURRENCY} ${amount.toLocaleString(
      "en-NG"
    )}`;
  }
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const resolveData = (value) => {
  if (!isObject(value)) {
    return {};
  }

  if (isObject(value.data)) {
    return value.data;
  }

  if (isObject(value.result)) {
    return value.result;
  }

  if (isObject(value.emergencyFund)) {
    return value.emergencyFund;
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
    error?.data?.message ||
    error?.message ||
    error?.error ||
    "We could not load your emergency fund information."
  );
};

/* =========================================================
   FUND NORMALIZER
========================================================= */

const normalizeEmergencyFund = ({
  source,
  fallbackCurrency,
  recommendedMonths,
}) => {
  const raw = resolveData(source);

  const currentAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        raw.currentAmount,
        raw.currentBalance,
        raw.balance,
        raw.amountSaved,
        raw.savedAmount,
        raw.progress?.current
      )
    )
  );

  const monthlyExpenses = Math.max(
    0,
    toNumber(
      firstDefined(
        raw.monthlyExpenses,
        raw.monthlyEssentialExpenses,
        raw.essentialMonthlyExpenses,
        raw.expenses?.monthly
      )
    )
  );

  const resolvedMonths = Math.max(
    1,
    toNumber(
      firstDefined(
        raw.recommendedMonths,
        raw.coverageTargetMonths,
        raw.targetMonths,
        recommendedMonths
      ),
      recommendedMonths
    )
  );

  const backendTarget = Math.max(
    0,
    toNumber(
      firstDefined(
        raw.targetAmount,
        raw.emergencyFundTarget,
        raw.recommendedAmount,
        raw.goalAmount
      )
    )
  );

  const targetAmount =
    backendTarget > 0
      ? backendTarget
      : monthlyExpenses *
        resolvedMonths;

  const monthsCovered = Math.max(
    0,
    toNumber(
      firstDefined(
        raw.monthsCovered,
        raw.coverageMonths,
        raw.monthsOfCoverage,
        monthlyExpenses > 0
          ? currentAmount /
            monthlyExpenses
          : 0
      )
    )
  );

  const remainingAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        raw.remainingAmount,
        raw.amountRemaining,
        targetAmount -
          currentAmount
      )
    )
  );

  const calculatedProgress =
    targetAmount > 0
      ? (currentAmount /
          targetAmount) *
        100
      : 0;

  const progressPercentage = clamp(
    firstDefined(
      raw.progressPercentage,
      raw.progressPercent,
      raw.progress?.percentage,
      calculatedProgress
    )
  );

  const recommendedContribution =
    Math.max(
      0,
      toNumber(
        firstDefined(
          raw.recommendedContribution,
          raw.requiredContribution,
          raw.monthlyContribution,
          raw.contributionAmount
        )
      )
    );

  const contributionFrequency =
    firstDefined(
      raw.contributionFrequency,
      raw.frequency,
      raw.interval,
      "monthly"
    );

  const insights = resolveArray(
    raw.insights,
    raw.recommendations
  );

  const projection = firstDefined(
    raw.projection,
    raw.forecast,
    raw.savingsProjection
  );

  const currency =
    firstDefined(
      raw.currency,
      fallbackCurrency,
      DEFAULT_CURRENCY
    );

  return {
    ...raw,

    currentAmount,

    monthlyExpenses,

    targetAmount,

    targetMonths:
      Math.max(
        resolvedMonths,
        toNumber(
          raw.targetMonths,
          resolvedMonths
        )
      ),

    recommendedMonths:
      resolvedMonths,

    monthsCovered,

    remainingAmount,

    progressPercentage,

    recommendedContribution,

    contributionFrequency,

    status:
      firstDefined(
        raw.status,
        raw.health,
        raw.coverageStatus,
        "building"
      ),

    recommendation:
      firstDefined(
        raw.recommendation,
        raw.primaryRecommendation,
        null
      ),

    insights,

    projection,

    currency,
  };
};

/* =========================================================
   STATUS
========================================================= */

const getFundStatus = ({
  progressPercentage,
  monthsCovered,
  recommendedMonths,
}) => {
  if (
    progressPercentage >= 100 ||
    monthsCovered >=
      recommendedMonths
  ) {
    return {
      label: "Protected",
      description:
        "Your emergency fund currently meets the recommended protection level.",
      icon: CheckCircle2,
    };
  }

  if (
    progressPercentage >= 75 ||
    monthsCovered >=
      recommendedMonths * 0.75
  ) {
    return {
      label: "Nearly there",
      description:
        "Your emergency fund is approaching the recommended safety level.",
      icon: TrendingUp,
    };
  }

  if (
    progressPercentage >= 40 ||
    monthsCovered >=
      recommendedMonths * 0.4
  ) {
    return {
      label: "Building",
      description:
        "You have started building meaningful financial protection.",
      icon: PiggyBank,
    };
  }

  return {
    label: "Getting started",
    description:
      "Keep building consistently toward your emergency fund target.",
    icon: Target,
  };
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    helper,
  }) => (
    <div
      className="
        p-4
        bg-white/10
        border border-white/10 rounded-2xl
      "
    >
      <div
        className="
          flex justify-center items-center
          w-9 h-9
          bg-white/10
          rounded-xl
        "
      >
        <Icon
          size={16}
          className="
            text-white
          "
          aria-hidden="true"
        /
        >
      </div>

      <p
        className="
          mt-4
          font-medium text-[11px] text-slate-300 uppercase tracking-wider
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-bold text-white text-lg break-words
        "
      >
        {value}
      </p>

      {helper && (
        <p
          className="
            mt-1
            text-[11px] text-slate-400 leading-4
          "
        >
          {helper}
        </p>
      )}
    </div>
  )
);

SummaryMetric.displayName =
  "EmergencyFundSummaryMetric";

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyFundState = memo(
  ({
    onCreateFund,
    onRefresh,
    refreshing,
  }) => {
    return (
      <section
        className="
          overflow-hidden
          mt-6 sm:mt-8
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >
        <div
          className="
            relative
            p-6 sm:p-10
          "
        >
          <div
            className="
              absolute
              w-48 h-48
              bg-slate-100
              rounded-full
              opacity-70 blur-3xl
              pointer-events-none
              -top-20 -right-20
            "
            /
          >

          <div
            className="
              relative flex flex-col items-center
              max-w-2xl
              mx-auto
              text-center
            "
          >
            <div
              className="
                flex justify-center items-center
                w-16 h-16
                bg-slate-950
                rounded-2xl
                shadow-lg
              "
            >
              <ShieldCheck
                size={28}
                className="
                  text-white
                "
                aria-hidden="true"
              /
              >
            </div>

            <span
              className="
                inline-flex items-center
                mt-5 px-3 py-1.5
                font-semibold text-[11px] text-slate-600
                bg-slate-100
                border border-slate-200 rounded-full
              "
            >
              SmartSave protection
            </span>

            <h2
              className="
                mt-4
                font-bold text-slate-950 text-xl sm:text-2xl tracking-tight
              "
            >
              Build your financial safety net
            </h2>

            <p
              className="
                max-w-xl
                mt-3
                text-slate-500 text-sm leading-6
              "
            >
              An emergency fund gives you a dedicated
              financial buffer for unexpected expenses
              without disrupting your everyday budget.
            </p>

            <div
              className="
                grid grid-cols-1 sm:grid-cols-3
                w-full
                mt-7
                gap-3
              "
            >
              {[
                {
                  icon: ShieldCheck,
                  title: "Protect",
                  text: "Prepare for unexpected costs.",
                },
                {
                  icon: Target,
                  title: "Plan",
                  text: "Set a realistic safety target.",
                },
                {
                  icon: TrendingUp,
                  title: "Build",
                  text: "Grow your buffer consistently.",
                },
              ].map(
                ({
                  icon: Icon,
                  title,
                  text,
                }) => (
                  <div
                    key={title}
                    className="
                      p-4
                      text-left
                      bg-slate-50
                      border border-slate-200 rounded-2xl
                    "
                  >
                    <Icon
                      size={17}
                      className="
                        text-slate-700
                      "
                      /
                    >

                    <p
                      className="
                        mt-3
                        font-semibold text-slate-900 text-sm
                      "
                    >
                      {title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-slate-500 text-xs leading-5
                      "
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>

            <div
              className="
                flex flex-col sm:flex-row justify-center
                w-full
                mt-7
                gap-3
              "
            >
              {typeof onCreateFund ===
                "function" && (
                <button
                  type="button"
                  onClick={onCreateFund}
                  className="
                    inline-flex justify-center items-center
                    min-h-11
                    px-5
                    font-semibold text-white text-sm
                    bg-slate-950 hover:bg-slate-800
                    rounded-xl focus:outline-none
                    focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                    shadow-sm transition
                    gap-2
                  "
                >
                  Create emergency fund
                  <ArrowRight
                    size={15}
                  />
                </button>
              )}

              {typeof onRefresh ===
                "function" && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="
                    inline-flex justify-center items-center
                    min-h-11
                    px-5
                    font-semibold text-slate-700 text-sm
                    bg-white hover:bg-slate-50
                    border border-slate-200 rounded-xl
                    disabled:opacity-50 transition
                    gap-2
                  "
                >
                  <RefreshCw
                    size={15}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

EmptyFundState.displayName =
  "EmergencyFundEmptyState";

/* =========================================================
   LOADING STATE
========================================================= */

const LoadingState = memo(() => (
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
      <div
        className="
          w-56 h-8
          bg-slate-200
          rounded-lg
          animate-pulse
        "
        /
      >

      <div
        className="
          max-w-xl h-4
          mt-3
          bg-slate-200
          rounded
          animate-pulse
        "
        /
      >

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          mt-8
          gap-4
        "
      >
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="
                h-32
                bg-white
                border border-slate-200 rounded-3xl
                animate-pulse
              "
              /
            >
          )
        )}
      </div>

      <div
        className="
          h-72
          mt-5
          bg-white
          border border-slate-200 rounded-3xl
          animate-pulse
        "
        /
      >
    </div>
  </main>
));

LoadingState.displayName =
  "EmergencyFundLoadingState";

/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = memo(
  ({
    message,
    onRetry,
    refreshing,
  }) => (
    <main
      className="
        flex items-center
        w-full min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-lg
          mx-auto px-4 sm:px-6
        "
      >
        <section
          className="
            p-6 sm:p-8
            text-center
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
          role="alert"
        >
          <div
            className="
              flex justify-center items-center
              w-12 h-12
              mx-auto
              bg-red-50
              rounded-2xl
            "
          >
            <AlertCircle
              size={22}
              className="
                text-red-600
              "
              /
            >
          </div>

          <h1
            className="
              mt-4
              font-bold text-slate-950 text-lg
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
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            disabled={refreshing}
            className="
              inline-flex justify-center items-center
              min-h-11
              mt-5 px-5
              font-semibold text-white text-sm
              bg-slate-950 hover:bg-slate-800
              rounded-xl
              disabled:opacity-50 transition
              gap-2
            "
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Retrying..."
              : "Try again"}
          </button>
        </section>
      </div>
    </main>
  )
);

ErrorState.displayName =
  "EmergencyFundErrorState";

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
    DEFAULT_CURRENCY,

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
     DATA
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
     SOURCE
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

  const hasData = useMemo(() => {
    if (!isObject(sourceData)) {
      return false;
    }

    const resolved =
      resolveData(sourceData);

    return (
      Object.keys(resolved).length >
      0
    );
  }, [sourceData]);

  /* =======================================================
     NORMALIZED FUND
  ======================================================= */

  const fund = useMemo(
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
     UI STATE
  ======================================================= */

  const initialLoading =
    Boolean(
      loading || isLoading
    );

  const backgroundRefreshing =
    Boolean(
      refreshing ||
      isRefreshing
    );

  const errorMessage = useMemo(
    () =>
      getErrorMessage(error),
    [error]
  );

  const fundStatus = useMemo(
    () =>
      getFundStatus({
        progressPercentage:
          fund.progressPercentage,
        monthsCovered:
          fund.monthsCovered,
        recommendedMonths:
          fund.recommendedMonths,
      }),
    [
      fund.progressPercentage,
      fund.monthsCovered,
      fund.recommendedMonths,
    ]
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

  const handleRetry =
    useCallback(() => {
      void refreshFund();
    }, [refreshFund]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleCreateFund =
    useCallback(() => {
      if (
        typeof onCreateFund ===
        "function"
      ) {
        onCreateFund();
      }
    }, [onCreateFund]);

  const handleContribute =
    useCallback(() => {
      if (
        typeof onContribute ===
        "function"
      ) {
        onContribute(fund);
      }
    }, [
      onContribute,
      fund,
    ]);

  const handleAction =
    useCallback(
      (...args) => {
        if (
          typeof onAction ===
          "function"
        ) {
          onAction(
            fund,
            ...args
          );
        }
      },
      [
        onAction,
        fund,
      ]
    );

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    initialLoading &&
    !hasData
  ) {
    return <LoadingState />;
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (
    errorMessage &&
    !hasData
  ) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={handleRetry}
        refreshing={
          backgroundRefreshing
        }
      />
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
      aria-labelledby="emergency-fund-title"
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
                w-12 h-12
                bg-slate-950
                rounded-2xl
                shadow-sm
                shrink-0
              "
            >
              <ShieldCheck
                size={21}
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
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <span
                  className="
                    font-semibold text-[11px] text-slate-500 uppercase
                    tracking-wider
                  "
                >
                  SmartSave
                </span>

                <span
                  className="
                    inline-flex items-center
                    px-2 py-1
                    font-semibold text-[10px] text-emerald-700
                    bg-emerald-50
                    border border-emerald-100 rounded-full
                    gap-1
                  "
                >
                  <ShieldCheck size={10} />
                  Financial protection
                </span>
              </div>

              <h1
                id="emergency-fund-title"
                className="
                  mt-1
                  font-bold text-slate-950 text-xl sm:text-2xl tracking-tight
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
              onClick={handleRetry}
              disabled={
                backgroundRefreshing ||
                (
                  typeof refresh !==
                    "function" &&
                  typeof refetch !==
                    "function"
                )
              }
              className="
                inline-flex justify-center items-center
                w-full lg:w-auto min-h-11
                px-4
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-xl
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <RefreshCw
                size={15}
                className={
                  backgroundRefreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {backgroundRefreshing
                ? "Updating..."
                : "Refresh"}
            </button>
          )}
        </header>

        {/* =================================================
            BACKGROUND SYNC
        ================================================= */}

        {backgroundRefreshing &&
          hasData && (
            <div
              className="
                flex items-center
                mt-4 px-4 py-2.5
                text-slate-500 text-xs
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
                /
              >

              Updating your emergency
              fund information...
            </div>
          )}

        {/* =================================================
            STALE DATA WARNING
        ================================================= */}

        {errorMessage &&
          hasData && (
            <div
              className="
                flex flex-col sm:flex-row sm:justify-between sm:items-center
                mt-4 p-4
                bg-amber-50
                border border-amber-200 rounded-2xl
                gap-3
              "
              role="alert"
            >
              <div
                className="
                  flex items-start
                  gap-3
                "
              >
                <Info
                  size={17}
                  className="
                    mt-0.5
                    text-amber-600
                    shrink-0
                  "
                  /
                >

                <div>
                  <p
                    className="
                      font-semibold text-amber-900 text-sm
                    "
                  >
                    Showing your last
                    available data
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-amber-700 text-xs leading-5
                    "
                  >
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                disabled={
                  backgroundRefreshing
                }
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3
                  font-semibold text-amber-800 text-xs
                  bg-white
                  border border-amber-200 rounded-lg
                  disabled:opacity-50
                  gap-2
                "
              >
                <RefreshCw
                  size={13}
                  className={
                    backgroundRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Retry
              </button>
            </div>
          )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!hasData &&
          !initialLoading && (
            <EmptyFundState
              onCreateFund={
                typeof onCreateFund ===
                "function"
                  ? handleCreateFund
                  : undefined
              }
              onRefresh={
                typeof refresh ===
                  "function" ||
                typeof refetch ===
                  "function"
                  ? handleRetry
                  : undefined
              }
              refreshing={
                backgroundRefreshing
              }
            />
          )}

        {/* =================================================
            ACTIVE FUND
        ================================================= */}

        {hasData && (
          <>
            {/* =============================================
                HERO
            ============================================== */}

            <section
              className="
                relative overflow-hidden
                mt-6 sm:mt-8 p-5 sm:p-6 lg:p-7
                bg-slate-950
                rounded-3xl
                shadow-lg
              "
              aria-labelledby="emergency-fund-position"
            >
              <div
                className="
                  absolute
                  w-72 h-72
                  bg-white/5
                  rounded-full
                  blur-3xl
                  pointer-events-none
                  -top-24 -right-24
                "
                /
              >

              <div
                className="
                  absolute
                  w-64 h-64
                  bg-white/5
                  rounded-full
                  blur-3xl
                  pointer-events-none
                  -bottom-32 -left-20
                "
                /
              >

              <div
                className="
                  relative grid grid-cols-1 xl:grid-cols-[1fr_auto]
                  gap-7
                "
              >
                <div>
                  <div
                    className="
                      flex items-center
                      gap-2
                    "
                  >
                    <Sparkles
                      size={15}
                      className="
                        text-slate-300
                      "
                      /
                    >

                    <span
                      className="
                        font-semibold text-slate-300 text-xs uppercase
                        tracking-wider
                      "
                    >
                      Emergency fund position
                    </span>
                  </div>

                  <div
                    className="
                      flex flex-wrap items-end
                      mt-3
                      gap-x-3 gap-y-1
                    "
                  >
                    <p
                      className="
                        font-bold text-white text-3xl sm:text-4xl tracking-tight
                      "
                    >
                      {formatCurrency(
                        fund.currentAmount,
                        fund.currency
                      )}
                    </p>

                    <span
                      className="
                        mb-1
                        text-slate-400 text-sm
                      "
                    >
                      saved
                    </span>
                  </div>

                  <p
                    className="
                      max-w-xl
                      mt-2
                      text-slate-400 text-sm leading-6
                    "
                  >
                    {fund.monthsCovered.toFixed(
                      1
                    )}{" "}
                    months of essential expenses
                    covered toward your{" "}
                    {fund.recommendedMonths}
                    -month safety target.
                  </p>

                  <div
                    className="
                      flex flex-wrap
                      mt-5
                      gap-2
                    "
                  >
                    <span
                      className="
                        inline-flex items-center
                        px-3 py-1.5
                        font-semibold text-white text-xs
                        bg-white/10
                        border border-white/10 rounded-full
                      "
                    >
                      {fundStatus.label}
                    </span>

                    <span
                      className="
                        inline-flex items-center
                        px-3 py-1.5
                        font-medium text-slate-300 text-xs
                        bg-white/5
                        border border-white/10 rounded-full
                      "
                    >
                      {fund.currency}
                    </span>
                  </div>
                </div>

                <div
                  className="
                    grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1
                    min-w-0 xl:min-w-[250px]
                    gap-3
                  "
                >
                  <SummaryMetric
                    icon={Target}
                    label="Target"
                    value={formatCurrency(
                      fund.targetAmount,
                      fund.currency
                    )}
                    helper={`${fund.recommendedMonths}-month target`}
                  />

                  <SummaryMetric
                    icon={Wallet}
                    label="Monthly essentials"
                    value={formatCurrency(
                      fund.monthlyExpenses,
                      fund.currency
                    )}
                    helper="Essential expenses"
                  />

                  <SummaryMetric
                    icon={TrendingUp}
                    label="Progress"
                    value={`${Math.round(
                      fund.progressPercentage
                    )}%`}
                    helper={
                      fundStatus.description
                    }
                  />
                </div>
              </div>
            </section>

            {/* =============================================
                PROGRESS
            ============================================== */}

            {showProgress && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-label="Emergency fund progress"
              >
                <EmergencyFundProgress
                  currentAmount={
                    fund.currentAmount
                  }
                  targetAmount={
                    fund.targetAmount
                  }
                  progressPercentage={
                    fund.progressPercentage
                  }
                  monthlyExpenses={
                    fund.monthlyExpenses
                  }
                  monthsCovered={
                    fund.monthsCovered
                  }
                  recommendedMonths={
                    fund.recommendedMonths
                  }
                  currency={
                    fund.currency
                  }
                  status={
                    fund.status
                  }
                  loading={initialLoading}
                  onContribute={
                    typeof onContribute ===
                    "function"
                      ? handleContribute
                      : undefined
                  }
                />
              </section>
            )}

            {/* =============================================
                COVERAGE
            ============================================== */}

            {showCoverage && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-label="Emergency fund coverage"
              >
                <EmergencyFundCoverage
                  currentAmount={
                    fund.currentAmount
                  }
                  monthlyExpenses={
                    fund.monthlyExpenses
                  }
                  monthsCovered={
                    fund.monthsCovered
                  }
                  recommendedMonths={
                    fund.recommendedMonths
                  }
                  targetMonths={
                    fund.targetMonths
                  }
                  targetAmount={
                    fund.targetAmount
                  }
                  currency={
                    fund.currency
                  }
                />
              </section>
            )}

            {/* =============================================
                RECOMMENDATION
            ============================================== */}

            {showRecommendation && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-label="Emergency fund recommendation"
              >
                <EmergencyFundRecommendation
                  recommendation={
                    fund.recommendation
                  }
                  currentAmount={
                    fund.currentAmount
                  }
                  targetAmount={
                    fund.targetAmount
                  }
                  remainingAmount={
                    fund.remainingAmount
                  }
                  monthsCovered={
                    fund.monthsCovered
                  }
                  recommendedMonths={
                    fund.recommendedMonths
                  }
                  currency={
                    fund.currency
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

            {/* =============================================
                INSIGHTS
            ============================================== */}

            {showInsights && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-label="Emergency fund insights"
              >
                <EmergencyFundInsights
                  insights={
                    fund.insights
                  }
                  emergencyFund={fund}
                  currency={
                    fund.currency
                  }
                  loading={
                    initialLoading
                  }
                  onRefresh={
                    refreshFund
                  }
                />
              </section>
            )}

            {/* =============================================
                CALCULATOR
            ============================================== */}

            {showCalculator && (
              <section
                className="
                  mt-5 sm:mt-6
                "
                aria-label="Emergency fund calculator"
              >
                <EmergencyFundCalculator
                  currentAmount={
                    fund.currentAmount
                  }
                  monthlyExpenses={
                    fund.monthlyExpenses
                  }
                  targetAmount={
                    fund.targetAmount
                  }
                  recommendedMonths={
                    fund.recommendedMonths
                  }
                  currency={
                    fund.currency
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

            {/* =============================================
                TRUST FOOTER
            ============================================== */}

            <footer
              className="
                flex flex-col sm:flex-row sm:justify-between sm:items-center
                mt-8 sm:mt-10 pt-5
                border-slate-200 border-t
                gap-3
              "
            >
              <div
                className="
                  flex items-start
                  text-slate-400 text-xs
                  gap-2
                "
              >
                <ShieldCheck
                  size={14}
                  className="
                    mt-0.5
                    text-slate-500
                    shrink-0
                  "
                  /
                >

                <p>
                  SmartSave uses your savings
                  information to help you plan
                  financial resilience.
                </p>
              </div>

              <p
                className="
                  font-medium text-slate-400 text-xs
                  shrink-0
                "
              >
                {fund.currency}
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
};

export default memo(
  EmergencyFundPage
);