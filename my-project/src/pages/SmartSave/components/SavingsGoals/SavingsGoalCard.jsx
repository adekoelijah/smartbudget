
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pencil,
  Target,
  WalletCards,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/**
 * ============================================================================
 * SavingsGoalCard
 * ============================================================================
 *
 * Production presentation component for an individual savings goal.
 *
 * Architecture:
 *
 *   Page
 *     ↓
 *   Hook
 *     ↓
 *   Service
 *     ↓
 *   API
 *
 * This component does NOT:
 * - fetch data
 * - call APIs
 * - mutate server state directly
 * - contain business rules
 * - maintain server state
 *
 * It only presents the supplied goal and exposes UI actions.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Utility helpers                                                            */
/* -------------------------------------------------------------------------- */

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getFirstDefined = (...values) => {
  return values.find(
    (value) => value !== undefined && value !== null,
  );
};

const formatMoney = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "No target date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No target date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* -------------------------------------------------------------------------- */
/* Status presentation                                                        */
/* -------------------------------------------------------------------------- */

const getStatusPresentation = ({
  status,
  progress,
  currentAmount,
  targetAmount,
}) => {
  const normalizedStatus = String(status || "active")
    .trim()
    .toLowerCase();

  const isCompleted =
    normalizedStatus === "completed" ||
    normalizedStatus === "complete" ||
    progress >= 100 ||
    (targetAmount > 0 && currentAmount >= targetAmount);

  const isPaused =
    normalizedStatus === "paused" ||
    normalizedStatus === "pause";

  const isCancelled =
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled";

  if (isCompleted) {
    return {
      label: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      isCompleted: true,
    };
  }

  if (isPaused) {
    return {
      label: "Paused",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      isCompleted: false,
    };
  }

  if (isCancelled) {
    return {
      label: "Cancelled",
      className:
        "border-rose-200 bg-rose-50 text-rose-700",
      isCompleted: false,
    };
  }

  return {
    label: "Active",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    isCompleted: false,
  };
};

/* -------------------------------------------------------------------------- */
/* Main card                                                                  */
/* -------------------------------------------------------------------------- */

const SavingsGoalCardContent = ({
  goal,
  onView,
  onEdit,
  onDelete,
}) => {
  /* ------------------------------------------------------------------------ */
  /* State and refs                                                           */
  /* ------------------------------------------------------------------------ */

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const menuId = useId();

  /* ------------------------------------------------------------------------ */
  /* Close actions menu when clicking outside                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, [menuOpen]);

  /* ------------------------------------------------------------------------ */
  /* Goal identity                                                            */
  /* ------------------------------------------------------------------------ */

  const goalId = getFirstDefined(
    goal._id,
    goal.id,
    goal.goalId,
  );

  /* ------------------------------------------------------------------------ */
  /* Goal information                                                         */
  /* ------------------------------------------------------------------------ */

  const name =
    getFirstDefined(
      goal.name,
      goal.title,
      goal.goalName,
    ) || "Savings Goal";

  const currency =
    getFirstDefined(
      goal.currency,
      goal.targetCurrency,
    ) || "NGN";

  /* ------------------------------------------------------------------------ */
  /* Financial values                                                         */
  /* ------------------------------------------------------------------------ */

  const currentAmount = Math.max(
    toFiniteNumber(
      getFirstDefined(
        goal.currentAmount,
        goal.savedAmount,
        goal.amountSaved,
        goal.totalSaved,
      ),
    ),
    0,
  );

  const targetAmount = Math.max(
    toFiniteNumber(
      getFirstDefined(
        goal.targetAmount,
        goal.target,
        goal.amount,
      ),
    ),
    0,
  );

  /*
   * Remaining amount is deliberately derived from the displayed values.
   *
   * Do not use goal.remainingAmount here because it is a derived value and
   * may become stale after a contribution.
   */
  const remainingAmount = Math.max(
    targetAmount - currentAmount,
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Progress                                                                 */
  /* ------------------------------------------------------------------------ */

  const progress =
    targetAmount > 0
      ? Math.min(
          Math.max(
            (currentAmount / targetAmount) * 100,
            0,
          ),
          100,
        )
      : 0;

  const roundedProgress = Math.round(progress);

  /* ------------------------------------------------------------------------ */
  /* Status                                                                   */
  /* ------------------------------------------------------------------------ */

  const rawStatus = getFirstDefined(
    goal.status,
    goal.state,
  );

  const status = getStatusPresentation({
    status: rawStatus,
    progress,
    currentAmount,
    targetAmount,
  });

  /* ------------------------------------------------------------------------ */
  /* Target date                                                              */
  /* ------------------------------------------------------------------------ */

  const targetDate = getFirstDefined(
    goal.targetDate,
    goal.deadline,
    goal.endDate,
  );

  const formattedTargetDate = formatDate(targetDate);

  /* ------------------------------------------------------------------------ */
  /* Currency values                                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * These values are intentionally NOT memoized.
   *
   * Formatting three currency values is inexpensive, and avoiding useMemo
   * keeps this presentation component simpler and eliminates unnecessary
   * hook dependencies.
   */
  const formattedCurrentAmount = formatMoney(
    currentAmount,
    currency,
  );

  const formattedTargetAmount = formatMoney(
    targetAmount,
    currency,
  );

  const formattedRemainingAmount = formatMoney(
    remainingAmount,
    currency,
  );

  /* ------------------------------------------------------------------------ */
  /* Event handlers                                                           */
  /* ------------------------------------------------------------------------ */

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleViewDetails = useCallback(() => {
    closeMenu();
    onView?.(goal);
  }, [closeMenu, goal, onView]);

  const handleEdit = useCallback(() => {
    closeMenu();
    onEdit?.(goal);
  }, [closeMenu, goal, onEdit]);

  const handleDelete = useCallback(() => {
    closeMenu();
    onDelete?.(goal);
  }, [closeMenu, goal, onDelete]);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((previous) => !previous);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <article
      className="
        relative flex flex-col overflow-visible
        h-full
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm hover:shadow-md transition-shadow duration-200
      "
      data-goal-id={goalId}
    >
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div
        className="
          flex justify-between items-start
          p-5 pb-4
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
          >
            <Target
              className="
                w-5 h-5
              "
              strokeWidth={2}
              aria-hidden="true"
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
                font-semibold text-slate-900 text-sm truncate
              "
              title={name}
            >
              {name}
            </h3>

            <span
              className={`
                mt-1
                inline-flex
                items-center
                rounded-full
                border
                px-2 py-0.5
                text-[11px]
                font-medium
                ${status.className}
              `}
            >
              {status.isCompleted && (
                <CheckCircle2
                  className="
                    w-3 h-3
                    mr-1
                  "
                  aria-hidden="true"
                /
                >
              )}

              {status.label}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Actions menu                                                   */}
        {/* -------------------------------------------------------------- */}

        <div
          ref={menuRef}
          className="
            relative
            shrink-0
          "
        >
          <button
            type="button"
            onClick={handleMenuToggle}
            aria-label={`Actions for ${name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={
              menuOpen ? menuId : undefined
            }
            className="
              inline-flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-900
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
              transition-colors
            "
          >
            <MoreHorizontal
              className="
                w-5 h-5
              "
              aria-hidden="true"
            /
            >
          </button>

          {menuOpen && (
            <div
              id={menuId}
              role="menu"
              className="
                top-11 right-0 z-50 absolute overflow-hidden
                w-40
                py-1
                bg-white
                border border-slate-200 rounded-xl
                shadow-xl
              "
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleViewDetails}
                className="
                  flex items-center
                  w-full
                  px-3 py-2.5
                  text-slate-700 text-sm text-left
                  hover:bg-slate-50 focus:bg-slate-50
                  focus:outline-none
                  gap-2
                "
              >
                <ArrowRight
                  className="
                    w-4 h-4
                  "
                  aria-hidden="true"
                /
                >

                View details
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleEdit}
                className="
                  flex items-center
                  w-full
                  px-3 py-2.5
                  text-slate-700 text-sm text-left
                  hover:bg-slate-50 focus:bg-slate-50
                  focus:outline-none
                  gap-2
                "
              >
                <Pencil
                  className="
                    w-4 h-4
                  "
                  aria-hidden="true"
                /
                >

                Edit goal
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="
                  flex items-center
                  w-full
                  px-3 py-2.5
                  text-rose-600 text-sm text-left
                  hover:bg-rose-50 focus:bg-rose-50
                  focus:outline-none
                  gap-2
                "
              >
                Delete goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Financial summary                                                  */}
      {/* ================================================================== */}

      <div
        className="
          px-5
        "
      >
        <div
          className="
            p-4
            bg-slate-50
            border border-slate-100 rounded-xl
          "
        >
          <div
            className="
              flex justify-between items-start
              gap-4
            "
          >
            {/* ---------------------------------------------------------- */}
            {/* Saved amount                                               */}
            {/* ---------------------------------------------------------- */}

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-medium text-[11px] text-slate-500 uppercase tracking-wide
                "
              >
                Saved
              </p>

              <p
                className="
                  mt-1
                  font-bold text-slate-900 text-lg truncate
                "
                title={formattedCurrentAmount}
              >
                {formattedCurrentAmount}
              </p>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Target amount                                              */}
            {/* ---------------------------------------------------------- */}

            <div
              className="
                min-w-0
                text-right
              "
            >
              <p
                className="
                  font-medium text-[11px] text-slate-500 uppercase tracking-wide
                "
              >
                Target
              </p>

              <p
                className="
                  mt-1
                  font-bold text-blue-600 text-lg truncate
                "
                title={formattedTargetAmount}
              >
                {formattedTargetAmount}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Financial relationship                                       */}
          {/* ------------------------------------------------------------ */}

          <div
            className="
              flex justify-between items-center
              mt-3 pt-3
              border-slate-200/70 border-t
              gap-3
            "
          >
            <span
              className="
                text-slate-500 text-xs
              "
            >
              {roundedProgress}% of target
            </span>

            <span
              className="
                font-medium text-slate-700 text-xs truncate
              "
            >
              {status.isCompleted
                ? "Target reached"
                : `${formattedRemainingAmount} left`}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Progress                                                           */}
      {/* ================================================================== */}

      <div
        className="
          px-5 pt-5
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
              font-medium text-slate-600 text-xs
            "
          >
            Progress
          </span>

          <span
            className="
              font-bold text-slate-900 text-xs
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
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedProgress}
          aria-label={`${name} savings progress`}
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-[width] duration-300
            "
            style={{
              width: `${progress}%`,
            }}
          /
          >
        </div>
      </div>

      {/* ================================================================== */}
      {/* Remaining + target date                                            */}
      {/* ================================================================== */}

      <div
        className="
          grid grid-cols-2
          px-5 pt-5
          gap-3
        "
      >
        {/* -------------------------------------------------------------- */}
        {/* Remaining                                                       */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              text-slate-500
              gap-1.5
            "
          >
            <WalletCards
              className="
                w-3.5 h-3.5
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                font-medium text-[11px] uppercase tracking-wide
              "
            >
              Remaining
            </span>
          </div>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm truncate
            "
            title={
              status.isCompleted
                ? "Goal reached"
                : formattedRemainingAmount
            }
          >
            {status.isCompleted
              ? "Goal reached"
              : formattedRemainingAmount}
          </p>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Target date                                                    */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              text-slate-500
              gap-1.5
            "
          >
            <CalendarDays
              className="
                w-3.5 h-3.5
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                font-medium text-[11px] uppercase tracking-wide
              "
            >
              Target date
            </span>
          </div>

          <p
            className="
              mt-1
              font-semibold text-slate-900 text-sm truncate
            "
            title={formattedTargetDate}
          >
            {formattedTargetDate}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Footer                                                             */}
      {/* ================================================================== */}

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
          <Clock3
            className="
              w-3.5 h-3.5
            "
            aria-hidden="true"
          /
          >

          <span>
            {status.isCompleted
              ? "Completed"
              : targetDate
                ? "Target set"
                : "No deadline"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleViewDetails}
          className="
            inline-flex items-center
            font-semibold text-blue-600 hover:text-blue-700 text-xs
            focus:outline-none
            focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2
            transition-colors
            gap-1
          "
        >
          View details

          <ArrowRight
            className="
              w-3.5 h-3.5
            "
            aria-hidden="true"
          /
          >
        </button>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Public component                                                           */
/* -------------------------------------------------------------------------- */

/*
 * The wrapper guarantees that the main card component is never rendered with
 * an invalid goal. This keeps the component's hook execution deterministic.
 */
const SavingsGoalCard = (props) => {
  if (!props.goal) {
    return null;
  }

  return <SavingsGoalCardContent {...props} />;
};

export default memo(SavingsGoalCard);
