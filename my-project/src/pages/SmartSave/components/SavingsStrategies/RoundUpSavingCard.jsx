
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  Clock3,
  Coins,
  Play,
  PiggyBank,
  ReceiptText,
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

const DEFAULT_STRATEGY =
  SAVINGS_STRATEGIES?.ROUND_UP ??
  "round_up";

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

const getNumber = (...values) => {
  const value = values.find(
    (item) =>
      item !== null &&
      item !== undefined &&
      item !== ""
  );

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/* =========================================================
   NORMALIZERS
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

const normalizeStrategyType = (strategy) => {
  return getText(
    strategy?.strategy,
    strategy?.strategyType,
    strategy?.method,
    strategy?.type
  ).toLowerCase();
};

/* =========================================================
   ROUND-UP STRATEGY DETECTION
========================================================= */

const isRoundUpStrategy = (strategy) => {
  const type =
    normalizeStrategyType(strategy);

  /*
   * Accept the aliases that can reasonably represent
   * the same frontend strategy without changing the
   * backend contract.
   */
  return (
    !type ||
    type === DEFAULT_STRATEGY ||
    type === "round_up" ||
    type === "round-up" ||
    type === "roundup" ||
    type === "round_up_saving"
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
    explicitProgress !== undefined
  ) {
    const percentage =
      Number(explicitProgress);

    if (Number.isFinite(percentage)) {
      return Math.min(
        100,
        Math.max(0, percentage)
      );
    }
  }

  if (targetAmount <= 0) {
    return 0;
  }

  try {
    const calculated =
      Number(
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
    // Deterministic fallback below.
  }

  return Math.min(
    100,
    Math.max(
      0,
      (currentAmount / targetAmount) * 100
    )
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
    const formatted =
      formatDate(value);

    return formatted || null;
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
    typeof strategy !== "object"
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

  const strategyId =
    getId(strategy);

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
      strategy.savingAccount?.currency
    ) || DEFAULT_CURRENCY;

  /* =======================================================
     FINANCIAL VALUES
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

  const totalRoundUpAmount =
    getNumber(
      strategy.totalRoundUpAmount,
      strategy.totalRoundUps,
      strategy.roundUpAmount,
      strategy.metrics?.totalRoundUpAmount,
      strategy.progress?.roundUpAmount
    );

  const averageRoundUp =
    getNumber(
      strategy.averageRoundUp,
      strategy.averageRoundUpAmount,
      strategy.metrics?.averageRoundUp
    );

  const transactionCount =
    getNumber(
      strategy.transactionCount,
      strategy.roundUpTransactionCount,
      strategy.metrics?.transactionCount,
      strategy.metrics?.roundUpTransactionCount
    );

  /* =======================================================
     ROUND-UP CONFIGURATION
  ======================================================= */

  const roundUpIncrement =
    getNumber(
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
        ? `Nearest ${formatCurrency(
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

  const formattedTotalRoundUp =
    totalRoundUpAmount > 0
      ? formatCurrency(
          totalRoundUpAmount,
          currency
        )
      : null;

  const formattedAverageRoundUp =
    averageRoundUp > 0
      ? formatCurrency(
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

  const canActivate =
    status === "draft";

  const canPause =
    status === "active";

  const canResume =
    status === "paused";

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

  /* =======================================================
     CALLBACK HANDLERS
  ======================================================= */

  const handleView = () => {
    if (!hasView) {
      return;
    }

    onView(
      strategy,
      strategyId
    );
  };

  const handleActivate = () => {
    if (!hasActivate) {
      return;
    }

    onActivate(
      strategy,
      strategyId
    );
  };

  const handlePause = () => {
    if (!hasPause) {
      return;
    }

    onPause(
      strategy,
      strategyId
    );
  };

  const handleResume = () => {
    if (!hasResume) {
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
            <Coins
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
                <Coins
                  size={10}
                />

                Round-up
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
            <ArrowRight
              size={17}
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
          ROUND-UP CONFIGURATION
      =================================================== */}

      <section
        className="
          mt-5 p-4
          bg-slate-50
          border border-slate-200 rounded-xl
        "
        aria-label="Round-up savings configuration"
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
                w-10 h-10
                text-slate-700
                bg-white
                rounded-lg
                shadow-sm
                shrink-0
              "
            >
              <ReceiptText
                size={18}
              />
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
                Round-up rule
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-sm truncate
                "
              >
                {roundUpModeLabel}
              </p>
            </div>
          </div>

          <div
            className="
              text-right
              shrink-0
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
            mt-4
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
          className="
            grid grid-cols-1 sm:grid-cols-3
            mt-4
            gap-3
          "
          aria-label="Round-up activity"
        >
          {formattedTotalRoundUp && (
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
                Total round-ups
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-sm truncate
                "
              >
                {formattedTotalRoundUp}
              </p>
            </div>
          )}

          {formattedAverageRoundUp && (
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
                Average round-up
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-sm truncate
                "
              >
                {formattedAverageRoundUp}
              </p>
            </div>
          )}

          {transactionCount > 0 && (
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
                Transactions
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-sm
                "
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
        className="
          grid grid-cols-2
          mt-4
          gap-3
        "
        aria-label="Savings summary"
      >
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
            <PiggyBank
              size={12}
              className="
                text-slate-400
              "
              /
            >

            <p
              className="
                font-medium text-[11px] text-slate-500
              "
            >
              Saved
            </p>
          </div>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-sm truncate
            "
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
            className="
              mt-5
            "
            aria-label="Saving progress"
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
              aria-valuemin={0}
              aria-valuemax={100}
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
            /
          >

          <span>
            {frequencyLabel}
          </span>
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
    </article>
  );
};

export default RoundUpSavingCard;