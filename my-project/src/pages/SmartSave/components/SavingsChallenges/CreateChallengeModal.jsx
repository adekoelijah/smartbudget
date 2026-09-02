import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  Loader2,
  Settings2,
  Target,
  Trophy,
  X,
} from "lucide-react";

import {
  CHALLENGE_TYPES,
  CHALLENGE_DIFFICULTIES,
} from "../../../../constants/smartSaveConstants";

import {
  validateSavingsChallenge,
} from "../../../../utils/smartSave/savingsValidators";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_NAME_LENGTH = 120;
const MAX_SLUG_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_REWARD_DESCRIPTION_LENGTH = 500;

const CURRENCIES = [
  {
    value: "NGN",
    label: "NGN — Nigerian Naira",
  },
  {
    value: "USD",
    label: "USD — US Dollar",
  },
  {
    value: "GBP",
    label: "GBP — British Pound",
  },
  {
    value: "EUR",
    label: "EUR — Euro",
  },
];

const FREQUENCIES = [
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "biweekly",
    label: "Every 2 weeks",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

const REWARD_TYPES = [
  {
    value: "none",
    label: "No reward",
  },
  {
    value: "badge",
    label: "Badge",
  },
  {
    value: "points",
    label: "Points",
  },
  {
    value: "cashback",
    label: "Cashback",
  },
  {
    value: "interest_bonus",
    label: "Interest bonus",
  },
];

const VISIBILITY_OPTIONS = [
  {
    value: "private",
    label: "Private",
  },
  {
    value: "public",
    label: "Public",
  },
];

const DAY_OF_WEEK_OPTIONS = [
  {
    value: "0",
    label: "Sunday",
  },
  {
    value: "1",
    label: "Monday",
  },
  {
    value: "2",
    label: "Tuesday",
  },
  {
    value: "3",
    label: "Wednesday",
  },
  {
    value: "4",
    label: "Thursday",
  },
  {
    value: "5",
    label: "Friday",
  },
  {
    value: "6",
    label: "Saturday",
  },
];

const INITIAL_FORM = Object.freeze({
  name: "",
  slug: "",
  description: "",

  challengeType: "fixed_amount",
  difficulty: "beginner",
  currency: "NGN",
  visibility: "private",

  targetAmount: "",
  targetAmountBase: "",
  targetPercentage: "",
  startingAmount: "",
  incrementAmount: "",
  maximumAmount: "",

  frequencyType: "weekly",
  frequencyInterval: "1",
  dayOfWeek: "",
  dayOfMonth: "",

  startDate: "",
  endDate: "",

  savingPlan: "",
  savingAccount: "",

  autoSaveEnabled: false,
  autoSave: "",

  participantCount: "1",

  allowEarlyCompletion: true,
  allowPartialContribution: true,
  allowOverContribution: false,
  rolloverMissedContribution: false,

  notifyBeforeDue: true,
  notificationDaysBefore: "1",

  rewardEnabled: false,
  rewardType: "none",
  rewardValue: "",
  rewardDescription: "",
});

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return String(
      value?._id ??
        value?.id ??
        value?.value ??
        ""
    );
  }

  return "";
};

const toStringValue = (
  value,
  fallback = ""
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
};

const toNumberOrUndefined = (
  value
) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
};

const normalizeOptions = (
  source
) => {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((option) => {
      if (
        option &&
        typeof option === "object"
      ) {
        const value =
          option.value ??
          option.id ??
          option._id ??
          "";

        const label =
          option.label ??
          option.name ??
          option.title ??
          option.value ??
          "";

        if (!value) {
          return null;
        }

        return {
          value: String(value),
          label: String(label),
        };
      }

      if (
        option === null ||
        option === undefined ||
        option === ""
      ) {
        return null;
      }

      return {
        value: String(option),
        label: String(option),
      };
    })
    .filter(Boolean);
};

const getTodayDateInputValue = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTomorrowDateInputValue = () => {
  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   INITIAL FORM
========================================================= */

const createInitialForm = (
  values = {}
) => {
  const target =
    values?.target ?? {};

  const frequency =
    values?.frequency ?? {};

  const reward =
    values?.reward ?? {};

  return {
    ...INITIAL_FORM,

    name: toStringValue(
      values.name
    ),

    slug: toStringValue(
      values.slug
    ),

    description: toStringValue(
      values.description
    ),

    challengeType:
      toStringValue(
        values.challengeType
      ) || "fixed_amount",

    difficulty:
      toStringValue(
        values.difficulty
      ) || "beginner",

    currency:
      toStringValue(
        values.currency
      ).toUpperCase() || "NGN",

    visibility:
      toStringValue(
        values.visibility
      ) || "private",

    targetAmount:
      target.targetAmount != null
        ? String(
            target.targetAmount
          )
        : values.targetAmount != null
          ? String(
              values.targetAmount
            )
          : "",

    targetAmountBase:
      target.amount != null
        ? String(target.amount)
        : values.targetAmountBase != null
          ? String(
              values.targetAmountBase
            )
          : "",

    targetPercentage:
      target.percentage != null
        ? String(
            target.percentage
          )
        : "",

    startingAmount:
      target.startingAmount != null
        ? String(
            target.startingAmount
          )
        : "",

    incrementAmount:
      target.incrementAmount != null
        ? String(
            target.incrementAmount
          )
        : "",

    maximumAmount:
      target.maximumAmount != null
        ? String(
            target.maximumAmount
          )
        : "",

    frequencyType:
      toStringValue(
        frequency.type
      ) || "weekly",

    frequencyInterval:
      frequency.interval != null
        ? String(
            frequency.interval
          )
        : "1",

    dayOfWeek:
      frequency.dayOfWeek != null
        ? String(
            frequency.dayOfWeek
          )
        : "",

    dayOfMonth:
      frequency.dayOfMonth != null
        ? String(
            frequency.dayOfMonth
          )
        : "",

    startDate:
      toStringValue(
        values.startDate
      ),

    endDate:
      toStringValue(
        values.endDate
      ),

    savingPlan: getId(
      values.savingPlan
    ),

    savingAccount: getId(
      values.savingAccount
    ),

    autoSaveEnabled:
      Boolean(
        values.autoSaveEnabled
      ),

    autoSave: getId(
      values.autoSave
    ),

    participantCount:
      values.participantCount != null
        ? String(
            values.participantCount
          )
        : "1",

    allowEarlyCompletion:
      values.allowEarlyCompletion ??
      true,

    allowPartialContribution:
      values.allowPartialContribution ??
      true,

    allowOverContribution:
      values.allowOverContribution ??
      false,

    rolloverMissedContribution:
      values.rolloverMissedContribution ??
      false,

    notifyBeforeDue:
      values.notifyBeforeDue ??
      true,

    notificationDaysBefore:
      values.notificationDaysBefore != null
        ? String(
            values.notificationDaysBefore
          )
        : "1",

    rewardEnabled:
      Boolean(reward.enabled),

    rewardType:
      toStringValue(
        reward.type
      ) || "none",

    rewardValue:
      reward.value != null
        ? String(reward.value)
        : "",

    rewardDescription:
      toStringValue(
        reward.description
      ),
  };
};

/* =========================================================
   BACKEND PAYLOAD BUILDER

   This produces the structure expected by
   SavingsChallengeSchema.

   Backend-managed fields are intentionally excluded:
   user
   status
   activatedAt
   paused
   progress
   streak
   completion
   contributionCount
   lastContribution
   creationReference
   lastOperationReference
   isDeleted
   deletedAt
   durationDays

========================================================= */

const buildChallengePayload = (
  form
) => {
  const targetAmount =
    toNumberOrUndefined(
      form.targetAmount
    );

  const baseAmount =
    toNumberOrUndefined(
      form.targetAmountBase
    );

  const percentage =
    toNumberOrUndefined(
      form.targetPercentage
    );

  const startingAmount =
    toNumberOrUndefined(
      form.startingAmount
    );

  const incrementAmount =
    toNumberOrUndefined(
      form.incrementAmount
    );

  const maximumAmount =
    toNumberOrUndefined(
      form.maximumAmount
    );

  const frequencyInterval =
    toNumberOrUndefined(
      form.frequencyInterval
    );

  const dayOfWeek =
    toNumberOrUndefined(
      form.dayOfWeek
    );

  const dayOfMonth =
    toNumberOrUndefined(
      form.dayOfMonth
    );

  const participantCount =
    toNumberOrUndefined(
      form.participantCount
    );

  const notificationDaysBefore =
    toNumberOrUndefined(
      form.notificationDaysBefore
    );

  const rewardValue =
    toNumberOrUndefined(
      form.rewardValue
    );

  const target = {
    targetAmount,
    amount:
      baseAmount ??
      0,
  };

  if (
    form.challengeType ===
    "percentage"
  ) {
    target.percentage =
      percentage;
  }

  if (
    form.challengeType ===
    "incremental"
  ) {
    target.startingAmount =
      startingAmount;

    target.incrementAmount =
      incrementAmount;

    if (
      maximumAmount !==
      undefined
    ) {
      target.maximumAmount =
        maximumAmount;
    }
  }

  if (
    form.challengeType !==
      "percentage" &&
    percentage !== undefined
  ) {
    target.percentage =
      percentage;
  }

  const frequency = {
    type:
      form.frequencyType,
    interval:
      frequencyInterval ??
      1,
  };

  if (
    form.dayOfWeek !== ""
  ) {
    frequency.dayOfWeek =
      dayOfWeek;
  }

  if (
    form.dayOfMonth !== ""
  ) {
    frequency.dayOfMonth =
      dayOfMonth;
  }

  const payload = {
    name:
      form.name.trim(),

    description:
      form.description.trim(),

    slug:
      form.slug.trim() ||
      undefined,

    challengeType:
      form.challengeType,

    difficulty:
      form.difficulty,

    visibility:
      form.visibility,

    currency:
      form.currency,

    target,

    frequency,

    startDate:
      form.startDate ||
      undefined,

    endDate:
      form.endDate ||
      undefined,

    participantCount:
      participantCount ?? 1,

    allowEarlyCompletion:
      Boolean(
        form.allowEarlyCompletion
      ),

    allowPartialContribution:
      Boolean(
        form.allowPartialContribution
      ),

    allowOverContribution:
      Boolean(
        form.allowOverContribution
      ),

    rolloverMissedContribution:
      Boolean(
        form.rolloverMissedContribution
      ),

    notifyBeforeDue:
      Boolean(
        form.notifyBeforeDue
      ),

    notificationDaysBefore:
      notificationDaysBefore ??
      1,

    autoSaveEnabled:
      Boolean(
        form.autoSaveEnabled
      ),

    reward: {
      enabled:
        Boolean(
          form.rewardEnabled
        ),

      type:
        form.rewardEnabled
          ? form.rewardType
          : "none",

      value:
        form.rewardEnabled
          ? rewardValue ?? 0
          : 0,

      description:
        form.rewardEnabled
          ? form.rewardDescription.trim() ||
            undefined
          : undefined,
    },
  };

  const savingPlan =
    getId(
      form.savingPlan
    );

  const savingAccount =
    getId(
      form.savingAccount
    );

  const autoSave =
    getId(
      form.autoSave
    );

  if (savingPlan) {
    payload.savingPlan =
      savingPlan;
  }

  if (savingAccount) {
    payload.savingAccount =
      savingAccount;
  }

  if (
    form.autoSaveEnabled &&
    autoSave
  ) {
    payload.autoSave =
      autoSave;
  }

  return payload;
};

/* =========================================================
   VALIDATION ERROR NORMALIZER
========================================================= */

const getValidationErrors = (
  validationResult
) => {
  if (
    validationResult === true
  ) {
    return {};
  }

  if (
    !validationResult ||
    typeof validationResult !==
      "object"
  ) {
    return {};
  }

  if (
    validationResult.valid ===
    true
  ) {
    return {};
  }

  if (
    validationResult.valid ===
    false
  ) {
    return validationResult.errors &&
      typeof validationResult.errors ===
        "object"
      ? validationResult.errors
      : {
          form:
            "Please check the challenge information.",
        };
  }

  if (
    validationResult.errors &&
    typeof validationResult.errors ===
      "object"
  ) {
    return validationResult.errors;
  }

  return validationResult;
};

/* =========================================================
   FIELD ERROR
========================================================= */

const FieldError = ({
  id,
  message,
}) => {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="
        mt-1.5
        text-xs text-red-600
      "
      role="alert"
    >
      {message}
    </p>
  );
};

/* =========================================================
   INPUT CLASS
========================================================= */

const getInputClass = (
  hasError = false
) =>
  `w-full rounded-xl border px-3.5 py-2.5
   text-sm text-slate-900 outline-none transition
   placeholder:text-slate-400
   disabled:cursor-not-allowed disabled:bg-slate-50
   focus:ring-2
   ${
     hasError
       ? "border-red-300 focus:border-red-500 focus:ring-red-100"
       : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
   }`;

/* =========================================================
   COMPONENT
========================================================= */

const CreateChallengeModal = ({
  open = false,
  onClose,
  onSubmit,
  creating = false,
  error = null,

  savingPlans = [],
  savingAccounts = [],
  autoSaves = [],

  initialValues = {},
}) => {
  const [
    form,
    setForm,
  ] = useState(() =>
    createInitialForm(
      initialValues
    )
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const challengeTypeOptions =
    normalizeOptions(
      CHALLENGE_TYPES
    );

  const difficultyOptions =
    normalizeOptions(
      CHALLENGE_DIFFICULTIES
    );

  const today =
    getTodayDateInputValue();

  const tomorrow =
    getTomorrowDateInputValue();

  const isIncremental =
    form.challengeType ===
    "incremental";

  const isPercentage =
    form.challengeType ===
    "percentage";

  const isCustomFrequency =
    form.frequencyType ===
    "custom";

  const isWeeklyFrequency =
    form.frequencyType ===
      "weekly" ||
    form.frequencyType ===
      "biweekly";

  const isMonthlyFrequency =
    form.frequencyType ===
    "monthly";

  /* =======================================================
     CLEAR FIELD ERROR
  ======================================================= */

  const clearFieldError =
    useCallback(
      (fieldName) => {
        setErrors(
          (previous) => {
            if (
              !previous[fieldName]
            ) {
              return previous;
            }

            const next = {
              ...previous,
            };

            delete next[fieldName];

            return next;
          }
        );
      },
      []
    );

  /* =======================================================
     CHANGE HANDLER
  ======================================================= */

  const handleChange =
    useCallback(
      (event) => {
        const {
          name,
          value,
          type,
          checked,
        } = event.target;

        const nextValue =
          type === "checkbox"
            ? checked
            : value;

        setForm(
          (previous) => ({
            ...previous,
            [name]:
              nextValue,
          })
        );

        clearFieldError(
          name
        );

        setSubmitError("");
      },
      [
        clearFieldError,
      ]
    );

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose =
    useCallback(() => {
      if (creating) {
        return;
      }

      setErrors({});
      setSubmitError("");

      setForm(
        createInitialForm(
          initialValues
        )
      );

      onClose?.();
    }, [
      creating,
      initialValues,
      onClose,
    ]);

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropClick =
    useCallback(
      (event) => {
        if (creating) {
          return;
        }

        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        handleClose();
      },
      [
        creating,
        handleClose,
      ]
    );

  const handleModalClick =
    useCallback(
      (event) => {
        event.stopPropagation();
      },
      []
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm =
    useCallback(
      (payload) => {
        try {
          const result =
            validateSavingsChallenge(
              payload
            );

          return getValidationErrors(
            result
          );
        } catch (validationError) {
          console.error(
            "[CreateChallengeModal] Validation failed:",
            validationError
          );

          return {
            form:
              "Unable to validate the challenge. Please check your information.",
          };
        }
      },
      []
    );

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (creating) {
          return;
        }

        if (
          typeof onSubmit !==
          "function"
        ) {
          setSubmitError(
            "Challenge creation is not available right now."
          );

          return;
        }

        setSubmitError("");

        const payload =
          buildChallengePayload(
            form
          );

        const validationErrors =
          validateForm(
            payload
          );

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

        try {
          await onSubmit(
            payload
          );

          setForm(
            createInitialForm(
              initialValues
            )
          );

          setErrors({});
          setSubmitError("");
        } catch (submitErrorValue) {
          console.error(
            "[CreateChallengeModal] Failed to submit challenge:",
            submitErrorValue
          );

          const backendMessage =
            submitErrorValue
              ?.response
              ?.data
              ?.message ??
            submitErrorValue
              ?.response
              ?.data
              ?.error ??
            submitErrorValue?.message ??
            "Unable to create the savings challenge. Please try again.";

          setSubmitError(
            backendMessage
          );
        }
      },
      [
        creating,
        form,
        initialValues,
        onSubmit,
        validateForm,
      ]
    );

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
            "Escape" &&
          !creating
        ) {
          handleClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    creating,
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

  const visibleError =
    submitError ||
    (typeof error ===
    "string"
      ? error
      : error?.message || "");

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        p-4
        bg-black/50
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-challenge-title"
      onClick={
        handleBackdropClick
      }
    >
      <div
        className="
          relative flex flex-col overflow-hidden
          w-full max-w-4xl max-h-[94vh]
          bg-white
          rounded-2xl
          shadow-2xl
        "
        onClick={
          handleModalClick
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex items-center justify-between
            px-5 sm:px-6 py-4
            border-b border-slate-200
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
                flex items-center justify-center
                h-10 w-10
                text-blue-600
                bg-blue-50
                rounded-xl
                shrink-0
              "
            >
              <Trophy
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
                id="create-challenge-title"
                className="
                  text-base text-slate-900 font-semibold
                "
              >
                Create Savings Challenge
              </h2>

              <p
                className="
                  mt-0.5
                  text-sm text-slate-500
                "
              >
                Configure the complete savings
                challenge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            className="
              p-2
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              transition disabled:opacity-50
              disabled:cursor-not-allowed
              shrink-0
            "
            aria-label="Close modal"
          >
            <X
              size={20}
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
            flex flex-1 flex-col
            min-h-0
          "
        >
          <div
            className="
              flex-1 overflow-y-auto
              px-5 sm:px-6 py-5
            "
          >
            {visibleError ? (
              <div
                className="
                  flex items-start
                  mb-5 px-4 py-3
                  text-sm text-red-700
                  bg-red-50
                  rounded-xl border border-red-200
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
                  {visibleError}
                </span>
              </div>
            ) : null}

            {errors.form ? (
              <div
                className="
                  mb-5 px-4 py-3
                  text-xs text-red-600
                  bg-red-50
                  rounded-xl border border-red-200
                "
                role="alert"
              >
                {errors.form}
              </div>
            ) : null}

            <div
              className="
                space-y-8
              "
            >

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Basic information
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Define the identity, classification and
                    visibility of the challenge.
                  </p>
                </div>

                <div
                  className="
                    space-y-4
                  "
                >

                  {/* NAME */}

                  <div>
                    <label
                      htmlFor="challenge-name"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Challenge name
                    </label>

                    <input
                      id="challenge-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      disabled={creating}
                      maxLength={
                        MAX_NAME_LENGTH
                      }
                      placeholder="e.g. Emergency Fund Challenge"
                      autoComplete="off"
                      className={getInputClass(
                        errors.name
                      )}
                      aria-invalid={Boolean(
                        errors.name
                      )}
                    />

                    <FieldError
                      id="challenge-name-error"
                      message={errors.name}
                    />
                  </div>

                  {/* SLUG */}

                  <div>
                    <label
                      htmlFor="challenge-slug"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Slug
                      <span
                        className="
                          ml-1
                          font-normal text-slate-400
                        "
                      >
                        optional
                      </span>
                    </label>

                    <input
                      id="challenge-slug"
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={handleChange}
                      disabled={creating}
                      maxLength={
                        MAX_SLUG_LENGTH
                      }
                      placeholder="emergency-fund-challenge"
                      autoComplete="off"
                      className={getInputClass(
                        errors.slug
                      )}
                    />

                    <FieldError
                      id="challenge-slug-error"
                      message={errors.slug}
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label
                      htmlFor="challenge-description"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Description
                    </label>

                    <textarea
                      id="challenge-description"
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      rows={3}
                      maxLength={
                        MAX_DESCRIPTION_LENGTH
                      }
                      placeholder="Describe what this challenge is designed to achieve."
                      className={getInputClass(
                        errors.description
                      )}
                    />

                    <div
                      className="
                        flex justify-end
                        mt-1
                      "
                    >
                      <span
                        className="
                          text-[11px] text-slate-400
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

                    <FieldError
                      id="challenge-description-error"
                      message={
                        errors.description
                      }
                    />
                  </div>

                  {/* TYPE / DIFFICULTY */}

                  <div
                    className="
                      grid grid-cols-1 sm:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        htmlFor="challenge-type"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Challenge type
                      </label>

                      <select
                        id="challenge-type"
                        name="challengeType"
                        value={
                          form.challengeType
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.challengeType
                        )}
                      >
                        {challengeTypeOptions.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>

                      <FieldError
                        id="challenge-type-error"
                        message={
                          errors.challengeType
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="challenge-difficulty"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Difficulty
                      </label>

                      <select
                        id="challenge-difficulty"
                        name="difficulty"
                        value={
                          form.difficulty
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.difficulty
                        )}
                      >
                        {difficultyOptions.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* CURRENCY / VISIBILITY */}

                  <div
                    className="
                      grid grid-cols-1 sm:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <label
                        htmlFor="challenge-currency"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Currency
                      </label>

                      <select
                        id="challenge-currency"
                        name="currency"
                        value={
                          form.currency
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.currency
                        )}
                      >
                        {CURRENCIES.map(
                          (currency) => (
                            <option
                              key={
                                currency.value
                              }
                              value={
                                currency.value
                              }
                            >
                              {currency.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="challenge-visibility"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Visibility
                      </label>

                      <select
                        id="challenge-visibility"
                        name="visibility"
                        value={
                          form.visibility
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.visibility
                        )}
                      >
                        {VISIBILITY_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TARGET
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      flex items-center
                      text-sm text-slate-900 font-semibold
                      gap-2
                    "
                  >
                    <Target
                      size={17}
                      className="
                        text-blue-600
                      "
                      /
                    >
                    Target configuration
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    These values map directly to the backend
                    <code
                      className="
                        mx-1
                      "
                    >
                      target
                    </code>
                    object.
                  </p>
                </div>

                <div
                  className="
                    space-y-4
                  "
                >

                  {/* TOTAL TARGET */}

                  <div>
                    <label
                      htmlFor="challenge-target-amount"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Total target amount
                    </label>

                    <input
                      id="challenge-target-amount"
                      name="targetAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={
                        form.targetAmount
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      placeholder="e.g. 100000"
                      className={getInputClass(
                        errors.targetAmount
                      )}
                    />

                    <FieldError
                      id="challenge-target-amount-error"
                      message={
                        errors.targetAmount
                      }
                    />
                  </div>

                  {/* BASE AMOUNT */}

                  <div>
                    <label
                      htmlFor="challenge-base-amount"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Base target amount
                      <span
                        className="
                          ml-1
                          font-normal text-slate-400
                        "
                      >
                        optional
                      </span>
                    </label>

                    <input
                      id="challenge-base-amount"
                      name="targetAmountBase"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={
                        form.targetAmountBase
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      placeholder="0.00"
                      className={getInputClass(
                        errors.targetAmountBase
                      )}
                    />

                    <FieldError
                      id="challenge-base-amount-error"
                      message={
                        errors.targetAmountBase
                      }
                    />
                  </div>

                  {/* PERCENTAGE */}

                  <div>
                    <label
                      htmlFor="challenge-percentage"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Target percentage
                      <span
                        className="
                          ml-1
                          font-normal text-slate-400
                        "
                      >
                        {isPercentage
                          ? "required"
                          : "optional"}
                      </span>
                    </label>

                    <div
                      className="
                        relative
                      "
                    >
                      <input
                        id="challenge-percentage"
                        name="targetPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={
                          form.targetPercentage
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        placeholder="0"
                        className={`${getInputClass(
                          errors.targetPercentage
                        )} pr-10`}
                      />

                      <span
                        className="
                          absolute right-3 top-1/2
                          text-sm text-slate-400
                          -translate-y-1/2
                        "
                      >
                        %
                      </span>
                    </div>

                    <FieldError
                      id="challenge-percentage-error"
                      message={
                        errors.targetPercentage
                      }
                    />
                  </div>

                  {/* INCREMENTAL */}

                  {isIncremental ? (
                    <div
                      className="
                        grid grid-cols-1 sm:grid-cols-3
                        p-4
                        bg-blue-50/50
                        rounded-xl border border-blue-100
                        gap-4
                      "
                    >
                      <div>
                        <label
                          htmlFor="challenge-starting-amount"
                          className="
                            block
                            mb-1.5
                            text-xs text-slate-700 font-medium
                          "
                        >
                          Starting amount
                        </label>

                        <input
                          id="challenge-starting-amount"
                          name="startingAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.startingAmount
                          }
                          onChange={
                            handleChange
                          }
                          disabled={creating}
                          placeholder="0.00"
                          className={getInputClass(
                            errors.startingAmount
                          )}
                        />

                        <FieldError
                          id="challenge-starting-amount-error"
                          message={
                            errors.startingAmount
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="challenge-increment-amount"
                          className="
                            block
                            mb-1.5
                            text-xs text-slate-700 font-medium
                          "
                        >
                          Increment amount
                        </label>

                        <input
                          id="challenge-increment-amount"
                          name="incrementAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.incrementAmount
                          }
                          onChange={
                            handleChange
                          }
                          disabled={creating}
                          placeholder="0.00"
                          className={getInputClass(
                            errors.incrementAmount
                          )}
                        />

                        <FieldError
                          id="challenge-increment-amount-error"
                          message={
                            errors.incrementAmount
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="challenge-maximum-amount"
                          className="
                            block
                            mb-1.5
                            text-xs text-slate-700 font-medium
                          "
                        >
                          Maximum amount
                        </label>

                        <input
                          id="challenge-maximum-amount"
                          name="maximumAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.maximumAmount
                          }
                          onChange={
                            handleChange
                          }
                          disabled={creating}
                          placeholder="Optional"
                          className={getInputClass(
                            errors.maximumAmount
                          )}
                        />

                        <FieldError
                          id="challenge-maximum-amount-error"
                          message={
                            errors.maximumAmount
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              {/* =================================================
                  FREQUENCY
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Frequency configuration
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Maps directly to the backend
                    <code
                      className="
                        mx-1
                      "
                    >
                      frequency
                    </code>
                    schema.
                  </p>
                </div>

                <div
                  className="
                    grid grid-cols-1 sm:grid-cols-2
                    gap-4
                  "
                >
                  <div>
                    <label
                      htmlFor="challenge-frequency-type"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Frequency type
                    </label>

                    <select
                      id="challenge-frequency-type"
                      name="frequencyType"
                      value={
                        form.frequencyType
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className={getInputClass(
                        errors.frequency
                      )}
                    >
                      {FREQUENCIES.map(
                        (frequency) => (
                          <option
                            key={
                              frequency.value
                            }
                            value={
                              frequency.value
                            }
                          >
                            {
                              frequency.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="challenge-frequency-interval"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Interval
                    </label>

                    <input
                      id="challenge-frequency-interval"
                      name="frequencyInterval"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        form.frequencyInterval
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className={getInputClass(
                        errors.frequencyInterval
                      )}
                    />
                  </div>

                  {(isWeeklyFrequency ||
                    isCustomFrequency) && (
                    <div>
                      <label
                        htmlFor="challenge-day-of-week"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Day of week
                      </label>

                      <select
                        id="challenge-day-of-week"
                        name="dayOfWeek"
                        value={
                          form.dayOfWeek
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.dayOfWeek
                        )}
                      >
                        <option value="">
                          Select day
                        </option>

                        {DAY_OF_WEEK_OPTIONS.map(
                          (day) => (
                            <option
                              key={
                                day.value
                              }
                              value={
                                day.value
                              }
                            >
                              {day.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {(isMonthlyFrequency ||
                    isCustomFrequency) && (
                    <div>
                      <label
                        htmlFor="challenge-day-of-month"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Day of month
                      </label>

                      <input
                        id="challenge-day-of-month"
                        name="dayOfMonth"
                        type="number"
                        min="1"
                        max="31"
                        step="1"
                        value={
                          form.dayOfMonth
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        placeholder="1 - 31"
                        className={getInputClass(
                          errors.dayOfMonth
                        )}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  DATES
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Challenge duration
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Duration days are calculated by the backend.
                  </p>
                </div>

                <div
                  className="
                    grid grid-cols-1 sm:grid-cols-2
                    gap-4
                  "
                >
                  <div>
                    <label
                      htmlFor="challenge-start-date"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Start date
                    </label>

                    <div
                      className="
                        relative
                      "
                    >
                      <CalendarDays
                        size={18}
                        className="
                          absolute left-3 top-1/2
                          text-slate-400
                          -translate-y-1/2
                        "
                        /
                      >

                      <input
                        id="challenge-start-date"
                        name="startDate"
                        type="date"
                        min={today}
                        value={
                          form.startDate
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={`${getInputClass(
                          errors.startDate
                        )} pl-10`}
                      />
                    </div>

                    <FieldError
                      id="challenge-start-date-error"
                      message={
                        errors.startDate
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="challenge-end-date"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      End date
                    </label>

                    <div
                      className="
                        relative
                      "
                    >
                      <CalendarDays
                        size={18}
                        className="
                          absolute left-3 top-1/2
                          text-slate-400
                          -translate-y-1/2
                        "
                        /
                      >

                      <input
                        id="challenge-end-date"
                        name="endDate"
                        type="date"
                        min={
                          form.startDate ||
                          tomorrow
                        }
                        value={
                          form.endDate
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={`${getInputClass(
                          errors.endDate
                        )} pl-10`}
                      />
                    </div>

                    <FieldError
                      id="challenge-end-date-error"
                      message={
                        errors.endDate
                      }
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  SAVING CONNECTIONS
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    SmartSave connections
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Connect this challenge to existing SmartSave
                    resources.
                  </p>
                </div>

                <div
                  className="
                    grid grid-cols-1 sm:grid-cols-2
                    gap-4
                  "
                >
                  {/* PLAN */}

                  <div>
                    <label
                      htmlFor="challenge-plan"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Saving plan
                    </label>

                    <select
                      id="challenge-plan"
                      name="savingPlan"
                      value={
                        form.savingPlan
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className={getInputClass(
                        errors.savingPlan
                      )}
                    >
                      <option value="">
                        No saving plan
                      </option>

                      {Array.isArray(
                        savingPlans
                      )
                        ? savingPlans.map(
                            (plan) => {
                              const id =
                                getId(
                                  plan
                                );

                              if (!id) {
                                return null;
                              }

                              return (
                                <option
                                  key={id}
                                  value={id}
                                >
                                  {plan?.name ||
                                    plan?.title ||
                                    `Plan ${id}`}
                                </option>
                              );
                            }
                          )
                        : null}
                    </select>

                    <FieldError
                      id="challenge-plan-error"
                      message={
                        errors.savingPlan
                      }
                    />
                  </div>

                  {/* ACCOUNT */}

                  <div>
                    <label
                      htmlFor="challenge-account"
                      className="
                        block
                        mb-1.5
                        text-sm text-slate-700 font-medium
                      "
                    >
                      Saving account
                    </label>

                    <select
                      id="challenge-account"
                      name="savingAccount"
                      value={
                        form.savingAccount
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className={getInputClass(
                        errors.savingAccount
                      )}
                    >
                      <option value="">
                        No saving account
                      </option>

                      {Array.isArray(
                        savingAccounts
                      )
                        ? savingAccounts.map(
                            (account) => {
                              const id =
                                getId(
                                  account
                                );

                              if (!id) {
                                return null;
                              }

                              return (
                                <option
                                  key={id}
                                  value={id}
                                >
                                  {account?.name ||
                                    account?.title ||
                                    `Account ${id}`}
                                </option>
                              );
                            }
                          )
                        : null}
                    </select>

                    <FieldError
                      id="challenge-account-error"
                      message={
                        errors.savingAccount
                      }
                    />
                  </div>
                </div>

                {/* AUTOSAVE */}

                <div
                  className="
                    mt-4 p-4
                    rounded-xl border border-slate-200
                  "
                >
                  <label
                    className="
                      flex items-start
                      cursor-pointer
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      name="autoSaveEnabled"
                      checked={
                        form.autoSaveEnabled
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className="
                        h-4 w-4
                        mt-0.5
                        text-blue-600
                        rounded border-slate-300 focus:ring-blue-500
                      "
                      /
                    >

                    <span>
                      <span
                        className="
                          block
                          text-sm text-slate-800 font-medium
                        "
                      >
                        Enable AutoSave
                      </span>

                      <span
                        className="
                          block
                          mt-0.5
                          text-xs text-slate-500
                        "
                      >
                        Automatically connect the challenge to
                        an existing AutoSave configuration.
                      </span>
                    </span>
                  </label>

                  {form.autoSaveEnabled ? (
                    <div
                      className="
                        mt-4
                      "
                    >
                      <label
                        htmlFor="challenge-autosave"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        AutoSave configuration
                      </label>

                      <select
                        id="challenge-autosave"
                        name="autoSave"
                        value={
                          form.autoSave
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.autoSave
                        )}
                      >
                        <option value="">
                          Select AutoSave
                        </option>

                        {Array.isArray(
                          autoSaves
                        )
                          ? autoSaves.map(
                              (autoSave) => {
                                const id =
                                  getId(
                                    autoSave
                                  );

                                if (!id) {
                                  return null;
                                }

                                return (
                                  <option
                                    key={id}
                                    value={id}
                                  >
                                    {autoSave?.name ||
                                      autoSave?.title ||
                                      `AutoSave ${id}`}
                                  </option>
                                );
                              }
                            )
                          : null}
                      </select>

                      <FieldError
                        id="challenge-autosave-error"
                        message={
                          errors.autoSave
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              {/* =================================================
                  PARTICIPATION
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Participation
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Configure the number of participants associated
                    with the challenge.
                  </p>
                </div>

                <div
                  className="
                    max-w-xs
                  "
                >
                  <label
                    htmlFor="challenge-participants"
                    className="
                      block
                      mb-1.5
                      text-sm text-slate-700 font-medium
                    "
                  >
                    Participant count
                  </label>

                  <input
                    id="challenge-participants"
                    name="participantCount"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      form.participantCount
                    }
                    onChange={
                      handleChange
                    }
                    disabled={creating}
                    className={getInputClass(
                      errors.participantCount
                    )}
                  />

                  <FieldError
                    id="challenge-participants-error"
                    message={
                      errors.participantCount
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  RULES
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      flex items-center
                      text-sm text-slate-900 font-semibold
                      gap-2
                    "
                  >
                    <Settings2
                      size={17}
                      className="
                        text-blue-600
                      "
                      /
                    >
                    Challenge rules
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    These values control challenge behaviour.
                  </p>
                </div>

                <div
                  className="
                    grid grid-cols-1 sm:grid-cols-2
                    gap-3
                  "
                >
                  {[
                    [
                      "allowEarlyCompletion",
                      "Allow early completion",
                      "Allow the challenge to be completed before the end date.",
                    ],
                    [
                      "allowPartialContribution",
                      "Allow partial contributions",
                      "Permit contributions below the expected period amount.",
                    ],
                    [
                      "allowOverContribution",
                      "Allow over-contribution",
                      "Allow contributions above the target amount.",
                    ],
                    [
                      "rolloverMissedContribution",
                      "Rollover missed contribution",
                      "Carry missed contribution requirements into a later period.",
                    ],
                  ].map(
                    ([
                      field,
                      title,
                      description,
                    ]) => (
                      <label
                        key={field}
                        className="
                          flex items-start
                          p-4
                          rounded-xl
                          border border-slate-200 hover:border-slate-300
                          transition
                          cursor-pointer
                          gap-3
                        "
                      >
                        <input
                          type="checkbox"
                          name={field}
                          checked={Boolean(
                            form[field]
                          )}
                          onChange={
                            handleChange
                          }
                          disabled={creating}
                          className="
                            h-4 w-4
                            mt-0.5
                            text-blue-600
                            rounded border-slate-300 focus:ring-blue-500
                          "
                          /
                        >

                        <span>
                          <span
                            className="
                              block
                              text-sm text-slate-800 font-medium
                            "
                          >
                            {title}
                          </span>

                          <span
                            className="
                              block
                              mt-1
                              text-xs text-slate-500 leading-5
                            "
                          >
                            {description}
                          </span>
                        </span>
                      </label>
                    )
                  )}
                </div>
              </section>

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Configure reminders before challenge periods
                    are due.
                  </p>
                </div>

                <div
                  className="
                    p-4
                    rounded-xl border border-slate-200
                  "
                >
                  <label
                    className="
                      flex items-start
                      cursor-pointer
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      name="notifyBeforeDue"
                      checked={
                        form.notifyBeforeDue
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className="
                        h-4 w-4
                        mt-0.5
                        text-blue-600
                        rounded border-slate-300 focus:ring-blue-500
                      "
                      /
                    >

                    <span>
                      <span
                        className="
                          block
                          text-sm text-slate-800 font-medium
                        "
                      >
                        Notify before due date
                      </span>

                      <span
                        className="
                          block
                          mt-0.5
                          text-xs text-slate-500
                        "
                      >
                        Send a reminder before the expected
                        contribution.
                      </span>
                    </span>
                  </label>

                  {form.notifyBeforeDue ? (
                    <div
                      className="
                        max-w-xs
                        mt-4
                      "
                    >
                      <label
                        htmlFor="challenge-notification-days"
                        className="
                          block
                          mb-1.5
                          text-sm text-slate-700 font-medium
                        "
                      >
                        Days before due
                      </label>

                      <input
                        id="challenge-notification-days"
                        name="notificationDaysBefore"
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={
                          form.notificationDaysBefore
                        }
                        onChange={
                          handleChange
                        }
                        disabled={creating}
                        className={getInputClass(
                          errors.notificationDaysBefore
                        )}
                      />

                      <FieldError
                        id="challenge-notification-days-error"
                        message={
                          errors.notificationDaysBefore
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              {/* =================================================
                  REWARD
              ================================================= */}

              <section>
                <div
                  className="
                    mb-4
                  "
                >
                  <h3
                    className="
                      text-sm text-slate-900 font-semibold
                    "
                  >
                    Reward configuration
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs text-slate-500
                    "
                  >
                    Configure the reward attached to successful
                    completion.
                  </p>
                </div>

                <div
                  className="
                    p-4
                    rounded-xl border border-slate-200
                  "
                >
                  <label
                    className="
                      flex items-start
                      cursor-pointer
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      name="rewardEnabled"
                      checked={
                        form.rewardEnabled
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className="
                        h-4 w-4
                        mt-0.5
                        text-blue-600
                        rounded border-slate-300 focus:ring-blue-500
                      "
                      /
                    >

                    <span>
                      <span
                        className="
                          block
                          text-sm text-slate-800 font-medium
                        "
                      >
                        Enable completion reward
                      </span>

                      <span
                        className="
                          block
                          mt-0.5
                          text-xs text-slate-500
                        "
                      >
                        Attach a badge, points, cashback or
                        interest bonus.
                      </span>
                    </span>
                  </label>

                  {form.rewardEnabled ? (
                    <div
                      className="
                        mt-4 space-y-4
                      "
                    >
                      <div
                        className="
                          grid grid-cols-1 sm:grid-cols-2
                          gap-4
                        "
                      >
                        <div>
                          <label
                            htmlFor="challenge-reward-type"
                            className="
                              block
                              mb-1.5
                              text-sm text-slate-700 font-medium
                            "
                          >
                            Reward type
                          </label>

                          <select
                            id="challenge-reward-type"
                            name="rewardType"
                            value={
                              form.rewardType
                            }
                            onChange={
                              handleChange
                            }
                            disabled={creating}
                            className={getInputClass(
                              errors.rewardType
                            )}
                          >
                            {REWARD_TYPES.map(
                              (reward) => (
                                <option
                                  key={
                                    reward.value
                                  }
                                  value={
                                    reward.value
                                  }
                                >
                                  {
                                    reward.label
                                  }
                                </option>
                              )
                            )}
                          </select>
                          <FieldError
                            id="challenge-reward-type-error"
                            message={
                              errors.rewardType
                            }
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="challenge-reward-value"
                            className="
                              block
                              mb-1.5
                              text-sm text-slate-700 font-medium
                            "
                          >
                            Reward value
                          </label>

                          <input
                            id="challenge-reward-value"
                            name="rewardValue"
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              form.rewardValue
                            }
                            onChange={
                              handleChange
                            }
                            disabled={creating}
                            placeholder="0"
                            className={getInputClass(
                              errors.rewardValue
                            )}
                          />

                          <FieldError
                            id="challenge-reward-value-error"
                            message={
                              errors.rewardValue
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="challenge-reward-description"
                          className="
                            block
                            mb-1.5
                            text-sm text-slate-700 font-medium
                          "
                        >
                          Reward description
                        </label>

                        <textarea
                          id="challenge-reward-description"
                          name="rewardDescription"
                          value={
                            form.rewardDescription
                          }
                          onChange={
                            handleChange
                          }
                          disabled={creating}
                          rows={2}
                          maxLength={
                            MAX_REWARD_DESCRIPTION_LENGTH
                          }
                          placeholder="Describe the reward."
                          className={getInputClass(
                            errors.rewardDescription
                          )}
                        />

                        <div
                          className="
                            flex justify-end
                            mt-1
                          "
                        >
                          <span
                            className="
                              text-[11px] text-slate-400
                            "
                          >
                            {
                              form.rewardDescription
                                .length
                            }
                            /
                            {
                              MAX_REWARD_DESCRIPTION_LENGTH
                            }
                          </span>
                        </div>

                        <FieldError
                          id="challenge-reward-description-error"
                          message={
                            errors.rewardDescription
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              px-5 sm:px-6 py-4
              bg-slate-50
              border-t border-slate-200
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="
                inline-flex items-center justify-center
                px-4 py-2.5
                text-sm text-slate-700 font-medium
                bg-white hover:bg-slate-100
                rounded-xl border border-slate-200 focus:outline-none
                focus:ring-2 focus:ring-blue-500
                transition disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="
                inline-flex items-center justify-center
                px-5 py-2.5
                text-sm text-white font-semibold
                bg-slate-900 hover:bg-slate-800
                rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500
                shadow-sm transition disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
                    aria-hidden="true"
                  /
                  >
                  Creating...
                </>
              ) : (
                <>
                  <Check
                    size={17}
                    aria-hidden="true"
                  />
                  Create Challenge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;