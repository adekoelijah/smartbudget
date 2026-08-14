/**
 * savingsValidators.js
 *
 * Production-ready client-side validators for SmartSave.
 *
 * Responsibilities:
 * - Validate IDs
 * - Validate required fields
 * - Validate monetary values
 * - Validate dates
 * - Validate pagination/query values
 * - Validate saving-account inputs
 * - Validate saving-goal inputs
 * - Validate saving-plan inputs
 * - Validate schedule inputs
 * - Validate challenge inputs
 * - Validate contribution inputs
 * - Validate lifecycle action payloads
 *
 * Important:
 * These validators are NOT a replacement for backend validation.
 * The backend remains the authoritative source of truth.
 *
 * This module:
 * - Does not make API requests
 * - Does not mutate data
 * - Does not contain React state
 * - Does not contain backend business logic
 */

/* =========================================================
   CONSTANTS
========================================================= */

export const VALIDATION_MESSAGES = Object.freeze({
  REQUIRED: "This field is required.",
  INVALID_ID: "A valid ID is required.",
  INVALID_AMOUNT: "Amount must be a valid positive number.",
  INVALID_NON_NEGATIVE_AMOUNT:
    "Amount must be a valid non-negative number.",
  INVALID_CURRENCY:
    "Currency must be a valid 3-letter currency code.",
  INVALID_DATE: "Please provide a valid date.",
  INVALID_DATE_RANGE:
    "End date must be on or after the start date.",
  INVALID_PAGE:
    "Page must be a positive integer.",
  INVALID_LIMIT:
    "Limit must be a positive integer.",
  INVALID_STRING:
    "This value must be a valid string.",
  INVALID_BOOLEAN:
    "This value must be a boolean.",
  INVALID_OBJECT:
    "A valid object is required.",
  INVALID_ARRAY:
    "A valid array is required.",
  INVALID_PERCENTAGE:
    "Percentage must be between 0 and 100.",
  INVALID_FREQUENCY:
    "A valid frequency is required.",
});

/* =========================================================
   BASIC TYPE VALIDATORS
========================================================= */

/**
 * Determine whether a value is a non-empty string.
 */
export const isNonEmptyString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

/**
 * Determine whether a value is a valid object.
 */
export const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

/**
 * Determine whether a value is an array.
 */
export const isArray = (value) =>
  Array.isArray(value);

/**
 * Determine whether a value is a boolean.
 */
export const isBoolean = (value) =>
  typeof value === "boolean";

/**
 * Determine whether a value is a finite number.
 */
export const isFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number);
};

/* =========================================================
   ID VALIDATION
========================================================= */

/**
 * Validate a MongoDB ObjectId.
 *
 * Supports:
 * - 24-character hexadecimal ObjectIds
 * - non-empty strings for environments where IDs may
 *   eventually use UUIDs.
 *
 * Default behavior is strict MongoDB ObjectId validation.
 */
export const isValidObjectId = (value) =>
  typeof value === "string" &&
  /^[a-fA-F0-9]{24}$/.test(value.trim());

/**
 * Validate an application resource ID.
 */
export const isValidResourceId = (
  value,
  {
    allowUuid = false,
    allowNonEmptyString = false,
  } = {}
) => {
  if (isValidObjectId(value)) {
    return true;
  }

  if (
    allowUuid &&
    typeof value === "string" &&
    /^[0-9a-fA-F-]{36}$/.test(value.trim())
  ) {
    return true;
  }

  if (
    allowNonEmptyString &&
    isNonEmptyString(value)
  ) {
    return true;
  }

  return false;
};


export const validateSavingsGoal = (goal = {}) => {
  const errors = {};

  const name =
    typeof goal.name === "string"
      ? goal.name.trim()
      : "";

  const targetAmount =
    Number(goal.targetAmount);

  if (!name) {
    errors.name =
      "Savings goal name is required.";
  }

  if (
    !Number.isFinite(targetAmount) ||
    targetAmount <= 0
  ) {
    errors.targetAmount =
      "Target amount must be greater than zero.";
  }

  if (
    goal.targetDate &&
    Number.isNaN(
      new Date(goal.targetDate).getTime()
    )
  ) {
    errors.targetDate =
      "Please provide a valid target date.";
  }

  return {
    isValid:
      Object.keys(errors).length === 0,
    errors,
  };
};



/**
 * Require a valid resource ID.
 */
export const validateResourceId = (
  value,
  field = "id"
) => {
  if (!isValidResourceId(value)) {
    return {
      valid: false,
      field,
      message: VALIDATION_MESSAGES.INVALID_ID,
    };
  }

  return {
    valid: true,
    field,
    message: null,
  };
};

/* =========================================================
   REQUIRED FIELD VALIDATION
========================================================= */

/**
 * Validate a required value.
 */
export const validateRequired = (
  value,
  field = "field"
) => {
  const valid =
    typeof value === "number"
      ? Number.isFinite(value)
      : typeof value === "boolean"
        ? true
        : isNonEmptyString(value) ||
          isPlainObject(value) ||
          isArray(value);

  return {
    valid,
    field,
    message: valid
      ? null
      : VALIDATION_MESSAGES.REQUIRED,
  };
};

/**
 * Validate multiple required fields.
 */
export const validateRequiredFields = (
  payload,
  fields = []
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  fields.forEach((field) => {
    const result = validateRequired(
      payload[field],
      field
    );

    if (!result.valid) {
      errors[field] = result.message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   MONEY VALIDATION
========================================================= */

/**
 * Validate a monetary amount.
 *
 * This intentionally does not impose arbitrary maximums
 * because financial limits belong to the backend.
 */
export const isValidAmount = (value) => {
  if (!isFiniteNumber(value)) {
    return false;
  }

  return Number(value) > 0;
};

/**
 * Validate a non-negative monetary amount.
 */
export const isValidNonNegativeAmount = (
  value
) => {
  if (!isFiniteNumber(value)) {
    return false;
  }

  return Number(value) >= 0;
};

/**
 * Validate an amount with optional decimal precision.
 */
export const validateAmount = (
  value,
  {
    required = true,
    allowZero = false,
    maxDecimals = 2,
    field = "amount",
  } = {}
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (!required) {
      return {
        valid: true,
        field,
        message: null,
      };
    }

    return {
      valid: false,
      field,
      message: VALIDATION_MESSAGES.REQUIRED,
    };
  }

  if (!isFiniteNumber(value)) {
    return {
      valid: false,
      field,
      message: VALIDATION_MESSAGES.INVALID_AMOUNT,
    };
  }

  const amount = Number(value);

  if (
    allowZero
      ? amount < 0
      : amount <= 0
  ) {
    return {
      valid: false,
      field,
      message: allowZero
        ? VALIDATION_MESSAGES
            .INVALID_NON_NEGATIVE_AMOUNT
        : VALIDATION_MESSAGES.INVALID_AMOUNT,
    };
  }

  if (maxDecimals !== null) {
    const decimalPart =
      String(value)
        .split(".")[1] || "";

    if (decimalPart.length > maxDecimals) {
      return {
        valid: false,
        field,
        message:
          `Amount cannot have more than ${maxDecimals} decimal places.`,
      };
    }
  }

  return {
    valid: true,
    field,
    message: null,
  };
};

/* =========================================================
   CURRENCY VALIDATION
========================================================= */

/**
 * Validate ISO-style 3-letter currency code.
 */
export const isValidCurrency = (value) =>
  typeof value === "string" &&
  /^[A-Za-z]{3}$/.test(value.trim());

export const validateCurrency = (
  value,
  field = "currency"
) => ({
  valid: isValidCurrency(value),
  field,
  message: isValidCurrency(value)
    ? null
    : VALIDATION_MESSAGES.INVALID_CURRENCY,
});

/* =========================================================
   DATE VALIDATION
========================================================= */

/**
 * Determine whether a value represents a valid date.
 */
export const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

/**
 * Validate a date field.
 */
export const validateDate = (
  value,
  {
    required = true,
    field = "date",
  } = {}
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return {
      valid: !required,
      field,
      message: required
        ? VALIDATION_MESSAGES.REQUIRED
        : null,
    };
  }

  return {
    valid: isValidDate(value),
    field,
    message: isValidDate(value)
      ? null
      : VALIDATION_MESSAGES.INVALID_DATE,
  };
};

/**
 * Validate chronological date range.
 */
export const validateDateRange = (
  startDate,
  endDate
) => {
  if (
    !isValidDate(startDate) ||
    !isValidDate(endDate)
  ) {
    return {
      valid: false,
      message:
        VALIDATION_MESSAGES.INVALID_DATE,
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return {
    valid: end >= start,
    message:
      end >= start
        ? null
        : VALIDATION_MESSAGES.INVALID_DATE_RANGE,
  };
};

/* =========================================================
   PERCENTAGE VALIDATION
========================================================= */

export const isValidPercentage = (value) => {
  if (!isFiniteNumber(value)) {
    return false;
  }

  const percentage = Number(value);

  return (
    percentage >= 0 &&
    percentage <= 100
  );
};

export const validatePercentage = (
  value,
  field = "percentage"
) => ({
  valid: isValidPercentage(value),
  field,
  message: isValidPercentage(value)
    ? null
    : VALIDATION_MESSAGES.INVALID_PERCENTAGE,
});

/* =========================================================
   PAGINATION VALIDATION
========================================================= */

export const isValidPage = (value) => {
  const number = Number(value);

  return (
    Number.isInteger(number) &&
    number >= 1
  );
};

export const isValidLimit = (value) => {
  const number = Number(value);

  return (
    Number.isInteger(number) &&
    number >= 1
  );
};

export const validatePagination = ({
  page = 1,
  limit = 20,
} = {}) => {
  const errors = {};

  if (!isValidPage(page)) {
    errors.page =
      VALIDATION_MESSAGES.INVALID_PAGE;
  }

  if (!isValidLimit(limit)) {
    errors.limit =
      VALIDATION_MESSAGES.INVALID_LIMIT;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   ACCOUNT VALIDATION
========================================================= */

/**
 * Validate saving-account creation/update input.
 *
 * Only validates structural/client-safe fields.
 */
export const validateSavingAccount = (
  payload = {},
  {
    requireName = false,
  } = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    requireName &&
    !isNonEmptyString(payload.name)
  ) {
    errors.name =
      VALIDATION_MESSAGES.REQUIRED;
  }

  if (
    payload.currency !== undefined &&
    !isValidCurrency(payload.currency)
  ) {
    errors.currency =
      VALIDATION_MESSAGES.INVALID_CURRENCY;
  }

  if (
    payload.initialBalance !== undefined
  ) {
    const result = validateAmount(
      payload.initialBalance,
      {
        allowZero: true,
        field: "initialBalance",
      }
    );

    if (!result.valid) {
      errors.initialBalance =
        result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   GOAL VALIDATION
========================================================= */

export const validateSavingGoal = (
  payload = {},
  {
    requireName = false,
    requireTargetAmount = false,
  } = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    requireName &&
    !isNonEmptyString(payload.name)
  ) {
    errors.name =
      VALIDATION_MESSAGES.REQUIRED;
  }

  if (
    requireTargetAmount ||
    payload.targetAmount !== undefined
  ) {
    const result = validateAmount(
      payload.targetAmount,
      {
        required: requireTargetAmount,
        field: "targetAmount",
      }
    );

    if (!result.valid) {
      errors.targetAmount =
        result.message;
    }
  }

  if (
    payload.startDate !== undefined
  ) {
    const result = validateDate(
      payload.startDate,
      {
        required: false,
        field: "startDate",
      }
    );

    if (!result.valid) {
      errors.startDate = result.message;
    }
  }

  if (
    payload.targetDate !== undefined
  ) {
    const result = validateDate(
      payload.targetDate,
      {
        required: false,
        field: "targetDate",
      }
    );

    if (!result.valid) {
      errors.targetDate = result.message;
    }
  }

  if (
    payload.startDate &&
    payload.targetDate
  ) {
    const result = validateDateRange(
      payload.startDate,
      payload.targetDate
    );

    if (!result.valid) {
      errors.targetDate =
        result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   PLAN VALIDATION
========================================================= */

export const validateSavingPlan = (
  payload = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    payload.targetAmount !== undefined
  ) {
    const result = validateAmount(
      payload.targetAmount,
      {
        required: false,
        field: "targetAmount",
      }
    );

    if (!result.valid) {
      errors.targetAmount =
        result.message;
    }
  }

  if (
    payload.contributionAmount !== undefined
  ) {
    const result = validateAmount(
      payload.contributionAmount,
      {
        required: false,
        field: "contributionAmount",
      }
    );

    if (!result.valid) {
      errors.contributionAmount =
        result.message;
    }
  }

  if (
    payload.startDate !== undefined
  ) {
    const result = validateDate(
      payload.startDate,
      {
        required: false,
        field: "startDate",
      }
    );

    if (!result.valid) {
      errors.startDate =
        result.message;
    }
  }

  if (
    payload.endDate !== undefined
  ) {
    const result = validateDate(
      payload.endDate,
      {
        required: false,
        field: "endDate",
      }
    );

    if (!result.valid) {
      errors.endDate =
        result.message;
    }
  }

  if (
    payload.startDate &&
    payload.endDate
  ) {
    const result = validateDateRange(
      payload.startDate,
      payload.endDate
    );

    if (!result.valid) {
      errors.endDate =
        result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   SCHEDULE VALIDATION
========================================================= */

export const validateSavingSchedule = (
  payload = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    payload.amount !== undefined
  ) {
    const result = validateAmount(
      payload.amount,
      {
        required: false,
        field: "amount",
      }
    );

    if (!result.valid) {
      errors.amount = result.message;
    }
  }

  if (
    payload.nextExecutionAt !== undefined
  ) {
    const result = validateDate(
      payload.nextExecutionAt,
      {
        required: false,
        field: "nextExecutionAt",
      }
    );

    if (!result.valid) {
      errors.nextExecutionAt =
        result.message;
    }
  }

  if (
    payload.isAutomatic !== undefined &&
    !isBoolean(payload.isAutomatic)
  ) {
    errors.isAutomatic =
      VALIDATION_MESSAGES.INVALID_BOOLEAN;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   EXECUTION VALIDATION
========================================================= */

export const validateSavingExecution = (
  payload = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    payload.scheduleId !== undefined &&
    !isValidResourceId(payload.scheduleId)
  ) {
    errors.scheduleId =
      VALIDATION_MESSAGES.INVALID_ID;
  }

  if (
    payload.executionAt !== undefined
  ) {
    const result = validateDate(
      payload.executionAt,
      {
        required: false,
        field: "executionAt",
      }
    );

    if (!result.valid) {
      errors.executionAt =
        result.message;
    }
  }

  if (
    payload.baseAmount !== undefined
  ) {
    const result = validateAmount(
      payload.baseAmount,
      {
        required: false,
        field: "baseAmount",
      }
    );

    if (!result.valid) {
      errors.baseAmount =
        result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   CONTRIBUTION VALIDATION
========================================================= */

export const validateSavingContribution = (
  payload = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    payload.amount !== undefined
  ) {
    const result = validateAmount(
      payload.amount,
      {
        required: false,
        field: "amount",
      }
    );

    if (!result.valid) {
      errors.amount = result.message;
    }
  }

  if (
    payload.goalId !== undefined &&
    !isValidResourceId(payload.goalId)
  ) {
    errors.goalId =
      VALIDATION_MESSAGES.INVALID_ID;
  }

  if (
    payload.accountId !== undefined &&
    !isValidResourceId(payload.accountId)
  ) {
    errors.accountId =
      VALIDATION_MESSAGES.INVALID_ID;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   CHALLENGE VALIDATION
========================================================= */

export const validateSavingsChallenge = (
  payload = {}
) => {
  const errors = {};

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: {
        _form:
          VALIDATION_MESSAGES.INVALID_OBJECT,
      },
    };
  }

  if (
    payload.targetAmount !== undefined
  ) {
    const result = validateAmount(
      payload.targetAmount,
      {
        required: false,
        field: "targetAmount",
      }
    );

    if (!result.valid) {
      errors.targetAmount =
        result.message;
    }
  }

  if (
    payload.startDate !== undefined
  ) {
    const result = validateDate(
      payload.startDate,
      {
        required: false,
        field: "startDate",
      }
    );

    if (!result.valid) {
      errors.startDate =
        result.message;
    }
  }

  if (
    payload.endDate !== undefined
  ) {
    const result = validateDate(
      payload.endDate,
      {
        required: false,
        field: "endDate",
      }
    );

    if (!result.valid) {
      errors.endDate =
        result.message;
    }
  }

  if (
    payload.startDate &&
    payload.endDate
  ) {
    const result = validateDateRange(
      payload.startDate,
      payload.endDate
    );

    if (!result.valid) {
      errors.endDate =
        result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   LIFECYCLE VALIDATION
========================================================= */

/**
 * Validate a lifecycle resource ID.
 */
export const validateLifecycleId = (
  id,
  field = "id"
) => validateResourceId(id, field);

/**
 * Validate optional lifecycle reason.
 */
export const validateLifecycleReason = (
  reason,
  {
    required = false,
    field = "reason",
  } = {}
) => {
  if (
    reason === undefined ||
    reason === null ||
    reason === ""
  ) {
    return {
      valid: !required,
      field,
      message: required
        ? VALIDATION_MESSAGES.REQUIRED
        : null,
    };
  }

  return {
    valid: isNonEmptyString(reason),
    field,
    message: isNonEmptyString(reason)
      ? null
      : VALIDATION_MESSAGES.INVALID_STRING,
  };
};

/* =========================================================
   QUERY VALIDATION
========================================================= */

/**
 * Validate common list-query parameters.
 */
export const validateListQuery = ({
  page = 1,
  limit = 20,
} = {}) =>
  validatePagination({
    page,
    limit,
  });

/* =========================================================
   FORM VALIDATION
========================================================= */

/**
 * Return only invalid fields from a validator result.
 */
export const hasValidationErrors = (
  result
) =>
  !result ||
  result.valid !== true;

/**
 * Combine multiple validation results.
 */
export const combineValidationResults = (
  ...results
) => {
  const errors = {};

  results.forEach((result) => {
    if (!result?.valid && result?.errors) {
      Object.assign(
        errors,
        result.errors
      );
    } else if (
      !result?.valid &&
      result?.field
    ) {
      errors[result.field] =
        result.message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   EXPORT DEFAULT SERVICE
========================================================= */

const savingsValidators = Object.freeze({
  VALIDATION_MESSAGES,

  isNonEmptyString,
  isPlainObject,
  isArray,
  isBoolean,
  isFiniteNumber,

  isValidObjectId,
  isValidResourceId,
  validateResourceId,

  validateRequired,
  validateRequiredFields,

  isValidAmount,
  isValidNonNegativeAmount,
  validateAmount,

  isValidCurrency,
  validateCurrency,

  isValidDate,
  validateDate,
  validateDateRange,

  isValidPercentage,
  validatePercentage,

  isValidPage,
  isValidLimit,
  validatePagination,

  validateSavingAccount,
  validateSavingGoal,
  validateSavingPlan,
  validateSavingSchedule,
  validateSavingExecution,
  validateSavingContribution,
  validateSavingsChallenge,

  validateLifecycleId,
  validateLifecycleReason,

  validateListQuery,

  hasValidationErrors,
  combineValidationResults,
});

export default savingsValidators;