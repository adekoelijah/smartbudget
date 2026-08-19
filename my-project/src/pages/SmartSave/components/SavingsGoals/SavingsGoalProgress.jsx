import {
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";

import { memo } from "react";

import {
  calculateSavingsProgress,
  clampPercentage,
} from "../../../../utils/smartSave/savingsProgress";

import {
  formatCurrency,
  formatPercentage,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_SIZE = "default";

const SIZE_CONFIG = Object.freeze({
  compact: Object.freeze({
    trackClassName: "h-2",
    iconSize: 14,
    textClassName: "text-xs",
    percentageClassName: "text-sm",
  }),

  default: Object.freeze({
    trackClassName: "h-2.5",
    iconSize: 16,
    textClassName: "text-sm",
    percentageClassName: "text-sm",
  }),

  large: Object.freeze({
    trackClassName: "h-3",
    iconSize: 18,
    textClassName: "text-sm",
    percentageClassName: "text-base",
  }),
});

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Convert a value into a finite number.
 *
 * Financial UI must never render NaN or Infinity.
 */
const toFiniteNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Normalize currency for presentation.
 */
const normalizeCurrency = (
  currency
) => {
  if (
    typeof currency !== "string"
  ) {
    return DEFAULT_CURRENCY;
  }

  const normalized =
    currency.trim().toUpperCase();

  return normalized ||
    DEFAULT_CURRENCY;
};

/**
 * Calculate local progress fallback.
 *
 * This is only used when the service/API did not
 * provide a valid progress snapshot.
 */
const calculateFallbackProgress = ({
  currentAmount,
  targetAmount,
}) => {
  if (targetAmount <= 0) {
    return 0;
  }

  try {
    const calculated =
      calculateSavingsProgress({
        currentAmount,
        targetAmount,
      });

    const numeric =
      Number(calculated);

    if (
      Number.isFinite(numeric)
    ) {
      return clampPercentage(
        numeric
      );
    }
  } catch {
    /*
     * Fall through to the deterministic
     * arithmetic fallback below.
     */
  }

  return clampPercentage(
    (currentAmount /
      targetAmount) *
      100
  );
};

/**
 * Resolve progress.
 *
 * Contract:
 *
 * 1. Valid service/API progress wins.
 * 2. Otherwise calculate from amounts.
 */
const resolveProgress = ({
  progress,
  currentAmount,
  targetAmount,
}) => {
  const suppliedProgress =
    Number(progress);

  if (
    Number.isFinite(
      suppliedProgress
    ) &&
    suppliedProgress >= 0
  ) {
    return clampPercentage(
      suppliedProgress
    );
  }

  return calculateFallbackProgress({
    currentAmount,
    targetAmount,
  });
};

/**
 * Safely format currency.
 */
const formatSavingsAmount = (
  amount,
  currency
) => {
  try {
    return formatCurrency(
      amount,
      currency
    );
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

/**
 * Safely format percentage.
 */
const formatSavingsPercentage = (
  percentage
) => {
  try {
    return formatPercentage(
      percentage,
      {
        maximumFractionDigits: 1,
      }
    );
  } catch {
    return `${percentage.toFixed(1)}%`;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalProgress = ({
  currentAmount = 0,
  targetAmount = 0,
  currency = DEFAULT_CURRENCY,

  /**
   * Optional service/backend progress snapshot.
   *
   * When valid, this value is authoritative.
   */
  progress,

  /**
   * Explicit completion state supplied by the
   * parent/service.
   */
  isCompleted = false,

  showAmounts = true,
  showPercentage = true,
  showRemaining = true,
  showStatus = true,

  size = DEFAULT_SIZE,

  className = "",
}) => {
  /* =======================================================
     NORMALIZED VALUES
  ======================================================= */

  const normalizedCurrency =
    normalizeCurrency(currency);

  const normalizedCurrentAmount =
    Math.max(
      0,
      toFiniteNumber(
        currentAmount
      )
    );

  const normalizedTargetAmount =
    Math.max(
      0,
      toFiniteNumber(
        targetAmount
      )
    );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const calculatedProgress =
    resolveProgress({
      progress,
      currentAmount:
        normalizedCurrentAmount,
      targetAmount:
        normalizedTargetAmount,
    });

  const targetReached =
    Boolean(isCompleted) ||
    (
      normalizedTargetAmount > 0 &&
      normalizedCurrentAmount >=
        normalizedTargetAmount
    );

  const displayProgress =
    targetReached
      ? 100
      : calculatedProgress;

  /* =======================================================
     REMAINING
  ======================================================= */

  const remainingAmount =
    Math.max(
      0,
      normalizedTargetAmount -
        normalizedCurrentAmount
    );

  /* =======================================================
     FORMATTED VALUES
  ======================================================= */

  const progressLabel =
    formatSavingsPercentage(
      displayProgress
    );

  const currentLabel =
    formatSavingsAmount(
      normalizedCurrentAmount,
      normalizedCurrency
    );

  const targetLabel =
    formatSavingsAmount(
      normalizedTargetAmount,
      normalizedCurrency
    );

  const remainingLabel =
    formatSavingsAmount(
      remainingAmount,
      normalizedCurrency
    );

  /* =======================================================
     DISPLAY CONFIG
  ======================================================= */

  const config =
    SIZE_CONFIG[size] ||
    SIZE_CONFIG.default;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-label="Savings goal progress"
      className={`
        w-full
        ${className}
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-center
          mb-2
          gap-4
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
            aria-hidden="true"
            className="
              flex justify-center items-center
              w-7 h-7
              text-slate-600
              bg-slate-100
              rounded-lg
              shrink-0
            "
          >
            {targetReached ? (
              <CheckCircle2
                size={config.iconSize}
                strokeWidth={2}
              />
            ) : (
              <Target
                size={config.iconSize}
                strokeWidth={2}
              />
            )}
          </div>

          <span
            className={`
              ${config.textClassName}
              min-w-0
              font-medium
              text-slate-700
            `}
          >
            {targetReached
              ? "Goal reached"
              : "Goal progress"}
          </span>
        </div>

        {showPercentage && (
          <span
            className={`
              ${config.percentageClassName}
              shrink-0
              font-semibold
              tabular-nums
              text-slate-900
            `}
          >
            {progressLabel}
          </span>
        )}
      </div>

      {/* =================================================
          PROGRESS BAR
      ================================================= */}

      <div
        role="progressbar"
        aria-label="Savings goal completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayProgress}
        aria-valuetext={progressLabel}
        className={`
          relative
          w-full
          overflow-hidden
          rounded-full
          bg-slate-100
          ${config.trackClassName}
        `}
      >
        <div
          aria-hidden="true"
          className="
            h-full
            bg-blue-600
            rounded-full
            transition-[width] duration-500 ease-out
          "
          style={{
            width: `${displayProgress}%`,
          }}
        /
        >
      </div>

      {/* =================================================
          AMOUNT DETAILS
      ================================================= */}

      {showAmounts && (
        <div
          className="
            flex justify-between items-center
            mt-3
            gap-4
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                font-medium text-slate-400 text-xs
              "
            >
              Saved
            </p>

            <p
              className="
                mt-0.5
                font-semibold text-slate-900 text-sm truncate
              "
            >
              {currentLabel}
            </p>
          </div>

          <div
            className="
              min-w-0
              text-right
            "
          >
            <p
              className="
                font-medium text-slate-400 text-xs
              "
            >
              Target
            </p>

            <p
              className="
                mt-0.5
                font-semibold text-slate-900 text-sm truncate
              "
            >
              {targetLabel}
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          REMAINING AMOUNT
      ================================================= */}

      {showRemaining &&
        !targetReached && (
          <div
            className="
              flex items-center
              mt-3 px-3 py-2.5
              bg-slate-50
              border border-slate-100 rounded-xl
              gap-2
            "
          >
            <TrendingUp
              size={15}
              className="
                text-slate-500
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <p
              className={`
                ${config.textClassName}
                text-slate-600
              `}
            >
              <span
                className="
                  font-medium
                "
              >
                {remainingLabel}
              </span>{" "}
              remaining to reach your
              goal
            </p>
          </div>
        )}

      {/* =================================================
          COMPLETION MESSAGE
      ================================================= */}

      {showStatus &&
        targetReached && (
          <div
            role="status"
            className="
              flex items-center
              mt-3 px-3 py-2.5
              bg-emerald-50
              border border-emerald-100 rounded-xl
              gap-2
            "
          >
            <CheckCircle2
              size={16}
              className="
                text-emerald-600
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <p
              className={`
                ${config.textClassName}
                font-medium
                text-emerald-700
              `}
            >
              You've reached your
              savings target.
            </p>
          </div>
        )}
    </section>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsGoalProgress
);