import {
AlertCircle,
RefreshCw,
ShieldCheck,
} from "lucide-react";

import {
useCallback,
useMemo,
} from "react";

import useEmergencyFund from "../../../../hooks/useEmergencyFund";

import EmergencyFundCalculator from "./EmergencyFundCalculator";
import EmergencyFundCoverage from "./EmergencyFundCoverage";
import EmergencyFundInsights from "./EmergencyFundInsights";
import EmergencyFundProgress from "./EmergencyFundProgress";
import EmergencyFundRecommendation from "./EmergencyFundRecommendation";

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

/**

* Safely unwrap the different response shapes that may
* come from the service/hook layer.
  */
  const resolveData = (value) => {
  if (!value) {
  return {};
  }

if (
typeof value === "object" &&
!Array.isArray(value)
) {
if (
value.data &&
typeof value.data === "object" &&
!Array.isArray(value.data)
) {
return {
...value.data,
...value,
};
}


return value;


}

return {};
};

/**

* Resolve arrays without making assumptions about the
* exact service response wrapper.
  */
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

  if (Array.isArray(value?.insights)) {
  return value.insights;
  }

  if (Array.isArray(value?.recommendations)) {
  return value.recommendations;
  }
  }

return [];
};

/* =========================================================
ERROR MESSAGE
========================================================= */

const getErrorMessage = (
error
) => {
if (!error) {
return "";
}

if (typeof error === "string") {
return error;
}

return (
error?.message ||
error?.error ||
error?.data?.message ||
"We could not load your emergency fund information."
);
};

/* =========================================================
MAIN COMPONENT
========================================================= */

const EmergencyFundCard = ({
/*

* Optional contextual identifiers.
*
* These are passed to the established hook rather
* than being used to construct API requests here.
  */
  goalId = null,

planId = null,

/*

* Optional externally supplied emergency-fund data.
*
* Useful when a parent dashboard already has the
* emergency-fund state available.
  */
  emergencyFund: suppliedEmergencyFund = null,

/*

* Display options.
  */
  title = "Emergency Fund",

description =
"Build a financial safety buffer that can help protect you from unexpected expenses.",

currency = "NGN",

/*

* Recommended coverage defaults.
*
* The backend/service values remain authoritative when
* they are available.
  */
  recommendedMonths = 6,

/*

* Optional callbacks.
  */
  onCreateFund,

onContribute,

onAction,

onRefresh,

className = "",

/*

* Component visibility.
  */
  showCalculator = true,

showCoverage = true,

showProgress = true,

showRecommendation = true,

showInsights = true,

showRefresh = true,
}) => {
/* =======================================================
HOOK
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
hookEmergencyFund,


data,

loading = false,

isLoading = false,

refreshing = false,

isRefreshing = false,

error,

refresh,

refetch,


} = emergencyFundState;

/* =======================================================
RESOLVE SOURCE
======================================================= */

const rawData = useMemo(
() =>
resolveData(
firstDefined(
suppliedEmergencyFund,
hookEmergencyFund,
data?.emergencyFund,
data
)
),
[
suppliedEmergencyFund,
hookEmergencyFund,
data,
]
);

/* =======================================================
NORMALIZED EMERGENCY FUND VALUES
======================================================= */
const values = (() => {
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

  const monthlyExpenses = toNumber(
    firstDefined(
      rawData.monthlyExpenses,
      rawData.monthlyEssentialExpenses,
      rawData.essentialMonthlyExpenses,
      rawData.expenses?.monthly
    )
  );

  const targetAmount = toNumber(
    firstDefined(
      rawData.targetAmount,
      rawData.emergencyFundTarget,
      rawData.recommendedAmount,
      rawData.goalAmount
    )
  );

  const resolvedRecommendedMonths = Math.max(
    1,
    toNumber(
      firstDefined(
        rawData.recommendedMonths,
        rawData.targetMonths,
        rawData.coverageTargetMonths,
        recommendedMonths
      ),
      recommendedMonths
    )
  );

  const targetMonths = Math.max(
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

  const monthsCovered = toNumber(
    firstDefined(
      rawData.monthsCovered,
      rawData.coverageMonths,
      rawData.monthsOfCoverage,
      monthlyExpenses > 0
        ? currentAmount / monthlyExpenses
        : 0
    )
  );

  const resolvedTargetAmount =
    targetAmount > 0
      ? targetAmount
      : monthlyExpenses * targetMonths;

  const remainingAmount = Math.max(
    0,
    toNumber(
      firstDefined(
        rawData.remainingAmount,
        rawData.amountRemaining,
        resolvedTargetAmount - currentAmount
      )
    )
  );

  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      toNumber(
        firstDefined(
          rawData.progressPercentage,
          rawData.progressPercent,
          rawData.progress?.percentage,
          resolvedTargetAmount > 0
            ? (currentAmount / resolvedTargetAmount) * 100
            : 0
        )
      )
    )
  );

  const recommendedContribution = toNumber(
    firstDefined(
      rawData.recommendedContribution,
      rawData.requiredContribution,
      rawData.monthlyContribution,
      rawData.contributionAmount
    )
  );

  const contributionFrequency = firstDefined(
    rawData.contributionFrequency,
    rawData.frequency,
    rawData.interval
  );

  const status = firstDefined(
    rawData.status,
    rawData.health,
    rawData.coverageStatus
  );

  const recommendation = firstDefined(
    rawData.recommendation,
    rawData.primaryRecommendation
  );

  const insights = resolveArray(
    rawData.insights,
    rawData.recommendations,
    data?.insights
  );

  const projection = firstDefined(
    rawData.projection,
    rawData.forecast,
    rawData.savingsProjection
  );

  return {
    ...rawData,

    currentAmount,

    monthlyExpenses,

    targetAmount: resolvedTargetAmount,

    targetMonths,

    recommendedMonths: resolvedRecommendedMonths,

    monthsCovered,

    remainingAmount,

    progressPercentage,

    recommendedContribution,

    contributionFrequency,

    status,

    recommendation,

    insights,

    projection,

    currency: firstDefined(
      rawData.currency,
      currency
    ),
  };
})();
/* =======================================================
LOADING STATE
======================================================= */

const isBusy =
Boolean(loading) ||
Boolean(isLoading);

const isRefreshingFund =
Boolean(refreshing) ||
Boolean(isRefreshing);

/* =======================================================
REFRESH
======================================================= */

const refreshFund =
useCallback(
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
    }

    if (
      typeof onRefresh ===
      "function"
    ) {
      await onRefresh(
        result
      );
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

const handleRetry =
useCallback(() => {
void refreshFund();
}, [
refreshFund,
]);

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
}, [
  onCreateFund,
]);


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


  onContribute(values);
}, [
  onContribute,
  values,
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
      values,
      ...args
    );
  },
  [
    onAction,
    values,
  ]
);

/* =======================================================
ERROR
======================================================= */

const errorMessage =
useMemo(
() =>
getErrorMessage(
error
),
[error]
);

/* =======================================================
RENDER
======================================================= */

return (
<section
aria-labelledby="emergency-fund-card-title"
className={`         rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        overflow-hidden
        ${className}
      `}
>
{/* ===================================================
CARD HEADER
=================================================== */}

```
  <header
    className="
      flex flex-col sm:flex-row sm:justify-between sm:items-start
      p-5
      border-slate-100 border-b
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
          w-10 h-10
          bg-slate-100
          rounded-xl
          shrink-0
        "
        aria-hidden="true"
      >
        <ShieldCheck
          size={20}
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
        <h2
          id="emergency-fund-card-title"
          className="
            font-bold text-slate-900 text-base sm:text-lg tracking-tight
          "
        >
          {title}
        </h2>

        <p
          className="
            max-w-2xl
            mt-1
            text-slate-500 text-xs sm:text-sm leading-5
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
          void refreshFund()
        }
        disabled={
          isRefreshingFund
        }
        className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-9 font-medium text-slate-700 text-xs transition disabled:cursor-not-allowed shrink-0"
        aria-label={
          isRefreshingFund
            ? "Refreshing emergency fund"
            : "Refresh emergency fund"
        }
      >
        <RefreshCw
          size={14}
          className={
            isRefreshingFund
              ? "animate-spin"
              : ""
          }
        />

        {isRefreshingFund
          ? "Refreshing..."
          : "Refresh"}
      </button>
    ) : null}
  </header>

  {/* ===================================================
      GLOBAL ERROR
  =================================================== */}

  {error &&
  !isBusy ? (
    <div
      className="
        flex items-start
        mx-5 mt-5 p-4
        bg-red-50
        border border-red-200 rounded-xl
        gap-3
      "
      role="alert"
    >
      <AlertCircle
        size={18}
        className="
          mt-0.5
          text-red-600
          shrink-0
        "
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
          Emergency fund data unavailable
        </p>

        <p
          className="
            mt-1
            text-red-700 text-xs leading-5
          "
        >
          {errorMessage}
        </p>

        {(typeof refresh ===
          "function" ||
          typeof refetch ===
            "function") ? (
          <button
            type="button"
            onClick={
              handleRetry
            }
            disabled={
              isRefreshingFund
            }
            className="
              inline-flex items-center
              mt-3 px-3 py-2
              font-semibold text-red-700 text-xs
              bg-white hover:bg-red-100
              border border-red-200 rounded-lg
              disabled:opacity-50
              gap-2
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

            Try again
          </button>
        ) : null}
      </div>
    </div>
  ) : null}

  {/* ===================================================
      MAIN CONTENT
  =================================================== */}

  <div
    className="
      space-y-5 p-5
    "
  >
    {/* =================================================
        PROGRESS
    ================================================= */}

    {showProgress ? (
      <EmergencyFundProgress
        currentAmount={
          values.currentAmount
        }
        targetAmount={
          values.targetAmount
        }
        progressPercentage={
          values.progressPercentage
        }
        monthlyExpenses={
          values.monthlyExpenses
        }
        monthsCovered={
          values.monthsCovered
        }
        recommendedMonths={
          values.recommendedMonths
        }
        currency={
          values.currency
        }
        status={
          values.status
        }
        loading={
          isBusy
        }
        onContribute={
          typeof onContribute ===
          "function"
            ? handleContribute
            : undefined
        }
      />
    ) : null}

    {/* =================================================
        COVERAGE
    ================================================= */}

    {showCoverage ? (
      <EmergencyFundCoverage
        currentAmount={
          values.currentAmount
        }
        monthlyExpenses={
          values.monthlyExpenses
        }
        monthsCovered={
          values.monthsCovered
        }
        recommendedMonths={
          values.recommendedMonths
        }
        targetMonths={
          values.targetMonths
        }
        targetAmount={
          values.targetAmount
        }
        currency={
          values.currency
        }
      />
    ) : null}

    {/* =================================================
        RECOMMENDATION
    ================================================= */}

    {showRecommendation ? (
      <EmergencyFundRecommendation
        recommendation={
          values.recommendation
        }
        currentAmount={
          values.currentAmount
        }
        targetAmount={
          values.targetAmount
        }
        remainingAmount={
          values.remainingAmount
        }
        monthsCovered={
          values.monthsCovered
        }
        recommendedMonths={
          values.recommendedMonths
        }
        currency={
          values.currency
        }
        onAction={
          typeof onAction ===
          "function"
            ? handleAction
            : undefined
        }
      />
    ) : null}

    {/* =================================================
        INSIGHTS
    ================================================= */}

    {showInsights ? (
      <EmergencyFundInsights
        insights={
          values.insights
        }
        emergencyFund={
          values
        }
        currency={
          values.currency
        }
        loading={
          isBusy
        }
        onRefresh={
          refreshFund
        }
      />
    ) : null}

    {/* =================================================
        CALCULATOR
    ================================================= */}

    {showCalculator ? (
      <EmergencyFundCalculator
        currentAmount={
          values.currentAmount
        }
        monthlyExpenses={
          values.monthlyExpenses
        }
        targetAmount={
          values.targetAmount
        }
        recommendedMonths={
          values.recommendedMonths
        }
        currency={
          values.currency
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
    ) : null}
  </div>

  {/* ===================================================
      FOOTER
  =================================================== */}

  <footer
    className="
      flex flex-col sm:flex-row sm:justify-between sm:items-center
      px-5 py-3
      bg-slate-50
      border-slate-100 border-t
      gap-2
    "
  >
    <p
      className="
        text-[11px] text-slate-400 leading-5
      "
    >
      Emergency-fund calculations are based on
      the financial information currently available.
    </p>

    {isRefreshingFund ? (
      <span
        className="
          inline-flex items-center
          text-[11px] text-slate-500
          gap-1.5 shrink-0
        "
        aria-live="polite"
      >
        <RefreshCw
          size={12}
          className="
            animate-spin
          "
          /
        >

        Syncing
      </span>
    ) : null}
  </footer>
</section>


);
};

export default EmergencyFundCard;
