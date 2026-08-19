import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { useId } from "react";

import {
  formatCurrency,
} from "../../../../utils/smartSave/emergencyFundFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_RECOMMENDED_MONTHS = 6;
const DEFAULT_PRIORITY = "normal";

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Returns the first meaningful value.
 *
 * Empty strings are treated as missing.
 * Zero is intentionally preserved.
 */
const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

/**
 * Safely converts a value to a finite number.
 */
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
 * Converts a financial value to a safe
 * non-negative number.
 */
const normalizeNonNegativeNumber = (
  value,
  fallback = 0
) =>
  Math.max(
    0,
    toNumber(value, fallback)
  );

/**
 * Normalizes supported priority values.
 */
const normalizePriority = (value) => {
  const priority = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (
    priority === "critical" ||
    priority === "urgent" ||
    priority === "emergency"
  ) {
    return "critical";
  }

  if (
    priority === "high" ||
    priority === "danger"
  ) {
    return "high";
  }

  if (
    priority === "medium" ||
    priority === "moderate" ||
    priority === "recommended"
  ) {
    return "medium";
  }

  if (priority === "low") {
    return "low";
  }

  return DEFAULT_PRIORITY;
};

/* =========================================================
   PRIORITY CONFIG
========================================================= */

const PRIORITY_CONFIG = {
  critical: {
    label: "Priority action",
    icon: AlertTriangle,

    className:
      "border-red-200 bg-red-50 text-red-700",

    iconClassName:
      "bg-red-100 text-red-700",
  },

  high: {
    label: "High priority",
    icon: AlertTriangle,

    className:
      "border-amber-200 bg-amber-50 text-amber-700",

    iconClassName:
      "bg-amber-100 text-amber-700",
  },

  medium: {
    label: "Recommended",
    icon: TrendingUp,

    className:
      "border-blue-200 bg-blue-50 text-blue-700",

    iconClassName:
      "bg-blue-100 text-blue-700",
  },

  normal: {
    label: "Suggested action",
    icon: Lightbulb,

    className:
      "border-slate-200 bg-slate-50 text-slate-700",

    iconClassName:
      "bg-slate-100 text-slate-700",
  },

  low: {
    label: "Optional improvement",
    icon: CheckCircle2,

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    iconClassName:
      "bg-emerald-100 text-emerald-700",
  },
};

/* =========================================================
   DEFAULT RECOMMENDATION
========================================================= */

/**
 * Generates a UI fallback only when the backend does not
 * provide a recommendation.
 *
 * This is presentation logic, not financial business logic.
 */
const buildDefaultRecommendation = ({
  currentAmount,
  targetAmount,
  remainingAmount,
  monthsCovered,
  recommendedMonths,
}) => {
  const current = normalizeNonNegativeNumber(
    currentAmount
  );

  const target = normalizeNonNegativeNumber(
    targetAmount
  );

  const calculatedRemaining = Math.max(
    target - current,
    0
  );

  const remaining =
    remainingAmount !== undefined &&
    remainingAmount !== null
      ? normalizeNonNegativeNumber(
          remainingAmount
        )
      : calculatedRemaining;

  const months =
    monthsCovered !== undefined &&
    monthsCovered !== null
      ? normalizeNonNegativeNumber(
          monthsCovered
        )
      : null;

  const recommended = Math.max(
    1,
    normalizeNonNegativeNumber(
      recommendedMonths,
      DEFAULT_RECOMMENDED_MONTHS
    )
  );

  /*
   * Target already reached.
   */
  if (remaining <= 0) {
    return {
      title:
        "Maintain your emergency fund",

      message:
        "Your emergency fund has reached its current target. Maintain this buffer and replenish it after any withdrawal.",

      action:
        "Keep contributing consistently",

      priority: "low",
    };
  }

  /*
   * Coverage is unknown.
   *
   * Do not pretend that zero months means zero
   * coverage when the backend simply did not
   * provide the calculation.
   */
  if (months === null) {
    return {
      title:
        "Continue building your emergency fund",

      message:
        "Keep making consistent contributions toward your emergency-fund target. SmartSave will refine this recommendation as more coverage information becomes available.",

      action:
        "Continue your savings plan",

      priority: "normal",
    };
  }

  /*
   * Very limited coverage.
   */
  if (months <= 1) {
    return {
      title:
        "Build your emergency buffer",

      message:
        "Your current emergency savings provide limited protection against unexpected expenses. Prioritize building a basic cash reserve before increasing discretionary savings goals.",

      action:
        "Start with a consistent contribution",

      priority: "high",
    };
  }

  /*
   * Below recommended coverage.
   */
  if (months < recommended) {
    return {
      title:
        "Increase your emergency coverage",

      message:
        `You currently have about ${months.toFixed(
          1
        )} months of expenses covered. Building toward ${recommended} months would provide a stronger financial safety buffer.`,

      action:
        "Increase your emergency-fund contributions",

      priority: "medium",
    };
  }

  /*
   * Good coverage but target is not reached.
   */
  return {
    title:
      "Strengthen your financial safety net",

    message:
      "Your emergency fund is progressing well. Continue contributing until you reach your preferred safety target.",

    action:
      "Continue your savings plan",

    priority: "normal",
  };
};

/* =========================================================
   ACTION BUTTON
========================================================= */

const RecommendationAction = ({
  label,
  onAction,
}) => {
  if (typeof onAction !== "function") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onAction}
      className="
        inline-flex justify-center items-center
        min-h-9
        px-3.5 py-2
        font-semibold text-white text-xs
        bg-slate-900 hover:bg-slate-800 active:bg-slate-950
        rounded-lg focus:outline-none
        focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
        transition
        gap-2
      "
    >
      {label}

      <ArrowRight
        size={14}
        aria-hidden="true"
      />
    </button>
  );
};

/* =========================================================
   FINANCIAL METRIC
========================================================= */

const FinancialMetric = ({
  label,
  value,
}) => (
  <div
    className="
      p-3
      bg-slate-50
      border border-slate-200 rounded-xl
    "
  >
    <p
      className="
        text-[11px] text-slate-500
      "
    >
      {label}
    </p>

    <p
      className="
        mt-1
        font-semibold text-slate-900 text-sm
      "
    >
      {value}
    </p>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmergencyFundRecommendation = ({
  recommendation = null,

  currentAmount = 0,

  targetAmount = 0,

  remainingAmount,

  monthsCovered = null,

  recommendedMonths =
    DEFAULT_RECOMMENDED_MONTHS,

  currency = DEFAULT_CURRENCY,

  title =
    "Emergency fund recommendation",

  description =
    "A practical next step based on your current emergency-fund position.",

  onAction,

  actionLabel,

  className = "",
}) => {
  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  const componentId = useId();

  const titleId =
    `emergency-fund-recommendation-title-${componentId}`;

  /* =======================================================
     NORMALIZE INPUT DATA
     
     IMPORTANT:
     This is intentionally NOT wrapped in useMemo.
     
     These calculations are cheap, deterministic and
     synchronous. useMemo would add dependency-management
     complexity without meaningful performance benefit.
  ======================================================= */

  const resolvedRecommendation =
    recommendation &&
    typeof recommendation === "object" &&
    !Array.isArray(recommendation)
      ? recommendation
      : null;

  /* =======================================================
     FALLBACK RECOMMENDATION
  ======================================================= */

  const fallback =
    buildDefaultRecommendation({
      currentAmount,
      targetAmount,
      remainingAmount,
      monthsCovered,
      recommendedMonths,
    });

  /* =======================================================
     RECOMMENDATION CONTENT
  ======================================================= */

  const recommendationTitle =
    firstDefined(
      resolvedRecommendation?.title,
      resolvedRecommendation?.heading,
      resolvedRecommendation?.name,
      fallback.title
    );

  const message =
    firstDefined(
      resolvedRecommendation?.message,
      resolvedRecommendation?.description,
      resolvedRecommendation?.explanation,
      resolvedRecommendation?.reason,
      fallback.message
    );

  const action =
    firstDefined(
      resolvedRecommendation?.action,
      resolvedRecommendation?.actionLabel,
      resolvedRecommendation?.recommendedAction,
      actionLabel,
      fallback.action
    );

  const priority = normalizePriority(
    firstDefined(
      resolvedRecommendation?.priority,
      resolvedRecommendation?.urgency,
      resolvedRecommendation?.severity,
      fallback.priority
    )
  );

  /* =======================================================
     FINANCIAL VALUES
  ======================================================= */

  const current = normalizeNonNegativeNumber(
    firstDefined(
      resolvedRecommendation?.currentAmount,
      currentAmount,
      0
    )
  );

  const target = normalizeNonNegativeNumber(
    firstDefined(
      resolvedRecommendation?.targetAmount,
      targetAmount,
      0
    )
  );

  const calculatedRemaining = Math.max(
    target - current,
    0
  );

  const resolvedRemaining =
    firstDefined(
      resolvedRecommendation?.remainingAmount,
      remainingAmount
    );

  const remaining =
    resolvedRemaining !== undefined
      ? normalizeNonNegativeNumber(
          resolvedRemaining
        )
      : calculatedRemaining;

  /* =======================================================
     PRIORITY CONFIG
  ======================================================= */

  const config =
    PRIORITY_CONFIG[priority] ||
    PRIORITY_CONFIG[DEFAULT_PRIORITY];

  const PriorityIcon = config.icon;

  /* =======================================================
     ACTION BUTTON
  ======================================================= */

  const buttonLabel =
    firstDefined(
      resolvedRecommendation?.buttonLabel,
      resolvedRecommendation?.ctaLabel,
      actionLabel,
      "Take action"
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby={titleId}
      className={`
        rounded-2xl
        border
        border-slate-200
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
          <Lightbulb
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
          PRIORITY
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
          ${config.className}
        `}
        role="status"
        aria-label={`Recommendation priority: ${config.label}`}
      >
        <PriorityIcon
          size={14}
          aria-hidden="true"
        />

        {config.label}
      </div>

      {/* ===================================================
          RECOMMENDATION BODY
      =================================================== */}

      <div
        className="
          mt-4 p-4
          border border-slate-200 rounded-xl
        "
      >
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className={`
              flex
              justify-center
              items-center
              w-9
              h-9
              rounded-lg
              shrink-0
              ${config.iconClassName}
            `}
            aria-hidden="true"
          >
            <PriorityIcon size={17} />
          </div>

          <div
            className="
              flex-1
              min-w-0
            "
          >
            <h4
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              {recommendationTitle}
            </h4>

            <p
              className="
                mt-1.5
                text-slate-600 text-xs leading-5
              "
            >
              {message}
            </p>
          </div>
        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-4 pt-4
            border-slate-100 border-t
            gap-3
          "
        >
          <div
            className="
              flex items-center
              text-slate-500
              gap-2
            "
          >
            <Target
              size={14}
              aria-hidden="true"
            />

            <span
              className="
                font-medium text-xs
              "
            >
              {action}
            </span>
          </div>

          <RecommendationAction
            label={buttonLabel}
            onAction={onAction}
          />
        </div>
      </div>

      {/* ===================================================
          FINANCIAL CONTEXT
      =================================================== */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          mt-4
          gap-3
        "
      >
        <FinancialMetric
          label="Current fund"
          value={formatCurrency(
            current,
            currency
          )}
        />

        <FinancialMetric
          label="Target"
          value={formatCurrency(
            target,
            currency
          )}
        />

        <FinancialMetric
          label="Remaining"
          value={
            remaining > 0
              ? formatCurrency(
                  remaining,
                  currency
                )
              : "Target reached"
          }
        />
      </div>

      {/* ===================================================
          SAFETY NOTE
      =================================================== */}

      <div
        className="
          flex items-start
          mt-4 p-3.5
          bg-slate-50
          border border-slate-200 rounded-xl
          gap-3
        "
      >
        <ShieldCheck
          size={15}
          className="
            mt-0.5
            text-slate-500
            shrink-0
          "
          aria-hidden="true"
        /
        >

        <p
          className="
            text-[11px] text-slate-500 leading-5
          "
        >
          Recommendations are based on the
          emergency-fund data currently available
          in SmartBudget. Your ideal reserve may
          vary depending on income stability,
          essential expenses, dependants, and
          financial obligations.
        </p>
      </div>
    </section>
  );
};

export default EmergencyFundRecommendation;