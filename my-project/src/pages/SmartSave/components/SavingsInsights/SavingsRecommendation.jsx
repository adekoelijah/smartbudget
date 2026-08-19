// SavingsRecommendation.jsx

import {
  AlertTriangle,
  ArrowRight,
  Info,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  SAVINGS_INSIGHT_TYPES,
} from "../../../../constants/smartSaveConstants";

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_PRIORITY = "medium";
const DEFAULT_CURRENCY = "NGN";

const FALLBACK_INSIGHT_TYPE =
  SAVINGS_INSIGHT_TYPES.RECOMMENDATION;

/* =========================================================
   PRIORITY CONFIGURATION
========================================================= */

const PRIORITY_CONFIG = Object.freeze({
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    container:
      "border-red-200 bg-red-50/70",
    iconWrapper:
      "bg-red-100 text-red-600",
    badge:
      "bg-red-100 text-red-700",
  },

  high: {
    icon: AlertTriangle,
    label: "High priority",
    container:
      "border-orange-200 bg-orange-50/70",
    iconWrapper:
      "bg-orange-100 text-orange-600",
    badge:
      "bg-orange-100 text-orange-700",
  },

  medium: {
    icon: Lightbulb,
    label: "Recommended",
    container:
      "border-slate-200 bg-slate-50/70",
    iconWrapper:
      "bg-slate-100 text-slate-700",
    badge:
      "bg-slate-100 text-slate-700",
  },

  low: {
    icon: Info,
    label: "Suggestion",
    container:
      "border-slate-200 bg-white",
    iconWrapper:
      "bg-slate-100 text-slate-600",
    badge:
      "bg-slate-100 text-slate-600",
  },
});

/* =========================================================
   INSIGHT TYPE CONFIGURATION
========================================================= */

const TYPE_CONFIG = Object.freeze({
  [SAVINGS_INSIGHT_TYPES.GOAL]: {
    icon: Target,
    label: "Goal",
  },

  [SAVINGS_INSIGHT_TYPES.PROGRESS]: {
    icon: TrendingUp,
    label: "Progress",
  },

  [SAVINGS_INSIGHT_TYPES.RISK]: {
    icon: ShieldCheck,
    label: "Risk",
  },

  [SAVINGS_INSIGHT_TYPES.OPPORTUNITY]: {
    icon: Sparkles,
    label: "Opportunity",
  },

  [SAVINGS_INSIGHT_TYPES.RECOMMENDATION]: {
    icon: Lightbulb,
    label: "Recommendation",
  },
});

/* =========================================================
   HELPERS
========================================================= */

const getText = (...values) => {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return "";
};

/* ---------------------------------------------------------
   PRIORITY
--------------------------------------------------------- */

const getPriority = (recommendation) => {
  const priority = getText(
    recommendation?.priority,
    recommendation?.severity,
    recommendation?.urgency
  ).toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    PRIORITY_CONFIG,
    priority
  )
    ? priority
    : DEFAULT_PRIORITY;
};

/* ---------------------------------------------------------
   INSIGHT TYPE
--------------------------------------------------------- */

const getInsightType = (recommendation) => {
  const type = getText(
    recommendation?.type,
    recommendation?.category,
    recommendation?.insightType
  ).toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    TYPE_CONFIG,
    type
  )
    ? type
    : FALLBACK_INSIGHT_TYPE;
};

/* ---------------------------------------------------------
   ID
--------------------------------------------------------- */

const getRecommendationId = (
  recommendation
) => {
  const id =
    recommendation?._id ??
    recommendation?.id ??
    recommendation?.insightId ??
    recommendation?.recommendationId;

  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    return null;
  }

  return String(id);
};

/* ---------------------------------------------------------
   AMOUNT
--------------------------------------------------------- */

const getAmount = (recommendation) => {
  const value =
    recommendation?.amount ??
    recommendation?.recommendedAmount ??
    recommendation?.suggestedAmount ??
    null;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : null;
};

/* ---------------------------------------------------------
   CURRENCY
--------------------------------------------------------- */

const getCurrency = (recommendation) => {
  const currency = getText(
    recommendation?.currency,
    recommendation?.targetCurrency
  );

  return currency || DEFAULT_CURRENCY;
};

/* ---------------------------------------------------------
   FORMATTED AMOUNT
--------------------------------------------------------- */

const formatAmount = (
  amount,
  currency
) => {
  if (amount === null) {
    return null;
  }

  try {
    return formatCurrency(
      amount,
      currency
    );
  } catch {
    try {
      return `${currency} ${amount.toLocaleString(
        "en-NG"
      )}`;
    } catch {
      return `${currency} ${amount}`;
    }
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsRecommendation = ({
  recommendation = null,
  onAction,
  compact = false,
  showPriority = true,
  showType = true,
  className = "",
}) => {
  /* =======================================================
     SOURCE VALIDATION
  ======================================================= */

  const source =
    recommendation &&
    typeof recommendation === "object" &&
    !Array.isArray(recommendation)
      ? recommendation
      : null;

  if (!source) {
    return null;
  }

  /* =======================================================
     NORMALIZED DISPLAY DATA
  ======================================================= */

  const title =
    getText(
      source.title,
      source.name,
      source.heading
    ) || "Savings recommendation";

  const description = getText(
    source.description,
    source.message,
    source.explanation,
    source.body
  );

  const actionLabel =
    getText(
      source.actionLabel,
      source.action?.label,
      source.ctaLabel
    ) || "View details";

  const priority =
    getPriority(source);

  const insightType =
    getInsightType(source);

  const recommendationId =
    getRecommendationId(source);

  const amount =
    getAmount(source);

  const currency =
    getCurrency(source);

  /* =======================================================
     STABLE CONFIGURATION REFERENCES
  ======================================================= */

  const priorityConfig =
    PRIORITY_CONFIG[priority];

  const PriorityIcon =
    priorityConfig.icon;

  const typeConfig =
    TYPE_CONFIG[insightType];

  const TypeIcon =
    typeConfig.icon;

  /* =======================================================
     FORMATTING
  ======================================================= */

  const formattedAmount =
    formatAmount(
      amount,
      currency
    );

  /* =======================================================
     ACTION
  ======================================================= */

  const hasAction =
    typeof onAction === "function";

  const handleAction = () => {
    if (!hasAction) {
      return;
    }

    onAction(
      source,
      recommendationId
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        bg-white
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-md
        ${priorityConfig.container}
        ${compact ? "p-4" : "p-5"}
        ${className}
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          flex justify-between items-start
          gap-3
        "
      >
        <div
          className="
            flex items-start
            min-w-0
            gap-3
          "
        >
          {/* ===============================================
              PRIORITY ICON
          =============================================== */}

          <div
            className={`
              flex
              items-center
              justify-center
              w-10
              h-10
              shrink-0
              rounded-xl
              ${priorityConfig.iconWrapper}
            `}
            aria-hidden="true"
          >
            <PriorityIcon
              size={19}
              strokeWidth={2}
            />
          </div>

          {/* ===============================================
              TITLE / META
          =============================================== */}

          <div
            className="
              min-w-0
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm line-clamp-2 leading-5
              "
            >
              {title}
            </h3>

            {(showPriority ||
              showType) && (
              <div
                className="
                  flex flex-wrap items-center
                  mt-2
                  gap-1.5
                "
              >
                {/* Priority */}

                {showPriority && (
                  <span
                    className={`
                      inline-flex
                      items-center
                      px-2
                      py-0.5
                      rounded-full
                      font-semibold
                      text-[10px]
                      ${priorityConfig.badge}
                    `}
                  >
                    {priorityConfig.label}
                  </span>
                )}

                {/* Type */}

                {showType && (
                  <span
                    className="
                      inline-flex items-center
                      px-2 py-0.5
                      font-medium text-[10px] text-slate-600
                      bg-white/80
                      rounded-full
                      gap-1
                    "
                  >
                    <TypeIcon
                      size={11}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    {typeConfig.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      {description && (
        <p
          className="
            mt-4
            text-slate-600 text-sm leading-6
          "
        >
          {description}
        </p>
      )}

      {/* =================================================
          RECOMMENDED AMOUNT
      ================================================= */}

      {formattedAmount && (
        <div
          className="
            mt-4 px-4 py-3
            bg-white/80
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              font-medium text-[11px] text-slate-400 uppercase tracking-wide
            "
          >
            Suggested amount
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-base tracking-tight
            "
          >
            {formattedAmount}
          </p>
        </div>
      )}

      {/* =================================================
          ACTION
      ================================================= */}

      {hasAction && (
        <footer
          className="
            mt-5 pt-4
            border-slate-200/80 border-t
          "
        >
          <button
            type="button"
            onClick={handleAction}
            className="
              inline-flex justify-center items-center
              w-full sm:w-auto min-h-9
              px-3.5 py-2
              font-semibold text-white text-sm
              bg-slate-900 hover:bg-slate-800
              rounded-lg focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              transition
              gap-2
            "
          >
            <span>
              {actionLabel}
            </span>

            <ArrowRight
              size={15}
              strokeWidth={2}
              className="
                transition-transform duration-200
                group-hover:translate-x-0.5
              "
              aria-hidden="true"
            /
            >
          </button>
        </footer>
      )}
    </article>
  );
};

/* =========================================================
   COMPONENT METADATA
========================================================= */

SavingsRecommendation.displayName =
  "SavingsRecommendation";

/* =========================================================
   EXPORT
========================================================= */

export default SavingsRecommendation;