
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
  SAVINGS_HEALTH_STATUS,
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
   HEALTH STATUS
========================================================= */

const HEALTH_STATUS = {
  EXCELLENT:
    SAVINGS_HEALTH_STATUS?.EXCELLENT ??
    "excellent",

  GOOD:
    SAVINGS_HEALTH_STATUS?.GOOD ??
    "good",

  FAIR:
    SAVINGS_HEALTH_STATUS?.FAIR ??
    "fair",

  POOR:
    SAVINGS_HEALTH_STATUS?.POOR ??
    "poor",

  CRITICAL:
    SAVINGS_HEALTH_STATUS?.CRITICAL ??
    "critical",

  UNKNOWN:
    SAVINGS_HEALTH_STATUS?.UNKNOWN ??
    "unknown",
};

/* =========================================================
   SCORE THRESHOLDS
========================================================= */

const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 65,
  FAIR: 45,
  POOR: 25,
};

/* =========================================================
   HEALTH STATUS CONFIG
========================================================= */

const HEALTH_CONFIG = {
  [HEALTH_STATUS.EXCELLENT]: {
    label: "Excellent",
    description:
      "Your savings position is strong and well established.",
    icon: ShieldCheck,
    iconClass:
      "text-emerald-600",
    iconBackground:
      "bg-emerald-50",
    textClass:
      "text-emerald-700",
    badgeClass:
      "bg-emerald-50 text-emerald-700",
    progressClass:
      "bg-emerald-500",
    ringClass:
      "text-emerald-500",
  },

  [HEALTH_STATUS.GOOD]: {
    label: "Good",
    description:
      "Your savings position is healthy, with room to keep building consistency.",
    icon: CheckCircle2,
    iconClass:
      "text-green-600",
    iconBackground:
      "bg-green-50",
    textClass:
      "text-green-700",
    badgeClass:
      "bg-green-50 text-green-700",
    progressClass:
      "bg-green-500",
    ringClass:
      "text-green-500",
  },

  [HEALTH_STATUS.FAIR]: {
    label: "Fair",
    description:
      "Your savings foundation is developing, but consistency can still improve.",
    icon: TrendingUp,
    iconClass:
      "text-amber-600",
    iconBackground:
      "bg-amber-50",
    textClass:
      "text-amber-700",
    badgeClass:
      "bg-amber-50 text-amber-700",
    progressClass:
      "bg-amber-500",
    ringClass:
      "text-amber-500",
  },

  [HEALTH_STATUS.POOR]: {
    label: "Needs attention",
    description:
      "Your savings position needs improvement before it can provide a strong financial cushion.",
    icon: AlertTriangle,
    iconClass:
      "text-orange-600",
    iconBackground:
      "bg-orange-50",
    textClass:
      "text-orange-700",
    badgeClass:
      "bg-orange-50 text-orange-700",
    progressClass:
      "bg-orange-500",
    ringClass:
      "text-orange-500",
  },

  [HEALTH_STATUS.CRITICAL]: {
    label: "Critical",
    description:
      "Your savings position is currently under significant pressure.",
    icon: ShieldAlert,
    iconClass:
      "text-red-600",
    iconBackground:
      "bg-red-50",
    textClass:
      "text-red-700",
    badgeClass:
      "bg-red-50 text-red-700",
    progressClass:
      "bg-red-500",
    ringClass:
      "text-red-500",
  },

  [HEALTH_STATUS.UNKNOWN]: {
    label: "Unavailable",
    description:
      "There is not enough reliable financial information to calculate your savings health.",
    icon: Info,
    iconClass:
      "text-slate-500",
    iconBackground:
      "bg-slate-100",
    textClass:
      "text-slate-600",
    badgeClass:
      "bg-slate-100 text-slate-600",
    progressClass:
      "bg-slate-400",
    ringClass:
      "text-slate-400",
  },
};

/* =========================================================
   SIZE CONFIGURATION
========================================================= */

const SIZE_CONFIG = {
  sm: {
    card: "p-4",
    score: "text-2xl",
    title: "text-sm",
    description: "text-[11px]",
    icon: "h-9 w-9",
    iconSize: 17,
    ring: 76,
    stroke: 7,
  },

  md: {
    card: "p-5",
    score: "text-3xl",
    title: "text-base",
    description: "text-xs",
    icon: "h-11 w-11",
    iconSize: 20,
    ring: 96,
    stroke: 8,
  },

  lg: {
    card: "p-6",
    score: "text-4xl",
    title: "text-lg",
    description: "text-sm",
    icon: "h-12 w-12",
    iconSize: 22,
    ring: 116,
    stroke: 9,
  },
};

/* =========================================================
   SCORE RESOLUTION
========================================================= */

const resolveScore = (
  data
) => {
  const rawScore =
    data?.score ??
    data?.healthScore ??
    data?.savingsHealthScore ??
    data?.value;

  const score =
    toFiniteNumber(
      rawScore,
      NaN
    );

  if (
    !Number.isFinite(score)
  ) {
    return null;
  }

  /*
   * Support either:
   * 0.85 → 85
   * 85   → 85
   */
  const normalized =
    score >= 0 &&
    score <= 1
      ? score * 100
      : score;

  return clamp(
    normalized
  );
};

/* =========================================================
   STATUS RESOLUTION
========================================================= */

const resolveStatus = (
  data,
  score
) => {
  const explicitStatus =
    normalizeKey(
      data?.status ??
        data?.healthStatus ??
        data?.level ??
        data?.rating
    );

  const aliases = {
    excellent:
      HEALTH_STATUS.EXCELLENT,

    very_good:
      HEALTH_STATUS.EXCELLENT,

    good:
      HEALTH_STATUS.GOOD,

    healthy:
      HEALTH_STATUS.GOOD,

    fair:
      HEALTH_STATUS.FAIR,

    average:
      HEALTH_STATUS.FAIR,

    moderate:
      HEALTH_STATUS.FAIR,

    poor:
      HEALTH_STATUS.POOR,

    needs_attention:
      HEALTH_STATUS.POOR,

    weak:
      HEALTH_STATUS.POOR,

    critical:
      HEALTH_STATUS.CRITICAL,

    danger:
      HEALTH_STATUS.CRITICAL,
  };

  if (
    aliases[
      explicitStatus
    ]
  ) {
    return aliases[
      explicitStatus
    ];
  }

  if (
    score === null
  ) {
    return HEALTH_STATUS.UNKNOWN;
  }

  if (
    score >=
    SCORE_THRESHOLDS.EXCELLENT
  ) {
    return HEALTH_STATUS.EXCELLENT;
  }

  if (
    score >=
    SCORE_THRESHOLDS.GOOD
  ) {
    return HEALTH_STATUS.GOOD;
  }

  if (
    score >=
    SCORE_THRESHOLDS.FAIR
  ) {
    return HEALTH_STATUS.FAIR;
  }

  if (
    score >=
    SCORE_THRESHOLDS.POOR
  ) {
    return HEALTH_STATUS.POOR;
  }

  return HEALTH_STATUS.CRITICAL;
};

/* =========================================================
   SCORE LABEL
========================================================= */

const resolveScoreLabel = (
  score,
  status
) => {
  if (
    score === null
  ) {
    return "—";
  }

  if (
    status ===
    HEALTH_STATUS.EXCELLENT
  ) {
    return "Excellent";
  }

  if (
    status ===
    HEALTH_STATUS.GOOD
  ) {
    return "Healthy";
  }

  if (
    status ===
    HEALTH_STATUS.FAIR
  ) {
    return "Developing";
  }

  if (
    status ===
    HEALTH_STATUS.POOR
  ) {
    return "Needs work";
  }

  if (
    status ===
    HEALTH_STATUS.CRITICAL
  ) {
    return "At risk";
  }

  return "Unavailable";
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
   RING
========================================================= */

const ScoreRing = ({
  score,
  size,
  statusConfig,
}) => {
  const dimension =
    size.ring;

  const radius =
    (dimension -
      size.stroke) /
    2;

  const circumference =
    2 *
    Math.PI *
    radius;

  const progress =
    score === null
      ? 0
      : score / 100;

  const dashOffset =
    circumference *
    (1 - progress);

  return (
    <div
      className="
        relative
        shrink-0
      "
      style={{
        width:
          dimension,
        height:
          dimension,
      }}
      role="img"
      aria-label={
        score === null
          ? "Savings health score unavailable"
          : `Savings health score ${Math.round(
              score
            )} out of 100`
      }
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="
          -rotate-90
        "
        aria-hidden="true"
      >
        {/* ===============================================
            TRACK
        =============================================== */}

        <circle
          cx={
            dimension / 2
          }
          cy={
            dimension / 2
          }
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={
            size.stroke
          }
          className="
            text-slate-100
          "
          /
        >

        {/* ===============================================
            SCORE
        =============================================== */}

        <circle
          cx={
            dimension / 2
          }
          cy={
            dimension / 2
          }
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={
            size.stroke
          }
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            dashOffset
          }
          className={`
            ${statusConfig.ringClass}
            transition-[stroke-dashoffset]
            duration-700
            ease-out
          `}
        />
      </svg>

      {/* =================================================
          CENTER CONTENT
      ================================================= */}

      <div
        className="
          absolute inset-0 flex flex-col justify-center items-center
        "
      >
        <span
          className="
            font-medium text-[10px] text-slate-400 uppercase tracking-wide
          "
        >
          Score
        </span>

        <span
          className="
            mt-0.5
            font-bold tabular-nums text-slate-900 text-xl
          "
        >
          {score === null
            ? "—"
            : Math.round(
                score
              )}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   METRIC ROW
========================================================= */

const MetricRow = ({
  label,
  value,
  description,
}) => (
  <div
    className="
      flex justify-between items-center
      min-w-0
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
          font-medium text-slate-600 text-xs truncate
        "
      >
        {label}
      </p>

      {description && (
        <p
          className="
            mt-0.5
            text-[10px] text-slate-400 truncate
          "
        >
          {description}
        </p>
      )}
    </div>

    <span
      className="
        font-semibold tabular-nums text-slate-800 text-xs
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

const SavingsHealthScore = ({
  data = null,

  /*
   * Optional direct score.
   * Normally this should come from
   * useSavingsInsights/useSmartSave.
   */
  score,

  currency =
    DEFAULT_CURRENCY ??
    "NGN",

  size = "md",

  title = "Savings Health",

  showDescription = true,

  showMetrics = true,

  showTrend = true,

  showRecommendation = true,

  showLegend = true,

  className = "",

  ariaLabel =
    "Savings health score",
}) => {
  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const normalizedData =
    data &&
    typeof data ===
      "object"
      ? data
      : {};

  const resolvedScore =
    score !== undefined &&
    score !== null
      ? clamp(
          toFiniteNumber(
            score
          ) <= 1
            ? toFiniteNumber(
                score
              ) * 100
            : toFiniteNumber(
                score
              )
        )
      : resolveScore(
          normalizedData
        );

  const status =
    resolveStatus(
      normalizedData,
      resolvedScore
    );

  const config =
    HEALTH_CONFIG[
      status
    ] ??
    HEALTH_CONFIG[
      HEALTH_STATUS.UNKNOWN
    ];

  const sizeConfig =
    SIZE_CONFIG[
      size
    ] ??
    SIZE_CONFIG.md;

  const Icon =
    config.icon ??
    ShieldCheck;

  const scoreLabel =
    resolveScoreLabel(
      resolvedScore,
      status
    );

  /* =======================================================
     SUPPORTING METRICS
  ======================================================= */

  const totalSaved =
    toFiniteNumber(
      normalizedData.totalSaved ??
        normalizedData.savedAmount ??
        normalizedData.currentSavings
    );

  const totalTarget =
    toFiniteNumber(
      normalizedData.totalTarget ??
        normalizedData.targetAmount ??
        normalizedData.savingsTarget
    );

  const activeGoals =
    toFiniteNumber(
      normalizedData.activeGoals ??
        normalizedData.goalsActive
    );

  const emergencyFund =
    toFiniteNumber(
      normalizedData.emergencyFund ??
        normalizedData.emergencyFundAmount
    );

  /* =======================================================
     TREND
  ======================================================= */

  const trendValue =
    toFiniteNumber(
      normalizedData.trend?.value ??
        normalizedData.scoreChange ??
        normalizedData.change,
      NaN
    );

  const trendDirection =
    normalizeKey(
      normalizedData.trend?.direction ??
        normalizedData.trendDirection
    );

  const hasTrend =
    showTrend &&
    Number.isFinite(
      trendValue
    );

  /* =======================================================
     RECOMMENDATION
  ======================================================= */

  const recommendation =
    normalizeText(
      normalizedData.recommendation ??
        normalizedData.recommendationText ??
        normalizedData.nextStep
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
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
          SCORE AREA
      =================================================== */}

      <div
        className="
          flex items-center
          mt-6
          gap-5
        "
      >
        <ScoreRing
          score={
            resolvedScore
          }
          size={
            sizeConfig
          }
          statusConfig={
            config
          }
        />

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <p
            className={`
              font-bold
              ${config.textClass}
              ${sizeConfig.score}
            `}
          >
            {scoreLabel}
          </p>

          {showDescription && (
            <p
              className={`
                mt-2
                leading-5
                text-slate-500
                ${sizeConfig.description}
              `}
            >
              {
                config.description
              }
            </p>
          )}
        </div>
      </div>

      {/* ===================================================
          METRICS
      =================================================== */}

      {showMetrics && (
        <div
          className="
            space-y-3 mt-6 p-4
            bg-slate-50
            rounded-xl
          "
        >
          {totalSaved >
            0 && (
            <MetricRow
              label="Total saved"
              value={safeFormatCurrency(
                totalSaved,
                currency
              )}
            />
          )}

          {totalTarget >
            0 && (
            <MetricRow
              label="Savings target"
              value={safeFormatCurrency(
                totalTarget,
                currency
              )}
            />
          )}

          {activeGoals >
            0 && (
            <MetricRow
              label="Active goals"
              value={Math.round(
                activeGoals
              )}
            />
          )}

          {emergencyFund >
            0 && (
            <MetricRow
              label="Emergency fund"
              value={safeFormatCurrency(
                emergencyFund,
                currency
              )}
            />
          )}

          {resolvedScore !==
            null && (
            <MetricRow
              label="Health score"
              value={`${Math.round(
                resolvedScore
              )}/100`}
            />
          )}
        </div>
      )}

      {/* ===================================================
          RECOMMENDATION
      =================================================== */}

      {showRecommendation &&
        recommendation && (
          <div
            className="
              flex items-start
              mt-5 p-3
              bg-white
              border border-slate-100 rounded-xl
              gap-2.5
            "
          >
            <Info
              size={15}
              className="
                mt-0.5
                text-slate-400
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-semibold text-slate-700 text-xs
                "
              >
                Recommended next step
              </p>

              <p
                className="
                  mt-1
                  text-[11px] text-slate-500 leading-4
                "
              >
                {
                  recommendation
                }
              </p>
            </div>
          </div>
        )}

      {/* ===================================================
          LEGEND
      =================================================== */}

      {showLegend && (
        <div
          className="
            flex items-center
            mt-5 pt-3
            border-slate-100 border-t
            gap-2
          "
        >
          <ShieldCheck
            size={13}
            className="
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
            Your score reflects the
            savings information currently
            available to SmartSave. It is
            an informational indicator,
            not financial advice.
          </p>
        </div>
      )}
    </section>
  );
};

export default SavingsHealthScore;
