import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Target,
  WalletCards,
} from "lucide-react";
import {
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import useSavingsGoals from "../../../../hooks/useSavingsGoals";
import SavingsGoalCard from "./SavingsGoalCard";
import SavingsGoalEmptyState from "./SavingsGoalEmptyState";
import CreateSavingsGoalModal from "./CreateSavingsGoalModal";
import EditSavingsGoalModal from "./EditSavingsGoalModal";
import DeleteSavingsGoalModal from "./DeleteSavingsGoalModal";

/* ============================================================================
   CONSTANTS
============================================================================ */

const DEFAULT_TITLE = "Savings Goals";

const DEFAULT_DESCRIPTION =
  "Track your progress toward the things that matter most.";

const DEFAULT_LOAD_ERROR =
  "Unable to load your savings goals.";

const DEFAULT_MUTATION_ERROR =
  "We couldn't complete that action. Please try again.";

const DEFAULT_CURRENCY = "NGN";

const MAX_DISPLAY_LIMIT = 100;

/* ============================================================================
   DATA HELPERS
============================================================================ */

/**
 * Converts a value into a finite number.
 *
 * Financial UI should never expose NaN, Infinity,
 * or negative savings values.
 */
const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Resolves the canonical goal identifier.
 */
const getGoalId = (goal) => {
  if (!goal || typeof goal !== "object") {
    return null;
  }

  const id =
    goal._id ??
    goal.id ??
    goal.goalId ??
    null;

  return id == null ? null : String(id);
};

/**
 * Resolves supported collection response shapes.
 *
 * The preferred contract remains:
 *
 * useSavingsGoals() -> { goals: [] }
 *
 * These fallbacks prevent the page from breaking
 * during API/service migrations.
 */
const normalizeGoals = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value.goals)) {
    return value.goals;
  }

  if (Array.isArray(value.items)) {
    return value.items;
  }

  if (Array.isArray(value.results)) {
    return value.results;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  if (
    value.data &&
    typeof value.data === "object"
  ) {
    if (Array.isArray(value.data.goals)) {
      return value.data.goals;
    }

    if (Array.isArray(value.data.items)) {
      return value.data.items;
    }

    if (Array.isArray(value.data.results)) {
      return value.data.results;
    }
  }

  return [];
};

/**
 * Extracts a safe user-facing error message.
 */
const getErrorMessage = (
  error,
  fallback,
) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || fallback;
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.message ??
    error?.error;

  if (typeof message === "string") {
    const normalized = message.trim();

    return normalized || fallback;
  }

  return fallback;
};

/**
 * Normalizes goal status.
 */
const getGoalStatus = (goal) =>
  String(goal?.status ?? "")
    .trim()
    .toLowerCase();

/**
 * Resolves target amount.
 */
const getTargetAmount = (goal) =>
  Math.max(
    0,
    toFiniteNumber(
      goal?.targetAmount ??
        goal?.target ??
        goal?.amount,
    ),
  );

/**
 * Resolves saved/current amount.
 */
const getSavedAmount = (goal) =>
  Math.max(
    0,
    toFiniteNumber(
      goal?.currentAmount ??
        goal?.savedAmount ??
        goal?.amountSaved ??
        goal?.progressAmount,
    ),
  );

/**
 * Resolves the goal currency.
 */
const getGoalCurrency = (goal) =>
  String(
    goal?.currency ??
      goal?.currencyCode ??
      DEFAULT_CURRENCY,
  )
    .trim()
    .toUpperCase() || DEFAULT_CURRENCY;

/**
 * Calculates progress safely.
 */
const calculatePercentage = (
  current,
  target,
) => {
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(target) ||
    target <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (current / target) * 100,
    ),
  );
};

/**
 * Resolves the maximum number of goals
 * displayed by the page.
 */
const resolveLimit = (limit) => {
  if (
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    return null;
  }

  return Math.min(
    limit,
    MAX_DISPLAY_LIMIT,
  );
};

/* ============================================================================
   SUMMARY STAT
============================================================================ */

const SummaryStat = memo(
  ({
    label,
    value,
    icon: Icon,
  }) => (
    <div
      className="
        min-w-0
        p-4
        bg-white
        rounded-2xl border border-slate-200/80
        shadow-sm
      "
    >
      <div
        className="
          flex items-center justify-between
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              truncate text-[10px] text-slate-400 font-semibold uppercase
              tracking-[0.1em]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              truncate text-lg text-slate-950 sm:text-xl font-bold
              tracking-tight
            "
          >
            {value}
          </p>
        </div>

        {Icon ? (
          <div
            className="
              flex items-center justify-center
              h-9 w-9
              text-slate-500
              bg-slate-50
              rounded-xl
              shrink-0
            "
            aria-hidden="true"
          >
            <Icon size={17} />
          </div>
        ) : null}
      </div>
    </div>
  ),
);

SummaryStat.displayName = "SummaryStat";

/* ============================================================================
   PAGE HEADER
============================================================================ */

const GoalsHeader = memo(
  ({
    title,
    description,
    count,
    titleId,
    refreshing,
    busy,
    canCreate,
    canRefresh,
    onRefresh,
    onCreate,
  }) => (
    <header
      className="
        flex flex-col lg:flex-row lg:items-center lg:justify-between
        w-full
        gap-4
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
            flex items-center justify-center
            h-10 w-10
            text-blue-600
            bg-blue-50
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <Target size={19} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex flex-wrap items-center
              min-w-0
              gap-2
            "
          >
            <h2
              id={titleId}
              className="
                min-w-0
                break-words text-lg text-slate-950 sm:text-xl font-bold
                tracking-tight
              "
            >
              {title}
            </h2>

            <span
              className="
                inline-flex items-center
                px-2 py-0.5
                text-[11px] text-slate-600 font-semibold
                bg-slate-100
                rounded-full
                shrink-0
              "
            >
              {count}
            </span>
          </div>

          {description ? (
            <p
              className="
                max-w-2xl
                mt-1
                text-sm text-slate-500 leading-5
              "
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {(canRefresh || canCreate) ? (
        <div
          className="
            grid grid-cols-1 sm:flex sm:flex-row
            w-full sm:w-auto
            gap-2
          "
        >
          {canRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy}
              className="
                inline-flex items-center justify-center
                h-10 w-full sm:w-auto
                px-4
                text-sm text-slate-700 font-semibold
                bg-white hover:bg-slate-50
                rounded-xl border border-slate-200 focus:outline-none
                focus:ring-2 focus:ring-slate-300
                shadow-sm transition disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : undefined
                }
                aria-hidden="true"
              />

              <span>
                {refreshing
                  ? "Refreshing"
                  : "Refresh"}
              </span>
            </button>
          ) : null}

          {canCreate ? (
            <button
              type="button"
              onClick={onCreate}
              disabled={busy}
              className="
                inline-flex items-center justify-center
                h-10 w-full sm:w-auto
                px-4
                text-sm text-white font-semibold
                bg-slate-950 hover:bg-slate-800
                rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400
                shadow-sm transition disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Plus
                size={16}
                aria-hidden="true"
              />

              <span>New goal</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  ),
);

GoalsHeader.displayName = "GoalsHeader";

/* ============================================================================
   LOADING STATE
============================================================================ */

const GoalsLoadingState = memo(() => (
  <section
    aria-busy="true"
    aria-label="Loading savings goals"
    className="
      mt-5
    "
  >
    <div
      className="
        grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
        gap-4
      "
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            min-w-0
            p-4 sm:p-5
            bg-white
            rounded-2xl border border-slate-100
            shadow-sm
          "
        >
          <div
            className="
              flex items-start justify-between
              gap-3
            "
          >
            <div
              className="
                flex-1
                min-w-0
              "
            >
              <div
                className="
                  h-4 w-2/3
                  bg-slate-100
                  rounded
                "
                /
              >

              <div
                className="
                  h-3 w-1/2
                  mt-2
                  bg-slate-100
                  rounded
                "
                /
              >
            </div>

            <div
              className="
                h-8 w-16
                bg-slate-100
                rounded-full
                shrink-0
              "
              /
            >
          </div>

          <div
            className="
              h-9 w-3/4
              mt-5
              bg-slate-100
              rounded-lg
            "
            /
          >

          <div
            className="
              h-2 w-full
              mt-4
              bg-slate-100
              rounded-full
            "
            /
          >

          <div
            className="
              flex justify-between
              mt-3
              gap-4
            "
          >
            <div
              className="
                h-3 w-1/3
                bg-slate-100
                rounded
              "
              /
            >

            <div
              className="
                h-3 w-1/4
                bg-slate-100
                rounded
              "
              /
            >
          </div>

          <div
            className="
              h-9 w-full
              mt-5
              bg-slate-100
              rounded-xl
            "
            /
          >
        </div>
      ))}
    </div>
  </section>
));

GoalsLoadingState.displayName =
  "GoalsLoadingState";

/* ============================================================================
   ERROR STATE
============================================================================ */

const ErrorState = memo(
  ({
    message,
    onRetry,
    loading,
  }) => (
    <div
      className="
        mt-5 p-4 sm:p-5
        bg-red-50
        rounded-2xl border border-red-200
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
          size={19}
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
              text-sm text-red-900 font-semibold
            "
          >
            Unable to load savings goals
          </p>

          <p
            className="
              mt-1
              text-sm text-red-700 leading-5
            "
          >
            {message}
          </p>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="
                inline-flex items-center
                mt-3
                text-sm text-red-800 font-semibold underline underline-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : undefined
                }
                aria-hidden="true"
              />

              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  ),
);

ErrorState.displayName = "ErrorState";

/* ============================================================================
   MUTATION ERROR
============================================================================ */

const MutationError = memo(
  ({
    message,
    onDismiss,
  }) => {
    if (!message) {
      return null;
    }

    return (
      <div
        className="
          flex items-start
          mt-4 p-4
          bg-red-50
          rounded-2xl border border-red-200
          gap-3
        "
        role="alert"
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
              text-sm text-red-900 font-semibold
            "
          >
            Action could not be completed
          </p>

          <p
            className="
              mt-1
              text-sm text-red-700 leading-5
            "
          >
            {message}
          </p>
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="
              text-xs text-red-700 hover:text-red-900 font-semibold
              shrink-0
            "
          >
            Dismiss
          </button>
        ) : null}
      </div>
    );
  },
);

MutationError.displayName =
  "MutationError";

/* ============================================================================
   BACKGROUND REFRESH NOTICE
============================================================================ */

const BackgroundRefreshNotice = memo(
  ({
    message,
    canRefresh,
    loading,
    onRetry,
  }) => {
    if (!message) {
      return null;
    }

    return (
      <div
        className="
          flex flex-col sm:flex-row sm:items-start sm:justify-between
          mt-4 p-4
          bg-amber-50
          rounded-2xl border border-amber-200
          gap-3
        "
        role="status"
      >
        <div
          className="
            flex items-start
            min-w-0
            gap-3
          "
        >
          <AlertCircle
            size={17}
            className="
              mt-0.5
              text-amber-600
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
                text-sm text-amber-900 font-semibold
              "
            >
              Your goals may be out of date
            </p>

            <p
              className="
                mt-1
                text-sm text-amber-700 leading-5
              "
            >
              {message}
            </p>
          </div>
        </div>

        {canRefresh ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="
              self-start
              text-sm text-amber-800 hover:text-amber-950 font-semibold
              underline underline-offset-2
              disabled:opacity-50
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  },
);

BackgroundRefreshNotice.displayName =
  "BackgroundRefreshNotice";

/* ============================================================================
   GOAL GRID
============================================================================ */

const SavingsGoalsGrid = memo(
  ({
    goals,
    onSelect,
    onEdit,
    onDelete,
  }) => {
    if (!goals.length) {
      return null;
    }

    return (
      <div
        className="
          grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
          mt-5
          gap-4 sm:gap-5 2xl:gap-6
        "
      >
        {goals.map((goal) => {
          const goalId = getGoalId(goal);

          if (!goalId) {
            return null;
          }

          return (
            <SavingsGoalCard
              key={goalId}
              goal={goal}
              onView={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    );
  },
);

SavingsGoalsGrid.displayName =
  "SavingsGoalsGrid";

/* ============================================================================
   OVERALL PROGRESS
============================================================================ */

const OverallProgress = memo(
  ({
    progress,
    currency,
  }) => {
    if (progress == null) {
      return null;
    }

    const percentage = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          toFiniteNumber(progress),
        ),
      ),
    );

    return (
      <section
        className="
          mt-4 p-4 sm:p-5
          bg-white
          rounded-2xl border border-slate-200/80
          shadow-sm
        "
        aria-label="Overall savings progress"
      >
        <div
          className="
            flex items-center justify-between
            gap-3
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-sm text-slate-900 font-semibold
              "
            >
              Overall savings progress
            </p>

            <p
              className="
                mt-0.5
                text-xs text-slate-500
              "
            >
              Across your current goals
              {currency
                ? ` · ${currency}`
                : ""}
            </p>
          </div>

          <span
            className="
              text-sm text-slate-900 font-bold tabular-nums
              shrink-0
            "
          >
            {percentage}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Overall savings progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="
            overflow-hidden
            h-2
            mt-3
            bg-slate-100
            rounded-full
          "
        >
          <div
            aria-hidden="true"
            className="
              h-full
              bg-slate-900
              rounded-full
              transition-[width] duration-500
            "
            style={{
              width: `${percentage}%`,
            }}
          /
          >
        </div>
      </section>
    );
  },
);

OverallProgress.displayName =
  "OverallProgress";

/* ============================================================================
   SUMMARY
============================================================================ */

const GoalsSummary = memo(
  ({ summary }) => (
    <div
      className="
        grid grid-cols-1 sm:grid-cols-3
        mt-5
        gap-3
      "
    >
      <SummaryStat
        label="Total goals"
        value={summary.total}
        icon={Target}
      />

      <SummaryStat
        label="Active"
        value={summary.active}
        icon={WalletCards}
      />

      <SummaryStat
        label="Completed"
        value={summary.completed}
        icon={CheckCircle2}
      />
    </div>
  ),
);

GoalsSummary.displayName =
  "GoalsSummary";

/* ============================================================================
   PAGE
============================================================================ */

const SavingsGoalsPage = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  limit,
  className = "",
  allowCreate = true,
  compact = false,
  onGoalSelect,
}) => {
  /* --------------------------------------------------------------------------
     HOOK
  -------------------------------------------------------------------------- */

  const {
    goals: hookGoals = [],
    loading = false,
    error = null,
    refreshGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useSavingsGoals() || {};

  /* --------------------------------------------------------------------------
     ACCESSIBILITY
  -------------------------------------------------------------------------- */

  const titleId = useId();

  /* --------------------------------------------------------------------------
     LOCAL UI STATE
  -------------------------------------------------------------------------- */

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState(null);

  const [deletingGoal, setDeletingGoal] =
    useState(null);

  const [action, setAction] =
    useState(null);

  const [mutationError, setMutationError] =
    useState(null);

  /* --------------------------------------------------------------------------
     NORMALIZED GOALS
  -------------------------------------------------------------------------- */

  const goals = useMemo(() => {
    return normalizeGoals(hookGoals).filter(
      (goal) =>
        goal &&
        typeof goal === "object" &&
        Boolean(getGoalId(goal)),
    );
  }, [hookGoals]);

  /* --------------------------------------------------------------------------
     DISPLAY LIMIT
  -------------------------------------------------------------------------- */

  const resolvedLimit = useMemo(
    () => resolveLimit(limit),
    [limit],
  );

  const visibleGoals = useMemo(() => {
    if (!resolvedLimit) {
      return goals;
    }

    return goals.slice(
      0,
      resolvedLimit,
    );
  }, [
    goals,
    resolvedLimit,
  ]);

  /* --------------------------------------------------------------------------
     SUMMARY
  -------------------------------------------------------------------------- */

  const summary = useMemo(() => {
    let active = 0;
    let completed = 0;

    let totalTarget = 0;
    let totalSaved = 0;

    const currencies = new Set();

    for (const goal of goals) {
      const status =
        getGoalStatus(goal);

      const target =
        getTargetAmount(goal);

      const saved =
        getSavedAmount(goal);

      const currency =
        getGoalCurrency(goal);

      currencies.add(currency);

      totalTarget += target;
      totalSaved += Math.min(
        saved,
        target > 0
          ? target
          : saved,
      );

      const completedByAmount =
        target > 0 &&
        saved >= target;

      if (
        status === "completed" ||
        completedByAmount
      ) {
        completed += 1;
      } else if (
        status === "active"
      ) {
        active += 1;
      }
    }

    /*
     * Aggregate monetary progress is only
     * meaningful when every goal uses the
     * same currency.
     */
    const canAggregateProgress =
      currencies.size <= 1;

    return {
      total: goals.length,
      active,
      completed,
      totalTarget,
      totalSaved,
      currency:
        currencies.size === 1
          ? [...currencies][0]
          : null,
      progress:
        canAggregateProgress
          ? calculatePercentage(
              totalSaved,
              totalTarget,
            )
          : null,
    };
  }, [goals]);

  /* --------------------------------------------------------------------------
     ERRORS
  -------------------------------------------------------------------------- */

  const loadErrorMessage =
    getErrorMessage(
      error,
      DEFAULT_LOAD_ERROR,
    );

  const mutationErrorMessage =
    getErrorMessage(
      mutationError,
      DEFAULT_MUTATION_ERROR,
    );

  /* --------------------------------------------------------------------------
     ACTION CAPABILITIES
  -------------------------------------------------------------------------- */

  const mutationInProgress =
    action !== null;

  const canRefresh =
    typeof refreshGoals ===
    "function";

  const canCreate =
    Boolean(allowCreate) &&
    typeof createGoal ===
      "function";

  const canEdit =
    typeof updateGoal ===
    "function";

  const canDelete =
    typeof deleteGoal ===
    "function";

  const busy =
    Boolean(loading) ||
    mutationInProgress;

  /* --------------------------------------------------------------------------
     REFRESH
  -------------------------------------------------------------------------- */

  const handleRefresh =
    useCallback(async () => {
      if (
        busy ||
        !canRefresh
      ) {
        return;
      }

      setMutationError(null);

      try {
        await refreshGoals();
      } catch {
        /*
         * useSavingsGoals owns the canonical
         * loading/error state.
         */
      }
    }, [
      busy,
      canRefresh,
      refreshGoals,
    ]);

  /* --------------------------------------------------------------------------
     CREATE
  -------------------------------------------------------------------------- */

  const handleOpenCreate =
    useCallback(() => {
      if (
        busy ||
        !canCreate
      ) {
        return;
      }

      setMutationError(null);
      setCreateOpen(true);
    }, [
      busy,
      canCreate,
    ]);

  const handleCloseCreate =
    useCallback(() => {
      if (action === "create") {
        return;
      }

      setCreateOpen(false);
    }, [action]);

  const handleCreate =
    useCallback(
      async (payload) => {
        if (mutationInProgress) {
          return;
        }

        if (!canCreate) {
          const errorValue =
            new Error(
              "Savings goal creation is currently unavailable.",
            );

          setMutationError(errorValue);
          throw errorValue;
        }

        setMutationError(null);
        setAction("create");

        try {
          const result =
            await createGoal(
              payload,
            );

          setCreateOpen(false);

          return result;
        } catch (createError) {
          setMutationError(
            createError,
          );

          throw createError;
        } finally {
          setAction(null);
        }
      },
      [
        canCreate,
        createGoal,
        mutationInProgress,
      ],
    );

  /* --------------------------------------------------------------------------
     EDIT
  -------------------------------------------------------------------------- */

  const handleEdit =
    useCallback(
      (goal) => {
        if (
          !goal ||
          busy ||
          !canEdit
        ) {
          return;
        }

        if (!getGoalId(goal)) {
          setMutationError(
            new Error(
              "This savings goal could not be identified.",
            ),
          );

          return;
        }

        setMutationError(null);
        setEditingGoal(goal);
      },
      [
        busy,
        canEdit,
      ],
    );

  const handleCloseEdit =
    useCallback(() => {
      if (action === "update") {
        return;
      }

      setEditingGoal(null);
    }, [action]);

  const handleUpdate =
    useCallback(
      async (payload) => {
        if (mutationInProgress) {
          return;
        }

        if (!canEdit) {
          const errorValue =
            new Error(
              "Savings goal updates are currently unavailable.",
            );

          setMutationError(errorValue);
          throw errorValue;
        }

        const goalId =
          getGoalId(editingGoal);

        if (!goalId) {
          const errorValue =
            new Error(
              "This savings goal could not be identified.",
            );

          setMutationError(errorValue);
          throw errorValue;
        }

        setMutationError(null);
        setAction("update");

        try {
          const result =
            await updateGoal(
              goalId,
              payload,
            );

          setEditingGoal(null);

          return result;
        } catch (updateError) {
          setMutationError(
            updateError,
          );

          throw updateError;
        } finally {
          setAction(null);
        }
      },
      [
        canEdit,
        editingGoal,
        mutationInProgress,
        updateGoal,
      ],
    );

  /* --------------------------------------------------------------------------
     DELETE REQUEST
  -------------------------------------------------------------------------- */

  const handleDeleteRequest =
    useCallback(
      (goal) => {
        if (
          !goal ||
          busy ||
          !canDelete
        ) {
          return;
        }

        if (!getGoalId(goal)) {
          setMutationError(
            new Error(
              "This savings goal could not be identified.",
            ),
          );

          return;
        }

        setMutationError(null);
        setDeletingGoal(goal);
      },
      [
        busy,
        canDelete,
      ],
    );

  const handleCloseDelete =
    useCallback(() => {
      if (action === "delete") {
        return;
      }

      setDeletingGoal(null);
    }, [action]);

  /* --------------------------------------------------------------------------
     DELETE
  -------------------------------------------------------------------------- */

  const handleDelete =
    useCallback(async () => {
      if (mutationInProgress) {
        return;
      }

      if (!canDelete) {
        const errorValue =
          new Error(
            "Savings goal deletion is currently unavailable.",
          );

        setMutationError(errorValue);
        throw errorValue;
      }

      const goalId =
        getGoalId(deletingGoal);

      if (!goalId) {
        const errorValue =
          new Error(
            "This savings goal could not be identified.",
          );

        setMutationError(errorValue);
        throw errorValue;
      }

      setMutationError(null);
      setAction("delete");

      try {
        const result =
          await deleteGoal(
            goalId,
          );

        setDeletingGoal(null);

        return result;
      } catch (deleteError) {
        setMutationError(
          deleteError,
        );

        throw deleteError;
      } finally {
        setAction(null);
      }
    }, [
      canDelete,
      deleteGoal,
      deletingGoal,
      mutationInProgress,
    ]);

  /* --------------------------------------------------------------------------
     DERIVED UI STATES
  -------------------------------------------------------------------------- */

  const initialLoading =
    Boolean(loading) &&
    goals.length === 0;

  const initialLoadFailed =
    !loading &&
    goals.length === 0 &&
    Boolean(loadErrorMessage);

  const showEmptyState =
    !loading &&
    !loadErrorMessage &&
    goals.length === 0;

  const backgroundRefreshing =
    Boolean(loading) &&
    goals.length > 0;

  /* --------------------------------------------------------------------------
     RENDER
  -------------------------------------------------------------------------- */

  return (
    <>
      <section
        className={`
          w-full
          min-w-0
          ${className}
        `.trim()}
        aria-labelledby={titleId}
        aria-busy={busy}
      >
        <GoalsHeader
          title={title}
          description={description}
          count={summary.total}
          titleId={titleId}
          refreshing={Boolean(loading)}
          busy={busy}
          canCreate={canCreate}
          canRefresh={canRefresh}
          onRefresh={handleRefresh}
          onCreate={handleOpenCreate}
        />

        <MutationError
          message={mutationErrorMessage}
          onDismiss={() =>
            setMutationError(null)
          }
        />

        {initialLoading ? (
          <GoalsLoadingState />
        ) : null}

        {initialLoadFailed ? (
          <ErrorState
            message={loadErrorMessage}
            onRetry={
              canRefresh
                ? handleRefresh
                : undefined
            }
            loading={Boolean(
              loading,
            )}
          />
        ) : null}

        {goals.length > 0 &&
        !loading ? (
          <BackgroundRefreshNotice
            message={loadErrorMessage}
            canRefresh={canRefresh}
            loading={Boolean(
              loading,
            )}
            onRetry={handleRefresh}
          />
        ) : null}

        {!compact &&
        goals.length > 0 ? (
          <GoalsSummary
            summary={summary}
          />
        ) : null}

        {!compact &&
        goals.length > 0 &&
        summary.progress != null ? (
          <OverallProgress
            progress={
              summary.progress
            }
            currency={
              summary.currency
            }
          />
        ) : null}

        {showEmptyState ? (
          <div
            className="
              mt-5
            "
          >
            <SavingsGoalEmptyState
              onCreate={
                canCreate
                  ? handleOpenCreate
                  : undefined
              }
            />
          </div>
        ) : null}

        <SavingsGoalsGrid
          goals={visibleGoals}
          onSelect={onGoalSelect}
          onEdit={
            canEdit
              ? handleEdit
              : undefined
          }
          onDelete={
            canDelete
              ? handleDeleteRequest
              : undefined
          }
        />

        {resolvedLimit &&
        goals.length >
          visibleGoals.length ? (
          <p
            className="
              mt-4 px-4
              text-center text-xs text-slate-400
            "
          >
            Showing the first{" "}
            {visibleGoals.length}{" "}
            goals.
          </p>
        ) : null}

        {backgroundRefreshing ? (
          <div
            className="
              flex items-center justify-center
              mt-4 px-4
              text-center text-xs text-slate-400
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

            Updating your savings
            goals…
          </div>
        ) : null}
      </section>

      {createOpen ? (
        <CreateSavingsGoalModal
          open={createOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          loading={
            action === "create"
          }
        />
      ) : null}

      {editingGoal ? (
        <EditSavingsGoalModal
          open={Boolean(
            editingGoal,
          )}
          goal={editingGoal}
          onClose={handleCloseEdit}
          onSubmit={handleUpdate}
          loading={
            action === "update"
          }
        />
      ) : null}

      {deletingGoal ? (
        <DeleteSavingsGoalModal
          open={Boolean(
            deletingGoal,
          )}
          goal={deletingGoal}
          onClose={handleCloseDelete}
          onConfirm={handleDelete}
          loading={
            action === "delete"
          }
        />
      ) : null}
    </>
  );
};

SavingsGoalsPage.displayName =
  "SavingsGoalsPage";

export default memo(
  SavingsGoalsPage,
);