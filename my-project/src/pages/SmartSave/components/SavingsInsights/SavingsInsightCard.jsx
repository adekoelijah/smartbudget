// SavingsInsightCard.jsx

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  normalizeSavingsInsight,
} from "../../../../utils/smartSave/savingsNormalizers";

import {
  getSavingsHealthStatus,
} from "../../../../utils/smartSave/savingsHealth";

import {
  SAVINGS_INSIGHT_TYPES,
  SAVINGS_INSIGHT_PRIORITIES,
} from "../../../../constants/smartSaveConstants";

import {
  SMART_SAVE_CURRENCY,
} from "../../../../config/smartSaveConfig";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_CURRENCY = SMART_SAVE_CURRENCY || "NGN";

/* =========================================================
   ICON CONFIG
========================================================= */

const TYPE_ICON_MAP = {
  opportunity: TrendingUp,
  recommendation: Lightbulb,
  warning: AlertTriangle,
  risk: XCircle,
  achievement: CheckCircle2,
  goal: Target,
  progress: ArrowUpRight,
  saving: Sparkles,
  information: Info,
};

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    icon: XCircle,
  },

  high: {
    label: "High priority",
    icon: AlertTriangle,
  },

  medium: {
    label: "Recommended",
    icon: Lightbulb,
  },

  low: {
    label: "Tip",
    icon: Info,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const safeString = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();

  return trimmed || fallback;
};

const getInsightTitle = (insight) =>
  safeString(
    insight?.title ||
      insight?.headline ||
      insight?.name,
    "Savings insight"
  );

const getInsightDescription = (insight) =>
  safeString(
    insight?.description ||
      insight?.message ||
      insight?.summary ||
      insight?.recommendation,
    "We found something that may help improve your savings."
  );

const getInsightType = (insight) => {
  const type = String(
    insight?.type ||
      insight?.category ||
      insight?.insightType ||
      ""
  ).toLowerCase();

  return type || "information";
};

const getInsightPriority = (insight) => {
  const priority = String(
    insight?.priority ||
      insight?.severity ||
      ""
  ).toLowerCase();

  return priority || "medium";
};

const getInsightIcon = (type) =>
  TYPE_ICON_MAP[type] || Lightbulb;

const getPriorityConfig = (priority) =>
  PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

const getAmount = (insight) => {
  const amount =
    insight?.amount ??
    insight?.potentialSavings ??
    insight?.recommendedAmount;

  return Number.isFinite(Number(amount))
    ? Number(amount)
    : null;
};

const getPercentage = (insight) => {
  const percentage =
    insight?.percentage ??
    insight?.changePercentage ??
    insight?.improvementPercentage;

  return Number.isFinite(Number(percentage))
    ? Number(percentage)
    : null;
};

const getDirection = (insight) => {
  const direction = String(
    insight?.direction ||
      insight?.trend ||
      ""
  ).toLowerCase();

  if (["up", "increase", "positive"].includes(direction)) {
    return "up";
  }

  if (["down", "decrease", "negative"].includes(direction)) {
    return "down";
  }

  return null;
};

const getInsightDate = (insight) =>
  insight?.createdAt ||
  insight?.updatedAt ||
  insight?.date ||
  insight?.generatedAt ||
  null;

/* =========================================================
   COMPONENT
========================================================= */

const SavingsInsightCard = ({
  insight: rawInsight,
  onAction,
  onDismiss,
  onView,
  compact = false,
  showDate = true,
  showPriority = true,
  showAction = true,
  className = "",
}) => {
  /*
   * Normalization happens at the UI boundary.
   *
   * The component remains resilient if the service/API
   * returns a slightly different response shape.
   */
  const insight = normalizeSavingsInsight(rawInsight);

  if (!insight) {
    return null;
  }

  const type = getInsightType(insight);
  const priority = getInsightPriority(insight);

  const Icon = getInsightIcon(type);
  const priorityConfig = getPriorityConfig(priority);
  const PriorityIcon = priorityConfig.icon;

  const title = getInsightTitle(insight);
  const description = getInsightDescription(insight);

  const amount = getAmount(insight);
  const percentage = getPercentage(insight);
  const direction = getDirection(insight);

  const date = getInsightDate(insight);

  const healthStatus = insight?.healthStatus
    ? getSavingsHealthStatus(insight.healthStatus)
    : null;

  const actionLabel = safeString(
    insight?.actionLabel ||
      insight?.ctaLabel ||
      insight?.action?.label,
    "View details"
  );

  const handleAction = () => {
    if (typeof onAction === "function") {
      onAction(insight);
      return;
    }

    if (typeof onView === "function") {
      onView(insight);
    }
  };

  const handleDismiss = () => {
    if (typeof onDismiss === "function") {
      onDismiss(insight);
    }
  };

  const hasAction =
    showAction &&
    (
      typeof onAction === "function" ||
      typeof onView === "function"
    );

  const formattedAmount =
    amount !== null
      ? formatCurrency(amount, {
          currency:
            insight?.currency ||
            DEFAULT_CURRENCY,
        })
      : null;

  const formattedPercentage =
    percentage !== null
      ? formatPercentage(percentage)
      : null;

  const formattedDate =
    showDate && date
      ? formatDate(date)
      : null;

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${compact ? "p-4" : "p-5"}
        ${className}
      `}
    >
      {/* =================================================
          ACCENT
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          left-0 absolute inset-y-0
          w-1
          bg-slate-300
        "
        /
      >

      <div
        className="
          flex items-start
          gap-4
        "
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div
          className="
            flex justify-center items-center
            w-11 h-11
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          Icon size={21} strokeWidth={2} 
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            flex-1
            min-w-0
          "
        >
          {/* Header */}

          <div
            className="
              flex justify-between items-start
              gap-3
            "
          >
            <div
              className="
                min-w-0
              "
            >
              <h3
                className="
                  font-semibold text-slate-900 text-sm truncate
                "
                title={title}
              >
                {title}
              </h3>

              {formattedDate && (
                <p
                  className="
                    mt-1
                    text-slate-500 text-xs
                  "
                >
                  {formattedDate}
                </p>
              )}
            </div>

            {/* Priority */}

            {showPriority && (
              <span
                className="
                  inline-flex items-center
                  px-2.5 py-1
                  font-medium text-[11px] text-slate-600
                  bg-slate-100
                  rounded-full
                  gap-1.5 shrink-0
                "
              >
                <PriorityIcon
                  size={12}
                  strokeWidth={2}
                />

                {priorityConfig.label}
              </span>
            )}
          </div>

          {/* Description */}

          <p
            className={`
              leading-6
              text-slate-600
              ${compact
                ? "mt-2 text-xs"
                : "mt-3 text-sm"
              }
            `}
          >
            {description}
          </p>

          {/* =================================================
              METRICS
          ================================================= */}

          {(formattedAmount ||
            formattedPercentage ||
            healthStatus) && (
            <div
              className="
                flex flex-wrap
                mt-4
                gap-2
              "
            >
              {formattedAmount && (
                <div
                  className="
                    inline-flex items-center
                    px-3 py-2
                    font-semibold text-slate-800 text-xs
                    bg-slate-50
                    rounded-lg
                    gap-1.5
                  "
                >
                  <span>{formattedAmount}</span>
                </div>
              )}

              {formattedPercentage && (
                <div
                  className="
                    inline-flex items-center
                    px-3 py-2
                    font-semibold text-slate-800 text-xs
                    bg-slate-50
                    rounded-lg
                    gap-1.5
                  "
                >
                  {direction === "up" && (
                    <ArrowUpRight size={13} />
                  )}

                  {direction === "down" && (
                    <ArrowDownRight size={13} />
                  )}

                  {formattedPercentage}
                </div>
              )}

              {healthStatus && (
                <div
                  className="
                    inline-flex items-center
                    px-3 py-2
                    font-medium text-slate-700 text-xs
                    bg-slate-50
                    rounded-lg
                  "
                >
                  {healthStatus.label ||
                    healthStatus.status ||
                    insight.healthStatus}
                </div>
              )}
            </div>
          )}

          {/* =================================================
              GOAL CONTEXT
          ================================================= */}

          {insight?.goalName && (
            <div
              className="
                flex items-center
                mt-4
                text-slate-500 text-xs
                gap-2
              "
            >
              <Target size={14} />

              <span
                className="
                  truncate
                "
              >
                {insight.goalName}
              </span>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          {(hasAction ||
            typeof onDismiss === "function") && (
            <div
              className="
                flex justify-between items-center
                mt-5
                gap-3
              "
            >
              {hasAction ? (
                <button
                  type="button"
                  onClick={handleAction}
                  className="
                    inline-flex items-center
                    px-3.5 py-2
                    font-semibold text-white text-xs
                    bg-slate-900 hover:bg-slate-800
                    rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                    transition
                    gap-2
                  "
                >
                  {actionLabel}

                  <ArrowRight size={14} />
                </button>
              ) : (
                <span />
              )}

              {typeof onDismiss === "function" && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="
                    px-2 py-1.5
                    font-medium text-slate-500 hover:text-slate-700 text-xs
                    hover:bg-slate-100
                    rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-slate-300
                    transition
                  "
                  aria-label={`Dismiss ${title}`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default SavingsInsightCard;