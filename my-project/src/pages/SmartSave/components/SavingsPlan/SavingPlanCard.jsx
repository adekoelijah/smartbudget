// components/.../SavingPlanCard.jsx

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

import SavingPlanProgress from "./SavingPlanProgress";
import SavingPlanStatusBadge from "./SavingPlanStatusBadge";

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
  formatSavingPlanRemainingDays,
} from "../../../../utils/smartSave/savingPlanFormatters";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_PLAN_NAME = "Untitled savings plan";

const DEFAULT_DESCRIPTION = "";

const ACTION_SELECTOR =
  "button, a, input, select, textarea, [role='menu'], [role='menuitem']";

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const cn = (...classes) =>
  classes
    .filter(Boolean)
    .join(" ");

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

const clampProgress = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, numericValue),
  );
};

const getPlanProgress = (plan) => {
  if (!plan || typeof plan !== "object") {
    return 0;
  }

  const explicitProgressValues = [
    plan.progress,
    plan.progressPercentage,
    plan.percentageComplete,
  ];

  for (const value of explicitProgressValues) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return clampProgress(numericValue);
    }
  }

  const targetAmount =
    Number(getSavingPlanTargetAmount(plan));

  const currentAmount =
    getCurrentAmount(plan);

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

const getDescription = (plan) => {
  if (!plan || typeof plan !== "object") {
    return DEFAULT_DESCRIPTION;
  }

  if (typeof plan.description !== "string") {
    return DEFAULT_DESCRIPTION;
  }

  return plan.description.trim();
};

/* -------------------------------------------------------------------------- */
/* SavingPlanCard                                                             */
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

  const [menuOpen, setMenuOpen] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Derived data                                                             */
  /* ------------------------------------------------------------------------ */

  const planId = useMemo(
    () => getSavingPlanId(plan),
    [plan],
  );

  const planName = useMemo(
    () =>
      getSavingPlanName(plan) ||
      DEFAULT_PLAN_NAME,
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

  const description = useMemo(
    () => getDescription(plan),
    [plan],
  );

  const active = useMemo(
    () => isSavingPlanActive(plan),
    [plan],
  );

  const paused = useMemo(
    () => isSavingPlanPaused(plan),
    [plan],
  );

  const completed = useMemo(
    () => isSavingPlanCompleted(plan),
    [plan],
  );

  const cancelled = useMemo(
    () => isSavingPlanCancelled(plan),
    [plan],
  );

  const busy =
    disabled ||
    deleting ||
    updating;

  const formattedTargetAmount = useMemo(
    () =>
      formatSavingPlanAmount(
        targetAmount,
        plan?.currency,
      ),
    [
      targetAmount,
      plan?.currency,
    ],
  );

  const formattedCurrentAmount = useMemo(
    () =>
      formatSavingPlanAmount(
        currentAmount,
        plan?.currency,
      ),
    [
      currentAmount,
      plan?.currency,
    ],
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
        ? formatSavingPlanRemainingDays(
            targetDate,
          )
        : null,
    [targetDate],
  );

  /* ------------------------------------------------------------------------ */
  /* Shared event protection                                                  */
  /* ------------------------------------------------------------------------ */

  const stopPropagation = useCallback(
    (event) => {
      event.stopPropagation();
    },
    [],
  );

  const isInteractiveTarget = useCallback(
    (target) => {
      if (!(target instanceof Element)) {
        return false;
      }

      return Boolean(
        target.closest(ACTION_SELECTOR),
      );
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
        isInteractiveTarget(event.target)
      ) {
        return;
      }

      if (typeof onView === "function") {
        onView(plan, event);
        return;
      }

      if (typeof onSelect === "function") {
        onSelect(plan, event);
      }
    },
    [
      busy,
      isInteractiveTarget,
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
        isInteractiveTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();

      if (typeof onView === "function") {
        onView(plan, event);
        return;
      }

      if (typeof onSelect === "function") {
        onSelect(plan, event);
      }
    },
    [
      busy,
      isInteractiveTarget,
      onView,
      onSelect,
      plan,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Menu                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleToggleMenu = useCallback(
    (event) => {
      event.stopPropagation();

      if (busy || !showActions) {
        return;
      }

      setMenuOpen(
        (current) => !current,
      );
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
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleView = useCallback(
    (event) => {
      event.stopPropagation();
      setMenuOpen(false);

      if (busy) {
        return;
      }

      if (typeof onView === "function") {
        onView(plan, event);
        return;
      }

      if (typeof onSelect === "function") {
        onSelect(plan, event);
      }
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
        typeof onEdit !== "function"
      ) {
        return;
      }

      onEdit(plan, event);
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
        typeof onDelete !== "function"
      ) {
        return;
      }

      onDelete(plan, event);
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
        typeof onPause !== "function"
      ) {
        return;
      }

      onPause(plan, event);
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
        typeof onResume !== "function"
      ) {
        return;
      }

      onResume(plan, event);
    },
    [
      busy,
      onResume,
      plan,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Card classes                                                             */
  /* ------------------------------------------------------------------------ */

  const cardClasses = cn(
    "group relative overflow-visible",
    "rounded-2xl border bg-white",
    "transition-all duration-200 ease-out",

    selected
      ? "border-blue-500 ring-2 ring-blue-500/10"
      : "border-slate-200",

    busy
      ? "cursor-not-allowed opacity-70"
      : [
          "cursor-pointer",
          "hover:-translate-y-0.5",
          "hover:border-slate-300",
          "hover:shadow-lg",
        ].join(" "),

    compact
      ? "p-4"
      : "p-5",

    className,
  );

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
      data-plan-id={
        planId !== null &&
        planId !== undefined
          ? String(planId)
          : undefined
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="flex justify-between items-start gap-4"
      >
        <div
          className="flex items-start gap-3 min-w-0"
        >
          <div
            className={cn(
              "flex shrink-0",
              "items-center justify-center",
              "rounded-xl",
              "bg-blue-50 text-blue-600",
              compact
                ? "h-9 w-9"
                : "h-10 w-10",
            )}
            aria-hidden="true"
          >
            <Target
              size={
                compact
                  ? 18
                  : 20
              }
              strokeWidth={2}
            />
          </div>

          <div
            className="min-w-0"
          >
            <h3
              className={cn(
                "font-semibold truncate",
                "text-slate-900",
                compact
                  ? "text-sm"
                  : "text-base",
              )}
              title={planName}
            >
              {planName}
            </h3>

            <div
              className="mt-1"
            >
              <SavingPlanStatusBadge
                plan={plan}
                status={planStatus}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Actions                                                         */}
        {/* -------------------------------------------------------------- */}

        {showActions && (
          <div
            className="relative shrink-0"
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
          >
            <button
              type="button"
              onClick={handleToggleMenu}
              disabled={busy}
              aria-label={`Actions for ${planName}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={
                menuOpen
                  ? menuId
                  : undefined
              }
              className="inline-flex justify-center items-center hover:bg-slate-100 disabled:opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-9 h-9 text-slate-500 hover:text-slate-700 transition-colors disabled:cursor-not-allowed"
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
                onMouseDown={stopPropagation}
                className="top-11 right-0 z-50 absolute bg-white shadow-slate-900/10 shadow-xl p-1.5 border border-slate-200 rounded-xl w-48 overflow-hidden"
              >
                {/* View */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleView}
                  disabled={busy}
                  className="flex items-center gap-3 hover:bg-slate-50 focus:bg-slate-50 disabled:opacity-50 px-3 py-2.5 rounded-lg focus:outline-none w-full text-slate-700 text-sm text-left transition-colors disabled:cursor-not-allowed"
                >
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    View plan
                  </span>
                </button>

                {/* Edit */}
                {typeof onEdit ===
                  "function" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleEdit}
                    disabled={busy}
                    className="flex items-center gap-3 hover:bg-slate-50 focus:bg-slate-50 disabled:opacity-50 px-3 py-2.5 rounded-lg focus:outline-none w-full text-slate-700 text-sm text-left transition-colors disabled:cursor-not-allowed"
                  >
                    <Pencil
                      size={16}
                      aria-hidden="true"
                    />

                    <span>
                      Edit plan
                    </span>
                  </button>
                )}

                {/* Pause */}
                {active &&
                  typeof onPause ===
                    "function" && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handlePause}
                      disabled={busy}
                      className="flex items-center gap-3 hover:bg-amber-50 focus:bg-amber-50 disabled:opacity-50 px-3 py-2.5 rounded-lg focus:outline-none w-full text-amber-700 text-sm text-left transition-colors disabled:cursor-not-allowed"
                    >
                      <PauseCircle
                        size={16}
                        aria-hidden="true"
                      />

                      <span>
                        Pause plan
                      </span>
                    </button>
                  )}

                {/* Resume */}
                {paused &&
                  typeof onResume ===
                    "function" && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleResume}
                      disabled={busy}
                      className="flex items-center gap-3 hover:bg-emerald-50 focus:bg-emerald-50 disabled:opacity-50 px-3 py-2.5 rounded-lg focus:outline-none w-full text-emerald-700 text-sm text-left transition-colors disabled:cursor-not-allowed"
                    >
                      <PlayCircle
                        size={16}
                        aria-hidden="true"
                      />

                      <span>
                        Resume plan
                      </span>
                    </button>
                  )}

                {/* Delete */}
                {typeof onDelete ===
                  "function" && (
                  <>
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="my-1 border-slate-100 border-t"
                      /
                    >

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                      disabled={busy}
                      className="flex items-center gap-3 hover:bg-red-50 focus:bg-red-50 disabled:opacity-50 px-3 py-2.5 rounded-lg focus:outline-none w-full text-red-600 text-sm text-left transition-colors disabled:cursor-not-allowed"
                    >
                      <Trash2
                        size={16}
                        aria-hidden="true"
                      />

                      <span>
                        Delete plan
                      </span>
                    </button>
                  </>
                )}

                {/* Close */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={closeMenu}
                  className="flex items-center gap-3 hover:bg-slate-50 focus:bg-slate-50 mt-0.5 px-3 py-2.5 rounded-lg focus:outline-none w-full text-slate-500 text-sm text-left transition-colors"
                >
                  <span>
                    Close
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Description                                                         */}
      {/* ------------------------------------------------------------------ */}

      {showDescription &&
        description && (
          <p
            className={cn(
              "mt-4 text-sm",
              "leading-6 text-slate-500",
              compact
                ? "line-clamp-2"
                : "line-clamp-3",
            )}
          >
            {description}
          </p>
        )}

      {/* ------------------------------------------------------------------ */}
      {/* Amount Summary                                                      */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={
          compact
            ? "mt-4"
            : "mt-5"
        }
      >
        <div
          className="flex justify-between items-end gap-4"
        >
          <div
            className="min-w-0"
          >
            <p
              className="font-medium text-slate-400 text-xs uppercase tracking-wider"
            >
              Saved
            </p>

            <p
              className={cn(
                "mt-1 font-bold truncate",
                "text-slate-900",
                compact
                  ? "text-lg"
                  : "text-xl",
              )}
            >
              {formattedCurrentAmount}
            </p>
          </div>

          <div
            className="text-right shrink-0"
          >
            <p
              className="font-medium text-slate-400 text-xs uppercase tracking-wider"
            >
              Target
            </p>

            <p
              className="mt-1 font-semibold text-slate-700"
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
          className="mt-4"
        >
          <SavingPlanProgress
            plan={plan}
            currentAmount={currentAmount}
            targetAmount={targetAmount}
            progress={progress}
            compact={compact}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={cn(
          "flex flex-wrap mt-5",
          "items-center gap-x-5 gap-y-2",
          "border-t border-slate-100 pt-4",
          compact
            ? "text-xs"
            : "text-sm",
        )}
      >
        {/* Target date */}
        <div
          className="flex items-center gap-2 text-slate-500"
        >
          <CalendarDays
            size={15}
            aria-hidden="true"
          />

          <span>
            {formattedTargetDate}
          </span>
        </div>

        {/* Remaining time */}
        {remainingDays && (
          <div
            className="flex items-center gap-2 text-slate-500"
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

        {/* Completed */}
        {completed && (
          <div
            className="flex items-center gap-1.5 ml-auto font-medium text-emerald-600"
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

        {/* Cancelled */}
        {cancelled && (
          <div
            className="ml-auto font-medium text-red-600"
          >
            Cancelled
          </div>
        )}

        {/* Paused */}
        {paused && (
          <div
            className="flex items-center gap-1.5 ml-auto font-medium text-amber-600"
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
      {/* View affordance                                                     */}
      {/* ------------------------------------------------------------------ */}

      {!showActions && !busy && (
        <div
          aria-hidden="true"
          className="right-5 bottom-5 absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <ChevronRight
            size={18}
            className="text-slate-400"
            /
          >
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Delete overlay                                                      */}
      {/* ------------------------------------------------------------------ */}

      {deleting && (
        <div
          aria-live="polite"
          aria-busy="true"
          className="z-40 absolute inset-0 flex justify-center items-center bg-white/75 backdrop-blur-[1px] rounded-2xl"
        >
          <div
            className="bg-white shadow-sm px-4 py-2 rounded-lg ring-1 ring-slate-200 font-medium text-slate-700 text-sm"
          >
            Deleting plan…
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Updating overlay                                                    */}
      {/* ------------------------------------------------------------------ */}

      {updating && !deleting && (
        <div
          aria-live="polite"
          aria-busy="true"
          className="z-40 absolute inset-0 flex justify-center items-center bg-white/65 backdrop-blur-[1px] rounded-2xl"
        >
          <div
            className="bg-white shadow-sm px-4 py-2 rounded-lg ring-1 ring-slate-200 font-medium text-slate-700 text-sm"
          >
            Updating plan…
          </div>
        </div>
      )}
    </article>
  );
};

SavingPlanCard.displayName =
  "SavingPlanCard";

export default memo(SavingPlanCard);