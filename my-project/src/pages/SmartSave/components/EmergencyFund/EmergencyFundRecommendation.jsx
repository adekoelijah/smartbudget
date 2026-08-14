
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
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

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
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

/* =========================================================
   PRIORITY NORMALIZER
========================================================= */

const normalizePriority = (value) => {
  const priority = String(value || "")
    .trim()
    .toLowerCase();

  if (
    priority.includes("critical") ||
    priority.includes("urgent")
  ) {
    return "critical";
  }

  if (
    priority.includes("high") ||
    priority.includes("danger")
  ) {
    return "high";
  }

  if (
    priority.includes("medium") ||
    priority.includes("moderate")
  ) {
    return "medium";
  }

  if (priority.includes("low")) {
    return "low";
  }

  return "normal";
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

const buildDefaultRecommendation = ({
  currentAmount,
  targetAmount,
  remainingAmount,
  monthsCovered,
  recommendedMonths,
}) => {
  const current = toNumber(currentAmount);

  const target = toNumber(targetAmount);

  const remaining = Math.max(
    0,
    toNumber(
      remainingAmount,
      target - current
    )
  );

  const months = toNumber(monthsCovered);

  const recommended = Math.max(
    1,
    toNumber(recommendedMonths, 6)
  );

  if (
    remaining <= 0 ||
    months >= recommended
  ) {
    return {
      title: "Maintain your emergency fund",

      message:
        "Your emergency fund is within the recommended coverage range. Focus on maintaining this buffer and replenish it after any withdrawal.",

      action:
        "Keep contributing consistently",

      priority: "low",
    };
  }

  if (months <= 1) {
    return {
      title: "Build your emergency buffer",

      message:
        "Your current emergency savings provide limited protection against unexpected expenses. Prioritize building a basic cash reserve before increasing discretionary savings goals.",

      action:
        "Start with a consistent contribution",

      priority: "high",
    };
  }

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
        bg-slate-900 hover:bg-slate-800
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
   MAIN COMPONENT
========================================================= */

const EmergencyFundRecommendation = ({
  recommendation = null,

  currentAmount = 0,

  targetAmount = 0,

  remainingAmount = 0,

  monthsCovered = 0,

  recommendedMonths = 6,

  currency = "NGN",

  title =
    "Emergency fund recommendation",

  description =
    "A practical next step based on your current emergency-fund position.",

  onAction,

  actionLabel,

  className = "",
}) => {
  /* =======================================================
     DEFAULT RECOMMENDATION
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
     RESOLVE RECOMMENDATION
  ======================================================= */

  const resolved =
    recommendation &&
    typeof recommendation === "object"
      ? recommendation
      : {};

  const recommendationTitle =
    firstDefined(
      resolved.title,
      resolved.heading,
      resolved.name,
      fallback.title
    );

  const message =
    firstDefined(
      resolved.message,
      resolved.description,
      resolved.explanation,
      resolved.reason,
      fallback.message
    );

  const action =
    firstDefined(
      resolved.action,
      resolved.actionLabel,
      resolved.recommendedAction,
      actionLabel,
      fallback.action
    );

  const priority = normalizePriority(
    firstDefined(
      resolved.priority,
      resolved.urgency,
      resolved.severity,
      fallback.priority
    )
  );

  /* =======================================================
     FINANCIAL VALUES
  ======================================================= */

  const current = toNumber(
    firstDefined(
      resolved.currentAmount,
      currentAmount,
      0
    )
  );

  const target = toNumber(
    firstDefined(
      resolved.targetAmount,
      targetAmount,
      0
    )
  );

  const calculatedRemaining = Math.max(
    target - current,
    0
  );

  const remaining = Math.max(
    0,
    toNumber(
      firstDefined(
        resolved.remainingAmount,
        remainingAmount,
        calculatedRemaining
      ),
      calculatedRemaining
    )
  );

  /* =======================================================
     PRIORITY CONFIG
  ======================================================= */

  const config =
    PRIORITY_CONFIG[priority] ||
    PRIORITY_CONFIG.normal;

  const PriorityIcon = config.icon;

  /* =======================================================
     ACTION BUTTON LABEL
  ======================================================= */

  const buttonLabel =
    firstDefined(
      resolved.buttonLabel,
      actionLabel,
      "Take action"
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-labelledby="emergency-fund-recommendation-title"
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
            id="emergency-fund-recommendation-title"
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
        {/* CURRENT FUND */}

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
            Current fund
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {formatCurrency(
              current,
              currency
            )}
          </p>
        </div>

        {/* TARGET */}

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
            Target
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {formatCurrency(
              target,
              currency
            )}
          </p>
        </div>

        {/* REMAINING */}

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
            Remaining
          </p>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm
            "
          >
            {remaining > 0
              ? formatCurrency(
                  remaining,
                  currency
                )
              : "Target reached"}
          </p>
        </div>
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
          emergency-fund data currently
          available in SmartBudget. Your ideal
          reserve may vary depending on income
          stability, essential expenses,
          dependants, and financial obligations.
        </p>
      </div>
    </section>
  );
};

export default EmergencyFundRecommendation;
