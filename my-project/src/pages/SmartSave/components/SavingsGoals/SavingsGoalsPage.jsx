import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  TrendingUp,
  Target,
  WalletCards,
} from "lucide-react";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
 * Convert a value into a finite number.
 */
const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Resolve the canonical goal identifier.
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
 * Extract goals from the supported SmartSave response shapes.
 *
 * The hook should ideally already normalize this,
 * but this defensive boundary prevents UI crashes if
 * an older response wrapper reaches the page.
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
    typeof value.data === "object" &&
    Array.isArray(value.data.goals)
  ) {
    return value.data.goals;
  }

  if (
    value.data &&
    typeof value.data === "object" &&
    Array.isArray(value.data.items)
  ) {
    return value.data.items;
  }

  return [];
};

/**
 * Extract a safe user-facing error message.
 */
const getErrorMessage = (
  error,
  fallback
) => {
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
    return message.trim() || fallback;
  }

  return fallback;
};

/**
 * Resolve normalized goal status.
 */
const getGoalStatus = (goal) =>
  String(goal?.status ?? "")
    .trim()
    .toLowerCase();

/**
 * Resolve target amount.
 */
const getTargetAmount = (goal) =>
  toFiniteNumber(
    goal?.targetAmount ??
      goal?.target ??
      goal?.amount
  );

/**
 * Resolve saved amount.
 */
const getSavedAmount = (goal) =>
  toFiniteNumber(
    goal?.currentAmount ??
      goal?.savedAmount ??
      goal?.amountSaved ??
      goal?.progressAmount
  );

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
 * Determine whether a goal is usable by the UI.
 */
const isValidGoal = (goal) =>
  Boolean(getGoalId(goal));

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
 * Calculate safe percentage.
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
  }) => (
    <div
      className="
        min-w-0
        p-4
        bg-white
        border border-slate-200/80 rounded-2xl
        shadow-sm
      "
    >
      <div
        className="
          flex justify-between items-start
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
              font-semibold text-[11px] text-slate-400 truncate uppercase
              tracking-[0.08em]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-xl truncate tracking-tight
            "
          >
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-500
              bg-slate-50
              rounded-xl
              shrink-0
            "
            aria-hidden="true"
          >
            <Icon size={17} />
          </div>
        )}
      </div>
    </div>
  )
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
  }) => (
    <header
      className="
        flex flex-col lg:flex-row lg:justify-between lg:items-center
        gap-4
      "
    >
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
            w-10 h-10
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
              flex items-center
              gap-2
            "
          >
            <h2
              id="savings-goals-title"
              className="
                font-bold text-slate-950 text-lg truncate tracking-tight
              "
            >
              {title}
            </h2>

            <span
              className="
                px-2 py-0.5
                font-semibold text-[11px] text-slate-600
                bg-slate-100
                rounded-full
                shrink-0
              "
            >
              {count}
            </span>
          </div>

          {description && (
            <p
              className="
                max-w-2xl
                mt-1
                text-slate-500 text-sm leading-5
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div
        className="
          flex
          w-full sm:w-auto
          gap-2
        "
      >
        {canRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="
              inline-flex flex-1 sm:flex-none justify-center items-center
              h-10
              px-3
              font-semibold text-slate-700 text-sm
              bg-white hover:bg-slate-50
              border border-slate-200 rounded-xl
              disabled:opacity-60 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
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
              className="
                hidden sm:inline
              "
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
            className="
              inline-flex flex-1 sm:flex-none justify-center items-center
              h-10
              px-4
              font-semibold text-white text-sm
              bg-slate-950 hover:bg-slate-800
              rounded-xl
              disabled:opacity-60 transition
              disabled:cursor-not-allowed
              gap-2
            "
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
  )
);

GoalsHeader.displayName = "GoalsHeader";

/* =========================================================
   LOADING STATE
========================================================= */

const GoalsLoadingState = memo(() => (
  <section
    className="
      w-full
    "
    aria-busy="true"
    aria-label="Loading savings goals"
  >
    <div
      className="
        flex flex-col sm:flex-row sm:justify-between sm:items-center
        gap-4
      "
    >
      <div>
        <div
          className="
            w-40 h-6
            bg-slate-200
            rounded-lg
            animate-pulse
          "
          /
        >

        <div
          className="
            w-72 max-w-full h-4
            mt-2
            bg-slate-100
            rounded
            animate-pulse
          "
          /
        >
      </div>

      <div
        className="
          w-full sm:w-32 h-10
          bg-slate-100
          rounded-xl
          animate-pulse
        "
        /
      >
    </div>

    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
        mt-5
        gap-4
      "
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            min-h-[240px]
            p-5
            bg-white
            border border-slate-100 rounded-2xl
            shadow-sm
          "
        >
          <div
            className="
              w-10 h-10
              bg-slate-100
              rounded-xl
              animate-pulse
            "
            /
          >

          <div
            className="
              w-2/3 h-5
              mt-5
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >

          <div
            className="
              w-full h-3
              mt-3
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >

          <div
            className="
              w-4/5 h-3
              mt-2
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >

          <div
            className="
              w-full h-2
              mt-7
              bg-slate-100
              rounded-full
              animate-pulse
            "
            /
          >

          <div
            className="
              w-full h-10
              mt-5
              bg-slate-100
              rounded-xl
              animate-pulse
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

/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = memo(
  ({
    message,
    onRetry,
    loading,
  }) => (
    <div
      className="
        mt-5 p-5
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
              font-semibold text-red-900 text-sm
            "
          >
            Unable to load savings goals
          </p>

          <p
            className="
              mt-1
              text-red-700 text-sm leading-5
            "
          >
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="
                inline-flex items-center
                mt-3
                font-semibold text-red-800 text-sm underline underline-offset-2
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
          )}
        </div>
      </div>
    </div>
  )
);

ErrorState.displayName = "ErrorState";

/* =========================================================
   COMPONENT
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
     SMARTSAVE SERVER STATE
  ======================================================= */

  const savingsGoals = useSavingsGoals();

  const {
    goals: hookGoals,
    loading: hookLoading,
    error: hookError,
    fetchGoals,
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

  /*
   * This ref is intentionally UI-local.
   *
   * It prevents an unstable fetchGoals function reference
   * from causing repeated initial requests.
   */
  const initialFetchStarted =
    useRef(false);

  /* =======================================================
     NORMALIZED GOALS
  ======================================================= */

  const goals = useMemo(
    () =>
      normalizeGoals(hookGoals).filter(
        isValidGoal
      ),
    [hookGoals]
  );

  const resolvedLimit = useMemo(
    () => resolveLimit(limit),
    [limit]
  );

  const visibleGoals = useMemo(() => {
    if (!resolvedLimit) {
      return goals;
    }

    return goals.slice(
      0,
      resolvedLimit
    );
  }, [goals, resolvedLimit]);

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    if (initialFetchStarted.current) {
      return;
    }

    if (typeof fetchGoals !== "function") {
      return;
    }

    initialFetchStarted.current = true;

    /*
     * Do not set React state synchronously from this effect.
     * The hook owns loading/error state.
     */
    void Promise.resolve(
      fetchGoals()
    ).catch(() => {
      /*
       * useSavingsGoals owns the request error.
       */
    });
  }, [fetchGoals]);

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const loading = Boolean(hookLoading);

  const loadErrorMessage = useMemo(
    () =>
      getErrorMessage(
        hookError,
        DEFAULT_LOAD_ERROR
      ),
    [hookError]
  );

  const mutationErrorMessage = useMemo(
    () =>
      getErrorMessage(
        mutationError,
        DEFAULT_MUTATION_ERROR
      ),
    [mutationError]
  );

  const summary = useMemo(() => {
    let active = 0;
    let completed = 0;
    let paused = 0;

    let totalTarget = 0;
    let totalSaved = 0;

    for (const goal of goals) {
      const status =
        getGoalStatus(goal);

      const target =
        getTargetAmount(goal);

      const saved =
        getSavedAmount(goal);

      totalTarget += target;
      totalSaved += saved;

      switch (status) {
        case "active":
          active += 1;
          break;

        case "completed":
          completed += 1;
          break;

        case "paused":
          paused += 1;
          break;

        default:
          break;
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

  const canRefresh =
    typeof refreshGoals === "function" ||
    typeof fetchGoals === "function";

  const mutationInProgress =
    action !== null;

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(
    async () => {
      if (mutationInProgress) {
        return;
      }

      const refresh =
        typeof refreshGoals === "function"
          ? refreshGoals
          : fetchGoals;

      if (typeof refresh !== "function") {
        return;
      }

      setMutationError(null);

      try {
        await refresh();
      } catch {
        /*
         * Server request errors belong to
         * useSavingsGoals.
         */
      }
    },
    [
      refreshGoals,
      fetchGoals,
      mutationInProgress,
    ]
  );

  /* =======================================================
     CREATE
  ======================================================= */

  const handleOpenCreate = useCallback(() => {
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

  const handleCloseCreate = useCallback(() => {
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

      setMutationError(null);
      setAction("create");

      try {
        const result =
          await createGoal(payload);

        setCreateOpen(false);

        /*
         * The hook should update its local state after
         * successful creation. We intentionally do not
         * force another request here.
         */

        return result;
      } catch (error) {
        setMutationError(error);
        throw error;
      } finally {
        setAction(null);
      }
    },
    [createGoal]
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

      if (!getGoalId(goal)) {
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

  const handleCloseEdit = useCallback(() => {
    if (action === "update") {
      return;
    }

    setEditingGoal(null);
  }, [action]);

  const handleUpdate = useCallback(
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

        if (!getGoalId(goal)) {
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
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    goals.length === 0 &&
    !loadErrorMessage
  ) {
    return (
      <div className={className}>
        <GoalsLoadingState />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <section
        className={`w-full ${className}`}
        aria-labelledby="savings-goals-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            MUTATION ERROR
        ================================================= */}

        {mutationErrorMessage && (
          <div
            className="
              flex items-start
              mt-4 p-4
              bg-red-50
              border border-red-200 rounded-2xl
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
                  font-semibold text-red-900 text-sm
                "
              >
                Action could not be completed
              </p>

              <p
                className="
                  mt-1
                  text-red-700 text-sm
                "
              >
                {mutationErrorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMutationError(null)
              }
              className="font-semibold text-red-700 hover:text-red-900 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =================================================
            INITIAL LOAD ERROR
        ================================================= */}

        {loadErrorMessage &&
          goals.length === 0 && (
            <ErrorState
              message={
                loadErrorMessage
              }
              onRetry={
                canRefresh
                  ? handleRefresh
                  : undefined
              }
              loading={loading}
            />
          )}

        {/* =================================================
            BACKGROUND REFRESH ERROR
        ================================================= */}

        {loadErrorMessage &&
          goals.length > 0 && (
            <div
              className="
                flex items-start
                mt-4 p-4
                bg-amber-50
                border border-amber-200 rounded-2xl
                gap-3
              "
              role="status"
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
                  flex-1
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-amber-900 text-sm
                  "
                >
                  Your goals may be out of date
                </p>

                <p
                  className="
                    mt-1
                    text-amber-700 text-sm
                  "
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
                  className="
                    font-semibold text-amber-800 hover:text-amber-950 text-sm
                    underline
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Retry
                </button>
              )}
            </div>
          )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        {!compact &&
          goals.length > 0 && (
            <div
              className="
                grid grid-cols-2 lg:grid-cols-4
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
                value={
                  summary.completed
                }
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

        {/* =================================================
            OVERALL PROGRESS
        ================================================= */}

        {!compact &&
          goals.length > 0 && (
            <div
              className="
                mt-4 p-4
                bg-white
                border border-slate-200/80 rounded-2xl
                shadow-sm
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
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Overall savings progress
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-slate-500 text-xs
                    "
                  >
                    Across your current savings goals
                  </p>
                </div>

                <span
                  className="
                    font-bold tabular-nums text-slate-900 text-sm
                  "
                >
                  {Math.round(
                    summary.progress
                  )}
                  %
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
                aria-valuenow={Math.round(
                  summary.progress
                )}
                aria-label="Overall savings progress"
              >
                <div
                  className="
                    h-full
                    bg-slate-900
                    rounded-full
                    transition-[width] duration-500
                  "
                  style={{
                    width: `${summary.progress}%`,
                  }}
                /
                >
              </div>
            </div>
          )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {goals.length === 0 &&
          !loadErrorMessage &&
          !loading && (
            <div
              className="
                mt-5
              "
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

        {/* =================================================
            GOALS
        ================================================= */}

        {visibleGoals.length > 0 && (
          <div
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
              mt-5
              gap-4
            "
          >
            {visibleGoals.map(
              (goal) => {
                const goalId =
                  getGoalId(goal);

                /*
                 * Every valid goal must have an ID.
                 * The filter above guarantees this.
                 */
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

                return (
                  <div
                    key={goalId}
                    className="
                      overflow-hidden
                      min-w-0
                      bg-white
                      border border-slate-200/80 hover:border-slate-300
                      rounded-2xl
                      shadow-sm hover:shadow-md transition
                    "
                  >
                    <SavingsGoalCard
                      goal={goal}
                      compact={compact}
                      onClick={
                        onGoalSelect
                      }
                      onEdit={handleEdit}
                      onDelete={
                        handleDeleteRequest
                      }
                    />

                    <div
                      className="
                        px-4 py-4
                        border-slate-100 border-t
                      "
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
                        isCompleted={
                          getGoalStatus(
                            goal
                          ) ===
                            "completed" ||
                          currentAmount >=
                            targetAmount
                        }
                        showAmounts
                        showPercentage
                        showRemaining
                        showStatus
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* =================================================
            LIMIT
        ================================================= */}

        {resolvedLimit &&
          goals.length >
            visibleGoals.length && (
            <p
              className="
                mt-4
                text-slate-400 text-xs text-center
              "
            >
              Showing{" "}
              {visibleGoals.length} of{" "}
              {goals.length} savings goals.
            </p>
          )}

        {/* =================================================
            BACKGROUND LOADING
        ================================================= */}

        {loading &&
          goals.length > 0 && (
            <div
              className="
                flex justify-center items-center
                mt-4
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

              Updating your savings goals…
            </div>
          )}
      </section>

      {/* ===================================================
          CREATE MODAL
      =================================================== */}

      {createOpen && (
        <CreateSavingsGoalModal
          open={createOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          loading={
            action === "create"
          }
        />
      )}

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editingGoal && (
        <EditSavingsGoalModal
          open={Boolean(
            editingGoal
          )}
          goal={editingGoal}
          onClose={handleCloseEdit}
          onSubmit={handleUpdate}
          loading={
            action === "update"
          }
        />
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingGoal && (
        <DeleteSavingsGoalModal
          open={Boolean(
            deletingGoal
          )}
          goal={deletingGoal}
          onClose={handleCloseDelete}
          onConfirm={handleDelete}
          loading={
            action === "delete"
          }
        />
      )}
    </>
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsGoalsPage
);