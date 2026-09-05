import {
  useCallback,
  useMemo,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const toInputValue = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value);
};

const getPlanId = (plan) => {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  return (
    plan._id ??
    plan.id ??
    plan.planId ??
    null
  );
};

const getPlanField = (
  plan,
  ...keys
) => {
  for (const key of keys) {
    if (
      plan?.[key] !== undefined &&
      plan?.[key] !== null
    ) {
      return plan[key];
    }
  }

  return "";
};

/* -------------------------------------------------------------------------- */
/* Default form                                                               */
/* -------------------------------------------------------------------------- */

const createDefaultForm = (
  currency = "NGN"
) => ({
  name: "",
  targetAmount: "",
  currency:
    toInputValue(currency) || "NGN",
  targetDate: "",
  description: "",
});

/* -------------------------------------------------------------------------- */
/* Normalize plan → form                                                      */
/* -------------------------------------------------------------------------- */

const normalizePlanToForm = (
  plan,
  fallbackCurrency = "NGN"
) => {
  if (!isObject(plan)) {
    return createDefaultForm(
      fallbackCurrency
    );
  }

  return {
    name: toInputValue(
      getPlanField(plan, "name", "title")
    ),

    targetAmount: toInputValue(
      getPlanField(
        plan,
        "targetAmount",
        "amount",
        "target"
      )
    ),

    currency:
      toInputValue(
        getPlanField(
          plan,
          "currency"
        )
      ) ||
      toInputValue(
        fallbackCurrency
      ) ||
      "NGN",

    targetDate: toInputValue(
      getPlanField(
        plan,
        "targetDate",
        "deadline",
        "endDate"
      )
    ).slice(0, 10),

    description: toInputValue(
      getPlanField(
        plan,
        "description"
      )
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* Payload normalization                                                      */
/* -------------------------------------------------------------------------- */

const normalizeAmount = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const numericValue = Number(
    String(value).replace(/,/g, "")
  );

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue;
};

const buildPayload = (
  form
) => ({
  name: form.name.trim(),

  targetAmount:
    normalizeAmount(
      form.targetAmount
    ),

  currency:
    form.currency.trim().toUpperCase(),

  targetDate:
    form.targetDate,

  description:
    form.description.trim(),
});

/* -------------------------------------------------------------------------- */
/* Client-side validation                                                     */
/* -------------------------------------------------------------------------- */

const validateForm = (
  form
) => {
  const errors = {};

  const name =
    form.name?.trim() ?? "";

  const targetAmount =
    normalizeAmount(
      form.targetAmount
    );

  const currency =
    form.currency
      ?.trim()
      .toUpperCase() ?? "";

  const targetDate =
    form.targetDate ?? "";

  if (!name) {
    errors.name =
      "Saving plan name is required.";
  } else if (name.length < 2) {
    errors.name =
      "Saving plan name must be at least 2 characters.";
  } else if (name.length > 100) {
    errors.name =
      "Saving plan name cannot exceed 100 characters.";
  }

  if (
    targetAmount === "" ||
    targetAmount === null ||
    targetAmount === undefined
  ) {
    errors.targetAmount =
      "Target amount is required.";
  } else if (
    typeof targetAmount !== "number" ||
    !Number.isFinite(targetAmount)
  ) {
    errors.targetAmount =
      "Enter a valid target amount.";
  } else if (
    targetAmount <= 0
  ) {
    errors.targetAmount =
      "Target amount must be greater than zero.";
  }

  if (!currency) {
    errors.currency =
      "Currency is required.";
  }

  if (!targetDate) {
    errors.targetDate =
      "Target date is required.";
  } else {
    const parsedDate =
      new Date(targetDate);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      errors.targetDate =
        "Enter a valid target date.";
    }
  }

  if (
    form.description &&
    form.description.trim()
      .length > 500
  ) {
    errors.description =
      "Description cannot exceed 500 characters.";
  }

  return {
    valid:
      Object.keys(errors)
        .length === 0,

    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

const useSavingPlanForm = ({
  plan = null,
  currency = "NGN",
  initialValues = null,
  mode = "create",
  onSubmit = null,
  onSuccess = null,
  onError = null,
} = {}) => {
  /* ------------------------------------------------------------------------ */
  /* Initial values                                                            */
  /* ------------------------------------------------------------------------ */

  const initialForm =
    useMemo(() => {
      if (
        isObject(initialValues)
      ) {
        return {
          ...createDefaultForm(
            currency
          ),
          ...initialValues,
        };
      }

      if (
        mode === "edit" &&
        plan
      ) {
        return normalizePlanToForm(
          plan,
          currency
        );
      }

      return createDefaultForm(
        currency
      );
    }, [
      currency,
      initialValues,
      mode,
      plan,
    ]);

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [
    formData,
    setFormData,
  ] = useState(initialForm);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    touched,
    setTouched,
  ] = useState({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState(null);

  const [
    submitSuccess,
    setSubmitSuccess,
  ] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Change field                                                             */
  /* ------------------------------------------------------------------------ */

  const setFieldValue =
    useCallback(
      (field, value) => {
        if (!field) {
          return;
        }

        setFormData(
          (current) => ({
            ...current,
            [field]: value,
          })
        );

        setErrors(
          (current) => {
            if (
              !current[field]
            ) {
              return current;
            }

            const next = {
              ...current,
            };

            delete next[field];

            return next;
          }
        );

        setSubmitError(null);
        setSubmitSuccess(false);
      },
      []
    );

  /* ------------------------------------------------------------------------ */
  /* Bulk form update                                                         */
  /* ------------------------------------------------------------------------ */

  const setFormValues =
    useCallback(
      (values) => {
        if (
          !isObject(values)
        ) {
          return;
        }

        setFormData(
          (current) => ({
            ...current,
            ...values,
          })
        );

        setSubmitError(null);
        setSubmitSuccess(false);
      },
      []
    );

  /* ------------------------------------------------------------------------ */
  /* Input change handler                                                     */
  /* ------------------------------------------------------------------------ */

  const handleChange =
    useCallback(
      (eventOrField, value) => {
        if (
          typeof eventOrField ===
          "string"
        ) {
          setFieldValue(
            eventOrField,
            value
          );

          return;
        }

        const event =
          eventOrField;

        if (
          !event?.target
        ) {
          return;
        }

        const {
          name,
          value:
            inputValue,
          type,
          checked,
        } = event.target;

        if (!name) {
          return;
        }

        setFieldValue(
          name,
          type === "checkbox"
            ? checked
            : inputValue
        );
      },
      [setFieldValue]
    );

  /* ------------------------------------------------------------------------ */
  /* Blur handler                                                             */
  /* ------------------------------------------------------------------------ */

  const handleBlur =
    useCallback(
      (eventOrField) => {
        const field =
          typeof eventOrField ===
          "string"
            ? eventOrField
            : eventOrField?.target
                ?.name;

        if (!field) {
          return;
        }

        setTouched(
          (current) => ({
            ...current,
            [field]: true,
          })
        );

        const validation =
          validateForm(
            formData
          );

        setErrors(
          (current) => {
            const next = {
              ...current,
            };

            if (
              validation.errors[
                field
              ]
            ) {
              next[field] =
                validation.errors[
                  field
                ];
            } else {
              delete next[field];
            }

            return next;
          }
        );
      },
      [formData]
    );

  /* ------------------------------------------------------------------------ */
  /* Validate                                                                 */
  /* ------------------------------------------------------------------------ */

  const validate =
    useCallback(() => {
      const result =
        validateForm(
          formData
        );

      setErrors(
        result.errors
      );

      setTouched(
        (current) => {
          const next = {
            ...current,
          };

          Object.keys(
            formData
          ).forEach(
            (field) => {
              next[field] = true;
            }
          );

          return next;
        }
      );

      return result;
    }, [formData]);

  /* ------------------------------------------------------------------------ */
  /* Reset                                                                    */
  /* ------------------------------------------------------------------------ */

  const reset =
    useCallback(
      (
        values = null
      ) => {
        const nextForm =
          isObject(values)
            ? {
                ...createDefaultForm(
                  currency
                ),
                ...values,
              }
            : mode === "edit" &&
                plan
              ? normalizePlanToForm(
                  plan,
                  currency
                )
              : createDefaultForm(
                  currency
                );

        setFormData(
          nextForm
        );

        setErrors({});
        setTouched({});
        setSubmitError(null);
        setSubmitSuccess(false);
        setSubmitting(false);
      },
      [
        currency,
        mode,
        plan,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Reset to empty form                                                      */
  /* ------------------------------------------------------------------------ */

  const resetToDefaults =
    useCallback(() => {
      const nextForm =
        createDefaultForm(
          currency
        );

      setFormData(
        nextForm
      );

      setErrors({});
      setTouched({});
      setSubmitError(null);
      setSubmitSuccess(false);
      setSubmitting(false);
    }, [currency]);

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit =
    useCallback(
      async (
        event = null
      ) => {
        event?.preventDefault?.();

        if (submitting) {
          return {
            success: false,
            reason:
              "submission_in_progress",
          };
        }

        const validation =
          validate();

        if (!validation.valid) {
          return {
            success: false,
            reason:
              "validation_failed",
            errors:
              validation.errors,
          };
        }

        const payload =
          buildPayload(
            formData
          );

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
          if (
            typeof onSubmit !==
            "function"
          ) {
            throw new Error(
              "Saving plan form submission handler is not configured."
            );
          }

          const result =
            await onSubmit(
              payload,
              {
                mode,
                planId:
                  getPlanId(plan),
                formData,
              }
            );

          setSubmitSuccess(
            true
          );

          if (
            typeof onSuccess ===
            "function"
          ) {
            await onSuccess(
              result
            );
          }

          return {
            success: true,
            payload,
            result,
          };
        } catch (submitException) {
          const message =
            submitException
              ?.message ||
            "Unable to save the saving plan.";

          setSubmitError(
            message
          );

          if (
            typeof onError ===
            "function"
          ) {
            await onError(
              submitException
            );
          }

          return {
            success: false,
            error:
              submitException,
          };
        } finally {
          setSubmitting(
            false
          );
        }
      },
      [
        formData,
        mode,
        onError,
        onSubmit,
        onSuccess,
        plan,
        submitting,
        validate,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* Field helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const getFieldError =
    useCallback(
      (field) => {
        if (!field) {
          return "";
        }

        return errors[field] || "";
      },
      [errors]
    );

  const isFieldTouched =
    useCallback(
      (field) => {
        if (!field) {
          return false;
        }

        return Boolean(
          touched[field]
        );
      },
      [touched]
    );

  const hasFieldError =
    useCallback(
      (field) =>
        Boolean(
          errors[field]
        ),
      [errors]
    );

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const isDirty =
    useMemo(() => {
      const current =
        JSON.stringify(
          formData
        );

      const initial =
        JSON.stringify(
          initialForm
        );

      return current !== initial;
    }, [
      formData,
      initialForm,
    ]);

  const hasErrors =
    Object.keys(errors)
      .length > 0;

  const canSubmit =
    !submitting &&
    !hasErrors;

  const planId =
    getPlanId(plan);

  /* ------------------------------------------------------------------------ */
  /* Return                                                                   */
  /* ------------------------------------------------------------------------ */

  return useMemo(
    () => ({
      /* Form state */
      formData,
      errors,
      touched,

      /* Submission state */
      submitting,
      submitError,
      submitSuccess,

      /* Mode */
      mode,
      planId,

      /* Derived state */
      isDirty,
      hasErrors,
      canSubmit,

      /* Form actions */
      setFieldValue,
      setFormValues,
      handleChange,
      handleBlur,

      /* Validation */
      validate,
      getFieldError,
      isFieldTouched,
      hasFieldError,

      /* Reset */
      reset,
      resetToDefaults,

      /* Submission */
      handleSubmit,

      /* Payload */
      buildPayload: () =>
        buildPayload(formData),
    }),
    [
      formData,
      errors,
      touched,
      submitting,
      submitError,
      submitSuccess,
      mode,
      planId,
      isDirty,
      hasErrors,
      canSubmit,
      setFieldValue,
      setFormValues,
      handleChange,
      handleBlur,
      validate,
      getFieldError,
      isFieldTouched,
      hasFieldError,
      reset,
      resetToDefaults,
      handleSubmit,
    ]
  );
};

export default useSavingPlanForm;