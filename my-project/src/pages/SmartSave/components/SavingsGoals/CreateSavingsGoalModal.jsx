import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
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

const DEFAULT_FORM = Object.freeze({
  name: "",
  targetAmount: "",
  currency: DEFAULT_CURRENCY,
  targetDate: "",
  description: "",
});

const EMPTY_ERRORS = Object.freeze({});

const DEFAULT_ERROR_MESSAGE =
  "Unable to save the savings goal. Please try again.";

/* =========================================================
   SAFE VALUE HELPERS
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

const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  const match = stringValue.match(
    /^(\d{4}-\d{2}-\d{2})/
  );

  return match ? match[1] : "";
};

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

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

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR_MESSAGE;
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
    ),

    targetAmount:
      source.targetAmount ??
      source.amount ??
      "",

    currency: normalizeCurrency(
      source.currency ??
        currency ??
        DEFAULT_CURRENCY,
      currency || DEFAULT_CURRENCY
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
   SOURCE KEY

   The source key identifies the logical form instance.

   Example:
   open:new:NGN
   open:abc123:NGN
   closed
========================================================= */

const getSourceKey = (
  open,
  initialValues,
  currency
) => {
  if (!open) {
    return "closed";
  }

  const sourceId =
    initialValues?.id ??
    initialValues?._id ??
    initialValues?.goalId ??
    "new";

  return [
    "open",
    String(sourceId),
    normalizeCurrency(
      currency,
      DEFAULT_CURRENCY
    ),
  ].join(":");
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
      errors: EMPTY_ERRORS,
    };
  }

  if (!isObject(result)) {
    return {
      valid: true,
      errors: EMPTY_ERRORS,
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
      errors: EMPTY_ERRORS,
    };
  }

  return {
    valid: true,
    errors: EMPTY_ERRORS,
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
     SOURCE
  ======================================================= */

  const sourceKey = useMemo(
    () =>
      getSourceKey(
        open,
        initialValues,
        currency
      ),
    [
      open,
      initialValues,
      currency,
    ]
  );

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

     IMPORTANT:
     We do NOT synchronize this state inside useEffect.

     The initial value is calculated lazily when the
     component mounts.

     When the logical source changes, the rendered form
     falls back to initialForm until the user edits it.

     This avoids:

       useEffect(() => {
         setForm(...)
       }, [...])

     which was causing the React cascading-render warning.
  ======================================================= */

  const [
    draftState,
    setDraftState,
  ] = useState(() => ({
    sourceKey: getSourceKey(
      open,
      initialValues,
      currency
    ),
    values: buildInitialForm(
      initialValues,
      currency
    ),
  }));

  const form =
    draftState.sourceKey === sourceKey
      ? draftState.values
      : initialForm;

  /* =======================================================
     ERROR STATE
  ======================================================= */

  const [
    errorState,
    setErrorState,
  ] = useState(() => ({
    sourceKey: getSourceKey(
      open,
      initialValues,
      currency
    ),
    values: EMPTY_ERRORS,
  }));

  const errors =
    errorState.sourceKey === sourceKey
      ? errorState.values
      : EMPTY_ERRORS;

  /* =======================================================
     SUBMITTED STATE
  ======================================================= */

  const [
    submittedState,
    setSubmittedState,
  ] = useState(() => ({
    sourceKey: getSourceKey(
      open,
      initialValues,
      currency
    ),
    value: false,
  }));

  const submitted =
    submittedState.sourceKey === sourceKey
      ? submittedState.value
      : false;

  /* =======================================================
     SUBMIT ERROR
  ======================================================= */

  const [
    submitErrorState,
    setSubmitErrorState,
  ] = useState(() => ({
    sourceKey: getSourceKey(
      open,
      initialValues,
      currency
    ),
    value: "",
  }));

  const submitError =
    submitErrorState.sourceKey === sourceKey
      ? submitErrorState.value
      : "";

  /* =======================================================
     REFS
  ======================================================= */

  const mountedRef = useRef(true);
  const submissionIdRef = useRef(0);
  const nameInputRef = useRef(null);

  /* =======================================================
     MOUNT TRACKING

     This effect only subscribes to component lifecycle.
     It does not update React state.
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
      setDraftState((previous) => ({
        sourceKey,
        values: {
          ...(previous.sourceKey === sourceKey
            ? previous.values
            : form),

          [field]: value,
        },
      }));

      setErrorState((previous) => {
        if (
          previous.sourceKey !== sourceKey ||
          !previous.values?.[field]
        ) {
          return {
            sourceKey,
            values:
              previous.sourceKey === sourceKey
                ? previous.values
                : EMPTY_ERRORS,
          };
        }

        const nextErrors = {
          ...previous.values,
        };

        delete nextErrors[field];

        return {
          sourceKey,
          values: nextErrors,
        };
      });

      setSubmitErrorState({
        sourceKey,
        value: "",
      });

      setSubmittedState({
        sourceKey,
        value: false,
      });
    },
    [
      form,
      sourceKey,
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

  const normalizedPayload = useMemo(
    () => ({
      name: normalizeString(form.name),

      targetAmount: normalizeAmount(
        form.targetAmount
      ),

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
    }),
    [
      form,
      currency,
    ]
  );

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

      if (loading || !open) {
        return;
      }

      const validation =
        validateForm(
          normalizedPayload
        );

      setSubmittedState({
        sourceKey,
        value: true,
      });

      setSubmitErrorState({
        sourceKey,
        value: "",
      });

      if (!validation.valid) {
        setErrorState({
          sourceKey,
          values:
            validation.errors ||
            EMPTY_ERRORS,
        });

        return;
      }

      setErrorState({
        sourceKey,
        values: EMPTY_ERRORS,
      });

      if (typeof onSubmit !== "function") {
        setSubmitErrorState({
          sourceKey,
          value:
            "Goal submission is not configured.",
        });

        return;
      }

      const submissionId =
        ++submissionIdRef.current;

      try {
        const result =
          await onSubmit(
            normalizedPayload
          );

        /*
         * Explicit false means the parent rejected
         * the submission without throwing.
         */
        if (result === false) {
          throw new Error(
            DEFAULT_ERROR_MESSAGE
          );
        }

        /*
         * Ignore stale asynchronous results.
         */
        if (
          !mountedRef.current ||
          submissionId !==
            submissionIdRef.current
        ) {
          return;
        }
      } catch (error) {
        if (
          !mountedRef.current ||
          submissionId !==
            submissionIdRef.current
        ) {
          return;
        }

        setSubmitErrorState({
          sourceKey,
          value:
            getErrorMessage(error),
        });
      }
    },
    [
      loading,
      open,
      validateForm,
      normalizedPayload,
      onSubmit,
      sourceKey,
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

    setDraftState({
      sourceKey: "closed",
      values: DEFAULT_FORM,
    });

    setErrorState({
      sourceKey: "closed",
      values: EMPTY_ERRORS,
    });

    setSubmittedState({
      sourceKey: "closed",
      value: false,
    });

    setSubmitErrorState({
      sourceKey: "closed",
      value: "",
    });

    onClose?.();
  }, [
    loading,
    onClose,
  ]);

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

  /* =======================================================
     MODAL MOUSE DOWN
  ======================================================= */

  const handleModalMouseDown =
    useCallback((event) => {
      event.stopPropagation();
    }, []);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
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

    const body = document.body;
    const previousOverflow =
      body.style.overflow;

    body.style.overflow = "hidden";

    return () => {
      body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =======================================================
     INITIAL FOCUS

     This effect synchronizes with the DOM, which is
     exactly what useEffect is intended for.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    open,
    sourceKey,
  ]);

  /* =======================================================
     DERIVED DISPLAY VALUES
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

  /*
   * Local calendar date instead of UTC-based
   * toISOString(), avoiding timezone issues.
   */
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
     FIELD ERRORS
  ======================================================= */

  const nameError =
    getFieldError("name");

  const targetAmountError =
    getFieldError("targetAmount");

  const targetDateError =
    getFieldError("targetDate");

  const currencyError =
    getFieldError("currency");

  const descriptionError =
    getFieldError("description");

  const formError =
    getFieldError("form");

  const isBusy = Boolean(loading);

  /* =======================================================
     RENDER
  ======================================================= */

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        z-[100] fixed inset-0 flex justify-center items-center
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
          bg-black/50
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
        onMouseDown={
          handleModalMouseDown
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex justify-between items-start
            px-5 sm:px-6 py-4
            border-slate-200 border-b
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
                id="create-savings-goal-title"
                className="
                  font-semibold text-slate-900 text-base
                "
              >
                {title}
              </h2>

              <p
                id="create-savings-goal-description"
                className="
                  mt-1
                  text-slate-500 text-sm leading-5
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
              flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/40
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
          {/* General error */}
          {(formError || submitError) && (
            <div
              role="alert"
              className="
                flex items-start
                px-4 py-3
                text-red-700 text-sm
                bg-red-50
                border border-red-200 rounded-xl
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
                font-medium text-slate-700 text-sm
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
              maxLength={100}
              aria-invalid={Boolean(
                nameError
              )}
              aria-describedby={
                nameError
                  ? "saving-goal-name-error"
                  : undefined
              }
              className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
            />

            {nameError && (
              <p
                id="saving-goal-name-error"
                className="
                  mt-1.5
                  text-red-600 text-xs
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
                  font-medium text-slate-700 text-sm
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
                    top-1/2 left-3 absolute
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
                  className="bg-white disabled:bg-slate-50 py-3 pr-4 pl-10 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
                />
              </div>

              {targetAmountError && (
                <p
                  id="saving-goal-target-error"
                  className="
                    mt-1.5
                    text-red-600 text-xs
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
                    text-slate-500 text-xs
                  "
                >
                  Target:{" "}
                  <span
                    className="
                      font-medium
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
                  font-medium text-slate-700 text-sm
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
                className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full font-medium text-slate-900 text-sm uppercase transition disabled:cursor-not-allowed"
              />

              {currencyError && (
                <p
                  id="saving-goal-currency-error"
                  className="
                    mt-1.5
                    text-red-600 text-xs
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
                font-medium text-slate-700 text-sm
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
                  top-1/2 left-3 absolute
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
                disabled={isBusy}
                min={today}
                aria-invalid={Boolean(
                  targetDateError
                )}
                aria-describedby={
                  targetDateError
                    ? "saving-goal-date-error"
                    : undefined
                }
                className="bg-white disabled:bg-slate-50 py-3 pr-4 pl-10 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 text-sm transition disabled:cursor-not-allowed"
              />
            </div>

            {targetDateError && (
              <p
                id="saving-goal-date-error"
                className="
                  mt-1.5
                  text-red-600 text-xs
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
            <label
              htmlFor="saving-goal-description"
              className="
                block
                mb-2
                font-medium text-slate-700 text-sm
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
              className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm leading-5 transition resize-none disabled:cursor-not-allowed"
            />

            <div
              className="
                flex justify-between
                mt-1
              "
            >
              {descriptionError ? (
                <p
                  id="saving-goal-description-error"
                  className="
                    text-red-600 text-xs
                  "
                >
                  {descriptionError}
                </p>
              ) : (
                <span />
              )}

              <span
                className="
                  text-slate-400 text-xs
                "
                aria-label={`${form.description.length} of ${MAX_DESCRIPTION_LENGTH} characters`}
              >
                {form.description.length}/
                {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* =================================================
              VALIDATION SUCCESS
          ================================================= */}

          {submitted &&
            Object.keys(errors).length === 0 &&
            !submitError &&
            !isBusy && (
              <div
                className="
                  flex items-center
                  px-4 py-3
                  text-emerald-700 text-sm
                  bg-emerald-50
                  border border-emerald-100 rounded-xl
                  gap-2
                "
                role="status"
              >
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  Goal details are ready.
                </span>
              </div>
            )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              pt-5
              border-slate-100 border-t
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="
                px-5 py-3
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-300 rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400/30
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="
                inline-flex justify-center items-center
                px-5 py-3
                font-semibold text-white text-sm
                bg-blue-600 hover:bg-blue-700
                rounded-xl focus:outline-none
                focus:ring-4 focus:ring-blue-500/20
                disabled:opacity-60 shadow-sm transition
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