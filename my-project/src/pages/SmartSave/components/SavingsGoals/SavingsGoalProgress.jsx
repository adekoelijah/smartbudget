
import { useMemo } from "react";
import { CheckCircle2, Target, TrendingUp } from "lucide-react";

import {
  calculateSavingsProgress,
  clampPercentage,
} from "../../../../utils/smartSave/savingsProgress";

import {
  formatCurrency,
  formatPercentage,
} from "../../../../utils/smartSave/savingsFormatters";

/**
 * =========================================================
 * SAVINGS GOAL PROGRESS
 * =========================================================
 *
 * Presentation component for displaying the financial
 * progress of a SmartSave savings goal.
 *
 * Architecture:
 *
 * smartSaveService
 *       ↓
 * useSavingsGoals
 *       ↓
 * parent goal component
 *       ↓
 * SavingsGoalProgress
 *
 * This component intentionally does NOT:
 * - fetch goals
 * - call APIs
 * - mutate goal state
 * - create contributions
 * - perform navigation
 * - contain backend business logic
 *
 * Financial calculations are delegated to SmartSave
 * utilities where possible.
 * =========================================================
 */

/* =========================================================
   INTERNAL HELPERS
========================================================= */

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeCurrency = (currency) => {
  if (typeof currency !== "string") {
    return "NGN";
  }

  const normalized = currency.trim().toUpperCase();

  return normalized || "NGN";
};

const getProgressValue = ({
  currentAmount,
  targetAmount,
}) => {
  const current = toFiniteNumber(currentAmount);
  const target = toFiniteNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  return clampPercentage((current / target) * 100);
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalProgress = ({
  currentAmount = 0,
  targetAmount = 0,
  currency = "NGN",

  /**
   * Optional explicit progress supplied by the service/API.
   *
   * If supplied, it is treated as the authoritative
   * progress snapshot rather than unnecessarily
   * recalculating it.
   */
  progress,

  /**
   * Optional completed state.
   */
  isCompleted = false,

  /**
   * Optional display configuration.
   */
  showAmounts = true,
  showPercentage = true,
  showRemaining = true,
  showStatus = true,

  size = "default",
  className = "",
}) => {
  const normalizedCurrency = useMemo(
    () => normalizeCurrency(currency),
    [currency]
  );

  const normalizedCurrentAmount = useMemo(
    () => toFiniteNumber(currentAmount),
    [currentAmount]
  );

  const normalizedTargetAmount = useMemo(
    () => toFiniteNumber(targetAmount),
    [targetAmount]
  );

  const calculatedProgress = useMemo(() => {
    /**
     * Prefer the backend/service-provided progress snapshot
     * when it is valid.
     */
    const suppliedProgress = Number(progress);

    if (
      Number.isFinite(suppliedProgress) &&
      suppliedProgress >= 0
    ) {
      return clampPercentage(suppliedProgress);
    }

    /**
     * Fall back to the canonical SmartSave calculation.
     */
    try {
      const calculated = calculateSavingsProgress({
        currentAmount: normalizedCurrentAmount,
        targetAmount: normalizedTargetAmount,
      });

      const normalized = Number(calculated);

      if (Number.isFinite(normalized)) {
        return clampPercentage(normalized);
      }
    } catch {
      // Safe local fallback.
    }

    return getProgressValue({
      currentAmount: normalizedCurrentAmount,
      targetAmount: normalizedTargetAmount,
    });
  }, [
    progress,
    normalizedCurrentAmount,
    normalizedTargetAmount,
  ]);

  const remainingAmount = useMemo(
    () =>
      Math.max(
        normalizedTargetAmount - normalizedCurrentAmount,
        0
      ),
    [
      normalizedCurrentAmount,
      normalizedTargetAmount,
    ]
  );

  const isTargetReached =
    isCompleted ||
    (
      normalizedTargetAmount > 0 &&
      normalizedCurrentAmount >= normalizedTargetAmount
    );

  const displayProgress = isTargetReached
    ? 100
    : calculatedProgress;

  const progressLabel = useMemo(
    () =>
      formatPercentage(displayProgress, {
        maximumFractionDigits: 1,
      }),
    [displayProgress]
  );

  const currentLabel = useMemo(
    () =>
      formatCurrency(
        normalizedCurrentAmount,
        normalizedCurrency
      ),
    [
      normalizedCurrentAmount,
      normalizedCurrency,
    ]
  );

  const targetLabel = useMemo(
    () =>
      formatCurrency(
        normalizedTargetAmount,
        normalizedCurrency
      ),
    [
      normalizedTargetAmount,
      normalizedCurrency,
    ]
  );

  const remainingLabel = useMemo(
    () =>
      formatCurrency(
        remainingAmount,
        normalizedCurrency
      ),
    [
      remainingAmount,
      normalizedCurrency,
    ]
  );

  const sizeConfig = {
    compact: {
      track: "h-2",
      icon: 14,
      text: "text-xs",
      percentage: "text-sm",
    },

    default: {
      track: "h-2.5",
      icon: 16,
      text: "text-sm",
      percentage: "text-sm",
    },

    large: {
      track: "h-3",
      icon: 18,
      text: "text-sm",
      percentage: "text-base",
    },
  };

  const config =
    sizeConfig[size] || sizeConfig.default;

  return (
    <section
      aria-label="Savings goal progress"
      className={`w-full ${className}`}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
            {isTargetReached ? (
              <CheckCircle2
                size={config.icon}
                strokeWidth={2}
              />
            ) : (
              <Target
                size={config.icon}
                strokeWidth={2}
              />
            )}
          </div>

          <span
            className={`
              ${config.text}
              font-medium
              text-slate-700
            `}
          >
            {isTargetReached
              ? "Goal reached"
              : "Goal progress"}
          </span>
        </div>

        {showPercentage && (
          <span
            className={`
              ${config.percentage}
              shrink-0
              font-semibold
              text-slate-900
              tabular-nums
            `}
          >
            {progressLabel}
          </span>
        )}
      </div>

      {/* ===================================================
          PROGRESS BAR
      =================================================== */}

      <div
        className={`
          relative
          w-full
          overflow-hidden
          rounded-full
          bg-slate-100
          ${config.track}
        `}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayProgress}
        aria-valuetext={progressLabel}
      >
        <div
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

      {/* ===================================================
          AMOUNT DETAILS
      =================================================== */}

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
                font-semibold text-slate-900 text-sm truncate
              "
            >
              {currentLabel}
            </p>
          </div>

          <div
            className="
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
                font-semibold text-slate-900 text-sm
              "
            >
              {targetLabel}
            </p>
          </div>
        </div>
      )}

      {/* ===================================================
          REMAINING AMOUNT
      =================================================== */}

      {showRemaining && !isTargetReached && (
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
              ${config.text}
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
            remaining to reach your goal
          </p>
        </div>
      )}

      {/* ===================================================
          COMPLETION MESSAGE
      =================================================== */}

      {showStatus && isTargetReached && (
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
              ${config.text}
              font-medium
              text-emerald-700
            `}
          >
            You've reached your savings target.
          </p>
        </div>
      )}
    </section>
  );
};

export default SavingsGoalProgress;
