import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
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

import CreateSavingsGoalModal from "./CreateSavingsGoalModal";
import EditSavingsGoalModal from "./EditSavingsGoalModal";
import DeleteSavingsGoalModal from "./DeleteSavingsGoalModal";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  paused: {
    label: "Paused",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },
  expired: {
    label: "Expired",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};

/* =========================================================
   VALUE HELPERS
========================================================= */

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "$numberDecimal" in value
  ) {
    const parsed = Number(value.$numberDecimal);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "amount" in value
  ) {
    return toFiniteNumber(value.amount);
  }

  if (typeof value?.toString === "function") {
    const parsed = Number(value.toString());

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

/* =========================================================
   GOAL ID
========================================================= */

const getGoalId = (goal) => {
  if (!goal) {
    return null;
  }

  const id =
    goal._id ??
    goal.id ??
    goal.goalId;

  if (!id) {
    return null;
  }

  return String(id);
};

/* =========================================================
   GOAL VALUES
========================================================= */

const getTargetAmount = (goal) => {
  return Math.max(
    0,
    toFiniteNumber(
      goal?.targetAmount ??
        goal?.target?.amount ??
        goal?.target?.targetAmount ??
        goal?.amount
    )
  );
};

const getSavedAmount = (goal) => {
  return Math.max(
    0,
    toFiniteNumber(
      goal?.currentAmount ??
        goal?.savedAmount ??
        goal?.amountSaved ??
        goal?.progressAmount ??
        goal?.progress?.currentAmount ??
        goal?.progress?.savedAmount
    )
  );
};

const getRemainingAmount = (goal) => {
  const explicitRemaining = goal?.remainingAmount;

  if (
    explicitRemaining !== undefined &&
    explicitRemaining !== null
  ) {
    return Math.max(0, toFiniteNumber(explicitRemaining));
  }

  return Math.max(
    0,
    getTargetAmount(goal) - getSavedAmount(goal)
  );
};

const getGoalCurrency = (goal) => {
  const currency =
    goal?.currency ??
    goal?.target?.currency ??
    DEFAULT_CURRENCY;

  return String(currency).trim().toUpperCase() || DEFAULT_CURRENCY;
};

const getGoalProgress = (goal) => {
  const explicitProgress =
    goal?.progressPercentage ??
    goal?.progress?.percentage ??
    (typeof goal?.progress === "number"
      ? goal.progress
      : null);

  if (
    explicitProgress !== null &&
    explicitProgress !== undefined
  ) {
    return Math.min(
      100,
      Math.max(0, toFiniteNumber(explicitProgress))
    );
  }

  const target = getTargetAmount(goal);
  const saved = getSavedAmount(goal);

  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (saved / target) * 100)
  );
};

const getGoalTargetDate = (goal) => {
  return (
    goal?.targetDate ??
    goal?.target?.targetDate ??
    null
  );
};

const getGoalStatus = (goal) => {
  const status = String(
    goal?.status ?? "active"
  )
    .trim()
    .toLowerCase();

  return STATUS_CONFIG[status]
    ? status
    : "active";
};

/* =========================================================
   FORMATTING
========================================================= */

const formatMoney = (value, currency = DEFAULT_CURRENCY) => {
  const amount = toFiniteNumber(value);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "No target date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid target date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getDaysRemaining = (value) => {
  if (!value) {
    return null;
  }

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const difference =
    targetDate.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Something went wrong. Please try again."
  );
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeGoal = (goal) => {
  if (!goal) {
    return null;
  }

  const goalId = getGoalId(goal);

  if (!goalId) {
    return null;
  }

  const targetAmount = getTargetAmount(goal);
  const savedAmount = getSavedAmount(goal);
  const remainingAmount = getRemainingAmount(goal);
  const progress = getGoalProgress(goal);
  const currency = getGoalCurrency(goal);
  const targetDate = getGoalTargetDate(goal);
  const status = getGoalStatus(goal);

  return {
    ...goal,
    goalId,
    targetAmount,
    savedAmount,
    remainingAmount,
    progress,
    currency,
    targetDate,
    status,
  };
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = memo(({ status }) => {
  const config =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.active;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border
        px-2.5 py-1
        text-xs font-semibold
        ${config.className}
      `}
    >
      {status === "completed" && (
        <CheckCircle2
          className="
            h-3.5 w-3.5
          "
          /
        >
      )}

      {status === "active" && (
        <span
          className="
            h-1.5 w-1.5
            bg-current
            rounded-full
          "
          /
        >
      )}

      {config.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
    iconClassName,
  }) => {
    return (
      <div
        className="
          p-5
          bg-white
          rounded-2xl border border-slate-200
          shadow-sm
        "
      >
        <div
          className="
            flex items-start justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs text-slate-500 font-semibold uppercase tracking-[0.12em]
              "
            >
              {label}
            </p>

            <p
              className="
                mt-2
                text-2xl text-slate-950 font-bold tracking-tight
              "
            >
              {value}
            </p>

            {description && (
              <p
                className="
                  mt-1
                  text-sm text-slate-500
                "
              >
                {description}
              </p>
            )}
          </div>

          <div
            className={`
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl
              ${iconClassName}
            `}
          >
            <Icon
              className="
                h-5 w-5
              "
              /
            >
          </div>
        </div>
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";

/* =========================================================
   GOAL CARD
========================================================= */

const GoalCard = memo(
  ({
    goal,
    onView,
    onEdit,
    onDelete,
  }) => {
    const goalId = goal?.goalId;

    const targetAmount = goal?.targetAmount ?? 0;
    const savedAmount = goal?.savedAmount ?? 0;
    const remainingAmount =
      goal?.remainingAmount ?? 0;
    const progress = goal?.progress ?? 0;
    const currency =
      goal?.currency ?? DEFAULT_CURRENCY;
    const targetDate = goal?.targetDate;
    const status = goal?.status ?? "active";

    const daysRemaining =
      getDaysRemaining(targetDate);

    const hasSavingAccount =
      Boolean(goal?.savingAccount);

    const handleView = () => {
      if (!goalId) {
        return;
      }

      if (typeof onView === "function") {
        onView(goal);
      }
    };

    const handleEdit = () => {
      if (!goalId) {
        return;
      }

      if (typeof onEdit === "function") {
        onEdit(goal);
      }
    };

    const handleDelete = () => {
      if (!goalId) {
        return;
      }

      if (typeof onDelete === "function") {
        onDelete(goal);
      }
    };

    return (
      <article
        className="
          flex flex-col overflow-hidden
          h-full
          bg-white
          rounded-3xl border border-slate-200 hover:border-blue-200
          shadow-sm hover:shadow-lg transition duration-200
          group hover:-translate-y-0.5
        "
      >
        {/* =================================================
            CARD HEADER
        ================================================= */}

        <div
          className="
            p-5 sm:p-6
            border-b border-slate-100
          "
        >
          <div
            className="
              flex items-start justify-between
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
                  h-11 w-11
                  text-blue-600
                  bg-blue-50
                  rounded-xl
                  shrink-0
                "
              >
                <Target
                  className="
                    h-5 w-5
                  "
                  /
                >
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <h3
                  className="
                    truncate text-base text-slate-950 font-bold
                  "
                >
                  {goal?.name || "Savings Goal"}
                </h3>

                <p
                  className="
                    mt-1
                    line-clamp-2 text-sm text-slate-500
                  "
                >
                  {goal?.description ||
                    "Build toward your financial target."}
                </p>
              </div>
            </div>

            <StatusBadge status={status} />
          </div>
        </div>

        {/* =================================================
            TARGET AMOUNT
        ================================================= */}

        <div
          className="
            p-5 sm:p-6
          "
        >
          <div
            className="
              p-5
              bg-gradient-to-br from-blue-50 via-white to-slate-50
              rounded-2xl border border-blue-100
            "
          >
            <div
              className="
                flex items-center justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs text-slate-500 font-semibold uppercase
                    tracking-[0.12em]
                  "
                >
                  Target amount
                </p>

                <p
                  className="
                    mt-2
                    break-words text-2xl text-slate-950 sm:text-3xl
                    font-extrabold tracking-tight
                  "
                >
                  {formatMoney(
                    targetAmount,
                    currency
                  )}
                </p>
              </div>

              <div
                className="
                  hidden items-center justify-center sm:flex
                  h-12 w-12
                  text-blue-600
                  bg-white
                  rounded-xl
                  shadow-sm
                  shrink-0
                "
              >
                <CircleDollarSign
                  className="
                    h-6 w-6
                  "
                  /
                >
              </div>
            </div>
          </div>

          {/* =================================================
              SAVED / REMAINING
          ================================================= */}

          <div
            className="
              grid grid-cols-2
              mt-5
              gap-3
            "
          >
            <div
              className="
                p-4
                bg-slate-50
                rounded-2xl
              "
            >
              <p
                className="
                  text-xs text-slate-500 font-medium
                "
              >
                Saved
              </p>

              <p
                className="
                  mt-1
                  break-words text-base text-slate-950 font-bold
                "
              >
                {formatMoney(
                  savedAmount,
                  currency
                )}
              </p>
            </div>

            <div
              className="
                p-4
                bg-slate-50
                rounded-2xl
              "
            >
              <p
                className="
                  text-xs text-slate-500 font-medium
                "
              >
                Remaining
              </p>

              <p
                className="
                  mt-1
                  break-words text-base text-slate-950 font-bold
                "
              >
                {formatMoney(
                  remainingAmount,
                  currency
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              PROGRESS
          ================================================= */}

          <div
            className="
              mt-5
            "
          >
            <div
              className="
                flex items-center justify-between
                mb-2
                gap-4
              "
            >
              <span
                className="
                  text-sm text-slate-700 font-semibold
                "
              >
                Progress
              </span>

              <span
                className="
                  text-sm text-blue-600 font-bold
                "
              >
                {progress.toFixed(0)}%
              </span>
            </div>

            <div
              className="
                overflow-hidden
                h-2.5
                bg-slate-100
                rounded-full
              "
            >
              <div
                className="
                  h-full
                  bg-blue-600
                  rounded-full
                  transition-[width] duration-500
                "
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, progress)
                  )}%`,
                }}
              /
              >
            </div>
          </div>

          {/* =================================================
              META
          ================================================= */}

          <div
            className="
              mt-5 space-y-3
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
                  flex items-center
                  min-w-0
                  text-sm text-slate-600
                  gap-2
                "
              >
                <CalendarDays
                  className="
                    h-4 w-4
                    text-slate-400
                    shrink-0
                  "
                  /
                >
                <span>Target date</span>
              </div>

              <span
                className="
                  text-right text-sm text-slate-900 font-semibold
                "
              >
                {formatDate(targetDate)}
              </span>
            </div>

            {daysRemaining !== null &&
              status !== "completed" && (
                <div
                  className="
                    flex items-center justify-between
                    gap-3
                  "
                >
                  <div
                    className="
                      flex items-center
                      text-sm text-slate-600
                      gap-2
                    "
                  >
                    <Clock3
                      className="
                        h-4 w-4
                        text-slate-400
                      "
                      /
                    >
                    <span>Time remaining</span>
                  </div>

                  <span
                    className={`
                      text-sm font-semibold
                      ${
                        daysRemaining < 0
                          ? "text-red-600"
                          : daysRemaining <= 30
                            ? "text-amber-600"
                            : "text-slate-900"
                      }
                    `}
                  >
                    {daysRemaining < 0
                      ? `${Math.abs(
                          daysRemaining
                        )} days overdue`
                      : daysRemaining === 0
                        ? "Due today"
                        : `${daysRemaining} days`}
                  </span>
                </div>
              )}

            <div
              className="
                flex items-center justify-between
                gap-3
              "
            >
              <div
                className="
                  flex items-center
                  text-sm text-slate-600
                  gap-2
                "
              >
                <WalletCards
                  className="
                    h-4 w-4
                    text-slate-400
                  "
                  /
                >
                <span>Saving account</span>
              </div>

              <span
                className={`
                  text-right text-sm font-semibold
                  ${
                    hasSavingAccount
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                `}
              >
                {hasSavingAccount
                  ? "Linked"
                  : "Not linked"}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(typeof onView === "function" ||
          typeof onEdit === "function" ||
          typeof onDelete === "function") && (
          <div
            className="
              mt-auto p-4
              bg-slate-50/70
              border-t border-slate-100
            "
          >
            <div
              className="
                flex flex-wrap items-center
                gap-2
              "
            >
              {typeof onView === "function" && (
                <button
                  type="button"
                  onClick={handleView}
                  disabled={!goalId}
                  className="
                    inline-flex flex-1 items-center justify-center
                    px-4 py-2.5
                    text-sm text-white font-semibold
                    bg-slate-950 hover:bg-slate-800
                    rounded-xl
                    transition disabled:opacity-50
                    disabled:cursor-not-allowed
                    gap-2
                  "
                >
                  View goal
                  <ArrowUpRight
                    className="
                      h-4 w-4
                    "
                    /
                  >
                </button>
              )}

              {typeof onEdit === "function" && (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={!goalId}
                  className="
                    px-4 py-2.5
                    text-sm text-slate-700 hover:text-blue-600 font-semibold
                    bg-white
                    rounded-xl border border-slate-200 hover:border-blue-200
                    transition disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Edit
                </button>
              )}

              {typeof onDelete === "function" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!goalId}
                  className="
                    px-4 py-2.5
                    text-sm text-slate-700 hover:text-red-600 font-semibold
                    bg-white
                    rounded-xl border border-slate-200 hover:border-red-200
                    transition disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }
);

GoalCard.displayName = "GoalCard";

/* =========================================================
   LOADING SKELETON
========================================================= */

const GoalsLoading = memo(() => {
  return (
    <div
      className="
        grid grid-cols-1 xl:grid-cols-2
        gap-5
      "
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="
            overflow-hidden
            p-6
            bg-white
            rounded-3xl border border-slate-200
            shadow-sm
          "
        >
          <div
            className="
              space-y-5
              animate-pulse
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
                  h-11 w-11
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
                    h-4 w-1/2
                    bg-slate-200
                    rounded
                  "
                  /
                >
                <div
                  className="
                    h-3 w-3/4
                    bg-slate-100
                    rounded
                  "
                  /
                >
              </div>
            </div>

            <div
              className="
                h-28
                bg-slate-100
                rounded-2xl
              "
              /
            >

            <div
              className="
                grid grid-cols-2
                gap-3
              "
            >
              <div
                className="
                  h-20
                  bg-slate-100
                  rounded-2xl
                "
                /
              >
              <div
                className="
                  h-20
                  bg-slate-100
                  rounded-2xl
                "
                /
              >
            </div>

            <div
              className="
                h-3
                bg-slate-100
                rounded-full
              "
              /
            >

            <div
              className="
                space-y-3
              "
            >
              <div
                className="
                  h-4
                  bg-slate-100
                  rounded
                "
                /
              >
              <div
                className="
                  h-4
                  bg-slate-100
                  rounded
                "
                /
              >
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

GoalsLoading.displayName = "GoalsLoading";

/* =========================================================
   EMPTY STATE
========================================================= */

const GoalsEmptyState = memo(
  ({ onCreate, canCreate }) => {
    return (
      <div
        className="
          px-6 py-14
          text-center
          bg-white
          rounded-3xl border border-dashed border-slate-300
        "
      >
        <div
          className="
            flex items-center justify-center
            h-16 w-16
            mx-auto
            text-blue-600
            bg-blue-50
            rounded-2xl
          "
        >
          <Target
            className="
              h-7 w-7
            "
            /
          >
        </div>

        <h3
          className="
            mt-5
            text-xl text-slate-950 font-bold
          "
        >
          No savings goals yet
        </h3>

        <p
          className="
            max-w-md
            mx-auto mt-2
            text-sm text-slate-500 leading-6
          "
        >
          Create your first savings goal and turn a
          financial target into a structured savings
          journey.
        </p>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex items-center
              mt-6 px-5 py-3
              text-sm text-white font-bold
              bg-blue-600 hover:bg-blue-700
              rounded-xl
              shadow-sm transition
              gap-2
            "
          >
            <Plus
              className="
                h-4 w-4
              "
              /
            >
            Create your first goal
          </button>
        )}
      </div>
    );
  }
);

GoalsEmptyState.displayName = "GoalsEmptyState";

/* =========================================================
   ERROR STATE
========================================================= */

const GoalsErrorState = memo(
  ({ message, onRetry }) => {
    return (
      <div
        className="
          p-5
          bg-red-50
          rounded-2xl border border-red-200
        "
      >
        <div
          className="
            flex items-start
            gap-3
          "
        >
          <AlertCircle
            className="
              h-5 w-5
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
            <h3
              className="
                text-sm text-red-900 font-bold
              "
            >
              Unable to load savings goals
            </h3>

            <p
              className="
                mt-1
                text-sm text-red-700 leading-6
              "
            >
              {message}
            </p>

            {typeof onRetry === "function" && (
              <button
                type="button"
                onClick={onRetry}
                className="
                  inline-flex items-center
                  mt-4 px-3 py-2
                  text-sm text-red-700 font-semibold
                  bg-white hover:bg-red-100
                  rounded-lg border border-red-200
                  transition
                  gap-2
                "
              >
                <RefreshCw
                  className="
                    h-4 w-4
                  "
                  /
                >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GoalsErrorState.displayName = "GoalsErrorState";

/* =========================================================
   MAIN PAGE
========================================================= */

const SavingsGoalsPage = ({
  onGoalSelect,
}) => {
  const pageId = useId();

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState(null);

  const [deletingGoal, setDeletingGoal] =
    useState(null);

  const [mutationError, setMutationError] =
    useState("");

  const {
    goals = [],
    loading = false,
    error = null,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh,
  } = useSavingsGoals();

  /* =======================================================
     NORMALIZE GOALS
  ======================================================= */

  const normalizedGoals = useMemo(() => {
    if (!Array.isArray(goals)) {
      return [];
    }

    return goals
      .map(normalizeGoal)
      .filter(Boolean);
  }, [goals]);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const canCreate =
    typeof createGoal === "function";

  const canEdit =
    typeof updateGoal === "function";

  const canDelete =
    typeof deleteGoal === "function";

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const activeGoals =
      normalizedGoals.filter(
        (goal) => goal.status === "active"
      );

    const completedGoals =
      normalizedGoals.filter(
        (goal) => goal.status === "completed"
      );

    const currencies = [
      ...new Set(
        normalizedGoals.map(
          (goal) => goal.currency
        )
      ),
    ];

    const hasSingleCurrency =
      currencies.length === 1;

    const currency =
      hasSingleCurrency
        ? currencies[0]
        : DEFAULT_CURRENCY;

    const totalTarget = hasSingleCurrency
      ? normalizedGoals.reduce(
          (total, goal) =>
            total + goal.targetAmount,
          0
        )
      : 0;

    const totalSaved = hasSingleCurrency
      ? normalizedGoals.reduce(
          (total, goal) =>
            total + goal.savedAmount,
          0
        )
      : 0;

    const averageProgress =
      normalizedGoals.length > 0
        ? normalizedGoals.reduce(
            (total, goal) =>
              total + goal.progress,
            0
          ) / normalizedGoals.length
        : 0;

    return {
      totalGoals: normalizedGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalSaved,
      averageProgress,
      currency,
      hasSingleCurrency,
    };
  }, [normalizedGoals]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleOpenCreate = useCallback(() => {
    setMutationError("");
    setShowCreateModal(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleGoalSelect = useCallback(
    (goal) => {
      const goalId = getGoalId(goal);

      if (!goalId) {
        return;
      }

      if (typeof onGoalSelect === "function") {
        onGoalSelect(goal);
      }
    },
    [onGoalSelect]
  );

  const handleEdit = useCallback((goal) => {
    const goalId = getGoalId(goal);

    if (!goalId || !canEdit) {
      return;
    }

    setMutationError("");
    setEditingGoal(goal);
  }, [canEdit]);

  const handleDeleteRequest = useCallback(
    (goal) => {
      const goalId = getGoalId(goal);

      if (!goalId || !canDelete) {
        return;
      }

      setMutationError("");
      setDeletingGoal(goal);
    },
    [canDelete]
  );

  const handleCloseEdit = useCallback(() => {
    setEditingGoal(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeletingGoal(null);
  }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreateGoal = useCallback(
    async (payload) => {
      if (!canCreate) {
        return;
      }

      setMutationError("");

      try {
        await createGoal(payload);

        setShowCreateModal(false);

        if (typeof refresh === "function") {
          await refresh();
        }
      } catch (mutationFailure) {
        setMutationError(
          getErrorMessage(mutationFailure)
        );
      }
    },
    [canCreate, createGoal, refresh]
  );

  /* =======================================================
     UPDATE
  ======================================================= */

  const handleUpdateGoal = useCallback(
    async (payload) => {
      const goalId = getGoalId(editingGoal);

      if (!goalId || !canEdit) {
        return;
      }

      setMutationError("");

      try {
        await updateGoal(goalId, payload);

        setEditingGoal(null);

        if (typeof refresh === "function") {
          await refresh();
        }
      } catch (mutationFailure) {
        setMutationError(
          getErrorMessage(mutationFailure)
        );
      }
    },
    [
      editingGoal,
      canEdit,
      updateGoal,
      refresh,
    ]
  );

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteGoal = useCallback(async () => {
    const goalId = getGoalId(deletingGoal);

    if (!goalId || !canDelete) {
      return;
    }

    setMutationError("");

    try {
      await deleteGoal(goalId);

      setDeletingGoal(null);

      if (typeof refresh === "function") {
        await refresh();
      }
    } catch (mutationFailure) {
      setMutationError(
        getErrorMessage(mutationFailure)
      );
    }
  }, [
    deletingGoal,
    canDelete,
    deleteGoal,
    refresh,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    if (typeof refresh !== "function") {
      return;
    }

    setMutationError("");

    try {
      await refresh();
    } catch (refreshError) {
      setMutationError(
        getErrorMessage(refreshError)
      );
    }
  }, [refresh]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      id={pageId}
      className="
        min-h-full
        px-4 sm:px-6 lg:px-8 py-6
        bg-slate-50
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
        "
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            overflow-hidden
            bg-white
            rounded-3xl border border-slate-200
            shadow-sm
          "
        >
          <div
            className="
              relative overflow-hidden
              px-5 sm:px-8 py-7 sm:py-9
            "
          >
            <div
              className="
                absolute
                h-64 w-64
                bg-blue-100/60
                rounded-full
                blur-3xl
                pointer-events-none
                -right-24 -top-24
              "
              /
            >

            <div
              className="
                absolute left-1/3
                h-72 w-72
                bg-slate-100
                rounded-full
                blur-3xl
                pointer-events-none
                -bottom-32
              "
              /
            >

            <div
              className="
                relative flex flex-col lg:flex-row lg:items-center
                lg:justify-between
                gap-6
              "
            >
              <div
                className="
                  flex items-start
                  min-w-0
                  gap-4
                "
              >
                <div
                  className="
                    flex items-center justify-center
                    h-14 w-14
                    text-white
                    bg-blue-600
                    rounded-2xl
                    shadow-lg shadow-blue-600/20
                    shrink-0
                  "
                >
                  <Target
                    className="
                      h-7 w-7
                    "
                    /
                  >
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
                    <p
                      className="
                        text-xs text-blue-600 font-bold uppercase
                        tracking-[0.16em]
                      "
                    >
                      SmartSave
                    </p>

                    <span
                      className="
                        h-1 w-1
                        bg-slate-300
                        rounded-full
                      "
                      /
                    >

                    <p
                      className="
                        text-xs text-slate-500 font-medium
                      "
                    >
                      Savings goals
                    </p>
                  </div>

                  <h1
                    className="
                      mt-2
                      text-2xl text-slate-950 sm:text-3xl font-extrabold
                      tracking-tight
                    "
                  >
                    Turn financial targets into progress.
                  </h1>

                  <p
                    className="
                      max-w-2xl
                      mt-2
                      text-sm text-slate-500 sm:text-base leading-6
                    "
                  >
                    Create structured savings goals, monitor
                    your progress, and keep every financial
                    target visible from one place.
                  </p>
                </div>
              </div>

              <div
                className="
                  flex flex-wrap items-center
                  shrink-0 gap-2
                "
              >
                {typeof refresh === "function" && (
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="
                      inline-flex items-center justify-center
                      px-4 py-3
                      text-sm text-slate-700 hover:text-blue-600 font-semibold
                      bg-white
                      rounded-xl border border-slate-200 hover:border-blue-200
                      transition disabled:opacity-50
                      disabled:cursor-not-allowed
                      gap-2
                    "
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        loading
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    Refresh
                  </button>
                )}

                {canCreate && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="
                      inline-flex items-center justify-center
                      px-4 py-3
                      text-sm text-white font-bold
                      bg-blue-600 hover:bg-blue-700
                      rounded-xl
                      shadow-sm transition
                      gap-2
                    "
                  >
                    <Plus
                      className="
                        h-4 w-4
                      "
                      /
                    >
                    New savings goal
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            METRICS
        ================================================= */}

        <section
          className="
            grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
            mt-5
            gap-4
          "
        >
          <MetricCard
            icon={Target}
            label="Total goals"
            value={summary.totalGoals}
            description={`${summary.completedGoals} completed`}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <MetricCard
            icon={TrendingUp}
            label="Active goals"
            value={summary.activeGoals}
            description="Currently being funded"
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
            icon={CircleDollarSign}
            label="Total target"
            value={
              summary.hasSingleCurrency
                ? formatMoney(
                    summary.totalTarget,
                    summary.currency
                  )
                : "Multiple currencies"
            }
            description={
              summary.hasSingleCurrency
                ? "Across your goals"
                : "Targets use different currencies"
            }
            iconClassName="bg-violet-50 text-violet-600"
          />

          <MetricCard
            icon={WalletCards}
            label="Total saved"
            value={
              summary.hasSingleCurrency
                ? formatMoney(
                    summary.totalSaved,
                    summary.currency
                  )
                : "Multiple currencies"
            }
            description={`${summary.averageProgress.toFixed(
              0
            )}% average progress`}
            iconClassName="bg-amber-50 text-amber-600"
          />
        </section>

        {/* =================================================
            MUTATION ERROR
        ================================================= */}

        {mutationError && (
          <div
            className="
              flex items-start
              mt-5 p-4
              text-sm text-red-700
              bg-red-50
              rounded-2xl border border-red-200
              gap-3
            "
          >
            <AlertCircle
              className="
                h-5 w-5
                mt-0.5
                shrink-0
              "
              /
            >

            <div>
              <p
                className="
                  font-semibold
                "
              >
                Action could not be completed
              </p>

              <p
                className="
                  mt-1
                "
              >
                {mutationError}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            CONTENT HEADER
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <div
            className="
              flex flex-col sm:flex-row sm:items-end sm:justify-between
              mb-4
              gap-2
            "
          >
            <div>
              <h2
                className="
                  text-xl text-slate-950 font-extrabold tracking-tight
                "
              >
                Your savings goals
              </h2>

              <p
                className="
                  mt-1
                  text-sm text-slate-500
                "
              >
                A clear view of where your savings stand.
              </p>
            </div>

            {!loading &&
              normalizedGoals.length > 0 && (
                <p
                  className="
                    text-sm text-slate-500 font-medium
                  "
                >
                  {normalizedGoals.length}{" "}
                  {normalizedGoals.length === 1
                    ? "goal"
                    : "goals"}
                </p>
              )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && <GoalsLoading />}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <GoalsErrorState
              message={getErrorMessage(error)}
              onRetry={handleRefresh}
            />
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            normalizedGoals.length === 0 && (
              <GoalsEmptyState
                onCreate={handleOpenCreate}
                canCreate={canCreate}
              />
            )}

          {/* =================================================
              GOALS GRID
          ================================================= */}

          {!loading &&
            !error &&
            normalizedGoals.length > 0 && (
              <div
                className="
                  grid grid-cols-1 xl:grid-cols-2
                  gap-5
                "
              >
                {normalizedGoals.map((goal) => {
                  /*
                   * IMPORTANT:
                   * goalId is deliberately extracted and used
                   * as the React key and passed through the
                   * goal object as goal.goalId.
                   */
                  const goalId = getGoalId(goal);

                  if (!goalId) {
                    return null;
                  }

                  return (
                    <GoalCard
                      key={goalId}
                      goal={{
                        ...goal,
                        goalId,
                      }}
                      onView={
                        typeof onGoalSelect ===
                        "function"
                          ? handleGoalSelect
                          : undefined
                      }
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
                  );
                })}
              </div>
            )}
        </section>
      </div>

      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      {canCreate && (
        <CreateSavingsGoalModal
          open={showCreateModal}
          onClose={handleCloseCreate}
          onSubmit={handleCreateGoal}
          loading={loading}
        />
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {canEdit && (
        <EditSavingsGoalModal
          open={Boolean(editingGoal)}
          goal={editingGoal}
          onClose={handleCloseEdit}
          onSubmit={handleUpdateGoal}
          loading={loading}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {canDelete && (
        <DeleteSavingsGoalModal
          open={Boolean(deletingGoal)}
          goal={deletingGoal}
          onClose={handleCloseDelete}
          onConfirm={handleDeleteGoal}
          loading={loading}
        />
      )}
    </main>
  );
};

export default memo(SavingsGoalsPage);