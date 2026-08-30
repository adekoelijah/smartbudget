
import { memo } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  Clock3,
  PiggyBank,
  Play,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  SAVINGS_PLAN_STATUS,
  SAVINGS_FREQUENCIES,
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

import {
  formatCurrency,
  formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  calculateProgressPercentage,
} from "../../../../utils/smartSave/savingsProgress";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_STATUS =
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly";

const FIXED_STRATEGY =
  SAVINGS_STRATEGIES?.FIXED ?? "fixed";

const PERCENTAGE_STRATEGY =
  SAVINGS_STRATEGIES?.PERCENTAGE ?? "percentage";

const ROUND_UP_STRATEGY =
  SAVINGS_STRATEGIES?.ROUND_UP ?? "round_up";

const GOAL_BASED_STRATEGY =
  SAVINGS_STRATEGIES?.GOAL_BASED ?? "goal_based";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = Object.freeze({
  active: {
    label: "Active",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  paused: {
    label: "Paused",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  completed: {
    label: "Completed",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  cancelled: {
    label: "Cancelled",
    badge:
      "border-red-200 bg-red-50 text-red-700",
  },

  draft: {
    label: "Draft",
    badge:
      "border-slate-200 bg-slate-50 text-slate-600",
  },
});

/* =========================================================
   STRATEGY CONFIGURATION
========================================================= */

const STRATEGY_CONFIG = Object.freeze({
  [FIXED_STRATEGY]: {
    label: "Fixed amount",
    description:
      "Save a consistent amount on every contribution.",
  },

  [PERCENTAGE_STRATEGY]: {
    label: "Percentage",
    description:
      "Automatically save a percentage of available income.",
  },

  [ROUND_UP_STRATEGY]: {
    label: "Round-up",
    description:
      "Build savings gradually through transaction round-ups.",
  },

  [GOAL_BASED_STRATEGY]: {
    label: "Goal based",
    description:
      "Adjust contributions around a specific savings target.",
  },
});

const FALLBACK_STRATEGY_CONFIG = Object.freeze({
  label: "Custom strategy",
  description:
    "Personalized savings strategy.",
});

/* =========================================================
   FREQUENCY LABELS
========================================================= */

const FREQUENCY_LABELS = Object.freeze({
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
});

/* =========================================================
   SAFE VALUE HELPERS
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

const getId = (strategy) => {
  if (
    !strategy ||
    typeof strategy !== "object"
  ) {
    return null;
  }

  const id =
    strategy._id ??
    strategy.id ??
    strategy.planId ??
    strategy.strategyId;

  if (
    id === null ||
    id === undefined ||
    String(id).trim() === ""
  ) {
    return null;
  }

  return String(id);
};

const getNumber = (...values) => {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeStatus = (strategy) => {
  const status = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    STATUS_CONFIG,
    status
  )
    ? status
    : DEFAULT_STATUS;
};

const normalizeFrequency = (strategy) => {
  const frequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  return Object.prototype.hasOwnProperty.call(
    FREQUENCY_LABELS,
    frequency
  )
    ? frequency
    : DEFAULT_FREQUENCY;
};

const normalizeStrategyType = (strategy) =>
  getText(
    strategy?.strategy,
    strategy?.strategyType,
    strategy?.method,
    strategy?.type
  ).toLowerCase();

/* =========================================================
   FINANCIAL VALUE HELPERS
========================================================= */

const getCurrentAmount = (strategy) =>
  getNumber(
    strategy?.currentAmount,
    strategy?.savedAmount,
    strategy?.progress?.current,
    strategy?.metrics?.savedAmount
  );

const getTargetAmount = (strategy) =>
  getNumber(
    strategy?.targetAmount,
    strategy?.target,
    strategy?.goalAmount,
    strategy?.progress?.target
  );

const getContributionAmount = (strategy) =>
  getNumber(
    strategy?.contributionAmount,
    strategy?.amount,
    strategy?.savingAmount,
    strategy?.fixedAmount,
    strategy?.metrics?.contributionAmount
  );

/* =========================================================
   PROGRESS
========================================================= */

const clampProgress = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, numericValue)
  );
};

const getProgress = (
  strategy,
  currentAmount,
  targetAmount
) => {
  const explicitProgress =
    strategy?.progressPercentage ??
    strategy?.progress?.percentage ??
    strategy?.metrics?.progressPercentage;

  if (
    explicitProgress !== null &&
    explicitProgress !== undefined &&
    explicitProgress !== ""
  ) {
    return clampProgress(explicitProgress);
  }

  if (targetAmount <= 0) {
    return 0;
  }

  try {
    return clampProgress(
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );
  } catch {
    return clampProgress(
      (currentAmount / targetAmount) * 100
    );
  }
};

/* =========================================================
   SAFE DATE FORMATTER
========================================================= */

const safeFormatDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  try {
    const formatted = formatDate(value);

    if (
      typeof formatted === "string" &&
      formatted.trim()
    ) {
      return formatted.trim();
    }
  } catch {
    // Continue to native Date fallback.
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

/* =========================================================
   SAFE CURRENCY FORMATTER
========================================================= */

const safeFormatCurrency = (
  amount,
  currency
) => {
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
   STATUS ICON
========================================================= */

const StatusIcon = ({
  status,
  size = 11,
  strokeWidth = 2,
}) => {
  switch (status) {
    case "active":
      return (
        <CheckCircle2
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case "paused":
      return (
        <CirclePause
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case "completed":
      return (
        <CheckCircle2
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case "cancelled":
      return (
        <CirclePause
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case "draft":
    default:
      return (
        <Clock3
          size={size}
          strokeWidth={strokeWidth}
        />
      );
  }
};

/* =========================================================
   STRATEGY ICON
========================================================= */

const StrategyIcon = ({
  strategyType,
  size = 21,
  strokeWidth = 2,
}) => {
  switch (strategyType) {
    case FIXED_STRATEGY:
      return (
        <PiggyBank
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case PERCENTAGE_STRATEGY:
      return (
        <TrendingUp
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case ROUND_UP_STRATEGY:
      return (
        <Wallet
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case GOAL_BASED_STRATEGY:
      return (
        <Target
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    default:
      return (
        <PiggyBank
          size={size}
          strokeWidth={strokeWidth}
        />
      );
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const CustomSavingStrategyCard = ({
  strategy = null,

  onView,
  onActivate,
  onPause,
  onResume,

  compact = false,
  showProgress = true,
  showActions = true,

  className = "",
}) => {
  /* =======================================================
     DATA GUARD
  ======================================================= */

  if (
    !strategy ||
    typeof strategy !== "object" ||
    Array.isArray(strategy)
  ) {
    return null;
  }

  /* =======================================================
     IDENTIFIER
  ======================================================= */

  const strategyId = getId(strategy);

  /* =======================================================
     BASIC INFORMATION
  ======================================================= */

  const title =
    getText(
      strategy.name,
      strategy.title,
      strategy.planName,
      strategy.strategyName
    ) || "Custom saving strategy";

  const description = getText(
    strategy.description,
    strategy.summary,
    strategy.note
  );

  /* =======================================================
     STATUS
  ======================================================= */

  const status =
    normalizeStatus(strategy);

  const statusConfig =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.draft;

  /* =======================================================
     STRATEGY TYPE
  ======================================================= */

  const strategyType =
    normalizeStrategyType(strategy);

  const strategyConfig =
    STRATEGY_CONFIG[strategyType] ??
    FALLBACK_STRATEGY_CONFIG;

  /* =======================================================
     CURRENCY
  ======================================================= */

  const currency =
    getText(
      strategy.currency,
      strategy.targetCurrency,
      strategy.savingAccount?.currency
    ) || DEFAULT_CURRENCY;

  /* =======================================================
     FINANCIAL VALUES
  ======================================================= */

  const currentAmount =
    getCurrentAmount(strategy);

  const targetAmount =
    getTargetAmount(strategy);

  const contributionAmount =
    getContributionAmount(strategy);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress =
    getProgress(
      strategy,
      currentAmount,
      targetAmount
    );

  const roundedProgress =
    Math.round(progress);

  /* =======================================================
     FREQUENCY
  ======================================================= */

  const frequency =
    normalizeFrequency(strategy);

  const frequencyLabel =
    FREQUENCY_LABELS[frequency] ??
    "Monthly";

  /* =======================================================
     NEXT EXECUTION
  ======================================================= */

  const nextExecution =
    safeFormatDate(
      strategy.nextExecutionAt ??
        strategy.nextContributionAt ??
        strategy.schedule?.nextExecutionAt
    );

  /* =======================================================
     FORMATTED VALUES
  ======================================================= */

  const formattedCurrentAmount =
    safeFormatCurrency(
      currentAmount,
      currency
    ) ?? `${currency} 0`;

  const formattedTargetAmount =
    targetAmount > 0
      ? safeFormatCurrency(
          targetAmount,
          currency
        )
      : null;

  const formattedContributionAmount =
    contributionAmount > 0
      ? safeFormatCurrency(
          contributionAmount,
          currency
        )
      : null;

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const hasView =
    typeof onView === "function";

  const hasActivate =
    (status === "draft" ||
      status === "cancelled") &&
    typeof onActivate === "function";

  const hasPause =
    status === "active" &&
    typeof onPause === "function";

  const hasResume =
    status === "paused" &&
    typeof onResume === "function";

  const hasActions =
    showActions &&
    (
      hasView ||
      hasActivate ||
      hasPause ||
      hasResume
    );

  /* =======================================================
     EVENT HANDLERS

     These are intentionally local handlers.
     They do not participate in effect dependencies,
     therefore useCallback is unnecessary.
  ======================================================= */

  const handleView = () => {
    if (hasView) {
      onView(strategy, strategyId);
    }
  };

  const handleActivate = () => {
    if (hasActivate) {
      onActivate(strategy, strategyId);
    }
  };

  const handlePause = () => {
    if (hasPause) {
      onPause(strategy, strategyId);
    }
  };

  const handleResume = () => {
    if (hasResume) {
      onResume(strategy, strategyId);
    }
  };

  /* =======================================================
     CARD CLASS
  ======================================================= */

  const cardClassName = [
    "group",
    "relative",
    "overflow-hidden",
    "rounded-2xl",
    "border",
    "border-slate-200",
    "bg-white",
    "shadow-sm",
    "transition-all",
    "duration-200",
    "hover:shadow-md",
    compact ? "p-4" : "p-5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className={cardClassName}
      data-strategy-id={
        strategyId ?? undefined
      }
      aria-label={`${title} savings strategy`}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="flex justify-between items-start gap-4"
      >
        <div
          className="flex items-start gap-3 min-w-0"
        >
          <div
            className="flex justify-center items-center bg-slate-100 rounded-xl w-11 h-11 text-slate-700 shrink-0"
            aria-hidden="true"
          >
            <StrategyIcon
              strategyType={strategyType}
              size={21}
              strokeWidth={2}
            />
          </div>

          <div
            className="min-w-0"
          >
            <h3
              className="font-semibold text-slate-900 text-sm line-clamp-2 leading-5"
            >
              {title}
            </h3>

            <div
              className="flex flex-wrap items-center gap-1.5 mt-2"
            >
              <span
                title={strategyConfig.description}
                className="inline-flex items-center bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px] text-slate-700"
              >
                {strategyConfig.label}
              </span>

              <span
                className={`
                  inline-flex items-center
                  gap-1
                  rounded-full
                  border
                  px-2 py-0.5
                  text-[10px]
                  font-semibold
                  ${statusConfig.badge}
                `}
              >
                <StatusIcon
                  status={status}
                  size={11}
                  strokeWidth={2}
                />

                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {hasView && (
          <button
            type="button"
            onClick={handleView}
            className="inline-flex justify-center items-center hover:bg-slate-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-400 hover:text-slate-700 transition shrink-0"
            aria-label={`View ${title}`}
          >
            <ArrowRight
              size={17}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        )}
      </header>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      {description && (
        <p
          className="mt-4 text-slate-600 text-sm leading-6"
        >
          {description}
        </p>
      )}

      {/* ===================================================
          STRATEGY SUMMARY
      =================================================== */}

      <div
        className="gap-3 grid grid-cols-2 mt-5"
      >
        <div
          className="bg-slate-50/70 p-3 border border-slate-200 rounded-xl min-w-0"
        >
          <div
            className="flex items-center gap-2 text-slate-500"
          >
            <PiggyBank
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span
              className="font-medium text-[11px]"
            >
              Current savings
            </span>
          </div>

          <p
            className="mt-1 font-bold text-slate-900 text-sm truncate"
            title={formattedCurrentAmount}
          >
            {formattedCurrentAmount}
          </p>
        </div>

        <div
          className="bg-slate-50/70 p-3 border border-slate-200 rounded-xl min-w-0"
        >
          <div
            className="flex items-center gap-2 text-slate-500"
          >
            <Target
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span
              className="font-medium text-[11px]"
            >
              Target
            </span>
          </div>

          <p
            className="mt-1 font-bold text-slate-900 text-sm truncate"
            title={
              formattedTargetAmount ??
              "No target"
            }
          >
            {formattedTargetAmount ??
              "No target"}
          </p>
        </div>
      </div>

      {/* ===================================================
          CONTRIBUTION
      =================================================== */}

      {formattedContributionAmount && (
        <div
          className="bg-white mt-4 p-3 border border-slate-200 rounded-xl"
        >
          <div
            className="flex justify-between items-center gap-3"
          >
            <div
              className="flex items-center gap-2 min-w-0 text-slate-500"
            >
              <Wallet
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span
                className="font-medium text-[11px]"
              >
                Contribution
              </span>
            </div>

            <span
              className="font-bold text-slate-900 text-sm truncate"
              title={formattedContributionAmount}
            >
              {formattedContributionAmount}
            </span>
          </div>
        </div>
      )}

      {/* ===================================================
          PROGRESS
      =================================================== */}

      {showProgress &&
        targetAmount > 0 && (
          <div
            className="mt-5"
          >
            <div
              className="flex justify-between items-center gap-3"
            >
              <span
                className="font-medium text-slate-600 text-xs"
              >
                Goal progress
              </span>

              <span
                className="font-bold text-slate-900 text-xs"
              >
                {roundedProgress}%
              </span>
            </div>

            <div
              className="bg-slate-100 mt-2 rounded-full h-2 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={roundedProgress}
              aria-label={`${title} progress`}
            >
              <div
                className="bg-slate-900 rounded-full h-full transition-[width] duration-500"
                style={{
                  width: `${progress}%`,
                }}
              /
              >
            </div>
          </div>
        )}

      {/* ===================================================
          SCHEDULE
      =================================================== */}

      <div
        className="flex flex-wrap gap-3 mt-5 pt-4 border-slate-100 border-t"
      >
        <div
          className="inline-flex items-center gap-2 text-slate-600 text-xs"
        >
          <CalendarClock
            size={14}
            strokeWidth={2}
            className="text-slate-400"
            aria-hidden="true"
          /
          >

          <span>
            {frequencyLabel}
          </span>
        </div>

        {nextExecution && (
          <div
            className="inline-flex items-center gap-2 text-slate-600 text-xs"
          >
            <Clock3
              size={14}
              strokeWidth={2}
              className="text-slate-400"
              aria-hidden="true"
            /
            >

            <span>
              Next:{" "}
              <strong
                className="font-semibold text-slate-800"
              >
                {nextExecution}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ===================================================
          ACTIONS
      =================================================== */}

      {hasActions && (
        <footer
          className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mt-5 pt-4 border-slate-100 border-t"
        >
          <div
            className="flex flex-wrap items-center gap-2"
          >
            {hasActivate && (
              <button
                type="button"
                onClick={handleActivate}
                className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-9 font-semibold text-white text-sm transition"
              >
                <Play
                  size={14}
                  strokeWidth={2}
                  fill="currentColor"
                  aria-hidden="true"
                />

                Activate
              </button>
            )}

            {hasPause && (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 min-h-9 font-semibold text-slate-700 text-sm transition"
              >
                <CirclePause
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                Pause
              </button>
            )}

            {hasResume && (
              <button
                type="button"
                onClick={handleResume}
                className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-9 font-semibold text-white text-sm transition"
              >
                <Play
                  size={14}
                  strokeWidth={2}
                  fill="currentColor"
                  aria-hidden="true"
                />

                Resume
              </button>
            )}
          </div>

          {hasView && (
            <button
              type="button"
              onClick={handleView}
              className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 min-h-9 font-semibold text-slate-700 text-sm transition"
            >
              View strategy

              <ArrowRight
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          )}
        </footer>
      )}

      {/* ===================================================
          ACCESSIBILITY
      =================================================== */}

      {strategyId && (
        <span
          className="sr-only"
        >
          Strategy ID: {strategyId}
        </span>
      )}
    </article>
  );
};

/* =========================================================
   COMPONENT CONTRACT
========================================================= */

CustomSavingStrategyCard.displayName =
  "CustomSavingStrategyCard";

export default memo(
  CustomSavingStrategyCard
);
