import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MoreVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Target,
  Trash2,
} from "lucide-react";
import {
  memo,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import {
  getSavingPlanId,
  getSavingPlanName,
  getSavingPlanStatus,
  getSavingPlanTargetAmount,
  getSavingPlanTargetDate,
  isSavingPlanActive,
  isSavingPlanCancelled,
  isSavingPlanCompleted,
  isSavingPlanPaused,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanAmount,
  formatSavingPlanDate,
  formatSavingPlanProgress,
  formatSavingPlanRemainingDays,
  formatSavingPlanStatus,
} from "../../../../utils/smartSave/savingPlanFormatters";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES = {
  active: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },

  in_progress: {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },

  "in-progress": {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },

  ongoing: {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },

  completed: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },

  complete: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },

  achieved: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },

  paused: {
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },

  pause: {
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },

  cancelled: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },

  canceled: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },

  failed: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },

  default: {
    badge:
      "bg-slate-50 text-slate-700 ring-slate-600/20",
    dot: "bg-slate-400",
  },
};

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

const clampProgress = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
};

const getCurrentAmount = (plan) => {
  if (!plan || typeof plan !== "object") {
    return 0;
  }

  const candidates = [
    plan.currentAmount,
    plan.savedAmount,
    plan.amountSaved,
    plan.totalSaved,
    plan.progressAmount,
  ];

  for (const value of candidates) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return Math.max(0, numericValue);
    }
  }

  return 0;
};

const getPlanProgress = (plan) => {
  if (!plan || typeof plan !== "object") {
    return 0;
  }

  const candidates = [
    plan.progress,
    plan.progressPercentage,
    plan.percentageComplete,
  ];

  for (const value of candidates) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return clampProgress(numericValue);
    }
  }

  const targetAmount = getSavingPlanTargetAmount(plan);
  const currentAmount = getCurrentAmount(plan);

  if (
    Number.isFinite(targetAmount) &&
    targetAmount > 0
  ) {
    return clampProgress(
      (currentAmount / targetAmount) * 100,
    );
  }

  return 0;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const SavingPlanCard = ({
  plan,

  onEdit,
  onDelete,
  onView,
  onPause,
  onResume,
  onSelect,

  selected = false,
  disabled = false,
  deleting = false,
  updating = false,

  showActions = true,
  showDescription = true,
  showProgress = true,

  compact = false,

  className = "",
}) => {
  const menuId = useId();

  const [menuOpen, setMenuOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Derived plan data                                                       */
  /* ------------------------------------------------------------------------ */

  const planId = useMemo(
    () => getSavingPlanId(plan),
    [plan],
  );

  const planName = useMemo(
    () => getSavingPlanName(plan) || "Untitled savings plan",
    [plan],
  );

  const planStatus = useMemo(
    () => getSavingPlanStatus(plan),
    [plan],
  );

  const targetAmount = useMemo(
    () => getSavingPlanTargetAmount(plan),
    [plan],
  );

  const targetDate = useMemo(
    () => getSavingPlanTargetDate(plan),
    [plan],
  );

  const currentAmount = useMemo(
    () => getCurrentAmount(plan),
    [plan],
  );

  const progress = useMemo(
    () => getPlanProgress(plan),
    [plan],
  );

  const statusStyle = useMemo(
    () =>
      STATUS_STYLES[planStatus] ??
      STATUS_STYLES.default,
    [planStatus],
  );

  const statusLabel = useMemo(
    () =>
      formatSavingPlanStatus(
        planStatus || "unknown",
      ),
    [planStatus],
  );

  const formattedTargetAmount = useMemo(
    () =>
      formatSavingPlanAmount(
        targetAmount,
        plan?.currency,
      ),
    [targetAmount, plan?.currency],
  );

  const formattedCurrentAmount = useMemo(
    () =>
      formatSavingPlanAmount(
        currentAmount,
        plan?.currency,
      ),
    [currentAmount, plan?.currency],
  );

  const formattedProgress = useMemo(
    () =>
      formatSavingPlanProgress(progress),
    [progress],
  );

  const formattedTargetDate = useMemo(
    () =>
      targetDate
        ? formatSavingPlanDate(targetDate)
        : "No target date",
    [targetDate],
  );

  const remainingDays = useMemo(
    () =>
      targetDate
        ? formatSavingPlanRemainingDays(targetDate)
        : null,
    [targetDate],
  );

  const description = useMemo(() => {
    if (
      !plan ||
      typeof plan !== "object"
    ) {
      return "";
    }

    return typeof plan.description === "string"
      ? plan.description.trim()
      : "";
  }, [plan]);

  const active =
    isSavingPlanActive(plan);

  const paused =
    isSavingPlanPaused(plan);

  const completed =
    isSavingPlanCompleted(plan);

  const cancelled =
    isSavingPlanCancelled(plan);

  const busy =
    disabled ||
    deleting ||
    updating;

  /* ------------------------------------------------------------------------ */
  /* Event propagation                                                        */
  /* ------------------------------------------------------------------------ */

  const stopPropagation = useCallback(
    (event) => {
      event.stopPropagation();
    },
    [],
  );

  const stopPointerPropagation = useCallback(
    (event) => {
      event.stopPropagation();
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* Card interaction                                                         */
  /* ------------------------------------------------------------------------ */

  const handleCardClick = useCallback(
    (event) => {
      if (busy) {
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "button, a, input, select, textarea, [role='menu'], [role='menuitem']",
        )
      ) {
        return;
      }

      if (onView) {
        onView(plan);
        return;
      }

      if (onSelect) {
        onSelect(plan);
      }
    },
    [
      busy,
      onView,
      onSelect,
      plan,
    ],
  );

  const handleCardKeyDown = useCallback(
    (event) => {
      if (busy) {
        return;
      }

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "button, a, input, select, textarea, [role='menu'], [role='menuitem']",
        )
      ) {
        return;
      }

      event.preventDefault();

      if (onView) {
        onView(plan);
        return;
      }

      if (onSelect) {
        onSelect(plan);
      }
    },
    [
      busy,
      onView,
      onSelect,
      plan,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Menu interaction                                                         */
  /* ------------------------------------------------------------------------ */

  const handleToggleMenu = useCallback(
    (event) => {
      event.stopPropagation();

      if (busy || !showActions) {
        return;
      }

      setMenuOpen((current) => !current);
    },
    [
      busy,
      showActions,
    ],
  );

  const closeMenu = useCallback(
    (event) => {
      event.stopPropagation();
      setMenuOpen(false);
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* Action handlers                                                          */
  /* ------------------------------------------------------------------------ */

  const handleView = useCallback(
    (event) => {
      event.stopPropagation();

      setMenuOpen(false);

      if (busy) {
        return;
      }

      if (onView) {
        onView(plan);
        return;
      }

      onSelect?.(plan);
    },
    [
      busy,
      onView,
      onSelect,
      plan,
    ],
  );

  const handleEdit = useCallback(
    (event) => {
      event.stopPropagation();

      setMenuOpen(false);

      if (
        busy ||
        !onEdit
      ) {
        return;
      }

      onEdit(plan);
    },
    [
      busy,
      onEdit,
      plan,
    ],
  );

  const handleDelete = useCallback(
    (event) => {
      event.stopPropagation();

      setMenuOpen(false);

      if (
        busy ||
        !onDelete
      ) {
        return;
      }

      onDelete(plan);
    },
    [
      busy,
      onDelete,
      plan,
    ],
  );

  const handlePause = useCallback(
    (event) => {
      event.stopPropagation();

      setMenuOpen(false);

      if (
        busy ||
        !onPause
      ) {
        return;
      }

      onPause(plan);
    },
    [
      busy,
      onPause,
      plan,
    ],
  );

  const handleResume = useCallback(
    (event) => {
      event.stopPropagation();

      setMenuOpen(false);

      if (
        busy ||
        !onResume
      ) {
        return;
      }

      onResume(plan);
    },
    [
      busy,
      onResume,
      plan,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Class names                                                              */
  /* ------------------------------------------------------------------------ */

  const cardClasses = [
    "group",
    "relative",
    "overflow-visible",
    "rounded-2xl",
    "border",
    "bg-white",
    "transition-all",
    "duration-200",
    "ease-out",

    selected
      ? "border-blue-500 ring-2 ring-blue-500/10"
      : "border-slate-200",

    busy
      ? "cursor-not-allowed opacity-70"
      : "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",

    compact
      ? "p-4"
      : "p-5",

    className,
  ]
    .filter(Boolean)
    .join(" ");

  const progressBarWidth = `${progress}%`;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <article
      className={cardClasses}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={busy ? -1 : 0}
      role="button"
      aria-disabled={busy}
      aria-pressed={
        selected
          ? "true"
          : "false"
      }
      data-plan-id={planId || undefined}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          flex justify-between items-start
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
            className={[
              "flex shrink-0 items-center justify-center rounded-xl",
              compact
                ? "h-9 w-9"
                : "h-10 w-10",
              "bg-blue-50 text-blue-600",
            ].join(" ")}
            aria-hidden="true"
          >
            <Target
              size={compact ? 18 : 20}
              strokeWidth={2}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              className={[
                "truncate font-semibold text-slate-900",
                compact
                  ? "text-sm"
                  : "text-base",
              ].join(" ")}
              title={planName}
            >
              {planName}
            </h3>

            <div
              className="
                flex flex-wrap items-center
                mt-1
                gap-2
              "
            >
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                  statusStyle.badge,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    statusStyle.dot,
                  ].join(" ")}
                  aria-hidden="true"
                />

                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Actions                                                         */}
        {/* -------------------------------------------------------------- */}

        {showActions && (
          <div
            className="
              relative
              shrink-0
            "
            onClick={stopPropagation}
            onMouseDown={stopPointerPropagation}
          >
            <button
              type="button"
              onClick={handleToggleMenu}
              disabled={busy}
              aria-label={`Actions for ${planName}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                "text-slate-500",
                "transition-colors",
                "hover:bg-slate-100 hover:text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              <MoreVertical
                size={18}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label={`${planName} actions`}
                onClick={stopPropagation}
                onMouseDown={stopPointerPropagation}
                className={[
                  "absolute right-0 top-11 z-50 w-48",
                  "overflow-hidden rounded-xl",
                  "border border-slate-200",
                  "bg-white",
                  "p-1.5",
                  "shadow-xl shadow-slate-900/10",
                ].join(" ")}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleView}
                  disabled={busy}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-left text-sm text-slate-700",
                    "transition-colors",
                    "hover:bg-slate-50",
                    "focus:bg-slate-50 focus:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  ].join(" ")}
                >
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                  View plan
                </button>

                {onEdit && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEdit}
                    disabled={busy}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                      "text-left text-sm text-slate-700",
                      "transition-colors",
                      "hover:bg-slate-50",
                      "focus:bg-slate-50 focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    ].join(" ")}
                  >
                    <Pencil
                      size={16}
                      aria-hidden="true"
                    />
                    Edit plan
                  </button>
                )}

                {active && onPause && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handlePause}
                    disabled={busy}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                      "text-left text-sm text-amber-700",
                      "transition-colors",
                      "hover:bg-amber-50",
                      "focus:bg-amber-50 focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    ].join(" ")}
                  >
                    <PauseCircle
                      size={16}
                      aria-hidden="true"
                    />
                    Pause plan
                  </button>
                )}

                {paused && onResume && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleResume}
                    disabled={busy}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                      "text-left text-sm text-emerald-700",
                      "transition-colors",
                      "hover:bg-emerald-50",
                      "focus:bg-emerald-50 focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    ].join(" ")}
                  >
                    <PlayCircle
                      size={16}
                      aria-hidden="true"
                    />
                    Resume plan
                  </button>
                )}

                {onDelete && (
                  <>
                    <div
                      className="
                        my-1
                        border-slate-100 border-t
                      "
                      role="separator"
                    /
                    >

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                      disabled={busy}
                      className={[
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                        "text-left text-sm text-red-600",
                        "transition-colors",
                        "hover:bg-red-50",
                        "focus:bg-red-50 focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      ].join(" ")}
                    >
                      <Trash2
                        size={16}
                        aria-hidden="true"
                      />
                      Delete plan
                    </button>
                  </>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={closeMenu}
                  className={[
                    "mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-left text-sm text-slate-500",
                    "transition-colors",
                    "hover:bg-slate-50",
                    "focus:bg-slate-50 focus:outline-none",
                  ].join(" ")}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Description                                                         */}
      {/* ------------------------------------------------------------------ */}

      {showDescription && description && (
        <p
          className={[
            "mt-4 text-sm leading-6 text-slate-500",
            compact
              ? "line-clamp-2"
              : "line-clamp-3",
          ].join(" ")}
        >
          {description}
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Amount                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={
          compact
            ? "mt-4"
            : "mt-5"
        }
      >
        <div
          className="
            flex justify-between items-end
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
                font-medium text-slate-400 text-xs uppercase tracking-wide
              "
            >
              Saved
            </p>

            <p
              className={[
                "mt-1 truncate font-bold text-slate-900",
                compact
                  ? "text-lg"
                  : "text-xl",
              ].join(" ")}
            >
              {formattedCurrentAmount}
            </p>
          </div>

          <div
            className="
              text-right
              shrink-0
            "
          >
            <p
              className="
                font-medium text-slate-400 text-xs uppercase tracking-wide
              "
            >
              Target
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-700
              "
            >
              {formattedTargetAmount}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Progress                                                            */}
      {/* ------------------------------------------------------------------ */}

      {showProgress && (
        <div
          className="
            mt-4
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
                font-semibold text-slate-700 text-xs
              "
            >
              {formattedProgress}
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
            aria-valuenow={progress}
            aria-label={`${planName} progress`}
          >
            <div
              className={[
                "h-full rounded-full",
                "bg-blue-600",
                "transition-[width] duration-300 ease-out",
              ].join(" ")}
              style={{
                width: progressBarWidth,
              }}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer metadata                                                     */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={[
          "mt-5 flex flex-wrap items-center gap-x-5 gap-y-2",
          "border-t border-slate-100 pt-4",
          compact ? "text-xs" : "text-sm",
        ].join(" ")}
      >
        <div
          className="
            flex items-center
            text-slate-500
            gap-2
          "
        >
          <CalendarDays
            size={15}
            aria-hidden="true"
          />

          <span>
            {formattedTargetDate}
          </span>
        </div>

        {remainingDays && (
          <div
            className="
              flex items-center
              text-slate-500
              gap-2
            "
          >
            <Clock3
              size={15}
              aria-hidden="true"
            />

            <span>
              {remainingDays}
            </span>
          </div>
        )}

        {completed && (
          <div
            className="
              flex items-center
              ml-auto
              font-medium text-emerald-600
              gap-1.5
            "
          >
            <CheckCircle2
              size={15}
              aria-hidden="true"
            />

            <span>
              Completed
            </span>
          </div>
        )}

        {cancelled && (
          <div
            className="
              ml-auto
              font-medium text-red-600
            "
          >
            Cancelled
          </div>
        )}

        {paused && (
          <div
            className="
              flex items-center
              ml-auto
              font-medium text-amber-600
              gap-1.5
            "
          >
            <PauseCircle
              size={15}
              aria-hidden="true"
            />

            <span>
              Paused
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Explicit view affordance                                           */}
      {/* ------------------------------------------------------------------ */}

      {!showActions && !busy && (
        <div
          className="
            right-5 bottom-5 absolute
            opacity-0 transition-opacity
            pointer-events-none
            group-hover:opacity-100
          "
        >
          <ChevronRight
            size={18}
            className="
              text-slate-400
            "
            aria-hidden="true"
          /
          >
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Busy overlay                                                        */}
      {/* ------------------------------------------------------------------ */}

      {deleting && (
        <div
          className="
            z-40 absolute inset-0 flex justify-center items-center
            bg-white/70
            rounded-2xl
            backdrop-blur-[1px]
          "
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="
              px-4 py-2
              font-medium text-slate-700 text-sm
              bg-white
              rounded-lg ring-1 ring-slate-200
              shadow-sm
            "
          >
            Deleting plan…
          </div>
        </div>
      )}

      {updating && !deleting && (
        <div
          className="
            z-40 absolute inset-0 flex justify-center items-center
            bg-white/60
            rounded-2xl
            backdrop-blur-[1px]
          "
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="
              px-4 py-2
              font-medium text-slate-700 text-sm
              bg-white
              rounded-lg ring-1 ring-slate-200
              shadow-sm
            "
          >
            Updating plan…
          </div>
        </div>
      )}
    </article>
  );
};

SavingPlanCard.displayName = "SavingPlanCard";

export default memo(SavingPlanCard);