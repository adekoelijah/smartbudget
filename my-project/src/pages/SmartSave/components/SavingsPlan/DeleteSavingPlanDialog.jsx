import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

import {
  getSavingPlanId,
  getSavingPlanName,
} from "../../../../utils/smartSave/savingPlanHelpers";

/**
 * DeleteSavingPlanDialog
 *
 * Production-grade confirmation dialog for deleting a saving plan.
 *
 * Responsibilities:
 * - Present deletion confirmation
 * - Protect against accidental deletion
 * - Handle keyboard accessibility
 * - Manage focus while open
 * - Delegate deletion to the parent through onConfirm
 *
 * This component does NOT:
 * - Make API requests
 * - Mutate backend state directly
 * - Contain financial business logic
 * - Manage saving-plan collections
 *
 * The parent component owns the delete mutation.
 */

const DELETE_CONFIRMATION_PHRASE = "DELETE";

const DeleteSavingPlanDialog = ({
  open = false,
  plan = null,
  deleting = false,
  error = null,
  onConfirm,
  onClose,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const dialogRef = useRef(null);

  const planId = getSavingPlanId(plan);
  const planName = getSavingPlanName(plan);

  const hasPlan = Boolean(planId);
  const canInteract = open && !deleting;

  /* ------------------------------------------------------------------------ */
  /* Close handler                                                            */
  /* ------------------------------------------------------------------------ */

  const handleClose = useCallback(() => {
    if (!canInteract) {
      return;
    }

    onClose?.();
  }, [canInteract, onClose]);

  /* ------------------------------------------------------------------------ */
  /* Keyboard handling                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = dialog.querySelectorAll(
        [
          "button:not([disabled])",
          "a[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      );

      const focusable = Array.from(focusableElements);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement =
        focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, handleClose]);

  /* ------------------------------------------------------------------------ */
  /* Body scroll lock                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);

  /* ------------------------------------------------------------------------ */
  /* Initial focus                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const focusTarget =
      hasPlan && !deleting
        ? confirmButtonRef.current
        : cancelButtonRef.current;

    const frameId = window.requestAnimationFrame(() => {
      focusTarget?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open, hasPlan, deleting]);

  /* ------------------------------------------------------------------------ */
  /* Confirm deletion                                                         */
  /* ------------------------------------------------------------------------ */

  const handleConfirm = useCallback(() => {
    if (!canInteract || !hasPlan) {
      return;
    }

    onConfirm?.(planId);
  }, [
    canInteract,
    hasPlan,
    onConfirm,
    planId,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Backdrop handling                                                        */
  /* ------------------------------------------------------------------------ */

  const handleBackdropMouseDown = useCallback(
    (event) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      handleClose();
    },
    [handleClose],
  );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  const normalizedError =
    typeof error === "string"
      ? error.trim()
      : error?.message?.trim?.() || "";

  const dialogDescription = hasPlan
    ? `You are about to permanently delete the saving plan "${planName || "this saving plan"}". This action cannot be undone.`
    : "The selected saving plan could not be identified.";

  return (
    <div
      className="
        z-[100] fixed inset-0 flex justify-center items-center
        p-4
      "
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-slate-950/60
          backdrop-blur-sm
        "
        /
      >

      <section
        ref={dialogRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="
          z-10 relative overflow-hidden
          w-full max-w-md
          bg-white
          border border-slate-200 rounded-2xl
          shadow-2xl
        "
        role="alertdialog"
        tabIndex={-1}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div
          className="
            flex justify-between items-start
            px-6 py-5
            border-slate-200 border-b
            gap-4
          "
        >
          <div
            className="
              flex items-start
              gap-3
            "
          >
            <div
              aria-hidden="true"
              className="
                flex justify-center items-center
                w-11 h-11
                text-red-600
                bg-red-50
                rounded-full
                shrink-0
              "
            >
              <Trash2
                className="
                  w-5 h-5
                "
                strokeWidth={2}
              /
              >
            </div>

            <div>
              <h2
                id={titleId}
                className="
                  font-semibold text-slate-900 text-lg
                "
              >
                Delete saving plan
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-sm
                "
              >
                Permanent action
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close delete dialog"
            className="
              inline-flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
            disabled={deleting}
            onClick={handleClose}
          >
            <X
              className="
                w-5 h-5
              "
              strokeWidth={2}
            /
            >
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Content                                                            */}
        {/* ------------------------------------------------------------------ */}

        <div
          className="
            space-y-5 px-6 py-6
          "
        >
          <p
            id={descriptionId}
            className="
              text-slate-600 text-sm leading-6
            "
          >
            {dialogDescription}
          </p>

          {planName && (
            <div
              className="
                px-4 py-3
                bg-slate-50
                border border-slate-200 rounded-xl
              "
            >
              <p
                className="
                  font-medium text-slate-500 text-xs uppercase tracking-wide
                "
              >
                Saving plan
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-sm break-words
                "
              >
                {planName}
              </p>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* Destructive-action warning                                     */}
          {/* --------------------------------------------------------------- */}

          <div
            className="
              flex
              px-4 py-3
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-3
            "
          >
            <AlertTriangle
              aria-hidden="true"
              className="
                w-5 h-5
                mt-0.5
                text-amber-600
                shrink-0
              "
              strokeWidth={2}
            /
            >

            <p
              className="
                text-amber-800 text-sm leading-5
              "
            >
              Deleting a saving plan is permanent. Make
              sure you are deleting the correct plan before
              continuing.
            </p>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* Error                                                            */}
          {/* --------------------------------------------------------------- */}

          {normalizedError && (
            <div
              id={errorId}
              aria-live="assertive"
              className="
                px-4 py-3
                text-red-700 text-sm leading-5
                bg-red-50
                border border-red-200 rounded-xl
              "
              role="alert"
            >
              {normalizedError}
            </div>
          )}

          {!hasPlan && (
            <div
              className="
                px-4 py-3
                text-red-700 text-sm leading-5
                bg-red-50
                border border-red-200 rounded-xl
              "
            >
              This saving plan is unavailable or invalid.
              Close this dialog and try again.
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div
          className="
            flex flex-col-reverse sm:flex-row sm:justify-end
            px-6 py-4
            bg-slate-50
            border-slate-200 border-t
            gap-3
          "
        >
          <button
            ref={cancelButtonRef}
            type="button"
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5
              font-semibold text-slate-700 text-sm
              bg-white hover:bg-slate-100
              border border-slate-300 rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
            disabled={deleting}
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            aria-describedby={
              normalizedError ? errorId : undefined
            }
            className="
              inline-flex justify-center items-center
              min-h-11
              px-5
              font-semibold text-white text-sm
              bg-red-600 hover:bg-red-700
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              disabled:opacity-60 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
            disabled={
              deleting ||
              !hasPlan ||
              !onConfirm
            }
            onClick={handleConfirm}
          >
            {deleting ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="
                    w-4 h-4
                    animate-spin
                  "
                  /
                >
                Deleting…
              </>
            ) : (
              <>
                <Trash2
                  aria-hidden="true"
                  className="
                    w-4 h-4
                  "
                  /
                >
                Delete plan
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeleteSavingPlanDialog;