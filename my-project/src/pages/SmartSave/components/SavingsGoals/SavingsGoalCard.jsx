
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
 * ---------------------------------------------------------------------------
 * SavingsGoalCard
 * ---------------------------------------------------------------------------
 * Presentation component for an individual savings goal.
 *
 * Responsibilities:
 * - Display normalized goal information.
 * - Calculate safe presentation values.
 * - Provide view/edit/delete actions.
 * - Display compact savings progress.
 *
 * Business logic should remain in:
 *   hook -> service -> API
 *
 * This component intentionally does NOT:
 * - Fetch data.
 * - Mutate server state directly.
 * - Contain API/business rules.
 * - Render a separate progress component.
 * ---------------------------------------------------------------------------
 */

const SavingsGoalCard = ({
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
  /* Close menu when clicking outside                                         */
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

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  /* ------------------------------------------------------------------------ */
  /* Event handlers                                                           */
  /* ------------------------------------------------------------------------ */

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!goal) {
      return;
    }

    closeMenu();
    onView?.(goal);
  }, [closeMenu, goal, onView]);

  const handleEdit = useCallback(() => {
    if (!goal) {
      return;
    }

    closeMenu();
    onEdit?.(goal);
  }, [closeMenu, goal, onEdit]);

  const handleDelete = useCallback(() => {
    if (!goal) {
      return;
    }

    closeMenu();
    onDelete?.(goal);
  }, [closeMenu, goal, onDelete]);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((previous) => !previous);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Render guard                                                             */
  /* ------------------------------------------------------------------------ */
  /*
   * IMPORTANT:
   *
   * This conditional return MUST come after every hook.
   *
   * React requires hooks to execute in the same order on every render.
   */

  if (!goal) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Safe value helpers                                                       */
  /* ------------------------------------------------------------------------ */

  const toFiniteNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  };

  const getFirstDefined = (...values) => {
    return values.find(
      (value) => value !== undefined && value !== null,
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Goal identity                                                             */
  /* ------------------------------------------------------------------------ */

  const goalId = getFirstDefined(
    goal._id,
    goal.id,
    goal.goalId,
  );

  /* ------------------------------------------------------------------------ */
  /* Basic goal information                                                   */
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
   * Remaining amount is derived from the authoritative target/current values
   * rather than blindly trusting a potentially stale backend field.
   *
   * This prevents cases where:
   *
   * target = ₦500,000
   * saved  = ₦300,000
   * remainingAmount = ₦500,000
   *
   * from being displayed incorrectly.
   */

  const remainingAmount = Math.max(
    targetAmount - currentAmount,
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Progress                                                                 */
  /* ------------------------------------------------------------------------ */

  const calculatedProgress =
    targetAmount > 0
      ? (currentAmount / targetAmount) * 100
      : 0;

  const backendProgress = toFiniteNumber(
    getFirstDefined(
      goal.progressPercentage,
      goal.progress,
      goal.percentage,
    ),
    calculatedProgress,
  );

  /*
   * Prefer calculated financial progress because it keeps the visual state
   * synchronized with the displayed saved and target amounts.
   */

  const progress = Math.min(
    Math.max(
      targetAmount > 0
        ? calculatedProgress
        : backendProgress,
      0,
    ),
    100,
  );

  /* ------------------------------------------------------------------------ */
  /* Status                                                                   */
  /* ------------------------------------------------------------------------ */

  const rawStatus =
    getFirstDefined(
      goal.status,
      goal.state,
    ) || "active";

  const normalizedStatus = String(rawStatus)
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

  const statusLabel = isCompleted
    ? "Completed"
    : isPaused
      ? "Paused"
      : isCancelled
        ? "Cancelled"
        : "Active";

  const statusClassName = isCompleted
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isPaused
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : isCancelled
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  /* ------------------------------------------------------------------------ */
  /* Target date                                                              */
  /* ------------------------------------------------------------------------ */

  const targetDate = getFirstDefined(
    goal.targetDate,
    goal.deadline,
    goal.endDate,
  );

  const formattedTargetDate = targetDate
    ? new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(targetDate))
    : "No target date";

  /* ------------------------------------------------------------------------ */
  /* Currency formatter                                                       */
  /* ------------------------------------------------------------------------ */

  const formatCurrency = (amount) => {
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
        group
      "
      data-goal-id={goalId}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

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
                px-2
                py-0.5
                text-[11px]
                font-medium
                ${statusClassName}
              `}
            >
              {isCompleted && (
                <CheckCircle2
                  className="
                    w-3 h-3
                    mr-1
                  "
                  aria-hidden="true"
                /
                >
              )}

              {statusLabel}
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Actions menu                                                    */}
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
            aria-controls={menuOpen ? menuId : undefined}
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
                  hover:bg-slate-50
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
                  hover:bg-slate-50
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
                  hover:bg-rose-50
                  gap-2
                "
              >
                Delete goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Financial summary                                                  */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          px-5
        "
      >
        <div
          className="
            grid grid-cols-2
            gap-3
          "
        >
          <div
            className="
              p-3
              bg-slate-50
              border border-slate-100 rounded-xl
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
                font-bold text-slate-900 text-sm truncate
              "
            >
              {formatCurrency(currentAmount)}
            </p>
          </div>

          <div
            className="
              p-3
              bg-slate-50
              border border-slate-100 rounded-xl
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
                font-bold text-slate-900 text-sm truncate
              "
            >
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Progress                                                           */}
      {/* ------------------------------------------------------------------ */}

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
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
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

      {/* ------------------------------------------------------------------ */}
      {/* Remaining + target date                                            */}
      {/* ------------------------------------------------------------------ */}

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
          >
            {isCompleted
              ? "Goal reached"
              : formatCurrency(remainingAmount)}
          </p>
        </div>

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
          >
            {formattedTargetDate}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          flex justify-between items-center
          mt-5 px-5 py-4
          border-slate-100 border-t
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
            {isCompleted
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

export default memo(SavingsGoalCard);
