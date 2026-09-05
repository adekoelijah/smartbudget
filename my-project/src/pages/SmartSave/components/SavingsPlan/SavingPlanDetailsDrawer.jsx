import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Pencil,
  PauseCircle,
  PlayCircle,
  Target,
  Trash2,
  X,
} from "lucide-react";
import {
  memo,
  useCallback,
  useId,
  useMemo,
  useRef,
} from "react";

import {
  getSavingPlanDescription,
  getSavingPlanId,
  getSavingPlanName,
  getSavingPlanStatus,
  getSavingPlanTargetAmount,
  getSavingPlanTargetDate,
  isSavingPlanActive,
  isSavingPlanCompleted,
  isSavingPlanFailed,
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
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },

  in_progress: {
    container:
      "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },

  "in-progress": {
    container:
      "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },

  ongoing: {
    container:
      "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },

  completed: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },

  complete: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },

  achieved: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },

  paused: {
    container:
      "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },

  pause: {
    container:
      "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },

  cancelled: {
    container:
      "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },

  canceled: {
    container:
      "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },

  failed: {
    container:
      "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },

  default: {
    container:
      "border-slate-200 bg-slate-50 text-slate-700",
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

  return Math.min(
    100,
    Math.max(0, numericValue),
  );
};

const getCurrentAmount = (plan) => {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
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
      return Math.max(
        0,
        numericValue,
      );
    }
  }

  return 0;
};

const getProgress = (plan) => {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
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
      return clampProgress(
        numericValue,
      );
    }
  }

  const targetAmount =
    getSavingPlanTargetAmount(plan);

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

const getPlanCreatedDate = (plan) => {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  return (
    plan.createdAt ??
    plan.createdDate ??
    null
  );
};

const getPlanUpdatedDate = (plan) => {
  if (
    !plan ||
    typeof plan !== "object"
  ) {
    return null;
  }

  return (
    plan.updatedAt ??
    plan.updatedDate ??
    null
  );
};

const getErrorText = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object"
  ) {
    return (
      error.message ??
      error.error ??
      error.detail ??
      "An unexpected error occurred."
    );
  }

  return "An unexpected error occurred.";
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const SavingPlanDetailsDrawer = ({
  open = false,
  plan = null,

  onClose,
  onEdit,
  onDelete,
  onPause,
  onResume,

  deleting = false,
  updating = false,

  error = null,

  showActions = true,

  className = "",
}) => {
  const drawerId = useId();

  const titleId =
    `${drawerId}-title`;

  const descriptionId =
    `${drawerId}-description`;

  const closeButtonRef =
    useRef(null);

  /* ------------------------------------------------------------------------ */
  /* Derived plan data                                                        */
  /* ------------------------------------------------------------------------ */

  const planId = useMemo(
    () =>
      getSavingPlanId(plan),
    [plan],
  );

  const planName = useMemo(
    () =>
      getSavingPlanName(plan) ||
      "Savings plan",
    [plan],
  );

  const planDescription = useMemo(
    () =>
      getSavingPlanDescription(plan),
    [plan],
  );

  const planStatus = useMemo(
    () =>
      getSavingPlanStatus(plan),
    [plan],
  );

  const targetAmount = useMemo(
    () =>
      getSavingPlanTargetAmount(plan),
    [plan],
  );

  const targetDate = useMemo(
    () =>
      getSavingPlanTargetDate(plan),
    [plan],
  );

  const currentAmount = useMemo(
    () =>
      getCurrentAmount(plan),
    [plan],
  );

  const progress = useMemo(
    () =>
      getProgress(plan),
    [plan],
  );

  const createdDate = useMemo(
    () =>
      getPlanCreatedDate(plan),
    [plan],
  );

  const updatedDate = useMemo(
    () =>
      getPlanUpdatedDate(plan),
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

  const formattedTargetAmount =
    useMemo(
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

  const formattedCurrentAmount =
    useMemo(
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

  const formattedTargetDate =
    useMemo(
      () =>
        targetDate
          ? formatSavingPlanDate(
              targetDate,
            )
          : "No target date",
      [targetDate],
    );

  const formattedProgress =
    useMemo(
      () =>
        formatSavingPlanProgress(
          progress,
        ),
      [progress],
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

  const formattedCreatedDate =
    useMemo(
      () =>
        createdDate
          ? formatSavingPlanDate(
              createdDate,
            )
          : null,
      [createdDate],
    );

  const formattedUpdatedDate =
    useMemo(
      () =>
        updatedDate
          ? formatSavingPlanDate(
              updatedDate,
            )
          : null,
      [updatedDate],
    );

  const active =
    isSavingPlanActive(plan);

  const paused =
    isSavingPlanPaused(plan);

  const completed =
    isSavingPlanCompleted(plan);

  const failed =
    isSavingPlanFailed(plan);

  const busy =
    deleting ||
    updating;

  const errorMessage =
    getErrorText(error);

  /* ------------------------------------------------------------------------ */
  /* Close                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleClose = useCallback(
    (event) => {
      event?.stopPropagation();

      if (busy) {
        return;
      }

      onClose?.();
    },
    [
      busy,
      onClose,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Keyboard handling                                                        */
  /* ------------------------------------------------------------------------ */

  const handleKeyDown = useCallback(
    (event) => {
      if (!open) {
        return;
      }

      if (
        event.key === "Escape" &&
        !busy
      ) {
        event.preventDefault();
        event.stopPropagation();

        onClose?.();
      }
    },
    [
      open,
      busy,
      onClose,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Backdrop                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleBackdropClick =
    useCallback(
      (event) => {
        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        handleClose(event);
      },
      [handleClose],
    );

  /* ------------------------------------------------------------------------ */
  /* Prevent event bubbling                                                   */
  /* ------------------------------------------------------------------------ */

  const stopPropagation =
    useCallback(
      (event) => {
        event.stopPropagation();
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleEdit = useCallback(
    (event) => {
      event.stopPropagation();

      if (
        busy ||
        !plan ||
        !onEdit
      ) {
        return;
      }

      onEdit(plan);
    },
    [
      busy,
      plan,
      onEdit,
    ],
  );

  const handleDelete = useCallback(
    (event) => {
      event.stopPropagation();

      if (
        busy ||
        !plan ||
        !onDelete
      ) {
        return;
      }

      onDelete(plan);
    },
    [
      busy,
      plan,
      onDelete,
    ],
  );

  const handlePause = useCallback(
    (event) => {
      event.stopPropagation();

      if (
        busy ||
        !plan ||
        !onPause
      ) {
        return;
      }

      onPause(plan);
    },
    [
      busy,
      plan,
      onPause,
    ],
  );

  const handleResume = useCallback(
    (event) => {
      event.stopPropagation();

      if (
        busy ||
        !plan ||
        !onResume
      ) {
        return;
      }

      onResume(plan);
    },
    [
      busy,
      plan,
      onResume,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Closed state                                                             */
  /* ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* No selected plan                                                         */
  /* ------------------------------------------------------------------------ */

  if (!plan) {
    return (
      <div
        className="
          z-[100] fixed inset-0 flex justify-end items-center
          bg-slate-950/40
          backdrop-blur-sm
        "
        role="presentation"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
      >
        <aside
          className={[
            "flex h-full w-full max-w-xl flex-col",
            "border-l border-slate-200",
            "bg-white shadow-2xl",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
        >
          <header
            className="
              flex justify-between items-center
              px-5 py-4
              border-slate-200 border-b
            "
          >
            <h2
              id={titleId}
              className="
                font-semibold text-slate-900 text-base
              "
            >
              Savings plan
            </h2>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              className={[
                "inline-flex h-9 w-9 items-center justify-center",
                "rounded-lg text-slate-500",
                "transition-colors",
                "hover:bg-slate-100 hover:text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
              ].join(" ")}
              aria-label="Close savings plan details"
            >
              <X
                size={19}
                aria-hidden="true"
              />
            </button>
          </header>

          <div
            className="
              flex flex-1 justify-center items-center
              p-6
            "
          >
            <div
              className="
                text-center
              "
            >
              <AlertCircle
                size={40}
                className="
                  mx-auto
                  text-slate-400
                "
                aria-hidden="true"
              /
              >

              <h3
                className="
                  mt-4
                  font-semibold text-slate-900 text-sm
                "
              >
                Plan unavailable
              </h3>

              <p
                id={descriptionId}
                className="
                  max-w-sm
                  mt-2
                  text-slate-500 text-sm leading-6
                "
              >
                The selected savings plan
                could not be loaded.
              </p>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main drawer                                                              */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="
        z-[100] fixed inset-0
        bg-slate-950/40
        backdrop-blur-sm
      "
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <aside
        id={drawerId}
        className={[
          "relative ml-auto flex h-full w-full max-w-xl",
          "flex-col",
          "border-l border-slate-200",
          "bg-white",
          "shadow-2xl",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          planDescription
            ? descriptionId
            : undefined
        }
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <header
          className="
            flex justify-between items-start
            px-5 py-4
            border-slate-200 border-b
            gap-4 shrink-0
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
              aria-hidden="true"
            >
              <Target
                size={20}
                strokeWidth={2}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id={titleId}
                className="
                  font-bold text-slate-900 text-lg truncate
                "
                title={planName}
              >
                {planName}
              </h2>

              {planId && (
                <p
                  className="
                    mt-0.5
                    text-slate-400 text-xs truncate
                  "
                >
                  Plan ID: {planId}
                </p>
              )}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            disabled={busy}
            className={[
              "inline-flex h-9 w-9 shrink-0 items-center justify-center",
              "rounded-lg text-slate-500",
              "transition-colors",
              "hover:bg-slate-100 hover:text-slate-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
            aria-label="Close savings plan details"
          >
            <X
              size={19}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Content                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            flex-1 overflow-y-auto
            min-h-0
          "
        >
          <div
            className="
              space-y-6 p-5
            "
          >
            {/* ------------------------------------------------------------ */}
            {/* Status                                                         */}
            {/* ------------------------------------------------------------ */}

            <div
              className={[
                "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",
                statusStyle.container,
              ].join(" ")}
            >
              <div
                className="
                  flex items-center
                  gap-2.5
                "
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    statusStyle.dot,
                  ].join(" ")}
                  aria-hidden="true"
                />

                <span
                  className="
                    font-semibold text-sm
                  "
                >
                  {statusLabel}
                </span>
              </div>

              {completed && (
                <CheckCircle2
                  size={18}
                  aria-label="Completed"
                />
              )}

              {paused && (
                <PauseCircle
                  size={18}
                  aria-label="Paused"
                />
              )}

              {failed && (
                <AlertCircle
                  size={18}
                  aria-label="Failed"
                />
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Description                                                    */}
            {/* ------------------------------------------------------------ */}

            {planDescription && (
              <section>
                <h3
                  className="
                    font-semibold text-slate-400 text-xs uppercase tracking-wide
                  "
                >
                  About this plan
                </h3>

                <p
                  id={descriptionId}
                  className="
                    mt-2
                    text-slate-600 text-sm leading-6 whitespace-pre-wrap
                  "
                >
                  {planDescription}
                </p>
              </section>
            )}

            {/* ------------------------------------------------------------ */}
            {/* Financial summary                                             */}
            {/* ------------------------------------------------------------ */}

            <section>
              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2
                  gap-3
                "
              >
                <div
                  className="
                    p-4
                    bg-slate-50
                    border border-slate-200 rounded-xl
                  "
                >
                  <div
                    className="
                      flex items-center
                      text-slate-400
                      gap-2
                    "
                  >
                    <DollarSign
                      size={15}
                      aria-hidden="true"
                    />

                    <span
                      className="
                        font-medium text-xs uppercase tracking-wide
                      "
                    >
                      Saved
                    </span>
                  </div>

                  <p
                    className="
                      mt-2
                      font-bold text-slate-900 text-xl
                    "
                  >
                    {formattedCurrentAmount}
                  </p>
                </div>

                <div
                  className="
                    p-4
                    bg-slate-50
                    border border-slate-200 rounded-xl
                  "
                >
                  <div
                    className="
                      flex items-center
                      text-slate-400
                      gap-2
                    "
                  >
                    <Target
                      size={15}
                      aria-hidden="true"
                    />

                    <span
                      className="
                        font-medium text-xs uppercase tracking-wide
                      "
                    >
                      Target
                    </span>
                  </div>

                  <p
                    className="
                      mt-2
                      font-bold text-slate-900 text-xl
                    "
                  >
                    {formattedTargetAmount}
                  </p>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Progress                                                       */}
            {/* ------------------------------------------------------------ */}

            <section
              className="
                p-4
                border border-slate-200 rounded-xl
              "
            >
              <div
                className="
                  flex justify-between items-center
                  gap-4
                "
              >
                <div>
                  <h3
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    Savings progress
                  </h3>

                  <p
                    className="
                      mt-1
                      text-slate-500 text-xs
                    "
                  >
                    Amount saved toward your
                    target
                  </p>
                </div>

                <span
                  className="
                    font-bold text-blue-600 text-sm
                  "
                >
                  {formattedProgress}
                </span>
              </div>

              <div
                className="
                  overflow-hidden
                  h-2.5
                  mt-4
                  bg-slate-100
                  rounded-full
                "
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={`${planName} savings progress`}
              >
                <div
                  className="
                    h-full
                    bg-blue-600
                    rounded-full
                    transition-[width] duration-300 ease-out
                  "
                  style={{
                    width: `${progress}%`,
                  }}
                /
                >
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Timeline                                                       */}
            {/* ------------------------------------------------------------ */}

            <section>
              <h3
                className="
                  font-semibold text-slate-400 text-xs uppercase tracking-wide
                "
              >
                Plan timeline
              </h3>

              <div
                className="
                  mt-3
                  border border-slate-200 rounded-xl divide-y divide-slate-100
                "
              >
                <div
                  className="
                    flex justify-between items-center
                    p-4
                    gap-4
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
                        flex justify-center items-center
                        w-9 h-9
                        text-blue-600
                        bg-blue-50
                        rounded-lg
                      "
                    >
                      <CalendarDays
                        size={17}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p
                        className="
                          font-medium text-slate-700 text-sm
                        "
                      >
                        Target date
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-slate-400 text-xs
                        "
                      >
                        When the goal should be reached
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      font-semibold text-slate-900 text-sm text-right
                    "
                  >
                    {formattedTargetDate}
                  </span>
                </div>

                {remainingDays && (
                  <div
                    className="
                      flex justify-between items-center
                      p-4
                      gap-4
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
                          flex justify-center items-center
                          w-9 h-9
                          text-slate-500
                          bg-slate-100
                          rounded-lg
                        "
                      >
                        <Clock3
                          size={17}
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p
                          className="
                            font-medium text-slate-700 text-sm
                          "
                        >
                          Time remaining
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-slate-400 text-xs
                          "
                        >
                          Based on the target date
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        font-semibold text-slate-900 text-sm text-right
                      "
                    >
                      {remainingDays}
                    </span>
                  </div>
                )}

                {formattedCreatedDate && (
                  <div
                    className="
                      flex justify-between items-center
                      p-4
                      gap-4
                    "
                  >
                    <span
                      className="
                        text-slate-500 text-sm
                      "
                    >
                      Created
                    </span>

                    <span
                      className="
                        font-medium text-slate-700 text-sm
                      "
                    >
                      {formattedCreatedDate}
                    </span>
                  </div>
                )}

                {formattedUpdatedDate && (
                  <div
                    className="
                      flex justify-between items-center
                      p-4
                      gap-4
                    "
                  >
                    <span
                      className="
                        text-slate-500 text-sm
                      "
                    >
                      Last updated
                    </span>

                    <span
                      className="
                        font-medium text-slate-700 text-sm
                      "
                    >
                      {formattedUpdatedDate}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Error                                                          */}
            {/* ------------------------------------------------------------ */}

            {errorMessage && (
              <div
                className="
                  flex items-start
                  p-4
                  text-red-700
                  bg-red-50
                  border border-red-200 rounded-xl
                  gap-3
                "
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                  aria-hidden="true"
                /
                >

                <p
                  className="
                    text-sm leading-5
                  "
                >
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                            */}
        {/* ---------------------------------------------------------------- */}

        {showActions && (
          <footer
            className="
              p-4
              bg-white
              border-slate-200 border-t
              shrink-0
            "
          >
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2
                gap-2
              "
            >
              {onEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center gap-2",
                    "rounded-xl border border-slate-200",
                    "bg-white px-4 py-2.5",
                    "text-sm font-semibold text-slate-700",
                    "transition-colors",
                    "hover:bg-slate-50",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
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
                  onClick={handlePause}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center gap-2",
                    "rounded-xl border border-amber-200",
                    "bg-amber-50 px-4 py-2.5",
                    "text-sm font-semibold text-amber-700",
                    "transition-colors",
                    "hover:bg-amber-100",
                    "focus:outline-none focus:ring-2 focus:ring-amber-500/30",
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
                  onClick={handleResume}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center gap-2",
                    "rounded-xl border border-emerald-200",
                    "bg-emerald-50 px-4 py-2.5",
                    "text-sm font-semibold text-emerald-700",
                    "transition-colors",
                    "hover:bg-emerald-100",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
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
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center gap-2",
                    "rounded-xl border border-red-200",
                    "bg-red-50 px-4 py-2.5",
                    "text-sm font-semibold text-red-700",
                    "transition-colors",
                    "hover:bg-red-100",
                    "focus:outline-none focus:ring-2 focus:ring-red-500/30",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  ].join(" ")}
                >
                  <Trash2
                    size={16}
                    aria-hidden="true"
                  />

                  Delete plan
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className={[
                "mt-2 w-full rounded-xl px-4 py-2.5",
                "text-sm font-semibold text-slate-500",
                "transition-colors",
                "hover:bg-slate-50 hover:text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-slate-500/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              Close
            </button>
          </footer>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Busy overlay                                                      */}
        {/* ---------------------------------------------------------------- */}

        {busy && (
          <div
            className="
              z-50 absolute inset-0 flex justify-center items-center
              bg-white/60
              rounded-l-2xl
              backdrop-blur-[1px]
            "
            aria-live="polite"
            aria-busy="true"
          >
            <div
              className="
                px-5 py-3
                font-medium text-slate-700 text-sm
                bg-white
                border border-slate-200 rounded-xl
                shadow-lg
              "
            >
              {deleting
                ? "Deleting plan…"
                : "Updating plan…"}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

SavingPlanDetailsDrawer.displayName =
  "SavingPlanDetailsDrawer";

export default memo(
  SavingPlanDetailsDrawer,
);