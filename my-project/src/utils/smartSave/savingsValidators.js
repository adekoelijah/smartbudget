/**
 * Savings Validators
 *
 * Centralized validation utilities for SmartSave.
 *
 * IMPORTANT:
 * - Backend/Mongoose remains the final source of truth.
 * - Frontend validation exists only for fast user feedback.
 * - Validation functions return:
 *
 *   {
 *     valid: Boolean,
 *     errors: Object
 *   }
 *
 * Supported domains:
 * - Savings Goals
 * - Savings Challenges
 * - Generic SmartSave validation helpers
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_NAME_LENGTH = 100;
const MAX_CHALLENGE_NAME_LENGTH = 120;

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CHALLENGE_DESCRIPTION_LENGTH = 1000;

const MAX_SLUG_LENGTH = 160;

const MIN_AMOUNT = 0;
const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

const MAX_PERCENTAGE = 100;

const SAVINGS_CHALLENGE_TYPES = Object.freeze([
  "fixed_amount",
  "incremental",
  "percentage",
  "round_up",
  "no_spend",
  "streak",
  "custom",
]);

const SAVINGS_CHALLENGE_DIFFICULTIES = Object.freeze([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

const SAVINGS_CHALLENGE_FREQUENCIES = Object.freeze([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "custom",
]);

const SAVINGS_CHALLENGE_CURRENCIES = Object.freeze([
  "NGN",
  "USD",
  "GBP",
  "EUR",
]);

const SAVINGS_CHALLENGE_VISIBILITY = Object.freeze([
  "private",
  "public",
]);

const SAVINGS_CHALLENGE_SOURCE_TYPES = Object.freeze([
  "system",
  "user",
  "admin",
]);

const SAVINGS_CHALLENGE_STATUS = Object.freeze([
  "draft",
  "active",
  "paused",
  "completed",
  "failed",
  "expired",
  "cancelled",
]);

const SAVINGS_CHALLENGE_REWARD_TYPES = Object.freeze([
  "badge",
  "points",
  "cashback",
  "interest_bonus",
  "none",
]);

/* -------------------------------------------------------------------------- */
/* Generic Helpers                                                            */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const normalizeString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

const normalizeEnum = (value) =>
  normalizeString(value).toLowerCase();

const isEmptyValue = (value) =>
  value === "" ||
  value === null ||
  value === undefined;

const isValidDate = (value) => {
  if (isEmptyValue(value)) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const isValidDateInput = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const parseDate = (value) => {
  if (isEmptyValue(value)) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const isValidEnumValue = (
  value,
  allowedValues,
) => {
  const normalizedValue =
    normalizeEnum(value);

  return (
    normalizedValue !== "" &&
    allowedValues.includes(
      normalizedValue,
    )
  );
};

const hasOwn = (
  object,
  property,
) =>
  isObject(object) &&
  Object.prototype.hasOwnProperty.call(
    object,
    property,
  );

/* -------------------------------------------------------------------------- */
/* Amount Validation                                                          */
/* -------------------------------------------------------------------------- */

export const validateAmount = (
  value,
  {
    required = true,
    min = MIN_AMOUNT,
    max = MAX_AMOUNT,
    allowZero = false,
    decimalPlaces = 2,
  } = {},
) => {
  if (isEmptyValue(value)) {
    if (required) {
      return {
        valid: false,
        errors: {
          amount: "Amount is required",
        },
      };
    }

    return {
      valid: true,
      errors: {},
    };
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return {
      valid: false,
      errors: {
        amount:
          "Amount must be a valid number",
      },
    };
  }

  if (amount < min) {
    return {
      valid: false,
      errors: {
        amount:
          `Amount must be at least ${min}`,
      },
    };
  }

  if (!allowZero && amount <= 0) {
    return {
      valid: false,
      errors: {
        amount:
          "Amount must be greater than zero",
      },
    };
  }

  if (amount > max) {
    return {
      valid: false,
      errors: {
        amount:
          "Amount exceeds the allowed limit",
      },
    };
  }

  const amountString =
    String(value).trim();

  if (amountString.includes(".")) {
    const decimalPart =
      amountString.split(".")[1] || "";

    if (
      decimalPart.length >
      decimalPlaces
    ) {
      return {
        valid: false,
        errors: {
          amount:
            `Amount cannot have more than ${decimalPlaces} decimal places`,
        },
      };
    }
  }

  return {
    valid: true,
    errors: {},
  };
};

/* -------------------------------------------------------------------------- */
/* Percentage Validation                                                      */
/* -------------------------------------------------------------------------- */

export const validatePercentage = (
  value,
  {
    required = false,
  } = {},
) => {
  if (isEmptyValue(value)) {
    return required
      ? {
          valid: false,
          errors: {
            percentage:
              "Percentage is required",
          },
        }
      : {
          valid: true,
          errors: {},
        };
  }

  const percentage = Number(value);

  if (!Number.isFinite(percentage)) {
    return {
      valid: false,
      errors: {
        percentage:
          "Percentage must be a valid number",
      },
    };
  }

  if (
    percentage < 0 ||
    percentage > MAX_PERCENTAGE
  ) {
    return {
      valid: false,
      errors: {
        percentage:
          "Percentage must be between 0 and 100",
      },
    };
  }

  return {
    valid: true,
    errors: {},
  };
};

/* -------------------------------------------------------------------------- */
/* Integer Validation                                                         */
/* -------------------------------------------------------------------------- */

const validateInteger = (
  value,
  {
    required = false,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    fieldName = "Value",
  } = {},
) => {
  if (isEmptyValue(value)) {
    return required
      ? {
          valid: false,
          errors: {
            value:
              `${fieldName} is required`,
          },
        }
      : {
          valid: true,
          errors: {},
        };
  }

  const number = Number(value);

  if (
    !Number.isInteger(number)
  ) {
    return {
      valid: false,
      errors: {
        value:
          `${fieldName} must be a whole number`,
      },
    };
  }

  if (number < min) {
    return {
      valid: false,
      errors: {
        value:
          `${fieldName} must be at least ${min}`,
      },
    };
  }

  if (number > max) {
    return {
      valid: false,
      errors: {
        value:
          `${fieldName} must be at most ${max}`,
      },
    };
  }

  return {
    valid: true,
    errors: {},
  };
};

/* -------------------------------------------------------------------------- */
/* Currency Validation                                                        */
/* -------------------------------------------------------------------------- */

export const validateCurrency = (
  currency,
  {
    required = true,
    allowedCurrencies = ["NGN"],
  } = {},
) => {
  const normalizedCurrency =
    normalizeString(currency).toUpperCase();

  if (!normalizedCurrency) {
    return required
      ? {
          valid: false,
          errors: {
            currency:
              "Currency is required",
          },
        }
      : {
          valid: true,
          errors: {},
        };
  }

  if (
    !allowedCurrencies.includes(
      normalizedCurrency,
    )
  ) {
    return {
      valid: false,
      errors: {
        currency:
          "Unsupported currency",
      },
    };
  }

  return {
    valid: true,
    errors: {},
  };
};

/* -------------------------------------------------------------------------- */
/* Date Validation                                                            */
/* -------------------------------------------------------------------------- */

export const validateDate = (
  value,
  {
    required = true,
    fieldName = "Date",
    minDate = null,
    maxDate = null,
    mustBeAfter = null,
  } = {},
) => {
  const errors = {};

  if (isEmptyValue(value)) {
    if (required) {
      errors.date =
        `${fieldName} is required`;
    }

    return {
      valid:
        Object.keys(errors).length === 0,
      errors,
    };
  }

  if (
    !isValidDateInput(value) &&
    !isValidDate(value)
  ) {
    return {
      valid: false,
      errors: {
        date:
          `${fieldName} must be a valid date`,
      },
    };
  }

  const date = parseDate(value);

  if (!date) {
    return {
      valid: false,
      errors: {
        date:
          `${fieldName} must be a valid date`,
      },
    };
  }

  if (minDate) {
    const minimum =
      parseDate(minDate);

    if (
      minimum &&
      date < minimum
    ) {
      errors.date =
        `${fieldName} cannot be earlier than the minimum allowed date`;
    }
  }

  if (maxDate) {
    const maximum =
      parseDate(maxDate);

    if (
      maximum &&
      date > maximum
    ) {
      errors.date =
        `${fieldName} cannot be later than the maximum allowed date`;
    }
  }

  if (mustBeAfter) {
    const comparisonDate =
      parseDate(mustBeAfter);

    if (
      comparisonDate &&
      date <= comparisonDate
    ) {
      errors.date =
        `${fieldName} must be after the start date`;
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Date Range Validation                                                      */
/* -------------------------------------------------------------------------- */

export const validateDateRange = (
  startDate,
  endDate,
  {
    requireStartDate = false,
    requireEndDate = false,
    endDateMustBeAfterStart = true,
  } = {},
) => {
  const errors = {};

  if (
    isEmptyValue(startDate) &&
    requireStartDate
  ) {
    errors.startDate =
      "Start date is required";
  }

  if (
    isEmptyValue(endDate) &&
    requireEndDate
  ) {
    errors.endDate =
      "End date is required";
  }

  if (
    !isEmptyValue(startDate) &&
    !isValidDate(startDate)
  ) {
    errors.startDate =
      "Start date must be a valid date";
  }

  if (
    !isEmptyValue(endDate) &&
    !isValidDate(endDate)
  ) {
    errors.endDate =
      "End date must be a valid date";
  }

  if (
    startDate &&
    endDate &&
    isValidDate(startDate) &&
    isValidDate(endDate)
  ) {
    const start =
      parseDate(startDate);

    const end =
      parseDate(endDate);

    if (
      start &&
      end &&
      endDateMustBeAfterStart
        ? end <= start
        : end < start
    ) {
      errors.endDate =
        endDateMustBeAfterStart
          ? "End date must be after the start date"
          : "End date cannot be earlier than the start date";
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Goal Validation                                                    */
/* -------------------------------------------------------------------------- */

export const validateSavingsGoal = (
  payload = {},
  {
    requireName = true,
    requireTargetAmount = true,
    requireTargetDate = true,
    requireCurrency = true,
    validateTargetDateAgainstStartDate = false,
  } = {},
) => {
  const errors = {};

  if (!isObject(payload)) {
    return {
      valid: false,
      errors: {
        form:
          "Savings goal data must be a valid object",
      },
    };
  }

  /* Name */

  const name =
    normalizeString(payload.name);

  if (!name) {
    if (requireName) {
      errors.name =
        "Savings goal name is required";
    }
  } else if (
    name.length > MAX_NAME_LENGTH
  ) {
    errors.name =
      `Savings goal name cannot exceed ${MAX_NAME_LENGTH} characters`;
  }

  /* Description */

  const description =
    normalizeString(
      payload.description,
    );

  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    errors.description =
      `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
  }

  /* Target Amount */

  if (
    isEmptyValue(
      payload.targetAmount,
    )
  ) {
    if (requireTargetAmount) {
      errors.targetAmount =
        "Target amount is required";
    }
  } else {
    const result =
      validateAmount(
        payload.targetAmount,
        {
          required:
            requireTargetAmount,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: false,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors.targetAmount =
        result.errors.amount ||
        "Target amount is invalid";
    }
  }

  /* Currency */

  const currencyResult =
    validateCurrency(
      payload.currency,
      {
        required:
          requireCurrency,
        allowedCurrencies: [
          "NGN",
        ],
      },
    );

  if (!currencyResult.valid) {
    errors.currency =
      currencyResult.errors.currency ||
      "Currency is invalid";
  }

  /* Target Date */

  if (
    isEmptyValue(
      payload.targetDate,
    )
  ) {
    if (requireTargetDate) {
      errors.targetDate =
        "Target date is required";
    }
  } else {
    const result =
      validateDate(
        payload.targetDate,
        {
          required:
            requireTargetDate,
          fieldName:
            "Target date",
        },
      );

    if (!result.valid) {
      errors.targetDate =
        result.errors.date ||
        "Target date is invalid";
    }
  }

  /* Target Date vs Start Date */

  if (
    validateTargetDateAgainstStartDate &&
    payload.targetDate &&
    isValidDate(
      payload.targetDate,
    )
  ) {
    const startDate =
      payload.startDate
        ? parseDate(
            payload.startDate,
          )
        : new Date();

    const targetDate =
      parseDate(
        payload.targetDate,
      );

    if (
      startDate &&
      targetDate &&
      targetDate <= startDate
    ) {
      errors.targetDate =
        "Target date must be after the start date";
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Goal Aliases                                                       */
/* -------------------------------------------------------------------------- */

export const validateSavingGoal = (
  payload = {},
  options = {},
) =>
  validateSavingsGoal(
    payload,
    options,
  );

/* -------------------------------------------------------------------------- */
/* Savings Goal Create Validation                                             */
/* -------------------------------------------------------------------------- */

export const validateCreateSavingsGoal = (
  payload = {},
) =>
  validateSavingsGoal(
    payload,
    {
      requireName: true,
      requireTargetAmount: true,
      requireTargetDate: true,
      requireCurrency: true,
      validateTargetDateAgainstStartDate: true,
    },
  );

/* -------------------------------------------------------------------------- */
/* Savings Goal Update Validation                                             */
/* -------------------------------------------------------------------------- */

export const validateUpdateSavingsGoal = (
  payload = {},
) =>
  validateSavingsGoal(
    payload,
    {
      requireName: false,
      requireTargetAmount: false,
      requireTargetDate: false,
      requireCurrency: false,
      validateTargetDateAgainstStartDate: false,
    },
  );

/* -------------------------------------------------------------------------- */
/* Savings Challenge - Target Validation                                      */
/* -------------------------------------------------------------------------- */

const validateChallengeTarget = (
  target = {},
  challengeType,
  {
    requireTargetAmount = true,
  } = {},
) => {
  const errors = {};

  if (!isObject(target)) {
    return {
      valid: false,
      errors: {
        target:
          "Challenge target configuration must be an object",
      },
    };
  }

  /* ---------------------------------------------------------------------- */
  /* target.targetAmount                                                    */
  /* ---------------------------------------------------------------------- */

  if (
    isEmptyValue(
      target.targetAmount,
    )
  ) {
    if (requireTargetAmount) {
      errors["target.targetAmount"] =
        "Target amount is required";
    }
  } else {
    const result =
      validateAmount(
        target.targetAmount,
        {
          required:
            requireTargetAmount,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: false,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.targetAmount"] =
        result.errors.amount ||
        "Target amount is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* target.amount                                                          */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(target.amount)
  ) {
    const result =
      validateAmount(
        target.amount,
        {
          required: false,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: true,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.amount"] =
        result.errors.amount ||
        "Target amount value is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* target.percentage                                                      */
  /* ---------------------------------------------------------------------- */

  if (
    challengeType ===
    "percentage"
  ) {
    const result =
      validatePercentage(
        target.percentage,
        {
          required: true,
        },
      );

    if (!result.valid) {
      errors["target.percentage"] =
        result.errors.percentage ||
        "Percentage is required for percentage challenges";
    }
  } else if (
    !isEmptyValue(
      target.percentage,
    )
  ) {
    const result =
      validatePercentage(
        target.percentage,
        {
          required: false,
        },
      );

    if (!result.valid) {
      errors["target.percentage"] =
        result.errors.percentage ||
        "Percentage is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* target.startingAmount                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    challengeType ===
    "incremental"
  ) {
    const result =
      validateAmount(
        target.startingAmount,
        {
          required: true,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: false,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.startingAmount"] =
        result.errors.amount ||
        "Starting amount is required for incremental challenges";
    }
  } else if (
    !isEmptyValue(
      target.startingAmount,
    )
  ) {
    const result =
      validateAmount(
        target.startingAmount,
        {
          required: false,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: true,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.startingAmount"] =
        result.errors.amount ||
        "Starting amount is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* target.incrementAmount                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    challengeType ===
    "incremental"
  ) {
    const result =
      validateAmount(
        target.incrementAmount,
        {
          required: true,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: false,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.incrementAmount"] =
        result.errors.amount ||
        "Increment amount is required for incremental challenges";
    }
  } else if (
    !isEmptyValue(
      target.incrementAmount,
    )
  ) {
    const result =
      validateAmount(
        target.incrementAmount,
        {
          required: false,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: true,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.incrementAmount"] =
        result.errors.amount ||
        "Increment amount is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* target.maximumAmount                                                   */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      target.maximumAmount,
    )
  ) {
    const result =
      validateAmount(
        target.maximumAmount,
        {
          required: false,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: true,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["target.maximumAmount"] =
        result.errors.amount ||
        "Maximum amount is invalid";
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Challenge - Frequency Validation                                  */
/* -------------------------------------------------------------------------- */

const validateChallengeFrequency = (
  frequency = {},
  {
    required = true,
  } = {},
) => {
  const errors = {};

  if (
    isEmptyValue(frequency)
  ) {
    if (required) {
      return {
        valid: false,
        errors: {
          frequency:
            "Challenge frequency is required",
        },
      };
    }

    return {
      valid: true,
      errors: {},
    };
  }

  if (!isObject(frequency)) {
    return {
      valid: false,
      errors: {
        frequency:
          "Frequency configuration must be an object",
      },
    };
  }

  /* Frequency type */

  const type =
    normalizeEnum(
      frequency.type,
    );

  if (!type) {
    if (required) {
      errors["frequency.type"] =
        "Frequency type is required";
    }
  } else if (
    !SAVINGS_CHALLENGE_FREQUENCIES.includes(
      type,
    )
  ) {
    errors["frequency.type"] =
      "Invalid challenge frequency";
  }

  /* Interval */

  if (
    !isEmptyValue(
      frequency.interval,
    )
  ) {
    const result =
      validateInteger(
        frequency.interval,
        {
          required: false,
          min: 1,
          max:
            Number.MAX_SAFE_INTEGER,
          fieldName:
            "Frequency interval",
        },
      );

    if (!result.valid) {
      errors["frequency.interval"] =
        result.errors.value ||
        "Frequency interval is invalid";
    }
  }

  /* Day of week */

  if (
    !isEmptyValue(
      frequency.dayOfWeek,
    )
  ) {
    const result =
      validateInteger(
        frequency.dayOfWeek,
        {
          required: false,
          min: 0,
          max: 6,
          fieldName:
            "Day of week",
        },
      );

    if (!result.valid) {
      errors["frequency.dayOfWeek"] =
        result.errors.value ||
        "Day of week must be between 0 and 6";
    }
  }

  /* Day of month */

  if (
    !isEmptyValue(
      frequency.dayOfMonth,
    )
  ) {
    const result =
      validateInteger(
        frequency.dayOfMonth,
        {
          required: false,
          min: 1,
          max: 31,
          fieldName:
            "Day of month",
        },
      );

    if (!result.valid) {
      errors["frequency.dayOfMonth"] =
        result.errors.value ||
        "Day of month must be between 1 and 31";
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Challenge - Reward Validation                                     */
/* -------------------------------------------------------------------------- */

const validateChallengeReward = (
  reward = {},
) => {
  const errors = {};

  if (
    isEmptyValue(reward)
  ) {
    return {
      valid: true,
      errors: {},
    };
  }

  if (!isObject(reward)) {
    return {
      valid: false,
      errors: {
        reward:
          "Reward configuration must be an object",
      },
    };
  }

  /* Enabled */

  if (
    hasOwn(reward, "enabled") &&
    typeof reward.enabled !==
      "boolean"
  ) {
    errors["reward.enabled"] =
      "Reward enabled value must be true or false";
  }

  /* Type */

  if (
    !isEmptyValue(reward.type) &&
    !isValidEnumValue(
      reward.type,
      SAVINGS_CHALLENGE_REWARD_TYPES,
    )
  ) {
    errors["reward.type"] =
      "Invalid reward type";
  }

  /* Value */

  if (
    !isEmptyValue(reward.value)
  ) {
    const result =
      validateAmount(
        reward.value,
        {
          required: false,
          min: MIN_AMOUNT,
          max: MAX_AMOUNT,
          allowZero: true,
          decimalPlaces: 2,
        },
      );

    if (!result.valid) {
      errors["reward.value"] =
        result.errors.amount ||
        "Reward value is invalid";
    }
  }

  /* Description */

  const description =
    normalizeString(
      reward.description,
    );

  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    errors["reward.description"] =
      `Reward description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Challenge - Settings Validation                                   */
/* -------------------------------------------------------------------------- */

const validateChallengeSettings = (
  settings = {},
) => {
  const errors = {};

  if (
    isEmptyValue(settings)
  ) {
    return {
      valid: true,
      errors: {},
    };
  }

  if (!isObject(settings)) {
    return {
      valid: false,
      errors: {
        settings:
          "Challenge settings must be an object",
      },
    };
  }

  const booleanFields = [
    "allowEarlyCompletion",
    "allowPartialContribution",
    "allowOverContribution",
    "rolloverMissedContribution",
    "notifyBeforeDue",
  ];

  booleanFields.forEach(
    (field) => {
      if (
        hasOwn(settings, field) &&
        typeof settings[field] !==
          "boolean"
      ) {
        errors[`settings.${field}`] =
          `${field} must be true or false`;
      }
    },
  );

  if (
    !isEmptyValue(
      settings.notificationDaysBefore,
    )
  ) {
    const result =
      validateInteger(
        settings.notificationDaysBefore,
        {
          required: false,
          min: 0,
          max: 30,
          fieldName:
            "Notification days before",
        },
      );

    if (!result.valid) {
      errors[
        "settings.notificationDaysBefore"
      ] =
        result.errors.value ||
        "Notification days before must be between 0 and 30";
    }
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Challenge Validation                                               */
/* -------------------------------------------------------------------------- */

/**
 * Validate a SavingsChallenge payload against the frontend
 * representation of the backend SavingsChallenge model.
 *
 * Expected structure:
 *
 * {
 *   name,
 *   slug,
 *   description,
 *   challengeType,
 *   difficulty,
 *   source,
 *   visibility,
 *   currency,
 *
 *   target: {
 *     amount,
 *     percentage,
 *     startingAmount,
 *     incrementAmount,
 *     maximumAmount,
 *     targetAmount
 *   },
 *
 *   frequency: {
 *     type,
 *     interval,
 *     dayOfWeek,
 *     dayOfMonth
 *   },
 *
 *   startDate,
 *   endDate,
 *
 *   savingAccount,
 *   savingPlan,
 *
 *   autoSaveEnabled,
 *   autoSave,
 *
 *   participantCount,
 *
 *   settings: {
 *     allowEarlyCompletion,
 *     allowPartialContribution,
 *     allowOverContribution,
 *     rolloverMissedContribution,
 *     notifyBeforeDue,
 *     notificationDaysBefore
 *   },
 *
 *   reward: {
 *     enabled,
 *     type,
 *     value,
 *     description
 *   }
 * }
 */
export const validateSavingsChallenge = (
  payload = {},
  {
    requireName = true,
    requireDescription = false,
    requireChallengeType = true,
    requireDifficulty = true,
    requireCurrency = true,
    requireTarget = true,
    requireTargetAmount = true,
    requireFrequency = true,
    requireStartDate = true,
    requireEndDate = true,
    validateSource = false,
    validateStatus = false,
  } = {},
) => {
  const errors = {};

  if (!isObject(payload)) {
    return {
      valid: false,
      errors: {
        form:
          "Savings challenge data must be a valid object",
      },
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Name                                                                   */
  /* ---------------------------------------------------------------------- */

  const name =
    normalizeString(payload.name);

  if (!name) {
    if (requireName) {
      errors.name =
        "Challenge name is required";
    }
  } else if (
    name.length < 2
  ) {
    errors.name =
      "Challenge name must contain at least 2 characters";
  } else if (
    name.length >
    MAX_CHALLENGE_NAME_LENGTH
  ) {
    errors.name =
      `Challenge name cannot exceed ${MAX_CHALLENGE_NAME_LENGTH} characters`;
  }

  /* ---------------------------------------------------------------------- */
  /* Slug                                                                   */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(payload.slug)
  ) {
    const slug =
      normalizeString(
        payload.slug,
      );

    if (
      slug.length >
      MAX_SLUG_LENGTH
    ) {
      errors.slug =
        `Slug cannot exceed ${MAX_SLUG_LENGTH} characters`;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Description                                                            */
  /* ---------------------------------------------------------------------- */

  const description =
    normalizeString(
      payload.description,
    );

  if (
    !description &&
    requireDescription
  ) {
    errors.description =
      "Challenge description is required";
  }

  if (
    description.length >
    MAX_CHALLENGE_DESCRIPTION_LENGTH
  ) {
    errors.description =
      `Description cannot exceed ${MAX_CHALLENGE_DESCRIPTION_LENGTH} characters`;
  }

  /* ---------------------------------------------------------------------- */
  /* Challenge Type                                                         */
  /* ---------------------------------------------------------------------- */

  const challengeType =
    normalizeEnum(
      payload.challengeType,
    );

  if (!challengeType) {
    if (requireChallengeType) {
      errors.challengeType =
        "Challenge type is required";
    }
  } else if (
    !SAVINGS_CHALLENGE_TYPES.includes(
      challengeType,
    )
  ) {
    errors.challengeType =
      "Invalid challenge type";
  }

  /* ---------------------------------------------------------------------- */
  /* Difficulty                                                             */
  /* ---------------------------------------------------------------------- */

  const difficulty =
    normalizeEnum(
      payload.difficulty,
    );

  if (!difficulty) {
    if (requireDifficulty) {
      errors.difficulty =
        "Challenge difficulty is required";
    }
  } else if (
    !SAVINGS_CHALLENGE_DIFFICULTIES.includes(
      difficulty,
    )
  ) {
    errors.difficulty =
      "Invalid challenge difficulty";
  }

  /* ---------------------------------------------------------------------- */
  /* Source                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    validateSource &&
    !isEmptyValue(payload.source)
  ) {
    const source =
      normalizeEnum(
        payload.source,
      );

    if (
      !SAVINGS_CHALLENGE_SOURCE_TYPES.includes(
        source,
      )
    ) {
      errors.source =
        "Invalid challenge source";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Visibility                                                             */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      payload.visibility,
    )
  ) {
    const visibility =
      normalizeEnum(
        payload.visibility,
      );

    if (
      !SAVINGS_CHALLENGE_VISIBILITY.includes(
        visibility,
      )
    ) {
      errors.visibility =
        "Invalid challenge visibility";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Status                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    validateStatus &&
    !isEmptyValue(payload.status)
  ) {
    const status =
      normalizeEnum(
        payload.status,
      );

    if (
      !SAVINGS_CHALLENGE_STATUS.includes(
        status,
      )
    ) {
      errors.status =
        "Invalid challenge status";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Currency                                                               */
  /* ---------------------------------------------------------------------- */

  const currencyResult =
    validateCurrency(
      payload.currency,
      {
        required:
          requireCurrency,
        allowedCurrencies:
          SAVINGS_CHALLENGE_CURRENCIES,
      },
    );

  if (!currencyResult.valid) {
    errors.currency =
      currencyResult.errors.currency ||
      "Currency is invalid";
  }

  /* ---------------------------------------------------------------------- */
  /* Target                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    isEmptyValue(payload.target)
  ) {
    if (requireTarget) {
      errors.target =
        "Challenge target configuration is required";
    }
  } else {
    const targetResult =
      validateChallengeTarget(
        payload.target,
        challengeType,
        {
          requireTargetAmount,
        },
      );

    Object.assign(
      errors,
      targetResult.errors,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Frequency                                                              */
  /* ---------------------------------------------------------------------- */

  const frequencyResult =
    validateChallengeFrequency(
      payload.frequency,
      {
        required:
          requireFrequency,
      },
    );

  Object.assign(
    errors,
    frequencyResult.errors,
  );

  /* ---------------------------------------------------------------------- */
  /* Start Date                                                             */
  /* ---------------------------------------------------------------------- */

  if (
    isEmptyValue(
      payload.startDate,
    )
  ) {
    if (requireStartDate) {
      errors.startDate =
        "Start date is required";
    }
  } else {
    const result =
      validateDate(
        payload.startDate,
        {
          required:
            requireStartDate,
          fieldName:
            "Start date",
        },
      );

    if (!result.valid) {
      errors.startDate =
        result.errors.date ||
        "Start date is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* End Date                                                               */
  /* ---------------------------------------------------------------------- */

  if (
    isEmptyValue(
      payload.endDate,
    )
  ) {
    if (requireEndDate) {
      errors.endDate =
        "End date is required";
    }
  } else {
    const result =
      validateDate(
        payload.endDate,
        {
          required:
            requireEndDate,
          fieldName:
            "End date",
        },
      );

    if (!result.valid) {
      errors.endDate =
        result.errors.date ||
        "End date is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Start / End Date Relationship                                          */
  /* ---------------------------------------------------------------------- */

  if (
    payload.startDate &&
    payload.endDate &&
    isValidDate(
      payload.startDate,
    ) &&
    isValidDate(
      payload.endDate,
    )
  ) {
    const start =
      parseDate(
        payload.startDate,
      );

    const end =
      parseDate(
        payload.endDate,
      );

    /*
     * IMPORTANT:
     *
     * The backend model rejects:
     *
     *   endDate < startDate
     *
     * It does NOT reject equal dates.
     *
     * Therefore this validator intentionally allows:
     *
     *   startDate === endDate
     */
    if (
      start &&
      end &&
      end < start
    ) {
      errors.endDate =
        "End date cannot be earlier than the start date";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Saving Account                                                         */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      payload.savingAccount,
    )
  ) {
    const result =
      validateObjectId(
        payload.savingAccount,
        "Saving account",
      );

    if (!result.valid) {
      errors.savingAccount =
        result.errors[
          "Saving account"
        ] ||
        "Saving account ID is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Saving Plan                                                            */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      payload.savingPlan,
    )
  ) {
    const result =
      validateObjectId(
        payload.savingPlan,
        "Saving plan",
      );

    if (!result.valid) {
      errors.savingPlan =
        result.errors[
          "Saving plan"
        ] ||
        "Saving plan ID is invalid";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Auto Save                                                              */
  /* ---------------------------------------------------------------------- */

  if (
    hasOwn(
      payload,
      "autoSaveEnabled",
    ) &&
    typeof payload.autoSaveEnabled !==
      "boolean"
  ) {
    errors.autoSaveEnabled =
      "Auto-save enabled value must be true or false";
  }

  if (
    payload.autoSaveEnabled === true
  ) {
    if (
      isEmptyValue(
        payload.autoSave,
      )
    ) {
      errors.autoSave =
        "Auto-save configuration is required when auto-save is enabled";
    } else {
      const result =
        validateObjectId(
          payload.autoSave,
          "Auto-save",
        );

      if (!result.valid) {
        errors.autoSave =
          result.errors.AutoSave ||
          result.errors["Auto-save"] ||
          "Auto-save ID is invalid";
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Participant Count                                                      */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      payload.participantCount,
    )
  ) {
    const result =
      validateInteger(
        payload.participantCount,
        {
          required: false,
          min: 1,
          max:
            Number.MAX_SAFE_INTEGER,
          fieldName:
            "Participant count",
        },
      );

    if (!result.valid) {
      errors.participantCount =
        result.errors.value ||
        "Participant count must be at least 1";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Reward                                                                 */
  /* ---------------------------------------------------------------------- */

  const rewardResult =
    validateChallengeReward(
      payload.reward,
    );

  Object.assign(
    errors,
    rewardResult.errors,
  );

  /* ---------------------------------------------------------------------- */
  /* Settings                                                               */
  /* ---------------------------------------------------------------------- */

  const settingsResult =
    validateChallengeSettings(
      payload.settings,
    );

  Object.assign(
    errors,
    settingsResult.errors,
  );

  /* ---------------------------------------------------------------------- */
  /* Creation Reference                                                     */
  /* ---------------------------------------------------------------------- */

  if (
    !isEmptyValue(
      payload.creationReference,
    )
  ) {
    const creationReference =
      normalizeString(
        payload.creationReference,
      );

    if (
      creationReference.length >
      150
    ) {
      errors.creationReference =
        "Creation reference cannot exceed 150 characters";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Final Result                                                           */
  /* ---------------------------------------------------------------------- */

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
  };
};

/* -------------------------------------------------------------------------- */
/* Savings Challenge Create Validation                                        */
/* -------------------------------------------------------------------------- */

/**
 * Validate a new SavingsChallenge.
 *
 * Required backend creation fields:
 *
 * - name
 * - challengeType
 * - difficulty
 * - currency
 * - target
 * - target.targetAmount
 * - frequency
 * - startDate
 * - endDate
 */
export const validateCreateSavingsChallenge = (
  payload = {},
) =>
  validateSavingsChallenge(
    payload,
    {
      requireName: true,
      requireDescription: false,
      requireChallengeType: true,
      requireDifficulty: true,
      requireCurrency: true,
      requireTarget: true,
      requireTargetAmount: true,
      requireFrequency: true,
      requireStartDate: true,
      requireEndDate: true,
      validateSource: false,
      validateStatus: false,
    },
  );

/* -------------------------------------------------------------------------- */
/* Savings Challenge Update Validation                                        */
/* -------------------------------------------------------------------------- */

/**
 * Validate a SavingsChallenge update.
 *
 * PATCH operations may contain only the fields
 * being changed.
 */
export const validateUpdateSavingsChallenge = (
  payload = {},
) =>
  validateSavingsChallenge(
    payload,
    {
      requireName: false,
      requireDescription: false,
      requireChallengeType: false,
      requireDifficulty: false,
      requireCurrency: false,
      requireTarget: false,
      requireTargetAmount: false,
      requireFrequency: false,
      requireStartDate: false,
      requireEndDate: false,
      validateSource: true,
      validateStatus: true,
    },
  );

/* -------------------------------------------------------------------------- */
/* Object ID Validation                                                       */
/* -------------------------------------------------------------------------- */

export const isValidObjectId = (
  value,
) => {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  return /^[a-f\d]{24}$/i.test(
    value.trim(),
  );
};

export const validateObjectId = (
  value,
  fieldName = "ID",
) => {
  if (
    isEmptyValue(value)
  ) {
    return {
      valid: false,
      errors: {
        [fieldName]:
          `${fieldName} is required`,
      },
    };
  }

  if (
    !isValidObjectId(value)
  ) {
    return {
      valid: false,
      errors: {
        [fieldName]:
          `${fieldName} is invalid`,
      },
    };
  }

  return {
    valid: true,
    errors: {},
  };
};

/* -------------------------------------------------------------------------- */
/* Generic Validation Result Helper                                           */
/* -------------------------------------------------------------------------- */

export const hasValidationErrors = (
  result,
) => {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return true;
  }

  if (result.valid === false) {
    return true;
  }

  return (
    isObject(result.errors) &&
    Object.keys(
      result.errors,
    ).length > 0
  );
};

export const getValidationErrors = (
  result,
) => {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return {};
  }

  if (
    !isObject(result.errors)
  ) {
    return {};
  }

  return result.errors;
};