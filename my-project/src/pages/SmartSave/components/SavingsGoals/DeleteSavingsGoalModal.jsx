import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Delete savings goal";

const DEFAULT_DESCRIPTION =
  "This action cannot be undone.";

const DEFAULT_CONFIRM_LABEL =
  "Delete goal";

const DEFAULT_CANCEL_LABEL =
  "Cancel";

const DEFAULT_DELETE_ERROR =
  "Unable to complete this action. Please try again.";

const FALLBACK_GOAL_NAME =
  "this savings goal";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

/* =========================================================
   GOAL NAME
========================================================= */

const getGoalName = (goal) => {
  if (!isObject(goal)) {
    return FALLBACK_GOAL_NAME;
  }

  const name = normalizeString(
    goal.name ??
      goal.title ??
      goal.goalName
  );

  return name
    ? `"${name}"`
    : FALLBACK_GOAL_NAME;
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return (
      normalizeString(error) ||
      DEFAULT_DELETE_ERROR
    );
  }

  const candidates = [
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.data?.message,
    error?.data?.error,
    error?.message,
    error?.error,
  ];

  const message = candidates.find(
    (value) =>
      typeof value === "string" &&
      normalizeString(value)
  );

  return (
    normalizeString(message) ||
    DEFAULT_DELETE_ERROR
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const DeleteSavingsGoalModal = ({
  open = false,

  goal = null,

  loading = false,

  error = null,

  onClose,

  onConfirm,

  title = DEFAULT_TITLE,

  description = DEFAULT_DESCRIPTION,

  confirmLabel = DEFAULT_CONFIRM_LABEL,

  cancelLabel = DEFAULT_CANCEL_LABEL,

  closeOnBackdrop = true,

  closeOnEscape = true,

  className = "",
}) => {
  /* =======================================================
     ACCESSIBILITY IDS
  ======================================================= */

  const titleId = useId();

  const descriptionId = useId();

  /* =======================================================
     REFS
  ======================================================= */

  const cancelButtonRef =
    useRef(null);

  const dialogRef =
    useRef(null);

  const previousActiveElementRef =
    useRef(null);

  /*
   * This ref is ONLY used inside event/effect logic.
   *
   * It is intentionally NOT read during render.
   */
  const confirmInFlightRef =
    useRef(false);

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const goalName =
    getGoalName(goal);

  const normalizedError =
    getErrorMessage(error);

  const hasConfirmHandler =
    typeof onConfirm === "function";

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose =
    useCallback(() => {
      if (loading) {
        return;
      }

      if (
        typeof onClose ===
        "function"
      ) {
        onClose();
      }
    }, [
      loading,
      onClose,
    ]);

  /* =======================================================
     CONFIRM
  ======================================================= */

  const handleConfirm =
    useCallback(
      async (event) => {
        event?.preventDefault();

        /*
         * `loading` is the parent's source of truth.
         *
         * `confirmInFlightRef` additionally protects against
         * two synchronous clicks before the parent re-renders
         * with loading=true.
         */
        if (
          loading ||
          confirmInFlightRef.current
        ) {
          return;
        }

        if (!hasConfirmHandler) {
          return;
        }

        confirmInFlightRef.current =
          true;

        try {
          await onConfirm(goal);
        } catch {
          /*
           * Parent owns the server error state.
           */
        } finally {
          confirmInFlightRef.current =
            false;
        }
      },
      [
        goal,
        hasConfirmHandler,
        loading,
        onConfirm,
      ]
    );

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropMouseDown =
    useCallback(
      (event) => {
        if (!closeOnBackdrop) {
          return;
        }

        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        handleClose();
      },
      [
        closeOnBackdrop,
        handleClose,
      ]
    );

  /* =======================================================
     DIALOG MOUSE DOWN
  ======================================================= */

  const handleDialogMouseDown =
    useCallback((event) => {
      event.stopPropagation();
    }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (
      !open ||
      !closeOnEscape
    ) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      if (
        loading ||
        confirmInFlightRef.current
      ) {
        return;
      }

      event.preventDefault();

      handleClose();
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    closeOnEscape,
    loading,
    handleClose,
  ]);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =======================================================
     FOCUS MANAGEMENT
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement;

    const frameId =
      window.requestAnimationFrame(() => {
        if (
          cancelButtonRef.current
        ) {
          cancelButtonRef.current.focus();
          return;
        }

        dialogRef.current?.focus();
      });

    return () => {
      window.cancelAnimationFrame(
        frameId
      );

      const previousElement =
        previousActiveElementRef.current;

      if (
        previousElement &&
        typeof previousElement.focus ===
          "function"
      ) {
        window.requestAnimationFrame(
          () => {
            previousElement.focus();
          }
        );
      }
    };
  }, [open]);

  /* =======================================================
     RESET REQUEST GUARD
  ======================================================= */

  useEffect(() => {
    if (!open) {
      confirmInFlightRef.current =
        false;
    }
  }, [open]);

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        z-[110] fixed inset-0 flex justify-center items-center
        p-4 sm:p-6
      "
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
    >
      {/* Backdrop */}

      <div
        className="
          absolute inset-0
          bg-slate-950/55
          backdrop-blur-sm
        "
        aria-hidden="true"
      /
      >

      {/* Dialog */}

      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={loading}
        tabIndex={-1}
        className={`
          relative z-10
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-2xl
          outline-none
          ${className}
        `}
        onMouseDown={
          handleDialogMouseDown
        }
      >
        {/* Header */}

        <div
          className="
            flex justify-between items-start
            px-5 sm:px-6 pt-5 sm:pt-6
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
                flex justify-center items-center
                w-11 h-11
                text-red-600
                bg-red-50
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Trash2
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
                  font-semibold text-slate-900 text-base sm:text-lg
                "
              >
                {title}
              </h2>

              <p
                id={descriptionId}
                className="
                  mt-1.5
                  text-slate-500 text-sm leading-5
                "
              >
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close dialog"
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/10
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Content */}

        <div
          className="
            px-5 sm:px-6 py-5
          "
        >
          <div
            className="
              px-4 py-3.5
              bg-red-50/70
              border border-red-100 rounded-xl
            "
          >
            <p
              className="
                text-slate-700 text-sm leading-6
              "
            >
              You are about to delete{" "}

              <strong
                className="
                  font-semibold text-slate-900
                "
              >
                {goalName}
              </strong>
              .
            </p>

            <p
              className="
                mt-1.5
                text-slate-500 text-xs leading-5
              "
            >
              Please make sure you no longer
              need this goal before continuing.
            </p>
          </div>

          {/* Server error */}

          {normalizedError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="
                flex items-start
                mt-4 px-4 py-3
                bg-red-50
                border border-red-200 rounded-xl
                gap-3
              "
            >
              <AlertTriangle
                size={18}
                className="
                  mt-0.5
                  text-red-600
                  shrink-0
                "
                aria-hidden="true"
              /
              >

              <p
                className="
                  text-red-700 text-sm leading-5
                "
              >
                {normalizedError}
              </p>
            </div>
          ) : null}

          {/* Financial safety notice */}

          <div
            className="
              flex items-start
              mt-4
              text-slate-500 text-xs leading-5
              gap-2.5
            "
          >
            <AlertTriangle
              size={15}
              className="
                mt-0.5
                text-amber-500
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <p>
              Deleting a goal should not be
              interpreted as deleting its historical
              financial contribution records.
            </p>
          </div>
        </div>

        {/* Actions */}

        <div
          className="
            flex flex-col-reverse sm:flex-row sm:justify-end
            px-5 sm:px-6 py-4
            bg-slate-50/60
            border-slate-100 border-t
            gap-3
          "
        >
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5
              font-medium text-slate-700 text-sm
              bg-white hover:bg-slate-50
              border border-slate-300 rounded-xl focus:outline-none
              focus:ring-4 focus:ring-slate-500/10
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              loading ||
              !hasConfirmHandler
            }
            aria-disabled={
              loading ||
              !hasConfirmHandler
            }
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5
              font-semibold text-white text-sm
              bg-red-600 hover:bg-red-700
              rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20
              disabled:opacity-60 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="
                    animate-spin
                  "
                  aria-hidden="true"
                /
                >

                <span>
                  Deleting...
                </span>
              </>
            ) : (
              <>
                <Trash2
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  {confirmLabel}
                </span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

/* =========================================================
   DISPLAY NAME
========================================================= */

DeleteSavingsGoalModal.displayName =
  "DeleteSavingsGoalModal";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  DeleteSavingsGoalModal
);