import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Target,
  WalletCards,
} from "lucide-react";

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

const DEFAULT_ERROR =
  "Unable to load your savings goals.";

const DEFAULT_MUTATION_ERROR =
  "We couldn't complete that action. Please try again.";

const MAX_DISPLAY_LIMIT = 100;

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Safely convert a value to a finite number.
 *
 * This is intentionally limited to presentation-level
 * aggregation. Financial business rules remain backend-owned.
 */
const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Resolve a stable goal identifier.
 */
const getGoalId = (goal) => {
  if (!goal) {
    return null;
  }

  if (typeof goal === "string") {
    return goal;
  }

  return (
    goal?._id ??
    goal?.id ??
    goal?.goalId ??
    null
  );
};

/**
 * Resolve a collection from supported API/hook envelopes.
 *
 * The hook should ideally already return a normalized array.
 * This boundary protects the page from an unexpected envelope.
 */
const normalizeGoals = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.goals)) {
    return value.goals;
  }

  if (Array.isArray(value?.data?.goals)) {
    return value.data.goals;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

/**
 * Normalize an error into a user-facing message.
 */
const getErrorMessage = (
  error,
  fallback = DEFAULT_ERROR
) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error?.error ||
    fallback
  );
};

/**
 * Resolve a normalized goal status.
 */
const getGoalStatus = (goal) =>
  String(
    goal?.status ??
      ""
  )
    .trim()
    .toLowerCase();

/**
 * Resolve the target amount for presentation.
 *
 * Backend remains the source of truth.
 */
const getTargetAmount = (goal) =>
  toNumber(
    goal?.targetAmount ??
      goal?.target ??
      goal?.amount
  );

/**
 * Resolve the currently saved amount for presentation.
 */
const getSavedAmount = (goal) =>
  toNumber(
    goal?.currentAmount ??
      goal?.savedAmount ??
      goal?.amountSaved ??
      goal?.progressAmount
  );

/**
 * Ensure only valid entities reach child components.
 */
const isRenderableGoal = (goal) =>
  Boolean(
    goal &&
      getGoalId(goal)
  );

/**
 * Safely clamp a display limit.
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
    MAX_DISPLAY_LIMIT
  );
};

/* =========================================================
   SUMMARY STAT CARD
========================================================= */

const SummaryStat = memo(
  ({
    label,
    value,
    icon: Icon,
    subtle = false,
  }) => (
    <div
      className="
        min-w-0
        px-4 py-4
        bg-white
        rounded-2xl border border-slate-200/80
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
            min-w-0
          "
        >
          <p
            className="
              truncate text-[11px] text-slate-400 font-semibold uppercase
              tracking-[0.08em]
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-xl font-bold
              tracking-tight
              ${
                subtle
                  ? "text-slate-700"
                  : "text-slate-950"
              }
            `}
          >
            {value}
          </p>
        </div>

        {Icon && (
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
        )}
      </div>
    </div>
  )
);

SummaryStat.displayName = "SummaryStat";

/* =========================================================
   PAGE HEADER
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
        className="
          flex flex-col lg:flex-row lg:items-center lg:justify-between
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
              <Target
                size={19}
                strokeWidth={2}
              />
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
                    truncate text-lg text-slate-950 font-bold tracking-tight
                  "
                >
                  {title}
                </h2>

                {typeof count === "number" && (
                  <span
                    className="
                      px-2 py-0.5
                      text-[11px] text-slate-600 font-semibold
                      bg-slate-100
                      rounded-full
                      shrink-0
                    "
                    aria-label={`${count} savings goals`}
                  >
                    {count}
                  </span>
                )}
              </div>

              {description && (
                <p
                  className="
                    max-w-2xl
                    mt-1
                    text-sm text-slate-500 leading-5
                  "
                >
                  {description}
                </p>
              )}
            </div>
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
                inline-flex flex-1 sm:flex-none items-center justify-center
                h-10
                px-3
                text-sm text-slate-700 font-semibold
                bg-white hover:bg-slate-50
                rounded-xl border border-slate-200 hover:border-slate-300
                focus:outline-none
                focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-2
                shadow-sm transition disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
              aria-label={
                loading
                  ? "Refreshing savings goals"
                  : "Refresh savings goals"
              }
            >
              <RefreshCw
                size={15}
                className={
                  loading
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
              className="
                inline-flex flex-1 sm:flex-none items-center justify-center
                h-10
                px-4
                text-sm text-white font-semibold
                bg-slate-950 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-950 focus:ring-offset-2
                shadow-sm transition
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
    );
  }
);

GoalsHeader.displayName = "GoalsHeader";

/* =========================================================
   INITIAL LOADING SKELETON
========================================================= */

const GoalsLoadingState = memo(
  ({
    allowCreate,
  }) => (
    <section
      className="
        w-full
      "
      aria-busy="true"
      aria-label="Loading savings goals"
    >
      <div
        className="
          flex flex-col sm:flex-row sm:items-center sm:justify-between
          gap-4
        "
      >
        <div>
          <div
            className="
              h-6 w-40
              bg-slate-200
              rounded-lg
              animate-pulse
            "
            /
          >

          <div
            className="
              h-4 w-72 max-w-full
              mt-2
              bg-slate-100
              rounded
              animate-pulse
            "
            /
          >
        </div>

        {allowCreate && (
          <div
            className="
              h-10 w-full sm:w-32
              bg-slate-100
              rounded-xl
              animate-pulse
            "
            /
          >
        )}
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
              rounded-2xl border border-slate-100
              shadow-sm
            "
          >
            <div
              className="
                h-10 w-10
                bg-slate-100
                rounded-xl
                animate-pulse
              "
              /
            >

            <div
              className="
                h-5 w-2/3
                mt-5
                bg-slate-100
                rounded
                animate-pulse
              "
              /
            >

            <div
              className="
                h-3 w-full
                mt-3
                bg-slate-100
                rounded
                animate-pulse
              "
              /
            >

            <div
              className="
                h-3 w-4/5
                mt-2
                bg-slate-100
                rounded
                animate-pulse
              "
              /
            >

            <div
              className="
                h-2 w-full
                mt-7
                bg-slate-100
                rounded-full
                animate-pulse
              "
              /
            >

            <div
              className="
                h-10 w-full
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
  )
);

GoalsLoadingState.displayName =
  "GoalsLoadingState";

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
     SERVER STATE
  ======================================================= */

  const savingsGoalsState =
    useSavingsGoals() ?? {};

  const {
    goals: hookGoals = [],
    loading = false,
    error = null,

    fetchGoals,
    refreshGoals,

    createGoal,
    updateGoal,
    deleteGoal,
  } = savingsGoalsState;

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    editingGoal,
    setEditingGoal,
  ] = useState(null);

  const [
    deletingGoal,
    setDeletingGoal,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    mutationError,
    setMutationError,
  ] = useState(null);

  /* =======================================================
     NORMALIZED GOALS
  ======================================================= */

  const goals = useMemo(
    () =>
      normalizeGoals(
        hookGoals
      ).filter(
        isRenderableGoal
      ),
    [hookGoals]
  );

  const resolvedLimit =
    useMemo(
      () =>
        resolveLimit(limit),
      [limit]
    );

  const visibleGoals =
    useMemo(() => {
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
     SUMMARY
  ======================================================= */

  const goalSummary =
    useMemo(() => {
      let active = 0;
      let completed = 0;
      let paused = 0;

      let totalTarget = 0;
      let totalSaved = 0;

      goals.forEach((goal) => {
        const status =
          getGoalStatus(goal);

        if (status === "active") {
          active += 1;
        }

        if (status === "completed") {
          completed += 1;
        }

        if (status === "paused") {
          paused += 1;
        }

        totalTarget +=
          getTargetAmount(goal);

        totalSaved +=
          getSavedAmount(goal);
      });

      const progressPercentage =
        totalTarget > 0
          ? Math.min(
              100,
              Math.max(
                0,
                (totalSaved /
                  totalTarget) *
                  100
              )
            )
          : 0;

      return {
        total: goals.length,
        active,
        completed,
        paused,
        totalTarget,
        totalSaved,
        progressPercentage,
      };
    }, [goals]);

  /* =======================================================
     ERROR
  ======================================================= */

  const loadErrorMessage =
    useMemo(
      () =>
        getErrorMessage(
          error,
          DEFAULT_ERROR
        ),
      [error]
    );

  const mutationErrorMessage =
    useMemo(
      () =>
        getErrorMessage(
          mutationError,
          DEFAULT_MUTATION_ERROR
        ),
      [mutationError]
    );

  /* =======================================================
     CAPABILITIES
  ======================================================= */

  const canRefresh =
    typeof refreshGoals ===
      "function" ||
    typeof fetchGoals ===
      "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      setMutationError(null);

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
    }, [
      refreshGoals,
      fetchGoals,
    ]);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      if (actionLoading) {
        return;
      }

      setMutationError(null);
      setIsCreateModalOpen(true);
    }, [actionLoading]);

  const handleCloseCreate =
    useCallback(() => {
      if (actionLoading) {
        return;
      }

      setIsCreateModalOpen(false);
    }, [actionLoading]);

  const handleCreate =
    useCallback(
      async (payload) => {
        if (
          typeof createGoal !==
          "function"
        ) {
          setMutationError(
            "Creating savings goals is currently unavailable."
          );
          return undefined;
        }

        setMutationError(null);
        setActionLoading(true);

        try {
          const result =
            await createGoal(
              payload
            );

          setIsCreateModalOpen(
            false
          );

          return result;
        } catch (mutationError) {
          setMutationError(
            mutationError
          );

          throw mutationError;
        } finally {
          setActionLoading(
            false
          );
        }
      },
      [createGoal]
    );

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit =
    useCallback(
      (goal) => {
        if (
          !goal ||
          actionLoading
        ) {
          return;
        }

        const goalId =
          getGoalId(goal);

        if (!goalId) {
          setMutationError(
            "This savings goal could not be identified."
          );
          return;
        }

        setMutationError(null);
        setEditingGoal(goal);
      },
      [actionLoading]
    );

  const handleCloseEdit =
    useCallback(() => {
      if (actionLoading) {
        return;
      }

      setEditingGoal(null);
    }, [actionLoading]);

  const handleUpdate =
    useCallback(
      async (payload) => {
        const goalId =
          getGoalId(
            editingGoal
          );

        if (!goalId) {
          setMutationError(
            "This savings goal could not be identified."
          );
          return undefined;
        }

        if (
          typeof updateGoal !==
          "function"
        ) {
          setMutationError(
            "Updating savings goals is currently unavailable."
          );
          return undefined;
        }

        setMutationError(null);
        setActionLoading(true);

        try {
          const result =
            await updateGoal(
              goalId,
              payload
            );

          setEditingGoal(null);

          return result;
        } catch (mutationError) {
          setMutationError(
            mutationError
          );

          throw mutationError;
        } finally {
          setActionLoading(
            false
          );
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
          actionLoading
        ) {
          return;
        }

        const goalId =
          getGoalId(goal);

        if (!goalId) {
          setMutationError(
            "This savings goal could not be identified."
          );
          return;
        }

        setMutationError(null);
        setDeletingGoal(goal);
      },
      [actionLoading]
    );

  const handleCloseDelete =
    useCallback(() => {
      if (actionLoading) {
        return;
      }

      setDeletingGoal(null);
    }, [actionLoading]);

  const handleDelete =
    useCallback(
      async () => {
        const goalId =
          getGoalId(
            deletingGoal
          );

        if (!goalId) {
          setMutationError(
            "This savings goal could not be identified."
          );
          return undefined;
        }

        if (
          typeof deleteGoal !==
          "function"
        ) {
          setMutationError(
            "Deleting savings goals is currently unavailable."
          );
          return undefined;
        }

        setMutationError(null);
        setActionLoading(true);

        try {
          const result =
            await deleteGoal(
              goalId
            );

          setDeletingGoal(null);

          return result;
        } catch (mutationError) {
          setMutationError(
            mutationError
          );

          throw mutationError;
        } finally {
          setActionLoading(
            false
          );
        }
      },
      [
        deletingGoal,
        deleteGoal,
      ]
    );

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    loading &&
    goals.length === 0
  ) {
    return (
      <div
        className={className}
      >
        <GoalsLoadingState
          allowCreate={
            allowCreate
          }
        />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <section
        className={`
          w-full
          ${className}
        `}
        aria-labelledby="savings-goals-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <GoalsHeader
          title={title}
          description={
            description
          }
          count={
            goalSummary.total
          }
          loading={loading}
          allowCreate={
            allowCreate
          }
          canRefresh={
            canRefresh
          }
          onRefresh={
            handleRefresh
          }
          onCreate={
            handleOpenCreate
          }
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
                {mutationErrorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMutationError(null)
              }
              className="
                shrink-0
                text-xs font-semibold
                text-red-700
                hover:text-red-900
              "
              aria-label="Dismiss error"
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
            <div
              className="
                mt-4 p-4
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
                    Unable to load savings goals
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm text-red-700 leading-5
                    "
                  >
                    {loadErrorMessage}
                  </p>

                  {canRefresh && (
                    <button
                      type="button"
                      onClick={
                        handleRefresh
                      }
                      disabled={
                        loading
                      }
                      className="
                        inline-flex items-center
                        mt-3
                        text-sm text-red-800 font-semibold
                        underline underline-offset-2
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
                            : ""
                        }
                        aria-hidden="true"
                      />

                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            NON-BLOCKING REFRESH ERROR
        ================================================= */}

        {loadErrorMessage &&
          goals.length > 0 && (
            <div
              className="
                flex items-start
                mt-4 p-4
                bg-amber-50
                rounded-2xl border border-amber-200
                gap-3
              "
              role="status"
              aria-live="polite"
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
                  {loadErrorMessage}
                </p>
              </div>

              {canRefresh && (
                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    loading
                  }
                  className="
                    text-sm text-amber-800 font-semibold
                    underline underline-offset-2
                    disabled:opacity-50
                    shrink-0
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
                value={
                  goalSummary.total
                }
                icon={Target}
              />

              <SummaryStat
                label="Active"
                value={
                  goalSummary.active
                }
                icon={WalletCards}
              />

              <SummaryStat
                label="Completed"
                value={
                  goalSummary.completed
                }
                icon={CheckCircle2}
              />

              <SummaryStat
                label="Overall progress"
                value={`${Math.round(
                  goalSummary.progressPercentage
                )}%`}
                icon={Target}
                subtle
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
                <div>
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
                    Across your current savings goals
                  </p>
                </div>

                <span
                  className="
                    text-sm text-slate-900 font-bold
                  "
                >
                  {Math.round(
                    goalSummary.progressPercentage
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
                  goalSummary.progressPercentage
                )}
                aria-label="Overall savings goal progress"
              >
                <div
                  className="
                    h-full
                    bg-slate-900
                    rounded-full
                    transition-[width] duration-500
                  "
                  style={{
                    width: `${goalSummary.progressPercentage}%`,
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
        !loadErrorMessage ? (
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
        ) : (
          <>
            {/* =============================================
                GOAL COLLECTION
            ============================================= */}

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
                    getGoalId(
                      goal
                    );

                  if (!goalId) {
                    return null;
                  }

                  return (
                    <article
                      key={goalId}
                      className="
                        overflow-hidden
                        min-w-0
                        bg-white
                        rounded-2xl
                        border border-slate-200/80 hover:border-slate-300
                        shadow-sm hover:shadow-md transition
                      "
                    >
                      <SavingsGoalCard
                        goal={goal}
                        compact={
                          compact
                        }
                        onSelect={
                          onGoalSelect
                        }
                        onEdit={
                          handleEdit
                        }
                        onDelete={
                          handleDeleteRequest
                        }
                      />

                      {/* =================================
                          DEDICATED GOAL PROGRESS
                      ================================= */}

                      <div
                        className="
                          px-4 py-4
                          border-t border-slate-100
                        "
                      >
                        <SavingsGoalProgress
                          goal={goal}
                        />
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            {/* =============================================
                LIMIT INDICATOR
            ============================================= */}

            {resolvedLimit &&
              goals.length >
                visibleGoals.length && (
                <p
                  className="
                    mt-4
                    text-center text-xs text-slate-400
                  "
                >
                  Showing{" "}
                  {visibleGoals.length}{" "}
                  of{" "}
                  {goals.length}{" "}
                  savings goals.
                </p>
              )}
          </>
        )}

        {/* =================================================
            BACKGROUND REFRESH
        ================================================= */}

        {loading &&
          goals.length > 0 && (
            <div
              className="
                flex items-center justify-center
                mt-4
                text-xs text-slate-400
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

      {isCreateModalOpen && (
        <CreateSavingsGoalModal
          open={
            isCreateModalOpen
          }
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreate
          }
          loading={
            actionLoading
          }
        />
      )}

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editingGoal && (
        <EditSavingsGoalModal
          open={
            Boolean(editingGoal)
          }
          goal={
            editingGoal
          }
          onClose={
            handleCloseEdit
          }
          onSubmit={
            handleUpdate
          }
          loading={
            actionLoading
          }
        />
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingGoal && (
        <DeleteSavingsGoalModal
          open={
            Boolean(deletingGoal)
          }
          goal={
            deletingGoal
          }
          onClose={
            handleCloseDelete
          }
          onConfirm={
            handleDelete
          }
          loading={
            actionLoading
          }
        />
      )}
    </>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsGoalsPage
);