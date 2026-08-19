import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useCallback,
  useId,
  useMemo,
} from "react";

import useEmergencyFund from "../../../../hooks/useEmergencyFund";

import {
  formatCurrency,
  formatDate,
} from "../../../../utils/smartSave/emergencyFundFormatters";

import {
  normalizeEmergencyFund,
} from "../../../../utils/smartSave/emergencyFundNormalizers";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TARGET_MONTHS = 3;

const MAX_INSIGHTS = 4;

const EMPTY_INSIGHTS = Object.freeze([]);

/* =========================================================
   SAFE HELPERS
========================================================= */

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

const toNonNegativeNumber = (
  value,
  fallback = 0
) =>
  Math.max(
    0,
    toNumber(value, fallback)
  );

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

const hasMeaningfulData = (
  value
) => {
  if (!value) {
    return false;
  }

  if (
    typeof value !== "object"
  ) {
    return true;
  }

  return Object.keys(value).length > 0;
};

const getErrorMessage = (
  error
) => {
  if (!error) {
    return null;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong while loading emergency-fund insights."
  );
};

/* =========================================================
   STATUS
========================================================= */

const getFundStatus = (
  fund
) => {
  const explicitStatus = String(
    firstDefined(
      fund?.status,
      fund?.health,
      fund?.fundStatus
    ) || ""
  )
    .trim()
    .toLowerCase();

  if (
    explicitStatus.includes(
      "complete"
    ) ||
    explicitStatus.includes(
      "fully"
    ) ||
    explicitStatus.includes(
      "funded"
    )
  ) {
    return "funded";
  }

  if (
    explicitStatus.includes(
      "critical"
    ) ||
    explicitStatus.includes(
      "risk"
    ) ||
    explicitStatus.includes(
      "low"
    )
  ) {
    return "at-risk";
  }

  if (
    explicitStatus.includes(
      "healthy"
    ) ||
    explicitStatus.includes(
      "good"
    ) ||
    explicitStatus.includes(
      "strong"
    )
  ) {
    return "healthy";
  }

  const coverageMonths =
    toNonNegativeNumber(
      firstDefined(
        fund?.coverageMonths,
        fund?.monthsCovered,
        fund?.currentCoverageMonths
      )
    );

  const targetMonths =
    Math.max(
      1,
      toNonNegativeNumber(
        firstDefined(
          fund?.targetMonths,
          fund?.recommendedMonths,
          fund?.monthsTarget
        ),
        DEFAULT_TARGET_MONTHS
      )
    );

  if (
    coverageMonths >=
      targetMonths
  ) {
    return "funded";
  }

  if (
    coverageMonths < 1
  ) {
    return "at-risk";
  }

  if (
    coverageMonths >=
    targetMonths * 0.5
  ) {
    return "healthy";
  }

  return "building";
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = Object.freeze({
  funded: {
    label: "Emergency fund funded",

    description:
      "Your current reserve is meeting the recommended emergency-fund target.",

    icon: CheckCircle2,

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  healthy: {
    label: "Healthy emergency fund",

    description:
      "Your reserve provides a solid financial safety buffer.",

    icon: ShieldAlert,

    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  building: {
    label: "Emergency fund in progress",

    description:
      "You are actively building your financial safety buffer.",

    icon: TrendingUp,

    className:
      "border-slate-200 bg-slate-50 text-slate-700",
  },

  "at-risk": {
    label: "Emergency fund needs attention",

    description:
      "Your current reserve may not provide enough protection against unexpected expenses.",

    icon: AlertTriangle,

    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
});

/* =========================================================
   INSIGHT TONES
========================================================= */

const INSIGHT_TONE_CLASSES = Object.freeze({
  positive:
    "border-emerald-200 bg-emerald-50",

  warning:
    "border-amber-200 bg-amber-50",

  danger:
    "border-red-200 bg-red-50",

  neutral:
    "border-slate-200 bg-slate-50",
});

/* =========================================================
   INSIGHT
========================================================= */

const Insight = ({
  icon: Icon,
  title,
  description,
  tone = "neutral",
}) => {


  return (
    <article
      className={`
        p-4
        border
        rounded-xl
        ${
          INSIGHT_TONE_CLASSES[
            tone
          ] ||
          INSIGHT_TONE_CLASSES.neutral
        }
      `}
    >
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-8 h-8
            bg-white/80
            rounded-lg
            shrink-0
          "
          aria-hidden="true"
        >
          <safeIcon
            size={16}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h4
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {title}
          </h4>

          <p
            className="
              mt-1
              text-slate-600 text-xs leading-5
            "
          >
            {description}
          </p>
        </div>
      </div>
    </article>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const InsightsSkeleton = () => (
  <div
    className="
      space-y-3
      animate-pulse
    "
    aria-busy="true"
    aria-label="Loading emergency fund insights"
  >
    <div
      className="
        w-44 h-5
        bg-slate-200
        rounded
      "
      /
    >

    <div
      className="
        w-full h-3
        bg-slate-100
        rounded
      "
      /
    >

    <div
      className="
        grid sm:grid-cols-2
        gap-3
      "
    >
      {[1, 2].map(
        (item) => (
          <div
            key={item}
            className="
              h-24
              bg-slate-100
              rounded-xl
            "
            /
          >
        )
      )}
    </div>
  </div>
);

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyInsights = () => (
  <div
    className="
      flex flex-col justify-center items-center
      px-5 py-8
      text-center
      bg-slate-50
      border border-slate-200 border-dashed rounded-xl
    "
  >
    <div
      className="
        flex justify-center items-center
        w-10 h-10
        mb-3
        bg-white
        rounded-full
        shadow-sm
      "
      aria-hidden="true"
    >
      <Lightbulb
        size={19}
        className="
          text-slate-500
        "
        /
      >
    </div>

    <h4
      className="
        font-semibold text-slate-900 text-sm
      "
    >
      Emergency-fund insights unavailable
    </h4>

    <p
      className="
        max-w-sm
        mt-1
        text-slate-500 text-xs leading-5
      "
    >
      Add your income, essential
      expenses, and emergency-fund
      information to receive
      personalized recommendations.
    </p>
  </div>
);

/* =========================================================
   ERROR STATE
========================================================= */

const InsightsError = ({
  message,
  onRetry,
  refreshing,
}) => (
  <div
    className="
      p-4
      bg-red-50
      border border-red-200 rounded-xl
    "
    role="alert"
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <AlertTriangle
        size={18}
        className="
          mt-0.5
          text-red-600
          shrink-0
        "
        aria-hidden="true"
      /
      >

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <p
          className="
            font-semibold text-red-800 text-sm
          "
        >
          Unable to load
          emergency-fund insights
        </p>

        <p
          className="
            mt-1
            text-red-700 text-xs leading-5
          "
        >
          {message ||
            "Something went wrong while preparing your emergency-fund insights."}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={refreshing}
            className="
              inline-flex items-center
              mt-3 px-3 py-2
              font-semibold text-red-700 text-xs
              bg-white hover:bg-red-100
              border border-red-200 rounded-lg focus:outline-none
              focus:ring-2 focus:ring-red-500/30
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : undefined
              }
              aria-hidden="true"
            />

            {refreshing
              ? "Refreshing..."
              : "Try again"}
          </button>
        ) : null}
      </div>
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmergencyFundInsights = ({
  data: suppliedData,
  title = "Emergency fund insights",
  description =
    "SmartBudget analyzes your emergency reserve and highlights the actions that can strengthen your financial safety net.",
  className = "",
  showRefresh = true,
}) => {
  /* =======================================================
     ACCESSIBLE IDS
  ======================================================= */

  const componentId =
    useId();

  const titleId =
    `emergency-fund-insights-title-${componentId}`;

  /* =======================================================
     DATA SOURCE
  ======================================================= */

  const hasSuppliedData =
    hasMeaningfulData(
      suppliedData
    );

  const emergencyFundState =
    useEmergencyFund({
      enabled: !hasSuppliedData,
    });

  const {
    data,
    fund,
    loading = false,
    isLoading = false,
    refreshing = false,
    isRefreshing = false,
    error,
    refresh,
    refetch,
  } =
    emergencyFundState || {};

  /* =======================================================
     SOURCE DATA
  ======================================================= */

  const rawFund = useMemo(
    () =>
      firstDefined(
        hasSuppliedData
          ? suppliedData
          : undefined,
        fund,
        data?.fund,
        data?.emergencyFund,
        data
      ),
    [
      hasSuppliedData,
      suppliedData,
      fund,
      data,
    ]
  );

  /* =======================================================
     NORMALIZATION
  ======================================================= */

  const normalizedFund =
    useMemo(() => {
      if (
        !hasMeaningfulData(
          rawFund
        )
      ) {
        return null;
      }

      try {
        const normalized =
          normalizeEmergencyFund(
            rawFund
          );

        return hasMeaningfulData(
          normalized
        )
          ? normalized
          : null;
      } catch {
        return null;
      }
    }, [rawFund]);

  /* =======================================================
     LOADING / REFRESHING
  ======================================================= */

  const busy =
    Boolean(loading) ||
    Boolean(isLoading);

  const refreshingFund =
    Boolean(refreshing) ||
    Boolean(isRefreshing);

  /* =======================================================
     RETRY
  ======================================================= */

  const retry = useCallback(
    async () => {
      if (
        refreshingFund
      ) {
        return;
      }

      try {
        if (
          typeof refresh ===
          "function"
        ) {
          await refresh();
          return;
        }

        if (
          typeof refetch ===
          "function"
        ) {
          await refetch();
        }
      } catch {
        /*
         * The hook owns the error state.
         * Do not duplicate error state here.
         */
      }
    },
    [
      refresh,
      refetch,
      refreshingFund,
    ]
  );

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const values =
    useMemo(() => {
      if (
        !normalizedFund
      ) {
        return null;
      }

      const currentAmount =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.currentAmount,
            normalizedFund.amountSaved,
            normalizedFund.currentBalance,
            normalizedFund.balance
          )
        );

      const monthlyExpenses =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.monthlyExpenses,
            normalizedFund.essentialMonthlyExpenses,
            normalizedFund.averageMonthlyExpenses
          )
        );

      const targetMonths =
        Math.max(
          1,
          toNonNegativeNumber(
            firstDefined(
              normalizedFund.targetMonths,
              normalizedFund.recommendedMonths,
              normalizedFund.monthsTarget
            ),
            DEFAULT_TARGET_MONTHS
          )
        );

      const calculatedTarget =
        monthlyExpenses *
        targetMonths;

      const targetAmount =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.targetAmount,
            normalizedFund.recommendedTarget,
            normalizedFund.emergencyFundTarget,
            normalizedFund.target,
            calculatedTarget
          )
        );

      const calculatedCoverage =
        monthlyExpenses > 0
          ? currentAmount /
            monthlyExpenses
          : 0;

      const coverageMonths =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.coverageMonths,
            normalizedFund.monthsCovered,
            normalizedFund.currentCoverageMonths,
            calculatedCoverage
          )
        );

      const fundingGap =
        Math.max(
          0,
          toNonNegativeNumber(
            firstDefined(
              normalizedFund.fundingGap,
              normalizedFund.remainingAmount,
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

      const progress =
        clamp(
          firstDefined(
            normalizedFund.progressPercentage,
            normalizedFund.progress,
            calculatedProgress
          )
        );

      const recommendedContribution =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.recommendedMonthlyContribution,
            normalizedFund.monthlyContribution,
            normalizedFund.requiredMonthlyContribution,
            normalizedFund.contributionAmount
          )
        );

      const calculatedMonthsToFund =
        recommendedContribution >
        0
          ? fundingGap /
            recommendedContribution
          : 0;

      const monthsToFund =
        toNonNegativeNumber(
          firstDefined(
            normalizedFund.monthsToFund,
            normalizedFund.estimatedMonths,
            calculatedMonthsToFund
          )
        );

      const status =
        getFundStatus(
          normalizedFund
        );

      const currency =
        firstDefined(
          normalizedFund.currency,
          normalizedFund.currencyCode,
          "NGN"
        );

      const updatedAt =
        firstDefined(
          normalizedFund.updatedAt,
          normalizedFund.calculatedAt,
          normalizedFund.asOfDate
        );

      return {
        currentAmount,
        targetAmount,
        monthlyExpenses,
        coverageMonths,
        targetMonths,
        fundingGap,
        progress,
        recommendedContribution,
        monthsToFund,
        status,
        currency,
        updatedAt,
      };
    }, [
      normalizedFund,
    ]);

  /* =======================================================
     STATUS CONFIG
  ======================================================= */

  const statusConfig =
    STATUS_CONFIG[
      values?.status ||
        "building"
    ] ||
    STATUS_CONFIG.building;

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     GENERATED INSIGHTS
  ======================================================= */

  const insights =
    useMemo(() => {
      if (!values) {
        return EMPTY_INSIGHTS;
      }

      const result = [];

      if (
        values.status ===
        "funded"
      ) {
        result.push({
          icon: CheckCircle2,
          title:
            "Your safety net is strong",
          description:
            "Your emergency reserve has reached the current recommended target. Maintain it as your essential expenses change.",
          tone: "positive",
        });
      }

      if (
        values.status ===
        "healthy"
      ) {
        result.push({
          icon: ShieldAlert,
          title:
            "Your reserve is healthy",
          description:
            "Your current emergency reserve provides a meaningful financial safety buffer. Continue maintaining it as your circumstances change.",
          tone: "positive",
        });
      }

      if (
        values.status ===
        "at-risk"
      ) {
        result.push({
          icon: AlertTriangle,
          title:
            "Prioritize your emergency reserve",
          description:
            "Your current reserve may not cover unexpected expenses for long. Building the fund should be one of your near-term financial priorities.",
          tone: "danger",
        });
      }

      if (
        values.coverageMonths >
          0 &&
        values.coverageMonths <
          values.targetMonths
      ) {
        result.push({
          icon: Target,
          title:
            `${values.coverageMonths.toFixed(1)} months covered`,
          description:
            `Your current reserve covers approximately ${values.coverageMonths.toFixed(1)} months of essential expenses. The recommended target is about ${values.targetMonths} months.`,
          tone:
            values.coverageMonths >=
            values.targetMonths *
              0.5
              ? "warning"
              : "danger",
        });
      }

      if (
        values.fundingGap >
        0
      ) {
        result.push({
          icon: TrendingUp,
          title:
            "Close the funding gap",
          description:
            `You need approximately ${formatCurrency(
              values.fundingGap,
              values.currency
            )} more to reach your emergency-fund target.`,
          tone: "warning",
        });
      }

      if (
        values.recommendedContribution >
          0 &&
        values.fundingGap >
          0
      ) {
        result.push({
          icon: Lightbulb,
          title:
            "Recommended monthly action",
          description:
            `Consider setting aside about ${formatCurrency(
              values.recommendedContribution,
              values.currency
            )} each month toward your emergency reserve.`,
          tone: "neutral",
        });
      }

      if (
        values.monthsToFund >
          0 &&
        values.fundingGap >
          0
      ) {
        result.push({
          icon: Clock3,
          title:
            "Estimated funding timeline",
          description:
            `At the recommended contribution rate, your emergency fund could take approximately ${Math.ceil(
              values.monthsToFund
            )} months to reach its target.`,
          tone: "neutral",
        });
      }

      if (
        values.progress >=
          75 &&
        values.progress <
          100 &&
        values.fundingGap >
          0
      ) {
        result.push({
          icon: TrendingUp,
          title:
            "You are close to the target",
          description:
            `You have completed approximately ${values.progress.toFixed(
              0
            )}% of your emergency-fund target. Maintaining your current saving discipline can help you close the remaining gap.`,
          tone: "positive",
        });
      }

      if (
        values.monthlyExpenses <=
        0
      ) {
        result.push({
          icon: AlertTriangle,
          title:
            "Update your essential expenses",
          description:
            "Accurate monthly essential expenses are required to determine how many months your emergency fund can cover.",
          tone: "warning",
        });
      }

      return result.slice(
        0,
        MAX_INSIGHTS
      );
    }, [values]);

  /* =======================================================
     COMMON SECTION
  ======================================================= */

  const sectionClassName = `
    rounded-2xl
    border border-slate-200
    bg-white
    p-5
    shadow-sm
    ${className}
  `;

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    busy &&
    !normalizedFund
  ) {
    return (
      <section
        className={
          sectionClassName
        }
        aria-labelledby={
          titleId
        }
      >
        <InsightsSkeleton />
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    !busy &&
    error &&
    !normalizedFund
  ) {
    return (
      <section
        className={
          sectionClassName
        }
        aria-labelledby={
          titleId
        }
      >
        <InsightsError
          message={getErrorMessage(
            error
          )}
          onRetry={
            typeof refresh ===
              "function" ||
            typeof refetch ===
              "function"
              ? retry
              : undefined
          }
          refreshing={
            refreshingFund
          }
        />
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!normalizedFund) {
    return (
      <section
        className={
          sectionClassName
        }
        aria-labelledby={
          titleId
        }
      >
        <EmptyInsights />
      </section>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <section
      className={
        sectionClassName
      }
      aria-labelledby={
        titleId
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          flex justify-between items-start
          mb-5
          gap-4
        "
      >
        <div
          className="
            flex items-start
            min-w-0
            gap-2
          "
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
            <Sparkles
              size={18}
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
            <h3
              id={titleId}
              className="
                font-bold text-slate-900 text-sm
              "
            >
              {title}
            </h3>

            <p
              className="
                mt-0.5
                text-slate-500 text-xs leading-5
              "
            >
              {description}
            </p>
          </div>
        </div>

        {showRefresh &&
        (typeof refresh ===
          "function" ||
          typeof refetch ===
            "function") ? (
          <button
            type="button"
            onClick={() =>
              void retry()
            }
            disabled={
              refreshingFund
            }
            aria-label={
              refreshingFund
                ? "Refreshing emergency fund insights"
                : "Refresh emergency fund insights"
            }
            title="Refresh insights"
            className="flex justify-center items-center bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/30 w-9 h-9 text-slate-500 hover:text-slate-900 transition disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw
              size={15}
              className={
                refreshingFund
                  ? "animate-spin"
                  : undefined
              }
              aria-hidden="true"
            />
          </button>
        ) : null}
      </header>

      {/* =================================================
          STATUS
      ================================================= */}

      <div
        className="
          flex flex-col sm:flex-row justify-between sm:items-center
          mb-5
          gap-3
        "
      >
        <div
          className={`
            inline-flex
            items-center
            gap-2
            w-fit
            px-3 py-1.5
            text-xs
            font-semibold
            border
            rounded-full
            ${statusConfig.className}
          `}
        >
          <StatusIcon
            size={14}
            aria-hidden="true"
          />

          {statusConfig.label}
        </div>

        <span
          className="
            text-slate-500 text-xs
          "
        >
          {values.progress.toFixed(
            0
          )}
          % funded
        </span>
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div
        className="
          mb-5
        "
      >
        <div
          className="
            flex justify-between items-center
            mb-2
            gap-3
          "
        >
          <span
            className="
              font-medium text-slate-500 text-xs
            "
          >
            Emergency-fund progress
          </span>

          <span
            className="
              font-semibold text-slate-900 text-xs text-right
            "
          >
            {formatCurrency(
              values.currentAmount,
              values.currency
            )}{" "}
            /{" "}
            {formatCurrency(
              values.targetAmount,
              values.currency
            )}
          </span>
        </div>

        <div
          className="
            overflow-hidden
            h-2.5
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            values.progress
          }
          aria-valuetext={`${values.progress.toFixed(
            0
          )}% funded`}
          aria-label="Emergency fund progress"
        >
          <div
            className="
              h-full
              bg-slate-900
              rounded-full
              transition-all duration-500
            "
            style={{
              width: `${values.progress}%`,
            }}
          /
          >
        </div>
      </div>

      {/* =================================================
          INSIGHTS
      ================================================= */}

      {insights.length > 0 ? (
        <div
          className="
            grid sm:grid-cols-2
            gap-3
          "
          aria-live="polite"
        >
          {insights.map(
            (
              insight,
              index
            ) => (
              <Insight
                key={`${insight.title}-${index}`}
                icon={
                  insight.icon
                }
                title={
                  insight.title
                }
                description={
                  insight.description
                }
                tone={
                  insight.tone
                }
              />
            )
          )}
        </div>
      ) : (
        <EmptyInsights />
      )}

      {/* =================================================
          FUNDING SUMMARY
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          mt-4
          gap-3
        "
      >
        <div
          className="
            p-3
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              text-[11px] text-slate-500
            "
          >
            Current coverage
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {values.coverageMonths.toFixed(
              1
            )}{" "}
            months
          </p>
        </div>

        <div
          className="
            p-3
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              text-[11px] text-slate-500
            "
          >
            Remaining
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {values.fundingGap >
            0
              ? formatCurrency(
                  values.fundingGap,
                  values.currency
                )
              : "Target reached"}
          </p>
        </div>

        <div
          className="
            p-3
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              text-[11px] text-slate-500
            "
          >
            Suggested monthly saving
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {values.recommendedContribution >
            0
              ? formatCurrency(
                  values.recommendedContribution,
                  values.currency
                )
              : "—"}
          </p>
        </div>
      </div>

      {/* =================================================
          REFRESHING
      ================================================= */}

      {refreshingFund ? (
        <div
          className="
            flex justify-center items-center
            mt-4
            text-[11px] text-slate-400
            gap-2
          "
          aria-live="polite"
        >
          <RefreshCw
            size={12}
            className="
              animate-spin
            "
            aria-hidden="true"
          /
          >

          Updating
          emergency-fund
          intelligence...
        </div>
      ) : null}

      {/* =================================================
          LAST UPDATED
      ================================================= */}

      {values.updatedAt ? (
        <div
          className="
            flex items-center
            mt-4
            text-[11px] text-slate-400
            gap-2
          "
        >
          <Clock3
            size={12}
            aria-hidden="true"
          />

          <span>
            Insights updated{" "}
            {formatDate(
              values.updatedAt
            )}
          </span>
        </div>
      ) : null}
    </section>
  );
};

export default EmergencyFundInsights;