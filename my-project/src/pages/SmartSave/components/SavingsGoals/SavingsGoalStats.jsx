
import {
  useCallback,
  useMemo,
} from "react";

import {
  Target,
  CheckCircle2,
  TrendingUp,
  Wallet,
  RefreshCw,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";

import useSavingsGoals from "../../../../hooks/useSavingsGoals";

/**
 * =========================================================
 * SAVINGS GOAL STATS
 * =========================================================
 *
 * Production responsibilities:
 *
 * - Consume savings-goal state through useSavingsGoals
 * - Display aggregate goal statistics
 * - Remain responsive and accessible
 * - Handle loading, error and empty states
 * - Normalize defensive response shapes
 * - Never call the service layer directly
 * - Never mutate server state
 * - Never duplicate financial business logic
 *
 * Data flow:
 *
 * smartSaveService
 *        ↓
 * useSavingsGoals
 *        ↓
 * SavingsGoalStats
 *
 * =========================================================
 */

/* =========================================================
   SAFE NUMBER NORMALIZATION
========================================================= */

const toFiniteNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const normalizeStats = (value) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  if (
    value.data &&
    typeof value.data === "object" &&
    !Array.isArray(value.data)
  ) {
    return {
      ...value.data,
    };
  }

  if (
    value.stats &&
    typeof value.stats === "object" &&
    !Array.isArray(value.stats)
  ) {
    return {
      ...value.stats,
    };
  }

  return {
    ...value,
  };
};

/* =========================================================
   CURRENCY FORMATTER
 *
 * Prefer the application's existing savings formatter if
 * the hook already returns formatted values.
 *
 * This local fallback prevents this component from crashing
 * when a value is missing.
========================================================= */

const formatCurrency = (
  value,
  currency = "NGN"
) => {
  const amount = toFiniteNumber(value);

  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

/* =========================================================
   PERCENTAGE FORMATTER
========================================================= */

const formatPercentage = (value) => {
  const number = toFiniteNumber(value);

  return `${Math.max(
    0,
    Math.min(100, number)
  ).toFixed(0)}%`;
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  loading = false,
}) => {
  return (
    <article
      className="
        min-w-0
        p-4
        bg-white
        border border-slate-100 rounded-2xl
        shadow-sm
      "
    >
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-600
            bg-slate-50
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <Icon size={19} />
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
              className="
                w-24 h-6
                mt-2
                bg-slate-100
                rounded-md
                animate-pulse
              "
              aria-hidden="true"
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

          {description && !loading && (
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
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsGoalStats = ({
  className = "",
  currency = "NGN",
  compact = false,
}) => {
  /* =======================================================
     HOOK
  ======================================================= */

  const {
    goals,
    goalStats,
    stats,
    loading,
    error,

    refreshGoals,
    fetchGoals,
    getGoalStats,
  } = useSavingsGoals();

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const normalizedStats = useMemo(
    () =>
      normalizeStats(
        goalStats ?? stats
      ),
    [
      goalStats,
      stats,
    ]
  );

  /* =======================================================
     FALLBACK COLLECTION
  *
  * We use the goal collection only when the hook does not
  * expose dedicated statistics.
  *
  * Financial values are read from already-normalized goal
  * fields rather than recalculated from transactions.
  ======================================================= */

  const normalizedGoals = useMemo(() => {
    if (Array.isArray(goals)) {
      return goals;
    }

    if (Array.isArray(goals?.data)) {
      return goals.data;
    }

    if (Array.isArray(goals?.goals)) {
      return goals.goals;
    }

    return [];
  }, [goals]);

  /* =======================================================
     DERIVED DISPLAY STATS
  ======================================================= */

  const displayStats = useMemo(() => {
    const totalGoals = toFiniteNumber(
      normalizedStats.totalGoals ??
      normalizedStats.total ??
      normalizedStats.count
    );

    const activeGoals = toFiniteNumber(
      normalizedStats.activeGoals ??
      normalizedStats.active
    );

    const completedGoals = toFiniteNumber(
      normalizedStats.completedGoals ??
      normalizedStats.completed
    );

    const targetAmount = toFiniteNumber(
      normalizedStats.totalTargetAmount ??
      normalizedStats.targetAmount ??
      normalizedStats.totalTarget
    );

    const savedAmount = toFiniteNumber(
      normalizedStats.totalSavedAmount ??
      normalizedStats.savedAmount ??
      normalizedStats.totalSaved
    );

    const explicitProgress = toFiniteNumber(
      normalizedStats.progressPercentage ??
      normalizedStats.averageProgress
    );

    const calculatedProgress =
      targetAmount > 0
        ? (savedAmount / targetAmount) * 100
        : 0;

    return {
      totalGoals:
        totalGoals ||
        normalizedGoals.length,

      activeGoals:
        activeGoals ||
        normalizedGoals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            ).toLowerCase() === "active"
        ).length,

      completedGoals:
        completedGoals ||
        normalizedGoals.filter(
          (goal) =>
            String(
              goal?.status ?? ""
            ).toLowerCase() === "completed"
        ).length,

      targetAmount,

      savedAmount,

      progressPercentage:
        explicitProgress ||
        calculatedProgress,
    };
  }, [
    normalizedStats,
    normalizedGoals,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(
    async () => {
      if (
        typeof refreshGoals ===
        "function"
      ) {
        return refreshGoals();
      }

      if (
        typeof fetchGoals ===
        "function"
      ) {
        return fetchGoals();
      }

      return undefined;
    },
    [
      refreshGoals,
      fetchGoals,
    ]
  );

  /* =======================================================
     OPTIONAL DEDICATED STATS REFRESH
  *
  * If useSavingsGoals exposes getGoalStats, callers can
  * explicitly refresh statistics without creating a second
  * service abstraction.
  ======================================================= */

  const handleStatsRefresh =
    useCallback(async () => {
      if (
        typeof getGoalStats ===
        "function"
      ) {
        return getGoalStats();
      }

      return handleRefresh();
    }, [
      getGoalStats,
      handleRefresh,
    ]);

  /* =======================================================
     ERROR NORMALIZATION
  ======================================================= */

  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }

    if (typeof error === "string") {
      return error;
    }

    return (
      error?.message ||
      error?.response?.data?.message ||
      "Unable to load savings goal statistics."
    );
  }, [error]);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const hasStats =
    displayStats.totalGoals > 0 ||
    displayStats.targetAmount > 0 ||
    displayStats.savedAmount > 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`w-full ${className}`}
      aria-labelledby="savings-goal-stats-title"
    >
      {/* =================================================
          HEADER
      ================================================= */}

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
          onClick={handleStatsRefresh}
          disabled={loading}
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
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          <span>
            Refresh
          </span>
        </button>
      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {errorMessage && (
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
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={handleStatsRefresh}
              className="
                mt-2
                font-semibold text-red-800 text-xs underline underline-offset-2
              "
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          STATS GRID
      ================================================= */}

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
          loading={loading}
        />

        <StatCard
          icon={TrendingUp}
          label="Active goals"
          value={displayStats.activeGoals}
          description="Currently in progress"
          loading={loading}
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={displayStats.completedGoals}
          description="Successfully reached"
          loading={loading}
        />

        {!compact && (
          <>
            <StatCard
              icon={Wallet}
              label="Saved"
              value={formatCurrency(
                displayStats.savedAmount,
                currency
              )}
              description="Total saved"
              loading={loading}
            />

            <StatCard
              icon={CircleDollarSign}
              label="Progress"
              value={formatPercentage(
                displayStats.progressPercentage
              )}
              description="Overall goal progress"
              loading={loading}
            />
          </>
        )}
      </div>

      {/* =================================================
          PROGRESS BAR
      ================================================= */}

      {!compact &&
        !loading &&
        hasStats && (
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
              <span
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Overall savings progress
              </span>

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
                mt-2
                bg-slate-100
                rounded-full
              "
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(
                0,
                Math.min(
                  100,
                  displayStats.progressPercentage
                )
              )}
              aria-label="Overall savings progress"
            >
              <div
                className="
                  h-full
                  bg-slate-900
                  rounded-full
                  transition-all duration-500
                "
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      displayStats.progressPercentage
                    )
                  )}%`,
                }}
              /
              >
            </div>

            <div
              className="
                flex justify-between
                mt-2
                text-slate-400 text-xs
                gap-3
              "
            >
              <span>
                {formatCurrency(
                  displayStats.savedAmount,
                  currency
                )}
              </span>

              <span>
                {formatCurrency(
                  displayStats.targetAmount,
                  currency
                )}
              </span>
            </div>
          </div>
        )}

      {/* =================================================
          EMPTY INFORMATION
      ================================================= */}

      {!loading &&
        !errorMessage &&
        !hasStats && (
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
              /
            >

            <p
              className="
                mt-3
                font-semibold text-slate-700 text-sm
              "
            >
              No savings activity yet
            </p>

            <p
              className="
                max-w-sm
                mx-auto mt-1
                text-slate-500 text-xs leading-5
              "
            >
              Create a savings goal to start
              tracking your progress.
            </p>
          </div>
        )}
    </section>
  );
};

export default SavingsGoalStats;