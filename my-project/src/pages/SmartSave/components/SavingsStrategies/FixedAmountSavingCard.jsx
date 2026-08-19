import {
  memo,
} from "react";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  Clock3,
  PiggyBank,
  Play,
  Target,
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
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_STATUS =
  SAVINGS_PLAN_STATUS?.DRAFT ??
  "draft";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ??
  "monthly";

const FIXED_STRATEGY =
  SAVINGS_STRATEGIES?.FIXED ??
  "fixed";

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

/* =========================================================
   IDENTIFIER
========================================================= */

const getStrategyId = (strategy) => {
  const id =
    strategy?._id ??
    strategy?.id ??
    strategy?.planId ??
    strategy?.strategyId;

  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    return null;
  }

  return String(id);
};

/* =========================================================
   NUMERIC NORMALIZATION
========================================================= */

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

/* =========================================================
   STATUS NORMALIZATION
========================================================= */

const normalizeStatus = (strategy) => {
  const status = getText(
    strategy?.status,
    strategy?.state
  ).toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(
      STATUS_CONFIG,
      status
    )
  ) {
    return status;
  }

  return DEFAULT_STATUS;
};

/* =========================================================
   FREQUENCY NORMALIZATION
========================================================= */

const normalizeFrequency = (strategy) => {
  const frequency = getText(
    strategy?.frequency,
    strategy?.schedule?.frequency
  ).toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(
      FREQUENCY_LABELS,
      frequency
    )
  ) {
    return frequency;
  }

  return DEFAULT_FREQUENCY;
};

/* =========================================================
   STRATEGY TYPE NORMALIZATION
========================================================= */

const normalizeStrategyType = (strategy) =>
  getText(
    strategy?.strategy,
    strategy?.strategyType,
    strategy?.method,
    strategy?.type
  ).toLowerCase();

/* =========================================================
   FIXED STRATEGY VALIDATION
========================================================= */

const isFixedAmountStrategy = (strategy) => {
  const type = normalizeStrategyType(
    strategy
  );

  /*
   * Missing type is tolerated because some backend
   * responses may already be scoped to fixed strategies.
   */
  return (
    !type ||
    type === FIXED_STRATEGY ||
    type === "fixed"
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
      return formatted;
    }
  } catch {
    // Use native fallback below.
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

const FixedAmountSavingCard = ({
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
     
     IMPORTANT:
     This guard intentionally appears before no hooks because
     this component does not use React hooks.
  ======================================================= */

  if (
    !strategy ||
    typeof strategy !== "object" ||
    Array.isArray(strategy)
  ) {
    return null;
  }

  /* =======================================================
     STRATEGY VALIDATION
  ======================================================= */

  if (!isFixedAmountStrategy(strategy)) {
    return null;
  }

  /* =======================================================
     IDENTIFIER
  ======================================================= */

  const strategyId =
    getStrategyId(strategy);

  /* =======================================================
     BASIC INFORMATION
  ======================================================= */

  const title =
    getText(
      strategy.name,
      strategy.title,
      strategy.planName,
      strategy.strategyName
    ) || "Fixed saving strategy";

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

  const fixedAmount =
    getNumber(
      strategy.amount,
      strategy.contributionAmount,
      strategy.fixedAmount,
      strategy.savingAmount,
      strategy.metrics?.contributionAmount
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

  const formattedFixedAmount =
    fixedAmount > 0
      ? formatCurrency(
          fixedAmount,
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
     ACTION AVAILABILITY
  ======================================================= */

  const hasView =
    typeof onView === "function";

  const hasActivate =
    status === "draft" &&
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
      hasActivate ||
      hasPause ||
      hasResume ||
      hasView
    );

  /* =======================================================
     EVENT HANDLERS
     
     No useCallback is required here. These handlers are
     local UI callbacks and do not participate in dependency
     arrays or effect lifecycles.
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
     CLASS NAMES
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
            <PiggyBank
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
                "
              >
                Fixed amount
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
          FIXED CONTRIBUTION
      =================================================== */}

      <div
        className="
          mt-5 p-4
          bg-slate-50
          border border-slate-200 rounded-xl
        "
      >
        <div
          className="
            flex justify-between items-center
            gap-3
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-8 h-8
                text-slate-700
                bg-white
                rounded-lg
                shadow-sm
                shrink-0
              "
              aria-hidden="true"
            >
              <Wallet size={15} />
            </div>

            <span
              className="
                font-medium text-slate-600 text-xs
              "
            >
              Fixed contribution
            </span>
          </div>

          <span
            className="
              font-bold text-slate-900 text-base text-right truncate
            "
          >
            {formattedFixedAmount ??
              "Not configured"}
          </span>
        </div>

        <div
          className="
            flex items-center
            mt-3
            text-slate-500 text-xs
            gap-2
          "
        >
          <CalendarClock
            size={14}
            aria-hidden="true"
          />

          <span>
            {frequencyLabel}
          </span>
        </div>
      </div>

      {/* ===================================================
          PROGRESS SUMMARY
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
            min-w-0
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
            min-w-0
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
            Target
          </p>

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
          PROGRESS BAR
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
                  transition-[width] duration-500
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
          NEXT EXECUTION
      =================================================== */}

      {nextExecution && (
        <div
          className="
            flex items-center
            mt-5 pt-4
            text-slate-600 text-xs
            border-slate-100 border-t
            gap-2
          "
        >
          <Clock3
            size={14}
            className="
              text-slate-400
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <span>
            Next contribution:{" "}
            <strong
              className="
                font-semibold text-slate-800
              "
            >
              {nextExecution}
            </strong>
          </span>
        </div>
      )}

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
              flex flex-wrap items-center
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
                  focus:ring-2 focus:ring-slate-300
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
                focus:ring-2 focus:ring-slate-300
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
    </article>
  );
};

/* =========================================================
   COMPONENT CONTRACT
========================================================= */

FixedAmountSavingCard.displayName =
  "FixedAmountSavingCard";

export default memo(
  FixedAmountSavingCard
);