import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_TYPES,
} from "../../../../constants/smartSaveConstants";

import {
  validateSavingsChallenge,
} from "../../../../utils/smartSave/savingsValidators";

/* ============================================================================
   CONSTANTS
============================================================================ */

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

const CURRENCY_OPTIONS = [
  {
    value: "NGN",
    label: "NGN — Nigerian Naira",
    symbol: "₦",
  },
  {
    value: "USD",
    label: "USD — US Dollar",
    symbol: "$",
  },
  {
    value: "GBP",
    label: "GBP — British Pound",
    symbol: "£",
  },
  {
    value: "EUR",
    label: "EUR — Euro",
    symbol: "€",
  },
];

const FREQUENCY_OPTIONS = [
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

const DAY_OF_WEEK_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const DAY_OF_MONTH_OPTIONS = Array.from(
  { length: 31 },
  (_, index) => ({
    value: String(index + 1),
    label: String(index + 1),
  })
);

const DEFAULT_FORM = {
  name: "",
  description: "",

  challengeType: "fixed_amount",
  difficulty: "beginner",
  currency: "NGN",

  targetAmount: "",

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

  allowEarlyCompletion: true,
  allowPartialContribution: true,

  notifyBeforeDue: true,
  notificationDaysBefore: "1",
};

/* ============================================================================
   NORMALIZATION
============================================================================ */

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeId = (value) => {
  if (value == null) {
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

const normalizeEnum = (value, fallback = "") =>
  String(value ?? fallback)
    .trim()
    .toLowerCase();

const formatEnumLabel = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(
      /\b\w/g,
      (character) => character.toUpperCase()
    );

const normalizeOptions = (source) => {
  if (Array.isArray(source)) {
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

          if (!value) {
            return null;
          }

          return {
            value: String(value)
              .trim()
              .toLowerCase(),
            label:
              option.label ??
              option.name ??
              option.title ??
              formatEnumLabel(value),
          };
        }

        if (
          option == null ||
          option === ""
        ) {
          return null;
        }

        return {
          value: String(option)
            .trim()
            .toLowerCase(),
          label: formatEnumLabel(option),
        };
      })
      .filter(Boolean);
  }

  if (
    source &&
    typeof source === "object"
  ) {
    return Object.values(source)
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

          if (!value) {
            return null;
          }

          return {
            value: String(value)
              .trim()
              .toLowerCase(),
            label:
              option.label ??
              option.name ??
              option.title ??
              formatEnumLabel(value),
          };
        }

        if (
          option == null ||
          option === ""
        ) {
          return null;
        }

        return {
          value: String(option)
            .trim()
            .toLowerCase(),
          label: formatEnumLabel(option),
        };
      })
      .filter(Boolean);
  }

  return [];
};

const createForm = (values = {}) => ({
  ...DEFAULT_FORM,

  name:
    typeof values.name === "string"
      ? values.name
      : "",

  description:
    typeof values.description === "string"
      ? values.description
      : "",

  challengeType:
    normalizeEnum(
      values.challengeType,
      DEFAULT_FORM.challengeType
    ),

  difficulty:
    normalizeEnum(
      values.difficulty,
      DEFAULT_FORM.difficulty
    ),

  currency:
    String(
      values.currency ??
        DEFAULT_FORM.currency
    ).toUpperCase(),

  targetAmount:
    values.targetAmount ??
    values.target?.targetAmount ??
    "",

  frequencyType:
    values.frequencyType ??
    values.frequency?.type ??
    DEFAULT_FORM.frequencyType,

  frequencyInterval:
    values.frequencyInterval ??
    values.frequency?.interval ??
    DEFAULT_FORM.frequencyInterval,

  dayOfWeek:
    values.dayOfWeek ??
    values.frequency?.dayOfWeek ??
    "",

  dayOfMonth:
    values.dayOfMonth ??
    values.frequency?.dayOfMonth ??
    "",

  startDate:
    values.startDate ?? "",

  endDate:
    values.endDate ?? "",

  savingPlan:
    normalizeId(values.savingPlan),

  savingAccount:
    normalizeId(values.savingAccount),

  autoSaveEnabled:
    Boolean(values.autoSaveEnabled),

  autoSave:
    normalizeId(values.autoSave),

  allowEarlyCompletion:
    values.allowEarlyCompletion ??
    DEFAULT_FORM.allowEarlyCompletion,

  allowPartialContribution:
    values.allowPartialContribution ??
    DEFAULT_FORM.allowPartialContribution,

  notifyBeforeDue:
    values.notifyBeforeDue ??
    DEFAULT_FORM.notifyBeforeDue,

  notificationDaysBefore:
    values.notificationDaysBefore ??
    DEFAULT_FORM.notificationDaysBefore,
});

/* ============================================================================
   PAYLOAD CONTRACT
============================================================================ */

/**
 * Converts UI state into the canonical SavingsChallenge API payload.
 *
 * IMPORTANT:
 * This is the last transformation performed by the modal.
 *
 * The next architectural boundary is:
 *
 * CreateChallengeModal
 *        ↓
 * onSubmit(payload)
 *        ↓
 * useSavingsChallenges
 *        ↓
 * smartSaveService
 *        ↓
 * API
 */
const buildChallengePayload = (form) => {
  const challengeType = normalizeEnum(
    form.challengeType,
    "fixed_amount"
  );

  const difficulty = normalizeEnum(
    form.difficulty,
    "beginner"
  );

  const currency = String(
    form.currency || "NGN"
  ).toUpperCase();

  const frequencyType = normalizeEnum(
    form.frequencyType,
    "weekly"
  );

  const frequency = {
    type: frequencyType,
    interval: Math.max(
      1,
      Number(form.frequencyInterval) || 1
    ),
  };

  if (
    frequencyType === "weekly" ||
    frequencyType === "biweekly"
  ) {
    if (form.dayOfWeek !== "") {
      frequency.dayOfWeek =
        Number(form.dayOfWeek);
    }
  }

  if (frequencyType === "monthly") {
    if (form.dayOfMonth !== "") {
      frequency.dayOfMonth =
        Number(form.dayOfMonth);
    }
  }

  const payload = {
    name: normalizeString(form.name),

    description:
      normalizeString(form.description),

    challengeType,

    difficulty,

    currency,

    target: {
      targetAmount: Number(
        form.targetAmount
      ),
    },

    frequency,

    startDate:
      form.startDate || "",

    endDate:
      form.endDate || "",

    autoSaveEnabled:
      Boolean(form.autoSaveEnabled),

    allowEarlyCompletion:
      Boolean(form.allowEarlyCompletion),

    allowPartialContribution:
      Boolean(form.allowPartialContribution),

    notifyBeforeDue:
      Boolean(form.notifyBeforeDue),

    notificationDaysBefore: Math.min(
      30,
      Math.max(
        0,
        Number(
          form.notificationDaysBefore
        ) || 1
      )
    ),
  };

  const savingAccount =
    normalizeId(form.savingAccount);

  const savingPlan =
    normalizeId(form.savingPlan);

  const autoSave =
    normalizeId(form.autoSave);

  if (savingAccount) {
    payload.savingAccount =
      savingAccount;
  }

  if (savingPlan) {
    payload.savingPlan =
      savingPlan;
  }

  if (
    payload.autoSaveEnabled &&
    autoSave
  ) {
    payload.autoSave = autoSave;
  }

  return payload;
};

/* ============================================================================
   VALIDATION
============================================================================ */

const extractValidationErrors = (result) => {
  if (result === true) {
    return {};
  }

  if (
    !result ||
    typeof result !== "object"
  ) {
    return {
      form:
        "Please review the challenge information.",
    };
  }

  if (result.valid === true) {
    return {};
  }

  if (
    result.errors &&
    typeof result.errors === "object"
  ) {
    return result.errors;
  }

  return {
    form:
      "Please review the challenge information.",
  };
};

const getFieldError = (errors, ...keys) => {
  for (const key of keys) {
    const value = errors?.[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return "";
};

/* ============================================================================
   UI PRIMITIVES
============================================================================ */

const FieldLabel = ({
  htmlFor,
  children,
  required = false,
}) => (
  <label
    htmlFor={htmlFor}
    className="
      block
      mb-1.5
      font-medium text-slate-700 text-sm
    "
  >
    {children}

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
);

const FieldError = ({
  id,
  children,
}) => {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      className="
        mt-1.5
        text-red-600 text-xs leading-5
      "
      role="alert"
    >
      {children}
    </p>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => (
  <div
    className="
      flex items-start
      mb-4
      gap-3
    "
  >
    <div
      className="
        flex justify-center items-center
        w-9 h-9
        text-blue-600
        bg-blue-50
        rounded-xl
        shrink-0
      "
    >
      <Icon
        size={18}
        aria-hidden="true"
      />
    </div>

    <div>
      <h3
        className="
          font-semibold text-slate-900 text-sm
        "
      >
        {title}
      </h3>

      {description && (
        <p
          className="
            mt-0.5
            text-slate-500 text-xs leading-5
          "
        >
          {description}
        </p>
      )}
    </div>
  </div>
);

const SelectField = ({
  id,
  name,
  value,
  onChange,
  disabled,
  options,
  placeholder,
  error,
  describedBy,
}) => (
  <div
    className="
      relative
    "
  >
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={
        describedBy || undefined
      }
      className={[
        "appearance-none w-full",
        "px-3.5 py-2.5 pr-10",
        "bg-white text-slate-900 text-sm",
        "border rounded-xl outline-none",
        "disabled:bg-slate-50 disabled:text-slate-400",
        "focus:ring-2 transition",
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
      ].join(" ")}
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>

    <ChevronDown
      size={17}
      className="
        top-1/2 right-3 absolute
        text-slate-400
        pointer-events-none
        -translate-y-1/2
      "
      aria-hidden="true"
    /
    >
  </div>
);

const Toggle = ({
  id,
  name,
  checked,
  onChange,
  disabled,
  title,
  description,
}) => (
  <label
    htmlFor={id}
    className={[
      "flex items-start gap-3",
      "p-3.5 rounded-xl border",
      "cursor-pointer transition",
      checked
        ? "border-blue-200 bg-blue-50/50"
        : "border-slate-200 bg-white hover:bg-slate-50",
      disabled
        ? "opacity-60 cursor-not-allowed"
        : "",
    ].join(" ")}
  >
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="
        sr-only
      "
      /
    >

    <span
      aria-hidden="true"
      className={[
        "flex justify-center items-center mt-0.5",
        "w-5 h-5 rounded-full border shrink-0",
        checked
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-slate-300",
      ].join(" ")}
    >
      {checked && (
        <Check size={13} />
      )}
    </span>

    <span
      className="
        min-w-0
      "
    >
      <span
        className="
          block
          font-medium text-slate-800 text-sm
        "
      >
        {title}
      </span>

      {description && (
        <span
          className="
            block
            mt-0.5
            text-slate-500 text-xs leading-5
          "
        >
          {description}
        </span>
      )}
    </span>
  </label>
);

/* ============================================================================
   MAIN COMPONENT
============================================================================ */

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
  const titleId = useId();
  const nameErrorId = useId();
  const descriptionErrorId = useId();
  const targetErrorId = useId();
  const formErrorId = useId();

  const [form, setForm] = useState(() =>
    createForm(initialValues)
  );

  const [errors, setErrors] =
    useState({});

  const [submitError, setSubmitError] =
    useState("");

  /* --------------------------------------------------------------------------
     OPTIONS
  -------------------------------------------------------------------------- */

  const challengeTypeOptions = useMemo(
    () =>
      normalizeOptions(
        CHALLENGE_TYPES
      ),
    []
  );

  const difficultyOptions = useMemo(
    () =>
      normalizeOptions(
        CHALLENGE_DIFFICULTIES
      ),
    []
  );

  const plans = Array.isArray(
    savingPlans
  )
    ? savingPlans
    : [];

  const accounts = Array.isArray(
    savingAccounts
  )
    ? savingAccounts
    : [];

  const autoSaveRules = Array.isArray(
    autoSaves
  )
    ? autoSaves
    : [];

  const selectedCurrency =
    CURRENCY_OPTIONS.find(
      (option) =>
        option.value ===
        form.currency
    ) ??
    CURRENCY_OPTIONS[0];

  const selectedChallengeType =
    challengeTypeOptions.find(
      (option) =>
        option.value ===
        form.challengeType
    )?.label ??
    formatEnumLabel(
      form.challengeType
    );

  const selectedDifficulty =
    difficultyOptions.find(
      (option) =>
        option.value ===
        form.difficulty
    )?.label ??
    formatEnumLabel(
      form.difficulty
    );

  /* --------------------------------------------------------------------------
     FIELD UPDATE
  -------------------------------------------------------------------------- */

  const updateField = useCallback(
    (name, value) => {
      setForm((current) => ({
        ...current,

        [name]:
          name === "challengeType"
            ? normalizeEnum(value)
            : name === "difficulty"
              ? normalizeEnum(value)
              : name === "currency"
                ? String(
                    value
                  ).toUpperCase()
                : value,
      }));

      setErrors((current) => {
        const next = {
          ...current,
        };

        delete next[name];

        if (
          name === "targetAmount"
        ) {
          delete next[
            "target.targetAmount"
          ];
          delete next.target;
        }

        if (
          name === "frequencyType"
        ) {
          delete next[
            "frequency.type"
          ];
          delete next.frequency;
        }

        if (
          name === "frequencyInterval"
        ) {
          delete next[
            "frequency.interval"
          ];
        }

        if (
          name === "dayOfWeek"
        ) {
          delete next[
            "frequency.dayOfWeek"
          ];
        }

        if (
          name === "dayOfMonth"
        ) {
          delete next[
            "frequency.dayOfMonth"
          ];
        }

        delete next.form;

        return next;
      });

      setSubmitError("");
    },
    []
  );

  const handleChange = useCallback(
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      updateField(
        name,
        type === "checkbox"
          ? checked
          : value
      );
    },
    [updateField]
  );

  /* --------------------------------------------------------------------------
     CLOSE
  -------------------------------------------------------------------------- */

  const handleClose = useCallback(() => {
    if (creating) {
      return;
    }

    setForm(createForm());
    setErrors({});
    setSubmitError("");

    onClose?.();
  }, [creating, onClose]);

  const handleBackdropClick =
    useCallback(
      (event) => {
        if (
          event.target !==
            event.currentTarget ||
          creating
        ) {
          return;
        }

        handleClose();
      },
      [creating, handleClose]
    );

  /* --------------------------------------------------------------------------
     VALIDATION
  -------------------------------------------------------------------------- */

  const validateForm = useCallback(
    (payload) => {
      try {
        return extractValidationErrors(
          validateSavingsChallenge(
            payload
          )
        );
      } catch (validationError) {
        if (import.meta.env.DEV) {
          console.error(
            "[CreateChallengeModal] Validation failed:",
            validationError
          );
        }

        return {
          form:
            "Unable to validate this challenge. Please review the information and try again.",
        };
      }
    },
    []
  );

  /* --------------------------------------------------------------------------
     SUBMIT
  -------------------------------------------------------------------------- */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (creating) {
        return;
      }

      if (
        typeof onSubmit !== "function"
      ) {
        setSubmitError(
          "Challenge creation is currently unavailable."
        );
        return;
      }

      setSubmitError("");

      const payload =
        buildChallengePayload(form);

      /*
       * Development-only boundary inspection.
       *
       * This confirms exactly what leaves the modal.
       * In particular:
       *
       * payload.name
       *
       * must contain the user's challenge name.
       */
      if (import.meta.env.DEV) {
        console.debug(
          "[CreateChallengeModal] submitting challenge payload:",
          payload
        );
      }

      const validationErrors =
        validateForm(payload);

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

      setErrors({});

      try {
        /*
         * IMPORTANT:
         *
         * The modal does not transform the payload again.
         * What reaches onSubmit is the canonical payload.
         */
        const result = await onSubmit(
          payload
        );

        /*
         * If the mutation layer uses:
         *
         * { success: false }
         *
         * instead of throwing, treat that as a failure.
         *
         * This protects the modal from resetting after a
         * failed mutation.
         */
        if (
          result &&
          typeof result === "object" &&
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to create the savings challenge."
          );
        }

        /*
         * Reset only after the mutation promise resolves
         * successfully.
         */
        setForm(createForm());
        setErrors({});
        setSubmitError("");
      } catch (submitErrorValue) {
        if (import.meta.env.DEV) {
          console.error(
            "[CreateChallengeModal] Challenge creation failed:",
            submitErrorValue
          );
        }

        const message =
          submitErrorValue
            ?.response?.data
            ?.message ??
          submitErrorValue
            ?.response?.data
            ?.error ??
          submitErrorValue?.message ??
          "Unable to create the savings challenge. Please try again.";

        setSubmitError(message);
      }
    },
    [
      creating,
      form,
      onSubmit,
      validateForm,
    ]
  );

  /* --------------------------------------------------------------------------
     MODAL LIFECYCLE
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
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

  if (!open) {
    return null;
  }

  /* --------------------------------------------------------------------------
     ERRORS
  -------------------------------------------------------------------------- */

  const externalError =
    typeof error === "string"
      ? error
      : error?.message || "";

  const visibleError =
    submitError || externalError;

  const formError =
    getFieldError(errors, "form");

  const nameError =
    getFieldError(
      errors,
      "name"
    );

  const descriptionError =
    getFieldError(
      errors,
      "description"
    );

  const typeError =
    getFieldError(
      errors,
      "challengeType"
    );

  const difficultyError =
    getFieldError(
      errors,
      "difficulty"
    );

  const currencyError =
    getFieldError(
      errors,
      "currency"
    );

  const targetError =
    getFieldError(
      errors,
      "targetAmount",
      "target.targetAmount",
      "target"
    );

  const frequencyError =
    getFieldError(
      errors,
      "frequencyType",
      "frequency.type",
      "frequency"
    );

  const intervalError =
    getFieldError(
      errors,
      "frequencyInterval",
      "frequency.interval"
    );

  const startDateError =
    getFieldError(
      errors,
      "startDate"
    );

  const endDateError =
    getFieldError(
      errors,
      "endDate"
    );

  const accountError =
    getFieldError(
      errors,
      "savingAccount"
    );

  const planError =
    getFieldError(
      errors,
      "savingPlan"
    );

  const autoSaveError =
    getFieldError(
      errors,
      "autoSave",
      "autoSaveEnabled"
    );

  const notificationError =
    getFieldError(
      errors,
      "notificationDaysBefore"
    );

  const showWeeklyDay =
    form.frequencyType === "weekly" ||
    form.frequencyType === "biweekly";

  const showMonthlyDay =
    form.frequencyType === "monthly";

  /* --------------------------------------------------------------------------
     RENDER
  -------------------------------------------------------------------------- */

  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-center
        p-3 sm:p-5
        bg-slate-950/55
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div
        className="
          relative flex flex-col overflow-hidden
          w-full max-w-5xl max-h-[94vh]
          bg-white
          rounded-3xl
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ====================================================================
            HEADER
        ==================================================================== */}

        <header
          className="
            flex justify-between items-center
            px-5 sm:px-7 py-4 sm:py-5
            border-slate-200 border-b
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
                w-11 h-11
                text-white
                bg-blue-600
                rounded-2xl
                shadow-sm
                shrink-0
              "
            >
              <Trophy
                size={21}
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id={titleId}
                className="
                  font-bold text-slate-950 text-lg sm:text-xl truncate
                "
              >
                Create Savings Challenge
              </h2>

              <p
                className="
                  mt-0.5
                  text-slate-500 text-xs sm:text-sm
                "
              >
                Turn a savings target into
                a structured challenge.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            aria-label="Close create savings challenge"
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100 disabled:hover:bg-transparent
              rounded-xl
              disabled:opacity-50 transition
              shrink-0
            "
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* ====================================================================
            FORM
        ==================================================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="
            flex flex-col flex-1
            min-h-0
          "
        >
          <div
            className="
              flex-1 overflow-y-auto
            "
          >
            <div
              className="
                grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]
              "
            >
              <div
                className="
                  space-y-7 p-5 sm:p-7
                "
              >
                {/* ============================================================
                    GENERAL ERROR
                ============================================================= */}

                {visibleError && (
                  <div
                    className="
                      flex items-start
                      p-3.5
                      text-red-700
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
                        shrink-0
                      "
                      aria-hidden="true"
                    /
                    >

                    <p
                      className="
                        text-sm leading-5
                      "
                    >
                      {visibleError}
                    </p>
                  </div>
                )}

                {formError && (
                  <div
                    id={formErrorId}
                    className="
                      flex items-start
                      p-3
                      text-amber-700 text-xs
                      bg-amber-50
                      border border-amber-200 rounded-xl
                      gap-2
                    "
                    role="alert"
                  >
                    <AlertCircle
                      size={16}
                      className="
                        mt-0.5
                        shrink-0
                      "
                      aria-hidden="true"
                    /
                    >

                    <span>
                      {formError}
                    </span>
                  </div>
                )}

                {/* ============================================================
                    BASICS
                ============================================================= */}

                <section>
                  <SectionHeader
                    icon={Zap}
                    title="Challenge basics"
                    description="Give your savings challenge a clear identity."
                  />

                  <div
                    className="
                      space-y-4
                    "
                  >
                    <div>
                      <FieldLabel
                        htmlFor="challenge-name"
                        required
                      >
                        Challenge name
                      </FieldLabel>

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
                        autoComplete="off"
                        placeholder="e.g. Build My Emergency Fund"
                        aria-invalid={Boolean(
                          nameError
                        )}
                        aria-describedby={
                          nameError
                            ? nameErrorId
                            : undefined
                        }
                        className={[
                          "w-full px-3.5 py-2.5",
                          "text-slate-900 text-sm",
                          "placeholder:text-slate-400",
                          "border rounded-xl outline-none",
                          "disabled:bg-slate-50",
                          "focus:ring-2 transition",
                          nameError
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                        ].join(" ")}
                      />

                      <div
                        className="
                          flex justify-between
                          mt-1.5
                        "
                      >
                        <FieldError
                          id={nameErrorId}
                        >
                          {nameError}
                        </FieldError>

                        <span
                          className="
                            ml-auto
                            text-[11px] text-slate-400
                          "
                        >
                          {form.name.length}/
                          {MAX_NAME_LENGTH}
                        </span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel htmlFor="challenge-description">
                        Description
                      </FieldLabel>

                      <textarea
                        id="challenge-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={handleChange}
                        disabled={creating}
                        rows={3}
                        maxLength={
                          MAX_DESCRIPTION_LENGTH
                        }
                        placeholder="What are you saving towards?"
                        aria-invalid={Boolean(
                          descriptionError
                        )}
                        aria-describedby={
                          descriptionError
                            ? descriptionErrorId
                            : undefined
                        }
                        className={[
                          "w-full px-3.5 py-2.5",
                          "text-slate-900 text-sm",
                          "placeholder:text-slate-400",
                          "border rounded-xl outline-none",
                          "resize-none disabled:bg-slate-50",
                          "focus:ring-2 transition",
                          descriptionError
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                        ].join(" ")}
                      />

                      <FieldError
                        id={
                          descriptionErrorId
                        }
                      >
                        {descriptionError}
                      </FieldError>
                    </div>

                    <div
                      className="
                        grid grid-cols-1 sm:grid-cols-3
                        gap-4
                      "
                    >
                      <div>
                        <FieldLabel
                          htmlFor="challenge-type"
                          required
                        >
                          Challenge type
                        </FieldLabel>

                        <SelectField
                          id="challenge-type"
                          name="challengeType"
                          value={
                            form.challengeType
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            challengeTypeOptions
                          }
                          error={typeError}
                          placeholder="Select type"
                        />

                        <FieldError>
                          {typeError}
                        </FieldError>
                      </div>

                      <div>
                        <FieldLabel
                          htmlFor="challenge-difficulty"
                          required
                        >
                          Difficulty
                        </FieldLabel>

                        <SelectField
                          id="challenge-difficulty"
                          name="difficulty"
                          value={
                            form.difficulty
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            difficultyOptions
                          }
                          error={
                            difficultyError
                          }
                          placeholder="Select difficulty"
                        />

                        <FieldError>
                          {difficultyError}
                        </FieldError>
                      </div>

                      <div>
                        <FieldLabel
                          htmlFor="challenge-currency"
                          required
                        >
                          Currency
                        </FieldLabel>

                        <SelectField
                          id="challenge-currency"
                          name="currency"
                          value={
                            form.currency
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            CURRENCY_OPTIONS
                          }
                          error={
                            currencyError
                          }
                        />

                        <FieldError>
                          {currencyError}
                        </FieldError>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ============================================================
                    TARGET
                ============================================================= */}

                <section
                  className="
                    p-4 sm:p-5
                    bg-slate-50/80
                    border border-slate-200 rounded-2xl
                  "
                >
                  <SectionHeader
                    icon={Target}
                    title="Savings target"
                    description="Define the amount this challenge is designed to achieve."
                  />

                  <FieldLabel
                    htmlFor="challenge-target"
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
                        top-1/2 left-3.5 absolute
                        font-semibold text-slate-500 text-sm
                        pointer-events-none
                        -translate-y-1/2
                      "
                    >
                      {
                        selectedCurrency.symbol
                      }
                    </span>

                    <input
                      id="challenge-target"
                      name="targetAmount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      value={
                        form.targetAmount
                      }
                      onChange={handleChange}
                      disabled={creating}
                      placeholder="0.00"
                      aria-invalid={Boolean(
                        targetError
                      )}
                      aria-describedby={
                        targetError
                          ? targetErrorId
                          : undefined
                      }
                      className={[
                        "w-full py-3 pr-4 pl-10",
                        "bg-white text-slate-950 text-lg font-semibold",
                        "placeholder:text-slate-300",
                        "border rounded-xl outline-none",
                        "disabled:bg-slate-50",
                        "focus:ring-2 transition",
                        targetError
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                      ].join(" ")}
                    />
                  </div>

                  <FieldError
                    id={targetErrorId}
                  >
                    {targetError}
                  </FieldError>
                </section>

                {/* ============================================================
                    SCHEDULE
                ============================================================= */}

                <section>
                  <SectionHeader
                    icon={CalendarDays}
                    title="Challenge schedule"
                    description="Choose how frequently progress should be expected."
                  />

                  <div
                    className="
                      space-y-4
                    "
                  >
                    <div
                      className="
                        grid grid-cols-1 sm:grid-cols-2
                        gap-4
                      "
                    >
                      <div>
                        <FieldLabel
                          htmlFor="challenge-frequency"
                          required
                        >
                          Frequency
                        </FieldLabel>

                        <SelectField
                          id="challenge-frequency"
                          name="frequencyType"
                          value={
                            form.frequencyType
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            FREQUENCY_OPTIONS
                          }
                          error={
                            frequencyError
                          }
                        />

                        <FieldError>
                          {frequencyError}
                        </FieldError>
                      </div>

                      <div>
                        <FieldLabel
                          htmlFor="challenge-frequency-interval"
                          required
                        >
                          Interval
                        </FieldLabel>

                        <div
                          className="
                            relative
                          "
                        >
                          <Clock3
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
                            id="challenge-frequency-interval"
                            name="frequencyInterval"
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            value={
                              form.frequencyInterval
                            }
                            onChange={handleChange}
                            disabled={creating}
                            aria-invalid={Boolean(
                              intervalError
                            )}
                            className={[
                              "w-full py-2.5 pr-3.5 pl-10",
                              "text-slate-900 text-sm",
                              "border rounded-xl outline-none",
                              "disabled:bg-slate-50",
                              "focus:ring-2 transition",
                              intervalError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                            ].join(" ")}
                          />
                        </div>

                        <FieldError>
                          {intervalError}
                        </FieldError>
                      </div>
                    </div>

                    {showWeeklyDay && (
                      <div>
                        <FieldLabel htmlFor="challenge-day-of-week">
                          Preferred day
                        </FieldLabel>

                        <SelectField
                          id="challenge-day-of-week"
                          name="dayOfWeek"
                          value={
                            form.dayOfWeek
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            DAY_OF_WEEK_OPTIONS
                          }
                          placeholder="Any day"
                          error={getFieldError(
                            errors,
                            "dayOfWeek",
                            "frequency.dayOfWeek"
                          )}
                        />
                      </div>
                    )}

                    {showMonthlyDay && (
                      <div>
                        <FieldLabel htmlFor="challenge-day-of-month">
                          Day of month
                        </FieldLabel>

                        <SelectField
                          id="challenge-day-of-month"
                          name="dayOfMonth"
                          value={
                            form.dayOfMonth
                          }
                          onChange={handleChange}
                          disabled={creating}
                          options={
                            DAY_OF_MONTH_OPTIONS
                          }
                          placeholder="Select day"
                          error={getFieldError(
                            errors,
                            "dayOfMonth",
                            "frequency.dayOfMonth"
                          )}
                        />
                      </div>
                    )}

                    <div
                      className="
                        grid grid-cols-1 sm:grid-cols-2
                        gap-4
                      "
                    >
                      <div>
                        <FieldLabel
                          htmlFor="challenge-start-date"
                          required
                        >
                          Start date
                        </FieldLabel>

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
                            id="challenge-start-date"
                            name="startDate"
                            type="date"
                            value={
                              form.startDate
                            }
                            onChange={handleChange}
                            disabled={creating}
                            aria-invalid={Boolean(
                              startDateError
                            )}
                            className={[
                              "w-full py-2.5 pr-3.5 pl-10",
                              "text-slate-900 text-sm",
                              "border rounded-xl outline-none",
                              "disabled:bg-slate-50",
                              "focus:ring-2 transition",
                              startDateError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                            ].join(" ")}
                          />
                        </div>

                        <FieldError>
                          {startDateError}
                        </FieldError>
                      </div>

                      <div>
                        <FieldLabel
                          htmlFor="challenge-end-date"
                          required
                        >
                          End date
                        </FieldLabel>

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
                            id="challenge-end-date"
                            name="endDate"
                            type="date"
                            min={
                              form.startDate ||
                              undefined
                            }
                            value={
                              form.endDate
                            }
                            onChange={handleChange}
                            disabled={creating}
                            aria-invalid={Boolean(
                              endDateError
                            )}
                            className={[
                              "w-full py-2.5 pr-3.5 pl-10",
                              "text-slate-900 text-sm",
                              "border rounded-xl outline-none",
                              "disabled:bg-slate-50",
                              "focus:ring-2 transition",
                              endDateError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                            ].join(" ")}
                          />
                        </div>

                        <FieldError>
                          {endDateError}
                        </FieldError>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ============================================================
                    SMARTSAVE CONNECTIONS
                ============================================================= */}

                <section>
                  <SectionHeader
                    icon={Target}
                    title="SmartSave connection"
                    description="Optionally connect this challenge to an existing savings structure."
                  />

                  <div
                    className="
                      grid grid-cols-1 sm:grid-cols-2
                      gap-4
                    "
                  >
                    <div>
                      <FieldLabel htmlFor="challenge-account">
                        Saving account
                      </FieldLabel>

                      <SelectField
                        id="challenge-account"
                        name="savingAccount"
                        value={normalizeId(
                          form.savingAccount
                        )}
                        onChange={handleChange}
                        disabled={creating}
                        options={accounts
                          .map(
                            (account) => {
                              const id =
                                normalizeId(
                                  account
                                );

                              if (!id) {
                                return null;
                              }

                              return {
                                value: id,
                                label:
                                  account?.name ??
                                  account?.title ??
                                  `Account ${id}`,
                              };
                            }
                          )
                          .filter(Boolean)}
                        placeholder="No saving account"
                        error={accountError}
                      />

                      <FieldError>
                        {accountError}
                      </FieldError>
                    </div>

                    <div>
                      <FieldLabel htmlFor="challenge-plan">
                        Saving plan
                      </FieldLabel>

                      <SelectField
                        id="challenge-plan"
                        name="savingPlan"
                        value={normalizeId(
                          form.savingPlan
                        )}
                        onChange={handleChange}
                        disabled={creating}
                        options={plans
                          .map((plan) => {
                            const id =
                              normalizeId(
                                plan
                              );

                            if (!id) {
                              return null;
                            }

                            return {
                              value: id,
                              label:
                                plan?.name ??
                                plan?.title ??
                                `Plan ${id}`,
                            };
                          })
                          .filter(Boolean)}
                        placeholder="No saving plan"
                        error={planError}
                      />

                      <FieldError>
                        {planError}
                      </FieldError>
                    </div>
                  </div>

                  {autoSaveRules.length >
                    0 && (
                    <div
                      className="
                        mt-4
                      "
                    >
                      <Toggle
                        id="challenge-autosave-enabled"
                        name="autoSaveEnabled"
                        checked={
                          form.autoSaveEnabled
                        }
                        onChange={handleChange}
                        disabled={creating}
                        title="Enable AutoSave"
                        description="Automatically use a configured AutoSave rule to support this challenge."
                      />

                      {form.autoSaveEnabled && (
                        <div
                          className="
                            mt-3
                          "
                        >
                          <FieldLabel htmlFor="challenge-autosave">
                            AutoSave rule
                          </FieldLabel>

                          <SelectField
                            id="challenge-autosave"
                            name="autoSave"
                            value={normalizeId(
                              form.autoSave
                            )}
                            onChange={
                              handleChange
                            }
                            disabled={
                              creating
                            }
                            options={autoSaveRules
                              .map(
                                (
                                  autoSave
                                ) => {
                                  const id =
                                    normalizeId(
                                      autoSave
                                    );

                                  if (!id) {
                                    return null;
                                  }

                                  return {
                                    value: id,
                                    label:
                                      autoSave?.name ??
                                      autoSave?.title ??
                                      `AutoSave ${id}`,
                                  };
                                }
                              )
                              .filter(
                                Boolean
                              )}
                            placeholder="Select AutoSave rule"
                            error={
                              autoSaveError
                            }
                          />

                          <FieldError>
                            {
                              autoSaveError
                            }
                          </FieldError>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* ============================================================
                    PREFERENCES
                ============================================================= */}

                <section>
                  <SectionHeader
                    icon={Check}
                    title="Challenge preferences"
                    description="Configure completion flexibility and reminder behaviour."
                  />

                  <div
                    className="
                      space-y-3
                    "
                  >
                    <Toggle
                      id="challenge-early-completion"
                      name="allowEarlyCompletion"
                      checked={
                        form.allowEarlyCompletion
                      }
                      onChange={handleChange}
                      disabled={creating}
                      title="Allow early completion"
                      description="Allow the challenge to be completed before the scheduled end date when the target is reached."
                    />

                    <Toggle
                      id="challenge-partial-contribution"
                      name="allowPartialContribution"
                      checked={
                        form.allowPartialContribution
                      }
                      onChange={handleChange}
                      disabled={creating}
                      title="Allow partial contributions"
                      description="Allow contributions smaller than the expected contribution amount."
                    />

                    <Toggle
                      id="challenge-notifications"
                      name="notifyBeforeDue"
                      checked={
                        form.notifyBeforeDue
                      }
                      onChange={handleChange}
                      disabled={creating}
                      title="Send due-date reminders"
                      description="Receive a reminder before an expected contribution period."
                    />

                    {form.notifyBeforeDue && (
                      <div
                        className="
                          max-w-xs
                          pt-1
                        "
                      >
                        <FieldLabel htmlFor="challenge-notification-days">
                          Days before due
                        </FieldLabel>

                        <input
                          id="challenge-notification-days"
                          name="notificationDaysBefore"
                          type="number"
                          min="0"
                          max="30"
                          step="1"
                          inputMode="numeric"
                          value={
                            form.notificationDaysBefore
                          }
                          onChange={handleChange}
                          disabled={creating}
                          aria-invalid={Boolean(
                            notificationError
                          )}
                          className={[
                            "w-full px-3.5 py-2.5",
                            "text-slate-900 text-sm",
                            "border rounded-xl outline-none",
                            "disabled:bg-slate-50",
                            "focus:ring-2 transition",
                            notificationError
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
                          ].join(" ")}
                        />

                        <FieldError>
                          {
                            notificationError
                          }
                        </FieldError>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* =================================================================
                  LIVE SUMMARY
              ================================================================== */}

              <aside
                className="
                  hidden lg:block
                  p-6
                  bg-slate-50
                  border-slate-200 border-l
                "
              >
                <div
                  className="
                    top-0 sticky
                  "
                >
                  <div
                    className="
                      flex items-center
                      mb-5
                      gap-2
                    "
                  >
                    <div
                      className="
                        flex justify-center items-center
                        w-8 h-8
                        text-blue-600
                        bg-blue-100
                        rounded-lg
                      "
                    >
                      <Target
                        size={16}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p
                        className="
                          font-semibold text-slate-900 text-sm
                        "
                      >
                        Challenge preview
                      </p>

                      <p
                        className="
                          text-slate-500 text-xs
                        "
                      >
                        Live summary
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      p-5
                      bg-white
                      border border-slate-200 rounded-2xl
                      shadow-sm
                    "
                  >
                    <p
                      className="
                        mb-1
                        text-slate-500 text-xs
                      "
                    >
                      {normalizeString(
                        form.name
                      ) ||
                        "Your challenge"}
                    </p>

                    <p
                      className="
                        font-bold text-slate-950 text-xl break-words
                      "
                    >
                      {
                        selectedCurrency.symbol
                      }
                      {form.targetAmount ||
                        "0"}
                    </p>

                    <div
                      className="
                        h-px
                        my-5
                        bg-slate-100
                      "
                      /
                    >

                    <div
                      className="
                        space-y-4
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[11px] text-slate-400 uppercase tracking-wide
                          "
                        >
                          Type
                        </p>

                        <p
                          className="
                            mt-1
                            font-medium text-slate-800 text-sm
                          "
                        >
                          {
                            selectedChallengeType
                          }
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-[11px] text-slate-400 uppercase tracking-wide
                          "
                        >
                          Difficulty
                        </p>

                        <p
                          className="
                            mt-1
                            font-medium text-slate-800 text-sm
                          "
                        >
                          {
                            selectedDifficulty
                          }
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-[11px] text-slate-400 uppercase tracking-wide
                          "
                        >
                          Frequency
                        </p>

                        <p
                          className="
                            mt-1
                            font-medium text-slate-800 text-sm
                          "
                        >
                          {
                            FREQUENCY_OPTIONS.find(
                              (option) =>
                                option.value ===
                                form.frequencyType
                            )?.label ??
                            "Weekly"
                          }
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-[11px] text-slate-400 uppercase tracking-wide
                          "
                        >
                          Duration
                        </p>

                        <p
                          className="
                            mt-1
                            font-medium text-slate-800 text-sm
                          "
                        >
                          {form.startDate ||
                            "Start"}{" "}
                          →{" "}
                          {form.endDate ||
                            "End"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      flex items-start
                      mt-4 p-3.5
                      bg-blue-50
                      border border-blue-100 rounded-xl
                      gap-2
                    "
                  >
                    <Zap
                      size={16}
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
                        text-blue-700 text-xs leading-5
                      "
                    >
                      Your challenge will be
                      created as a draft.
                      SmartSave can manage
                      its lifecycle after
                      creation.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* ====================================================================
              FOOTER
          ===================================================================== */}

          <footer
            className="
              flex flex-col-reverse sm:flex-row sm:justify-between
              sm:items-center
              px-5 sm:px-7 py-4
              bg-white
              border-slate-200 border-t
              gap-3
            "
          >
            <p
              className="
                hidden sm:block
                text-slate-400 text-xs
              "
            >
              Fields marked * are
              required.
            </p>

            <div
              className="
                flex flex-col-reverse sm:flex-row sm:justify-end
                sm:ml-auto
                gap-2.5
              "
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={creating}
                className="
                  inline-flex justify-center items-center
                  px-4 py-2.5
                  font-medium text-slate-700 text-sm
                  bg-white hover:bg-slate-50 disabled:hover:bg-white
                  border border-slate-200 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 transition
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="
                  inline-flex justify-center items-center
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-950 hover:bg-slate-800 disabled:hover:bg-slate-950
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-500
                  disabled:opacity-60 shadow-sm transition
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

                    Creating challenge...
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
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;