import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  Target,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

import useSavingPlanForm from "../../../../hooks/useSavingPlanForm";
import {
  getSavingPlanId,
  getSavingPlanName,
} from "../../../../utils/smartSave/savingPlanHelpers";
import {
  DEFAULT_SAVING_PLAN_CURRENCY,
  formatSavingPlanAmount,
  formatSavingPlanDate,
} from "../../../../utils/smartSave/savingPlanFormatters";

/**
 * EditSavingPlanModal
 *
 * Production-grade modal for editing an existing saving plan.
 *
 * Responsibilities:
 * - Render the saving-plan edit form.
 * - Delegate form state and validation to useSavingPlanForm.
 * - Provide accessible modal behaviour.
 * - Prevent accidental dismissal while submitting.
 * - Delegate persistence to the supplied onSubmit callback.
 *
 * This component does NOT:
 * - Call the API directly.
 * - Perform financial calculations.
 * - Mutate saving-plan collections.
 * - Duplicate form validation rules.
 */

const MIN_TARGET_AMOUNT = 0.01;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const getMinimumTargetDate = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date.toISOString().slice(0, 10);
};

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error.trim();
  }

  if (error?.message) {
    return String(error.message).trim();
  }

  return "";
};

const getFieldError = (errors, field) => {
  const error = errors?.[field];

  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return String(error.message);
  }

  return "";
};

const EditSavingPlanModal = ({
  open = false,
  plan = null,
  currency = DEFAULT_SAVING_PLAN_CURRENCY,
  onSubmit,
  onSuccess,
  onError,
  onClose,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const formErrorId = useId();

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  const planId = getSavingPlanId(plan);
  const planName = getSavingPlanName(plan);

  const {
    formData,
    errors,
    touched,
    submitting,
    submitError,
    submitSuccess,
    isDirty,
    canSubmit,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  } = useSavingPlanForm({
    plan,
    currency,
    mode: "edit",
    onSubmit,
    onSuccess,
    onError,
  });

  /* ------------------------------------------------------------------------ */
  /* Close                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleClose = useCallback(() => {
    if (submitting) {
      return;
    }

    onClose?.();
  }, [onClose, submitting]);

  /* ------------------------------------------------------------------------ */
  /* Keyboard handling                                                         */
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

      const modal = modalRef.current;

      if (!modal) {
        return;
      }

      const focusableElements = Array.from(
        modal.querySelectorAll(
          [
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[href]",
            "[tabindex]:not([tabindex='-1'])",
          ].join(","),
        ),
      ).filter(
        (element) =>
          !element.hasAttribute("aria-hidden"),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

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
  /* Body scroll lock + focus restoration                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const frameId = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      document.body.style.overflow =
        previousOverflow;

      const previousElement =
        previousActiveElementRef.current;

      if (
        previousElement &&
        typeof previousElement.focus === "function"
      ) {
        previousElement.focus();
      }

      previousActiveElementRef.current = null;
    };
  }, [open]);

  /* ------------------------------------------------------------------------ */
  /* Backdrop                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleBackdropMouseDown = useCallback(
    (event) => {
      if (
        event.target !== event.currentTarget ||
        submitting
      ) {
        return;
      }

      handleClose();
    },
    [handleClose, submitting],
  );

  /* ------------------------------------------------------------------------ */
  /* Form submission                                                           */
  /* ------------------------------------------------------------------------ */

  const handleFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!planId || submitting) {
        return;
      }

      await handleSubmit(event);
    },
    [
      handleSubmit,
      planId,
      submitting,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Reset                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleReset = useCallback(() => {
    if (submitting) {
      return;
    }

    reset();
  }, [reset, submitting]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  const nameError = getFieldError(
    errors,
    "name",
  );

  const targetAmountError = getFieldError(
    errors,
    "targetAmount",
  );

  const currencyError = getFieldError(
    errors,
    "currency",
  );

  const targetDateError = getFieldError(
    errors,
    "targetDate",
  );

  const descriptionError = getFieldError(
    errors,
    "description",
  );

  const normalizedSubmitError =
    getErrorMessage(submitError);

  const hasFormErrors =
    Boolean(nameError) ||
    Boolean(targetAmountError) ||
    Boolean(currencyError) ||
    Boolean(targetDateError) ||
    Boolean(descriptionError);

  const displayFormError =
    normalizedSubmitError ||
    (hasFormErrors
      ? "Please review the highlighted fields."
      : "");

  const currentTargetAmount =
    formData?.targetAmount || "";

  const currentCurrency =
    formData?.currency ||
    currency ||
    DEFAULT_SAVING_PLAN_CURRENCY;

  const currentTargetDate =
    formData?.targetDate || "";

  const currentDescription =
    formData?.description || "";

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

      <div
        ref={modalRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="
          z-10 relative flex flex-col overflow-hidden
          w-full max-w-2xl max-h-[calc(100vh-2rem)]
          bg-white
          border border-slate-200 rounded-2xl
          shadow-2xl
        "
        role="dialog"
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div
          className="
            flex justify-between items-start
            px-6 py-5
            border-slate-200 border-b
            gap-4 shrink-0
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
                gap-3
              "
            >
              <div
                aria-hidden="true"
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
                /
                >
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <h2
                  id={titleId}
                  className="
                    font-semibold text-slate-900 text-lg truncate
                  "
                >
                  Edit saving plan
                </h2>

                <p
                  className="
                    mt-0.5
                    text-slate-500 text-sm truncate
                  "
                >
                  {planName || "Update your saving plan"}
                </p>
              </div>
            </div>

            <p
              id={descriptionId}
              className="
                mt-3
                text-slate-500 text-sm leading-5
              "
            >
              Update the details of your saving plan.
              Your changes will be reviewed before they
              are saved.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close edit saving plan dialog"
            className="
              inline-flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
            disabled={submitting}
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

        <form
          className="
            flex-1 overflow-y-auto
            min-h-0
          "
          noValidate
          onSubmit={handleFormSubmit}
        >
          <div
            className="
              space-y-6 px-6 py-6
            "
          >
            {/* -------------------------------------------------------------- */}
            {/* Success                                                         */}
            {/* -------------------------------------------------------------- */}

            {submitSuccess && (
              <div
                aria-live="polite"
                className="
                  flex
                  px-4 py-3
                  text-emerald-800 text-sm
                  bg-emerald-50
                  border border-emerald-200 rounded-xl
                  gap-3
                "
                role="status"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="
                    w-5 h-5
                    mt-0.5
                    text-emerald-600
                    shrink-0
                  "
                  strokeWidth={2}
                /
                >

                <div>
                  <p
                    className="
                      font-semibold
                    "
                  >
                    Saving plan updated
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-emerald-700
                    "
                  >
                    Your changes have been saved
                    successfully.
                  </p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Error                                                           */}
            {/* -------------------------------------------------------------- */}

            {displayFormError && (
              <div
                id={formErrorId}
                aria-live="assertive"
                className="
                  flex
                  px-4 py-3
                  text-red-800 text-sm
                  bg-red-50
                  border border-red-200 rounded-xl
                  gap-3
                "
                role="alert"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="
                    w-5 h-5
                    mt-0.5
                    text-red-600
                    shrink-0
                  "
                  strokeWidth={2}
                /
                >

                <div>
                  <p
                    className="
                      font-semibold
                    "
                  >
                    Unable to save changes
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-red-700
                    "
                  >
                    {displayFormError}
                  </p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Plan identity                                                    */}
            {/* -------------------------------------------------------------- */}

            {planId && (
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
                    font-semibold text-slate-900 text-sm truncate
                  "
                >
                  {planName || "Unnamed saving plan"}
                </p>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Name                                                            */}
            {/* -------------------------------------------------------------- */}

            <div>
              <label
                htmlFor="edit-saving-plan-name"
                className="
                  block
                  mb-2
                  font-semibold text-slate-700 text-sm
                "
              >
                Plan name
              </label>

              <input
                ref={firstInputRef}
                id="edit-saving-plan-name"
                name="name"
                type="text"
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH}
                value={formData?.name || ""}
                aria-describedby={
                  nameError && touched?.name
                    ? "edit-saving-plan-name-error"
                    : undefined
                }
                aria-invalid={
                  touched?.name && Boolean(nameError)
                }
                className={[
                  "block w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  touched?.name && nameError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-blue-500",
                ].join(" ")}
                disabled={submitting}
                placeholder="e.g. Emergency fund"
                onBlur={handleBlur}
                onChange={handleChange}
              />

              {touched?.name && nameError && (
                <p
                  id="edit-saving-plan-name-error"
                  className="
                    mt-2
                    font-medium text-red-600 text-xs
                  "
                >
                  {nameError}
                </p>
              )}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Target amount + currency                                        */}
            {/* -------------------------------------------------------------- */}

            <div
              className="
                grid sm:grid-cols-[1fr_140px]
                gap-5
              "
            >
              <div>
                <label
                  htmlFor="edit-saving-plan-target-amount"
                  className="
                    block
                    mb-2
                    font-semibold text-slate-700 text-sm
                  "
                >
                  Target amount
                </label>

                <div
                  className="
                    relative
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      left-0 absolute inset-y-0 flex items-center
                      pl-4
                      font-semibold text-slate-500 text-sm
                      pointer-events-none
                    "
                  >
                    {currentCurrency === "NGN"
                      ? "₦"
                      : currentCurrency}
                  </div>

                  <input
                    id="edit-saving-plan-target-amount"
                    name="targetAmount"
                    type="number"
                    inputMode="decimal"
                    min={MIN_TARGET_AMOUNT}
                    step="0.01"
                    value={currentTargetAmount}
                    aria-describedby={
                      targetAmountError &&
                      touched?.targetAmount
                        ? "edit-saving-plan-target-amount-error"
                        : undefined
                    }
                    aria-invalid={
                      touched?.targetAmount &&
                      Boolean(targetAmountError)
                    }
                    className={[
                      "block w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400",
                      "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                      touched?.targetAmount &&
                      targetAmountError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:border-blue-500",
                    ].join(" ")}
                    disabled={submitting}
                    placeholder="0.00"
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                </div>

                {touched?.targetAmount &&
                  targetAmountError && (
                    <p
                      id="edit-saving-plan-target-amount-error"
                      className="
                        mt-2
                        font-medium text-red-600 text-xs
                      "
                    >
                      {targetAmountError}
                    </p>
                  )}

                {currentTargetAmount && (
                  <p
                    className="
                      mt-2
                      text-slate-500 text-xs
                    "
                  >
                    Current target:{" "}
                    <span
                      className="
                        font-medium text-slate-700
                      "
                    >
                      {formatSavingPlanAmount(
                        currentTargetAmount,
                        currentCurrency,
                      )}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-saving-plan-currency"
                  className="
                    block
                    mb-2
                    font-semibold text-slate-700 text-sm
                  "
                >
                  Currency
                </label>

                <select
                  id="edit-saving-plan-currency"
                  name="currency"
                  value={currentCurrency}
                  aria-describedby={
                    currencyError &&
                    touched?.currency
                      ? "edit-saving-plan-currency-error"
                      : undefined
                  }
                  aria-invalid={
                    touched?.currency &&
                    Boolean(currencyError)
                  }
                  className={[
                    "block w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition",
                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    touched?.currency &&
                    currencyError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-blue-500",
                  ].join(" ")}
                  disabled={submitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  <option value="NGN">
                    NGN — Nigerian Naira
                  </option>

                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="GBP">
                    GBP — British Pound
                  </option>

                  <option value="EUR">
                    EUR — Euro
                  </option>
                </select>

                {touched?.currency &&
                  currencyError && (
                    <p
                      id="edit-saving-plan-currency-error"
                      className="
                        mt-2
                        font-medium text-red-600 text-xs
                      "
                    >
                      {currencyError}
                    </p>
                  )}
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Target date                                                     */}
            {/* -------------------------------------------------------------- */}

            <div>
              <label
                htmlFor="edit-saving-plan-target-date"
                className="
                  block
                  mb-2
                  font-semibold text-slate-700 text-sm
                "
              >
                Target date
              </label>

              <div
                className="
                  relative
                "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="
                    top-1/2 left-4 absolute
                    w-5 h-5
                    text-slate-400
                    pointer-events-none
                    -translate-y-1/2
                  "
                  strokeWidth={2}
                /
                >

                <input
                  id="edit-saving-plan-target-date"
                  name="targetDate"
                  type="date"
                  min={getMinimumTargetDate()}
                  value={currentTargetDate}
                  aria-describedby={
                    targetDateError &&
                    touched?.targetDate
                      ? "edit-saving-plan-target-date-error"
                      : undefined
                  }
                  aria-invalid={
                    touched?.targetDate &&
                    Boolean(targetDateError)
                  }
                  className={[
                    "block w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition",
                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    touched?.targetDate &&
                    targetDateError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-blue-500",
                  ].join(" ")}
                  disabled={submitting}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>

              {touched?.targetDate &&
                targetDateError && (
                  <p
                    id="edit-saving-plan-target-date-error"
                    className="
                      mt-2
                      font-medium text-red-600 text-xs
                    "
                  >
                    {targetDateError}
                  </p>
                )}

              {currentTargetDate && (
                <p
                  className="
                    mt-2
                    text-slate-500 text-xs
                  "
                >
                  Target date:{" "}
                  <span
                    className="
                      font-medium text-slate-700
                    "
                  >
                    {formatSavingPlanDate(
                      currentTargetDate,
                    )}
                  </span>
                </p>
              )}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Description                                                      */}
            {/* -------------------------------------------------------------- */}

            <div>
              <div
                className="
                  flex justify-between items-center
                  mb-2
                  gap-4
                "
              >
                <label
                  htmlFor="edit-saving-plan-description"
                  className="
                    flex items-center
                    font-semibold text-slate-700 text-sm
                    gap-2
                  "
                >
                  <FileText
                    aria-hidden="true"
                    className="
                      w-4 h-4
                      text-slate-400
                    "
                    strokeWidth={2}
                  /
                  >

                  Description
                </label>

                <span
                  className="
                    text-slate-400 text-xs
                  "
                >
                  {currentDescription.length}/
                  {MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <textarea
                id="edit-saving-plan-description"
                name="description"
                rows={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                value={currentDescription}
                aria-describedby={
                  descriptionError &&
                  touched?.description
                    ? "edit-saving-plan-description-error"
                    : undefined
                }
                aria-invalid={
                  touched?.description &&
                  Boolean(descriptionError)
                }
                className={[
                  "block w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  touched?.description &&
                  descriptionError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-blue-500",
                ].join(" ")}
                disabled={submitting}
                placeholder="Describe what this saving plan is for..."
                onBlur={handleBlur}
                onChange={handleChange}
              />

              {touched?.description &&
                descriptionError && (
                  <p
                    id="edit-saving-plan-description-error"
                    className="
                      mt-2
                      font-medium text-red-600 text-xs
                    "
                  >
                    {descriptionError}
                  </p>
                )}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Unsaved changes                                                 */}
            {/* -------------------------------------------------------------- */}

            {isDirty && !submitting && (
              <div
                className="
                  px-4 py-3
                  text-blue-800 text-sm
                  bg-blue-50
                  border border-blue-100 rounded-xl
                "
              >
                <p
                  className="
                    font-medium
                  "
                >
                  You have unsaved changes.
                </p>

                <p
                  className="
                    mt-0.5
                    text-blue-700
                  "
                >
                  Save your changes or reset the form
                  before closing.
                </p>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Footer                                                           */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              bottom-0 sticky flex flex-col-reverse sm:flex-row
              sm:justify-between sm:items-center
              px-6 py-4
              bg-white
              border-slate-200 border-t
              gap-3 shrink-0
            "
          >
            <button
              type="button"
              className="
                inline-flex justify-center items-center
                min-h-11
                px-4
                font-semibold text-slate-600 hover:text-slate-800 text-sm
                hover:bg-slate-100
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
              "
              disabled={
                submitting || !isDirty
              }
              onClick={handleReset}
            >
              Reset changes
            </button>

            <div
              className="
                flex flex-col-reverse sm:flex-row
                gap-3
              "
            >
              <button
                type="button"
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-300 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                "
                disabled={submitting}
                onClick={handleClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                aria-describedby={
                  displayFormError
                    ? formErrorId
                    : undefined
                }
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5
                  font-semibold text-white text-sm
                  bg-blue-600 hover:bg-blue-700
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-60 shadow-sm transition
                  disabled:cursor-not-allowed
                  gap-2
                "
                disabled={
                  submitting ||
                  !planId ||
                  !isDirty ||
                  !canSubmit
                }
              >
                {submitting ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="
                        w-4 h-4
                        animate-spin
                      "
                      /
                    >

                    Saving…
                  </>
                ) : (
                  <>
                    <Save
                      aria-hidden="true"
                      className="
                        w-4 h-4
                      "
                      strokeWidth={2}
                    /
                    >

                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSavingPlanModal;