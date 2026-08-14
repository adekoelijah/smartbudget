
import {
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

/* =========================================================
   SMARTSAVE HOOK
========================================================= */

import useSavingsStrategies from "../../../../hooks/useSavingsStrategies";

/* =========================================================
   STRATEGY CARDS
========================================================= */

import CustomSavingStrategyCard from "./CustomSavingStrategyCard";
import FixedAmountSavingCard from "./FixedAmountSavingCard";
import IncomeBasedSavingCard from "./IncomeBasedSavingCard";
import PercentageSavingCard from "./PercentageSavingCard";
import RoundUpSavingCard from "./RoundUpSavingCard";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE CONFIGURATION
========================================================= */

import {
  SMART_SAVE_STRATEGY_CONFIG,
} from "../../../../config/smartSaveConfig";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  normalizeSavingsStrategy,
  normalizeSavingsStrategies,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   STRATEGY TYPE FALLBACKS
========================================================= */

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
   STRATEGY TYPE NORMALIZATION
========================================================= */

const normalizeStrategyType = (strategy) => {
  const rawType =
    strategy?.strategyType ??
    strategy?.strategy ??
    strategy?.type ??
    strategy?.method;

  if (
    typeof rawType !== "string"
  ) {
    return null;
  }

  const type =
    rawType
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
   SAFE ARRAY NORMALIZATION
========================================================= */

const getStrategiesArray = (value) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value?.data)
  ) {
    return value.data;
  }

  if (
    Array.isArray(value?.strategies)
  ) {
    return value.strategies;
  }

  if (
    Array.isArray(value?.plans)
  ) {
    return value.plans;
  }

  return [];
};

/* =========================================================
   EMPTY STATE
========================================================= */

const StrategiesEmptyState = ({
  onCreate,
}) => {
  const canCreate =
    typeof onCreate === "function";

  return (
    <div
      className="
        flex flex-col justify-center items-center
        px-6 py-12
        text-center
        bg-white
        border border-slate-300 border-dashed rounded-2xl
      "
    >
      <div
        className="
          flex justify-center items-center
          w-14 h-14
          text-slate-700
          bg-slate-100
          rounded-2xl
        "
        aria-hidden="true"
      >
        <Sparkles
          size={25}
        />
      </div>

      <h3
        className="
          mt-4
          font-semibold text-slate-900 text-base
        "
      >
        No savings strategies yet
      </h3>

      <p
        className="
          max-w-md
          mt-2
          text-slate-500 text-sm leading-6
        "
      >
        Create a savings strategy to
        automate how you build toward
        your financial goals.
      </p>

      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="
            inline-flex justify-center items-center
            min-h-10
            mt-5 px-4 py-2.5
            font-semibold text-white text-sm
            bg-slate-900 hover:bg-slate-800
            rounded-xl focus:outline-none
            focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
            transition
            gap-2
          "
        >
          <Plus
            size={16}
          />

          Create strategy
        </button>
      )}
    </div>
  );
};

/* =========================================================
   ERROR STATE
========================================================= */

const StrategiesErrorState = ({
  error,
  onRetry,
}) => {
  const message =
    typeof error === "string"
      ? error
      : error?.message ||
        "We couldn't load your savings strategies.";

  const canRetry =
    typeof onRetry === "function";

  return (
    <div
      className="
        p-5
        bg-red-50
        border border-red-200 rounded-2xl
      "
      role="alert"
    >
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <AlertCircle
          size={20}
          className="
            mt-0.5
            text-red-600
            shrink-0
          "
          /
        >

        <div
          className="
            min-w-0
          "
        >
          <h3
            className="
              font-semibold text-red-900 text-sm
            "
          >
            Unable to load savings strategies
          </h3>

          <p
            className="
              mt-1
              text-red-700 text-sm leading-6
            "
          >
            {message}
          </p>

          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="
                inline-flex justify-center items-center
                min-h-9
                mt-4 px-3 py-2
                font-semibold text-red-700 text-sm
                bg-white hover:bg-red-50
                border border-red-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-red-300
                transition
                gap-2
              "
            >
              <RefreshCw
                size={14}
              />

              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const StrategySkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
      animate-pulse
    "
    aria-hidden="true"
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <div
        className="
          w-11 h-11
          bg-slate-200
          rounded-xl
        "
        /
      >

      <div
        className="
          flex-1
          space-y-2
        "
      >
        <div
          className="
            w-2/3 h-4
            bg-slate-200
            rounded
          "
          /
        >

        <div
          className="
            w-1/3 h-3
            bg-slate-200
            rounded
          "
          /
        >
      </div>
    </div>

    <div
      className="
        h-20
        mt-5
        bg-slate-100
        rounded-xl
      "
      /
    >

    <div
      className="
        h-10
        mt-4
        bg-slate-100
        rounded-xl
      "
      /
    >
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsStrategiesSection = ({
  onCreate,
  onView,
//   onActivate,
//   onPause,
//   onResume,

  title,
  description,

  showHeader = true,
  showCreateButton = true,

//   compact = false,
  className = "",
}) => {
  /* =======================================================
     SMARTSAVE HOOK
  ======================================================= */

  const savingsStrategies =
    useSavingsStrategies();

  /* =======================================================
     HOOK CONTRACT NORMALIZATION
     -------------------------------------------------------
     Supports the established hook regardless of whether
     it exposes loading/error/data under their conventional
     names or returns the strategy collection directly.
  ======================================================= */

  const rawStrategies =
    savingsStrategies?.strategies ??
    savingsStrategies?.data ??
    savingsStrategies?.plans ??
    [];

  const loading =
    Boolean(
      savingsStrategies?.loading ??
      savingsStrategies?.isLoading ??
      savingsStrategies?.fetching
    );

  const error =
    savingsStrategies?.error ??
    null;

  const fetchStrategies =
    savingsStrategies?.fetchStrategies ??
    savingsStrategies?.refresh ??
    savingsStrategies?.refetch ??
    null;

  /* =======================================================
     MUTATION HANDLERS
  ======================================================= */

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
     NORMALIZE COLLECTION
     -------------------------------------------------------
     Normalization is pure. No state is changed during
     rendering.
  ======================================================= */

  const strategies =
    getStrategiesArray(
      rawStrategies
    )
      .map((strategy) => {
        try {
          return normalizeSavingsStrategy
            ? normalizeSavingsStrategy(
                strategy
              )
            : strategy;
        } catch {
          return strategy;
        }
      })
      .filter(Boolean);

  const normalizedStrategies =
    normalizeSavingsStrategies
      ? (() => {
          try {
            return normalizeSavingsStrategies(
              strategies
            );
          } catch {
            return strategies;
          }
        })()
      : strategies;

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {
    if (
      typeof onCreate === "function"
    ) {
      onCreate();
    }
  };

  /* =======================================================
     VIEW
  ======================================================= */

  const handleView = (
    strategy,
    strategyId
  ) => {
    if (
      typeof onView !== "function"
    ) {
      return;
    }

    onView(
      strategy,
      strategyId
    );
  };

  /* =======================================================
     ACTIVATE
     -------------------------------------------------------
     The section delegates to the hook. It does not perform
     optimistic state changes or manually mutate the list.
     The hook/service remains the source of truth.
  ======================================================= */

  const handleActivate = async (
    strategy,
    strategyId
  ) => {
    if (
      typeof activateStrategy !==
      "function"
    ) {
      return;
    }

    await activateStrategy(
      strategyId ??
      strategy?._id ??
      strategy?.id
    );
  };

  /* =======================================================
     PAUSE
  ======================================================= */

  const handlePause = async (
    strategy,
    strategyId
  ) => {
    if (
      typeof pauseStrategy !==
      "function"
    ) {
      return;
    }

    await pauseStrategy(
      strategyId ??
      strategy?._id ??
      strategy?.id
    );
  };

  /* =======================================================
     RESUME
  ======================================================= */

  const handleResume = async (
    strategy,
    strategyId
  ) => {
    if (
      typeof resumeStrategy !==
      "function"
    ) {
      return;
    }

    await resumeStrategy(
      strategyId ??
      strategy?._id ??
      strategy?.id
    );
  };

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry = () => {
    if (
      typeof fetchStrategies !==
      "function"
    ) {
      return;
    }

    fetchStrategies();
  };

  /* =======================================================
     HEADER CONFIGURATION
  ======================================================= */

  const sectionTitle =
    title ??
    SMART_SAVE_STRATEGY_CONFIG
      ?.sectionTitle ??
    "Savings strategies";

  const sectionDescription =
    description ??
    SMART_SAVE_STRATEGY_CONFIG
      ?.sectionDescription ??
    "Choose a strategy that helps you save consistently and work toward your financial goals.";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`
        w-full
        ${className}
      `}
      aria-labelledby="savings-strategies-heading"
    >
      {/* ===================================================
          SECTION HEADER
      =================================================== */}

      {showHeader && (
        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-end
            mb-5
            gap-4
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
                gap-2
              "
            >
              <Sparkles
                size={18}
                className="
                  text-slate-700
                "
                aria-hidden="true"
              /
              >

              <h2
                id="savings-strategies-heading"
                className="
                  font-bold text-slate-900 text-lg tracking-tight
                "
              >
                {sectionTitle}
              </h2>
            </div>

            <p
              className="
                max-w-2xl
                mt-1.5
                text-slate-500 text-sm leading-6
              "
            >
              {sectionDescription}
            </p>
          </div>

          {showCreateButton &&
            typeof onCreate ===
              "function" && (
              <button
                type="button"
                onClick={handleCreate}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  transition
                  gap-2 shrink-0
                "
              >
                <Plus
                  size={16}
                />

                New strategy
              </button>
            )}
        </header>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <div
          className="
            grid grid-cols-1 xl:grid-cols-2
            gap-4
          "
          aria-busy="true"
          aria-label="Loading savings strategies"
        >
          <StrategySkeleton />
          <StrategySkeleton />
        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {!loading &&
        error && (
          <StrategiesErrorState
            error={error}
            onRetry={handleRetry}
          />
        )}

      {/* ===================================================
          EMPTY
      =================================================== */}

      {!loading &&
        !error &&
        normalizedStrategies.length ===
          0 && (
          <StrategiesEmptyState
            onCreate={onCreate}
          />
        )}

      {/* ===================================================
          STRATEGY LIST
      =================================================== */}

      {!loading &&
        !error &&
        normalizedStrategies.length >
          0 && (
          <div
            className="
              grid grid-cols-1 xl:grid-cols-2
              gap-4
            "
          >
            {normalizedStrategies.map(
              (strategy, index) => {
                const strategyId =
                  strategy?._id ??
                  strategy?.id ??
                  strategy?.planId ??
                  strategy?.strategyId;

                const key =
                  strategyId
                    ? String(strategyId)
                    : `strategy-${index}`;

                return (
                  <div
                    key={key}
                    className="
                      min-w-0
                    "
                  >
                    {resolveStrategyCard(
                      strategy,
                      {
                        onView:
                          handleView,

                        onActivate:
                          handleActivate,

                        onPause:
                          handlePause,

                        onResume:
                          handleResume,
                      }
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
    </section>
  );
};

export default SavingsStrategiesSection;
