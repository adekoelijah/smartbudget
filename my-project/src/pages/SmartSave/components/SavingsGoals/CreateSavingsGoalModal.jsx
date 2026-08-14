
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
  useState,
} from "react";

import {
  formatSavingsCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  validateSavingsGoal,
} from "../../../../utils/smartSave/savingsValidators";

import {
  DEFAULT_CURRENCY,
} from "../../../../config/smartSaveConfig";


/* =========================================================
   DEFAULT FORM
========================================================= */

const DEFAULT_FORM = Object.freeze({
  name: "",
  targetAmount: "",
  currency: DEFAULT_CURRENCY,
  targetDate: "",
  description: "",
});



const EMPTY_ERRORS = Object.freeze({});
/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const normalizeString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

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


/* =========================================================
   INITIAL FORM BUILDER
========================================================= */

const buildInitialForm = (
  initialValues,
  currency
) => {
  const source =
    initialValues &&
    typeof initialValues === "object"
      ? initialValues
      : {};

  return {
    name: normalizeString(
      source.name ||
        source.title ||
        ""
    ),

    targetAmount:
      source.targetAmount ??
      source.amount ??
      "",

    currency:
      normalizeString(
        source.currency ||
          currency ||
          DEFAULT_CURRENCY
      ).toUpperCase(),

    targetDate:
      source.targetDate
        ? String(
            source.targetDate
          ).slice(0, 10)
        : "",

    description:
      normalizeString(
        source.description
      ),
  };
};


/* =========================================================
   INITIAL SOURCE KEY
========================================================= */

const getSourceKey = (
  open,
  initialValues,
  currency
) => {
  if (!open) {
    return "closed";
  }

  return [
    "open",
    initialValues?.id ??
      initialValues?._id ??
      initialValues?.goalId ??
      "new",
    currency || DEFAULT_CURRENCY,
  ].join(":");
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
     DERIVED INITIAL STATE
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
     DRAFT FORM
     
     IMPORTANT:
     We do NOT synchronize this state
     inside useEffect.
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


  /* =======================================================
     DERIVED FORM
     
     If the source changes, we immediately use
     the new initial values without calling setState.
  ======================================================= */

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

    values: {},
  }));

  const errors =
  errorState.sourceKey === sourceKey
    ? errorState.values
    : EMPTY_ERRORS;

  /* =======================================================
     SUBMISSION STATE
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
     SUBMIT ERROR STATE
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
     FIELD UPDATE
  ======================================================= */

  const updateField = useCallback(
    (field, value) => {
      setDraftState({
        sourceKey,
        values: {
          ...form,
          [field]: value,
        },
      });

      setErrorState((previous) => ({
        sourceKey,
        values:
          previous.sourceKey === sourceKey
            ? (() => {
                if (!previous.values[field]) {
                  return previous.values;
                }

                const next = {
                  ...previous.values,
                };

                delete next[field];

                return next;
              })()
            : {},
      }));

      setSubmitErrorState({
        sourceKey,
        value: "",
      });
    },
    [
      form,
      sourceKey,
    ]
  );


  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validateForm = useCallback(
    (values) => {
      try {
        const result =
          validateSavingsGoal(values);

        if (result === true) {
          return {
            valid: true,
            errors: {},
          };
        }

        if (
          result &&
          typeof result === "object"
        ) {
          if (
            result.valid === true &&
            !result.errors
          ) {
            return {
              valid: true,
              errors: {},
            };
          }

          if (
            result.errors &&
            typeof result.errors ===
              "object"
          ) {
            return {
              valid:
                result.valid !== false &&
                Object.keys(
                  result.errors
                ).length === 0,

              errors: result.errors,
            };
          }

          if (
            result.valid === false
          ) {
            return {
              valid: false,
              errors: {
                form:
                  result.message ||
                  "Please review the goal details.",
              },
            };
          }
        }

        return {
          valid: true,
          errors: {},
        };
      } catch (error) {
        return {
          valid: false,
          errors: {
            form:
              error?.message ||
              "Unable to validate the savings goal.",
          },
        };
      }
    },
    []
  );


  /* =======================================================
     NORMALIZED PAYLOAD
  ======================================================= */

  const normalizedPayload = useMemo(
    () => ({
      name: normalizeString(
        form.name
      ),

      targetAmount:
        normalizeAmount(
          form.targetAmount
        ),

      currency:
        normalizeString(
          form.currency
        ).toUpperCase(),

      targetDate:
        form.targetDate
          ? form.targetDate
          : null,

      description:
        normalizeString(
          form.description
        ) || undefined,
    }),
    [form]
  );


  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setSubmittedState({
        sourceKey,
        value: true,
      });

      setSubmitErrorState({
        sourceKey,
        value: "",
      });

      const validation =
        validateForm(
          normalizedPayload
        );

      if (!validation.valid) {
        setErrorState({
          sourceKey,
          values:
            validation.errors || {},
        });

        return;
      }

      setErrorState({
        sourceKey,
        values: {},
      });

      if (
        typeof onSubmit !==
        "function"
      ) {
        setSubmitErrorState({
          sourceKey,
          value:
            "Goal creation is not connected to a submission handler.",
        });

        return;
      }

      try {
        await onSubmit(
          normalizedPayload
        );
      } catch (error) {
        setSubmitErrorState({
          sourceKey,
          value:
            error?.message ||
            "Unable to create the savings goal. Please try again.",
        });
      }
    },
    [
      loading,
      sourceKey,
      validateForm,
      normalizedPayload,
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

    setDraftState({
      sourceKey: "closed",
      values: DEFAULT_FORM,
    });

    setErrorState({
      sourceKey: "closed",
      values: {},
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
     BACKDROP CLICK
     
     Declared BEFORE JSX.
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
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
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
     ERROR HELPER
  ======================================================= */

  const getFieldError = useCallback(
    (field) => {
      const value =
        errors?.[field];

      if (Array.isArray(value)) {
        return value[0] || "";
      }

      if (
        typeof value === "string"
      ) {
        return value;
      }

      return "";
    },
    [errors]
  );


  /* =======================================================
     DERIVED VALUES
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


  const today = useMemo(
    () =>
      new Date()
        .toISOString()
        .slice(0, 10),
    []
  );


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
        {/* Header */}

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
            disabled={loading}
            aria-label="Close"
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
            <X size={18} />
          </button>
        </div>


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="
            space-y-5 px-5 sm:px-6 py-5
          "
        >
          {/* General error */}

          {(errors.form ||
            submitError) && (
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
                /
              >

              <span>
                {submitError ||
                  errors.form}
              </span>
            </div>
          )}


          {/* Goal name */}

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
              disabled={loading}
              aria-invalid={Boolean(
                getFieldError("name")
              )}
              aria-describedby={
                getFieldError("name")
                  ? "saving-goal-name-error"
                  : undefined
              }
              className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
            />

            {getFieldError("name") && (
              <p
                id="saving-goal-name-error"
                className="
                  mt-1.5
                  text-red-600 text-xs
                "
              >
                {getFieldError("name")}
              </p>
            )}
          </div>


          {/* Amount + currency */}

          <div
            className="
              grid grid-cols-1 sm:grid-cols-[1fr_110px]
              gap-4
            "
          >
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
                  disabled={loading}
                  aria-invalid={Boolean(
                    getFieldError(
                      "targetAmount"
                    )
                  )}
                  className="bg-white disabled:bg-slate-50 py-3 pr-4 pl-10 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
                />
              </div>

              {getFieldError(
                "targetAmount"
              ) && (
                <p
                  className="
                    mt-1.5
                    text-red-600 text-xs
                  "
                >
                  {getFieldError(
                    "targetAmount"
                  )}
                </p>
              )}

              {formattedTargetAmount && (
                <p
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
                      .slice(0, 3)
                  )
                }
                maxLength={3}
                disabled={loading}
                className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full font-medium text-slate-900 text-sm uppercase transition disabled:cursor-not-allowed"
              />
            </div>
          </div>


          {/* Target date */}

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
                /
              >

              <input
                id="saving-goal-date"
                type="date"
                value={form.targetDate}
                onChange={(event) =>
                  updateField(
                    "targetDate",
                    event.target.value
                  )
                }
                disabled={loading}
                min={today}
                className="bg-white disabled:bg-slate-50 px-4 py-3 pl-10 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 text-sm transition disabled:cursor-not-allowed"
              />
            </div>

            {getFieldError(
              "targetDate"
            ) && (
              <p
                className="
                  mt-1.5
                  text-red-600 text-xs
                "
              >
                {getFieldError(
                  "targetDate"
                )}
              </p>
            )}
          </div>


          {/* Description */}

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
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              maxLength={500}
              placeholder="What are you saving this money for?"
              disabled={loading}
              className="bg-white disabled:bg-slate-50 px-4 py-3 border border-slate-300 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full text-slate-900 placeholder:text-slate-400 text-sm leading-5 transition resize-none disabled:cursor-not-allowed"
            />

            <div
              className="
                flex justify-end
                mt-1
              "
            >
              <span
                className="
                  text-slate-400 text-xs
                "
              >
                {
                  form.description.length
                }
                /500
              </span>
            </div>
          </div>


          {/* Confirmation indicator */}

          {submitted &&
            Object.keys(errors)
              .length === 0 &&
            !submitError &&
            !loading && (
              <div
                className="
                  flex items-center
                  px-4 py-3
                  text-emerald-700 text-sm
                  bg-emerald-50
                  rounded-xl
                  gap-2
                "
              >
                <CheckCircle2
                  size={17}
                />

                <span>
                  Goal details are ready.
                </span>
              </div>
            )}


          {/* Actions */}

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
              disabled={loading}
              className="
                px-5 py-3
                font-medium text-slate-700 text-sm
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
              disabled={loading}
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
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
                    /
                  >

                  Creating...
                </>
              ) : (
                <>
                  <Target
                    size={17}
                  />

                  {submitLabel}
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
