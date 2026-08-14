
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
  SAVINGS_PLAN_STATUS?.DRAFT ??
  "draft";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ??
  "monthly";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  paused: {
    label: "Paused",
    icon: CirclePause,
    badge:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  cancelled: {
    label: "Cancelled",
    icon: CirclePause,
    badge:
      "bg-red-50 text-red-700 border-red-200",
  },

  draft: {
    label: "Draft",
    icon: Clock3,
    badge:
      "bg-slate-50 text-slate-600 border-slate-200",
  },
};

/* =========================================================
   STRATEGY CONFIGURATION
========================================================= */

const STRATEGY_CONFIG = {
  [SAVINGS_STRATEGIES?.FIXED ??
    "fixed"]: {
    label: "Fixed amount",
    description:
      "Save a consistent amount on every contribution.",
    icon: PiggyBank,
  },

  [SAVINGS_STRATEGIES?.PERCENTAGE ??
    "percentage"]: {
    label: "Percentage",
    description:
      "Automatically save a percentage of your available income.",
    icon: TrendingUp,
  },

  [SAVINGS_STRATEGIES?.ROUND_UP ??
    "round_up"]: {
    label: "Round-up",
    description:
      "Build savings gradually through transaction round-ups.",
    icon: Wallet,
  },

  [SAVINGS_STRATEGIES?.GOAL_BASED ??
    "goal_based"]: {
    label: "Goal based",
    description:
      "Adjust contributions around a specific savings target.",
    icon: Target,
  },
};

/* =========================================================
   FREQUENCY LABELS
========================================================= */

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

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
  const id =
    strategy?._id ??
    strategy?.id ??
    strategy?.planId ??
    strategy?.strategyId;

  return id ? String(id) : null;
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

  return (
    FREQUENCY_LABELS[frequency]
      ? frequency
      : DEFAULT_FREQUENCY
  );
};

const normalizeStrategyType = (strategy) => {
  return getText(
    strategy?.strategy,
    strategy?.strategyType,
    strategy?.method,
    strategy?.type
  ).toLowerCase();
};

/* =========================================================
   PROGRESS HELPER
========================================================= */

const getProgress = (strategy) => {
  const explicitProgress =
    strategy?.progressPercentage ??
    strategy?.progress?.percentage ??
    strategy?.metrics?.progressPercentage;

  if (
    explicitProgress !== null &&
    explicitProgress !== undefined
  ) {
    const numericProgress =
      Number(explicitProgress);

    if (
      Number.isFinite(numericProgress)
    ) {
      return Math.min(
        100,
        Math.max(0, numericProgress)
      );
    }
  }

  const currentAmount =
    getNumericValue(
      strategy?.currentAmount,
      strategy?.savedAmount,
      strategy?.progress?.current,
      strategy?.metrics?.savedAmount
    );

  const targetAmount =
    getNumericValue(
      strategy?.targetAmount,
      strategy?.target,
      strategy?.goalAmount,
      strategy?.progress?.target
    );

  if (targetAmount <= 0) {
    return 0;
  }

  try {
    return Math.min(
      100,
      Math.max(
        0,
        Number(
          calculateProgressPercentage(
            currentAmount,
            targetAmount
          )
        ) || 0
      )
    );
  } catch {
    return Math.min(
      100,
      Math.max(
        0,
        (currentAmount / targetAmount) * 100
      )
    );
  }
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const safeFormatDate = (value) => {
  if (!value) {
    return null;
  }

  try {
    return formatDate(value);
  } catch {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString();
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
    typeof strategy !== "object"
  ) {
    return null;
  }

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const strategyId =
    getId(strategy);

  const title =
    getText(
      strategy.name,
      strategy.title,
      strategy.planName,
      strategy.strategyName
    ) || "Custom saving strategy";

  const description =
    getText(
      strategy.description,
      strategy.summary,
      strategy.note
    );

  const status =
    normalizeStatus(strategy);

  const statusConfig =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.draft;

  const StatusIcon =
    statusConfig.icon;

  const strategyType =
    normalizeStrategyType(
      strategy
    );

  const strategyConfig =
    STRATEGY_CONFIG[
      strategyType
    ] ?? {
      label: "Custom strategy",
      description:
        "Personalized savings strategy.",
      icon: PiggyBank,
    };

  const StrategyIcon =
    strategyConfig.icon;

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
    getNumericValue(
      strategy.currentAmount,
      strategy.savedAmount,
      strategy.progress?.current,
      strategy.metrics?.savedAmount
    );

  const targetAmount =
    getNumericValue(
      strategy.targetAmount,
      strategy.target,
      strategy.goalAmount,
      strategy.progress?.target
    );

  const contributionAmount =
    getNumericValue(
      strategy.contributionAmount,
      strategy.amount,
      strategy.savingAmount,
      strategy.metrics?.contributionAmount
    );

  const progress =
    getProgress(strategy);

  const nextExecution =
    safeFormatDate(
      strategy.nextExecutionAt ??
      strategy.nextContributionAt ??
      strategy.schedule?.nextExecutionAt
    );

  const formattedCurrentAmount =
    formatCurrency(
      currentAmount,
      currency
    );

  const formattedTargetAmount =
    targetAmount > 0
      ? formatCurrency(
          targetAmount,
          currency
        )
      : null;

  const formattedContributionAmount =
    contributionAmount > 0
      ? formatCurrency(
          contributionAmount,
          currency
        )
      : null;

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const canActivate =
    status === "draft" ||
    status === "cancelled";

  const canPause =
    status === "active";

  const canResume =
    status === "paused";

  const hasViewAction =
    typeof onView === "function";

  const hasLifecycleAction =
    (canActivate &&
      typeof onActivate === "function") ||
    (canPause &&
      typeof onPause === "function") ||
    (canResume &&
      typeof onResume === "function");

  /* =======================================================
     ACTION HANDLERS
  ======================================================= */

  const handleView = () => {
    if (
      typeof onView !== "function"
    ) {
      return;
    }

    onView(
      strategy,
      strategyId
    );
  };

  const handleActivate = () => {
    if (
      typeof onActivate !== "function"
    ) {
      return;
    }

    onActivate(
      strategy,
      strategyId
    );
  };

  const handlePause = () => {
    if (
      typeof onPause !== "function"
    ) {
      return;
    }

    onPause(
      strategy,
      strategyId
    );
  };

  const handleResume = () => {
    if (
      typeof onResume !== "function"
    ) {
      return;
    }

    onResume(
      strategy,
      strategyId
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
        border-slate-200
        bg-white
        shadow-sm
        transition
        duration-200
        hover:shadow-md
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
                {Math.round(progress)}%
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
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(
                progress
              )}
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
            className="
              text-slate-400
            "
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
              className="
                text-slate-400
              "
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
              className="
                text-slate-400
              "
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

      {showActions &&
        (hasLifecycleAction ||
          hasViewAction) && (
          <footer
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              mt-5 pt-4
              border-slate-100 border-t
              gap-2
            "
          >
            <div>
              {canActivate &&
                typeof onActivate ===
                  "function" && (
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
                      fill="currentColor"
                    />

                    Activate
                  </button>
                )}

              {canPause &&
                typeof onPause ===
                  "function" && (
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
                      focus:ring-2 focus:ring-slate-300
                      transition
                      gap-2
                    "
                  >
                    <CirclePause
                      size={14}
                    />

                    Pause
                  </button>
                )}

              {canResume &&
                typeof onResume ===
                  "function" && (
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
                      fill="currentColor"
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
                  focus:ring-2 focus:ring-slate-300
                  transition
                  gap-2
                "
              >
                View strategy

                <ArrowRight
                  size={14}
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

export default CustomSavingStrategyCard;