import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  Clock3,
  Percent,
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

const DEFAULT_STATUS = String(
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft"
).toLowerCase();

const DEFAULT_FREQUENCY = String(
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly"
).toLowerCase();

const DEFAULT_STRATEGY = String(
  SAVINGS_STRATEGIES?.PERCENTAGE ?? "percentage"
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
   FREQUENCY CONFIGURATION
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
   STRATEGY TYPE ALIASES
========================================================= */

const PERCENTAGE_STRATEGY_TYPES = new Set([
  DEFAULT_STRATEGY,
  "percentage",
  "percentage_based",
  "percentage-based",
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
 * Safely resolves an entity identifier.
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
 * Returns the first usable numeric value.
 *
 * Invalid values become zero.
 */
const getNumber = (...values) => {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
};

/**
 * Safely normalizes a percentage to 0-100.
 */
const clampPercentage = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
};

/**
 * Reads the first valid percentage.
 */
const getPercentage = (...values) => {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const percentage = Number(value);

    if (Number.isFinite(percentage)) {
      return clampPercentage(percentage);
    }
  }

  return 0;
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeStatus = (strategy) => {
  const rawStatus = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  return STATUS_CONFIG[rawStatus]
    ? rawStatus
    : DEFAULT_STATUS in STATUS_CONFIG
      ? DEFAULT_STATUS
      : "draft";
};

const normalizeFrequency = (strategy) => {
  const rawFrequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  return FREQUENCY_LABELS[rawFrequency]
    ? rawFrequency
    : FREQUENCY_LABELS[DEFAULT_FREQUENCY]
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

  /*
   * Backend-provided progress takes priority.
   */
  if (
    explicitProgress !== null &&
    explicitProgress !== undefined &&
    explicitProgress !== ""
  ) {
    return getPercentage(
      explicitProgress
    );
  }

  /*
   * No target means progress cannot be
   * meaningfully calculated.
   */
  if (
    !Number.isFinite(targetAmount) ||
    targetAmount <= 0
  ) {
    return 0;
  }

  /*
   * Prefer the canonical SmartSave
   * progress calculation utility.
   */
  try {
    const calculated = Number(
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );

    if (Number.isFinite(calculated)) {
      return clampPercentage(calculated);
    }
  } catch {
    /*
     * Fall through to deterministic
     * mathematical calculation.
     */
  }

  return clampPercentage(
    (currentAmount / targetAmount) * 100
  );
};

/* =========================================================
   SAFE DATE FORMATTER
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
      return formatted;
    }
  } catch {
    /*
     * Fall through to native Date formatting.
     */
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

const PercentageSavingCard = ({
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
     DATA VALIDATION
  ======================================================= */

  if (
    !strategy ||
    typeof strategy !== "object" ||
    Array.isArray(strategy)
  ) {
    return null;
  }

  /* =======================================================
     IDENTIFICATION
  ======================================================= */

  const strategyId = getId(strategy);

  /* =======================================================
     STRATEGY TYPE
  ======================================================= */

  const strategyType =
    normalizeStrategyType(strategy);

  /*
   * An empty strategy type is tolerated because
   * some backend response shapes may omit it.
   *
   * Explicitly different strategy types are rejected.
   */
  const isPercentageStrategy =
    !strategyType ||
    PERCENTAGE_STRATEGY_TYPES.has(
      strategyType
    );

  if (!isPercentageStrategy) {
    return null;
  }

  /* =======================================================
     BASIC INFORMATION
  ======================================================= */

  const title =
    getText(
      strategy.name,
      strategy.title,
      strategy.planName,
      strategy.strategyName
    ) || "Percentage saving strategy";

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
      strategy.savingAccount?.currency
    ).toUpperCase() || DEFAULT_CURRENCY;

  /* =======================================================
     FINANCIAL VALUES
  ======================================================= */

  const currentAmount =
    Math.max(
      0,
      getNumber(
        strategy.currentAmount,
        strategy.savedAmount,
        strategy.progress?.current,
        strategy.metrics?.savedAmount
      )
    );

  const targetAmount =
    Math.max(
      0,
      getNumber(
        strategy.targetAmount,
        strategy.target,
        strategy.goalAmount,
        strategy.progress?.target
      )
    );

  /* =======================================================
     PERCENTAGE CONFIGURATION
  ======================================================= */

  const savingsPercentage =
    getPercentage(
      strategy.percentage,
      strategy.savingsPercentage,
      strategy.contributionPercentage,
      strategy.savePercentage,
      strategy.rate,
      strategy.strategyConfig?.percentage,
      strategy.configuration?.percentage
    );

  /* =======================================================
     ESTIMATED CONTRIBUTION
  ======================================================= */

  const estimatedContribution =
    Math.max(
      0,
      getNumber(
        strategy.estimatedContribution,
        strategy.expectedContribution,
        strategy.averageContribution,
        strategy.metrics?.estimatedContribution
      )
    );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress = getProgress(
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

  const formattedEstimatedContribution =
    estimatedContribution > 0
      ? formatCurrency(
          estimatedContribution,
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

  const canActivate =
    status === "draft";

  const canPause =
    status === "active";

  const canResume =
    status === "paused";

  /* =======================================================
     CALLBACK AVAILABILITY
  ======================================================= */

  const hasView =
    typeof onView === "function";

  const hasActivate =
    canActivate &&
    typeof onActivate === "function";

  const hasPause =
    canPause &&
    typeof onPause === "function";

  const hasResume =
    canResume &&
    typeof onResume === "function";

  const hasActions =
    showActions &&
    (
      hasActivate ||
      hasPause ||
      hasResume ||
      hasView
    );

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
     ROOT CLASS
  ======================================================= */

  const rootClassName = `
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
  `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className={rootClassName}
      data-strategy-id={
        strategyId ?? undefined
      }
      data-strategy-type="percentage"
      data-status={status}
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
            <TrendingUp
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
                <Percent size={10} />
                Percentage
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

        {hasView && (
          <button
            type="button"
            onClick={handleView}
            className="hover:bg-slate-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-400 hover:text-slate-700 transition shrink-0"
            aria-label={`View ${title}`}
          >
            <ArrowRight size={17} />
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
          PERCENTAGE CONFIGURATION
      =================================================== */}

      <section
        className="bg-slate-50 mt-5 p-4 border border-slate-200 rounded-xl"
        aria-label="Percentage saving configuration"
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
              <Percent size={18} />
            </div>

            <div>
              <p
                className="font-medium text-slate-500 text-xs"
              >
                Contribution rate
              </p>

              <p
                className="mt-0.5 font-bold text-slate-900 text-xl tracking-tight"
              >
                {savingsPercentage}%
              </p>
            </div>
          </div>

          <div
            className="text-right"
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
            A percentage of the configured
            contribution base is allocated
            to this saving strategy.
          </p>
        </div>
      </section>

      {/* ===================================================
          ESTIMATED CONTRIBUTION
      =================================================== */}

      {formattedEstimatedContribution && (
        <div
          className="flex justify-between items-center gap-3 bg-white mt-4 p-3 border border-slate-200 rounded-xl"
        >
          <div
            className="flex items-center gap-2"
          >
            <Wallet
              size={15}
              className="text-slate-400"
              aria-hidden="true"
            /
            >

            <span
              className="font-medium text-slate-600 text-xs"
            >
              Estimated contribution
            </span>
          </div>

          <span
            className="font-bold text-slate-900 text-sm"
          >
            {formattedEstimatedContribution}
          </span>
        </div>
      )}

      {/* ===================================================
          SAVINGS SUMMARY
      =================================================== */}

      <div
        className="gap-3 grid grid-cols-2 mt-4"
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
      </div>

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

      {hasActions && (
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

export default PercentageSavingCard;