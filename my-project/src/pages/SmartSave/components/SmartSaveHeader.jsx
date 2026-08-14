
import {
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

/* =========================================================
   SMARTSAVE HOOK
========================================================= */

import useSmartSave from "../../../hooks/useSmartSave";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
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
    Math.max(
      min,
      value
    )
  );

const normalizeObject = (
  value
) =>
  value &&
  typeof value ===
    "object" &&
  !Array.isArray(value)
    ? value
    : {};

const resolveSavingsData = (
  data
) => {
  const source =
    normalizeObject(
      data
    );

  /*
   * Support the common response
   * envelopes used by SmartSave
   * without changing the service
   * contract.
   */
  return normalizeObject(
    source.data ??
      source.result ??
      source.summary ??
      source
  );
};

const resolveTotalSaved = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data.totalSaved ??
        data.totalSavings ??
        data.savedAmount ??
        data.currentSavings ??
        data.savingsBalance
    )
  );

const resolveTarget = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data.totalTarget ??
        data.savingsTarget ??
        data.targetAmount
    )
  );

const resolveGoalCount = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data.activeGoals ??
        data.goalsCount ??
        data.totalGoals
    )
  );

const resolveProgress = (
  data,
  saved,
  target
) => {
  const explicit =
    data.progress ??
    data.progressPercentage ??
    data.savingsProgress;

  if (
    explicit !==
      undefined &&
    explicit !== null
  ) {
    const value =
      toFiniteNumber(
        explicit
      );

    return clamp(
      value <= 1
        ? value * 100
        : value
    );
  }

  if (
    target <= 0
  ) {
    return 0;
  }

  return clamp(
    (saved /
      target) *
      100
  );
};

const resolveHealthScore = (
  data
) => {
  const health =
    normalizeObject(
      data.health ??
        data.savingsHealth
    );

  const value =
    data.healthScore ??
    data.savingsHealthScore ??
    health.score;

  if (
    value ===
    undefined ||
    value === null
  ) {
    return null;
  }

  return clamp(
    toFiniteNumber(
      value
    )
  );
};

const resolveHealthLabel = (
  score
) => {
  if (
    score === null
  ) {
    return "Savings health";
  }

  if (
    score >= 80
  ) {
    return "Excellent";
  }

  if (
    score >= 65
  ) {
    return "Good";
  }

  if (
    score >= 45
  ) {
    return "Fair";
  }

  if (
    score >= 25
  ) {
    return "Needs attention";
  }

  return "At risk";
};

const safeFormatCurrency = (
  value,
  currency
) => {
  const amount =
    toFiniteNumber(
      value
    );

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
   STAT ITEM
========================================================= */

const HeaderStat = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
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
        bg-slate-100
        rounded-xl
        shrink-0
      "
    >
      <Icon
        size={17}
        strokeWidth={1.9}
        className="
          text-slate-700
        "
        aria-hidden="true"
      /
      >
    </div>

    <div
      className="
        min-w-0
      "
    >
      <p
        className="
          font-medium text-[10px] text-slate-400 truncate uppercase
          tracking-wide
        "
      >
        {label}
      </p>

      <p
        className="
          mt-0.5
          font-bold tabular-nums text-slate-900 text-sm truncate
        "
      >
        {value}
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
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SmartSaveHeader = ({
  title = "SmartSave",

  subtitle =
    "Build smarter saving habits and stay on track with your financial goals.",

  currency =
    DEFAULT_CURRENCY ??
    "NGN",

  onViewOverview,

  onCreateGoal,

  showStats = true,

  showRefresh = true,

  className = "",
}) => {
  /* =======================================================
     SMARTSAVE STATE
  ======================================================= */

  const smartSave =
    useSmartSave();

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
  } =
    smartSave ?? {};

  /* =======================================================
     NORMALIZED HEADER DATA
  ======================================================= */

  const savingsData =
    resolveSavingsData(
      data
    );

  const totalSaved =
    resolveTotalSaved(
      savingsData
    );

  const target =
    resolveTarget(
      savingsData
    );

  const goalCount =
    resolveGoalCount(
      savingsData
    );

  const progress =
    resolveProgress(
      savingsData,
      totalSaved,
      target
    );

  const healthScore =
    resolveHealthScore(
      savingsData
    );

  const healthLabel =
    resolveHealthLabel(
      healthScore
    );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      if (
        typeof refresh !==
        "function"
      ) {
        return;
      }

      try {
        await refresh();
      } catch {
        /*
         * Refresh errors remain owned
         * by useSmartSave().
         */
      }
    };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <header
        className={`
          w-full
          ${className}
        `}
        aria-busy="true"
        aria-label="Loading SmartSave"
      >
        <div
          className="
            p-5
            bg-white
            border border-slate-200 rounded-2xl
            shadow-sm animate-pulse
          "
        >
          <div
            className="
              w-32 h-5
              bg-slate-200
              rounded
            "
            /
          >

          <div
            className="
              max-w-md h-3
              mt-3
              bg-slate-100
              rounded
            "
            /
          >

          {showStats && (
            <div
              className="
                grid grid-cols-1 sm:grid-cols-3
                mt-6
                gap-4
              "
            >
              {[
                1,
                2,
                3,
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-12
                      bg-slate-100
                      rounded-xl
                    "
                    /
                  >
                )
              )}
            </div>
          )}
        </div>
      </header>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <header
        className={`
          w-full
          ${className}
        `}
        role="alert"
      >
        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            p-5
            bg-red-50
            border border-red-100 rounded-2xl
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
                font-semibold text-red-800 text-sm
              "
            >
              SmartSave could not load
              your savings data.
            </p>

            <p
              className="
                mt-1
                text-red-600 text-xs leading-5
              "
            >
              Please try refreshing the
              savings overview.
            </p>
          </div>

          {typeof refresh ===
            "function" && (
            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                isRefreshing
              }
              className="
                inline-flex justify-center items-center
                px-4 py-2.5
                font-semibold text-red-700 text-sm
                bg-white hover:bg-red-50
                border border-red-200 rounded-xl focus:outline-none
                focus:ring-2 focus:ring-red-600 focus:ring-offset-2
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2 shrink-0
              "
            >
              <RefreshCw
                size={15}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />

              {isRefreshing
                ? "Retrying..."
                : "Try again"}
            </button>
          )}
        </div>
      </header>
    );
  }

  /* =======================================================
     MAIN HEADER
  ======================================================= */

  return (
    <header
      className={`
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        ${className}
      `}
    >
      <div
        className="
          p-5 sm:p-6
        "
      >
        {/* ===============================================
            TOP ROW
        =============================================== */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-start
            gap-5
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
                bg-slate-900
                rounded-xl
                shrink-0
              "
            >
              <PiggyBank
                size={21}
                strokeWidth={1.9}
                className="
                  text-white
                "
                aria-hidden="true"
              /
              >
            </div>

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <h1
                  className="
                    font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
                  "
                >
                  {title}
                </h1>

                <span
                  className="
                    inline-flex items-center
                    px-2 py-1
                    font-semibold text-[10px] text-slate-600
                    bg-slate-100
                    rounded-full
                    gap-1
                  "
                >
                  <Sparkles
                    size={11}
                    aria-hidden="true"
                  />

                  Smart
                </span>
              </div>

              <p
                className="
                  max-w-2xl
                  mt-1.5
                  text-slate-500 text-sm leading-6
                "
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* =============================================
              ACTIONS
          ============================================= */}

          <div
            className="
              flex flex-wrap items-center
              gap-2 shrink-0
            "
          >
            {showRefresh && (
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  isRefreshing
                }
                className="
                  inline-flex justify-center items-center
                  px-3.5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 hover:border-slate-300 rounded-xl
                  focus:outline-none
                  focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                  disabled:opacity-50 shadow-sm transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <RefreshCw
                  size={15}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                  aria-hidden="true"
                />

                <span
                  className="
                    hidden sm:inline
                  "
                >
                  {isRefreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </span>
              </button>
            )}

            {typeof onCreateGoal ===
              "function" && (
              <button
                type="button"
                onClick={
                  onCreateGoal
                }
                className="
                  inline-flex justify-center items-center
                  px-4 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                  shadow-sm transition
                  gap-2
                "
              >
                <Target
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  New goal
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ===============================================
            STATS
        =============================================== */}

        {showStats && (
          <div
            className="
              grid grid-cols-1 sm:grid-cols-3
              mt-6
              bg-slate-50
              border border-slate-100 rounded-xl
              divide-y divide-slate-100 sm:divide-x sm:divide-y-0
            "
          >
            <div
              className="
                p-4
              "
            >
              <HeaderStat
                icon={WalletCards}
                label="Total saved"
                value={safeFormatCurrency(
                  totalSaved,
                  currency
                )}
                description={
                  target > 0
                    ? `Target ${safeFormatCurrency(
                        target,
                        currency
                      )}`
                    : "Current savings"
                }
              />
            </div>

            <div
              className="
                p-4
              "
            >
              <HeaderStat
                icon={
                  TrendingUp
                }
                label="Progress"
                value={`${Math.round(
                  progress
                )}%`}
                description="Toward savings target"
              />
            </div>

            <div
              className="
                p-4
              "
            >
              <HeaderStat
                icon={
                  Target
                }
                label="Goals"
                value={Math.round(
                  goalCount
                )}
                description={
                  healthScore !==
                  null
                    ? `${healthLabel} · ${Math.round(
                        healthScore
                      )}/100`
                    : "Active savings goals"
                }
              />
            </div>
          </div>
        )}

        {/* ===============================================
            PROGRESS STRIP
        =============================================== */}

        {target > 0 && (
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
                  font-semibold text-[10px] text-slate-400 uppercase
                  tracking-wide
                "
              >
                Savings progress
              </span>

              <span
                className="
                  font-semibold tabular-nums text-slate-600 text-xs
                "
              >
                {Math.round(
                  progress
                )}%
              </span>
            </div>

            <div
              className="
                overflow-hidden
                h-2
                bg-slate-100
                rounded-full
              "
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(
                progress
              )}
              aria-label="Savings progress"
            >
              <div
                className="
                  h-full
                  bg-slate-900
                  rounded-full
                  transition-[width] duration-500 ease-out
                "
                style={{
                  width: `${progress}%`,
                }}
              /
              >
            </div>
          </div>
        )}

        {/* ===============================================
            OVERVIEW LINK
        =============================================== */}

        {typeof onViewOverview ===
          "function" && (
          <div
            className="
              flex justify-end
              mt-5
            "
          >
            <button
              type="button"
              onClick={
                onViewOverview
              }
              className="
                inline-flex items-center
                font-semibold text-slate-600 hover:text-slate-900 text-xs
                focus:outline-none
                focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                transition
                group gap-1.5
              "
            >
              View savings overview

              <ArrowRight
                size={13}
                className="
                  transition-transform
                  group-hover:translate-x-0.5
                "
                aria-hidden="true"
              /
              >
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default SmartSaveHeader;
