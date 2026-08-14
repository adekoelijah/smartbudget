import {
AlertTriangle,
CheckCircle2,
ShieldCheck,
Target,
TrendingUp,
} from "lucide-react";

/* =========================================================
SAFE HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
const number = Number(value);

return Number.isFinite(number)
? number
: fallback;
};

const clamp = (value, min = 0, max = 100) =>
Math.min(
max,
Math.max(min, toNumber(value))
);

const formatCurrency = (
value,
currency = "NGN"
) => {
const amount = toNumber(value);

try {
return new Intl.NumberFormat("en-NG", {
style: "currency",
currency,
maximumFractionDigits: 0,
}).format(amount);
} catch {
return `${currency} ${amount.toLocaleString()}`;
}
};

const formatMonths = (value) => {
const months = toNumber(value);

if (months === 0) {
return "0 months";
}

return `${months.toFixed(
    months >= 10 ? 0 : 1
  )} months`;
};

/* =========================================================
COVERAGE STATUS
========================================================= */

const getCoverageStatus = ({
monthsCovered,
recommendedMonths,
targetMonths,
}) => {
const covered = toNumber(monthsCovered);
const recommended = toNumber(
recommendedMonths,
6
);
const target = toNumber(
targetMonths,
recommended
);

if (covered >= target) {
return {
key: "excellent",
label: "Strong coverage",
description:
"Your emergency fund provides a strong financial safety buffer.",
icon: ShieldCheck,
className:
"border-emerald-200 bg-emerald-50 text-emerald-700",
progressClass:
"bg-emerald-600",
};
}

if (covered >= recommended) {
return {
key: "healthy",
label: "Healthy coverage",
description:
"Your emergency fund is within the recommended safety range.",
icon: CheckCircle2,
className:
"border-blue-200 bg-blue-50 text-blue-700",
progressClass:
"bg-blue-600",
};
}

if (covered >= recommended * 0.5) {
return {
key: "building",
label: "Building coverage",
description:
"You have started building your safety buffer, but more coverage is recommended.",
icon: TrendingUp,
className:
"border-amber-200 bg-amber-50 text-amber-700",
progressClass:
"bg-amber-500",
};
}

return {
key: "low",
label: "Low coverage",
description:
"Your emergency fund currently provides limited protection against unexpected expenses.",
icon: AlertTriangle,
className:
"border-red-200 bg-red-50 text-red-700",
progressClass:
"bg-red-500",
};
};

/* =========================================================
METRIC
========================================================= */

const CoverageMetric = ({
label,
value,
description,
}) => (

  <div
    className="
      p-4
      bg-white
      border border-slate-200 rounded-xl
    "
  >
    <p
      className="
        font-medium text-slate-500 text-xs
      "
    >
      {label}
    </p>

```
<p
  className="
    mt-1
    font-bold text-slate-900 text-base
  "
>
  {value}
</p>

{description ? (
  <p
    className="
      mt-1
      text-slate-500 text-xs leading-5
    "
  >
    {description}
  </p>
) : null}
```

  </div>
);

/* =========================================================
MAIN COMPONENT
========================================================= */

const EmergencyFundCoverage = ({
currentAmount = 0,

monthlyExpenses = 0,

monthsCovered,

recommendedMonths = 6,

targetMonths,

targetAmount,

currency = "NGN",

title = "Emergency fund coverage",

description =
"See how long your current emergency fund could cover your essential expenses.",

className = "",
}) => {
/* =======================================================
DERIVED VALUES
======================================================= */

const current = toNumber(
currentAmount
);

const expenses = toNumber(
monthlyExpenses
);

const recommended =
Math.max(
1,
toNumber(
recommendedMonths,
6
)
);

const target =
Math.max(
recommended,
toNumber(
targetMonths,
recommended
)
);

const calculatedMonths =
expenses > 0
? current / expenses
: 0;

const coverageMonths =
monthsCovered !== undefined &&
monthsCovered !== null
? toNumber(monthsCovered)
: calculatedMonths;

const calculatedTargetAmount =
expenses * target;

const resolvedTargetAmount =
targetAmount !== undefined &&
targetAmount !== null
? toNumber(targetAmount)
: calculatedTargetAmount;

const coverageProgress =
target > 0
? clamp(
(coverageMonths / target) *
100
)
: 0;

const remainingCoverageMonths =
Math.max(
target - coverageMonths,
0
);

const coverageGap =
Math.max(
resolvedTargetAmount -
current,
0
);

const status =
getCoverageStatus({
monthsCovered:
coverageMonths,
recommendedMonths:
recommended,
targetMonths:
target,
});

const StatusIcon =
status.icon;

/* =======================================================
RENDER
======================================================= */

return (
<section
aria-labelledby="emergency-fund-coverage-title"
className={`         rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
>
{/* ===================================================
HEADER
=================================================== */}

```
  <header
    className="
      flex items-start
      gap-3
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
      <ShieldCheck
        size={18}
        className="
          text-slate-700
        "
        /
      >
    </div>

    <div
      className="
        flex-1
        min-w-0
      "
    >
      <h3
        id="emergency-fund-coverage-title"
        className="
          font-bold text-slate-900 text-sm
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-slate-500 text-xs leading-5
        "
      >
        {description}
      </p>
    </div>
  </header>

  {/* ===================================================
      STATUS
  =================================================== */}

  <div
    className={`
      inline-flex
      items-center
      gap-2
      mt-5
      px-3
      py-1.5
      border
      rounded-full
      font-semibold
      text-xs
      ${status.className}
    `}
  >
    <StatusIcon size={14} />

    {status.label}
  </div>

  {/* ===================================================
      COVERAGE HERO
  =================================================== */}

  <div
    className="
      mt-5 p-5
      bg-slate-50
      border border-slate-200 rounded-xl
    "
  >
    <div
      className="
        flex justify-between items-end
        gap-4
      "
    >
      <div>
        <p
          className="
            font-medium text-slate-500 text-xs
          "
        >
          Current coverage
        </p>

        <p
          className="
            mt-1
            font-bold text-slate-900 text-2xl tracking-tight
          "
        >
          {formatMonths(
            coverageMonths
          )}
        </p>
      </div>

      <div
        className="
          text-right
        "
      >
        <p
          className="
            text-slate-500 text-xs
          "
        >
          Target
        </p>

        <p
          className="
            mt-1
            font-semibold text-slate-800 text-sm
          "
        >
          {target} months
        </p>
      </div>
    </div>

    {/* =================================================
        PROGRESS
    ================================================= */}

    <div
      className="
        mt-4
      "
    >
      <div
        className="
          overflow-hidden
          h-2.5
          bg-slate-200
          rounded-full
        "
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={coverageProgress}
        aria-label="Emergency fund coverage progress"
      >
        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-500
            ${status.progressClass}
          `}
          style={{
            width: `${coverageProgress}%`,
          }}
        />
      </div>

      <div
        className="
          flex justify-between items-center
          mt-2
          gap-3
        "
      >
        <span
          className="
            text-[11px] text-slate-500
          "
        >
          {coverageProgress.toFixed(0)}%
          of target
        </span>

        <span
          className="
            font-medium text-[11px] text-slate-700
          "
        >
          {remainingCoverageMonths > 0
            ? `${remainingCoverageMonths.toFixed(
                remainingCoverageMonths >= 10
                  ? 0
                  : 1
              )} months to target`
            : "Target reached"}
        </span>
      </div>
    </div>
  </div>

  {/* ===================================================
      METRICS
  =================================================== */}

  <div
    className="
      grid grid-cols-1 sm:grid-cols-2
      mt-4
      gap-3
    "
  >
    <CoverageMetric
      label="Emergency fund"
      value={formatCurrency(
        current,
        currency
      )}
      description="Current available emergency savings"
    />

    <CoverageMetric
      label="Monthly expenses"
      value={formatCurrency(
        expenses,
        currency
      )}
      description="Essential expenses used for coverage"
    />

    <CoverageMetric
      label="Recommended target"
      value={formatCurrency(
        resolvedTargetAmount,
        currency
      )}
      description={`${target} months of essential expenses`}
    />

    <CoverageMetric
      label="Coverage gap"
      value={
        coverageGap > 0
          ? formatCurrency(
              coverageGap,
              currency
            )
          : "Target reached"
      }
      description={
        coverageGap > 0
          ? "Additional savings needed"
          : "No additional amount required"
      }
    />
  </div>

  {/* ===================================================
      INTERPRETATION
  =================================================== */}

  <div
    className="
      flex items-start
      mt-4 p-4
      bg-slate-50
      border border-slate-200 rounded-xl
      gap-3
    "
  >
    <div
      className="
        flex justify-center items-center
        w-8 h-8
        bg-white
        border border-slate-200 rounded-lg
        shrink-0
      "
      aria-hidden="true"
    >
      <Target
        size={15}
        className="
          text-slate-600
        "
        /
      >
    </div>

    <div>
      <p
        className="
          font-semibold text-slate-800 text-xs
        "
      >
        Coverage assessment
      </p>

      <p
        className="
          mt-1
          text-slate-500 text-xs leading-5
        "
      >
        {status.description}
      </p>
    </div>
  </div>
</section>


);
};

export default EmergencyFundCoverage;
