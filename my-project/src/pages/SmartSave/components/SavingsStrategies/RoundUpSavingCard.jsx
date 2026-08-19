import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  Clock3,
  Coins,
  Percent,
  PiggyBank,
  Play,
  ReceiptText,
  Target,
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

const DEFAULT_STATUS = String(
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft"
).toLowerCase();

const DEFAULT_FREQUENCY = String(
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly"
).toLowerCase();

const DEFAULT_STRATEGY = String(
  SAVINGS_STRATEGIES?.ROUND_UP ?? "round_up"
).toLowerCase();

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  paused: {
    label: "Paused",
    icon: CirclePause,
    badge:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  cancelled: {
    label: "Cancelled",
    icon: CirclePause,
    badge:
      "border-red-200 bg-red-50 text-red-700",
  },

  draft: {
    label: "Draft",
    icon: Clock3,
    badge:
      "border-slate-200 bg-slate-50 text-slate-600",
  },
};

/* =========================================================
   FREQUENCY LABELS
========================================================= */

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  fortnightly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  annual: "Yearly",
};

/* =========================================================
   ROUND-UP MODE LABELS
========================================================= */

const ROUND_UP_MODE_LABELS = {
  nearest: "Nearest amount",
  nearest_10: "Nearest ₦10",
  nearest_50: "Nearest ₦50",
  nearest_100: "Nearest ₦100",
  nearest_500: "Nearest ₦500",
  nearest_1000: "Nearest ₦1,000",
};

/* =========================================================
   STRATEGY TYPE ALIASES
========================================================= */

const ROUND_UP_STRATEGY_TYPES = new Set([
  DEFAULT_STRATEGY,
  "round_up",
  "round-up",
  "roundup",
  "round_up_saving",
  "round_up_savings",
]);

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

/**
 * Returns the first non-empty string.
 */
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

/**
 * Safely resolves a strategy identifier.
 */
const getId = (strategy) => {
  if (!strategy || typeof strategy !== "object") {
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
    id === ""
  ) {
    return null;
  }

  return String(id);
};

/**
 * Safely converts numeric values.
 *
 * Unlike Number(value), this intentionally rejects
 * booleans and arbitrary objects.
 */
const getNumber = (...values) => {
  for (const value of values) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      const number = Number(value);

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
};

/**
 * Percentage values are always constrained to 0–100.
 */
const getPercentage = (...values) => {
  const value = getNumber(...values);

  return Math.min(
    100,
    Math.max(0, value)
  );
};

/**
 * Financial amounts displayed by this card cannot
 * be negative.
 */
const getNonNegativeNumber = (...values) => {
  return Math.max(0, getNumber(...values));
};

/**
 * Safely converts a value into a non-negative integer.
 */
const getInteger = (...values) => {
  return Math.max(
    0,
    Math.floor(getNumber(...values))
  );
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeStatus = (strategy) => {
  const status = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  if (STATUS_CONFIG[status]) {
    return status;
  }

  return STATUS_CONFIG[DEFAULT_STATUS]
    ? DEFAULT_STATUS
    : "draft";
};

const normalizeFrequency = (strategy) => {
  const frequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  if (FREQUENCY_LABELS[frequency]) {
    return frequency;
  }

  return FREQUENCY_LABELS[DEFAULT_FREQUENCY]
    ? DEFAULT_FREQUENCY
    : "monthly";
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
   STRATEGY TYPE GUARD
========================================================= */

const isRoundUpStrategy = (strategy) => {
  const type =
    normalizeStrategyType(strategy);

  /*
   * Important:
   *
   * We deliberately DO NOT treat a missing type as
   * round-up. A missing type is ambiguous and should
   * not cause this component to render the wrong
   * strategy.
   */
  if (!type) {
    return false;
  }

  return ROUND_UP_STRATEGY_TYPES.has(type);
};

/* =========================================================
   PROGRESS
========================================================= */

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
    return getPercentage(
      explicitProgress
    );
  }

  if (targetAmount <= 0) {
    return 0;
  }

  try {
    const calculated = Number(
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );

    if (Number.isFinite(calculated)) {
      return Math.min(
        100,
        Math.max(0, calculated)
      );
    }
  } catch {
    // Fall through to deterministic calculation.
  }

  const fallback =
    (currentAmount / targetAmount) * 100;

  return Math.min(
    100,
    Math.max(0, fallback)
  );
};

/* =========================================================
   SAFE FORMATTERS
========================================================= */

const safeFormatCurrency = (
  amount,
  currency
) => {
  try {
    const formatted = formatCurrency(
      amount,
      currency
    );

    return (
      typeof formatted === "string" &&
      formatted.trim()
    )
      ? formatted
      : `${currency} ${amount.toLocaleString()}`;
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

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
      return formatted;
    }
  } catch {
    // Use native fallback.
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

/* =========================================================
   COMPONENT
========================================================= */

const RoundUpSavingCard = ({
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
     STRATEGY TYPE GUARD
  ======================================================= */

  if (!isRoundUpStrategy(strategy)) {
    return null;
  }

  /* =======================================================
     IDENTIFICATION
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
    ) || "Round-up savings";

  const description =
    getText(
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

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     CURRENCY
  ======================================================= */

  const currency =
    getText(
      strategy.currency,
      strategy.targetCurrency,
      strategy.savingAccount?.currency,
      strategy.savingsAccount?.currency
    ).toUpperCase() || DEFAULT_CURRENCY;

  /* =======================================================
     FINANCIAL VALUES
  ======================================================= */

  const currentAmount =
    getNonNegativeNumber(
      strategy.currentAmount,
      strategy.savedAmount,
      strategy.progress?.current,
      strategy.metrics?.savedAmount
    );

  const targetAmount =
    getNonNegativeNumber(
      strategy.targetAmount,
      strategy.target,
      strategy.goalAmount,
      strategy.progress?.target
    );

  /* =======================================================
     ROUND-UP ACTIVITY
  ======================================================= */

  const totalRoundUpAmount =
    getNonNegativeNumber(
      strategy.totalRoundUpAmount,
      strategy.totalRoundUps,
      strategy.roundUpAmount,
      strategy.metrics?.totalRoundUpAmount,
      strategy.progress?.roundUpAmount
    );

  const averageRoundUp =
    getNonNegativeNumber(
      strategy.averageRoundUp,
      strategy.averageRoundUpAmount,
      strategy.metrics?.averageRoundUp
    );

  const transactionCount =
    getInteger(
      strategy.transactionCount,
      strategy.roundUpTransactionCount,
      strategy.metrics?.transactionCount,
      strategy.metrics?.roundUpTransactionCount
    );

  /* =======================================================
     ROUND-UP CONFIGURATION
  ======================================================= */

  const roundUpIncrement =
    getNonNegativeNumber(
      strategy.roundUpTo,
      strategy.roundUpIncrement,
      strategy.roundingAmount,
      strategy.configuration?.roundUpTo,
      strategy.config?.roundUpTo,
      strategy.strategyConfig?.roundUpTo
    );

  const roundUpMode =
    getText(
      strategy.roundUpMode,
      strategy.roundingMode,
      strategy.configuration?.roundUpMode,
      strategy.config?.roundUpMode,
      strategy.strategyConfig?.roundUpMode
    ).toLowerCase();

  const roundUpModeLabel =
    ROUND_UP_MODE_LABELS[roundUpMode] ??
    (
      roundUpIncrement > 0
        ? `Nearest ${safeFormatCurrency(
            roundUpIncrement,
            currency
          )}`
        : "Automatic round-up"
    );

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
     FORMATTED VALUES
  ======================================================= */

  const formattedCurrentAmount =
    safeFormatCurrency(
      currentAmount,
      currency
    );

  const formattedTargetAmount =
    targetAmount > 0
      ? safeFormatCurrency(
          targetAmount,
          currency
        )
      : null;

  const formattedTotalRoundUp =
    totalRoundUpAmount > 0
      ? safeFormatCurrency(
          totalRoundUpAmount,
          currency
        )
      : null;

  const formattedAverageRoundUp =
    averageRoundUp > 0
      ? safeFormatCurrency(
          averageRoundUp,
          currency
        )
      : null;

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
     LIFECYCLE PERMISSIONS
  ======================================================= */

  const hasValidId =
    Boolean(strategyId);

  const hasView =
    typeof onView === "function";

  const hasActivate =
    hasValidId &&
    status === "draft" &&
    typeof onActivate === "function";

  const hasPause =
    hasValidId &&
    status === "active" &&
    typeof onPause === "function";

  const hasResume =
    hasValidId &&
    status === "paused" &&
    typeof onResume === "function";

  /* =======================================================
     CALLBACK HANDLERS
  ======================================================= */

  const handleView = () => {
    if (!hasView) {
      return;
    }

    onView(strategy, strategyId);
  };

  const handleActivate = () => {
    if (!hasActivate) {
      return;
    }

    onActivate(strategy, strategyId);
  };

  const handlePause = () => {
    if (!hasPause) {
      return;
    }

    onPause(strategy, strategyId);
  };

  const handleResume = () => {
    if (!hasResume) {
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
        transition-all
        duration-200
        hover:shadow-md
        ${compact ? "p-4" : "p-5"}
        ${className}
      `}
      data-strategy-id={strategyId ?? undefined}
      data-strategy-type="round_up"
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
            <Coins
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
                className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px] text-slate-700"
              >
                <Coins size={10} />
                Round-up
              </span>

              <span
                className={`
                  inline-flex
                  items-center
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
                  size={11}
                  strokeWidth={2}
                  aria-hidden="true"
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
            className="hover:bg-slate-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-400 hover:text-slate-700 transition shrink-0"
            aria-label={`View ${title}`}
          >
            <ArrowRight
              size={17}
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
          ROUND-UP CONFIGURATION
      =================================================== */}

      <section
        className="bg-slate-50 mt-5 p-4 border border-slate-200 rounded-xl"
        aria-label="Round-up savings configuration"
      >
        <div
          className="flex justify-between items-center gap-4"
        >
          <div
            className="flex items-center gap-3 min-w-0"
          >
            <div
              className="flex justify-center items-center bg-white shadow-sm rounded-lg w-10 h-10 text-slate-700 shrink-0"
              aria-hidden="true"
            >
              <ReceiptText size={18} />
            </div>

            <div
              className="min-w-0"
            >
              <p
                className="font-medium text-slate-500 text-xs"
              >
                Round-up rule
              </p>

              <p
                className="mt-1 font-bold text-slate-900 text-sm truncate"
                title={roundUpModeLabel}
              >
                {roundUpModeLabel}
              </p>
            </div>
          </div>

          <div
            className="text-right shrink-0"
          >
            <p
              className="font-medium text-[11px] text-slate-500"
            >
              Frequency
            </p>

            <p
              className="mt-1 font-semibold text-slate-800 text-xs"
            >
              {frequencyLabel}
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-2 mt-4 text-slate-500 text-xs leading-5"
        >
          <PiggyBank
            size={14}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          /
          >

          <p>
            Spare change from eligible
            transactions is automatically
            allocated toward your savings goal.
          </p>
        </div>
      </section>

      {/* ===================================================
          ROUND-UP ACTIVITY
      =================================================== */}

      {(formattedTotalRoundUp ||
        formattedAverageRoundUp ||
        transactionCount > 0) && (
        <section
          className="gap-3 grid grid-cols-1 sm:grid-cols-3 mt-4"
          aria-label="Round-up activity"
        >
          {formattedTotalRoundUp && (
            <div
              className="bg-white p-3 border border-slate-200 rounded-xl"
            >
              <p
                className="font-medium text-[11px] text-slate-500"
              >
                Total round-ups
              </p>

              <p
                className="mt-1 font-bold text-slate-900 text-sm truncate"
                title={formattedTotalRoundUp}
              >
                {formattedTotalRoundUp}
              </p>
            </div>
          )}

          {formattedAverageRoundUp && (
            <div
              className="bg-white p-3 border border-slate-200 rounded-xl"
            >
              <p
                className="font-medium text-[11px] text-slate-500"
              >
                Average round-up
              </p>

              <p
                className="mt-1 font-bold text-slate-900 text-sm truncate"
                title={formattedAverageRoundUp}
              >
                {formattedAverageRoundUp}
              </p>
            </div>
          )}

          {transactionCount > 0 && (
            <div
              className="bg-white p-3 border border-slate-200 rounded-xl"
            >
              <p
                className="font-medium text-[11px] text-slate-500"
              >
                Transactions
              </p>

              <p
                className="mt-1 font-bold text-slate-900 text-sm"
              >
                {transactionCount.toLocaleString()}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ===================================================
          SAVINGS SUMMARY
      =================================================== */}

      <section
        className="gap-3 grid grid-cols-2 mt-4"
        aria-label="Savings summary"
      >
        <div
          className="bg-white p-3 border border-slate-200 rounded-xl"
        >
          <div
            className="flex items-center gap-1.5"
          >
            <PiggyBank
              size={12}
              className="text-slate-400"
              aria-hidden="true"
            /
            >

            <p
              className="font-medium text-[11px] text-slate-500"
            >
              Saved
            </p>
          </div>

          <p
            className="mt-1 font-bold text-slate-900 text-sm truncate"
            title={formattedCurrentAmount}
          >
            {formattedCurrentAmount}
          </p>
        </div>

        <div
          className="bg-white p-3 border border-slate-200 rounded-xl"
        >
          <div
            className="flex items-center gap-1.5"
          >
            <Target
              size={12}
              className="text-slate-400"
              aria-hidden="true"
            /
            >

            <p
              className="font-medium text-[11px] text-slate-500"
            >
              Target
            </p>
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
      </section>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      {showProgress &&
        targetAmount > 0 && (
          <section
            className="mt-5"
            aria-label="Saving progress"
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
                className="bg-slate-900 rounded-full h-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              /
              >
            </div>
          </section>
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
            className="text-slate-400"
            aria-hidden="true"
          /
          >

          <span>{frequencyLabel}</span>
        </div>

        {nextExecution && (
          <div
            className="inline-flex items-center gap-2 text-slate-600 text-xs"
          >
            <Clock3
              size={14}
              className="text-slate-400"
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

      {showActions &&
        (hasActivate ||
          hasPause ||
          hasResume ||
          hasView) && (
          <footer
            className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mt-5 pt-4 border-slate-100 border-t"
          >
            <div
              className="flex flex-wrap gap-2"
            >
              {hasActivate && (
                <button
                  type="button"
                  onClick={handleActivate}
                  className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-9 font-semibold text-white text-sm transition"
                >
                  <Play
                    size={14}
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
                  aria-hidden="true"
                />
              </button>
            )}
          </footer>
        )}
    </article>
  );
};

export default RoundUpSavingCard;