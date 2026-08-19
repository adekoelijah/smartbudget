import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  formatEmergencyCurrency,
  formatMonths,
  formatPercentage,
} from "../../../../utils/smartSave/emergencyFundFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_RECOMMENDED_MONTHS = 6;

const MIN_TARGET_MONTHS = 1;

/* =========================================================
   SAFE HELPERS
========================================================= */

const toFiniteNumber = (
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
    toFiniteNumber(value, fallback)
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
      toFiniteNumber(value)
    )
  );

const normalizeCurrency = (
  currency
) => {
  if (
    typeof currency !== "string" ||
    !currency.trim()
  ) {
    return DEFAULT_CURRENCY;
  }

  return currency
    .trim()
    .toUpperCase();
};

const normalizeTargetMonths = (
  value,
  fallback = DEFAULT_RECOMMENDED_MONTHS
) => {
  const normalizedFallback =
    Math.max(
      MIN_TARGET_MONTHS,
      toFiniteNumber(
        fallback,
        DEFAULT_RECOMMENDED_MONTHS
      )
    );

  const normalizedValue =
    toFiniteNumber(
      value,
      normalizedFallback
    );

  return Math.max(
    MIN_TARGET_MONTHS,
    normalizedValue
  );
};

/* =========================================================
   COVERAGE STATUS
========================================================= */

const getCoverageStatus = ({
  monthsCovered,
  recommendedMonths,
  targetMonths,
}) => {
  const covered =
    toNonNegativeNumber(
      monthsCovered
    );

  const recommended =
    normalizeTargetMonths(
      recommendedMonths
    );

  const target =
    Math.max(
      recommended,
      normalizeTargetMonths(
        targetMonths,
        recommended
      )
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

  if (
    covered >=
    recommended * 0.5
  ) {
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
   COVERAGE METRIC
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
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmergencyFundCoverage = ({
  currentAmount = 0,
  monthlyExpenses = 0,
  monthsCovered,
  recommendedMonths =
    DEFAULT_RECOMMENDED_MONTHS,
  targetMonths,
  targetAmount,
  currency = DEFAULT_CURRENCY,
  title = "Emergency fund coverage",
  description =
    "See how long your current emergency fund could cover your essential expenses.",
  className = "",
  id = "emergency-fund-coverage",
}) => {
  /* =======================================================
     NORMALIZED VALUES
  ======================================================= */

  const current =
    toNonNegativeNumber(
      currentAmount
    );

  const expenses =
    toNonNegativeNumber(
      monthlyExpenses
    );

  const recommended =
    normalizeTargetMonths(
      recommendedMonths
    );

  const target =
    Math.max(
      recommended,
      normalizeTargetMonths(
        targetMonths,
        recommended
      )
    );

  const normalizedCurrency =
    normalizeCurrency(currency);

  /* =======================================================
     COVERAGE CALCULATION
  ======================================================= */

  const calculatedMonths =
    expenses > 0
      ? current / expenses
      : 0;

  const coverageMonths =
    monthsCovered !== undefined &&
    monthsCovered !== null
      ? toNonNegativeNumber(
          monthsCovered
        )
      : calculatedMonths;

  const calculatedTargetAmount =
    expenses * target;

  const resolvedTargetAmount =
    targetAmount !== undefined &&
    targetAmount !== null
      ? toNonNegativeNumber(
          targetAmount
        )
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

  const targetReached =
    coverageMonths >= target ||
    coverageGap <= 0;

  /* =======================================================
     STATUS
  ======================================================= */

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
     DERIVED ACCESSIBILITY IDS
  ======================================================= */

  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const progressLabelId = `${id}-progress-label`;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={`
        rounded-2xl
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
            id={titleId}
            className="
              font-bold text-slate-900 text-sm
            "
          >
            {title}
          </h3>

          <p
            id={descriptionId}
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
        role="status"
        aria-label={`Emergency fund status: ${status.label}`}
      >
        <StatusIcon
          size={14}
          aria-hidden="true"
        />

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
              {target}{" "}
              {target === 1
                ? "month"
                : "months"}
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
          <span
            id={progressLabelId}
            className="
              sr-only
            "
          >
            Emergency fund coverage:
            {" "}
            {formatPercentage(
              coverageProgress
            )}
          </span>

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
            aria-valuenow={
              coverageProgress
            }
            aria-valuetext={`${formatPercentage(
              coverageProgress
            )} of target`}
            aria-labelledby={
              progressLabelId
            }
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
              {formatPercentage(
                coverageProgress
              )}{" "}
              of target
            </span>

            <span
              className="
                font-medium text-[11px] text-slate-700
              "
            >
              {targetReached
                ? "Target reached"
                : `${formatMonths(
                    remainingCoverageMonths
                  )} to target`}
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
          value={formatEmergencyCurrency(
            current,
            normalizedCurrency
          )}
          description="Current available emergency savings"
        />

        <CoverageMetric
          label="Monthly expenses"
          value={formatEmergencyCurrency(
            expenses,
            normalizedCurrency
          )}
          description="Essential expenses used for coverage"
        />

        <CoverageMetric
          label="Recommended target"
          value={formatEmergencyCurrency(
            resolvedTargetAmount,
            normalizedCurrency
          )}
          description={`${target} months of essential expenses`}
        />

        <CoverageMetric
          label="Coverage gap"
          value={
            coverageGap > 0
              ? formatEmergencyCurrency(
                  coverageGap,
                  normalizedCurrency
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
        role="note"
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