
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Info,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
  SAFE_TO_SAVE_STATUS,
} from "../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
} from "../../../utils/smartSave/savingsFormatters";

/* =========================================================
   SAFE HELPERS
========================================================= */

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

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
   SAFE-TO-SAVE STATUS
========================================================= */

const STATUS = {
  SAFE:
    SAFE_TO_SAVE_STATUS?.SAFE ??
    "safe",

  CAUTION:
    SAFE_TO_SAVE_STATUS?.CAUTION ??
    "caution",

  RISK:
    SAFE_TO_SAVE_STATUS?.RISK ??
    "risk",

  UNSAFE:
    SAFE_TO_SAVE_STATUS?.UNSAFE ??
    "unsafe",

  UNKNOWN:
    SAFE_TO_SAVE_STATUS?.UNKNOWN ??
    "unknown",
};

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  [STATUS.SAFE]: {
    label: "Safe to save",
    description:
      "You have room to put money toward your savings without putting your current finances under unnecessary pressure.",
    icon: CheckCircle2,
    iconClass:
      "text-emerald-600",
    iconBackground:
      "bg-emerald-50",
    valueClass:
      "text-emerald-700",
    badgeClass:
      "bg-emerald-50 text-emerald-700",
    progressClass:
      "bg-emerald-500",
  },

  [STATUS.CAUTION]: {
    label: "Save with caution",
    description:
      "You can save, but keeping a reasonable cash buffer is recommended.",
    icon: AlertTriangle,
    iconClass:
      "text-amber-600",
    iconBackground:
      "bg-amber-50",
    valueClass:
      "text-amber-700",
    badgeClass:
      "bg-amber-50 text-amber-700",
    progressClass:
      "bg-amber-500",
  },

  [STATUS.RISK]: {
    label: "Saving may be risky",
    description:
      "Your available financial buffer appears limited. Consider protecting essential cash flow first.",
    icon: TrendingDown,
    iconClass:
      "text-orange-600",
    iconBackground:
      "bg-orange-50",
    valueClass:
      "text-orange-700",
    badgeClass:
      "bg-orange-50 text-orange-700",
    progressClass:
      "bg-orange-500",
  },

  [STATUS.UNSAFE]: {
    label: "Not safe to save",
    description:
      "Your current financial position does not provide a comfortable savings buffer.",
    icon: AlertTriangle,
    iconClass:
      "text-red-600",
    iconBackground:
      "bg-red-50",
    valueClass:
      "text-red-700",
    badgeClass:
      "bg-red-50 text-red-700",
    progressClass:
      "bg-red-500",
  },

  [STATUS.UNKNOWN]: {
    label: "Safety unavailable",
    description:
      "There is not enough reliable financial information to determine a safe savings amount.",
    icon: Info,
    iconClass:
      "text-slate-500",
    iconBackground:
      "bg-slate-100",
    valueClass:
      "text-slate-700",
    badgeClass:
      "bg-slate-100 text-slate-600",
    progressClass:
      "bg-slate-400",
  },
};

/* =========================================================
   STATUS RESOLUTION
========================================================= */

const resolveStatus = (
  result
) => {
  const explicitStatus =
    normalizeKey(
      result?.status ??
        result?.safetyStatus ??
        result?.riskLevel
    );

  if (
    explicitStatus ===
    STATUS.SAFE
  ) {
    return STATUS.SAFE;
  }

  if (
    explicitStatus ===
      STATUS.CAUTION ||
    explicitStatus ===
      "moderate" ||
    explicitStatus ===
      "warning"
  ) {
    return STATUS.CAUTION;
  }

  if (
    explicitStatus ===
      STATUS.RISK ||
    explicitStatus ===
      "high_risk"
  ) {
    return STATUS.RISK;
  }

  if (
    explicitStatus ===
      STATUS.UNSAFE ||
    explicitStatus ===
      "danger" ||
    explicitStatus ===
      "critical"
  ) {
    return STATUS.UNSAFE;
  }

  if (
    explicitStatus ===
    STATUS.UNKNOWN
  ) {
    return STATUS.UNKNOWN;
  }

  /*
   * Some safeToSave utilities return
   * a boolean instead of a status.
   */
  if (
    typeof result?.isSafe ===
    "boolean"
  ) {
    return result.isSafe
      ? STATUS.SAFE
      : STATUS.UNSAFE;
  }

  if (
    typeof result?.safe ===
    "boolean"
  ) {
    return result.safe
      ? STATUS.SAFE
      : STATUS.UNSAFE;
  }

  return STATUS.UNKNOWN;
};

/* =========================================================
   VALUE RESOLUTION
========================================================= */

const resolveSafeAmount = (
  result
) =>
  Math.max(
    0,
    toFiniteNumber(
      result?.safeToSave ??
        result?.safeAmount ??
        result?.recommendedAmount ??
        result?.maximumSafeAmount ??
        result?.amount
    )
  );

const resolveAvailableAmount = (
  result
) =>
  Math.max(
    0,
    toFiniteNumber(
      result?.availableAmount ??
        result?.availableToSave ??
        result?.disposableAmount ??
        result?.surplus
    )
  );

const resolveBufferAmount = (
  result
) =>
  Math.max(
    0,
    toFiniteNumber(
      result?.buffer ??
        result?.emergencyBuffer ??
        result?.minimumBuffer
    )
  );

/* =========================================================
   PERCENTAGE RESOLUTION
========================================================= */

const resolvePercentage = (
  result,
  safeAmount,
  availableAmount
) => {
  const explicit =
    result?.percentage ??
    result?.safetyPercentage ??
    result?.score;

  if (
    explicit !== null &&
    explicit !== undefined
  ) {
    const number =
      toFiniteNumber(
        explicit
      );

    return clamp(
      number <= 1
        ? number * 100
        : number
    );
  }

  if (
    availableAmount <= 0
  ) {
    return 0;
  }

  return clamp(
    (safeAmount /
      availableAmount) *
      100
  );
};

/* =========================================================
   CURRENCY FORMATTER
========================================================= */

const safeFormatCurrency = (
  value,
  currency
) => {
  const amount =
    toFiniteNumber(value);

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
          currency:
            currency ||
            DEFAULT_CURRENCY ||
            "NGN",
          maximumFractionDigits: 2,
        }
      ).format(amount);
    } catch {
      return `${currency || "NGN"} ${amount.toLocaleString()}`;
    }
  }
};

/* =========================================================
   SIZE CONFIGURATION
========================================================= */

const SIZE_CONFIG = {
  sm: {
    card: "p-4",
    icon: "h-9 w-9",
    iconSize: 17,
    title: "text-sm",
    amount: "text-xl",
    description: "text-[11px]",
    detail: "text-[11px]",
    progress: "h-1.5",
  },

  md: {
    card: "p-5",
    icon: "h-11 w-11",
    iconSize: 20,
    title: "text-base",
    amount: "text-2xl",
    description: "text-xs",
    detail: "text-xs",
    progress: "h-2",
  },

  lg: {
    card: "p-6",
    icon: "h-12 w-12",
    iconSize: 22,
    title: "text-lg",
    amount: "text-3xl",
    description: "text-sm",
    detail: "text-sm",
    progress: "h-2.5",
  },
};

/* =========================================================
   DETAIL ROW
========================================================= */

const DetailRow = ({
  label,
  value,
  muted = false,
}) => (
  <div
    className="
      flex justify-between items-center
      min-w-0
      gap-4
    "
  >
    <span
      className={`
        truncate
        ${
          muted
            ? "text-slate-400"
            : "text-slate-500"
        }
        text-xs
      `}
    >
      {label}
    </span>

    <span
      className="
        font-medium tabular-nums text-slate-700 text-xs
        shrink-0
      "
    >
      {value}
    </span>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SafeToSaveCard = ({
  result = null,

  /*
   * Allows direct use with a normalized
   * safe amount when desired.
   */
  safeAmount,

  currency =
    DEFAULT_CURRENCY ??
    "NGN",

  size = "md",

  title = "Safe to Save",

  showDescription = true,

  showProgress = true,

  showDetails = true,

  showStatus = true,

  showTrend = false,

  trend = null,

  onSave,

  actionLabel = "Save this amount",

  disabled = false,

  className = "",

  ariaLabel = "Safe to save recommendation",
}) => {
  /* =======================================================
     NORMALIZE RESULT
  ======================================================= */

  const normalizedResult =
    result &&
    typeof result ===
      "object"
      ? result
      : {};

  const resolvedSafeAmount =
    safeAmount !==
      undefined &&
    safeAmount !== null
      ? Math.max(
          0,
          toFiniteNumber(
            safeAmount
          )
        )
      : resolveSafeAmount(
          normalizedResult
        );

  const availableAmount =
    resolveAvailableAmount(
      normalizedResult
    );

  const bufferAmount =
    resolveBufferAmount(
      normalizedResult
    );

  const percentage =
    resolvePercentage(
      normalizedResult,
      resolvedSafeAmount,
      availableAmount
    );

  const status =
    resolveStatus(
      normalizedResult
    );

  const config =
    STATUS_CONFIG[
      status
    ] ??
    STATUS_CONFIG[
      STATUS.UNKNOWN
    ];

  const sizeConfig =
    SIZE_CONFIG[
      size
    ] ??
    SIZE_CONFIG.md;

  const Icon =
    config.icon ??
    ShieldCheck;

  /* =======================================================
     OPTIONAL TREND
  ======================================================= */

  const normalizedTrend =
    trend &&
    typeof trend ===
      "object"
      ? trend
      : null;

  const trendValue =
    toFiniteNumber(
      normalizedTrend?.value ??
        normalizedTrend?.percentage,
      NaN
    );

  const trendDirection =
    normalizeKey(
      normalizedTrend?.direction
    );

  const hasTrend =
    showTrend &&
    normalizedTrend &&
    Number.isFinite(
      trendValue
    );

  /* =======================================================
     ACTION HANDLER
  ======================================================= */

  const handleSave = () => {
    if (
      disabled ||
      typeof onSave !==
        "function" ||
      resolvedSafeAmount <= 0
    ) {
      return;
    }

    onSave({
      amount:
        resolvedSafeAmount,
      currency,
      status,
    });
  };

  /* =======================================================
     FORMATTED VALUES
  ======================================================= */

  const formattedSafeAmount =
    safeFormatCurrency(
      resolvedSafeAmount,
      currency
    );

  const formattedAvailable =
    safeFormatCurrency(
      availableAmount,
      currency
    );

  const formattedBuffer =
    safeFormatCurrency(
      bufferAmount,
      currency
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className={`
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        ${sizeConfig.card}
        ${className}
      `}
      aria-label={
        ariaLabel
      }
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex justify-between items-start
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
          {/* ===============================================
              ICON
          =============================================== */}

          <div
            className={`
              flex
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${config.iconBackground}
              ${sizeConfig.icon}
            `}
            aria-hidden="true"
          >
            <Icon
              size={
                sizeConfig.iconSize
              }
              strokeWidth={1.9}
              className={
                config.iconClass
              }
            />
          </div>

          {/* ===============================================
              TITLE
          =============================================== */}

          <div
            className="
              min-w-0
            "
          >
            <h2
              className={`
                truncate
                font-semibold
                text-slate-900
                ${sizeConfig.title}
              `}
            >
              {title}
            </h2>

            {showStatus && (
              <span
                className={`
                  mt-1
                  inline-flex
                  items-center
                  rounded-full
                  px-2
                  py-0.5
                  font-semibold
                  ${sizeConfig.description}
                  ${config.badgeClass}
                `}
              >
                {config.label}
              </span>
            )}
          </div>
        </div>

        {/* ===============================================
            TREND
        =============================================== */}

        {hasTrend && (
          <div
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-full
              px-2
              py-1
              text-xs
              font-semibold
              ${
                trendDirection ===
                  "down"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }
            `}
          >
            {trendDirection ===
            "down" ? (
              <TrendingDown
                size={13}
                aria-hidden="true"
              />
            ) : (
              <TrendingUp
                size={13}
                aria-hidden="true"
              />
            )}

            <span>
              {Math.abs(
                trendValue
              )}%
            </span>
          </div>
        )}
      </div>

      {/* ===================================================
          MAIN SAFE AMOUNT
      =================================================== */}

      <div
        className="
          mt-6
        "
      >
        <p
          className="
            font-medium text-slate-500 text-xs
          "
        >
          Recommended amount
        </p>

        <div
          className="
            flex items-baseline
            mt-1
            gap-2
          "
        >
          <p
            className={`
              font-bold
              tracking-tight
              tabular-nums
              ${config.valueClass}
              ${sizeConfig.amount}
            `}
          >
            {formattedSafeAmount}
          </p>

          <CircleDollarSign
            size={17}
            className="
              text-slate-300
            "
            aria-hidden="true"
          /
          >
        </div>
      </div>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      {showDescription && (
        <p
          className={`
            mt-3
            leading-5
            text-slate-500
            ${sizeConfig.description}
          `}
        >
          {config.description}
        </p>
      )}

      {/* ===================================================
          PROGRESS
      =================================================== */}

      {showProgress && (
        <div
          className="
            mt-5
          "
        >
          <div
            className="
              flex justify-between items-center
              mb-2
              gap-3
            "
          >
            <span
              className="
                font-medium text-slate-500 text-xs
              "
            >
              Savings capacity
            </span>

            <span
              className="
                font-semibold tabular-nums text-slate-700 text-xs
              "
            >
              {Math.round(
                percentage
              )}%
            </span>
          </div>

          <div
            className={`
              w-full
              overflow-hidden
              rounded-full
              bg-slate-100
              ${sizeConfig.progress}
            `}
            role="progressbar"
            aria-label="Savings capacity"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(
              percentage.toFixed(2)
            )}
          >
            <div
              className={`
                h-full
                rounded-full
                transition-[width]
                duration-500
                ease-out
                ${config.progressClass}
              `}
              style={{
                width: `${percentage}%`,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* ===================================================
          FINANCIAL DETAILS
      =================================================== */}

      {showDetails && (
        <div
          className="
            space-y-3 mt-5 p-3.5
            bg-slate-50
            rounded-xl
          "
        >
          {availableAmount >
            0 && (
            <DetailRow
              label="Available to save"
              value={
                formattedAvailable
              }
            />
          )}

          {bufferAmount >
            0 && (
            <DetailRow
              label="Protected buffer"
              value={
                formattedBuffer
              }
            />
          )}

          <DetailRow
            label="Recommended savings"
            value={
              formattedSafeAmount
            }
          />
        </div>
      )}

      {/* ===================================================
          ACTION
      =================================================== */}

      {typeof onSave ===
        "function" &&
        resolvedSafeAmount >
          0 && (
          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              disabled
            }
            className="
              inline-flex justify-center items-center
              w-full
              mt-5 px-4 py-3
              font-semibold text-white text-sm
              bg-slate-900 hover:bg-slate-800
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <CircleDollarSign
              size={17}
              aria-hidden="true"
            />

            {actionLabel}
          </button>
        )}

      {/* ===================================================
          INFORMATION FOOTER
      =================================================== */}

      <div
        className="
          flex items-start
          mt-4 pt-3
          border-slate-100 border-t
          gap-2
        "
      >
        <Info
          size={14}
          className="
            mt-0.5
            text-slate-400
            shrink-0
          "
          aria-hidden="true"
        /
        >

        <p
          className="
            text-[10px] text-slate-400 leading-4
          "
        >
          This recommendation is based
          on the financial information
          currently available to SmartSave.
          Keep enough cash available for
          essential expenses and unexpected
          needs.
        </p>
      </div>
    </article>
  );
};

export default SafeToSaveCard;
