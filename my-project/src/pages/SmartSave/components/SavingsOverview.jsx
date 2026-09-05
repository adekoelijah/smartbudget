
import {
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { useCallback, useMemo } from "react";

/* =========================================================
   SMARTSAVE HOOK
========================================================= */

import useSmartSave from "../../../hooks/useSmartSave";

/* =========================================================
   SMARTSAVE COMPONENTS
========================================================= */

import SavingsHealthScore from "./SavingsHealthScore";
import SafeToSaveCard from "./SafeToSaveCard";
import SavingsStats from "./shared/SavingsStat";
import SavingsProgressBar from "./shared/SavingsProgressBar";
import SavingsActivitySection from "./SavingsActivity/SavingsActivitySection";
import SavingsGoalSection from "./SavingsGoals/SavingsGoalsSection";
import SavingsChallengeSection from "./SavingsChallenges/SavingsChallengesSection";
import SavingsInsightsSection from "./SavingsInsights/SavingsInsightsSection";
import SavingsStrategiesSection from "./SavingsStrategies/SavingsStrategiesSection";
import SavingsSkeleton from "./shared/SavingsSkeleton";
import SavingsErrorState from "./shared/SavingsEmptyState";
import SavingsEmptyState from "./shared/SavingsEmptyState";

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

import {
  normalizeSavingsData,
} from "../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

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

const toArray = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    Array.isArray(
      value?.data
    )
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value?.items
    )
  ) {
    return value.items;
  }

  if (
    Array.isArray(
      value?.results
    )
  ) {
    return value.results;
  }

  return [];
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
   VALUE RESOLVERS
========================================================= */

const resolveTotalSaved = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data?.totalSaved ??
        data?.totalSavings ??
        data?.savedAmount ??
        data?.currentSavings ??
        data?.summary?.totalSaved ??
        data?.summary?.totalSavings
    )
  );

const resolveTarget = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data?.totalTarget ??
        data?.savingsTarget ??
        data?.targetAmount ??
        data?.summary?.totalTarget ??
        data?.summary?.savingsTarget
    )
  );

const resolveActiveGoals = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data?.activeGoals ??
        data?.goalsCount ??
        data?.summary?.activeGoals
    )
  );

const resolveCompletedGoals = (
  data
) =>
  Math.max(
    0,
    toFiniteNumber(
      data?.completedGoals ??
        data?.summary?.completedGoals
    )
  );

const resolveSafeToSave = (
  data
) => {
  if (
    isObject(
      data?.safeToSave
    )
  ) {
    return data.safeToSave;
  }

  if (
    isObject(
      data?.safeToSaveResult
    )
  ) {
    return data.safeToSaveResult;
  }

  if (
    typeof data?.safeToSave ===
    "number"
  ) {
    return {
      safeToSave:
        data.safeToSave,
    };
  }

  return (
    data?.safeToSave ??
    null
  );
};

const resolveHealth = (
  data
) =>
  data?.health ??
  data?.savingsHealth ??
  data?.healthScore ??
  data?.summary?.health ??
  null;

const resolveProgress = (
  totalSaved,
  target,
  data
) => {
  const explicit =
    data?.progress ??
    data?.progressPercentage ??
    data?.summary?.progress;

  if (
    explicit !== null &&
    explicit !== undefined
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
    (totalSaved /
      target) *
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
  try {
    return formatCurrency(
      toFiniteNumber(
        value
      ),
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
      ).format(
        toFiniteNumber(
          value
        )
      );
    } catch {
      return `${currency || "NGN"} ${toFiniteNumber(
        value
      ).toLocaleString()}`;
    }
  }
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
  href,
  onClick,
}) => {
  const interactive =
    typeof onClick ===
      "function" ||
    Boolean(href);

  const content = (
    <>
      <div
        className="flex justify-between items-start gap-3"
      >
        <div
          className="flex justify-center items-center bg-slate-100 rounded-xl w-10 h-10 shrink-0"
        >
          <Icon
            size={19}
            strokeWidth={1.9}
            className="text-slate-700"
            aria-hidden="true"
          /
          >
        </div>

        {interactive && (
          <ArrowRight
            size={16}
            className="text-slate-300 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          /
          >
        )}
      </div>

      <div
        className="mt-5"
      >
        <p
          className="font-medium text-slate-500 text-xs"
        >
          {label}
        </p>

        <p
          className="mt-1 font-bold tabular-nums text-slate-900 text-xl truncate tracking-tight"
        >
          {value}
        </p>

        {description && (
          <p
            className="mt-1.5 text-[11px] text-slate-400 truncate"
          >
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group block bg-white shadow-sm hover:shadow-md p-5 border border-slate-200 hover:border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition hover:-translate-y-0.5"
      >
        {content}
      </a>
    );
  }

  if (
    typeof onClick ===
    "function"
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group block bg-white shadow-sm hover:shadow-md p-5 border border-slate-200 hover:border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full text-left transition hover:-translate-y-0.5"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="bg-white shadow-sm p-5 border border-slate-200 rounded-2xl"
    >
      {content}
    </div>
  );
};

/* =========================================================
   PROGRESS OVERVIEW
========================================================= */

const ProgressOverview = ({
  totalSaved,
  target,
  progress,
  currency,
}) => {
  return (
    <section
      className="bg-white shadow-sm p-5 border border-slate-200 rounded-2xl"
    >
      <div
        className="flex justify-between items-start gap-4"
      >
        <div
          className="min-w-0"
        >
          <div
            className="flex items-center gap-2"
          >
            <div
              className="flex justify-center items-center bg-slate-100 rounded-lg w-9 h-9"
            >
              <TrendingUp
                size={17}
                className="text-slate-700"
                aria-hidden="true"
              /
              >
            </div>

            <h2
              className="font-semibold text-slate-900 text-sm"
            >
              Savings progress
            </h2>
          </div>

          <p
            className="mt-3 text-slate-500 text-xs leading-5"
          >
            Track how your current
            savings compare with your
            overall savings target.
          </p>
        </div>

        <span
          className="font-bold tabular-nums text-slate-900 text-lg shrink-0"
        >
          {Math.round(
            progress
          )}%
        </span>
      </div>

      <div
        className="mt-5"
      >
        <SavingsProgressBar
          progress={
            progress
          }
          value={
            progress
          }
          percentage={
            progress
          }
        />
      </div>

      <div
        className="flex justify-between items-center gap-4 mt-4"
      >
        <div>
          <p
            className="font-medium text-[10px] text-slate-400 uppercase tracking-wide"
          >
            Saved
          </p>

          <p
            className="mt-1 font-semibold tabular-nums text-slate-800 text-sm"
          >
            {safeFormatCurrency(
              totalSaved,
              currency
            )}
          </p>
        </div>

        <div
          className="text-right"
        >
          <p
            className="font-medium text-[10px] text-slate-400 uppercase tracking-wide"
          >
            Target
          </p>

          <p
            className="mt-1 font-semibold tabular-nums text-slate-800 text-sm"
          >
            {safeFormatCurrency(
              target,
              currency
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsOverview = ({
  currency =
    DEFAULT_CURRENCY ??
    "NGN",

  className = "",

  /*
   * Optional navigation callbacks.
   * The overview itself remains reusable.
   */
  onViewGoals,

  onViewChallenges,

  onViewActivity,

  onViewInsights,

  onCreateGoal,

  onCreateChallenge,

  onSaveAmount,

  /*
   * Optional override for title.
   */
  title = "Savings Overview",

  subtitle =
    "A clear view of your savings health, progress and opportunities.",

  showHealth = true,

  showSafeToSave = true,

  showGoals = true,

  showChallenges = true,

  showActivity = true,

  showInsights = true,

  showStrategies = true,

  showProgress = true,

  showRefresh = true,
}) => {
  /* =======================================================
     SMARTSAVE ORCHESTRATION
  ======================================================= */

  const smartSave =
    useSmartSave();

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
  } = smartSave ?? {};

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const normalizedData =
    useMemo(() => {
      if (
        !data ||
        typeof data !==
          "object"
      ) {
        return {};
      }

      try {
        return (
          normalizeSavingsData(
            data
          ) ?? data
        );
      } catch {
        return data;
      }
    }, [data]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary =
    useMemo(() => {
      const totalSaved =
        resolveTotalSaved(
          normalizedData
        );

      const target =
        resolveTarget(
          normalizedData
        );

      const activeGoals =
        resolveActiveGoals(
          normalizedData
        );

      const completedGoals =
        resolveCompletedGoals(
          normalizedData
        );

      const progress =
        resolveProgress(
          totalSaved,
          target,
          normalizedData
        );

      return {
        totalSaved,
        target,
        activeGoals,
        completedGoals,
        progress,
      };
    }, [
      normalizedData,
    ]);

  /* =======================================================
     SAFE-TO-SAVE
  ======================================================= */

  const safeToSave =
    useMemo(
      () =>
        resolveSafeToSave(
          normalizedData
        ),
      [normalizedData]
    );

  /* =======================================================
     HEALTH
  ======================================================= */

  const health =
    useMemo(
      () =>
        resolveHealth(
          normalizedData
        ),
      [normalizedData]
    );

  /* =======================================================
     COLLECTIONS
  ======================================================= */

  const goals =
    useMemo(
      () =>
        toArray(
          normalizedData.goals ??
            normalizedData.savingsGoals
        ),
      [normalizedData]
    );

  const challenges =
    useMemo(
      () =>
        toArray(
          normalizedData.challenges ??
            normalizedData.savingsChallenges
        ),
      [normalizedData]
    );

  const activity =
    useMemo(
      () =>
        toArray(
          normalizedData.activity ??
            normalizedData.activities ??
            normalizedData.savingsActivity
        ),
      [normalizedData]
    );

  const insights =
    useMemo(
      () =>
        toArray(
          normalizedData.insights ??
            normalizedData.savingsInsights
        ),
      [normalizedData]
    );

  const strategies =
    useMemo(
      () =>
        toArray(
          normalizedData.strategies ??
            normalizedData.savingStrategies
        ),
      [normalizedData]
    );

  /* =======================================================
     CALLBACKS
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
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
         * The hook owns error state.
         * The overview intentionally does
         * not duplicate that state.
         */
      }
    }, [refresh]);

  const handleViewGoals =
    useCallback(() => {
      if (
        typeof onViewGoals ===
        "function"
      ) {
        onViewGoals();
      }
    }, [onViewGoals]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section
        className={`
          w-full
          ${className}
        `}
        aria-busy="true"
        aria-label="Loading savings overview"
      >
        <SavingsSkeleton
          module="overview"
        />
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <section
        className={`
          w-full
          ${className}
        `}
      >
        <SavingsErrorState
          error={error}
          onRetry={
            handleRefresh
          }
        />
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  const hasSavingsData =
    summary.totalSaved >
      0 ||
    summary.target >
      0 ||
    summary.activeGoals >
      0 ||
    goals.length >
      0;

  if (
    !hasSavingsData &&
    !safeToSave &&
    !health &&
    insights.length ===
      0 &&
    strategies.length ===
      0
  ) {
    return (
      <section
        className={`
          w-full
          ${className}
        `}
      >
        <SavingsEmptyState
          title="Start your savings journey"
          description="Create your first savings goal and let SmartSave help you build a consistent savings plan."
          actionLabel="Create savings goal"
          onAction={
            onCreateGoal
          }
        />
      </section>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <section
      className={`
        w-full
        space-y-6
        ${className}
      `}
      aria-label="Savings overview"
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header
        className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4"
      >
        <div
          className="min-w-0"
        >
          <div
            className="flex items-center gap-2"
          >
            <div
              className="flex justify-center items-center bg-slate-900 rounded-xl w-10 h-10 shrink-0"
            >
              <PiggyBank
                size={20}
                className="text-white"
                aria-hidden="true"
              /
              >
            </div>

            <h1
              className="font-bold text-slate-900 text-xl sm:text-2xl truncate tracking-tight"
            >
              {title}
            </h1>
          </div>

          <p
            className="mt-2 max-w-2xl text-slate-500 text-sm leading-6"
          >
            {subtitle}
          </p>
        </div>

        {showRefresh && (
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              isRefreshing
            }
            className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-sm px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />

            <span>
              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>
        )}
      </header>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div
        className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          icon={
            WalletCards
          }
          label="Total saved"
          value={safeFormatCurrency(
            summary.totalSaved,
            currency
          )}
          description={
            summary.target >
            0
              ? `of ${safeFormatCurrency(
                  summary.target,
                  currency
                )} target`
              : "Current savings balance"
          }
        />

        <SummaryCard
          icon={Target}
          label="Active goals"
          value={Math.round(
            summary.activeGoals
          )}
          description={
            summary.completedGoals >
            0
              ? `${Math.round(
                  summary.completedGoals
                )} completed`
              : "Savings goals in progress"
          }
          onClick={
            onViewGoals
              ? handleViewGoals
              : undefined
          }
        />

        <SummaryCard
          icon={
            TrendingUp
          }
          label="Overall progress"
          value={`${Math.round(
            summary.progress
          )}%`}
          description="Progress toward savings targets"
        />

        <SummaryCard
          icon={
            PiggyBank
          }
          label="Savings target"
          value={safeFormatCurrency(
            summary.target,
            currency
          )}
          description="Combined target amount"
        />
      </div>

      {/* =================================================
          HEALTH + SAFE TO SAVE
      ================================================= */}

      {(showHealth ||
        showSafeToSave) && (
        <div
          className="gap-6 grid grid-cols-1 xl:grid-cols-2"
        >
          {showHealth && (
            <SavingsHealthScore
              data={health}
              currency={
                currency
              }
            />
          )}

          {showSafeToSave && (
            <SafeToSaveCard
              result={
                safeToSave
              }
              currency={
                currency
              }
              onSave={
                onSaveAmount
              }
            />
          )}
        </div>
      )}

      {/* =================================================
          PROGRESS
      ================================================= */}

      {showProgress && (
        <ProgressOverview
          totalSaved={
            summary.totalSaved
          }
          target={
            summary.target
          }
          progress={
            summary.progress
          }
          currency={
            currency
          }
        />
      )}

      {/* =================================================
          GOALS
      ================================================= */}

      {showGoals && (
        <SavingsGoalSection
          goals={goals}
          onCreate={
            onCreateGoal
          }
          onViewAll={
            onViewGoals
          }
        />
      )}

      {/* =================================================
          CHALLENGES
      ================================================= */}

      {showChallenges && (
        <SavingsChallengeSection
          challenges={
            challenges
          }
          onCreate={
            onCreateChallenge
          }
          onViewAll={
            onViewChallenges
          }
        />
      )}

      {/* =================================================
          ACTIVITY
      ================================================= */}

      {showActivity && (
        <SavingsActivitySection
          activity={
            activity
          }
          onViewAll={
            onViewActivity
          }
        />
      )}

      {/* =================================================
          INSIGHTS
      ================================================= */}

      {showInsights && (
        <SavingsInsightsSection
          insights={
            insights
          }
          onViewAll={
            onViewInsights
          }
        />
      )}

      {/* =================================================
          STRATEGIES
      ================================================= */}

      {showStrategies && (
        <SavingsStrategiesSection
          strategies={
            strategies
          }
        />
      )}
    </section>
  );
};

export default SavingsOverview;
