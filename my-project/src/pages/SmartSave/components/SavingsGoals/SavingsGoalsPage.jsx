import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import useSavingsGoals from "../../../../hooks/useSavingsGoals";

import SavingsGoalCard from "./SavingsGoalCard";
import SavingsGoalEmptyState from "./SavingsGoalEmptyState";
import SavingsGoalProgress from "./SavingsGoalProgress";
import CreateSavingsGoalModal from "./CreateSavingsGoalModal";
import EditSavingsGoalModal from "./EditSavingsGoalModal";
import DeleteSavingsGoalModal from "./DeleteSavingsGoalModal";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings Goals";

const DEFAULT_DESCRIPTION =
  "Track your progress toward the things that matter most.";

const DEFAULT_LOAD_ERROR =
  "Unable to load your savings goals.";

const DEFAULT_MUTATION_ERROR =
  "We couldn't complete that action. Please try again.";

const DEFAULT_CURRENCY = "NGN";

const MAX_DISPLAY_LIMIT = 100;

/* =========================================================
   HELPERS
========================================================= */

/**
 * Convert a value to a finite number.
 */
const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Resolve the canonical savings-goal ID.
 */
const getGoalId = (goal) => {
  if (!goal) {
    return null;
  }

  if (typeof goal === "string") {
    return goal;
  }

  return (
    goal._id ??
    goal.id ??
    goal.goalId ??
    null
  );
};

/**
 * Normalize supported API response shapes.
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
 * Extract a safe user-facing error message.
 */
const getErrorMessage = (error, fallback) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || fallback;
  }

  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.message ||
    error?.error;

  if (typeof message === "string") {
    const normalized = message.trim();

    return normalized || fallback;
  }

  return fallback;
};

/**
 * Normalize goal status.
 */
const getGoalStatus = (goal) => {
  return String(goal?.status ?? "")
    .trim()
    .toLowerCase();
};

/**
 * Resolve target amount.
 */
const getTargetAmount = (goal) => {
  return toFiniteNumber(
    goal?.targetAmount ??
      goal?.target ??
      goal?.amount
  );
};

/**
 * Resolve current/saved amount.
 */
const getSavedAmount = (goal) => {
  return toFiniteNumber(
    goal?.currentAmount ??
      goal?.savedAmount ??
      goal?.amountSaved ??
      goal?.progressAmount
  );
};

/**
 * Resolve currency.
 */
const getGoalCurrency = (goal) => {
  const currency = goal?.currency;

  if (
    typeof currency !== "string" ||
    !currency.trim()
  ) {
    return DEFAULT_CURRENCY;
  }

  return currency.trim().toUpperCase();
};

/**
 * Only render goals that have a usable ID.
 */
const isValidGoal = (goal) => {
  return Boolean(getGoalId(goal));
};

/**
 * Resolve display limit.
 */
const resolveLimit = (limit) => {
  if (!Number.isInteger(limit) || limit <= 0) {
    return null;
  }

  return Math.min(
    limit,
    MAX_DISPLAY_LIMIT
  );
};

/**
 * Calculate progress safely.
 */
const calculatePercentage = (
  current,
  target
) => {
  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (current / target) * 100
    )
  );
};

/* =========================================================
   SUMMARY STAT
========================================================= */

const SummaryStat = memo(
  ({
    label,
    value,
    icon: Icon,
  }) => {
    return (
      <div
        className="bg-white shadow-sm p-4 border border-slate-200/80 rounded-2xl min-w-0"
      >
        <div
          className="flex justify-between items-start gap-3"
        >
          <div
            className="min-w-0"
          >
            <p
              className="font-semibold text-[11px] text-slate-400 truncate uppercase tracking-[0.08em]"
            >
              {label}
            </p>

            <p
              className="mt-1 font-bold text-slate-950 text-xl truncate tracking-tight"
            >
              {value}
            </p>
          </div>

          {Icon && (
            <div
              className="flex justify-center items-center bg-slate-50 rounded-xl w-9 h-9 text-slate-500 shrink-0"
              aria-hidden="true"
            >
              <Icon size={17} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

SummaryStat.displayName = "SummaryStat";

/* =========================================================
   HEADER
========================================================= */

const GoalsHeader = memo(
  ({
    title,
    description,
    count,
    loading,
    allowCreate,
    canRefresh,
    onRefresh,
    onCreate,
  }) => {
    return (
      <header
        className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4"
      >
        <div
          className="flex items-center gap-3 min-w-0"
        >
          <div
            className="flex justify-center items-center bg-blue-50 rounded-xl w-10 h-10 text-blue-600 shrink-0"
            aria-hidden="true"
          >
            <Target size={19} />
          </div>

          <div
            className="min-w-0"
          >
            <div
              className="flex items-center gap-2"
            >
              <h2
                id="savings-goals-title"
                className="font-bold text-slate-950 text-lg truncate tracking-tight"
              >
                {title}
              </h2>

              <span
                className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[11px] text-slate-600 shrink-0"
              >
                {count}
              </span>
            </div>

            {description && (
              <p
                className="mt-1 max-w-2xl text-slate-500 text-sm leading-5"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex gap-2 w-full sm:w-auto"
        >
          {canRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-60 shadow-sm px-3 border border-slate-200 rounded-xl h-10 font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : undefined
                }
                aria-hidden="true"
              />

              <span
                className="hidden sm:inline"
              >
                {loading
                  ? "Refreshing"
                  : "Refresh"}
              </span>
            </button>
          )}

          {allowCreate && (
            <button
              type="button"
              onClick={onCreate}
              disabled={loading}
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 px-4 rounded-xl h-10 font-semibold text-white text-sm transition disabled:cursor-not-allowed"
            >
              <Plus
                size={16}
                aria-hidden="true"
              />

              New goal
            </button>
          )}
        </div>
      </header>
    );
  }
);

GoalsHeader.displayName = "GoalsHeader";

/* =========================================================
   LOADING STATE
========================================================= */

const GoalsLoadingState = memo(() => {
  return (
    <section
      className="w-full"
      aria-busy="true"
      aria-label="Loading savings goals"
    >
      <div
        className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white shadow-sm p-5 border border-slate-100 rounded-2xl min-h-[240px]"
          >
            <div
              className="bg-slate-100 rounded-xl w-10 h-10 animate-pulse"
              /
            >

            <div
              className="bg-slate-100 mt-5 rounded w-2/3 h-5 animate-pulse"
              /
            >

            <div
              className="bg-slate-100 mt-3 rounded w-full h-3 animate-pulse"
              /
            >

            <div
              className="bg-slate-100 mt-2 rounded w-4/5 h-3 animate-pulse"
              /
            >

            <div
              className="bg-slate-100 mt-7 rounded-full w-full h-2 animate-pulse"
              /
            >

            <div
              className="bg-slate-100 mt-5 rounded-xl w-full h-10 animate-pulse"
              /
            >
          </div>
        ))}
      </div>
    </section>
  );
});

GoalsLoadingState.displayName =
  "GoalsLoadingState";

/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = memo(
  ({
    message,
    onRetry,
    loading,
  }) => {
    return (
      <div
        className="bg-red-50 mt-5 p-5 border border-red-200 rounded-2xl"
        role="alert"
      >
        <div
          className="flex items-start gap-3"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 text-red-600 shrink-0"
            aria-hidden="true"
          /
          >

          <div
            className="flex-1 min-w-0"
          >
            <p
              className="font-semibold text-red-900 text-sm"
            >
              Unable to load savings goals
            </p>

            <p
              className="mt-1 text-red-700 text-sm leading-5"
            >
              {message}
            </p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={loading}
                className="inline-flex items-center gap-2 disabled:opacity-50 mt-3 font-semibold text-red-800 text-sm underline underline-offset-2 disabled:cursor-not-allowed"
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
            )}
          </div>
        </div>
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";

/* =========================================================
   MUTATION ERROR
========================================================= */

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
        className="flex items-start gap-3 bg-red-50 mt-4 p-4 border border-red-200 rounded-2xl"
        role="alert"
      >
        <AlertCircle
          size={18}
          className="mt-0.5 text-red-600 shrink-0"
          aria-hidden="true"
        /
        >

        <div
          className="flex-1 min-w-0"
        >
          <p
            className="font-semibold text-red-900 text-sm"
          >
            Action could not be completed
          </p>

          <p
            className="mt-1 text-red-700 text-sm"
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="font-semibold text-red-700 hover:text-red-900 text-xs shrink-0"
        >
          Dismiss
        </button>
      </div>
    );
  }
);

MutationError.displayName =
  "MutationError";

/* =========================================================
   PAGE
========================================================= */

const SavingsGoalsPage = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  limit,
  className = "",
  allowCreate = true,
  compact = false,
  onGoalSelect,
}) => {
  /* =======================================================
     SERVER STATE

     IMPORTANT:
     This component does not use useEffect to fetch data.
     useSavingsGoals owns the server-state lifecycle.
  ======================================================= */

  const savingsGoals = useSavingsGoals();

  const {
    goals: hookGoals,
    loading: hookLoading,
    error: hookError,
    refreshGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = savingsGoals || {};

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

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

  /* =======================================================
     NORMALIZED GOALS
  ======================================================= */

  const goals = useMemo(() => {
    return normalizeGoals(hookGoals).filter(
      isValidGoal
    );
  }, [hookGoals]);

  const resolvedLimit = useMemo(() => {
    return resolveLimit(limit);
  }, [limit]);

  const visibleGoals = useMemo(() => {
    if (!resolvedLimit) {
      return goals;
    }

    return goals.slice(
      0,
      resolvedLimit
    );
  }, [
    goals,
    resolvedLimit,
  ]);

  /* =======================================================
     LOADING / ERROR STATE
  ======================================================= */

  const loading = Boolean(hookLoading);

  const loadErrorMessage = useMemo(() => {
    return getErrorMessage(
      hookError,
      DEFAULT_LOAD_ERROR
    );
  }, [hookError]);

  const mutationErrorMessage =
    useMemo(() => {
      return getErrorMessage(
        mutationError,
        DEFAULT_MUTATION_ERROR
      );
    }, [mutationError]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    let active = 0;
    let completed = 0;
    let paused = 0;

    let totalTarget = 0;
    let totalSaved = 0;

    for (const goal of goals) {
      const status = getGoalStatus(goal);

      const target =
        getTargetAmount(goal);

      const saved =
        getSavedAmount(goal);

      totalTarget += target;
      totalSaved += saved;

      if (status === "active") {
        active += 1;
      } else if (status === "completed") {
        completed += 1;
      } else if (status === "paused") {
        paused += 1;
      }
    }

    return {
      total: goals.length,
      active,
      completed,
      paused,
      totalTarget,
      totalSaved,
      progress: calculatePercentage(
        totalSaved,
        totalTarget
      ),
    };
  }, [goals]);

  /* =======================================================
     ACTION STATE
  ======================================================= */

  const mutationInProgress =
    action !== null;

  const canRefresh =
    typeof refreshGoals === "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(
    async () => {
      if (
        mutationInProgress ||
        typeof refreshGoals !== "function"
      ) {
        return;
      }

      setMutationError(null);

      try {
        await refreshGoals();
      } catch {
        // The hook owns the server error.
      }
    },
    [
      mutationInProgress,
      refreshGoals,
    ]
  );

  /* =======================================================
     CREATE
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      if (
        mutationInProgress ||
        !allowCreate
      ) {
        return;
      }

      setMutationError(null);
      setCreateOpen(true);
    }, [
      mutationInProgress,
      allowCreate,
    ]);

  const handleCloseCreate =
    useCallback(() => {
      if (action === "create") {
        return;
      }

      setCreateOpen(false);
    }, [action]);

  const handleCreate = useCallback(
  async (payload) => {
    if (typeof createGoal !== "function") {
      const error = new Error(
        "Creating savings goals is currently unavailable."
      );

      setMutationError(error);
      throw error;
    }

    if (mutationInProgress) {
      return;
    }

    const normalizedPayload =
      payload &&
      typeof payload === "object" &&
      payload.data &&
      typeof payload.data === "object"
        ? payload.data
        : payload;

    if (
      !normalizedPayload ||
      typeof normalizedPayload !== "object"
    ) {
      const error = new Error(
        "Invalid savings goal data."
      );

      setMutationError(error);
      throw error;
    }

    const name =
      typeof normalizedPayload.name === "string"
        ? normalizedPayload.name.trim()
        : "";

    const targetAmount = Number(
      normalizedPayload.targetAmount
    );

    const currency =
      typeof normalizedPayload.currency === "string"
        ? normalizedPayload.currency.trim().toUpperCase()
        : DEFAULT_CURRENCY;

    const targetDate =
      typeof normalizedPayload.targetDate === "string"
        ? normalizedPayload.targetDate.trim()
        : "";

    if (!name) {
      const error = new Error(
        "Savings goal name is required."
      );

      setMutationError(error);
      throw error;
    }

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      const error = new Error(
        "Target amount must be greater than zero."
      );

      setMutationError(error);
      throw error;
    }

    if (!targetDate) {
      const error = new Error(
        "Target date is required."
      );

      setMutationError(error);
      throw error;
    }

    const normalizedGoal = {
      name,
      targetAmount,
      currency,
      targetDate,
    };

    setMutationError(null);
    setAction("create");

    try {
      const result = await createGoal(normalizedGoal);

      setCreateOpen(false);

      return result;
    } catch (error) {
      setMutationError(error);
      throw error;
    } finally {
      setAction(null);
    }
  },
  [
    createGoal,
    mutationInProgress,
  ]
);

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = useCallback(
    (goal) => {
      if (
        !goal ||
        mutationInProgress
      ) {
        return;
      }

      const goalId = getGoalId(goal);

      if (!goalId) {
        setMutationError(
          new Error(
            "This savings goal could not be identified."
          )
        );

        return;
      }

      setMutationError(null);
      setEditingGoal(goal);
    },
    [mutationInProgress]
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
        const goalId =
          getGoalId(editingGoal);

        if (!goalId) {
          const error = new Error(
            "This savings goal could not be identified."
          );

          setMutationError(error);
          throw error;
        }

        if (
          typeof updateGoal !==
          "function"
        ) {
          const error = new Error(
            "Updating savings goals is currently unavailable."
          );

          setMutationError(error);
          throw error;
        }

        if (mutationInProgress) {
          return;
        }

        setMutationError(null);
        setAction("update");

        try {
          const result =
            await updateGoal(
              goalId,
              payload
            );

          setEditingGoal(null);

          return result;
        } catch (error) {
          setMutationError(error);
          throw error;
        } finally {
          setAction(null);
        }
      },
      [
        editingGoal,
        updateGoal,
        mutationInProgress,
      ]
    );

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteRequest =
    useCallback(
      (goal) => {
        if (
          !goal ||
          mutationInProgress
        ) {
          return;
        }

        const goalId = getGoalId(goal);

        if (!goalId) {
          setMutationError(
            new Error(
              "This savings goal could not be identified."
            )
          );

          return;
        }

        setMutationError(null);
        setDeletingGoal(goal);
      },
      [mutationInProgress]
    );

  const handleCloseDelete =
    useCallback(() => {
      if (action === "delete") {
        return;
      }

      setDeletingGoal(null);
    }, [action]);

  const handleDelete =
    useCallback(async () => {
      const goalId =
        getGoalId(deletingGoal);

      if (!goalId) {
        const error = new Error(
          "This savings goal could not be identified."
        );

        setMutationError(error);
        throw error;
      }

      if (
        typeof deleteGoal !==
        "function"
      ) {
        const error = new Error(
          "Deleting savings goals is currently unavailable."
        );

        setMutationError(error);
        throw error;
      }

      if (mutationInProgress) {
        return;
      }

      setMutationError(null);
      setAction("delete");

      try {
        const result =
          await deleteGoal(goalId);

        setDeletingGoal(null);

        return result;
      } catch (error) {
        setMutationError(error);
        throw error;
      } finally {
        setAction(null);
      }
    }, [
      deletingGoal,
      deleteGoal,
      mutationInProgress,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <section
        className={`w-full ${className}`}
        aria-labelledby="savings-goals-title"
      >
        {/* HEADER */}

        <GoalsHeader
          title={title}
          description={description}
          count={summary.total}
          loading={
            loading ||
            mutationInProgress
          }
          allowCreate={allowCreate}
          canRefresh={canRefresh}
          onRefresh={handleRefresh}
          onCreate={handleOpenCreate}
        />

        {/* MUTATION ERROR */}

        <MutationError
          message={mutationErrorMessage}
          onDismiss={() =>
            setMutationError(null)
          }
        />

        {/* INITIAL LOADING */}

        {loading &&
          goals.length === 0 &&
          !loadErrorMessage && (
            <div
              className="mt-5"
            >
              <GoalsLoadingState />
            </div>
          )}

        {/* INITIAL ERROR */}

        {loadErrorMessage &&
          goals.length === 0 && (
            <ErrorState
              message={loadErrorMessage}
              onRetry={
                canRefresh
                  ? handleRefresh
                  : undefined
              }
              loading={loading}
            />
          )}

        {/* BACKGROUND REFRESH ERROR */}

        {loadErrorMessage &&
          goals.length > 0 && (
            <div
              className="flex items-start gap-3 bg-amber-50 mt-4 p-4 border border-amber-200 rounded-2xl"
              role="status"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 text-amber-600 shrink-0"
                aria-hidden="true"
              /
              >

              <div
                className="flex-1 min-w-0"
              >
                <p
                  className="font-semibold text-amber-900 text-sm"
                >
                  Your goals may be out of date
                </p>

                <p
                  className="mt-1 text-amber-700 text-sm"
                >
                  {loadErrorMessage}
                </p>
              </div>

              {canRefresh && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={
                    loading ||
                    mutationInProgress
                  }
                  className="disabled:opacity-50 font-semibold text-amber-800 hover:text-amber-950 text-sm underline disabled:cursor-not-allowed"
                >
                  Retry
                </button>
              )}
            </div>
          )}

        {/* SUMMARY */}

        {!compact &&
          goals.length > 0 && (
            <div
              className="gap-3 grid grid-cols-2 lg:grid-cols-4 mt-5"
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

              <SummaryStat
                label="Overall progress"
                value={`${Math.round(
                  summary.progress
                )}%`}
                icon={TrendingUp}
              />
            </div>
          )}

        {/* OVERALL PROGRESS */}

        {!compact &&
          goals.length > 0 && (
            <div
              className="bg-white shadow-sm mt-4 p-4 border border-slate-200/80 rounded-2xl"
            >
              <div
                className="flex justify-between items-center gap-3"
              >
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm"
                  >
                    Overall savings progress
                  </p>

                  <p
                    className="mt-0.5 text-slate-500 text-xs"
                  >
                    Across your current savings goals
                  </p>
                </div>

                <span
                  className="font-bold tabular-nums text-slate-900 text-sm"
                >
                  {Math.round(
                    summary.progress
                  )}
                  %
                </span>
              </div>

              <div
                className="bg-slate-100 mt-3 rounded-full h-2 overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                  summary.progress
                )}
                aria-label="Overall savings progress"
              >
                <div
                  className="bg-slate-900 rounded-full h-full transition-[width] duration-500"
                  style={{
                    width: `${summary.progress}%`,
                  }}
                /
                >
              </div>
            </div>
          )}

        {/* EMPTY STATE */}

        {goals.length === 0 &&
          !loading &&
          !loadErrorMessage && (
            <div
              className="mt-5"
            >
              <SavingsGoalEmptyState
                onCreate={
                  allowCreate
                    ? handleOpenCreate
                    : undefined
                }
              />
            </div>
          )}

        {/* GOALS */}

        {visibleGoals.length > 0 && (
          <div
            className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-5"
          >
            {visibleGoals.map((goal) => {
              const goalId =
                getGoalId(goal);

              const currentAmount =
                getSavedAmount(goal);

              const targetAmount =
                getTargetAmount(goal);

              const currency =
                getGoalCurrency(goal);

              const progress =
                calculatePercentage(
                  currentAmount,
                  targetAmount
                );

              const completed =
                getGoalStatus(goal) ===
                  "completed" ||
                (
                  targetAmount > 0 &&
                  currentAmount >=
                    targetAmount
                );

              return (
                <article
                  key={goalId}
                  className="bg-white shadow-sm hover:shadow-md border border-slate-200/80 hover:border-slate-300 rounded-2xl min-w-0 overflow-hidden transition"
                >
                  <SavingsGoalCard
                    goal={goal}
                    compact={compact}
                    onClick={onGoalSelect}
                    onEdit={handleEdit}
                    onDelete={
                      handleDeleteRequest
                    }
                  />

                  <div
                    className="px-4 py-4 border-slate-100 border-t"
                  >
                    <SavingsGoalProgress
                      currentAmount={
                        currentAmount
                      }
                      targetAmount={
                        targetAmount
                      }
                      currency={currency}
                      progress={progress}
                      isCompleted={completed}
                      showAmounts
                      showPercentage
                      showRemaining
                      showStatus
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* LIMIT INFORMATION */}

        {resolvedLimit &&
          goals.length >
            visibleGoals.length && (
            <p
              className="mt-4 text-slate-400 text-xs text-center"
            >
              Showing{" "}
              {visibleGoals.length}{" "}
              of{" "}
              {goals.length}{" "}
              savings goals.
            </p>
          )}

        {/* BACKGROUND LOADING */}

        {loading &&
          goals.length > 0 && (
            <div
              className="flex justify-center items-center gap-2 mt-4 text-slate-400 text-xs"
              role="status"
              aria-live="polite"
            >
              <RefreshCw
                size={13}
                className="animate-spin"
                aria-hidden="true"
              /
              >

              Updating your savings goals…
            </div>
          )}
      </section>

      {/* CREATE MODAL */}

      {createOpen && (
        <CreateSavingsGoalModal
          open={createOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          loading={action === "create"}
        />
      )}

      {/* EDIT MODAL */}

      {editingGoal && (
        <EditSavingsGoalModal
          open={Boolean(editingGoal)}
          goal={editingGoal}
          onClose={handleCloseEdit}
          onSubmit={handleUpdate}
          loading={action === "update"}
        />
      )}

      {/* DELETE MODAL */}

      {deletingGoal && (
        <DeleteSavingsGoalModal
          open={Boolean(deletingGoal)}
          goal={deletingGoal}
          onClose={handleCloseDelete}
          onConfirm={handleDelete}
          loading={action === "delete"}
        />
      )}
    </>
  );
};

SavingsGoalsPage.displayName =
  "SavingsGoalsPage";

export default memo(SavingsGoalsPage);