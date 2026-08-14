
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

const EMPTY_FORM = {
  name: "",
  description: "",
  targetAmount: "",
  targetDate: "",
  currency: DEFAULT_CURRENCY,
};


/* =========================================================
   SAFE HELPERS
========================================================= */

const toInputDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};


const getGoalId = (goal) => {
  return (
    goal?._id ||
    goal?.id ||
    goal?.goalId ||
    ""
  );
};


const getInitialForm = (goal) => {
  if (!goal) {
    return {
      ...EMPTY_FORM,
    };
  }

  const normalized =
    normalizeSavingsGoal(goal) || {};

  return {
    name:
      normalized.name ||
      normalized.title ||
      goal.name ||
      goal.title ||
      "",

    description:
      normalized.description ||
      goal.description ||
      "",

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
      normalized.currency ||
      goal.currency ||
      DEFAULT_CURRENCY,
  };
};


const normalizeValidationResult = (
  result
) => {
  if (!result) {
    return {
      valid: true,
      errors: {},
    };
  }

  if (typeof result === "boolean") {
    return {
      valid: result,
      errors: {},
    };
  }

  if (
    typeof result !== "object"
  ) {
    return {
      valid: true,
      errors: {},
    };
  }

  const errors =
    result.errors &&
    typeof result.errors === "object"
      ? result.errors
      : {};

  return {
    valid:
      result.valid ??
      result.isValid ??
      Object.keys(errors).length === 0,

    errors,
  };
};


const normalizeErrorMessage = (
  error
) => {
  if (!error) {
    return "Unable to update this savings goal.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to update this savings goal."
  );
};


/* =========================================================
   FIELD COMPONENT
========================================================= */

const Field = ({
  label,
  name,
  error,
  required = false,
  children,
}) => {
  return (
    <div
      className="
        space-y-2
      "
    >
      <label
        htmlFor={name}
        className="
          block
          font-medium text-slate-700 text-sm
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-red-500
            "
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p
          className="
            flex items-center
            text-red-600 text-xs
            gap-1.5
          "
          role="alert"
        >
          <AlertCircle
            size={13}
            aria-hidden="true"
          />

          <span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
};


/* =========================================================
   COMPONENT
========================================================= */

const EditSavingsGoalModal = ({
  goal,
  open = false,
  onClose,
  onSubmit,
  saving = false,
  error: externalError = "",
}) => {
  /* =======================================================
     STATE
  ======================================================= */

  const [form, setForm] =
    useState(() => ({
      ...EMPTY_FORM,
    }));

  const [errors, setErrors] =
    useState({});

  const [submitError, setSubmitError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const goalId = useMemo(
    () => getGoalId(goal),
    [goal]
  );


  const displayError = useMemo(
    () =>
      submitError ||
      externalError ||
      "",
    [
      submitError,
      externalError,
    ]
  );


  /* =======================================================
     FORM INITIALIZATION
     
     IMPORTANT:
     This is the only place where external goal data
     synchronizes into local form state.

     The component does not call setState during render.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextForm =
      getInitialForm(goal);

    setForm(nextForm);
    setErrors({});
    setSubmitError("");
    setSuccessMessage("");
  }, [
    open,
    goal,
  ]);


  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose?.();
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
    saving,
    onClose,
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
     FIELD CHANGE
  ======================================================= */

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
        if (!current?.[name]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[name];

        return next;
      });

      setSubmitError("");
      setSuccessMessage("");
    },
    []
  );


  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = useCallback(
    () => {
      if (saving) {
        return;
      }

      setSubmitError("");
      setSuccessMessage("");
      setErrors({});

      onClose?.();
    },
    [
      saving,
      onClose,
    ]
  );


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
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(
    () => {
      const payload = {
        ...form,

        targetAmount:
          form.targetAmount === ""
            ? ""
            : Number(
                form.targetAmount
              ),

        targetDate:
          form.targetDate ||
          null,
      };

      let validationResult;

      try {
        validationResult =
          validateSavingsGoal(
            payload
          );
      } catch (error) {
        setErrors({
          form:
            normalizeErrorMessage(
              error
            ),
        });

        return false;
      }

      const validation =
        normalizeValidationResult(
          validationResult
        );

      if (!validation.valid) {
        setErrors(
          validation.errors || {}
        );

        return false;
      }

      setErrors({});

      return true;
    },
    [form]
  );


  const handleDialogMouseDown = (event) => {
  event.stopPropagation();
};


  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (saving) {
          return;
        }

        setSubmitError("");
        setSuccessMessage("");

        if (!goalId) {
          setSubmitError(
            "This savings goal could not be identified."
          );

          return;
        }

        if (
          typeof onSubmit !==
          "function"
        ) {
          setSubmitError(
            "Savings-goal editing is not currently connected to a backend update endpoint."
          );

          return;
        }

        if (!validateForm()) {
          return;
        }

        const payload = {
          goalId,

          name:
            form.name.trim(),

          description:
            form.description.trim(),

          targetAmount:
            Number(
              form.targetAmount
            ),

          targetDate:
            form.targetDate ||
            null,

          currency:
            form.currency
              .trim()
              .toUpperCase(),
        };

        try {
          await onSubmit(
            payload,
            goal
          );

          setSuccessMessage(
            "Savings goal updated successfully."
          );
        } catch (error) {
          setSubmitError(
            normalizeErrorMessage(
              error
            )
          );
        }
      },
      [
        saving,
        goalId,
        onSubmit,
        validateForm,
        form,
        goal,
      ]
    );


  /* =======================================================
     RENDER GUARD
     
     IMPORTANT:
     All hooks are above this point.
     No hook is called conditionally.
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
        z-50 fixed inset-0 flex justify-center items-center
        p-4
        bg-slate-950/50
        backdrop-blur-sm
      "
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
    >
      {/* =================================================
          DIALOG
      ================================================= */}

      <div
        role="dialog"
  aria-modal="true"
  aria-labelledby="edit-savings-goal-title"
        className="
          overflow-hidden
          w-full max-w-lg max-h-[90vh]
          bg-white
          rounded-2xl
          shadow-2xl
        "
        onMouseDown={handleDialogMouseDown}
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
            >
              <Target
                size={20}
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="edit-savings-goal-title"
                className="
                  font-semibold text-slate-900 text-lg truncate
                "
              >
                Edit Savings Goal
              </h2>

              <p
                className="
                  text-slate-500 text-sm
                "
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
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X
              size={19}
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
            flex flex-col
            max-h-[calc(90vh-73px)]
          "
        >
          {/* =================================================
              SCROLLABLE BODY
          ================================================= */}

          <div
            className="
              overflow-y-auto
              space-y-5 px-5 sm:px-6 py-5
            "
          >
            {/* =================================================
                ERROR
            ================================================= */}

            {displayError && (
              <div
                className="
                  flex items-start
                  p-3.5
                  text-red-700 text-sm
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

                <span>
                  {displayError}
                </span>
              </div>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
              <div
                className="
                  flex items-start
                  p-3.5
                  text-emerald-700 text-sm
                  bg-emerald-50
                  border border-emerald-200 rounded-xl
                  gap-3
                "
                role="status"
              >
                <CheckCircle2
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                  aria-hidden="true"
                /
                >

                <span>
                  {successMessage}
                </span>
              </div>
            )}


            {/* =================================================
                NAME
            ================================================= */}

            <Field
              label="Goal name"
              name="name"
              required
              error={
                errors?.name
              }
            >
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={
                  handleChange
                }
                disabled={saving}
                maxLength={100}
                autoComplete="off"
                placeholder="e.g. Emergency Fund"
                aria-invalid={Boolean(
                  errors?.name
                )}
                className="
                  w-full
                  px-3.5 py-3
                  text-slate-900 placeholder:text-slate-400 text-sm
                  bg-white disabled:bg-slate-50
                  border border-slate-300 focus:border-blue-500 rounded-xl
                  outline-none focus:ring-4 focus:ring-blue-500/10
                  transition
                  disabled:cursor-not-allowed
                "
                /
              >
            </Field>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <Field
              label="Description"
              name="description"
              error={
                errors?.description
              }
            >
              <textarea
                id="description"
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                disabled={saving}
                maxLength={500}
                rows={3}
                placeholder="What are you saving for?"
                className="
                  w-full
                  px-3.5 py-3
                  text-slate-900 placeholder:text-slate-400 text-sm
                  bg-white disabled:bg-slate-50
                  border border-slate-300 focus:border-blue-500 rounded-xl
                  outline-none focus:ring-4 focus:ring-blue-500/10
                  transition
                  resize-none disabled:cursor-not-allowed
                "
                /
              >

              <div
                className="
                  text-slate-400 text-xs text-right
                "
              >
                {
                  form.description
                    .length
                }
                /500
              </div>
            </Field>


            {/* =================================================
                TARGET AMOUNT
            ================================================= */}

            <Field
              label="Target amount"
              name="targetAmount"
              required
              error={
                errors?.targetAmount
              }
            >
              <div
                className="
                  relative
                "
              >
                <span
                  className="
                    top-1/2 left-3.5 absolute
                    font-medium text-slate-500 text-sm
                    pointer-events-none
                    -translate-y-1/2
                  "
                >
                  {form.currency}
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
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  placeholder="0.00"
                  aria-invalid={Boolean(
                    errors?.targetAmount
                  )}
                  className="
                    w-full
                    py-3 pr-3.5 pl-14
                    text-slate-900 placeholder:text-slate-400 text-sm
                    bg-white disabled:bg-slate-50
                    border border-slate-300 focus:border-blue-500 rounded-xl
                    outline-none focus:ring-4 focus:ring-blue-500/10
                    transition
                    disabled:cursor-not-allowed
                  "
                  /
                >
              </div>

              {form.targetAmount !==
                "" && (
                <p
                  className="
                    text-slate-500 text-xs
                  "
                >
                  Target:{" "}
                  {formatSavingsCurrency(
                    Number(
                      form.targetAmount
                    ),
                    form.currency
                  )}
                </p>
              )}
            </Field>


            {/* =================================================
                TARGET DATE
            ================================================= */}

            <Field
              label="Target date"
              name="targetDate"
              error={
                errors?.targetDate
              }
            >
              <div
                className="
                  relative
                "
              >
                <CalendarDays
                  size={17}
                  className="
                    top-1/2 left-3.5 absolute
                    text-slate-400
                    pointer-events-none
                    -translate-y-1/2
                  "
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
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  min={
                    new Date()
                      .toISOString()
                      .slice(0, 10)
                  }
                  aria-invalid={Boolean(
                    errors?.targetDate
                  )}
                  className="
                    w-full
                    px-3.5 py-3 pl-11
                    text-slate-900 text-sm
                    bg-white disabled:bg-slate-50
                    border border-slate-300 focus:border-blue-500 rounded-xl
                    outline-none focus:ring-4 focus:ring-blue-500/10
                    transition
                    disabled:cursor-not-allowed
                  "
                  /
                >
              </div>

              {form.targetDate && (
                <p
                  className="
                    text-slate-500 text-xs
                  "
                >
                  Target date:{" "}
                  {formatSavingsDate(
                    form.targetDate
                  )}
                </p>
              )}
            </Field>


            {/* =================================================
                BACKEND NOTICE
            ================================================= */}

            {!onSubmit && (
              <div
                className="
                  p-3.5
                  text-amber-800 text-xs leading-5
                  bg-amber-50
                  border border-amber-200 rounded-xl
                "
              >
                Goal editing is currently
                awaiting a backend mutation
                endpoint. The existing
                savings-goal API only exposes
                read operations.
              </div>
            )}
          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              px-5 sm:px-6 py-4
              bg-slate-50/80
              border-slate-200 border-t
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="
                inline-flex justify-center items-center
                min-h-11
                px-5
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-100
                border border-slate-300 rounded-xl
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
              "
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
              className="
                inline-flex justify-center items-center
                min-h-11
                px-5
                font-semibold text-white text-sm
                bg-blue-600 hover:bg-blue-700
                rounded-xl focus:outline-none
                focus:ring-4 focus:ring-blue-500/20
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
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
      </div>
    </div>
  );
};


export default EditSavingsGoalModal;
