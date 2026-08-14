
import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Target,
  AlertCircle,
} from "lucide-react";

import useSavingsGoals from "../../../../hooks/useSavingsGoals";

import SavingsGoalCard from "./SavingsGoalCard";
import SavingsGoalEmptyState from "./SavingsGoalEmptyState";
import SavingsGoalProgress from "./SavingsGoalProgress";

import CreateSavingsGoalModal from "./CreateSavingsGoalModal";
import EditSavingsGoalModal from "./EditSavingsGoalModal";
import DeleteSavingsGoalModal from "./DeleteSavingsGoalModal";

/**
 * =========================================================
 * SAVINGS GOAL SECTION
 * =========================================================
 *
 * Responsibilities:
 *
 * - Coordinate the savings-goals hook
 * - Render the goal collection
 * - Handle goal modal state
 * - Delegate goal mutations to useSavingsGoals
 * - Provide loading/error/empty states
 * - Provide refresh behavior
 *
 * This component intentionally does NOT:
 *
 * - call smartSaveService directly
 * - construct API URLs
 * - perform financial calculations
 * - modify backend payloads
 * - duplicate goal business rules
 * - maintain a second copy of server goal state
 *
 * Data flow:
 *
 * Backend
 *    ↓
 * smartSaveService
 *    ↓
 * useSavingsGoals
 *    ↓
 * SavingsGoalSection
 *    ↓
 * SavingsGoalCard / Progress / Modals
 *
 * =========================================================
 */

/* =========================================================
   SAFE HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

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

  return [];
};

const getGoalId = (goal) =>
  goal?._id ??
  goal?.id ??
  goal?.goalId ??
  null;

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalSection = ({
  title = "Savings Goals",
  description = "Track your progress toward the things that matter most.",

  /**
   * Optional maximum number of goals to display.
   * Leave undefined to display the complete collection.
   */
  limit,

  /**
   * Optional className supplied by the parent SmartSave page.
   */
  className = "",

  /**
   * Optional feature flag for the create button.
   */
  allowCreate = true,

  /**
   * Optional compact mode.
   */
  compact = false,

  /**
   * Optional callback when a goal is selected.
   */
  onGoalSelect,
}) => {
  /* =======================================================
     SERVER STATE
  ======================================================= */

  const {
    goals: hookGoals,
    loading,
    error,

    fetchGoals,
    refreshGoals,

    createGoal,
    updateGoal,
    deleteGoal,
  } = useSavingsGoals();

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

  /* =======================================================
     NORMALIZED GOALS
  ======================================================= */

  const goals = useMemo(
    () => normalizeGoals(hookGoals),
    [hookGoals]
  );

  const visibleGoals = useMemo(() => {
    if (!Number.isInteger(limit) || limit <= 0) {
      return goals;
    }

    return goals.slice(0, limit);
  }, [goals, limit]);

  /* =======================================================
     GOAL SUMMARY
  ======================================================= */

  const goalSummary = useMemo(() => {
    const total = goals.length;

    const active = goals.filter(
      (goal) =>
        String(goal?.status ?? "")
          .toLowerCase() === "active"
    ).length;

    const completed = goals.filter(
      (goal) =>
        String(goal?.status ?? "")
          .toLowerCase() === "completed"
    ).length;

    const totalTarget = goals.reduce(
      (sum, goal) =>
        sum +
        toNumber(
          goal?.targetAmount ??
          goal?.target ??
          goal?.amount
        ),
      0
    );

    const totalSaved = goals.reduce(
      (sum, goal) =>
        sum +
        toNumber(
          goal?.currentAmount ??
          goal?.savedAmount ??
          goal?.amountSaved ??
          goal?.progressAmount
        ),
      0
    );

    return {
      total,
      active,
      completed,
      totalTarget,
      totalSaved,
    };
  }, [goals]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    if (typeof refreshGoals === "function") {
      return refreshGoals();
    }

    if (typeof fetchGoals === "function") {
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

  const handleCreate = useCallback(
    async (payload) => {
      if (typeof createGoal !== "function") {
        return;
      }

      setActionLoading(true);

      try {
        await createGoal(payload);

        setIsCreateModalOpen(false);

        /*
         * Do not manually append the returned goal here.
         *
         * useSavingsGoals remains the single server-state
         * owner. The hook decides whether to invalidate,
         * refetch or update its cache.
         */
      } finally {
        setActionLoading(false);
      }
    },
    [createGoal]
  );

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = useCallback(
    (goal) => {
      if (!goal) {
        return;
      }

      setEditingGoal(goal);
    },
    []
  );

  const handleUpdate = useCallback(
    async (payload) => {
      const goalId = getGoalId(editingGoal);

      if (
        !goalId ||
        typeof updateGoal !== "function"
      ) {
        return;
      }

      setActionLoading(true);

      try {
        await updateGoal(
          goalId,
          payload
        );

        setEditingGoal(null);
      } finally {
        setActionLoading(false);
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

  const handleDeleteRequest = useCallback(
    (goal) => {
      if (!goal) {
        return;
      }

      setDeletingGoal(goal);
    },
    []
  );

  const handleDelete = useCallback(
    async () => {
      const goalId = getGoalId(deletingGoal);

      if (
        !goalId ||
        typeof deleteGoal !== "function"
      ) {
        return;
      }

      setActionLoading(true);

      try {
        await deleteGoal(goalId);

        setDeletingGoal(null);
      } finally {
        setActionLoading(false);
      }
    },
    [
      deletingGoal,
      deleteGoal,
    ]
  );

  /* =======================================================
     CANCEL MODALS
  ======================================================= */

  const handleCloseCreate = useCallback(() => {
    if (actionLoading) {
      return;
    }

    setIsCreateModalOpen(false);
  }, [actionLoading]);

  const handleCloseEdit = useCallback(() => {
    if (actionLoading) {
      return;
    }

    setEditingGoal(null);
  }, [actionLoading]);

  const handleCloseDelete = useCallback(() => {
    if (actionLoading) {
      return;
    }

    setDeletingGoal(null);
  }, [actionLoading]);

  /* =======================================================
     ERROR STATE
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
      "Unable to load your savings goals."
    );
  }, [error]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (
    loading &&
    goals.length === 0
  ) {
    return (
      <section
        className={`w-full ${className}`}
        aria-busy="true"
        aria-label="Savings goals"
      >
        <div
          className="
            flex justify-between items-center
            mb-5
            gap-4
          "
        >
          <div>
            <div
              className="
                w-36 h-6
                bg-slate-200
                rounded
                animate-pulse
              "
              /
            >
            <div
              className="
                w-64 h-4
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
                w-32 h-10
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
            grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            gap-4
          "
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                min-h-[220px]
                p-5
                bg-white
                border border-slate-100 rounded-2xl
                animate-pulse
              "
            >
              <div
                className="
                  w-10 h-10
                  bg-slate-100
                  rounded-xl
                "
                /
              >

              <div
                className="
                  w-2/3 h-5
                  mt-5
                  bg-slate-100
                  rounded
                "
                /
              >

              <div
                className="
                  w-full h-3
                  mt-3
                  bg-slate-100
                  rounded
                "
                /
              >

              <div
                className="
                  w-5/6 h-3
                  mt-2
                  bg-slate-100
                  rounded
                "
                /
              >

              <div
                className="
                  w-full h-3
                  mt-7
                  bg-slate-100
                  rounded
                "
                /
              >
            </div>
          ))}
        </div>
      </section>
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

        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
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
              <div
                className="
                  flex justify-center items-center
                  w-9 h-9
                  text-blue-600
                  bg-blue-50
                  rounded-xl
                  shrink-0
                "
                aria-hidden="true"
              >
                <Target size={18} />
              </div>

              <div>
                <h2
                  id="savings-goals-title"
                  className="
                    font-semibold text-slate-900 text-lg tracking-tight
                  "
                >
                  {title}
                </h2>

                <p
                  className="
                    mt-0.5
                    text-slate-500 text-sm
                  "
                >
                  {description}
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              flex items-center
              w-full sm:w-auto
              gap-2
            "
          >
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="
                inline-flex flex-1 sm:flex-none justify-center items-center
                h-10
                px-3
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-xl
                disabled:opacity-60 transition
                disabled:cursor-not-allowed
                gap-2
              "
              aria-label="Refresh savings goals"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span
                className="
                  hidden sm:inline
                "
              >
                Refresh
              </span>
            </button>

            {allowCreate && (
              <button
                type="button"
                onClick={() =>
                  setIsCreateModalOpen(true)
                }
                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-sm px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 h-10 font-semibold text-white text-sm transition"
              >
                <Plus size={17} />

                <span>
                  New goal
                </span>
              </button>
            )}
          </div>
        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div
            role="alert"
            className="
              flex items-start
              mb-5 p-4
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
                Unable to load savings goals
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
                onClick={handleRefresh}
                className="
                  mt-3
                  font-semibold text-red-800 text-sm
                  underline underline-offset-2 hover:no-underline
                "
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        {!compact && goals.length > 0 && (
          <div
            className="
              grid grid-cols-2 md:grid-cols-3
              mb-5
              gap-3
            "
          >
            <div
              className="
                p-4
                bg-white
                border border-slate-100 rounded-2xl
              "
            >
              <p
                className="
                  font-medium text-slate-400 text-xs
                "
              >
                Total goals
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-xl
                "
              >
                {goalSummary.total}
              </p>
            </div>

            <div
              className="
                p-4
                bg-white
                border border-slate-100 rounded-2xl
              "
            >
              <p
                className="
                  font-medium text-slate-400 text-xs
                "
              >
                Active
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-xl
                "
              >
                {goalSummary.active}
              </p>
            </div>

            <div
              className="
                p-4
                bg-white
                border border-slate-100 rounded-2xl
                col-span-2 md:col-span-1
              "
            >
              <p
                className="
                  font-medium text-slate-400 text-xs
                "
              >
                Completed
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-xl
                "
              >
                {goalSummary.completed}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {goals.length === 0 && !errorMessage ? (
          <SavingsGoalEmptyState
            onCreate={
              allowCreate
                ? () =>
                    setIsCreateModalOpen(true)
                : undefined
            }
          />
        ) : (
          /* ===============================================
             GOAL GRID
          =============================================== */

          <div
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
              gap-4
            "
          >
            {visibleGoals.map((goal) => {
              const goalId =
                getGoalId(goal);

              if (!goalId) {
                return null;
              }

              return (
                <SavingsGoalCard
                  key={goalId}
                  goal={goal}
                  compact={compact}
                  onSelect={onGoalSelect}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              );
            })}
          </div>
        )}

        {/* =================================================
            REFRESHING INDICATOR
        ================================================= */}

        {loading && goals.length > 0 && (
          <div
            className="
              flex justify-center items-center
              mt-4
              text-slate-400 text-xs
              gap-2
            "
            role="status"
          >
            <RefreshCw
              size={13}
              className="
                animate-spin
              "
              /
            >

            Updating goals…
          </div>
        )}
      </section>

      {/* ===================================================
          CREATE MODAL
      =================================================== */}

      {isCreateModalOpen && (
        <CreateSavingsGoalModal
          open={isCreateModalOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          loading={actionLoading}
        />
      )}

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editingGoal && (
        <EditSavingsGoalModal
          open={Boolean(editingGoal)}
          goal={editingGoal}
          onClose={handleCloseEdit}
          onSubmit={handleUpdate}
          loading={actionLoading}
        />
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingGoal && (
        <DeleteSavingsGoalModal
          open={Boolean(deletingGoal)}
          goal={deletingGoal}
          onClose={handleCloseDelete}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}
    </>
  );
};

export default SavingsGoalSection;