/**
 * CreateSavingPlanModal.jsx
 *
 * SmartSave — Create Saving Plan
 *
 * Responsibilities:
 * - Render the create-saving-plan modal.
 * - Manage local form state.
 * - Validate user input.
 * - Normalize the form payload.
 * - Delegate creation to the parent through onSubmit().
 *
 * Architecture:
 *
 * CreateSavingPlanModal
 *        ↓
 * onSubmit(payload)
 *        ↓
 * SavingPlansPage
 *        ↓
 * useSavingPlans
 *        ↓
 * smartSaveService
 *        ↓
 * SmartSave API
 *
 * This component does NOT:
 * - Call APIs directly.
 * - Contain financial business logic.
 * - Manage saving-plan server state.
 * - Import useSavingPlans.
 */

import {
  AlertCircle,
  CalendarDays,
  Check,
  FileText,
  Loader2,
  PiggyBank,
  Target,
  Wallet,
  X,
} from "lucide-react";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  formatSavingPlanPayload,
} from "../../../../utils/smartSave/savingPlanFormatters";

/* ==========================================================================
   CONSTANTS
========================================================================== */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_FORM = Object.freeze({
  name: "",
  targetAmount: "",
  currency: DEFAULT_CURRENCY,
  targetDate: "",
  description: "",
});

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/* ==========================================================================
   HELPERS
========================================================================== */

/**
 * Return today's date in local YYYY-MM-DD format.
 *
 * Using local time instead of toISOString() prevents UTC timezone
 * conversion from producing the previous/next calendar day.
 */
const getTodayInputValue = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Convert unknown errors into a user-readable message.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  const responseMessage =
    error?.response?.data?.message;

  if (
    typeof responseMessage === "string" &&
    responseMessage.trim()
  ) {
    return responseMessage.trim();
  }

  const responseError =
    error?.response?.data?.error;

  if (
    typeof responseError === "string" &&
    responseError.trim()
  ) {
    return responseError.trim();
  }

  const dataMessage =
    error?.data?.message;

  if (
    typeof dataMessage === "string" &&
    dataMessage.trim()
  ) {
    return dataMessage.trim();
  }

  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "Unable to create the saving plan. Please try again.";
};

/**
 * Build a fresh form object.
 */
const createInitialForm = () => ({
  name: "",
  targetAmount: "",
  currency: DEFAULT_CURRENCY,
  targetDate: "",
  description: "",
});

/**
 * Validate the form before submission.
 */
const validateForm = (form) => {
  const errors = {};

  const name =
    typeof form.name === "string"
      ? form.name.trim()
      : "";

  const description =
    typeof form.description === "string"
      ? form.description.trim()
      : "";

  const targetAmount =
    typeof form.targetAmount === "string"
      ? form.targetAmount.trim()
      : String(form.targetAmount ?? "").trim();

  const currency =
    typeof form.currency === "string"
      ? form.currency.trim().toUpperCase()
      : "";

  const targetDate =
    typeof form.targetDate === "string"
      ? form.targetDate.trim()
      : "";

  /* ------------------------------------------------------------------------
     NAME
  ------------------------------------------------------------------------ */

  if (!name) {
    errors.name =
      "Please enter a name for your saving plan.";
  } else if (
    name.length < 2
  ) {
    errors.name =
      "Saving plan name must contain at least 2 characters.";
  } else if (
    name.length > MAX_NAME_LENGTH
  ) {
    errors.name =
      `Saving plan name cannot exceed ${MAX_NAME_LENGTH} characters.`;
  }

  /* ------------------------------------------------------------------------
     TARGET AMOUNT
  ------------------------------------------------------------------------ */

  if (!targetAmount) {
    errors.targetAmount =
      "Please enter your savings target.";
  } else {
    const numericAmount =
      Number(
        targetAmount.replace(/,/g, "")
      );

    if (
      !Number.isFinite(numericAmount)
    ) {
      errors.targetAmount =
        "Enter a valid target amount.";
    } else if (
      numericAmount <= 0
    ) {
      errors.targetAmount =
        "Target amount must be greater than zero.";
    }
  }

  /* ------------------------------------------------------------------------
     CURRENCY
  ------------------------------------------------------------------------ */

  if (!currency) {
    errors.currency =
      "Please select a currency.";
  }

  /* ------------------------------------------------------------------------
     TARGET DATE
  ------------------------------------------------------------------------ */

  if (!targetDate) {
    errors.targetDate =
      "Please select a target date.";
  } else {
    const parsedDate =
      new Date(
        `${targetDate}T00:00:00`
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      errors.targetDate =
        "Please enter a valid target date.";
    } else if (
      targetDate < getTodayInputValue()
    ) {
      errors.targetDate =
        "Target date cannot be in the past.";
    }
  }

  /* ------------------------------------------------------------------------
     DESCRIPTION
  ------------------------------------------------------------------------ */

  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    errors.description =
      `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return errors;
};

/* ==========================================================================
   SMALL UI COMPONENTS
========================================================================== */

const FieldLabel = ({
  htmlFor,
  children,
  required = false,
}) => (
  <label
    htmlFor={htmlFor}
    className="
      block
      mb-2
      font-semibold text-slate-700 text-sm
    "
  >
    {children}

    {required ? (
      <span
        className="
          ml-1
          text-red-500
        "
        aria-hidden="true"
      >
        *
      </span>
    ) : null}
  </label>
);

const FieldError = ({
  children,
}) => {
  if (!children) {
    return null;
  }

  return (
    <p
      className="
        flex items-start
        mt-2
        font-medium text-red-600 text-xs
        gap-1.5
      "
      role="alert"
    >
      <AlertCircle
        size={14}
        className="
          mt-0.5
          shrink-0
        "
        aria-hidden="true"
      /
      >

      <span>
        {children}
      </span>
    </p>
  );
};

/* ==========================================================================
   COMPONENT
========================================================================== */

const CreateSavingPlanModal = ({
  open = false,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const [form, setForm] = useState(
    createInitialForm
  );

  const [errors, setErrors] =
    useState({});

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const nameInputRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  const submissionIdRef =
    useRef(0);

  /* ========================================================================
     MOUNT TRACKING
  ======================================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ========================================================================
     BODY SCROLL LOCK
  ======================================================================== */

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

  /* ========================================================================
     ESCAPE KEY
  ======================================================================== */

  const handleClose = useCallback(() => {
    if (submitting) {
      return;
    }

    ++submissionIdRef.current;

    setErrors({});
    setSubmitError("");
    setForm(createInitialForm());

    if (
      typeof onClose === "function"
    ) {
      onClose();
    }
  }, [
    onClose,
    submitting,
  ]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key !== "Escape"
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
    handleClose,
  ]);

  /* ========================================================================
     INITIAL FOCUS
  ======================================================================== */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer =
      window.setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [open]);

  /* ========================================================================
     FORM HANDLING
  ======================================================================== */

  const handleChange = useCallback(
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm((current) => ({
        ...current,
        [name]: value,
      }));

      setErrors((current) => {
        if (!current[name]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[name];

        return next;
      });

      if (submitError) {
        setSubmitError("");
      }
    },
    [submitError]
  );

  /* ========================================================================
     PAYLOAD
  ======================================================================== */

  const payload = useMemo(
    () =>
      formatSavingPlanPayload(
        form,
        DEFAULT_CURRENCY
      ),
    [form]
  );

  /* ========================================================================
     SUBMIT
  ======================================================================== */

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (
          submitting ||
          !open
        ) {
          return;
        }

        setSubmitError("");

        const validationErrors =
          validateForm(form);

        if (
          Object.keys(
            validationErrors
          ).length > 0
        ) {
          setErrors(
            validationErrors
          );
          return;
        }

        if (
          !payload
        ) {
          setSubmitError(
            "Unable to prepare the saving plan data."
          );
          return;
        }

        if (
          typeof onSubmit !==
          "function"
        ) {
          setSubmitError(
            "Saving plan creation is currently unavailable."
          );
          return;
        }

        setErrors({});

        const submissionId =
          ++submissionIdRef.current;

        try {
          const result =
            await onSubmit(
              payload
            );

          if (
            result === false
          ) {
            throw new Error(
              "The saving plan could not be created."
            );
          }

          if (
            !mountedRef.current ||
            submissionId !==
              submissionIdRef.current
          ) {
            return;
          }

          /*
           * The parent page controls closing the modal.
           *
           * We still reset local form state here so that if the
           * component remains mounted, the next create operation
           * starts clean.
           */
          setForm(
            createInitialForm()
          );

          setErrors({});
          setSubmitError("");
        } catch (error) {
          if (
            !mountedRef.current ||
            submissionId !==
              submissionIdRef.current
          ) {
            return;
          }

          setSubmitError(
            getErrorMessage(error)
          );
        }
      },
      [
        form,
        onSubmit,
        open,
        payload,
        submitting,
      ]
    );

  /* ========================================================================
     OVERLAY CLICK
  ======================================================================== */

  const handleOverlayClick =
    useCallback(
      (event) => {
        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        handleClose();
      },
      [handleClose]
    );

  /* ========================================================================
     RENDER GUARD
  ======================================================================== */

  if (!open) {
    return null;
  }

  const nameError =
    errors.name;

  const targetAmountError =
    errors.targetAmount;

  const currencyError =
    errors.currency;

  const targetDateError =
    errors.targetDate;

  const descriptionError =
    errors.description;

  const today =
    getTodayInputValue();

  /* ========================================================================
     RENDER
  ======================================================================== */

 const handleModalMouseDown = (event) => {
  event.stopPropagation();
};
    return (
    <div
      className="
        z-[100] fixed inset-0 flex justify-center items-center
        p-4 sm:p-6
        bg-slate-950/60
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-saving-plan-title"
      onMouseDown={
        handleOverlayClick
      }
    >
      <div
        className="
          flex flex-col overflow-hidden
          w-full max-w-2xl max-h-[92vh]
          bg-white
          border border-slate-200 rounded-3xl
          shadow-2xl
        "
        onMouseDown={handleModalMouseDown}
      >
        {/* ================================================================
            HEADER
        ================================================================ */}

        <div
          className="
            flex justify-between items-start
            px-5 sm:px-7 py-5
            bg-white
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
                w-12 h-12
                text-blue-600
                bg-blue-50
                rounded-2xl
                shrink-0
              "
            >
              <PiggyBank
                size={24}
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="create-saving-plan-title"
                className="
                  font-bold text-slate-950 text-lg sm:text-xl tracking-tight
                "
              >
                Create saving plan
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-sm leading-5
                "
              >
                Set a clear savings target
                and a deadline for achieving it.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close create saving plan"
            className="
              flex justify-center items-center
              w-10 h-10
              text-slate-500 hover:text-slate-900
              hover:bg-slate-100
              rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ================================================================
            FORM CONTENT
        ================================================================ */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="
            flex-1 overflow-y-auto
            min-h-0
          "
        >
          <div
            className="
              space-y-6 px-5 sm:px-7 py-6
            "
          >
            {/* ============================================================
                GENERAL INFORMATION
            ============================================================ */}

            <section>
              <div
                className="
                  flex items-center
                  mb-4
                  gap-2
                "
              >
                <FileText
                  size={17}
                  className="
                    text-blue-600
                  "
                  aria-hidden="true"
                /
                >

                <h3
                  className="
                    font-bold text-slate-900 text-sm
                  "
                >
                  Plan information
                </h3>
              </div>

              <div
                className="
                  space-y-5
                "
              >
                {/* NAME */}

                <div>
                  <FieldLabel
                    htmlFor="saving-plan-name"
                    required
                  >
                    Plan name
                  </FieldLabel>

                  <input
                    ref={nameInputRef}
                    id="saving-plan-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    maxLength={
                      MAX_NAME_LENGTH
                    }
                    placeholder="e.g. Emergency fund"
                    autoComplete="off"
                    aria-invalid={
                      Boolean(
                        nameError
                      )
                    }
                    aria-describedby={
                      nameError
                        ? "saving-plan-name-error"
                        : undefined
                    }
                    className={`
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                      ${
                        nameError
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }
                    `}
                  />

                  <div
                    className="
                      flex justify-between items-center
                      mt-2
                      gap-3
                    "
                  >
                    <div
                      id="saving-plan-name-error"
                    >
                      <FieldError>
                        {nameError}
                      </FieldError>
                    </div>

                    <span
                      className="
                        ml-auto
                        text-slate-400 text-xs
                      "
                    >
                      {form.name.length}/
                      {MAX_NAME_LENGTH}
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <FieldLabel
                    htmlFor="saving-plan-description"
                  >
                    Description
                  </FieldLabel>

                  <textarea
                    id="saving-plan-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    maxLength={
                      MAX_DESCRIPTION_LENGTH
                    }
                    rows={4}
                    placeholder="What are you saving for?"
                    className={`
                      w-full
                      resize-none
                      rounded-xl
                      border
                      bg-white
                      px-4
                      py-3
                      text-sm
                      font-medium
                      leading-6
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                      ${
                        descriptionError
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }
                    `}
                  />

                  <div
                    className="
                      flex justify-between items-start
                      mt-2
                      gap-3
                    "
                  >
                    <FieldError>
                      {descriptionError}
                    </FieldError>

                    <span
                      className="
                        ml-auto
                        text-slate-400 text-xs
                        shrink-0
                      "
                    >
                      {
                        form.description
                          .length
                      }
                      /
                      {
                        MAX_DESCRIPTION_LENGTH
                      }
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================
                TARGET
            ============================================================ */}

            <section
              className="
                p-4 sm:p-5
                bg-slate-50/70
                border border-slate-200 rounded-2xl
              "
            >
              <div
                className="
                  flex items-center
                  mb-5
                  gap-2
                "
              >
                <Target
                  size={18}
                  className="
                    text-blue-600
                  "
                  aria-hidden="true"
                /
                >

                <div>
                  <h3
                    className="
                      font-bold text-slate-900 text-sm
                    "
                  >
                    Savings target
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-slate-500 text-xs
                    "
                  >
                    Define how much you want
                    to save and when you want
                    to reach it.
                  </p>
                </div>
              </div>

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2
                  gap-5
                "
              >
                {/* TARGET AMOUNT */}

                <div>
                  <FieldLabel
                    htmlFor="saving-plan-target-amount"
                    required
                  >
                    Target amount
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <span
                      className="
                        top-1/2 left-4 absolute
                        font-bold text-slate-500 text-sm
                        pointer-events-none
                        -translate-y-1/2
                      "
                    >
                      ₦
                    </span>

                    <input
                      id="saving-plan-target-amount"
                      name="targetAmount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      value={
                        form.targetAmount
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        submitting
                      }
                      placeholder="0.00"
                      aria-invalid={
                        Boolean(
                          targetAmountError
                        )
                      }
                      className={`
                        h-12
                        w-full
                        rounded-xl
                        border
                        bg-white
                        py-2
                        pr-4
                        pl-10
                        text-sm
                        font-semibold
                        text-slate-950
                        outline-none
                        transition
                        placeholder:text-slate-400
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        ${
                          targetAmountError
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        }
                      `}
                    />
                  </div>

                  <FieldError>
                    {targetAmountError}
                  </FieldError>
                </div>

                {/* CURRENCY */}

                <div>
                  <FieldLabel
                    htmlFor="saving-plan-currency"
                    required
                  >
                    Currency
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <Wallet
                      size={16}
                      className="
                        top-1/2 left-4 absolute
                        text-slate-400
                        pointer-events-none
                        -translate-y-1/2
                      "
                      aria-hidden="true"
                    /
                    >

                    <select
                      id="saving-plan-currency"
                      name="currency"
                      value={
                        form.currency
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        submitting
                      }
                      aria-invalid={
                        Boolean(
                          currencyError
                        )
                      }
                      className={`
                        h-12
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        bg-white
                        px-4
                        pl-11
                        text-sm
                        font-semibold
                        text-slate-950
                        outline-none
                        transition
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        ${
                          currencyError
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        }
                      `}
                    >
                      <option value="NGN">
                        Nigerian Naira (NGN)
                      </option>
                    </select>
                  </div>

                  <FieldError>
                    {currencyError}
                  </FieldError>
                </div>

                {/* TARGET DATE */}

                <div
                  className="
                    sm:col-span-2
                  "
                >
                  <FieldLabel
                    htmlFor="saving-plan-target-date"
                    required
                  >
                    Target date
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <CalendarDays
                      size={17}
                      className="
                        top-1/2 left-4 absolute
                        text-slate-400
                        pointer-events-none
                        -translate-y-1/2
                      "
                      aria-hidden="true"
                    /
                    >

                    <input
                      id="saving-plan-target-date"
                      name="targetDate"
                      type="date"
                      min={today}
                      value={
                        form.targetDate
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        submitting
                      }
                      aria-invalid={
                        Boolean(
                          targetDateError
                        )
                      }
                      className={`
                        h-12
                        w-full
                        rounded-xl
                        border
                        bg-white
                        px-4
                        pl-11
                        text-sm
                        font-medium
                        text-slate-950
                        outline-none
                        transition
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        ${
                          targetDateError
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        }
                      `}
                    />
                  </div>

                  <FieldError>
                    {targetDateError}
                  </FieldError>

                  <p
                    className="
                      mt-2
                      text-slate-500 text-xs
                    "
                  >
                    Choose the date by which
                    you want to reach this
                    savings target.
                  </p>
                </div>
              </div>
            </section>

            {/* ============================================================
                SUBMIT ERROR
            ============================================================ */}

            {submitError ? (
              <div
                className="
                  flex items-start
                  px-4 py-3.5
                  text-red-700 text-sm
                  bg-red-50
                  border border-red-200 rounded-2xl
                  gap-3
                "
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="
                    mt-0.5
                    text-red-600
                    shrink-0
                  "
                  aria-hidden="true"
                /
                >

                <div>
                  <p
                    className="
                      font-semibold
                    "
                  >
                    Could not create saving plan
                  </p>

                  <p
                    className="
                      mt-0.5
                      leading-5
                    "
                  >
                    {submitError}
                  </p>
                </div>
              </div>
            ) : null}

            {/* ============================================================
                INFORMATION
            ============================================================ */}

            <div
              className="
                flex items-start
                px-4 py-3.5
                bg-blue-50/70
                border border-blue-100 rounded-2xl
                gap-3
              "
            >
              <Check
                size={17}
                className="
                  mt-0.5
                  text-blue-600
                  shrink-0
                "
                aria-hidden="true"
              /
              >

              <p
                className="
                  text-slate-600 text-xs leading-5
                "
              >
                Your saving plan defines
                the target configuration.
                Contributions and automated
                saving activity are managed
                separately by SmartSave.
              </p>
            </div>
          </div>

          {/* ==============================================================
              FOOTER
          ============================================================== */}

          <div
            className="
              bottom-0 sticky flex flex-col-reverse sm:flex-row sm:justify-end
              px-5 sm:px-7 py-4
              bg-white
              border-slate-200 border-t
              gap-3 shrink-0
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="
                h-12
                px-5
                font-semibold text-slate-700 hover:text-slate-950 text-sm
                bg-white hover:bg-slate-50
                border border-slate-300 rounded-xl
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="
                flex justify-center items-center
                h-12
                px-6
                font-bold text-white text-sm
                bg-blue-600 hover:bg-blue-700
                rounded-xl
                disabled:opacity-60 shadow-blue-600/20 shadow-lg transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {submitting ? (
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
                    Creating plan...
                  </span>
                </>
              ) : (
                <>
                  <PiggyBank
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Create saving plan
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(
  CreateSavingPlanModal
);