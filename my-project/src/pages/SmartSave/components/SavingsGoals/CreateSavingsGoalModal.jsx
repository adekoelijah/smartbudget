import {
  AlertCircle,
  CalendarDays,
  Loader2,
  Target,
  Wallet,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatSavingsCurrency } from "../../../../utils/smartSave/savingsFormatters";
import { validateSavingsGoal } from "../../../../utils/smartSave/savingsValidators";
import { DEFAULT_CURRENCY } from "../../../../config/smartSaveConfig";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CURRENCY_LENGTH = 3;
const MAX_NAME_LENGTH = 100;

const DEFAULT_FORM = {
  name: "",
  targetAmount: "",
  currency: DEFAULT_CURRENCY,
  targetDate: "",
  description: "",
};

const DEFAULT_ERROR_MESSAGE =
  "Unable to save the savings goal. Please try again.";

/* =========================================================
   HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeCurrency = (
  value,
  fallback = DEFAULT_CURRENCY
) => {
  const normalize = (input) =>
    normalizeString(input)
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, MAX_CURRENCY_LENGTH);

  return (
    normalize(value) ||
    normalize(fallback) ||
    DEFAULT_CURRENCY
  );
};

const normalizeDate = (value) => {
  if (!value) return "";

  const match = String(value).match(
    /^(\d{4}-\d{2}-\d{2})/
  );

  return match ? match[1] : "";
};

const normalizeAmount = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0
    ? amount
    : "";
};

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof error === "string") {
    return (
      error.trim() || DEFAULT_ERROR_MESSAGE
    );
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  return typeof message === "string" &&
    message.trim()
    ? message.trim()
    : DEFAULT_ERROR_MESSAGE;
};

/* =========================================================
   INITIAL FORM
========================================================= */

const buildInitialForm = (
  initialValues,
  currency
) => {
  const source = isObject(initialValues)
    ? initialValues
    : {};

  return {
    name: normalizeString(
      source.name ??
        source.title ??
        ""
    ).slice(0, MAX_NAME_LENGTH),

    targetAmount:
      source.targetAmount ??
      source.amount ??
      "",

    currency: normalizeCurrency(
      source.currency ?? currency,
      currency
    ),

    targetDate: normalizeDate(
      source.targetDate
    ),

    description: normalizeString(
      source.description
    ).slice(
      0,
      MAX_DESCRIPTION_LENGTH
    ),
  };
};

/* =========================================================
   VALIDATION NORMALIZER
========================================================= */

const normalizeValidationResult = (
  result
) => {
  if (result === true) {
    return {
      valid: true,
      errors: {},
    };
  }

  if (!isObject(result)) {
    return {
      valid: true,
      errors: {},
    };
  }

  if (isObject(result.errors)) {
    const errors = result.errors;

    return {
      valid:
        result.valid !== false &&
        Object.keys(errors).length === 0,
      errors,
    };
  }

  if (result.valid === false) {
    return {
      valid: false,
      errors: {
        form:
          result.message ||
          "Please review the goal details.",
      },
    };
  }

  if (result.valid === true) {
    return {
      valid: true,
      errors: {},
    };
  }

  return {
    valid: true,
    errors: {},
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const CreateSavingsGoalModal = ({
  open = false,
  onClose,
  onSubmit,

  loading = false,

  initialValues = null,

  currency = DEFAULT_CURRENCY,

  title = "Create savings goal",
  submitLabel = "Create goal",

  className = "",
}) => {
  /* =======================================================
     STABLE SOURCE

     Important:
     Do not use the initialValues object itself as the
     identity of the form.

     Parent components may recreate the object on every
     render. We identify the logical goal instead.
  ======================================================= */

  const sourceKey = useMemo(() => {
    const source = isObject(initialValues)
      ? initialValues
      : {};

    const id =
      source.id ??
      source._id ??
      source.goalId ??
      "new";

    return [
      open ? "open" : "closed",
      String(id),
      normalizeCurrency(
        source.currency ?? currency,
        currency
      ),
      normalizeString(
        source.name ?? source.title ?? ""
      ),
      String(
        source.targetAmount ??
          source.amount ??
          ""
      ),
      normalizeDate(
        source.targetDate
      ),
    ].join("|");
  }, [
    open,
    initialValues,
    currency,
  ]);

  /* =======================================================
     INITIAL FORM

     This is derived from props.
  ======================================================= */

  const initialForm = useMemo(
    () =>
      buildInitialForm(
        initialValues,
        currency
      ),
    [
      initialValues,
      currency,
    ]
  );

  /* =======================================================
     FORM STATE

     The sourceKey allows us to switch between different
     logical modal instances without an effect that calls
     setState synchronously.
  ======================================================= */

  const [draft, setDraft] = useState(() => ({
    sourceKey,
    values: initialForm,
  }));

  const form =
    draft.sourceKey === sourceKey
      ? draft.values
      : initialForm;

  /* =======================================================
     VALIDATION STATE
  ======================================================= */

  const [errors, setErrors] = useState({});

  const [submitError, setSubmitError] =
    useState("");

  /* =======================================================
     REFS
  ======================================================= */

  const mountedRef = useRef(false);
  const submissionIdRef = useRef(0);
  const nameInputRef = useRef(null);

  /* =======================================================
     MOUNT TRACKING

     This effect only tracks lifecycle.
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     FIELD UPDATE
  ======================================================= */

  const updateField = useCallback(
    (field, value) => {
      setDraft((previous) => ({
        sourceKey,
        values: {
          ...(previous.sourceKey === sourceKey
            ? previous.values
            : initialForm),

          [field]: value,
        },
      }));

      setErrors((previous) => {
        if (!previous[field]) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[field];

        return next;
      });

      setSubmitError("");
    },
    [
      sourceKey,
      initialForm,
    ]
  );

  /* =======================================================
     FIELD ERROR
  ======================================================= */

  const getFieldError = useCallback(
    (field) => {
      const value = errors?.[field];

      if (Array.isArray(value)) {
        return value[0] || "";
      }

      if (typeof value === "string") {
        return value;
      }

      return "";
    },
    [errors]
  );

  /* =======================================================
     NORMALIZED PAYLOAD
  ======================================================= */

  const payload = useMemo(() => {
    const amount = normalizeAmount(
      form.targetAmount
    );

    return {
      name: normalizeString(
        form.name
      ),

      targetAmount: amount,

      currency: normalizeCurrency(
        form.currency,
        currency
      ),

      targetDate:
        normalizeDate(
          form.targetDate
        ) || null,

      description:
        normalizeString(
          form.description
        ) || undefined,
    };
  }, [
    form,
    currency,
  ]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(
    (values) => {
      try {
        return normalizeValidationResult(
          validateSavingsGoal(values)
        );
      } catch (error) {
        return {
          valid: false,
          errors: {
            form: getErrorMessage(error),
          },
        };
      }
    },
    []
  );

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!open || loading) {
        return;
      }

      setSubmitError("");

      const validation =
        validateForm(payload);

      if (!validation.valid) {
        setErrors(
          validation.errors || {}
        );
        return;
      }

      setErrors({});

      if (typeof onSubmit !== "function") {
        setSubmitError(
          "Goal submission is not configured."
        );
        return;
      }

      const submissionId =
        ++submissionIdRef.current;

      try {
        const result =
          await onSubmit(payload);

        /*
         * The parent can explicitly reject a submission
         * by returning false.
         */
        if (result === false) {
          throw new Error(
            DEFAULT_ERROR_MESSAGE
          );
        }

        /*
         * Ignore an old async response if another
         * submission happened afterward or the component
         * was unmounted.
         */
        if (
          !mountedRef.current ||
          submissionId !==
            submissionIdRef.current
        ) {
          return;
        }

        /*
         * Successful close/refresh should normally be
         * controlled by the parent page.
         */
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
      open,
      loading,
      validateForm,
      payload,
      onSubmit,
    ]
  );

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = useCallback(() => {
    if (loading) {
      return;
    }

    ++submissionIdRef.current;

    setErrors({});
    setSubmitError("");

    onClose?.();
  }, [
    loading,
    onClose,
  ]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
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

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =======================================================
     INITIAL FOCUS
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    open,
    sourceKey,
  ]);

  /* =======================================================
     TODAY

     Local date avoids UTC timezone problems.
  ======================================================= */

  const today = useMemo(() => {
    const date = new Date();

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const targetAmountNumber =
    Number(form.targetAmount);

  const formattedTargetAmount =
    Number.isFinite(
      targetAmountNumber
    ) &&
    targetAmountNumber > 0
      ? formatSavingsCurrency(
          targetAmountNumber,
          form.currency
        )
      : "";

  const isBusy = Boolean(loading);

  const nameError =
    getFieldError("name");

  const targetAmountError =
    getFieldError("targetAmount");

  const currencyError =
    getFieldError("currency");

  const targetDateError =
    getFieldError("targetDate");

  const descriptionError =
    getFieldError("description");

  const formError =
    getFieldError("form");

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropMouseDown =
    useCallback(
      (event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      },
      [handleClose]
    );

  if (!open) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        fixed inset-0 z-[100] flex items-center justify-center
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
          bg-slate-950/50
          backdrop-blur-sm
        "
        aria-hidden="true"
      /
      >

      {/* Modal */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-savings-goal-title"
        aria-describedby="create-savings-goal-description"
        aria-busy={isBusy}
        className={`
          relative z-10
          w-full max-w-lg
          max-h-[calc(100vh-2rem)]
          overflow-y-auto
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-2xl
          ${className}
        `}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex items-start justify-between
            px-5 sm:px-6 py-4
            border-b border-slate-200
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
                flex items-center justify-center
                h-10 w-10
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
                id="create-savings-goal-title"
                className="
                  text-base text-slate-900 font-semibold
                "
              >
                {title}
              </h2>

              <p
                id="create-savings-goal-description"
                className="
                  mt-1
                  text-sm text-slate-500 leading-5
                "
              >
                Define what you want to
                save for and your target
                amount.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Close savings goal dialog"
            className="
              flex items-center justify-center
              h-9 w-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
              transition disabled:opacity-50
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="
            space-y-5 px-5 sm:px-6 py-5
          "
        >
          {/* General Error */}

          {(formError || submitError) && (
            <div
              role="alert"
              className="
                flex items-start
                px-4 py-3
                text-sm text-red-700
                bg-red-50
                rounded-xl border border-red-200
                gap-3
              "
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

              <span>
                {submitError ||
                  formError}
              </span>
            </div>
          )}

          {/* =================================================
              GOAL NAME
          ================================================= */}

          <div>
            <label
              htmlFor="saving-goal-name"
              className="
                block
                mb-2
                text-sm text-slate-700 font-medium
              "
            >
              Goal name
            </label>

            <input
              ref={nameInputRef}
              id="saving-goal-name"
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="e.g. Emergency fund"
              autoComplete="off"
              disabled={isBusy}
              maxLength={MAX_NAME_LENGTH}
              aria-invalid={Boolean(
                nameError
              )}
              aria-describedby={
                nameError
                  ? "saving-goal-name-error"
                  : undefined
              }
              className="
                w-full rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-sm text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
                disabled:cursor-not-allowed
                disabled:bg-slate-50
              "
            />

            {nameError && (
              <p
                id="saving-goal-name-error"
                className="
                  mt-1.5
                  text-xs text-red-600
                "
              >
                {nameError}
              </p>
            )}
          </div>

          {/* =================================================
              AMOUNT + CURRENCY
          ================================================= */}

          <div
            className="
              grid grid-cols-1 sm:grid-cols-[1fr_110px]
              gap-4
            "
          >
            {/* Amount */}

            <div>
              <label
                htmlFor="saving-goal-target"
                className="
                  block
                  mb-2
                  text-sm text-slate-700 font-medium
                "
              >
                Target amount
              </label>

              <div
                className="
                  relative
                "
              >
                <Wallet
                  size={17}
                  className="
                    absolute left-3 top-1/2
                    text-slate-400
                    pointer-events-none
                    -translate-y-1/2
                  "
                  aria-hidden="true"
                /
                >

                <input
                  id="saving-goal-target"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={
                    form.targetAmount
                  }
                  onChange={(event) =>
                    updateField(
                      "targetAmount",
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  disabled={isBusy}
                  aria-invalid={Boolean(
                    targetAmountError
                  )}
                  aria-describedby={
                    targetAmountError
                      ? "saving-goal-target-error"
                      : formattedTargetAmount
                        ? "saving-goal-target-preview"
                        : undefined
                  }
                  className="
                    w-full rounded-xl
                    border border-slate-300
                    bg-white
                    py-3 pl-10 pr-4
                    text-sm text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                  "
                />
              </div>

              {targetAmountError && (
                <p
                  id="saving-goal-target-error"
                  className="
                    mt-1.5
                    text-xs text-red-600
                  "
                >
                  {targetAmountError}
                </p>
              )}

              {formattedTargetAmount && (
                <p
                  id="saving-goal-target-preview"
                  className="
                    mt-1.5
                    text-xs text-slate-500
                  "
                >
                  Target:{" "}
                  <span
                    className="
                      font-medium text-slate-700
                    "
                  >
                    {
                      formattedTargetAmount
                    }
                  </span>
                </p>
              )}
            </div>

            {/* Currency */}

            <div>
              <label
                htmlFor="saving-goal-currency"
                className="
                  block
                  mb-2
                  text-sm text-slate-700 font-medium
                "
              >
                Currency
              </label>

              <input
                id="saving-goal-currency"
                type="text"
                value={form.currency}
                onChange={(event) =>
                  updateField(
                    "currency",
                    event.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z]/g,
                        ""
                      )
                      .slice(
                        0,
                        MAX_CURRENCY_LENGTH
                      )
                  )
                }
                maxLength={
                  MAX_CURRENCY_LENGTH
                }
                autoComplete="off"
                disabled={isBusy}
                aria-invalid={Boolean(
                  currencyError
                )}
                aria-describedby={
                  currencyError
                    ? "saving-goal-currency-error"
                    : undefined
                }
                className="
                  w-full rounded-xl
                  border border-slate-300
                  bg-white
                  px-4 py-3
                  text-sm font-medium
                  uppercase text-slate-900
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              />

              {currencyError && (
                <p
                  id="saving-goal-currency-error"
                  className="
                    mt-1.5
                    text-xs text-red-600
                  "
                >
                  {currencyError}
                </p>
              )}
            </div>
          </div>

          {/* =================================================
              TARGET DATE
          ================================================= */}

          <div>
            <label
              htmlFor="saving-goal-date"
              className="
                block
                mb-2
                text-sm text-slate-700 font-medium
              "
            >
              Target date
              <span
                className="
                  ml-1
                  font-normal text-slate-400
                "
              >
                (optional)
              </span>
            </label>

            <div
              className="
                relative
              "
            >
              <CalendarDays
                size={17}
                className="
                  absolute left-3 top-1/2
                  text-slate-400
                  pointer-events-none
                  -translate-y-1/2
                "
                aria-hidden="true"
              /
              >

              <input
                id="saving-goal-date"
                type="date"
                value={
                  form.targetDate
                }
                onChange={(event) =>
                  updateField(
                    "targetDate",
                    event.target.value
                  )
                }
                min={today}
                disabled={isBusy}
                aria-invalid={Boolean(
                  targetDateError
                )}
                aria-describedby={
                  targetDateError
                    ? "saving-goal-date-error"
                    : undefined
                }
                className="
                  w-full rounded-xl
                  border border-slate-300
                  bg-white
                  py-3 pl-10 pr-4
                  text-sm text-slate-900
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              />
            </div>

            {targetDateError && (
              <p
                id="saving-goal-date-error"
                className="
                  mt-1.5
                  text-xs text-red-600
                "
              >
                {targetDateError}
              </p>
            )}
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div>
            <div
              className="
                flex items-center justify-between
                mb-2
              "
            >
              <label
                htmlFor="saving-goal-description"
                className="
                  text-sm text-slate-700 font-medium
                "
              >
                Description
                <span
                  className="
                    ml-1
                    font-normal text-slate-400
                  "
                >
                  (optional)
                </span>
              </label>

              <span
                className="
                  text-xs text-slate-400
                "
              >
                {form.description.length}/
                {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>

            <textarea
              id="saving-goal-description"
              value={
                form.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value.slice(
                    0,
                    MAX_DESCRIPTION_LENGTH
                  )
                )
              }
              rows={3}
              maxLength={
                MAX_DESCRIPTION_LENGTH
              }
              placeholder="What are you saving this money for?"
              disabled={isBusy}
              aria-invalid={Boolean(
                descriptionError
              )}
              aria-describedby={
                descriptionError
                  ? "saving-goal-description-error"
                  : undefined
              }
              className="
                w-full resize-none
                rounded-xl
                border border-slate-300
                bg-white
                px-4 py-3
                text-sm leading-5
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
                disabled:cursor-not-allowed
                disabled:bg-slate-50
              "
            />

            {descriptionError && (
              <p
                id="saving-goal-description-error"
                className="
                  mt-1.5
                  text-xs text-red-600
                "
              >
                {descriptionError}
              </p>
            )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              pt-5
              border-t border-slate-100
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="
                px-5 py-3
                text-sm text-slate-700 font-medium
                bg-white hover:bg-slate-50
                rounded-xl border border-slate-300 focus:outline-none
                focus:ring-2 focus:ring-slate-400/30
                transition disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="
                inline-flex items-center justify-center
                px-5 py-3
                text-sm text-white font-semibold
                bg-blue-600 hover:bg-blue-700
                rounded-xl focus:outline-none
                focus:ring-4 focus:ring-blue-500/20
                shadow-sm transition disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {isBusy ? (
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
                    Creating...
                  </span>
                </>
              ) : (
                <>
                  <Target
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    {submitLabel}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateSavingsGoalModal;