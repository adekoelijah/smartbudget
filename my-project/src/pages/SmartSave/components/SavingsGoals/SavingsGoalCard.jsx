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

import { memo, useState } from "react";

import {
  formatSavingsCurrency,
  formatSavingsDate,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_GOAL_NAME = "Savings Goal";
const DEFAULT_STATUS = "active";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  paused: {
    label: "Paused",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  cancelled: {
    label: "Cancelled",
    icon: Clock3,
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
  },

  failed: {
    label: "Failed",
    icon: Clock3,
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  draft: {
    label: "Draft",
    icon: Target,
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },
};

/* =========================================================
   HELPERS
========================================================= */

/**
 * Resolve the canonical goal ID.
 *
 * The page should normally provide `id`/`_id`,
 * but these fallbacks make the card defensive.
 */
const getGoalId = (goal) =>
  goal?._id ||
  goal?.id ||
  goal?.goalId ||
  null;

/**
 * Resolve display name.
 */
const getGoalName = (goal) =>
  goal?.name ||
  goal?.title ||
  DEFAULT_GOAL_NAME;

/**
 * Resolve currency.
 */
const getGoalCurrency = (goal) =>
  goal?.currency ||
  DEFAULT_CURRENCY;

/**
 * Safely resolve a numeric value.
 */
const getSafeNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/**
 * Keep progress within the UI-safe range.
 */
const normalizeProgress = (value) => {
  const progress = getSafeNumber(value);

  return Math.min(
    100,
    Math.max(0, progress)
  );
};

/**
 * Resolve status.
 */
const getGoalStatus = (goal) =>
  String(
    goal?.status ||
      DEFAULT_STATUS
  ).toLowerCase();

/**
 * Resolve target date.
 */
const getGoalTargetDate = (goal) =>
  goal?.targetDate ||
  goal?.deadline ||
  goal?.endDate ||
  null;

/**
 * Safely format a savings date.
 */
const formatTargetDate = (date) => {
  if (!date) {
    return null;
  }

  try {
    return formatSavingsDate(date);
  } catch {
    return null;
  }
};

/**
 * Safely format currency.
 */
const formatAmount = (
  amount,
  currency
) => {
  try {
    return formatSavingsCurrency(
      amount,
      currency
    );
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
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
  const [menuOpen, setMenuOpen] =
    useState(false);

  /* =======================================================
     EMPTY SAFETY
  ======================================================= */

  if (!goal) {
    return null;
  }

  /* =======================================================
     CANONICAL DISPLAY VALUES
     
     IMPORTANT:
     These values are expected to have already been
     normalized/calculated by SavingsGoalsPage.
  ======================================================= */

  const goalId =
    getGoalId(goal);

  const name =
    getGoalName(goal);

  const description =
    goal.description || "";

  const currency =
    getGoalCurrency(goal);

  const currentAmount =
    getSafeNumber(
      goal.currentAmount ??
        goal.savedAmount ??
        goal.amountSaved
    );

  const targetAmount =
    getSafeNumber(
      goal.targetAmount ??
        goal.target
    );

  const remainingAmount =
    getSafeNumber(
      goal.remainingAmount ??
        Math.max(
          0,
          targetAmount -
            currentAmount
        )
    );

  const progress =
    normalizeProgress(
      goal.progress ??
        goal.progressPercentage ??
        goal.percentage
    );

  const status =
    getGoalStatus(goal);

  const targetDate =
    getGoalTargetDate(goal);

  const healthLabel =
    goal.healthLabel ||
    goal.health?.label ||
    goal.health?.status ||
    goal.health?.name ||
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
     FORMATTING
  ======================================================= */

  const formattedCurrentAmount =
    formatAmount(
      currentAmount,
      currency
    );

  const formattedTargetAmount =
    formatAmount(
      targetAmount,
      currency
    );

  const formattedRemainingAmount =
    formatAmount(
      remainingAmount,
      currency
    );

  const formattedTargetDate =
    formatTargetDate(targetDate);

  const roundedProgress =
    Math.round(progress);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleCardClick = () => {
    onClick?.(goal);
  };

  const handleViewDetails = (
    event
  ) => {
    event.stopPropagation();

    closeMenu();

    if (onViewDetails) {
      onViewDetails(goal);
      return;
    }

    onClick?.(goal);
  };

  const handleEdit = (
    event
  ) => {
    event.stopPropagation();

    closeMenu();

    onEdit?.(goal);
  };

  const handleDelete = (
    event
  ) => {
    event.stopPropagation();

    closeMenu();

    onDelete?.(goal);
  };

  const handleMenuToggle = (
    event
  ) => {
    event.stopPropagation();

    setMenuOpen(
      (current) => !current
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      data-goal-id={
        goalId || undefined
      }
      className={`
        group
        relative
        overflow-visible
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
          {/* Goal icon */}

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
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <Target
                size={21}
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Goal information */}

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

        {/* =================================================
            ACTION MENU
        ================================================= */}

        {showMenu && (
          <div
            className="
              relative
              shrink-0
            "
          >
            <button
              type="button"
              onClick={
                handleMenuToggle
              }
              aria-label={`Actions for ${name}`}
              aria-expanded={
                menuOpen
              }
              aria-haspopup="menu"
              className="
                flex justify-center items-center
                w-9 h-9
                text-slate-500 hover:text-slate-700
                hover:bg-slate-100
                rounded-lg focus:outline-none
                focus:ring-2 focus:ring-blue-500/20
                transition
              "
            >
              <MoreHorizontal
                size={19}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="
                  top-10 right-0 z-30 absolute overflow-hidden
                  w-44
                  py-1
                  bg-white
                  border border-slate-200 rounded-xl
                  shadow-xl
                "
              >
                {/* View */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleViewDetails
                  }
                  className="
                    flex items-center
                    w-full
                    px-3.5 py-2.5
                    text-slate-700 text-sm text-left
                    hover:bg-slate-50
                    transition
                    gap-2.5
                  "
                >
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                  />

                  View details
                </button>

                {/* Edit */}

                {onEdit && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={
                      handleEdit
                    }
                    className="
                      flex items-center
                      w-full
                      px-3.5 py-2.5
                      text-slate-700 text-sm text-left
                      hover:bg-slate-50
                      transition
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

                {/* Delete */}

                {onDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={
                      handleDelete
                    }
                    className="
                      flex items-center
                      w-full
                      px-3.5 py-2.5
                      text-red-600 text-sm text-left
                      hover:bg-red-50
                      transition
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
            px-2.5
            py-1
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
          AMOUNTS
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
          {/* Saved */}

          <div
            className="
              min-w-0
            "
          >
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
                font-bold text-slate-900 text-xl truncate tracking-tight
              "
            >
              {formattedCurrentAmount}
            </p>
          </div>

          {/* Target */}

          <div
            className="
              min-w-0
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
                font-semibold text-slate-700 text-sm truncate
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
            {roundedProgress}%
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
          aria-valuenow={
            roundedProgress
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} progress`}
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-[width] duration-500 ease-out
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
          {/* Remaining */}

          <div
            className="
              min-w-0
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

          {/* Target date */}

          <div
            className="
              min-w-0
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
        {/* Progress summary */}

        <div
          className="
            flex items-center
            min-w-0
            text-slate-500 text-xs
            gap-1.5
          "
        >
          <TrendingUp
            size={14}
            className="
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <span
            className="
              truncate
            "
          >
            {isCompleted
              ? "Goal completed"
              : `${roundedProgress}% of target`}
          </span>
        </div>

        {/* Details */}

        <button
          type="button"
          onClick={
            handleViewDetails
          }
          className="
            inline-flex items-center
            px-2.5 py-2
            font-medium text-blue-600 text-sm
            hover:bg-blue-50
            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20
            transition
            gap-1.5 shrink-0
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

/* =========================================================
   MEMOIZATION
========================================================= */

/**
 * The card is presentation-only.
 *
 * React.memo prevents a card from rendering again when
 * its goal reference and callback props have not changed.
 *
 * This is useful when SavingsGoalsPage renders a large
 * collection of goals.
 */
export default memo(
  SavingsGoalCard
);