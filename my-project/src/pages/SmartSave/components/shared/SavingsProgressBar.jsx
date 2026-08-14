
import {
  CheckCircle2,
  Target,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SAVINGS_STATUS,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  calculateSavingsProgress,
} from "../../../../utils/smartSave/savingsProgress";

/* =========================================================
   STATUS FALLBACKS
========================================================= */

const STATUS = {
  ACTIVE:
    SAVINGS_STATUS?.ACTIVE ??
    "active",

  COMPLETED:
    SAVINGS_STATUS?.COMPLETED ??
    "completed",

  PAUSED:
    SAVINGS_STATUS?.PAUSED ??
    "paused",

  CANCELLED:
    SAVINGS_STATUS?.CANCELLED ??
    "cancelled",
};

/* =========================================================
   SAFE NUMERIC NORMALIZATION
========================================================= */

const toFiniteNumber = (
  value,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   CLAMP
========================================================= */

const clamp = (
  value,
  minimum = 0,
  maximum = 100
) =>
  Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );

/* =========================================================
   NORMALIZE PERCENTAGE
========================================================= */

const normalizePercentage = (
  value
) => {
  const numeric =
    toFiniteNumber(value);

  /*
   * Supports:
   *
   * 0.25  → 25%
   * 25    → 25%
   * 100   → 100%
   * 1     → 1% when explicitly treated
   *
   * We intentionally treat values <= 1 as
   * decimal ratios because this is common
   * in financial calculations.
   */
  const percentage =
    numeric >= 0 &&
    numeric <= 1
      ? numeric * 100
      : numeric;

  return clamp(
    percentage
  );
};

/* =========================================================
   RESOLVE PROGRESS
========================================================= */

const resolveProgress = ({
  progress,
  current,
  target,
}) => {
  /*
   * Explicit progress takes precedence.
   */
  if (
    progress !== null &&
    progress !== undefined &&
    progress !== ""
  ) {
    return normalizePercentage(
      progress
    );
  }

  const normalizedCurrent =
    toFiniteNumber(
      current
    );

  const normalizedTarget =
    toFiniteNumber(
      target
    );

  if (
    normalizedTarget <= 0
  ) {
    return 0;
  }

  /*
   * Prefer the project's calculation
   * utility when available.
   */
  try {
    if (
      typeof calculateSavingsProgress ===
      "function"
    ) {
      const calculated =
        calculateSavingsProgress(
          normalizedCurrent,
          normalizedTarget
        );

      /*
       * Accommodate either a raw percentage
       * or a percentage-bearing result.
       */
      if (
        typeof calculated ===
        "number"
      ) {
        return normalizePercentage(
          calculated
        );
      }

      if (
        calculated &&
        typeof calculated ===
          "object"
      ) {
        const calculatedValue =
          calculated.percentage ??
          calculated.progress ??
          calculated.percent;

        if (
          calculatedValue !==
          undefined
        ) {
          return normalizePercentage(
            calculatedValue
          );
        }
      }
    }
  } catch {
    /*
     * Local mathematical fallback below.
     */
  }

  return clamp(
    (normalizedCurrent /
      normalizedTarget) *
      100
  );
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const safeFormatCurrency = (
  amount,
  currency
) => {
  const numericAmount =
    toFiniteNumber(
      amount
    );

  try {
    return formatCurrency(
      numericAmount,
      currency
    );
  } catch {
    try {
      return new Intl.NumberFormat(
        undefined,
        {
          style: "currency",
          currency:
            currency || "NGN",
          maximumFractionDigits: 2,
        }
      ).format(
        numericAmount
      );
    } catch {
      return `${currency || "NGN"} ${numericAmount.toLocaleString()}`;
    }
  }
};

/* =========================================================
   STATUS → VISUAL CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  active: {
    track:
      "bg-slate-100",

    fill:
      "bg-slate-900",

    text:
      "text-slate-700",

    icon:
      "text-slate-700",
  },

  completed: {
    track:
      "bg-emerald-50",

    fill:
      "bg-emerald-600",

    text:
      "text-emerald-700",

    icon:
      "text-emerald-600",
  },

  paused: {
    track:
      "bg-amber-50",

    fill:
      "bg-amber-500",

    text:
      "text-amber-700",

    icon:
      "text-amber-600",
  },

  cancelled: {
    track:
      "bg-slate-100",

    fill:
      "bg-slate-400",

    text:
      "text-slate-600",

    icon:
      "text-slate-500",
  },

  default: {
    track:
      "bg-slate-100",

    fill:
      "bg-slate-900",

    text:
      "text-slate-700",

    icon:
      "text-slate-700",
  },
};

/* =========================================================
   SIZE CONFIGURATION
========================================================= */

const SIZE_CONFIG = {
  xs: {
    track:
      "h-1.5",

    percentage:
      "text-[10px]",

    labels:
      "text-[10px]",
  },

  sm: {
    track:
      "h-2",

    percentage:
      "text-[11px]",

    labels:
      "text-xs",
  },

  md: {
    track:
      "h-2.5",

    percentage:
      "text-xs",

    labels:
      "text-xs",
  },

  lg: {
    track:
      "h-3",

    percentage:
      "text-sm",

    labels:
      "text-sm",
  },
};

/* =========================================================
   LABEL RESOLUTION
========================================================= */

const normalizeText = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsProgressBar = ({
  /* =======================================================
     PROGRESS INPUT
  ======================================================= */

  progress,

  current,

  target,

  /* =======================================================
     DISPLAY
  ======================================================= */

  currency = "NGN",

  showPercentage = true,

  showAmounts = true,

  showRemaining = false,

  showTarget = true,

  showCurrent = true,

  /* =======================================================
     LABELS
  ======================================================= */

  label = "Savings progress",

  currentLabel = "Saved",

  targetLabel = "Target",

  remainingLabel = "Remaining",

  completedLabel = "Goal completed",

  /* =======================================================
     STATUS
  ======================================================= */

  status,

  /* =======================================================
     SIZE
  ======================================================= */

  size = "md",

  /* =======================================================
     APPEARANCE
  ======================================================= */

  rounded = true,

  animated = true,

  showIcon = false,

  className = "",

  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  ariaLabel,
}) => {
  /* =======================================================
     NORMALIZE INPUTS
  ======================================================= */

  const normalizedCurrent =
    Math.max(
      0,
      toFiniteNumber(
        current
      )
    );

  const normalizedTarget =
    Math.max(
      0,
      toFiniteNumber(
        target
      )
    );

  const percentage =
    resolveProgress({
      progress,
      current:
        normalizedCurrent,
      target:
        normalizedTarget,
    });

  const isCompleted =
    normalizedTarget > 0 &&
    normalizedCurrent >=
      normalizedTarget;

  const normalizedStatus =
    normalizeText(status)
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_"
      );

  const resolvedStatus =
    isCompleted
      ? STATUS.COMPLETED
      : normalizedStatus ||
        STATUS.ACTIVE;

  const visual =
    STATUS_CONFIG[
      resolvedStatus
    ] ??
    STATUS_CONFIG.default;

  const sizeConfig =
    SIZE_CONFIG[size] ??
    SIZE_CONFIG.md;

  /* =======================================================
     REMAINING
  ======================================================= */

  const remainingAmount =
    Math.max(
      0,
      normalizedTarget -
        normalizedCurrent
    );

  /* =======================================================
     FORMATTED VALUES
  ======================================================= */

  const formattedCurrent =
    safeFormatCurrency(
      normalizedCurrent,
      currency
    );

  const formattedTarget =
    safeFormatCurrency(
      normalizedTarget,
      currency
    );

  const formattedRemaining =
    safeFormatCurrency(
      remainingAmount,
      currency
    );

  /* =======================================================
     ACCESSIBILITY
  ======================================================= */

  const resolvedAriaLabel =
    ariaLabel ||
    `${label}: ${Math.round(
      percentage
    )}%`;

  /* =======================================================
     PERCENTAGE
  ======================================================= */

  const displayPercentage =
    `${Math.round(
      percentage
    )}%`;

  /* =======================================================
     COMPLETION ICON
  ======================================================= */

  const StatusIcon =
    isCompleted
      ? CheckCircle2
      : Target;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
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
        {/* ===============================================
            LABEL
        =============================================== */}

        <div
          className="
            flex items-center
            min-w-0
            gap-1.5
          "
        >
          {showIcon && (
            <StatusIcon
              size={
                size === "lg"
                  ? 16
                  : 14
              }
              className={`
                shrink-0
                ${visual.icon}
              `}
              aria-hidden="true"
            />
          )}

          <span
            className="
              truncate font-medium text-slate-600
              ${sizeConfig.labels}
            "
          >
            {isCompleted
              ? completedLabel
              : label}
          </span>
        </div>

        {/* ===============================================
            PERCENTAGE
        =============================================== */}

        {showPercentage && (
          <span
            className={`
              shrink-0
              font-bold
              tabular-nums
              ${visual.text}
              ${sizeConfig.percentage}
            `}
          >
            {displayPercentage}
          </span>
        )}
      </div>

      {/* =================================================
          PROGRESS TRACK
      ================================================= */}

      <div
        className={`
          w-full
          overflow-hidden
          ${sizeConfig.track}
          ${visual.track}
          ${rounded
            ? "rounded-full"
            : ""}
        `}
        role="progressbar"
        aria-label={
          resolvedAriaLabel
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          Number(
            percentage.toFixed(2)
          )
        }
      >
        <div
          className={`
            h-full
            max-w-full
            ${visual.fill}
            ${rounded
              ? "rounded-full"
              : ""}
            ${
              animated
                ? "transition-[width] duration-500 ease-out"
                : ""
            }
          `}
          style={{
            width: `${percentage}%`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* =================================================
          AMOUNT INFORMATION
      ================================================= */}

      {showAmounts && (
        <div
          className="
            flex flex-wrap justify-between items-center
            mt-2
            gap-x-4 gap-y-1
          "
        >
          {/* =============================================
              CURRENT
          ============================================= */}

          {showCurrent && (
            <div
              className="
                flex items-center
                min-w-0
                gap-1.5
              "
            >
              <span
                className={`
                  text-slate-500
                  ${sizeConfig.labels}
                `}
              >
                {currentLabel}
              </span>

              <span
                className={`
                  font-semibold
                  tabular-nums
                  text-slate-800
                  ${sizeConfig.labels}
                `}
              >
                {formattedCurrent}
              </span>
            </div>
          )}

          {/* =============================================
              TARGET
          ============================================= */}

          {showTarget && (
            <div
              className="
                flex items-center
                min-w-0
                gap-1.5
              "
            >
              <span
                className={`
                  text-slate-500
                  ${sizeConfig.labels}
                `}
              >
                {targetLabel}
              </span>

              <span
                className={`
                  font-semibold
                  tabular-nums
                  text-slate-800
                  ${sizeConfig.labels}
                `}
              >
                {formattedTarget}
              </span>
            </div>
          )}
        </div>
      )}

      {/* =================================================
          REMAINING AMOUNT
      ================================================= */}

      {showRemaining &&
        !isCompleted &&
        normalizedTarget > 0 && (
          <div
            className="
              flex justify-between items-center
              mt-2 px-2.5 py-2
              bg-slate-50
              rounded-lg
              gap-3
            "
          >
            <span
              className={`
                text-slate-500
                ${sizeConfig.labels}
              `}
            >
              {remainingLabel}
            </span>

            <span
              className={`
                font-semibold
                tabular-nums
                text-slate-800
                ${sizeConfig.labels}
              `}
            >
              {formattedRemaining}
            </span>
          </div>
        )}
    </div>
  );
};

export default SavingsProgressBar;
