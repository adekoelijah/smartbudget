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
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

import {
  formatSavingsCurrency,
  formatSavingsDate,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

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
   SAFE HELPERS
========================================================= */

const getGoalId = (goal) => {
  if (!goal || typeof goal !== "object") {
    return null;
  }

  return (
    goal._id ||
    goal.id ||
    goal.goalId ||
    null
  );
};

const getGoalName = (goal) => {
  if (!goal || typeof goal !== "object") {
    return DEFAULT_GOAL_NAME;
  }

  const value =
    goal.name ||
    goal.title ||
    DEFAULT_GOAL_NAME;

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : DEFAULT_GOAL_NAME;
};

const getGoalCurrency = (goal) => {
  if (!goal || typeof goal !== "object") {
    return DEFAULT_CURRENCY;
  }

  const currency =
    goal.currency ||
    DEFAULT_CURRENCY;

  return typeof currency === "string" &&
    currency.trim()
    ? currency.trim().toUpperCase()
    : DEFAULT_CURRENCY;
};

const getSafeNumber = (
  value,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clampProgress = (value) => {
  const progress =
    getSafeNumber(value);

  return Math.min(
    100,
    Math.max(0, progress)
  );
};

const getGoalStatus = (goal) => {
  const status = String(
    goal?.status ||
      DEFAULT_STATUS
  )
    .trim()
    .toLowerCase();

  return status || DEFAULT_STATUS;
};

const getGoalTargetDate = (goal) =>
  goal?.targetDate ||
  goal?.deadline ||
  goal?.endDate ||
  null;

const calculateProgress = (
  goal,
  currentAmount,
  targetAmount
) => {
  const explicitProgress =
    goal?.progress ??
    goal?.progressPercentage ??
    goal?.percentage;

  if (
    explicitProgress !==
      null &&
    explicitProgress !==
      undefined &&
    explicitProgress !== ""
  ) {
    return clampProgress(
      explicitProgress
    );
  }

  if (
    targetAmount <= 0
  ) {
    return 0;
  }

  return clampProgress(
    (currentAmount /
      targetAmount) *
      100
  );
};

const formatAmount = (
  amount,
  currency
) => {
  const safeAmount =
    getSafeNumber(amount);

  try {
    return formatSavingsCurrency(
      safeAmount,
      currency
    );
  } catch {
    try {
      return `${currency} ${safeAmount.toLocaleString()}`;
    } catch {
      return `${currency} 0`;
    }
  }
};

const formatTargetDate = (
  value
) => {
  if (!value) {
    return null;
  }

  try {
    return formatSavingsDate(value);
  } catch {
    return null;
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsGoalCard = ({
  goal = null,

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

  const menuRef = useRef(null);

  const menuId = useId();

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const display = useMemo(() => {
    if (!goal) {
      return null;
    }

    const goalId =
      getGoalId(goal);

    const name =
      getGoalName(goal);

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
        goal.remainingAmount,
        Math.max(
          0,
          targetAmount -
            currentAmount
        )
      );

    const progress =
      calculateProgress(
        goal,
        currentAmount,
        targetAmount
      );

    const status =
      getGoalStatus(goal);

    const targetDate =
      getGoalTargetDate(goal);

    const healthLabel =
      typeof goal.healthLabel ===
        "string"
        ? goal.healthLabel
        : typeof goal.health?.label ===
            "string"
          ? goal.health.label
          : typeof goal.health?.status ===
              "string"
            ? goal.health.status
            : typeof goal.health?.name ===
                "string"
              ? goal.health.name
              : "";

    const isCompleted =
      status === "completed" ||
      progress >= 100;

    const statusConfig =
      STATUS_CONFIG[status] ||
      STATUS_CONFIG.active;

    return {
      goalId,
      name,
      description:
        typeof goal.description ===
        "string"
          ? goal.description.trim()
          : "",

      currency,

      currentAmount,
      targetAmount,
      remainingAmount,

      progress,
      roundedProgress:
        Math.round(progress),

      status,
      statusConfig,

      isCompleted,

      targetDate,
      formattedTargetDate:
        formatTargetDate(
          targetDate
        ),

      healthLabel,

      formattedCurrentAmount:
        formatAmount(
          currentAmount,
          currency
        ),

      formattedTargetAmount:
        formatAmount(
          targetAmount,
          currency
        ),

      formattedRemainingAmount:
        formatAmount(
          remainingAmount,
          currency
        ),
    };
  }, [goal]);

  /* =======================================================
     MENU LIFECYCLE
  ======================================================= */

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (
      event
    ) => {
      if (
        !menuRef.current ||
        menuRef.current.contains(
          event.target
        )
      ) {
        return;
      }

      setMenuOpen(false);
    };

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleCardClick =
    useCallback(() => {
      if (!goal) {
        return;
      }

      onClick?.(goal);
    }, [goal, onClick]);

  const handleViewDetails =
    useCallback(
      (event) => {
        event?.stopPropagation();

        closeMenu();

        if (!goal) {
          return;
        }

        if (
          typeof onViewDetails ===
          "function"
        ) {
          onViewDetails(goal);
          return;
        }

        onClick?.(goal);
      },
      [
        closeMenu,
        goal,
        onClick,
        onViewDetails,
      ]
    );

  const handleEdit =
    useCallback(
      (event) => {
        event?.stopPropagation();

        closeMenu();

        if (!goal) {
          return;
        }

        onEdit?.(goal);
      },
      [closeMenu, goal, onEdit]
    );

  const handleDelete =
    useCallback(
      (event) => {
        event?.stopPropagation();

        closeMenu();

        if (!goal) {
          return;
        }

        onDelete?.(goal);
      },
      [closeMenu, goal, onDelete]
    );

  const handleMenuToggle =
    useCallback(
      (event) => {
        event?.stopPropagation();

        setMenuOpen(
          (current) => !current
        );
      },
      []
    );

  /* =======================================================
     RENDER GUARD
  ======================================================= */

  if (!display) {
    return null;
  }

  const {
    goalId,
    name,
    description,
    statusConfig,
    isCompleted,
    healthLabel,
    formattedCurrentAmount,
    formattedTargetAmount,
    formattedRemainingAmount,
    formattedTargetDate,
    roundedProgress,
    progress,
  } = display;

  const StatusIcon =
    statusConfig.icon;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      data-goal-id={
        goalId || undefined
      }
      className={`
        group relative
        overflow-visible
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${className}
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex items-start justify-between
          p-5
          gap-3
        "
      >
        <button
          type="button"
          onClick={
            handleCardClick
          }
          className="
            flex flex-1 items-start
            min-w-0
            text-left
            outline-none rounded-xl
            gap-3 focus-visible:ring-2 focus-visible:ring-blue-500/30
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
            aria-hidden="true"
          >
            {isCompleted ? (
              <CheckCircle2
                size={21}
                strokeWidth={2}
              />
            ) : (
              <Target
                size={21}
                strokeWidth={2}
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
                    text-slate-500 text-sm leading-5 line-clamp-2
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
            ref={menuRef}
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
              aria-controls={
                menuOpen
                  ? menuId
                  : undefined
              }
              className="
                flex justify-center items-center
                w-9 h-9
                text-slate-500 hover:text-slate-700
                hover:bg-slate-100
                rounded-lg focus:outline-none
                transition
                focus-visible:ring-2 focus-visible:ring-blue-500/30
              "
            >
              <MoreHorizontal
                size={19}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label={`Actions for ${name}`}
                className="
                  absolute top-10 right-0 z-30 overflow-hidden
                  w-44
                  py-1
                  bg-white
                  border border-slate-200 rounded-xl
                  shadow-xl
                "
              >
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

                {typeof onEdit ===
                  "function" && (
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

                {typeof onDelete ===
                  "function" && (
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

      {/* =================================================
          STATUS
      ================================================= */}

      <div
        className="
          px-5
        "
      >
        <span
          className={`
            inline-flex items-center
            gap-1.5
            rounded-full
            border
            px-2.5 py-1
            text-xs font-medium
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
              text-slate-600 text-xs font-medium
              bg-slate-100
              rounded-full
            "
          >
            {healthLabel}
          </span>
        )}
      </div>

      {/* =================================================
          AMOUNTS
      ================================================= */}

      <div
        className="
          px-5 pt-5
        "
      >
        <div
          className="
            flex items-end justify-between
            gap-4
          "
        >
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

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div
        className="
          px-5 pt-4
        "
      >
        <div
          className="
            flex items-center justify-between
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

      {/* =================================================
          META
      ================================================= */}

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

      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          flex items-center justify-between
          mt-5 px-5 py-4
          border-t border-slate-100
          gap-3
        "
      >
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
            rounded-lg focus:outline-none
            transition
            shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500/30 gap-1.5
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

export default memo(
  SavingsGoalCard
);