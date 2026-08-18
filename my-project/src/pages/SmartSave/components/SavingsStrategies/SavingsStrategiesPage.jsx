import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PauseCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
} from "react";

import useSavingsStrategies from "../../../../hooks/useSavingsStrategies";

import CustomSavingStrategyCard from "./CustomSavingStrategyCard";
import FixedAmountSavingCard from "./FixedAmountSavingCard";
import IncomeBasedSavingCard from "./IncomeBasedSavingCard";
import PercentageSavingCard from "./PercentageSavingCard";
import RoundUpSavingCard from "./RoundUpSavingCard";

import {
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

import {
  SMART_SAVE_STRATEGY_CONFIG,
} from "../../../../config/smartSaveConfig";

import {
  normalizeSavingsStrategy,
  normalizeSavingsStrategies,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE =
  "Savings strategies";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits with strategies designed around your income, spending and financial goals.";

const DEFAULT_ERROR =
  "We couldn't load your savings strategies.";

const STRATEGY_TYPES = {
  FIXED_AMOUNT:
    SAVINGS_STRATEGIES?.FIXED_AMOUNT ??
    "fixed_amount",

  PERCENTAGE:
    SAVINGS_STRATEGIES?.PERCENTAGE ??
    "percentage",

  INCOME_BASED:
    SAVINGS_STRATEGIES?.INCOME_BASED ??
    "income_based",

  ROUND_UP:
    SAVINGS_STRATEGIES?.ROUND_UP ??
    "round_up",

  CUSTOM:
    SAVINGS_STRATEGIES?.CUSTOM ??
    "custom",
};

/* =========================================================
   SAFE HELPERS
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    DEFAULT_ERROR
  );
};

const getStrategyId = (strategy) => {
  if (!strategy) {
    return null;
  }

  return (
    strategy?._id ??
    strategy?.id ??
    strategy?.planId ??
    strategy?.strategyId ??
    null
  );
};

const getStrategiesArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.strategies)) {
    return value.strategies;
  }

  if (Array.isArray(value?.plans)) {
    return value.plans;
  }

  if (Array.isArray(value?.data?.strategies)) {
    return value.data.strategies;
  }

  if (Array.isArray(value?.data?.plans)) {
    return value.data.plans;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
};

const normalizeStrategyType = (strategy) => {
  const rawType =
    strategy?.strategyType ??
    strategy?.strategy ??
    strategy?.type ??
    strategy?.method;

  if (typeof rawType !== "string") {
    return null;
  }

  const type = rawType
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  switch (type) {
    case "fixed":
    case "fixed_amount":
    case "fixedamount":
      return STRATEGY_TYPES.FIXED_AMOUNT;

    case "percentage":
    case "percentage_based":
    case "percent":
      return STRATEGY_TYPES.PERCENTAGE;

    case "income":
    case "income_based":
    case "income_percentage":
      return STRATEGY_TYPES.INCOME_BASED;

    case "roundup":
    case "round_up":
    case "round_up_saving":
      return STRATEGY_TYPES.ROUND_UP;

    case "custom":
    case "custom_strategy":
      return STRATEGY_TYPES.CUSTOM;

    default:
      return type;
  }
};

const getStrategyStatus = (strategy) =>
  String(
    strategy?.status ??
      strategy?.state ??
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const isActiveStrategy = (strategy) => {
  const status =
    getStrategyStatus(strategy);

  return (
    status === "active" ||
    status === "running" ||
    status === "enabled"
  );
};

const isPausedStrategy = (strategy) => {
  const status =
    getStrategyStatus(strategy);

  return (
    status === "paused" ||
    status === "pause"
  );
};

const getStrategyKey = (
  strategy,
  index
) => {
  const id =
    getStrategyId(strategy);

  return id
    ? `strategy-${String(id)}`
    : `strategy-fallback-${index}`;
};

/* =========================================================
   STRATEGY CARD RESOLVER
========================================================= */

const resolveStrategyCard = (
  strategy,
  handlers
) => {
  const type =
    normalizeStrategyType(strategy);

  const commonProps = {
    strategy,

    onView:
      handlers.onView,

    onActivate:
      handlers.onActivate,

    onPause:
      handlers.onPause,

    onResume:
      handlers.onResume,
  };

  switch (type) {
    case STRATEGY_TYPES.FIXED_AMOUNT:
      return (
        <FixedAmountSavingCard
          {...commonProps}
        />
      );

    case STRATEGY_TYPES.PERCENTAGE:
      return (
        <PercentageSavingCard
          {...commonProps}
        />
      );

    case STRATEGY_TYPES.INCOME_BASED:
      return (
        <IncomeBasedSavingCard
          {...commonProps}
        />
      );

    case STRATEGY_TYPES.ROUND_UP:
      return (
        <RoundUpSavingCard
          {...commonProps}
        />
      );

    case STRATEGY_TYPES.CUSTOM:
      return (
        <CustomSavingStrategyCard
          {...commonProps}
        />
      );

    default:
      return null;
  }
};

/* =========================================================
   PAGE SKELETON
========================================================= */

const PageSkeleton = memo(() => (
  <div
    className="
      min-h-screen
      px-4 sm:px-6 lg:px-8 py-6
      bg-slate-50
      animate-pulse
    "
    aria-busy="true"
    aria-label="Loading savings strategies"
  >
    <div
      className="
        w-full max-w-7xl
        mx-auto
      "
    >
      <div
        className="
          flex justify-between
          gap-6
        "
      >
        <div
          className="
            flex
            gap-3
          "
        >
          <div
            className="
              w-12 h-12
              bg-slate-200
              rounded-2xl
            "
            /
          >

          <div>
            <div
              className="
                w-48 h-6
                bg-slate-200
                rounded
              "
              /
            >

            <div
              className="
                w-80 h-4
                mt-2
                bg-slate-100
                rounded
              "
              /
            >
          </div>
        </div>

        <div
          className="
            hidden sm:block
            w-32 h-10
            bg-slate-200
            rounded-xl
          "
          /
        >
      </div>

      <div
        className="
          grid grid-cols-2 lg:grid-cols-4
          mt-8
          gap-4
        "
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-24
              bg-white
              border border-slate-200 rounded-2xl
            "
            /
          >
        ))}
      </div>

      <div
        className="
          grid grid-cols-1 xl:grid-cols-2
          mt-6
          gap-5
        "
      >
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-64
              bg-white
              border border-slate-200 rounded-2xl
            "
            /
          >
        ))}
      </div>
    </div>
  </div>
));

PageSkeleton.displayName =
  "SavingsStrategiesPageSkeleton";

/* =========================================================
   ERROR PAGE
========================================================= */

const PageErrorState = memo(
  ({
    error,
    onRetry,
    retrying,
  }) => (
    <main
      className="
        flex justify-center items-center
        min-h-screen
        px-4 py-10
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-lg
          p-6 sm:p-8
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        <div
          className="
            flex justify-center items-center
            w-12 h-12
            text-red-700
            bg-red-50
            border border-red-100 rounded-xl
          "
        >
          <AlertCircle size={22} />
        </div>

        <h1
          className="
            mt-5
            font-bold text-slate-900 text-xl
          "
        >
          Unable to load your strategies
        </h1>

        <p
          className="
            mt-2
            text-slate-500 text-sm leading-6
          "
        >
          {getErrorMessage(error)}
        </p>

        {typeof onRetry ===
          "function" && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="
              inline-flex justify-center items-center
              min-h-10
              mt-6 px-4
              font-semibold text-white text-sm
              bg-slate-900 hover:bg-slate-800
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <RefreshCw
              size={15}
              className={
                retrying
                  ? "animate-spin"
                  : ""
              }
            />

            {retrying
              ? "Retrying..."
              : "Try again"}
          </button>
        )}
      </div>
    </main>
  )
);

PageErrorState.displayName =
  "SavingsStrategiesPageErrorState";

/* =========================================================
   EMPTY PAGE
========================================================= */

const EmptyPageState = memo(
  ({ onCreate }) => (
    <main
      className="
        min-h-screen
        px-4 sm:px-6 lg:px-8 py-6
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto
        "
      >
        <header>
          <div
            className="
              flex items-center
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-12 h-12
                text-slate-700
                bg-white
                border border-slate-200 rounded-2xl
                shadow-sm
              "
            >
              <Sparkles size={21} />
            </div>

            <div>
              <h1
                className="
                  font-bold text-slate-900 text-2xl tracking-tight
                "
              >
                Savings strategies
              </h1>

              <p
                className="
                  mt-1
                  text-slate-500 text-sm
                "
              >
                Build a smarter and more consistent
                saving habit.
              </p>
            </div>
          </div>
        </header>

        <div
          className="
            flex flex-col justify-center items-center
            mt-8 px-6 py-20
            text-center
            bg-white
            border border-slate-200 border-dashed rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              flex justify-center items-center
              w-16 h-16
              text-slate-700
              bg-slate-100
              rounded-2xl
            "
          >
            <Target size={27} />
          </div>

          <h2
            className="
              mt-5
              font-bold text-slate-900 text-lg
            "
          >
            Start building your saving strategy
          </h2>

          <p
            className="
              max-w-lg
              mt-2
              text-slate-500 text-sm leading-6
            "
          >
            Choose how you want SmartSave to
            help you build toward your goals.
            You can save a fixed amount,
            percentage of income, round up
            transactions or create a custom
            strategy.
          </p>

          {typeof onCreate ===
            "function" && (
            <button
              type="button"
              onClick={onCreate}
              className="
                inline-flex justify-center items-center
                min-h-11
                mt-6 px-5
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                transition
                gap-2
              "
            >
              <Plus size={17} />

              Create your first strategy
            </button>
          )}
        </div>
      </div>
    </main>
  )
);

EmptyPageState.displayName =
  "SavingsStrategiesPageEmptyState";

/* =========================================================
   SUMMARY METRIC
========================================================= */

const SummaryMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
  }) => (
    <div
      className="
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-2xl
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
            w-9 h-9
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <Icon size={17} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-slate-500 text-xs font-medium
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-900 text-xl tracking-tight
            "
          >
            {value}
          </p>

          <p
            className="
              mt-0.5
              text-slate-400 text-[11px] leading-4
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
);

SummaryMetric.displayName =
  "SavingsStrategySummaryMetric";

/* =========================================================
   PAGE
========================================================= */

const SavingsStrategiesPage = ({
  onCreate,
  onView,

  title,
  description,

  className = "",
}) => {
  /* =======================================================
     HOOK
  ======================================================= */

  const savingsStrategies =
    useSavingsStrategies();

  /* =======================================================
     HOOK STATE
  ======================================================= */

  const rawStrategies =
    savingsStrategies?.strategies ??
    savingsStrategies?.data ??
    savingsStrategies?.plans ??
    [];

  const loading = Boolean(
    savingsStrategies?.loading ??
      savingsStrategies?.isLoading ??
      savingsStrategies?.fetching ??
      false
  );

  const refreshing = Boolean(
    savingsStrategies?.refreshing ??
      savingsStrategies?.isRefreshing ??
      savingsStrategies?.isFetching ??
      false
  );

  const error =
    savingsStrategies?.error ??
    null;

  const fetchStrategies =
    savingsStrategies?.fetchStrategies ??
    savingsStrategies?.refresh ??
    savingsStrategies?.refetch ??
    null;

  const activateStrategy =
    savingsStrategies?.activateStrategy ??
    savingsStrategies?.activateSavingPlan ??
    null;

  const pauseStrategy =
    savingsStrategies?.pauseStrategy ??
    savingsStrategies?.pauseSavingPlan ??
    null;

  const resumeStrategy =
    savingsStrategies?.resumeStrategy ??
    savingsStrategies?.resumeSavingPlan ??
    null;

  /* =======================================================
     NORMALIZE STRATEGIES
  ======================================================= */

  const strategies =
    useMemo(() => {
      const collection =
        getStrategiesArray(
          rawStrategies
        );

      if (
        collection.length === 0
      ) {
        return [];
      }

      const individuallyNormalized =
        collection
          .map((strategy) => {
            if (
              typeof normalizeSavingsStrategy !==
              "function"
            ) {
              return strategy;
            }

            try {
              return normalizeSavingsStrategy(
                strategy
              );
            } catch {
              return strategy;
            }
          })
          .filter(Boolean);

      if (
        typeof normalizeSavingsStrategies !==
        "function"
      ) {
        return individuallyNormalized;
      }

      try {
        const normalized =
          normalizeSavingsStrategies(
            individuallyNormalized
          );

        return Array.isArray(normalized)
          ? normalized.filter(Boolean)
          : individuallyNormalized;
      } catch {
        return individuallyNormalized;
      }
    }, [rawStrategies]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary =
    useMemo(() => {
      const total =
        strategies.length;

      const active =
        strategies.filter(
          isActiveStrategy
        ).length;

      const paused =
        strategies.filter(
          isPausedStrategy
        ).length;

      const inactive =
        Math.max(
          total - active - paused,
          0
        );

      const strategyTypes =
        new Set(
          strategies
            .map(
              normalizeStrategyType
            )
            .filter(Boolean)
        );

      return {
        total,
        active,
        paused,
        inactive,
        types:
          strategyTypes.size,
      };
    }, [strategies]);

  /* =======================================================
     PAGE CONFIG
  ======================================================= */

  const pageTitle =
    title ??
    SMART_SAVE_STRATEGY_CONFIG
      ?.sectionTitle ??
    DEFAULT_TITLE;

  const pageDescription =
    description ??
    SMART_SAVE_STRATEGY_CONFIG
      ?.sectionDescription ??
    DEFAULT_DESCRIPTION;

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      if (
        typeof fetchStrategies !==
        "function"
      ) {
        return undefined;
      }

      return fetchStrategies();
    }, [fetchStrategies]);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate =
    useCallback(() => {
      if (
        typeof onCreate !==
        "function"
      ) {
        return;
      }

      onCreate();
    }, [onCreate]);

  /* =======================================================
     VIEW
  ======================================================= */

  const handleView =
    useCallback(
      (strategy, strategyId) => {
        if (
          typeof onView !==
          "function"
        ) {
          return;
        }

        onView(
          strategy,
          strategyId ??
            getStrategyId(strategy)
        );
      },
      [onView]
    );

  /* =======================================================
     ACTIVATE
  ======================================================= */

  const handleActivate =
    useCallback(
      async (
        strategy,
        strategyId
      ) => {
        if (
          typeof activateStrategy !==
          "function"
        ) {
          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          return undefined;
        }

        return activateStrategy(id);
      },
      [activateStrategy]
    );

  /* =======================================================
     PAUSE
  ======================================================= */

  const handlePause =
    useCallback(
      async (
        strategy,
        strategyId
      ) => {
        if (
          typeof pauseStrategy !==
          "function"
        ) {
          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          return undefined;
        }

        return pauseStrategy(id);
      },
      [pauseStrategy]
    );

  /* =======================================================
     RESUME
  ======================================================= */

  const handleResume =
    useCallback(
      async (
        strategy,
        strategyId
      ) => {
        if (
          typeof resumeStrategy !==
          "function"
        ) {
          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          return undefined;
        }

        return resumeStrategy(id);
      },
      [resumeStrategy]
    );

  /* =======================================================
     CARD HANDLERS
  ======================================================= */

  const cardHandlers =
    useMemo(
      () => ({
        onView:
          handleView,

        onActivate:
          handleActivate,

        onPause:
          handlePause,

        onResume:
          handleResume,
      }),
      [
        handleView,
        handleActivate,
        handlePause,
        handleResume,
      ]
    );

  /* =======================================================
     REQUEST STATES
  ======================================================= */

  const initialLoading =
    loading &&
    strategies.length === 0;

  const initialError =
    Boolean(error) &&
    !loading &&
    strategies.length === 0;

  const empty =
    !loading &&
    !error &&
    strategies.length === 0;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (initialLoading) {
    return (
      <PageSkeleton />
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (initialError) {
    return (
      <PageErrorState
        error={error}
        onRetry={handleRefresh}
        retrying={refreshing}
      />
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (empty) {
    return (
      <EmptyPageState
        onCreate={
          typeof onCreate ===
          "function"
            ? handleCreate
            : undefined
        }
      />
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main
      className={`
        min-h-screen
        bg-slate-50
        ${className}
      `}
      aria-labelledby="savings-strategies-page-title"
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header
          className="
            flex flex-col lg:flex-row lg:justify-between lg:items-start
            gap-5
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex items-center
                gap-3
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-12 h-12
                  text-slate-700
                  bg-white
                  border border-slate-200 rounded-2xl
                  shadow-sm
                  shrink-0
                "
                aria-hidden="true"
              >
                <Sparkles
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <h1
                  id="savings-strategies-page-title"
                  className="
                    font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
                  "
                >
                  {pageTitle}
                </h1>

                <p
                  className="
                    max-w-2xl
                    mt-1.5
                    text-slate-500 text-sm sm:text-base leading-6
                  "
                >
                  {pageDescription}
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              flex items-center
              w-full lg:w-auto
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                void handleRefresh()
              }
              disabled={
                refreshing ||
                typeof fetchStrategies !==
                  "function"
              }
              className="
                inline-flex
                flex-1
                lg:flex-none
                justify-center
                items-center
                min-h-11
                px-4
                font-medium
                text-slate-700
                text-sm
                bg-white
                hover:bg-slate-50
                border border-slate-200
                rounded-xl
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-slate-300
                focus:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
                gap-2
              "
              aria-label={
                refreshing
                  ? "Refreshing savings strategies"
                  : "Refresh savings strategies"
              }
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>

            {typeof onCreate ===
              "function" && (
              <button
                type="button"
                onClick={handleCreate}
                className="
                  inline-flex flex-1 lg:flex-none justify-center items-center
                  min-h-11
                  px-4
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  shadow-sm transition
                  gap-2
                "
              >
                <Plus size={17} />

                New strategy
              </button>
            )}
          </div>
        </header>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className="
            grid grid-cols-2 lg:grid-cols-4
            mt-8
            gap-3 sm:gap-4
          "
          aria-label="Savings strategy summary"
        >
          <SummaryMetric
            icon={Target}
            label="Total strategies"
            value={summary.total}
            description="Configured strategies"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Active"
            value={summary.active}
            description="Currently running"
          />

          <SummaryMetric
            icon={PauseCircle}
            label="Paused"
            value={summary.paused}
            description="Temporarily paused"
          />

          <SummaryMetric
            icon={TrendingUp}
            label="Strategy types"
            value={summary.types}
            description="Different approaches"
          />
        </section>

        {/* =================================================
            CONTENT HEADER
        ================================================= */}

        <section
          className="
            mt-8
          "
          aria-labelledby="strategy-list-heading"
        >
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-end
              mb-4
              gap-3
            "
          >
            <div>
              <h2
                id="strategy-list-heading"
                className="
                  font-bold text-slate-900 text-lg
                "
              >
                Your strategies
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-sm
                "
              >
                Manage how SmartSave helps
                you save.
              </p>
            </div>

            <span
              className="
                inline-flex items-center self-start sm:self-auto
                min-h-7
                px-2.5
                font-semibold text-slate-600 text-xs
                bg-white
                border border-slate-200 rounded-full
              "
            >
              {summary.total}{" "}
              {summary.total === 1
                ? "strategy"
                : "strategies"}
            </span>
          </div>

          {/* ===============================================
              NON-BLOCKING ERROR
          =============================================== */}

          {error && (
            <div
              className="
                flex items-start
                mb-5 p-4
                bg-amber-50
                border border-amber-200 rounded-2xl
                gap-3
              "
              role="status"
              aria-live="polite"
            >
              <div
                className="
                  flex justify-center items-center
                  w-8 h-8
                  text-amber-700
                  bg-amber-100
                  rounded-lg
                  shrink-0
                "
              >
                <AlertCircle
                  size={16}
                />
              </div>

              <div
                className="
                  flex-1
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-amber-900 text-sm
                  "
                >
                  Your strategy data may be outdated
                </p>

                <p
                  className="
                    mt-0.5
                    text-amber-700 text-xs leading-5
                  "
                >
                  We couldn't fully refresh
                  your latest strategy information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void handleRefresh()
                }
                disabled={refreshing}
                className="
                  inline-flex
                  items-center
                  font-semibold
                  text-amber-800
                  text-xs
                  underline
                  underline-offset-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  gap-1
                  shrink-0
                "
              >
                Retry

                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* ===============================================
              STRATEGY GRID
          =============================================== */}

          <div
            className="
              grid grid-cols-1 xl:grid-cols-2
              gap-5
            "
          >
            {strategies.map(
              (strategy, index) => {
                const key =
                  getStrategyKey(
                    strategy,
                    index
                  );

                const card =
                  resolveStrategyCard(
                    strategy,
                    cardHandlers
                  );

                if (!card) {
                  return null;
                }

                return (
                  <article
                    key={key}
                    className="
                      min-w-0
                    "
                  >
                    {card}
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            BACKGROUND REFRESH
        ================================================= */}

        {refreshing && (
          <div
            className="
              flex justify-center items-center
              mt-5
              text-slate-400 text-xs
              gap-2
            "
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={13}
              className="
                animate-spin
              "
              aria-hidden="true"
            /
            >

            Updating your savings strategies...
          </div>
        )}
      </div>
    </main>
  );
};

SavingsStrategiesPage.displayName =
  "SavingsStrategiesPage";

export default memo(
  SavingsStrategiesPage
);