
import {
  ArrowDown,
  ArrowUp,
  Minus,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const normalizeCurrency = (currency) => {
  if (
    typeof currency !== "string" ||
    !currency.trim()
  ) {
    return DEFAULT_CURRENCY ?? "NGN";
  }

  return currency
    .trim()
    .toUpperCase();
};

const normalizeTrend = (trend) => {
  if (
    typeof trend !== "string"
  ) {
    return "neutral";
  }

  const normalized =
    trend
      .trim()
      .toLowerCase();

  if (
    normalized === "up" ||
    normalized === "increase" ||
    normalized === "increased" ||
    normalized === "positive" ||
    normalized === "growth"
  ) {
    return "up";
  }

  if (
    normalized === "down" ||
    normalized === "decrease" ||
    normalized === "decreased" ||
    normalized === "negative" ||
    normalized === "decline"
  ) {
    return "down";
  }

  return "neutral";
};

/* =========================================================
   TREND CONFIGURATION
========================================================= */

const TREND_CONFIG = {
  up: {
    icon: TrendingUp,
    indicator: ArrowUp,
    label: "Increasing",
    className:
      "text-emerald-700",
  },

  down: {
    icon: TrendingDown,
    indicator: ArrowDown,
    label: "Decreasing",
    className:
      "text-red-700",
  },

  neutral: {
    icon: Minus,
    indicator: Minus,
    label: "Stable",
    className:
      "text-slate-500",
  },
};

/* =========================================================
   SIZE CONFIGURATION
========================================================= */

const SIZE_CONFIG = {
  sm: {
    amount:
      "text-lg font-bold",
    currency:
      "text-xs font-semibold",
    label:
      "text-[11px]",
    icon:
      "h-8 w-8",
    iconSize: 15,
  },

  md: {
    amount:
      "text-2xl font-bold",
    currency:
      "text-sm font-semibold",
    label:
      "text-xs",
    icon:
      "h-9 w-9",
    iconSize: 17,
  },

  lg: {
    amount:
      "text-3xl font-bold",
    currency:
      "text-sm font-semibold",
    label:
      "text-xs",
    icon:
      "h-10 w-10",
    iconSize: 19,
  },

  xl: {
    amount:
      "text-4xl font-bold",
    currency:
      "text-base font-semibold",
    label:
      "text-sm",
    icon:
      "h-12 w-12",
    iconSize: 21,
  },
};

/* =========================================================
   FORMAT AMOUNT
========================================================= */

const getFormattedAmount = (
  amount,
  currency
) => {
  try {
    return formatCurrency(
      amount,
      currency
    );
  } catch {
    try {
      return new Intl.NumberFormat(
        undefined,
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }
      ).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsAmount = ({
  amount = 0,
  currency,
  label,

  previousAmount,
  targetAmount,

  trend,
  trendValue,

  size = "md",

  showIcon = false,
  showTrend = false,
  showTarget = false,

  prefix,
  suffix,

  muted = false,
  compact = false,

  className = "",
}) => {
  /* =======================================================
     NORMALIZED VALUES
  ======================================================= */

  const numericAmount =
    toFiniteNumber(amount);

  const normalizedCurrency =
    normalizeCurrency(currency);

  const normalizedSize =
    SIZE_CONFIG[size] ??
    SIZE_CONFIG.md;

  const formattedAmount =
    getFormattedAmount(
      numericAmount,
      normalizedCurrency
    );

  /* =======================================================
     TREND
  ======================================================= */

  let normalizedTrend =
    normalizeTrend(trend);

  const numericPreviousAmount =
    toFiniteNumber(
      previousAmount
    );

  /*
   * Only infer a trend when the caller did not
   * explicitly provide one.
   */
  if (
    trend === undefined &&
    previousAmount !== undefined
  ) {
    if (
      numericAmount >
      numericPreviousAmount
    ) {
      normalizedTrend = "up";
    } else if (
      numericAmount <
      numericPreviousAmount
    ) {
      normalizedTrend = "down";
    } else {
      normalizedTrend = "neutral";
    }
  }

  const trendConfig =
    TREND_CONFIG[
      normalizedTrend
    ] ??
    TREND_CONFIG.neutral;

  const TrendIcon =
    trendConfig.icon;

  const TrendIndicator =
    trendConfig.indicator;

  /* =======================================================
     TARGET
  ======================================================= */

  const numericTarget =
    toFiniteNumber(
      targetAmount
    );

  const formattedTarget =
    showTarget &&
    numericTarget > 0
      ? getFormattedAmount(
          numericTarget,
          normalizedCurrency
        )
      : null;

  /* =======================================================
     TREND VALUE
  ======================================================= */

  const hasTrendValue =
    trendValue !== null &&
    trendValue !== undefined &&
    trendValue !== "";

  const numericTrendValue =
    hasTrendValue
      ? toFiniteNumber(
          trendValue
        )
      : null;

  const formattedTrendValue =
    numericTrendValue !== null
      ? `${numericTrendValue > 0 ? "+" : ""}${numericTrendValue.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          }
        )}%`
      : null;

  /* =======================================================
     ICON
  ======================================================= */

  const showAmountIcon =
    Boolean(showIcon);

  /* =======================================================
     LABEL
  ======================================================= */

  const accessibleLabel =
    label ||
    "Savings amount";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`
        min-w-0
        ${className}
      `}
    >
      {/* ===================================================
          LABEL / HEADER
      =================================================== */}

      {(label ||
        showAmountIcon) && (
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
            {showAmountIcon && (
              <span
                className={`
                  flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-700
                  ${normalizedSize.icon}
                `}
                aria-hidden="true"
              >
                <PiggyBank
                  size={
                    normalizedSize.iconSize
                  }
                />
              </span>
            )}

            {label && (
              <span
                className={`
                  truncate
                  font-medium
                  text-slate-500
                  ${normalizedSize.label}
                `}
              >
                {label}
              </span>
            )}
          </div>

          {showTrend && (
            <span
              className={`
                inline-flex
                shrink-0
                items-center
                gap-1
                text-xs
                font-semibold
                ${trendConfig.className}
              `}
              aria-label={
                formattedTrendValue
                  ? `${trendConfig.label}: ${formattedTrendValue}`
                  : trendConfig.label
              }
            >
              <TrendIndicator
                size={13}
              />

              {formattedTrendValue ??
                trendConfig.label}
            </span>
          )}
        </div>
      )}

      {/* ===================================================
          AMOUNT
      =================================================== */}

      <div
        className={`
          flex
          min-w-0
          items-baseline
          ${label || showAmountIcon ? "mt-1.5" : ""}
        `}
        aria-label={`${accessibleLabel}: ${formattedAmount}`}
      >
        {prefix && (
          <span
            className="
              mr-1
              font-medium text-slate-500 text-sm
            "
          >
            {prefix}
          </span>
        )}

        <span
          className={`
            truncate
            tracking-tight
            ${
              muted
                ? "text-slate-500"
                : "text-slate-900"
            }
            ${normalizedSize.amount}
          `}
        >
          {formattedAmount}
        </span>

        {suffix && (
          <span
            className="
              ml-1
              font-medium text-slate-500 text-xs
            "
          >
            {suffix}
          </span>
        )}
      </div>

      {/* ===================================================
          TARGET
      =================================================== */}

      {formattedTarget && (
        <div
          className="
            flex items-center
            mt-1
            text-slate-500 text-xs
            gap-1
          "
        >
          <span>
            of
          </span>

          <span
            className="
              font-semibold text-slate-700
            "
          >
            {formattedTarget}
          </span>
        </div>
      )}

      {/* ===================================================
          TREND DETAILS
      =================================================== */}

      {showTrend &&
        !label &&
        (formattedTrendValue ||
          normalizedTrend !==
            "neutral") && (
          <div
            className={`
              mt-1.5
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              ${trendConfig.className}
            `}
          >
            <TrendIcon
              size={13}
            />

            <span>
              {formattedTrendValue ??
                trendConfig.label}
            </span>
          </div>
        )}

      {/* ===================================================
          COMPACT CURRENCY CONTEXT
      =================================================== */}

      {compact && (
        <span
          className="
            sr-only
          "
        >
          Currency:
          {normalizedCurrency}
        </span>
      )}
    </div>
  );
};

export default SavingsAmount;