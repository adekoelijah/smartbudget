import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Save,
  Target,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  formatSavingsCurrency,
  formatSavingsDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  normalizeSavingsGoal,
} from "../../../../utils/smartSave/savingsNormalizers";

import {
  validateSavingsGoal,
} from "../../../../utils/smartSave/savingsValidators";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_FORM = Object.freeze({
  name: "",
  description: "",
  targetAmount: "",
  targetDate: "",
  currency: DEFAULT_CURRENCY,
});

const EMPTY_ERRORS = Object.freeze({});

const CLOSED_SOURCE_KEY = "closed";

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/* =========================================================
   SAFE HELPERS
========================================================= */

const normalizeString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

const getGoalId = (goal) =>
  goal?._id ||
  goal?.id ||
  goal?.goalId ||
  "";

const toInputDate = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const normalizeErrorMessage = (error) => {
  if (!error) {
    return "Unable to update this savings goal.";
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

  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "Unable to update this savings goal.";
};

/* =========================================================
   INITIAL FORM
========================================================= */

const getInitialForm = (goal) => {
  if (!goal || typeof goal !== "object") {
    return {
      ...EMPTY_FORM,
    };
  }

  let normalized = {};

  try {
    normalized =
      normalizeSavingsGoal(goal) || {};
  } catch {
    normalized = {};
  }

  const currency = normalizeString(
    normalized.currency ||
      goal.currency ||
      DEFAULT_CURRENCY
  ).toUpperCase();

  return {
    name: normalizeString(
      normalized.name ||
        normalized.title ||
        goal.name ||
        goal.title ||
        ""
    ),

    description: normalizeString(
      normalized.description ||
        goal.description ||
        ""
    ),

    targetAmount:
      normalized.targetAmount ??
      goal.targetAmount ??
      goal.amount ??
      "",

    targetDate: toInputDate(
      normalized.targetDate ||
        goal.targetDate ||
        goal.deadline
    ),

    currency:
      currency || DEFAULT_CURRENCY,
  };
};

/* =========================================================
   SOURCE KEY
========================================================= */

/*
 * The source key identifies the exact goal snapshot that the
 * local draft belongs to.
 *
 * We intentionally include the editable source values so that
 * if the parent supplies a refreshed goal with the same ID,
 * the modal can derive a fresh draft without setState().
 */

const getSourceKey = (open, goal) => {
  if (!open) {
    return CLOSED_SOURCE_KEY;
  }

  const goalId = getGoalId(goal);

  if (!goalId) {
    return [
      "open",
      "new",
      goal?.name ?? "",
      goal?.description ?? "",
      goal?.targetAmount ?? "",
      goal?.targetDate ?? "",
      goal?.currency ?? "",
    ].join("|");
  }

  return [
    "open",
    String(goalId),
    goal?.name ?? goal?.title ?? "",
    goal?.description ?? "",
    goal?.targetAmount ?? goal?.amount ?? "",
    goal?.targetDate ?? goal?.deadline ?? "",
    goal?.currency ?? "",
    goal?.updatedAt ?? "",
  ].join("|");
};

/* =========================================================
   VALIDATION NORMALIZER
========================================================= */

const normalizeValidationResult = (result) => {
  if (result === true) {
    return {
      valid: true,
      errors: EMPTY_ERRORS,
    };
  }

  if (result === false) {
    return {
      valid: false,
      errors: {
        form: "Please review the savings goal details.",
      },
    };
  }

  if (
    !result ||
    typeof result !== "object"
  ) {
    return {
      valid: true,
      errors: EMPTY_ERRORS,
    };
  }

  const errors =
    result.errors &&
    typeof result.errors === "object"
      ? result.errors
      : EMPTY_ERRORS;

  const errorCount =
    Object.keys(errors).length;

  const valid =
    result.valid ??
    result.isValid ??
    errorCount === 0;

  return {
    valid: Boolean(valid),
    errors,
  };
};

/* =========================================================
   FIELD
========================================================= */

const Field = ({
  label,
  name,
  error,
  required = false,
  children,
}) => (
  <div
    className="space-y-2"
  >
    <label
      htmlFor={name}
      className="block font-medium text-slate-700 text-sm"
    >
      {label}

      {required && (
        <span
          className="ml-1 text-red-500"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>

    {children}

    {error && (
      <p
        role="alert"
        className="flex items-center gap-1.5 text-red-600 text-xs"
      >
        <AlertCircle
          size={13}
          aria-hidden="true"
        />

        <span>{error}</span>
      </p>
    )}
  </div>
);

/* =========================================================
   COMPONENT
========================================================= */

const EditSavingsGoalModal = ({
  goal = null,
  open = false,
  onClose,
  onSubmit,
  saving = false,
  error: externalError = "",
}) => {
  /* =======================================================
     SOURCE
  ======================================================= */

  const sourceKey = useMemo(
    () => getSourceKey(open, goal),
    [open, goal]
  );

  const initialForm = useMemo(
    () => getInitialForm(goal),
    [goal]
  );

  const goalId = useMemo(
    () => getGoalId(goal),
    [goal]
  );

  /* =======================================================
     FORM STATE
     
     IMPORTANT:
     No useEffect is used to copy goal into state.
  ======================================================= */

  const [draftState, setDraftState] =
    useState(() => ({
      sourceKey: CLOSED_SOURCE_KEY,
      values: {
        ...EMPTY_FORM,
      },
    }));

  const form =
    draftState.sourceKey === sourceKey
      ? draftState.values
      : initialForm;

  /* =======================================================
     ERROR STATE
  ======================================================= */

  const [errorState, setErrorState] =
    useState(() => ({
      sourceKey: CLOSED_SOURCE_KEY,
      values: EMPTY_ERRORS,
    }));

  const errors =
    errorState.sourceKey === sourceKey
      ? errorState.values
      : EMPTY_ERRORS;

  /* =======================================================
     SUBMIT ERROR
  ======================================================= */

  const [
    submitErrorState,
    setSubmitErrorState,
  ] = useState(() => ({
    sourceKey: CLOSED_SOURCE_KEY,
    value: "",
  }));

  const submitError =
    submitErrorState.sourceKey === sourceKey
      ? submitErrorState.value
      : "";

  /* =======================================================
     SUCCESS STATE
  ======================================================= */

  const [
    successState,
    setSuccessState,
  ] = useState(() => ({
    sourceKey: CLOSED_SOURCE_KEY,
    value: "",
  }));

  const successMessage =
    successState.sourceKey === sourceKey
      ? successState.value
      : "";

  /* =======================================================
     DISPLAY ERROR
  ======================================================= */

  const displayError = useMemo(
    () =>
      normalizeString(
        submitError ||
          externalError ||
          errors?.form ||
          ""
      ),
    [
      submitError,
      externalError,
      errors,
    ]
  );

  /* =======================================================
     FIELD ERROR
  ======================================================= */

  const getFieldError = useCallback(
    (field) => {
      const value = errors?.[field];

      if (Array.isArray(value)) {
        return normalizeString(
          value[0]
        );
      }

      if (
        typeof value === "string"
      ) {
        return normalizeString(value);
      }

      return "";
    },
    [errors]
  );

  /* =======================================================
     FIELD CHANGE
  ======================================================= */

  const handleChange = useCallback(
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setDraftState((current) => {
        const currentValues =
          current.sourceKey === sourceKey
            ? current.values
            : form;

        let nextValue = value;

        if (name === "currency") {
          nextValue = value
            .toUpperCase()
            .replace(/[^A-Z]/g, "")
            .slice(0, 3);
        }

        return {
          sourceKey,
          values: {
            ...currentValues,
            [name]: nextValue,
          },
        };
      });

      setErrorState((current) => {
        if (
          current.sourceKey !== sourceKey ||
          !current.values?.[name]
        ) {
          return current;
        }

        const nextErrors = {
          ...current.values,
        };

        delete nextErrors[name];

        return {
          sourceKey,
          values: nextErrors,
        };
      });

      setSubmitErrorState({
        sourceKey,
        value: "",
      });

      setSuccessState({
        sourceKey,
        value: "",
      });
    },
    [
      sourceKey,
      form,
    ]
  );

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = useCallback(
    (values) => {
      const payload = {
        ...values,

        name: normalizeString(
          values.name
        ),

        description: normalizeString(
          values.description
        ),

        targetAmount:
          values.targetAmount === "" ||
          values.targetAmount === null ||
          values.targetAmount === undefined
            ? ""
            : Number(
                values.targetAmount
              ),

        targetDate:
          values.targetDate || null,

        currency:
          normalizeString(
            values.currency
          ).toUpperCase(),
      };

      try {
        const result =
          validateSavingsGoal(
            payload
          );

        return normalizeValidationResult(
          result
        );
      } catch (validationError) {
        return {
          valid: false,
          errors: {
            form:
              normalizeErrorMessage(
                validationError
              ),
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

      if (saving) {
        return;
      }

      setSubmitErrorState({
        sourceKey,
        value: "",
      });

      setSuccessState({
        sourceKey,
        value: "",
      });

      if (!goalId) {
        setSubmitErrorState({
          sourceKey,
          value:
            "This savings goal could not be identified.",
        });

        return;
      }

      if (
        typeof onSubmit !==
        "function"
      ) {
        setSubmitErrorState({
          sourceKey,
          value:
            "Savings-goal editing is not currently connected to an update handler.",
        });

        return;
      }

      const validation =
        validateForm(form);

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

      const payload = {
        goalId,

        name: normalizeString(
          form.name
        ),

        description:
          normalizeString(
            form.description
          ),

        targetAmount: Number(
          form.targetAmount
        ),

        targetDate:
          form.targetDate || null,

        currency:
          normalizeString(
            form.currency
          ).toUpperCase(),
      };

      try {
        await onSubmit(
          payload,
          goal
        );

        setSuccessState({
          sourceKey,
          value:
            "Savings goal updated successfully.",
        });
      } catch (submitError) {
        setSubmitErrorState({
          sourceKey,
          value:
            normalizeErrorMessage(
              submitError
            ),
        });
      }
    },
    [
      saving,
      sourceKey,
      goalId,
      onSubmit,
      validateForm,
      form,
      goal,
    ]
  );

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = useCallback(() => {
    if (saving) {
      return;
    }

    setDraftState({
      sourceKey: CLOSED_SOURCE_KEY,
      values: {
        ...EMPTY_FORM,
      },
    });

    setErrorState({
      sourceKey: CLOSED_SOURCE_KEY,
      values: EMPTY_ERRORS,
    });

    setSubmitErrorState({
      sourceKey: CLOSED_SOURCE_KEY,
      value: "",
    });

    setSuccessState({
      sourceKey: CLOSED_SOURCE_KEY,
      value: "",
    });

    if (typeof onClose === "function") {
      onClose();
    }
  }, [
    saving,
    onClose,
  ]);

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropMouseDown =
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

  /* =======================================================
     DIALOG MOUSE DOWN
  ======================================================= */

  const handleDialogMouseDown =
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
      if (
        event.key !== "Escape" ||
        saving
      ) {
        return;
      }

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
    saving,
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
     DATE
  ======================================================= */

  const today = useMemo(
    () =>
      new Date()
        .toISOString()
        .slice(0, 10),
    []
  );

  /* =======================================================
     DERIVED AMOUNT
  ======================================================= */

  const targetAmountNumber =
    Number(form.targetAmount);

  const hasValidDisplayAmount =
    form.targetAmount !== "" &&
    Number.isFinite(
      targetAmountNumber
    ) &&
    targetAmountNumber >= 0;

  const formattedTargetAmount =
    hasValidDisplayAmount
      ? formatSavingsCurrency(
          targetAmountNumber,
          form.currency
        )
      : "";

  /* =======================================================
     RENDER GUARD
  ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="z-[100] fixed inset-0 flex justify-center items-center bg-slate-950/50 backdrop-blur-sm p-4"
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-savings-goal-title"
        className="bg-white shadow-2xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onMouseDown={
          handleDialogMouseDown
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="flex justify-between items-start gap-4 px-5 sm:px-6 py-4 border-slate-200 border-b"
        >
          <div
            className="flex items-center gap-3 min-w-0"
          >
            <div
              className="flex justify-center items-center bg-blue-50 rounded-xl w-10 h-10 text-blue-600 shrink-0"
              aria-hidden="true"
            >
              <Target size={20} />
            </div>

            <div
              className="min-w-0"
            >
              <h2
                id="edit-savings-goal-title"
                className="font-semibold text-slate-900 text-lg truncate"
              >
                Edit Savings Goal
              </h2>

              <p
                className="text-slate-500 text-sm"
              >
                Update your goal details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close edit savings goal"
            className="flex justify-center items-center hover:bg-slate-100 disabled:opacity-50 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/10 w-9 h-9 text-slate-500 hover:text-slate-700 transition disabled:cursor-not-allowed shrink-0"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col max-h-[calc(90vh-73px)]"
        >
          <div
            className="space-y-5 px-5 sm:px-6 py-5 overflow-y-auto"
          >
            {/* ERROR */}

            {displayError && (
              <div
                role="alert"
                className="flex items-start gap-3 bg-red-50 p-3.5 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                /
                >

                <span>
                  {displayError}
                </span>
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-3 bg-emerald-50 p-3.5 border border-emerald-200 rounded-xl text-emerald-700 text-sm"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                /
                >

                <span>
                  {successMessage}
                </span>
              </div>
            )}

            {/* NAME */}

            <Field
              label="Goal name"
              name="name"
              required
              error={getFieldError("name")}
            >
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={saving}
                required
                maxLength={
                  MAX_NAME_LENGTH
                }
                autoComplete="off"
                placeholder="e.g. Emergency Fund"
                aria-invalid={Boolean(
                  getFieldError("name")
                )}
                className="bg-white disabled:bg-slate-50 px-3.5 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
                /
              >
            </Field>

            {/* DESCRIPTION */}

            <Field
              label="Description"
              name="description"
              error={getFieldError(
                "description"
              )}
            >
              <textarea
                id="description"
                name="description"
                value={
                  form.description
                }
                onChange={handleChange}
                disabled={saving}
                maxLength={
                  MAX_DESCRIPTION_LENGTH
                }
                rows={3}
                placeholder="What are you saving for?"
                className="bg-white disabled:bg-slate-50 px-3.5 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition resize-none disabled:cursor-not-allowed"
                /
              >

              <div
                className="text-slate-400 text-xs text-right"
              >
                {form.description.length}
                /{MAX_DESCRIPTION_LENGTH}
              </div>
            </Field>

            {/* TARGET AMOUNT */}

            <Field
              label="Target amount"
              name="targetAmount"
              required
              error={getFieldError(
                "targetAmount"
              )}
            >
              <div
                className="relative"
              >
                <span
                  className="top-1/2 left-3.5 absolute font-medium text-slate-500 text-sm -translate-y-1/2 pointer-events-none"
                >
                  {form.currency ||
                    DEFAULT_CURRENCY}
                </span>

                <input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={
                    form.targetAmount
                  }
                  onChange={handleChange}
                  disabled={saving}
                  required
                  placeholder="0.00"
                  aria-invalid={Boolean(
                    getFieldError(
                      "targetAmount"
                    )
                  )}
                  className="bg-white disabled:bg-slate-50 py-3 pr-3.5 pl-14 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
                  /
                >
              </div>

              {formattedTargetAmount && (
                <p
                  className="text-slate-500 text-xs"
                >
                  Target:{" "}
                  <span
                    className="font-medium"
                  >
                    {formattedTargetAmount}
                  </span>
                </p>
              )}
            </Field>

            {/* CURRENCY */}

            <Field
              label="Currency"
              name="currency"
              required
              error={getFieldError(
                "currency"
              )}
            >
              <input
                id="currency"
                name="currency"
                type="text"
                value={form.currency}
                onChange={handleChange}
                disabled={saving}
                required
                maxLength={3}
                autoComplete="off"
                placeholder={DEFAULT_CURRENCY}
                aria-invalid={Boolean(
                  getFieldError(
                    "currency"
                  )
                )}
                className="bg-white disabled:bg-slate-50 px-3.5 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 text-sm uppercase transition disabled:cursor-not-allowed"
                /
              >
            </Field>

            {/* TARGET DATE */}

            <Field
              label="Target date"
              name="targetDate"
              error={getFieldError(
                "targetDate"
              )}
            >
              <div
                className="relative"
              >
                <CalendarDays
                  size={17}
                  className="top-1/2 left-3.5 absolute text-slate-400 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                /
                >

                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={
                    form.targetDate
                  }
                  onChange={handleChange}
                  disabled={saving}
                  min={today}
                  aria-invalid={Boolean(
                    getFieldError(
                      "targetDate"
                    )
                  )}
                  className="bg-white disabled:bg-slate-50 px-3.5 py-3 pl-11 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 text-sm transition disabled:cursor-not-allowed"
                  /
                >
              </div>

              {form.targetDate && (
                <p
                  className="text-slate-500 text-xs"
                >
                  Target date:{" "}
                  {formatSavingsDate(
                    form.targetDate
                  )}
                </p>
              )}
            </Field>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="flex sm:flex-row flex-col-reverse sm:justify-end gap-3 bg-slate-50/80 px-5 sm:px-6 py-4 border-slate-200 border-t"
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="inline-flex justify-center items-center bg-white hover:bg-slate-100 disabled:opacity-50 px-5 border border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/10 min-h-11 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !goalId ||
                typeof onSubmit !==
                  "function"
              }
              className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm px-5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 min-h-11 font-semibold text-white text-sm transition disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  /
                  >

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                    aria-hidden="true"
                  />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditSavingsGoalModal;