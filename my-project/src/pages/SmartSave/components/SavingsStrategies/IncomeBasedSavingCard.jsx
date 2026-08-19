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

const DEFAULT_STATUS =
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly";

const PERCENTAGE_STRATEGY =
  SAVINGS_STRATEGIES?.PERCENTAGE ?? "percentage";

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
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

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

const getPercentage = (...values) => {
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
      return clampPercentage(numericValue);
    }
  }

  return 0;
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeStatus = (strategy) => {
  const rawStatus = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  return STATUS_CONFIG[rawStatus]
    ? rawStatus
    : DEFAULT_STATUS;
};

const normalizeFrequency = (strategy) => {
  const rawFrequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  return FREQUENCY_LABELS[rawFrequency]
    ? rawFrequency
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
   STRATEGY TYPE VALIDATION
========================================================= */

const isIncomeBasedStrategy = (strategy) => {
  const strategyType =
    normalizeStrategyType(strategy);

  /*
   * If the backend omitted the strategy type,
   * preserve compatibility with existing records.
   */
  if (!strategyType) {
    return true;
  }

  return (
    strategyType === PERCENTAGE_STRATEGY ||
    strategyType === "percentage" ||
    strategyType === "income_based" ||
    strategyType === "income-based"
  );
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
    return clampPercentage(
      explicitProgress
    );
  }

  if (
    !Number.isFinite(targetAmount) ||
    targetAmount <= 0
  ) {
    return 0;
  }

  try {
    const calculatedProgress = Number(
      calculateProgressPercentage(
        currentAmount,
        targetAmount
      )
    );

    if (
      Number.isFinite(calculatedProgress)
    ) {
      return clampPercentage(
        calculatedProgress
      );
    }
  } catch {
    // Fall through to deterministic calculation.
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
    // Fall through to native date formatting.
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

const IncomeBasedSavingCard = ({
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

  if (!isIncomeBasedStrategy(strategy)) {
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
    ) || "Income-based saving strategy";

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
    ) || DEFAULT_CURRENCY;

  /* =======================================================
     SAVINGS VALUES
  ======================================================= */

  const currentAmount =
    getNumber(
      strategy.currentAmount,
      strategy.savedAmount,
      strategy.progress?.current,
      strategy.metrics?.savedAmount
    );

  const targetAmount =
    getNumber(
      strategy.targetAmount,
      strategy.target,
      strategy.goalAmount,
      strategy.progress?.target
    );

  /* =======================================================
     SAVINGS PERCENTAGE
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
    getNumber(
      strategy.estimatedContribution,
      strategy.expectedContribution,
      strategy.averageContribution,
      strategy.metrics?.estimatedContribution
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
     ACTION AVAILABILITY
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
     EVENT HANDLERS
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
            <TrendingUp
              size={21}
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
                  gap-1
                "
              >
                <Percent size={10} />

                Income based
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
            <ArrowRight size={17} />
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
          INCOME-BASED CONFIGURATION
      =================================================== */}

      <section
        className="
          mt-5 p-4
          bg-slate-50
          border border-slate-200 rounded-xl
        "
        aria-label="Income-based savings configuration"
      >
        <div
          className="
            flex justify-between items-center
            gap-4
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-slate-700
                bg-white
                rounded-lg
                shadow-sm
                shrink-0
              "
              aria-hidden="true"
            >
              <Percent size={17} />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Savings rate
              </p>

              <p
                className="
                  mt-0.5
                  font-bold text-slate-900 text-lg
                "
              >
                {savingsPercentage}%
              </p>
            </div>
          </div>

          <div
            className="
              text-right
            "
          >
            <p
              className="
                font-medium text-[11px] text-slate-500
              "
            >
              Frequency
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-800 text-xs
              "
            >
              {frequencyLabel}
            </p>
          </div>
        </div>

        <div
          className="
            flex items-start
            mt-3
            text-slate-500 text-xs leading-5
            gap-2
          "
        >
          <PiggyBank
            size={14}
            className="
              mt-0.5
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <span>
            Contributions adjust according to
            the configured savings percentage.
          </span>
        </div>
      </section>

      {/* ===================================================
          ESTIMATED CONTRIBUTION
      =================================================== */}

      {formattedEstimatedContribution && (
        <div
          className="
            flex justify-between items-center
            mt-4 p-3
            bg-white
            border border-slate-200 rounded-xl
            gap-3
          "
        >
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <Wallet
              size={15}
              className="
                text-slate-400
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                font-medium text-slate-600 text-xs
              "
            >
              Estimated contribution
            </span>
          </div>

          <span
            className="
              font-bold text-slate-900 text-sm
            "
          >
            {formattedEstimatedContribution}
          </span>
        </div>
      )}

      {/* ===================================================
          SAVINGS SUMMARY
      =================================================== */}

      <div
        className="
          grid grid-cols-2
          mt-4
          gap-3
        "
      >
        <div
          className="
            p-3
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              font-medium text-[11px] text-slate-500
            "
          >
            Saved
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-sm truncate
            "
            title={formattedCurrentAmount}
          >
            {formattedCurrentAmount}
          </p>
        </div>

        <div
          className="
            p-3
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <div
            className="
              flex items-center
              gap-1.5
            "
          >
            <Target
              size={12}
              className="
                text-slate-400
              "
              aria-hidden="true"
            /
            >

            <p
              className="
                font-medium text-[11px] text-slate-500
              "
            >
              Target
            </p>
          </div>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-sm truncate
            "
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

      {showProgress && targetAmount > 0 && (
        <section
          className="
            mt-5
          "
          aria-label="Savings progress"
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
              Goal progress
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
            aria-valuenow={roundedProgress}
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
        </section>
      )}

      {/* ===================================================
          SCHEDULE
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
            aria-hidden="true"
          /
          >

          <span>{frequencyLabel}</span>
        </div>

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
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-5 pt-4
            border-slate-100 border-t
            gap-2
          "
        >
          <div
            className="
              flex flex-wrap
              gap-2
            "
          >
            {hasActivate && (
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
                  aria-hidden="true"
                />

                Activate
              </button>
            )}

            {hasPause && (
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
                  aria-hidden="true"
                />

                Pause
              </button>
            )}

            {hasResume && (
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

export default IncomeBasedSavingCard;