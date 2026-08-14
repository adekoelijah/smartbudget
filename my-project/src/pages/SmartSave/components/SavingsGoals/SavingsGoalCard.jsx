
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pencil,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  formatSavingsCurrency,
  formatSavingsDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  normalizeSavingsGoal,
} from "../../../../utils/smartSave/savingsNormalizers";

import {
  calculateSavingsProgress,
} from "../../../../utils/smartSave/savingsProgress";

import {
  getSavingsHealthStatus,
} from "../../../../utils/smartSave/savingsHealth";

import {
  SMART_SAVE_GOAL_STATUS,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   HELPERS
========================================================= */

const getGoalId = (goal) =>
  goal?._id ||
  goal?.id ||
  goal?.goalId ||
  null;

const getGoalName = (goal) =>
  goal?.name ||
  goal?.title ||
  "Savings Goal";

const getGoalDescription = (goal) =>
  goal?.description ||
  "";

const getCurrency = (goal) =>
  goal?.currency ||
  "NGN";

const getTargetAmount = (goal) =>
  Number(
    goal?.targetAmount ??
    goal?.target ??
    0
  );

const getCurrentAmount = (goal) =>
  Number(
    goal?.currentAmount ??
    goal?.savedAmount ??
    goal?.amountSaved ??
    goal?.progressAmount ??
    0
  );

const getTargetDate = (goal) =>
  goal?.targetDate ||
  goal?.deadline ||
  goal?.endDate ||
  null;

const getStatus = (goal) =>
  String(
    goal?.status ||
    "active"
  ).toLowerCase();

const safePercentage = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: Clock3,
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  paused: {
    label: "Paused",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  cancelled: {
    label: "Cancelled",
    icon: Clock3,
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },

  failed: {
    label: "Failed",
    icon: Clock3,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  draft: {
    label: "Draft",
    icon: Target,
    className:
      "bg-slate-50 text-slate-600 border-slate-200",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalCard = ({
  goal,
  onClick,
  onEdit,
  onDelete,
  onViewDetails,
  showMenu = true,
  compact = false,
  className = "",
}) => {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  /* =======================================================
     NORMALIZED GOAL
  ======================================================= */

  const normalizedGoal = useMemo(() => {
    if (!goal) {
      return null;
    }

    try {
      return normalizeSavingsGoal(goal);
    } catch {
      return goal;
    }
  }, [goal]);

  /* =======================================================
     CORE VALUES
  ======================================================= */

  const goalId = useMemo(
    () => getGoalId(normalizedGoal),
    [normalizedGoal]
  );

  const name = useMemo(
    () => getGoalName(normalizedGoal),
    [normalizedGoal]
  );

  const description = useMemo(
    () => getGoalDescription(normalizedGoal),
    [normalizedGoal]
  );

  const currency = useMemo(
    () => getCurrency(normalizedGoal),
    [normalizedGoal]
  );

  const targetAmount = useMemo(
    () => getTargetAmount(normalizedGoal),
    [normalizedGoal]
  );

  const currentAmount = useMemo(
    () => getCurrentAmount(normalizedGoal),
    [normalizedGoal]
  );

  const targetDate = useMemo(
    () => getTargetDate(normalizedGoal),
    [normalizedGoal]
  );

  const status = useMemo(
    () => getStatus(normalizedGoal),
    [normalizedGoal]
  );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress = useMemo(() => {
    try {
      const result =
        calculateSavingsProgress({
          currentAmount,
          targetAmount,
          goal: normalizedGoal,
        });

      if (typeof result === "number") {
        return safePercentage(result);
      }

      return safePercentage(
        result?.percentage ??
        result?.progress ??
        result?.percent ??
        result?.value ??
        0
      );
    } catch {
      if (targetAmount <= 0) {
        return 0;
      }

      return safePercentage(
        (currentAmount / targetAmount) * 100
      );
    }
  }, [
    currentAmount,
    targetAmount,
    normalizedGoal,
  ]);

  /* =======================================================
     REMAINING
  ======================================================= */

  const remainingAmount = useMemo(
    () =>
      Math.max(
        0,
        targetAmount - currentAmount
      ),
    [
      targetAmount,
      currentAmount,
    ]
  );

  /* =======================================================
     HEALTH
  ======================================================= */

  const health = useMemo(() => {
    try {
      return getSavingsHealthStatus(
        normalizedGoal
      );
    } catch {
      return null;
    }
  }, [normalizedGoal]);

  const healthLabel =
    health?.label ||
    health?.status ||
    health?.name ||
    "";

  /* =======================================================
     STATUS
  ======================================================= */

  const statusConfig =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.active;

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     COMPLETION
  ======================================================= */

  const isCompleted =
    status === "completed" ||
    progress >= 100;

  /* =======================================================
     TARGET DATE
  ======================================================= */

  const formattedTargetDate = useMemo(() => {
    if (!targetDate) {
      return null;
    }

    try {
      return formatSavingsDate(
        targetDate
      );
    } catch {
      return null;
    }
  }, [targetDate]);

  /* =======================================================
     CURRENCY FORMATTING
  ======================================================= */

  const formattedCurrentAmount =
    formatSavingsCurrency(
      currentAmount,
      currency
    );

  const formattedTargetAmount =
    formatSavingsCurrency(
      targetAmount,
      currency
    );

  const formattedRemainingAmount =
    formatSavingsCurrency(
      remainingAmount,
      currency
    );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleCardClick = () => {
    onClick?.(normalizedGoal);
  };

  const handleViewDetails = (
    event
  ) => {
    event.stopPropagation();

    setMenuOpen(false);

    if (onViewDetails) {
      onViewDetails(
        normalizedGoal
      );
      return;
    }

    onClick?.(normalizedGoal);
  };

  const handleEdit = (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    onEdit?.(
      normalizedGoal
    );
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    onDelete?.(
      normalizedGoal
    );
  };

  /* =======================================================
     EMPTY SAFETY
  ======================================================= */

  if (!normalizedGoal) {
    return null;
  }

  return (
    <article
      data-goal-id={goalId || undefined}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${className}
      `}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex justify-between items-start
          p-5
          gap-3
        "
      >
        <button
          type="button"
          onClick={handleCardClick}
          className="
            flex flex-1 items-start
            min-w-0
            text-left
            outline-none
            gap-3
          "
          aria-label={`View ${name}`}
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              text-blue-600
              bg-blue-50
              rounded-xl
              shrink-0
            "
          >
            {isCompleted ? (
              <CheckCircle2
                size={21}
                aria-hidden="true"
              />
            ) : (
              <Target
                size={21}
                aria-hidden="true"
              />
            )}
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-base truncate
              "
            >
              {name}
            </h3>

            {!compact &&
              description && (
                <p
                  className="
                    mt-1
                    text-slate-500 text-sm line-clamp-2 leading-5
                  "
                >
                  {description}
                </p>
              )}
          </div>
        </button>

        {showMenu && (
          <div
            className="
              relative
              shrink-0
            "
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setMenuOpen(
                  (current) =>
                    !current
                );
              }}
              aria-label={`Actions for ${name}`}
              aria-expanded={menuOpen}
              className="flex justify-center items-center hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-9 h-9 text-slate-500 hover:text-slate-700 transition"
            >
              <MoreHorizontal
                size={19}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                className="
                  top-10 right-0 z-20 absolute overflow-hidden
                  w-44
                  py-1
                  bg-white
                  border border-slate-200 rounded-xl
                  shadow-xl
                "
              >
                <button
                  type="button"
                  onClick={
                    handleViewDetails
                  }
                  className="
                    flex items-center
                    w-full
                    px-3.5 py-2.5
                    text-slate-700 text-sm text-left
                    hover:bg-slate-50
                    gap-2.5
                  "
                >
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                  />

                  View details
                </button>

                {onEdit && (
                  <button
                    type="button"
                    onClick={
                      handleEdit
                    }
                    className="
                      flex items-center
                      w-full
                      px-3.5 py-2.5
                      text-slate-700 text-sm text-left
                      hover:bg-slate-50
                      gap-2.5
                    "
                  >
                    <Pencil
                      size={16}
                      aria-hidden="true"
                    />

                    Edit goal
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={
                      handleDelete
                    }
                    className="
                      flex items-center
                      w-full
                      px-3.5 py-2.5
                      text-red-600 text-sm text-left
                      hover:bg-red-50
                      gap-2.5
                    "
                  >
                    Delete goal
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================
          STATUS
      =================================================== */}

      <div
        className="
          px-5
        "
      >
        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5 py-1
            text-xs
            font-medium
            ${statusConfig.className}
          `}
        >
          <StatusIcon
            size={13}
            aria-hidden="true"
          />

          {statusConfig.label}
        </span>

        {healthLabel && (
          <span
            className="
              inline-flex items-center
              ml-2 px-2.5 py-1
              font-medium text-slate-600 text-xs
              bg-slate-100
              rounded-full
            "
          >
            {healthLabel}
          </span>
        )}
      </div>

      {/* ===================================================
          AMOUNT
      =================================================== */}

      <div
        className="
          px-5 pt-5
        "
      >
        <div
          className="
            flex justify-between items-end
            gap-4
          "
        >
          <div>
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Saved
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900 text-xl tracking-tight
              "
            >
              {formattedCurrentAmount}
            </p>
          </div>

          <div
            className="
              text-right
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Target
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-700 text-sm
              "
            >
              {formattedTargetAmount}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          PROGRESS
      =================================================== */}

      <div
        className="
          px-5 pt-4
        "
      >
        <div
          className="
            flex justify-between items-center
            mb-2
            gap-3
          "
        >
          <span
            className="
              font-medium text-slate-500 text-xs
            "
          >
            Progress
          </span>

          <span
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {Math.round(progress)}%
          </span>
        </div>

        <div
          className="
            overflow-hidden
            h-2
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${name} progress`}
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-all duration-500
            "
            style={{
              width: `${progress}%`,
            }}
          /
          >
        </div>
      </div>

      {/* ===================================================
          META
      =================================================== */}

      {!compact && (
        <div
          className="
            grid grid-cols-2
            px-5 pt-5
            gap-3
          "
        >
          <div
            className="
              p-3
              bg-slate-50
              rounded-xl
            "
          >
            <div
              className="
                flex items-center
                text-slate-500 text-xs
                gap-2
              "
            >
              <WalletCards
                size={14}
                aria-hidden="true"
              />

              Remaining
            </div>

            <p
              className="
                mt-1
                font-semibold text-slate-800 text-sm truncate
              "
            >
              {formattedRemainingAmount}
            </p>
          </div>

          <div
            className="
              p-3
              bg-slate-50
              rounded-xl
            "
          >
            <div
              className="
                flex items-center
                text-slate-500 text-xs
                gap-2
              "
            >
              <CalendarDays
                size={14}
                aria-hidden="true"
              />

              Target date
            </div>

            <p
              className="
                mt-1
                font-semibold text-slate-800 text-sm truncate
              "
            >
              {formattedTargetDate ||
                "Not set"}
            </p>
          </div>
        </div>
      )}

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          flex justify-between items-center
          mt-5 px-5 py-4
          border-slate-100 border-t
          gap-3
        "
      >
        <div
          className="
            flex items-center
            text-slate-500 text-xs
            gap-1.5
          "
        >
          <TrendingUp
            size={14}
            aria-hidden="true"
          />

          {isCompleted
            ? "Goal completed"
            : `${Math.round(progress)}% of target`}
        </div>

        <button
          type="button"
          onClick={handleViewDetails}
          className="
            inline-flex items-center
            px-2.5 py-2
            font-medium text-blue-600 text-sm
            hover:bg-blue-50
            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20
            transition
            gap-1.5
          "
        >
          View details

          <ArrowRight
            size={15}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
};

export default SavingsGoalCard;