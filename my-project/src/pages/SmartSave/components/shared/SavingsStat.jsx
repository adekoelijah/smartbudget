
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  PiggyBank,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
  SAVINGS_STAT_TYPES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

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
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(min, value)
  );

/* =========================================================
   STATISTIC TYPES
========================================================= */

const STAT_TYPES = {
  TOTAL_SAVED:
    SAVINGS_STAT_TYPES?.TOTAL_SAVED ??
    "total_saved",

  TOTAL_TARGET:
    SAVINGS_STAT_TYPES?.TOTAL_TARGET ??
    "total_target",

  ACTIVE_GOALS:
    SAVINGS_STAT_TYPES?.ACTIVE_GOALS ??
    "active_goals",

  COMPLETED_GOALS:
    SAVINGS_STAT_TYPES?.COMPLETED_GOALS ??
    "completed_goals",

  SAVINGS_RATE:
    SAVINGS_STAT_TYPES?.SAVINGS_RATE ??
    "savings_rate",

  MONTHLY_SAVINGS:
    SAVINGS_STAT_TYPES?.MONTHLY_SAVINGS ??
    "monthly_savings",

  WEEKLY_SAVINGS:
    SAVINGS_STAT_TYPES?.WEEKLY_SAVINGS ??
    "weekly_savings",

  TOTAL_CONTRIBUTIONS:
    SAVINGS_STAT_TYPES?.TOTAL_CONTRIBUTIONS ??
    "total_contributions",

  ACTIVE_CHALLENGES:
    SAVINGS_STAT_TYPES?.ACTIVE_CHALLENGES ??
    "active_challenges",

  COMPLETED_CHALLENGES:
    SAVINGS_STAT_TYPES?.COMPLETED_CHALLENGES ??
    "completed_challenges",

  PROGRESS:
    SAVINGS_STAT_TYPES?.PROGRESS ??
    "progress",

  FORECAST:
    SAVINGS_STAT_TYPES?.FORECAST ??
    "forecast",

  AVAILABLE_BALANCE:
    SAVINGS_STAT_TYPES?.AVAILABLE_BALANCE ??
    "available_balance",
};

/* =========================================================
   DEFAULT STAT DEFINITIONS
========================================================= */

const STAT_DEFINITIONS = {
  [STAT_TYPES.TOTAL_SAVED]: {
    label: "Total saved",
    icon: PiggyBank,
    format: "currency",
    description:
      "Amount currently saved",
  },

  [STAT_TYPES.TOTAL_TARGET]: {
    label: "Total target",
    icon: Target,
    format: "currency",
    description:
      "Combined savings targets",
  },

  [STAT_TYPES.ACTIVE_GOALS]: {
    label: "Active goals",
    icon: Target,
    format: "number",
    description:
      "Goals currently in progress",
  },

  [STAT_TYPES.COMPLETED_GOALS]: {
    label: "Completed goals",
    icon: Trophy,
    format: "number",
    description:
      "Goals successfully completed",
  },

  [STAT_TYPES.SAVINGS_RATE]: {
    label: "Savings rate",
    icon: TrendingUp,
    format: "percentage",
    description:
      "Percentage of income being saved",
  },

  [STAT_TYPES.MONTHLY_SAVINGS]: {
    label: "Monthly savings",
    icon: CircleDollarSign,
    format: "currency",
    description:
      "Savings contributed this month",
  },

  [STAT_TYPES.WEEKLY_SAVINGS]: {
    label: "Weekly savings",
    icon: CircleDollarSign,
    format: "currency",
    description:
      "Savings contributed this week",
  },

  [STAT_TYPES.TOTAL_CONTRIBUTIONS]: {
    label: "Contributions",
    icon: WalletCards,
    format: "number",
    description:
      "Total savings contributions",
  },

  [STAT_TYPES.ACTIVE_CHALLENGES]: {
    label: "Active challenges",
    icon: Trophy,
    format: "number",
    description:
      "Savings challenges in progress",
  },

  [STAT_TYPES.COMPLETED_CHALLENGES]: {
    label: "Completed challenges",
    icon: Trophy,
    format: "number",
    description:
      "Savings challenges completed",
  },

  [STAT_TYPES.PROGRESS]: {
    label: "Overall progress",
    icon: TrendingUp,
    format: "percentage",
    description:
      "Progress toward savings targets",
  },

  [STAT_TYPES.FORECAST]: {
    label: "Forecast",
    icon: TrendingUp,
    format: "currency",
    description:
      "Projected savings",
  },

  [STAT_TYPES.AVAILABLE_BALANCE]: {
    label: "Available balance",
    icon: WalletCards,
    format: "currency",
    description:
      "Available amount for savings",
  },
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatNumber = (
  value
) => {
  const number =
    toFiniteNumber(value);

  return new Intl.NumberFormat(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  ).format(number);
};

const formatPercentage = (
  value
) => {
  const number =
    toFiniteNumber(value);

  /*
   * Support both:
   * 0.25 → 25%
   * 25   → 25%
   */
  const percentage =
    number >= 0 &&
    number <= 1
      ? number * 100
      : number;

  return `${Math.round(
    clamp(percentage, 0, 100)
  )}%`;
};

const formatStatValue = (
  value,
  format,
  currency
) => {
  switch (format) {
    case "currency":
      try {
        return formatCurrency(
          toFiniteNumber(value),
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
          ).format(
            toFiniteNumber(value)
          );
        } catch {
          return `${currency} ${formatNumber(
            value
          )}`;
        }
      }

    case "percentage":
      return formatPercentage(
        value
      );

    case "number":
    default:
      return formatNumber(
        value
      );
  }
};

/* =========================================================
   TREND NORMALIZATION
========================================================= */

const normalizeTrend = (
  trend
) => {
  if (
    trend === null ||
    trend === undefined
  ) {
    return null;
  }

  if (
    typeof trend === "number"
  ) {
    return {
      value: trend,
      direction:
        trend > 0
          ? "up"
          : trend < 0
            ? "down"
            : "neutral",
    };
  }

  if (
    typeof trend !== "object"
  ) {
    return null;
  }

  const rawValue =
    trend.value ??
    trend.amount ??
    trend.percentage ??
    trend.change;

  const numericValue =
    toFiniteNumber(
      rawValue,
      NaN
    );

  const direction =
    normalizeKey(
      trend.direction ??
        trend.type
    );

  if (
    Number.isFinite(
      numericValue
    )
  ) {
    return {
      value: numericValue,
      direction:
        direction === "up" ||
        direction === "increase" ||
        direction === "positive"
          ? "up"
          : direction ===
                "down" ||
              direction ===
                "decrease" ||
              direction ===
                "negative"
            ? "down"
            : numericValue > 0
              ? "up"
              : numericValue < 0
                ? "down"
                : "neutral",
    };
  }

  if (
    direction
  ) {
    return {
      value: null,
      direction:
        direction === "up" ||
        direction === "increase"
          ? "up"
          : direction ===
                "down" ||
              direction ===
                "decrease"
            ? "down"
            : "neutral",
    };
  }

  return null;
};

/* =========================================================
   TREND DISPLAY
========================================================= */

const getTrendDisplay = (
  trend,
  format
) => {
  const normalized =
    normalizeTrend(
      trend
    );

  if (!normalized) {
    return null;
  }

  const {
    value,
    direction,
  } = normalized;

  if (
    value === null ||
    value === undefined
  ) {
    return {
      label:
        direction === "up"
          ? "Increasing"
          : direction === "down"
            ? "Decreasing"
            : "Stable",

      direction,
    };
  }

  const absoluteValue =
    Math.abs(value);

  let label;

  if (
    format ===
    "percentage"
  ) {
    label = `${Math.round(
      absoluteValue
    )}%`;
  } else {
    label =
      `${Math.round(
        absoluteValue * 100
      ) / 100}%`;
  }

  return {
    label,
    direction,
  };
};

/* =========================================================
   TREND VISUAL CONFIG
========================================================= */

const TREND_CONFIG = {
  up: {
    icon: ArrowUpRight,

    className:
      "text-emerald-600",

    background:
      "bg-emerald-50",
  },

  down: {
    icon: ArrowDownRight,

    className:
      "text-red-600",

    background:
      "bg-red-50",
  },

  neutral: {
    icon: TrendingUp,

    className:
      "text-slate-500",

    background:
      "bg-slate-100",
  },
};

/* =========================================================
   SIZE CONFIG
========================================================= */

const SIZE_CONFIG = {
  sm: {
    card: "p-3.5",
    icon: "h-9 w-9",
    iconSize: 16,
    label: "text-[11px]",
    value: "text-base",
    description: "text-[10px]",
    trend: "text-[10px]",
  },

  md: {
    card: "p-4",
    icon: "h-10 w-10",
    iconSize: 18,
    label: "text-xs",
    value: "text-lg",
    description: "text-[11px]",
    trend: "text-[11px]",
  },

  lg: {
    card: "p-5",
    icon: "h-11 w-11",
    iconSize: 20,
    label: "text-sm",
    value: "text-xl",
    description: "text-xs",
    trend: "text-xs",
  },
};

/* =========================================================
   STAT CARD
========================================================= */

const SavingsStatCard = ({
  stat,
  currency,
  size,
  showDescription,
}) => {
  const definition =
    STAT_DEFINITIONS[
      stat.type
    ] ??
    STAT_DEFINITIONS[
      STAT_TYPES.TOTAL_SAVED
    ];

  const Icon =
    stat.icon ??
    definition.icon ??
    PiggyBank;

  const resolvedLabel =
    normalizeText(
      stat.label
    ) ||
    definition.label;

  const resolvedDescription =
    normalizeText(
      stat.description
    ) ||
    definition.description;

  const format =
    stat.format ??
    definition.format ??
    "number";

  const resolvedValue =
    formatStatValue(
      stat.value,
      format,
      currency
    );

  const trend =
    getTrendDisplay(
      stat.trend,
      format
    );

  const trendConfig =
    trend
      ? TREND_CONFIG[
          trend.direction
        ] ??
        TREND_CONFIG.neutral
      : null;

  const TrendIcon =
    trendConfig?.icon;

  const statSize =
    SIZE_CONFIG[
      size
    ] ??
    SIZE_CONFIG.md;

  return (
    <article
      className={`
        min-w-0
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        hover:shadow-md
        ${statSize.card}
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          gap-3
        "
      >
        <div
          className="
            flex items-center
            min-w-0
            gap-3
          "
        >
          {/* =============================================
              ICON
          ============================================= */}

          <div
            className={`
              flex
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-700
              ${statSize.icon}
            `}
            aria-hidden="true"
          >
            <Icon
              size={
                statSize.iconSize
              }
              strokeWidth={1.8}
            />
          </div>

          {/* =============================================
              LABEL
          ============================================= */}

          <div
            className="
              min-w-0
            "
          >
            <p
              className={`
                truncate
                font-medium
                text-slate-500
                ${statSize.label}
              `}
            >
              {resolvedLabel}
            </p>

            {showDescription &&
              resolvedDescription && (
                <p
                  className={`
                    mt-0.5
                    truncate
                    text-slate-400
                    ${statSize.description}
                  `}
                >
                  {
                    resolvedDescription
                  }
                </p>
              )}
          </div>
        </div>

        {/* ===============================================
            TREND
        =============================================== */}

        {trend &&
          trendConfig && (
            <div
              className={`
                inline-flex
                shrink-0
                items-center
                gap-0.5
                rounded-full
                px-1.5
                py-1
                font-semibold
                ${trendConfig.background}
                ${trendConfig.className}
                ${statSize.trend}
              `}
              aria-label={`Trend ${trend.direction}`}
            >
              {TrendIcon && (
                <TrendIcon
                  size={12}
                  aria-hidden="true"
                />
              )}

              <span>
                {trend.label}
              </span>
            </div>
          )}
      </div>

      {/* =================================================
          VALUE
      ================================================= */}

      <div
        className="
          flex justify-between items-end
          mt-4
          gap-3
        "
      >
        <p
          className={`
            min-w-0
            truncate
            font-bold
            tracking-tight
            text-slate-900
            ${statSize.value}
          `}
        >
          {resolvedValue}
        </p>

        {stat.suffix && (
          <span
            className={`
              shrink-0
              pb-0.5
              text-slate-400
              ${statSize.description}
            `}
          >
            {stat.suffix}
          </span>
        )}
      </div>

      {/* =================================================
          OPTIONAL SECONDARY VALUE
      ================================================= */}

      {stat.secondaryValue !==
        undefined &&
        stat.secondaryValue !==
          null && (
          <div
            className="
              flex items-center
              mt-2
              gap-1.5
            "
          >
            <span
              className={`
                text-slate-400
                ${statSize.description}
              `}
            >
              {stat.secondaryLabel ??
                ""}
            </span>

            <span
              className={`
                font-medium
                text-slate-600
                ${statSize.description}
              `}
            >
              {stat.secondaryValue}
            </span>
          </div>
        )}
    </article>
  );
};

/* =========================================================
   NORMALIZE STATS
========================================================= */

const normalizeStats = (
  stats
) => {
  if (
    Array.isArray(stats)
  ) {
    return stats
      .filter(Boolean)
      .map(
        (
          stat,
          index
        ) => {
          if (
            typeof stat ===
            "object"
          ) {
            return {
              ...stat,
              type:
                normalizeKey(
                  stat.type
                ) ||
                `${STAT_TYPES.TOTAL_SAVED}_${index}`,
            };
          }

          return {
            type:
              `${STAT_TYPES.TOTAL_SAVED}_${index}`,
            value: stat,
          };
        }
      );
  }

  if (
    stats &&
    typeof stats ===
      "object"
  ) {
    return Object.entries(
      stats
    ).map(
      ([
        type,
        value,
      ]) => {
        if (
          value &&
          typeof value ===
            "object"
        ) {
          return {
            ...value,
            type:
              normalizeKey(
                value.type ??
                  type
              ),
          };
        }

        return {
          type:
            normalizeKey(
              type
            ),
          value,
        };
      }
    );
  }

  return [];
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsStats = ({
  stats = [],

  currency =
    DEFAULT_CURRENCY ??
    "NGN",

  columns = 4,

  size = "md",

  showDescription = false,

  className = "",

  emptyLabel =
    "No savings statistics available",

  ariaLabel =
    "Savings statistics",
}) => {
  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const normalizedStats =
    normalizeStats(
      stats
    );

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    normalizedStats.length ===
    0
  ) {
    return (
      <section
        className={`
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          ${className}
        `}
        aria-label={
          ariaLabel
        }
      >
        <div
          className="
            flex justify-center items-center
            min-h-24
            text-center
          "
        >
          <p
            className="
              text-slate-500 text-sm
            "
          >
            {emptyLabel}
          </p>
        </div>
      </section>
    );
  }

  /* =======================================================
     GRID
  ======================================================= */

  const columnClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === 5
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={className}
      aria-label={
        ariaLabel
      }
    >
      <div
        className={`
          grid
          gap-4
          ${columnClass}
        `}
      >
        {normalizedStats.map(
          (
            stat,
            index
          ) => (
            <SavingsStatCard
              key={
                stat.id ??
                stat.key ??
                `${stat.type}-${index}`
              }
              stat={stat}
              currency={
                stat.currency ??
                currency
              }
              size={
                stat.size ??
                size
              }
              showDescription={
                stat.showDescription ??
                showDescription
              }
            />
          )
        )}
      </div>
    </section>
  );
};

export default SavingsStats;
