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
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY =
  SMART_SAVE_CURRENCY || "NGN";

const DEFAULT_INSIGHT_TYPE = "information";
const DEFAULT_PRIORITY = "medium";

const DEFAULT_TITLE = "Savings insight";

const DEFAULT_DESCRIPTION =
  "We found something that may help improve your savings.";

const DEFAULT_ACTION_LABEL = "View details";

/* =========================================================
   ICON CONFIGURATION
========================================================= */

const TYPE_ICON_MAP = Object.freeze({
  opportunity: TrendingUp,
  recommendation: Lightbulb,
  warning: AlertTriangle,
  risk: XCircle,
  achievement: CheckCircle2,
  goal: Target,
  progress: ArrowUpRight,
  saving: Sparkles,
  information: Info,
});

const PRIORITY_CONFIG = Object.freeze({
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
});

/* =========================================================
   SAFE HELPERS
========================================================= */

const safeString = (
  value,
  fallback = ""
) => {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed || fallback;
};

const toFiniteNumber = (
  value,
  fallback = null
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeType = (value) => {
  const normalized = safeString(
    value
  ).toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(
      TYPE_ICON_MAP,
      normalized
    )
  ) {
    return normalized;
  }

  return DEFAULT_INSIGHT_TYPE;
};

const normalizePriority = (value) => {
  const normalized = safeString(
    value
  ).toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(
      PRIORITY_CONFIG,
      normalized
    )
  ) {
    return normalized;
  }

  return DEFAULT_PRIORITY;
};

/* =========================================================
   INSIGHT DATA HELPERS
========================================================= */

const getInsightTitle = (insight) =>
  safeString(
    insight?.title ??
      insight?.headline ??
      insight?.name,
    DEFAULT_TITLE
  );

const getInsightDescription = (
  insight
) =>
  safeString(
    insight?.description ??
      insight?.message ??
      insight?.summary ??
      insight?.recommendation,
    DEFAULT_DESCRIPTION
  );

const getInsightType = (insight) =>
  normalizeType(
    insight?.type ??
      insight?.category ??
      insight?.insightType
  );

const getInsightPriority = (
  insight
) =>
  normalizePriority(
    insight?.priority ??
      insight?.severity
  );

const getInsightAmount = (
  insight
) =>
  toFiniteNumber(
    insight?.amount ??
      insight?.potentialSavings ??
      insight?.recommendedAmount
  );

const getInsightPercentage = (
  insight
) =>
  toFiniteNumber(
    insight?.percentage ??
      insight?.changePercentage ??
      insight?.improvementPercentage
  );

const getInsightDirection = (
  insight
) => {
  const direction = safeString(
    insight?.direction ??
      insight?.trend
  ).toLowerCase();

  if (
    direction === "up" ||
    direction === "increase" ||
    direction === "positive"
  ) {
    return "up";
  }

  if (
    direction === "down" ||
    direction === "decrease" ||
    direction === "negative"
  ) {
    return "down";
  }

  return null;
};

const getInsightDate = (
  insight
) =>
  insight?.createdAt ??
  insight?.updatedAt ??
  insight?.date ??
  insight?.generatedAt ??
  null;

const getActionLabel = (
  insight
) =>
  safeString(
    insight?.actionLabel ??
      insight?.ctaLabel ??
      insight?.action?.label,
    DEFAULT_ACTION_LABEL
  );

/* =========================================================
   ICON COMPONENTS
========================================================= */

/**
 * Resolves the insight icon outside the main card's
 * presentation tree.
 *
 * This prevents dynamic component resolution from being
 * embedded directly in SavingsInsightCard's render JSX.
 */
const SavingsInsightIcon = ({
  type,
  size = 21,
  strokeWidth = 2,
}) => {
  const Icon =
    TYPE_ICON_MAP[type] ??
    TYPE_ICON_MAP[DEFAULT_INSIGHT_TYPE];

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
};

/**
 * Resolves the priority icon independently from the
 * main insight icon.
 */
const SavingsInsightPriorityIcon = ({
  priority,
  size = 12,
  strokeWidth = 2,
}) => {
  const config =
    PRIORITY_CONFIG[priority] ??
    PRIORITY_CONFIG[DEFAULT_PRIORITY];

  const Icon = config.icon;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
};

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
  /* =======================================================
     NORMALIZE INSIGHT
  ======================================================= */

  const insight =
    normalizeSavingsInsight(
      rawInsight
    );

  /*
   * Invalid insight records should never break the
   * surrounding SmartSave page.
   */
  if (!insight) {
    return null;
  }

  /* =======================================================
     NORMALIZED PRESENTATION DATA
  ======================================================= */

  const type =
    getInsightType(insight);

  const priority =
    getInsightPriority(insight);

  const priorityConfig =
    PRIORITY_CONFIG[priority] ??
    PRIORITY_CONFIG[DEFAULT_PRIORITY];

  const title =
    getInsightTitle(insight);

  const description =
    getInsightDescription(insight);

  const amount =
    getInsightAmount(insight);

  const percentage =
    getInsightPercentage(insight);

  const direction =
    getInsightDirection(insight);

  const date =
    getInsightDate(insight);

  const actionLabel =
    getActionLabel(insight);

  /* =======================================================
     HEALTH STATUS
  ======================================================= */

  const healthStatus =
    insight?.healthStatus
      ? getSavingsHealthStatus(
          insight.healthStatus
        )
      : null;

  /* =======================================================
     FORMATTING
  ======================================================= */

  const currency = safeString(
    insight?.currency,
    DEFAULT_CURRENCY
  ).toUpperCase();

  const formattedAmount =
    amount !== null
      ? formatCurrency(
          amount,
          {
            currency,
          }
        )
      : null;

  const formattedPercentage =
    percentage !== null
      ? formatPercentage(
          percentage
        )
      : null;

  const formattedDate =
    showDate && date
      ? formatDate(date)
      : null;

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const hasAction =
    showAction &&
    (
      typeof onAction ===
        "function" ||
      typeof onView ===
        "function"
    );

  const hasDismiss =
    typeof onDismiss ===
    "function";

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleAction = () => {
    if (
      typeof onAction ===
      "function"
    ) {
      onAction(insight);
      return;
    }

    if (
      typeof onView ===
      "function"
    ) {
      onView(insight);
    }
  };

  const handleDismiss = () => {
    if (
      typeof onDismiss ===
      "function"
    ) {
      onDismiss(insight);
    }
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
      aria-label={title}
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
            INSIGHT ICON
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
          <SavingsInsightIcon
            type={type}
            size={21}
            strokeWidth={2}
          />
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
          {/* =================================================
              HEADER
          ================================================= */}

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

            {/* =================================================
                PRIORITY
            ================================================= */}

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
                <SavingsInsightPriorityIcon
                  priority={priority}
                />

                {priorityConfig.label}
              </span>
            )}
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className={`
              leading-6
              text-slate-600
              ${
                compact
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
              {/* AMOUNT */}

              {formattedAmount && (
                <div
                  className="
                    inline-flex items-center
                    px-3 py-2
                    font-semibold text-slate-800 text-xs
                    bg-slate-50
                    rounded-lg
                  "
                >
                  {formattedAmount}
                </div>
              )}

              {/* PERCENTAGE */}

              {formattedPercentage && (
                <div
                  className="
                    inline-flex items-center
                    px-3 py-2
                    font-semibold text-slate-800 text-xs
                    bg-slate-50
                    rounded-lg
                    gap-1
                  "
                >
                  {direction === "up" && (
                    <ArrowUpRight
                      size={13}
                      aria-hidden="true"
                    />
                  )}

                  {direction === "down" && (
                    <ArrowDownRight
                      size={13}
                      aria-hidden="true"
                    />
                  )}

                  {formattedPercentage}
                </div>
              )}

              {/* HEALTH */}

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
                  {safeString(
                    healthStatus.label ??
                      healthStatus.status ??
                      insight.healthStatus,
                    "Status available"
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================
              GOAL CONTEXT
          ================================================= */}

          {safeString(
            insight?.goalName
          ) && (
            <div
              className="
                flex items-center
                mt-4
                text-slate-500 text-xs
                gap-2
              "
            >
              <Target
                size={14}
                aria-hidden="true"
              />

              <span
                className="
                  truncate
                "
                title={
                  insight.goalName
                }
              >
                {insight.goalName}
              </span>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          {(hasAction ||
            hasDismiss) && (
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
                  onClick={
                    handleAction
                  }
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

                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <span
                  aria-hidden="true"
                />
              )}

              {hasDismiss && (
                <button
                  type="button"
                  onClick={
                    handleDismiss
                  }
                  className="
                    px-2 py-1.5
                    font-medium text-slate-500 hover:text-slate-700 text-xs
                    hover:bg-slate-100
                    rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-slate-300 focus:ring-offset-1
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