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
  useState,
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
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings strategies";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits with strategies designed around your income, spending and financial goals.";

const DEFAULT_ERROR =
  "We couldn't load your savings strategies.";

const MAX_STRATEGIES = 100;

/* =========================================================
   STRATEGY TYPES
========================================================= */

const STRATEGY_TYPES = Object.freeze({
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
});

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Convert an arbitrary value into a safe user-facing
 * error message.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || DEFAULT_ERROR;
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR;
};

/**
 * Resolve a stable strategy identifier.
 */
const getStrategyId = (strategy) => {
  if (!strategy) {
    return null;
  }

  if (typeof strategy === "string") {
    return strategy;
  }

  return (
    strategy?._id ??
    strategy?.id ??
    strategy?.planId ??
    strategy?.strategyId ??
    null
  );
};

/**
 * Resolve an array from all supported SmartSave
 * response envelopes.
 */
const resolveStrategies = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const candidates = [
    value.strategies,
    value.plans,
    value.items,
    value.results,
    value.data,
    value.data?.strategies,
    value.data?.plans,
    value.data?.items,
    value.data?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

/**
 * Normalize strategy type into the canonical SmartSave
 * representation.
 */
const normalizeStrategyType = (strategy) => {
  const rawType =
    strategy?.strategyType ??
    strategy?.strategy ??
    strategy?.type ??
    strategy?.method ??
    strategy?.kind;

  if (
    typeof rawType !== "string" ||
    !rawType.trim()
  ) {
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
    case "percentage_saving":
      return STRATEGY_TYPES.PERCENTAGE;

    case "income":
    case "income_based":
    case "income_percentage":
      return STRATEGY_TYPES.INCOME_BASED;

    case "roundup":
    case "round_up":
    case "round_up_saving":
    case "roundup_saving":
      return STRATEGY_TYPES.ROUND_UP;

    case "custom":
    case "custom_strategy":
      return STRATEGY_TYPES.CUSTOM;

    default:
      return type;
  }
};

/**
 * Resolve strategy status.
 */
const getStrategyStatus = (strategy) =>
  String(
    strategy?.status ??
      strategy?.state ??
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

/**
 * Active strategy states.
 */
const isActiveStrategy = (strategy) => {
  const status =
    getStrategyStatus(strategy);

  return (
    status === "active" ||
    status === "running" ||
    status === "enabled"
  );
};

/**
 * Paused strategy states.
 */
const isPausedStrategy = (strategy) => {
  const status =
    getStrategyStatus(strategy);

  return (
    status === "paused" ||
    status === "pause"
  );
};

/**
 * Stable React key.
 */
const getStrategyKey = (
  strategy,
  index
) => {
  const id =
    getStrategyId(strategy);

  if (id !== null && id !== undefined) {
    return `strategy-${String(id)}`;
  }

  return `strategy-fallback-${index}`;
};

/**
 * Only render real strategy records.
 */
const isRenderableStrategy = (strategy) =>
  Boolean(
    strategy &&
      getStrategyId(strategy)
  );

/* =========================================================
   STRATEGY NORMALIZATION
========================================================= */

const normalizeStrategyRecord = (
  strategy
) => {
  if (!strategy) {
    return null;
  }

  try {
    const normalized =
      typeof normalizeSavingsStrategy ===
      "function"
        ? normalizeSavingsStrategy(
            strategy
          )
        : strategy;

    if (!normalized) {
      return null;
    }

    return normalized;
  } catch {
    /*
     * Do not allow one malformed strategy to
     * destroy the entire SmartSave page.
     */
    return strategy;
  }
};

/* =========================================================
   STRATEGY CARD
========================================================= */

const StrategyCard = memo(
  ({
    strategy,
    onView,
    onActivate,
    onPause,
    onResume,
    actionLoading,
  }) => {
    const type =
      normalizeStrategyType(strategy);

    const commonProps = {
      strategy,
      onView,
      onActivate,
      onPause,
      onResume,
      actionLoading,
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
        return (
          <UnsupportedStrategyCard
            strategy={strategy}
            onView={onView}
          />
        );
    }
  }
);

StrategyCard.displayName =
  "StrategyCard";

/* =========================================================
   UNSUPPORTED STRATEGY FALLBACK
========================================================= */

const UnsupportedStrategyCard = memo(
  ({
    strategy,
    onView,
  }) => (
    <div
      className="
        p-5
        bg-white
        border border-amber-200 rounded-2xl
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
            text-amber-700
            bg-amber-50
            rounded-xl
            shrink-0
          "
        >
          <AlertCircle size={18} />
        </div>

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            Strategy needs attention
          </p>

          <p
            className="
              mt-1
              text-slate-500 text-xs leading-5
            "
          >
            This strategy type is not currently
            supported by this version of SmartSave.
          </p>

          {typeof onView ===
            "function" && (
            <button
              type="button"
              onClick={() =>
                onView(
                  strategy,
                  getStrategyId(
                    strategy
                  )
                )
              }
              className="inline-flex items-center gap-1 mt-3 font-semibold text-slate-700 hover:text-slate-950 text-xs"
            >
              View details
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
);

UnsupportedStrategyCard.displayName =
  "UnsupportedStrategyCard";

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
        border border-slate-200/80 rounded-2xl
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
            text-slate-700
            bg-slate-50
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
              font-semibold text-[11px] text-slate-400 uppercase
              tracking-[0.08em]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-xl tracking-tight
            "
          >
            {value}
          </p>

          <p
            className="
              mt-0.5
              text-[11px] text-slate-400 leading-4
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
  "SummaryMetric";

/* =========================================================
   PAGE SKELETON
========================================================= */

const PageSkeleton = memo(() => (
  <main
    className="
      min-h-screen
      px-4 sm:px-6 lg:px-8 py-6 sm:py-8
      bg-slate-50
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
          flex justify-between items-start
          gap-6
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
              w-12 h-12
              bg-slate-200
              rounded-2xl
              animate-pulse
            "
            /
          >

          <div>
            <div
              className="
                w-48 h-6
                bg-slate-200
                rounded
                animate-pulse
              "
              /
            >

            <div
              className="
                w-80 max-w-full h-4
                mt-2
                bg-slate-100
                rounded
                animate-pulse
              "
              /
            >
          </div>
        </div>

        <div
          className="
            hidden sm:block
            w-32 h-11
            bg-slate-200
            rounded-xl
            animate-pulse
          "
          /
        >
      </div>

      <div
        className="
          grid grid-cols-2 lg:grid-cols-4
          mt-8
          gap-3 sm:gap-4
        "
      >
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="
                h-28
                bg-white
                border border-slate-200 rounded-2xl
                animate-pulse
              "
              /
            >
          )
        )}
      </div>

      <div
        className="
          grid grid-cols-1 xl:grid-cols-2
          mt-8
          gap-5
        "
      >
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="
                h-64
                bg-white
                border border-slate-200 rounded-2xl
                animate-pulse
              "
              /
            >
          )
        )}
      </div>
    </div>
  </main>
));

PageSkeleton.displayName =
  "SavingsStrategiesPageSkeleton";

/* =========================================================
   ERROR STATE
========================================================= */

const PageErrorState = memo(
  ({
    error,
    onRetry,
    retrying,
  }) => (
    <main
      className="
        min-h-screen
        px-4 sm:px-6 lg:px-8 py-8
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-2xl
          mx-auto
        "
      >
        <div
          className="
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
              font-bold text-slate-950 text-xl
            "
          >
            Unable to load your savings strategies
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
                min-h-11
                mt-6 px-4
                font-semibold text-white text-sm
                bg-slate-950 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                disabled:opacity-60 transition
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
      </div>
    </main>
  )
);

PageErrorState.displayName =
  "SavingsStrategiesPageErrorState";

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = memo(
  ({ onCreate }) => (
    <div
      className="
        mt-8 p-8 sm:p-14
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
          mx-auto
          text-slate-700
          bg-slate-50
          border border-slate-100 rounded-2xl
        "
      >
        <Target size={27} />
      </div>

      <h2
        className="
          mt-5
          font-bold text-slate-950 text-xl tracking-tight
        "
      >
        No savings strategies yet
      </h2>

      <p
        className="
          max-w-xl
          mx-auto mt-2
          text-slate-500 text-sm leading-6
        "
      >
        Create a strategy to automate or structure
        how you save toward your financial goals.
        SmartSave can support fixed amounts,
        percentages, income-based saving, round-ups
        and custom strategies.
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
            bg-slate-950 hover:bg-slate-800
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
  )
);

EmptyState.displayName =
  "SavingsStrategiesEmptyState";

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
    useSavingsStrategies() ?? {};

  /* =======================================================
     SERVER STATE
  ======================================================= */

  const loading = Boolean(
    savingsStrategies.loading ??
      savingsStrategies.isLoading ??
      false
  );

  const refreshing = Boolean(
    savingsStrategies.refreshing ??
      savingsStrategies.isRefreshing ??
      savingsStrategies.isFetching ??
      false
  );

  const error =
    savingsStrategies.error ??
    null;

  /* =======================================================
     DATA
  ======================================================= */

  const rawData =
    savingsStrategies.strategies ??
    savingsStrategies.plans ??
    savingsStrategies.data ??
    [];

  const strategies = useMemo(() => {
    const collection =
      resolveStrategies(rawData);

    if (!collection.length) {
      return [];
    }

    return collection
      .slice(0, MAX_STRATEGIES)
      .map(
        normalizeStrategyRecord
      )
      .filter(
        isRenderableStrategy
      );
  }, [rawData]);

  /* =======================================================
     API ACTIONS
  ======================================================= */

  const fetchStrategies =
    savingsStrategies.fetchStrategies ??
    savingsStrategies.fetch ??
    savingsStrategies.refresh ??
    savingsStrategies.refetch ??
    null;

  const activateStrategy =
    savingsStrategies.activateStrategy ??
    savingsStrategies.activateSavingPlan ??
    null;

  const pauseStrategy =
    savingsStrategies.pauseStrategy ??
    savingsStrategies.pauseSavingPlan ??
    null;

  const resumeStrategy =
    savingsStrategies.resumeStrategy ??
    savingsStrategies.resumeSavingPlan ??
    null;

  /* =======================================================
     LOCAL ACTION STATE
  ======================================================= */

  const [
    actionLoadingId,
    setActionLoadingId,
  ] = useState(null);

  const [
    actionError,
    setActionError,
  ] = useState(null);

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
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    let active = 0;
    let paused = 0;

    const types = new Set();

    for (const strategy of strategies) {
      if (isActiveStrategy(strategy)) {
        active += 1;
      }

      if (isPausedStrategy(strategy)) {
        paused += 1;
      }

      const type =
        normalizeStrategyType(
          strategy
        );

      if (type) {
        types.add(type);
      }
    }

    return {
      total: strategies.length,
      active,
      paused,
      inactive: Math.max(
        strategies.length -
          active -
          paused,
        0
      ),
      types: types.size,
    };
  }, [strategies]);

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

      setActionError(null);

      try {
        return await fetchStrategies();
      } catch (refreshError) {
        setActionError(
          getErrorMessage(
            refreshError
          )
        );

        throw refreshError;
      }
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

      setActionError(null);

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

        const id =
          strategyId ??
          getStrategyId(strategy);

        onView(
          strategy,
          id
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
          setActionError(
            "Activating this savings strategy is currently unavailable."
          );

          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          setActionError(
            "This savings strategy could not be identified."
          );

          return undefined;
        }

        setActionError(null);
        setActionLoadingId(id);

        try {
          return await activateStrategy(
            id
          );
        } catch (activationError) {
          setActionError(
            getErrorMessage(
              activationError
            )
          );

          throw activationError;
        } finally {
          setActionLoadingId(null);
        }
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
          setActionError(
            "Pausing this savings strategy is currently unavailable."
          );

          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          setActionError(
            "This savings strategy could not be identified."
          );

          return undefined;
        }

        setActionError(null);
        setActionLoadingId(id);

        try {
          return await pauseStrategy(
            id
          );
        } catch (pauseError) {
          setActionError(
            getErrorMessage(
              pauseError
            )
          );

          throw pauseError;
        } finally {
          setActionLoadingId(null);
        }
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
          setActionError(
            "Resuming this savings strategy is currently unavailable."
          );

          return undefined;
        }

        const id =
          strategyId ??
          getStrategyId(strategy);

        if (!id) {
          setActionError(
            "This savings strategy could not be identified."
          );

          return undefined;
        }

        setActionError(null);
        setActionLoadingId(id);

        try {
          return await resumeStrategy(
            id
          );
        } catch (resumeError) {
          setActionError(
            getErrorMessage(
              resumeError
            )
          );

          throw resumeError;
        } finally {
          setActionLoadingId(null);
        }
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

  const hasStrategies =
    strategies.length > 0;

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
        onRetry={
          typeof fetchStrategies ===
          "function"
            ? handleRefresh
            : undefined
        }
        retrying={refreshing}
      />
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main
      className={`bg-slate-50 min-h-screen ${className}`}
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
              flex items-start
              min-w-0
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
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
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

                {hasStrategies && (
                  <span
                    className="
                      inline-flex items-center
                      min-h-6
                      px-2.5
                      font-semibold text-slate-600 text-xs
                      bg-slate-100
                      rounded-full
                    "
                  >
                    {summary.total}
                  </span>
                )}
              </div>

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

          <div
            className="
              flex
              w-full lg:w-auto
              gap-2
            "
          >
            {typeof fetchStrategies ===
              "function" && (
              <button
                type="button"
                onClick={() =>
                  void handleRefresh()
                }
                disabled={
                  refreshing
                }
                className="inline-flex flex-1 lg:flex-none justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-60 shadow-sm px-4 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-2 min-h-11 font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            )}

            {typeof onCreate ===
              "function" && (
              <button
                type="button"
                onClick={
                  handleCreate
                }
                className="
                  inline-flex flex-1 lg:flex-none justify-center items-center
                  min-h-11
                  px-4
                  font-semibold text-white text-sm
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-950 focus:ring-offset-2
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
            ACTION ERROR
        ================================================= */}

        {actionError && (
          <div
            className="
              flex items-start
              mt-5 p-4
              bg-red-50
              border border-red-200 rounded-2xl
              gap-3
            "
            role="alert"
          >
            <div
              className="
                flex justify-center items-center
                w-8 h-8
                text-red-700
                bg-red-100
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
                  font-semibold text-red-900 text-sm
                "
              >
                Action could not be completed
              </p>

              <p
                className="
                  mt-1
                  text-red-700 text-xs leading-5
                "
              >
                {actionError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActionError(
                  null
                )
              }
              className="font-semibold text-red-700 hover:text-red-900 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =================================================
            NON-BLOCKING SERVER ERROR
        ================================================= */}

        {error && hasStrategies && (
          <div
            className="
              flex items-start
              mt-5 p-4
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
                  mt-1
                  text-amber-700 text-xs leading-5
                "
              >
                {getErrorMessage(error)}
              </p>
            </div>

            {typeof fetchStrategies ===
              "function" && (
              <button
                type="button"
                onClick={() =>
                  void handleRefresh()
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center gap-1 disabled:opacity-50 font-semibold text-amber-800 text-xs underline underline-offset-2 shrink-0"
              >
                Retry
                <ArrowRight
                  size={12}
                />
              </button>
            )}
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className="
            grid grid-cols-2 lg:grid-cols-4
            mt-7
            gap-3 sm:gap-4
          "
          aria-label="Savings strategy summary"
        >
          <SummaryMetric
            icon={Target}
            label="Total strategies"
            value={
              summary.total
            }
            description="Configured strategies"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Active"
            value={
              summary.active
            }
            description="Currently running"
          />

          <SummaryMetric
            icon={PauseCircle}
            label="Paused"
            value={
              summary.paused
            }
            description="Temporarily paused"
          />

          <SummaryMetric
            icon={TrendingUp}
            label="Strategy types"
            value={
              summary.types
            }
            description="Different approaches"
          />
        </section>

        {/* =================================================
            STRATEGIES
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
                  font-bold text-slate-950 text-lg tracking-tight
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
                Manage how SmartSave helps you save.
              </p>
            </div>

            <span
              className="
                inline-flex items-center self-start sm:self-auto
                min-h-7
                px-3
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

          {!hasStrategies ? (
            <EmptyState
              onCreate={
                typeof onCreate ===
                "function"
                  ? handleCreate
                  : undefined
              }
            />
          ) : (
            <div
              className="
                grid grid-cols-1 xl:grid-cols-2
                gap-5
              "
            >
              {strategies.map(
                (
                  strategy,
                  index
                ) => {
                  const id =
                    getStrategyId(
                      strategy
                    );

                  return (
                    <article
                      key={getStrategyKey(
                        strategy,
                        index
                      )}
                      className="
                        min-w-0
                      "
                    >
                      <StrategyCard
                        strategy={
                          strategy
                        }
                        onView={
                          handleView
                        }
                        onActivate={
                          handleActivate
                        }
                        onPause={
                          handlePause
                        }
                        onResume={
                          handleResume
                        }
                        actionLoading={
                          actionLoadingId ===
                          id
                        }
                      />
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================================
            BACKGROUND REFRESH
        ================================================= */}

        {refreshing &&
          hasStrategies && (
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