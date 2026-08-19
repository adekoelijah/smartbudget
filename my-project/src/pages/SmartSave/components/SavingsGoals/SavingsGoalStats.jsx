import { memo, useCallback, useMemo } from "react";

import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import useSavingsGoals from "../../../../hooks/useSavingsGoals";

import {
  formatCurrency,
  formatPercentage,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_ERROR_MESSAGE =
  "Unable to load your savings goal statistics.";

const STAT_CARD_CLASS =
  "min-w-0 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm";

/* =========================================================
   HELPERS
========================================================= */

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const clampPercentage = (value) => {
  const number = toFiniteNumber(value);

  return Math.min(100, Math.max(0, number));
};

const normalizeCurrency = (currency) => {
  if (typeof currency !== "string") {
    return DEFAULT_CURRENCY;
  }

  const normalized = currency.trim().toUpperCase();

  return normalized || DEFAULT_CURRENCY;
};

const getErrorMessage = (error) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || DEFAULT_ERROR_MESSAGE;
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.message ??
    error?.error;

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return DEFAULT_ERROR_MESSAGE;
};

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeStats = (value) => {
  if (!isObject(value)) {
    return {};
  }

  if (isObject(value.data)) {
    return value.data;
  }

  if (isObject(value.stats)) {
    return value.stats;
  }

  return value;
};

const normalizeGoals = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.goals)) {
    return value.goals;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.data?.goals)) {
    return value.data.goals;
  }

  return [];
};

const getStatus = (goal) =>
  String(goal?.status ?? "")
    .trim()
    .toLowerCase();

const getGoalTarget = (goal) =>
  toFiniteNumber(
    goal?.targetAmount ??
      goal?.target ??
      goal?.amount
  );

const getGoalSaved = (goal) =>
  toFiniteNumber(
    goal?.currentAmount ??
      goal?.savedAmount ??
      goal?.amountSaved ??
      goal?.progressAmount
  );

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
    loading = false,
  }) => {
    return (
      <article className={STAT_CARD_CLASS}>
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            aria-hidden="true"
            className="
              flex justify-center items-center
              w-10 h-10
              text-slate-600
              bg-slate-50
              rounded-xl
              shrink-0
            "
          >
            {Icon && <Icon size={19} strokeWidth={2} />}
          </div>

          <div
            className="
              flex-1
              min-w-0
            "
          >
            <p
              className="
                font-medium text-slate-400 text-xs truncate
              "
            >
              {label}
            </p>

            {loading ? (
              <div
                aria-hidden="true"
                className="
                  w-24 h-6
                  mt-2
                  bg-slate-100
                  rounded-md
                  animate-pulse
                "
                /
              >
            ) : (
              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-lg truncate tracking-tight
                "
              >
                {value}
              </p>
            )}

            {!loading && description && (
              <p
                className="
                  mt-1
                  text-slate-400 text-xs truncate
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </article>
    );
  }
);

StatCard.displayName = "StatCard";

/* =========================================================
   ERROR STATE
========================================================= */

const StatsError = memo(
  ({
    message,
    loading,
    onRetry,
  }) => {
    return (
      <div
        role="alert"
        className="
          flex items-start
          mb-4 p-4
          bg-red-50
          border border-red-100 rounded-2xl
          gap-3
        "
      >
        <AlertCircle
          size={18}
          className="
            mt-0.5
            text-red-600
            shrink-0
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-red-800 text-sm
            "
          >
            Goal statistics unavailable
          </p>

          <p
            className="
              mt-1
              text-red-700 text-sm
            "
          >
            {message}
          </p>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="
                inline-flex items-center
                mt-2
                font-semibold text-red-800 text-xs underline underline-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <RefreshCw
                size={13}
                className={loading ? "animate-spin" : ""}
                aria-hidden="true"
              />

              Try again
            </button>
          )}
        </div>
      </div>
    );
  }
);

StatsError.displayName = "StatsError";

/* =========================================================
   EMPTY STATE
========================================================= */

const StatsEmptyState = memo(() => {
  return (
    <div
      className="
        mt-4 p-6
        text-center
        bg-slate-50
        border border-slate-200 border-dashed rounded-2xl
      "
    >
      <Target
        size={24}
        className="
          mx-auto
          text-slate-400
        "
        aria-hidden="true"
      /
      >

      <p
        className="
          mt-3
          font-semibold text-slate-700 text-sm
        "
      >
        No savings goals yet
      </p>

      <p
        className="
          max-w-sm
          mx-auto mt-1
          text-slate-500 text-xs leading-5
        "
      >
        Create a savings goal to start tracking your progress.
      </p>
    </div>
  );
});

StatsEmptyState.displayName = "StatsEmptyState";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsGoalStats = ({
  className = "",
  currency = DEFAULT_CURRENCY,
  compact = false,
}) => {
  const savingsGoals = useSavingsGoals();

  const {
    goals: hookGoals,
    goalStats,
    stats,
    loading: hookLoading,
    error: hookError,
    refreshGoals,
    fetchGoals,
  } = savingsGoals || {};

  /* =======================================================
     NORMALIZATION
  ======================================================= */

  const normalizedCurrency = useMemo(
    () => normalizeCurrency(currency),
    [currency]
  );

  const goals = useMemo(
    () => normalizeGoals(hookGoals),
    [hookGoals]
  );

  const serverStats = useMemo(
    () => normalizeStats(goalStats ?? stats),
    [goalStats, stats]
  );

  /* =======================================================
     DERIVED STATISTICS
     
     IMPORTANT:
     Server-provided statistics always win.
     Collection-derived values are fallback-only.
  ======================================================= */

  const displayStats = useMemo(() => {
    const hasServerTotal =
      serverStats.totalGoals !== undefined ||
      serverStats.total !== undefined ||
      serverStats.count !== undefined;

    const hasServerActive =
      serverStats.activeGoals !== undefined ||
      serverStats.active !== undefined;

    const hasServerCompleted =
      serverStats.completedGoals !== undefined ||
      serverStats.completed !== undefined;

    const hasServerTarget =
      serverStats.totalTargetAmount !== undefined ||
      serverStats.targetAmount !== undefined ||
      serverStats.totalTarget !== undefined;

    const hasServerSaved =
      serverStats.totalSavedAmount !== undefined ||
      serverStats.savedAmount !== undefined ||
      serverStats.totalSaved !== undefined;

    const hasServerProgress =
      serverStats.progressPercentage !== undefined ||
      serverStats.averageProgress !== undefined;

    let fallbackTarget = 0;
    let fallbackSaved = 0;
    let fallbackActive = 0;
    let fallbackCompleted = 0;

    for (const goal of goals) {
      const status = getStatus(goal);

      if (status === "active") {
        fallbackActive += 1;
      }

      if (status === "completed") {
        fallbackCompleted += 1;
      }

      fallbackTarget += getGoalTarget(goal);
      fallbackSaved += getGoalSaved(goal);
    }

    const targetAmount = hasServerTarget
      ? toFiniteNumber(
          serverStats.totalTargetAmount ??
            serverStats.targetAmount ??
            serverStats.totalTarget
        )
      : fallbackTarget;

    const savedAmount = hasServerSaved
      ? toFiniteNumber(
          serverStats.totalSavedAmount ??
            serverStats.savedAmount ??
            serverStats.totalSaved
        )
      : fallbackSaved;

    const calculatedProgress =
      targetAmount > 0
        ? (savedAmount / targetAmount) * 100
        : 0;

    const progressPercentage = hasServerProgress
      ? clampPercentage(
          serverStats.progressPercentage ??
            serverStats.averageProgress
        )
      : clampPercentage(calculatedProgress);

    return {
      totalGoals: hasServerTotal
        ? toFiniteNumber(
            serverStats.totalGoals ??
              serverStats.total ??
              serverStats.count
          )
        : goals.length,

      activeGoals: hasServerActive
        ? toFiniteNumber(
            serverStats.activeGoals ??
              serverStats.active
          )
        : fallbackActive,

      completedGoals: hasServerCompleted
        ? toFiniteNumber(
            serverStats.completedGoals ??
              serverStats.completed
          )
        : fallbackCompleted,

      targetAmount,
      savedAmount,
      progressPercentage,
    };
  }, [serverStats, goals]);

  /* =======================================================
     STATE
  ======================================================= */

  const loading = Boolean(hookLoading);

  const errorMessage = useMemo(
    () => getErrorMessage(hookError),
    [hookError]
  );

  const hasGoals =
    displayStats.totalGoals > 0 ||
    goals.length > 0;

  const hasFinancialData =
    displayStats.targetAmount > 0 ||
    displayStats.savedAmount > 0;

  const hasStats =
    hasGoals || hasFinancialData;

  /* =======================================================
     REFRESH
     
     ONE refresh path only.
     This deliberately avoids calling getGoalStats()
     separately and avoids creating a second request chain.
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    const refresh =
      typeof refreshGoals === "function"
        ? refreshGoals
        : fetchGoals;

    if (typeof refresh !== "function") {
      return undefined;
    }

    return refresh();
  }, [refreshGoals, fetchGoals]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`w-full ${className}`}
      aria-labelledby="savings-goal-stats-title"
    >
      {/* HEADER */}

      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mb-4
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <h2
            id="savings-goal-stats-title"
            className="
              font-semibold text-slate-900 text-base tracking-tight
            "
          >
            Goal Overview
          </h2>

          <p
            className="
              mt-1
              text-slate-500 text-sm
            "
          >
            A snapshot of your savings progress.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || typeof handleRefresh !== "function"}
          className="
            inline-flex justify-center items-center
            w-fit h-9
            px-3
            font-semibold text-slate-700 text-xs
            bg-white hover:bg-slate-50
            border border-slate-200 rounded-lg
            disabled:opacity-60 transition
            disabled:cursor-not-allowed
            gap-2
          "
          aria-label="Refresh goal statistics"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
            aria-hidden="true"
          />

          <span>
            {loading ? "Refreshing" : "Refresh"}
          </span>
        </button>
      </header>

      {/* ERROR */}

      {errorMessage && (
        <StatsError
          message={errorMessage}
          loading={loading}
          onRetry={handleRefresh}
        />
      )}

      {/* INITIAL LOADING */}

      {loading && !hasStats ? (
        <div
          className="
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5
            gap-3
          "
          aria-busy="true"
          aria-label="Loading savings goal statistics"
        >
          {[
            "total",
            "active",
            "completed",
            "saved",
            "progress",
          ].map((key) => (
            <StatCard
              key={key}
              icon={Target}
              label="Loading"
              value=""
              loading
            />
          ))}
        </div>
      ) : (
        <>
          {/* STATS */}

          <div
            className={`
              grid
              grid-cols-2
              gap-3
              ${
                compact
                  ? ""
                  : "md:grid-cols-3 lg:grid-cols-5"
              }
            `}
          >
            <StatCard
              icon={Target}
              label="Total goals"
              value={displayStats.totalGoals}
              description="All savings goals"
            />

            <StatCard
              icon={TrendingUp}
              label="Active goals"
              value={displayStats.activeGoals}
              description="Currently in progress"
            />

            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={displayStats.completedGoals}
              description="Successfully reached"
            />

            {!compact && (
              <>
                <StatCard
                  icon={Wallet}
                  label="Saved"
                  value={formatCurrency(
                    displayStats.savedAmount,
                    normalizedCurrency
                  )}
                  description="Total saved"
                />

                <StatCard
                  icon={CircleDollarSign}
                  label="Progress"
                  value={formatPercentage(
                    displayStats.progressPercentage
                  )}
                  description="Overall goal progress"
                />
              </>
            )}
          </div>

          {/* OVERALL PROGRESS */}

          {!compact && hasStats && (
            <div
              className="
                mt-4 p-4
                bg-white
                border border-slate-100 rounded-2xl
              "
            >
              <div
                className="
                  flex justify-between items-center
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      font-medium text-slate-500 text-xs
                    "
                  >
                    Overall savings progress
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    {formatCurrency(
                      displayStats.savedAmount,
                      normalizedCurrency
                    )}
                    {" / "}
                    {formatCurrency(
                      displayStats.targetAmount,
                      normalizedCurrency
                    )}
                  </p>
                </div>

                <span
                  className="
                    font-semibold text-slate-900 text-xs
                  "
                >
                  {formatPercentage(
                    displayStats.progressPercentage
                  )}
                </span>
              </div>

              <div
                className="
                  overflow-hidden
                  h-2
                  mt-3
                  bg-slate-100
                  rounded-full
                "
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  displayStats.progressPercentage
                }
                aria-valuetext={formatPercentage(
                  displayStats.progressPercentage
                )}
                aria-label="Overall savings progress"
              >
                <div
                  className="
                    h-full
                    bg-slate-900
                    rounded-full
                    transition-[width] duration-500 ease-out
                  "
                  style={{
                    width: `${displayStats.progressPercentage}%`,
                  }}
                /
                >
              </div>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !errorMessage &&
            !hasStats && (
              <StatsEmptyState />
            )}
        </>
      )}

      {/* BACKGROUND REFRESH */}

      {loading && hasStats && (
        <div
          className="
            flex justify-center items-center
            mt-3
            text-slate-400 text-xs
            gap-2
          "
          role="status"
          aria-live="polite"
        >
          <RefreshCw
            size={12}
            className="
              animate-spin
            "
            aria-hidden="true"
          /
          >

          Updating goal statistics…
        </div>
      )}
    </section>
  );
};

export default memo(SavingsGoalStats);