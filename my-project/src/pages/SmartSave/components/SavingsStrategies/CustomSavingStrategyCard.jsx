import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CirclePause,
  Clock3,
  PiggyBank,
  Play,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SAVINGS_PLAN_STATUS,
  SAVINGS_FREQUENCIES,
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
  formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  calculateProgressPercentage,
} from "../../../../utils/smartSave/savingsProgress";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_STATUS =
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = Object.freeze({
  active: {
    label: "Active",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  paused: {
    label: "Paused",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  completed: {
    label: "Completed",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  cancelled: {
    label: "Cancelled",
    badge:
      "bg-red-50 text-red-700 border-red-200",
  },

  draft: {
    label: "Draft",
    badge:
      "bg-slate-50 text-slate-600 border-slate-200",
  },
});

/* =========================================================
   STRATEGY CONFIGURATION
========================================================= */

const STRATEGY_CONFIG = Object.freeze({
  [SAVINGS_STRATEGIES?.FIXED ?? "fixed"]: {
    label: "Fixed amount",
    description:
      "Save a consistent amount on every contribution.",
  },

  [SAVINGS_STRATEGIES?.PERCENTAGE ?? "percentage"]: {
    label: "Percentage",
    description:
      "Automatically save a percentage of your available income.",
  },

  [SAVINGS_STRATEGIES?.ROUND_UP ?? "round_up"]: {
    label: "Round-up",
    description:
      "Build savings gradually through transaction round-ups.",
  },

  [SAVINGS_STRATEGIES?.GOAL_BASED ?? "goal_based"]: {
    label: "Goal based",
    description:
      "Adjust contributions around a specific savings target.",
  },
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
   FALLBACK CONFIGURATION
========================================================= */

const FALLBACK_STRATEGY_CONFIG = Object.freeze({
  label: "Custom strategy",
  description: "Personalized savings strategy.",
});

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const getText = (...values) => {
  const value = values.find(
    (item) =>
      typeof item === "string" &&
      item.trim().length > 0
  );

  return value?.trim() || "";
};

const getId = (strategy) => {
  if (!strategy || typeof strategy !== "object") {
    return null;
  }

  const id =
    strategy._id ??
    strategy.id ??
    strategy.planId ??
    strategy.strategyId;

  return id !== null &&
    id !== undefined &&
    String(id).trim()
    ? String(id)
    : null;
};

const getNumericValue = (...values) => {
  const value = values.find(
    (item) =>
      item !== null &&
      item !== undefined &&
      item !== ""
  );

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeStatus = (strategy) => {
  const status = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  return STATUS_CONFIG[status]
    ? status
    : DEFAULT_STATUS;
};

const normalizeFrequency = (strategy) => {
  const frequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  return FREQUENCY_LABELS[frequency]
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
   AMOUNT HELPERS
========================================================= */

const getCurrentAmount = (strategy) =>
  getNumericValue(
    strategy?.currentAmount,
    strategy?.savedAmount,
    strategy?.progress?.current,
    strategy?.metrics?.savedAmount
  );

const getTargetAmount = (strategy) =>
  getNumericValue(
    strategy?.targetAmount,
    strategy?.target,
    strategy?.goalAmount,
    strategy?.progress?.target
  );

const getContributionAmount = (strategy) =>
  getNumericValue(
    strategy?.contributionAmount,
    strategy?.amount,
    strategy?.savingAmount,
    strategy?.metrics?.contributionAmount
  );

/* =========================================================
   PROGRESS
========================================================= */

const clampPercentage = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, numericValue)
  );
};

const getProgress = (strategy) => {
  const explicitProgress =
    strategy?.progressPercentage ??
    strategy?.progress?.percentage ??
    strategy?.metrics?.progressPercentage;

  if (
    explicitProgress !== null &&
    explicitProgress !== undefined &&
    explicitProgress !== ""
  ) {
    return clampPercentage(
      explicitProgress
    );
  }

  const currentAmount =
    getCurrentAmount(strategy);

  const targetAmount =
    getTargetAmount(strategy);

  if (targetAmount <= 0) {
    return 0;
  }

  try {
    return clampPercentage(
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );
  } catch {
    return clampPercentage(
      (currentAmount / targetAmount) * 100
    );
  }
};

/* =========================================================
   DATE FORMATTING
========================================================= */

const safeFormatDate = (value) => {
  if (!value) {
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
    // Fall through to native Date formatting.
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

/* =========================================================
   CURRENCY FORMATTING
========================================================= */

const safeFormatCurrency = (
  amount,
  currency
) => {
  if (!Number.isFinite(Number(amount))) {
    return null;
  }

  try {
    return formatCurrency(
      Number(amount),
      currency
    );
  } catch {
    try {
      return `${currency} ${Number(
        amount
      ).toLocaleString()}`;
    } catch {
      return null;
    }
  }
};

/* =========================================================
   STATUS ICON
========================================================= */

/**
 * Stable component.
 *
 * Important:
 * We intentionally do NOT do this inside the card:
 *
 * const StatusIcon = statusConfig.icon;
 *
 * That pattern can trigger React's static-component
 * validation and causes unnecessary component identity
 * concerns during rendering.
 */
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

/**
 * Stable component.
 *
 * The switch keeps all icon component references static
 * and avoids creating a component variable inside render.
 */
const StrategyIcon = ({
  strategyType,
  size = 20,
  strokeWidth = 2,
}) => {
  switch (strategyType) {
    case SAVINGS_STRATEGIES?.FIXED ??
      "fixed":
      return (
        <PiggyBank
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case SAVINGS_STRATEGIES?.PERCENTAGE ??
      "percentage":
      return (
        <TrendingUp
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case SAVINGS_STRATEGIES?.ROUND_UP ??
      "round_up":
      return (
        <Wallet
          size={size}
          strokeWidth={strokeWidth}
        />
      );

    case SAVINGS_STRATEGIES?.GOAL_BASED ??
      "goal_based":
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

  /**
   * Parent-controlled lifecycle actions.
   */
  onView,
  onActivate,
  onPause,
  onResume,

  /**
   * Optional display configuration.
   */
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
     NORMALIZED DATA
  ======================================================= */

  const strategyId = getId(strategy);

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

  const status = normalizeStatus(
    strategy
  );

  const statusConfig =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.draft;

  const strategyType =
    normalizeStrategyType(strategy);

  const strategyConfig =
    STRATEGY_CONFIG[strategyType] ??
    FALLBACK_STRATEGY_CONFIG;

  const frequency =
    normalizeFrequency(strategy);

  const frequencyLabel =
    FREQUENCY_LABELS[frequency] ??
    frequency;

  const currency =
    getText(
      strategy.currency,
      strategy.targetCurrency,
      strategy.savingAccount?.currency
    ) || DEFAULT_CURRENCY;

  const currentAmount =
    getCurrentAmount(strategy);

  const targetAmount =
    getTargetAmount(strategy);

  const contributionAmount =
    getContributionAmount(strategy);

  const progress =
    getProgress(strategy);

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

  const roundedProgress =
    Math.round(progress);

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const hasViewAction =
    typeof onView === "function";

  const canActivate =
    status === "draft" ||
    status === "cancelled";

  const canPause =
    status === "active";

  const canResume =
    status === "paused";

  const hasActivateAction =
    canActivate &&
    typeof onActivate === "function";

  const hasPauseAction =
    canPause &&
    typeof onPause === "function";

  const hasResumeAction =
    canResume &&
    typeof onResume === "function";

  const hasLifecycleAction =
    hasActivateAction ||
    hasPauseAction ||
    hasResumeAction;

  const shouldShowActions =
    showActions &&
    (hasLifecycleAction ||
      hasViewAction);

  /* =======================================================
     ACTION HANDLERS
  ======================================================= */

  const handleView = () => {
    if (!hasViewAction) {
      return;
    }

    onView(strategy, strategyId);
  };

  const handleActivate = () => {
    if (!hasActivateAction) {
      return;
    }

    onActivate(strategy, strategyId);
  };

  const handlePause = () => {
    if (!hasPauseAction) {
      return;
    }

    onPause(strategy, strategyId);
  };

  const handleResume = () => {
    if (!hasResumeAction) {
      return;
    }

    onResume(strategy, strategyId);
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
        border-slate-200
        bg-white
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-md
        ${compact ? "p-4" : "p-5"}
        ${className}
      `}
      aria-label={`${title} savings strategy`}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="
          flex justify-between items-start
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
              w-11 h-11
              text-slate-700
              bg-slate-100
              rounded-xl
              shrink-0
            "
            aria-hidden="true"
          >
            <StrategyIcon
              strategyType={strategyType}
              size={20}
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

            <div
              className="
                flex flex-wrap items-center
                mt-2
                gap-1.5
              "
            >
              <span
                title={
                  strategyConfig.description
                }
                className="
                  inline-flex items-center
                  px-2 py-0.5
                  font-semibold text-[10px] text-slate-700
                  bg-slate-100
                  rounded-full
                "
              >
                {strategyConfig.label}
              </span>

              <span
                className={`
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  border
                  px-2
                  py-0.5
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

        {hasViewAction && (
          <button
            type="button"
            onClick={handleView}
            className="
              inline-flex justify-center items-center
              p-2
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300
              transition
              shrink-0
            "
            aria-label={`View ${title}`}
          >
            <ChevronRight
              size={18}
              strokeWidth={2}
            />
          </button>
        )}
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
          STRATEGY DETAILS
      =================================================== */}

      <div
        className="
          grid grid-cols-2
          mt-5
          gap-3
        "
      >
        <div
          className="
            p-3
            bg-slate-50/70
            border border-slate-200 rounded-xl
          "
        >
          <div
            className="
              flex items-center
              text-slate-500
              gap-2
            "
          >
            <PiggyBank
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span
              className="
                font-medium text-[11px]
              "
            >
              Current savings
            </span>
          </div>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-sm
            "
          >
            {formattedCurrentAmount}
          </p>
        </div>

        <div
          className="
            p-3
            bg-slate-50/70
            border border-slate-200 rounded-xl
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
              strokeWidth={2}
              aria-hidden="true"
            />

            <span
              className="
                font-medium text-[11px]
              "
            >
              Target
            </span>
          </div>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-sm
            "
          >
            {formattedTargetAmount ??
              "No target"}
          </p>
        </div>
      </div>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      {showProgress &&
        targetAmount > 0 && (
          <div
            className="
              mt-5
            "
          >
            <div
              className="
                flex justify-between items-center
                gap-3
              "
            >
              <span
                className="
                  font-medium text-slate-600 text-xs
                "
              >
                Progress
              </span>

              <span
                className="
                  font-bold text-slate-900 text-xs
                "
              >
                {roundedProgress}%
              </span>
            </div>

            <div
              className="
                overflow-hidden
                h-2
                mt-2
                bg-slate-100
                rounded-full
              "
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                roundedProgress
              }
              aria-label={`${title} progress`}
            >
              <div
                className="
                  h-full
                  bg-slate-900
                  rounded-full
                  transition-all duration-500
                "
                style={{
                  width: `${progress}%`,
                }}
              /
              >
            </div>
          </div>
        )}

      {/* ===================================================
          SCHEDULE INFORMATION
      =================================================== */}

      <div
        className="
          flex flex-wrap
          mt-5 pt-4
          border-slate-100 border-t
          gap-3
        "
      >
        <div
          className="
            inline-flex items-center
            text-slate-600 text-xs
            gap-2
          "
        >
          <CalendarClock
            size={14}
            strokeWidth={2}
            className="
              text-slate-400
            "
            aria-hidden="true"
          /
          >

          <span>
            {frequencyLabel}
          </span>
        </div>

        {formattedContributionAmount && (
          <div
            className="
              inline-flex items-center
              text-slate-600 text-xs
              gap-2
            "
          >
            <PiggyBank
              size={14}
              strokeWidth={2}
              className="
                text-slate-400
              "
              aria-hidden="true"
            /
            >

            <span>
              {formattedContributionAmount}
            </span>
          </div>
        )}

        {nextExecution && (
          <div
            className="
              inline-flex items-center
              text-slate-600 text-xs
              gap-2
            "
          >
            <Clock3
              size={14}
              strokeWidth={2}
              className="
                text-slate-400
              "
              aria-hidden="true"
            /
            >

            <span>
              Next: {nextExecution}
            </span>
          </div>
        )}
      </div>

      {/* ===================================================
          ACTIONS
      =================================================== */}

      {shouldShowActions && (
        <footer
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-5 pt-4
            border-slate-100 border-t
            gap-2
          "
        >
          <div>
            {hasActivateAction && (
              <button
                type="button"
                onClick={handleActivate}
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3.5 py-2
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  transition
                  gap-2
                "
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

            {hasPauseAction && (
              <button
                type="button"
                onClick={handlePause}
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3.5 py-2
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                <CirclePause
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                Pause
              </button>
            )}

            {hasResumeAction && (
              <button
                type="button"
                onClick={handleResume}
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3.5 py-2
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-lg focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  transition
                  gap-2
                "
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

          {hasViewAction && (
            <button
              type="button"
              onClick={handleView}
              className="
                inline-flex justify-center items-center
                min-h-9
                px-3.5 py-2
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                transition
                gap-2
              "
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
          className="
            sr-only
          "
        >
          Strategy ID: {strategyId}
        </span>
      )}
    </article>
  );
};

CustomSavingStrategyCard.displayName =
  "CustomSavingStrategyCard";

export default CustomSavingStrategyCard;