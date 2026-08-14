
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
   DEFAULTS
========================================================= */

const DEFAULT_PRIORITY = "medium";
const DEFAULT_CURRENCY = "NGN";

/* =========================================================
   PRIORITY CONFIGURATION
========================================================= */

const PRIORITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    container: "border-red-200 bg-red-50/70",
    iconWrapper: "bg-red-100 text-red-600",
    badge: "bg-red-100 text-red-700",
  },

  high: {
    icon: AlertTriangle,
    label: "High priority",
    container: "border-orange-200 bg-orange-50/70",
    iconWrapper: "bg-orange-100 text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },

  medium: {
    icon: Lightbulb,
    label: "Recommended",
    container: "border-slate-200 bg-slate-50/70",
    iconWrapper: "bg-slate-100 text-slate-700",
    badge: "bg-slate-100 text-slate-700",
  },

  low: {
    icon: Info,
    label: "Suggestion",
    container: "border-slate-200 bg-white",
    iconWrapper: "bg-slate-100 text-slate-600",
    badge: "bg-slate-100 text-slate-600",
  },
};

/* =========================================================
   INSIGHT TYPE CONFIGURATION
========================================================= */

const TYPE_CONFIG = {
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
};

/* =========================================================
   HELPERS
========================================================= */

const getText = (...values) => {
  const value = values.find(
    (item) =>
      typeof item === "string" &&
      item.trim().length > 0
  );

  return value?.trim() || "";
};

const getPriority = (recommendation) => {
  const priority = getText(
    recommendation?.priority,
    recommendation?.severity,
    recommendation?.urgency
  ).toLowerCase();

  return PRIORITY_CONFIG[priority]
    ? priority
    : DEFAULT_PRIORITY;
};

const getInsightType = (recommendation) => {
  return getText(
    recommendation?.type,
    recommendation?.category,
    recommendation?.insightType
  ).toLowerCase();
};

const getRecommendationId = (recommendation) => {
  const id =
    recommendation?._id ??
    recommendation?.id ??
    recommendation?.insightId ??
    recommendation?.recommendationId;

  return id ? String(id) : null;
};

const getFormattedAmount = (
  amount,
  currency
) => {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return null;
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  try {
    return formatCurrency(
      numericAmount,
      currency
    );
  } catch {
    return `${currency} ${numericAmount.toLocaleString()}`;
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
  /*
   * Normalize safely without hooks.
   *
   * This component is intentionally presentational.
   * It does not fetch, mutate, navigate, or manage
   * asynchronous state.
   */

  const source =
    recommendation &&
    typeof recommendation === "object"
      ? recommendation
      : null;

  if (!source) {
    return null;
  }

  /* =======================================================
     NORMALIZED DATA
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

  const amount =
    source.amount ??
    source.recommendedAmount ??
    source.suggestedAmount ??
    null;

  const currency =
    source.currency ??
    source.targetCurrency ??
    DEFAULT_CURRENCY;

  const recommendationId =
    getRecommendationId(source);

  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const priorityConfig =
    PRIORITY_CONFIG[priority] ??
    PRIORITY_CONFIG[DEFAULT_PRIORITY];

  const PriorityIcon =
    priorityConfig.icon;

  const typeConfig =
    TYPE_CONFIG[insightType] ??
    TYPE_CONFIG[
      SAVINGS_INSIGHT_TYPES.RECOMMENDATION
    ];

  const TypeIcon =
    typeConfig?.icon ??
    Lightbulb;

  /* =======================================================
     FORMATTED AMOUNT
  ======================================================= */

  const formattedAmount =
    getFormattedAmount(
      amount,
      currency
    );

  /* =======================================================
     ACTION
  ======================================================= */

  const handleAction = () => {
    if (typeof onAction !== "function") {
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
      {/* ===================================================
          HEADER
      =================================================== */}

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
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
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
                {showPriority && (
                  <span
                    className={`
                      inline-flex
                      items-center
                      rounded-full
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      ${priorityConfig.badge}
                    `}
                  >
                    {priorityConfig.label}
                  </span>
                )}

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
                    />

                    {typeConfig.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

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

      {/* ===================================================
          RECOMMENDED AMOUNT
      =================================================== */}

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

      {/* ===================================================
          ACTION
      =================================================== */}

      {typeof onAction === "function" && (
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
            {actionLabel}

            <ArrowRight
              size={15}
              strokeWidth={2}
              className="
                transition-transform duration-200
                group-hover:translate-x-0.5
              "
              /
            >
          </button>
        </footer>
      )}

      {/* ===================================================
          ACCESSIBILITY
      =================================================== */}

      {recommendationId && (
        <span
          className="
            sr-only
          "
        >
          Recommendation ID:{" "}
          {recommendationId}
        </span>
      )}
    </article>
  );
};

export default SavingsRecommendation;
