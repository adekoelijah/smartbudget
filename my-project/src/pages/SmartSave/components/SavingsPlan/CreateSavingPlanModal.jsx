import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Info,
  Loader2,
  PiggyBank,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const DEFAULT_FORM = Object.freeze({
  name: "",
  description: "",
  planType: "fixed_amount",
  contributionMethod: "manual",
  contributionFrequency: "monthly",
  contributionAmount: "",
  contributionPercentage: "",
  dayOfWeek: "",
  dayOfMonth: "",
  customIntervalDays: "",
});

const PLAN_TYPES = Object.freeze([
  {
    value: "fixed_amount",
    label: "Fixed amount",
    description: "Save a specific amount on every contribution.",
  },
  {
    value: "percentage_income",
    label: "Percentage of income",
    description: "Save a percentage of each income amount.",
  },
  {
    value: "round_up",
    label: "Round up",
    description: "Automatically save spare change from transactions.",
  },
  {
    value: "target_date",
    label: "Target date",
    description: "Structure contributions around your goal deadline.",
  },
  {
    value: "flexible",
    label: "Flexible",
    description: "Save toward the goal with a flexible contribution strategy.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Use a customized saving strategy.",
  },
]);

const CONTRIBUTION_METHODS = Object.freeze([
  {
    value: "manual",
    label: "Manual",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
  },
]);

const FREQUENCIES = Object.freeze([
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
    value: "quarterly",
    label: "Quarterly",
  },
  {
    value: "custom",
    label: "Custom interval",
  },
]);

const DAYS_OF_WEEK = Object.freeze([
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]);

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-11`;

const ERROR_INPUT_CLASS =
  "border-red-300 focus:border-red-500 focus:ring-red-500/10";

const LABEL_CLASS =
  "mb-2 block text-sm font-semibold text-slate-800";

const HELPER_CLASS = "mt-1.5 text-xs leading-5 text-slate-500";

/* =========================================================
   HELPERS
========================================================= */

const getGoalId = (goal) =>
  goal?._id || goal?.id || goal?.goalId || "";

const getGoalAccountId = (goal) =>
  goal?.savingAccount?._id ||
  goal?.savingAccount?.id ||
  goal?.savingAccount ||
  "";

const getGoalName = (goal) => goal?.name || "Unnamed goal";

const getGoalCurrency = (goal) =>
  String(goal?.currency || DEFAULT_CURRENCY).toUpperCase();

const getGoalTargetAmount = (goal) =>
  Number(goal?.targetAmount ?? goal?.target?.amount ?? 0);

const getGoalCurrentAmount = (goal) =>
  Number(goal?.currentAmount ?? 0);

const getGoalRemainingAmount = (goal) => {
  const explicitRemaining = Number(goal?.remainingAmount);

  if (Number.isFinite(explicitRemaining)) {
    return Math.max(explicitRemaining, 0);
  }

  return Math.max(
    getGoalTargetAmount(goal) - getGoalCurrentAmount(goal),
    0,
  );
};

const getGoalProgress = (goal) => {
  const explicitProgress = Number(
    goal?.progress ?? goal?.progressPercentage,
  );

  if (Number.isFinite(explicitProgress)) {
    return Math.min(Math.max(explicitProgress, 0), 100);
  }

  const target = getGoalTargetAmount(goal);
  const current = getGoalCurrentAmount(goal);

  if (!target) {
    return 0;
  }

  return Math.min(Math.max((current / target) * 100, 0), 100);
};

const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toLocaleString("en-NG")}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "No target date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};


const isValidAmount = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0;
};

const isValidPercentage = (value) => {
  const percentage = Number(value);

  return (
    Number.isFinite(percentage) &&
    percentage > 0 &&
    percentage <= 100
  );
};

const buildSavingPlanPayload = ({
  form,
  goal,
  savingAccountId,
}) => {
  const targetAmount = getGoalTargetAmount(goal);
  const currency = getGoalCurrency(goal);
  const targetDate = goal?.targetDate || goal?.target?.targetDate || null;

  const contribution = {
    method: form.contributionMethod,
    frequency: form.contributionFrequency,
  };

  if (form.planType === "percentage_income") {
    contribution.percentage = Number(form.contributionPercentage);
  } else if (form.planType === "round_up") {
    contribution.method = "round_up";
  } else {
    contribution.amount = Number(form.contributionAmount);
  }

  if (
    form.contributionFrequency === "weekly" ||
    form.contributionFrequency === "biweekly"
  ) {
    contribution.dayOfWeek = Number(form.dayOfWeek);
  }

  if (
    form.contributionFrequency === "monthly" ||
    form.contributionFrequency === "quarterly"
  ) {
    contribution.dayOfMonth = Number(form.dayOfMonth);
  }

  if (form.contributionFrequency === "custom") {
    contribution.customIntervalDays = Number(
      form.customIntervalDays,
    );
  }

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    goal: getGoalId(goal),
    savingAccount: savingAccountId,
    planType: form.planType,

    target: {
      amount: targetAmount,
      currency,
      targetDate,
    },

    contribution,
  };
};

const validateForm = ({
  form,
  goal,
  savingAccountId,
}) => {
  const errors = {};

  if (!goal) {
    errors.goal = "Select a saving goal before creating a plan.";
  }

  if (!getGoalId(goal)) {
    errors.goal =
      "The selected goal does not have a valid ID.";
  }

  if (!savingAccountId) {
    errors.savingAccount =
      "This goal is not connected to a saving account.";
  }

  if (!form.name.trim()) {
    errors.name = "Enter a name for this saving plan.";
  } else if (form.name.trim().length < 2) {
    errors.name =
      "The plan name must contain at least 2 characters.";
  } else if (form.name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `The plan name cannot exceed ${MAX_NAME_LENGTH} characters.`;
  }

  if (form.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `The description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (!getGoalTargetAmount(goal)) {
    errors.goalTarget =
      "The selected goal does not have a valid target amount.";
  }

  if (form.planType === "round_up") {
    if (form.contributionMethod !== "round_up") {
      errors.contributionMethod =
        "Round-up plans must use the round-up contribution method.";
    }
  }

  if (form.planType === "percentage_income") {
    if (!isValidPercentage(form.contributionPercentage)) {
      errors.contributionPercentage =
        "Enter a percentage between 0 and 100.";
    }
  } else if (form.planType !== "round_up") {
    if (!isValidAmount(form.contributionAmount)) {
      errors.contributionAmount =
        "Enter a contribution amount greater than zero.";
    }
  }

  if (
    form.contributionFrequency === "weekly" ||
    form.contributionFrequency === "biweekly"
  ) {
    if (form.dayOfWeek === "") {
      errors.dayOfWeek =
        "Select the day of the week for this contribution.";
    }
  }

  if (
    form.contributionFrequency === "monthly" ||
    form.contributionFrequency === "quarterly"
  ) {
    const dayOfMonth = Number(form.dayOfMonth);

    if (
      !Number.isInteger(dayOfMonth) ||
      dayOfMonth < 1 ||
      dayOfMonth > 31
    ) {
      errors.dayOfMonth =
        "Enter a valid day between 1 and 31.";
    }
  }

  if (form.contributionFrequency === "custom") {
    const interval = Number(form.customIntervalDays);

    if (!Number.isInteger(interval) || interval < 1) {
      errors.customIntervalDays =
        "Enter a custom interval of at least 1 day.";
    }
  }

  return errors;
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const FieldLabel = ({
  children,
  htmlFor,
  required = false,
}) => (
  <label htmlFor={htmlFor} className={LABEL_CLASS}>
    {children}

    {required ? (
      <span
        className="
          ml-1
          text-red-500
        "
        aria-hidden="true"
      >
        *
      </span>
    ) : null}
  </label>
);

const FieldError = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      className="
        flex items-start
        mt-1.5
        text-xs text-red-600 font-medium
        gap-1.5
      "
    >
      <AlertCircle
        size={14}
        className="
          mt-0.5
          shrink-0
        "
        aria-hidden="true"
      /
      >
      <span>{message}</span>
    </p>
  );
};

const SelectIcon = () => (
  <ChevronDown
    size={17}
    className="
      absolute right-4 top-1/2
      text-slate-400
      pointer-events-none
      -translate-y-1/2
    "
    aria-hidden="true"
  /
  >
);

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => (
  <div
    className="
      flex items-start
      mb-5
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
      <Icon size={19} aria-hidden="true" />
    </div>

    <div
      className="
        min-w-0
      "
    >
      <h3
        className="
          text-sm text-slate-900 font-bold
        "
      >
        {title}
      </h3>

      {description ? (
        <p
          className="
            mt-1
            text-xs text-slate-500 leading-5
          "
        >
          {description}
        </p>
      ) : null}
    </div>
  </div>
);

/* =========================================================
   GOAL SUMMARY
========================================================= */

const GoalSummary = memo(function GoalSummary({
  goal,
}) {
  const currency = getGoalCurrency(goal);
  const targetAmount = getGoalTargetAmount(goal);
  const currentAmount = getGoalCurrentAmount(goal);
  const remainingAmount = getGoalRemainingAmount(goal);
  const progress = getGoalProgress(goal);
  const targetDate =
    goal?.targetDate || goal?.target?.targetDate;

  return (
    <div
      className="
        p-4
        bg-blue-50/60
        rounded-2xl border border-blue-100
      "
    >
      <div
        className="
          flex items-start justify-between
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
              bg-white
              rounded-xl
              shadow-sm
              shrink-0
            "
          >
            <Target size={19} aria-hidden="true" />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <p
              className="
                text-xs text-blue-600 font-semibold uppercase tracking-wide
              "
            >
              Selected goal
            </p>

            <h4
              className="
                mt-1
                truncate text-sm text-slate-900 font-bold
              "
            >
              {getGoalName(goal)}
            </h4>
          </div>
        </div>

        <div
          className="
            flex items-center
            px-2.5 py-1
            text-xs text-emerald-700 font-semibold
            bg-emerald-50
            rounded-full
            shrink-0 gap-1.5
          "
        >
          <CheckCircle2 size={13} aria-hidden="true" />
          Active
        </div>
      </div>

      <div
        className="
          grid grid-cols-2 sm:grid-cols-4
          mt-4
          gap-3
        "
      >
        <div>
          <p
            className="
              text-[11px] text-slate-500 font-medium
            "
          >
            Target
          </p>
          <p
            className="
              mt-1
              text-sm text-slate-900 font-bold
            "
          >
            {formatCurrency(targetAmount, currency)}
          </p>
        </div>

        <div>
          <p
            className="
              text-[11px] text-slate-500 font-medium
            "
          >
            Saved
          </p>
          <p
            className="
              mt-1
              text-sm text-slate-900 font-bold
            "
          >
            {formatCurrency(currentAmount, currency)}
          </p>
        </div>

        <div>
          <p
            className="
              text-[11px] text-slate-500 font-medium
            "
          >
            Remaining
          </p>
          <p
            className="
              mt-1
              text-sm text-slate-900 font-bold
            "
          >
            {formatCurrency(remainingAmount, currency)}
          </p>
        </div>

        <div>
          <p
            className="
              text-[11px] text-slate-500 font-medium
            "
          >
            Target date
          </p>
          <p
            className="
              mt-1
              text-sm text-slate-900 font-bold
            "
          >
            {formatDate(targetDate)}
          </p>
        </div>
      </div>

      <div
        className="
          mt-4
        "
      >
        <div
          className="
            flex items-center justify-between
            mb-1.5
            gap-3
          "
        >
          <span
            className="
              text-[11px] text-slate-500 font-medium
            "
          >
            Goal progress
          </span>

          <span
            className="
              text-[11px] text-blue-700 font-bold
            "
          >
            {progress.toFixed(0)}%
          </span>
        </div>

        <div
          className="
            overflow-hidden
            h-2
            bg-white
            rounded-full
          "
          aria-label={`Goal progress ${progress.toFixed(0)} percent`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-[width] duration-300
            "
            style={{ width: `${progress}%` }}
          /
          >
        </div>
      </div>
    </div>
  );
});

/* =========================================================
   ACCOUNT STATUS
========================================================= */

const AccountStatus = memo(function AccountStatus({
  hasAccount,
}) {
  return (
    <div
      className={`mt-3 flex items-start gap-3 rounded-xl border p-3 ${
        hasAccount
          ? "border-emerald-100 bg-emerald-50/70"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          hasAccount
            ? "bg-white text-emerald-600"
            : "bg-white text-amber-600"
        }`}
      >
        {hasAccount ? (
          <WalletCards size={16} aria-hidden="true" />
        ) : (
          <AlertCircle size={16} aria-hidden="true" />
        )}
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className={`text-xs font-bold ${
            hasAccount
              ? "text-emerald-800"
              : "text-amber-800"
          }`}
        >
          {hasAccount
            ? "Saving account connected"
            : "Saving account required"}
        </p>

        <p
          className={`mt-0.5 text-xs leading-5 ${
            hasAccount
              ? "text-emerald-700"
              : "text-amber-700"
          }`}
        >
          {hasAccount
            ? "This plan will use the saving account connected to the selected goal."
            : "The selected goal must have a saving account before a saving plan can be created."}
        </p>
      </div>
    </div>
  );
});

/* =========================================================
   MAIN MODAL
========================================================= */

function CreateSavingPlanModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  goals = [],
  selectedGoal = null,
  onGoalChange,
}) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
  }));

  const [errors, setErrors] = useState({});

  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  const titleId = useId();
  const descriptionId = useId();

  const availableGoals = useMemo(
    () =>
      Array.isArray(goals)
        ? goals.filter((goal) => getGoalId(goal))
        : [],
    [goals],
  );

  const selectedGoalId = getGoalId(selectedGoal);

  const savingAccountId = getGoalAccountId(selectedGoal);

  const planTypeConfig = useMemo(
    () =>
      PLAN_TYPES.find(
        (item) => item.value === form.planType,
      ) || PLAN_TYPES[0],
    [form.planType],
  );

  const requiresPercentage =
    form.planType === "percentage_income";

  const requiresAmount =
    form.planType !== "percentage_income" &&
    form.planType !== "round_up";

  const requiresDayOfWeek =
    form.contributionFrequency === "weekly" ||
    form.contributionFrequency === "biweekly";

  const requiresDayOfMonth =
    form.contributionFrequency === "monthly" ||
    form.contributionFrequency === "quarterly";

  const requiresCustomInterval =
    form.contributionFrequency === "custom";

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];

      return next;
    });
  }, []);

  const handlePlanTypeChange = useCallback((event) => {
    const { value } = event.target;

    setForm((current) => ({
      ...current,
      planType: value,
      contributionMethod:
        value === "round_up"
          ? "round_up"
          : value === "percentage_income"
            ? "manual"
            : current.contributionMethod === "round_up"
              ? "manual"
              : current.contributionMethod,
      contributionAmount:
        value === "percentage_income"
          ? ""
          : current.contributionAmount,
      contributionPercentage:
        value === "percentage_income"
          ? current.contributionPercentage
          : "",
    }));

    setErrors((current) => {
      const next = { ...current };

      delete next.contributionMethod;
      delete next.contributionAmount;
      delete next.contributionPercentage;

      return next;
    });
  }, []);

  const handleGoalChange = useCallback(
    (event) => {
      const goalId = event.target.value;

      const nextGoal =
        availableGoals.find(
          (goal) => getGoalId(goal) === goalId,
        ) || null;

      onGoalChange?.(nextGoal);

      setErrors((current) => {
        const next = { ...current };

        delete next.goal;
        delete next.savingAccount;
        delete next.goalTarget;

        return next;
      });
    },
    [availableGoals, onGoalChange],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      const validationErrors = validateForm({
        form,
        goal: selectedGoal,
        savingAccountId,
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const payload = buildSavingPlanPayload({
        form,
        goal: selectedGoal,
        savingAccountId,
      });

      await onSubmit?.(payload);
    },
    [
      form,
      onSubmit,
      savingAccountId,
      selectedGoal,
      submitting,
    ],
  );

  const handleOverlayMouseDown = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  const handleDialogMouseDown = useCallback((event) => {
    event.stopPropagation();
  }, []);

  /* -------------------------------------------------------
     ESCAPE + BODY SCROLL LOCK
  ------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose, open, submitting]);

  /* -------------------------------------------------------
     INITIAL FOCUS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) {
    return null;
  }

  const hasGoals = availableGoals.length > 0;
  const hasSelectedGoal = Boolean(selectedGoal);
  const hasSavingAccount = Boolean(savingAccountId);

  const canSubmit =
    !submitting &&
    hasGoals &&
    hasSelectedGoal &&
    hasSavingAccount;

  return (
    <div
      className="
        fixed inset-0 z-[100] flex items-center justify-center
        p-4
        bg-slate-950/55
        backdrop-blur-sm
      "
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="
          flex flex-col overflow-hidden
          w-full max-w-3xl max-h-[94vh]
          bg-white
          rounded-3xl border border-slate-200
          shadow-2xl
        "
        onMouseDown={handleDialogMouseDown}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex items-start justify-between
            px-5 sm:px-7 py-5
            border-b border-slate-100
            shrink-0 gap-4
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
                h-11 w-11
                text-white
                bg-blue-600
                rounded-2xl
                shadow-lg shadow-blue-600/20
                shrink-0
              "
            >
              <PiggyBank
                size={21}
                strokeWidth={2.2}
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
                  text-lg text-slate-950 sm:text-xl font-bold tracking-tight
                "
              >
                Create saving plan
              </h2>

              <p
                id={descriptionId}
                className="
                  max-w-xl
                  mt-1
                  text-xs text-slate-500 sm:text-sm leading-5
                "
              >
                Turn an active saving goal into a structured
                contribution strategy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close create saving plan modal"
            className="
              flex items-center justify-center
              h-9 w-9
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10
              transition disabled:opacity-50
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <form
          id="create-saving-plan-form"
          onSubmit={handleSubmit}
          className="
            flex-1 overflow-y-auto
            min-h-0
          "
        >
          <div
            className="
              space-y-7 px-5 sm:px-7 py-6
            "
          >
            {/* =============================================
                GOAL CONNECTION
            ============================================= */}

            <section>
              <SectionHeader
                icon={Target}
                title="Connect a saving goal"
                description="A saving plan must belong to an existing goal. The goal remains the source of truth for the financial target."
              />

              {!hasGoals ? (
                <div
                  className="
                    p-4
                    bg-amber-50
                    rounded-2xl border border-amber-200
                  "
                >
                  <div
                    className="
                      flex items-start
                      gap-3
                    "
                  >
                    <AlertCircle
                      size={19}
                      className="
                        mt-0.5
                        text-amber-600
                        shrink-0
                      "
                      aria-hidden="true"
                    /
                    >

                    <div>
                      <p
                        className="
                          text-sm text-amber-900 font-bold
                        "
                      >
                        No active saving goals available
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs text-amber-800 leading-5
                        "
                      >
                        Create an active saving goal first. A
                        saving plan cannot exist independently
                        of a goal.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-goal"
                      required
                    >
                      Saving goal
                    </FieldLabel>

                    <div
                      className="
                        relative
                      "
                    >
                      <select
                        ref={firstInputRef}
                        id="saving-plan-goal"
                        name="goal"
                        value={selectedGoalId}
                        onChange={handleGoalChange}
                        disabled={
                          submitting ||
                          availableGoals.length <= 1
                        }
                        className={`${SELECT_CLASS} ${
                          errors.goal
                            ? ERROR_INPUT_CLASS
                            : ""
                        }`}
                        aria-invalid={Boolean(errors.goal)}
                        aria-describedby={
                          errors.goal
                            ? "saving-plan-goal-error"
                            : undefined
                        }
                      >
                        <option value="" disabled>
                          Select a saving goal
                        </option>

                        {availableGoals.map((goal) => (
                          <option
                            key={getGoalId(goal)}
                            value={getGoalId(goal)}
                          >
                            {getGoalName(goal)}
                          </option>
                        ))}
                      </select>

                      <SelectIcon />
                    </div>

                    <FieldError message={errors.goal} />
                  </div>

                  {selectedGoal ? (
                    <GoalSummary goal={selectedGoal} />
                  ) : null}

                  <AccountStatus
                    hasAccount={hasSavingAccount}
                  />

                  <FieldError
                    message={errors.savingAccount}
                  />
                </>
              )}
            </section>

            {/* =============================================
                PLAN INFORMATION
            ============================================= */}

            <section>
              <SectionHeader
                icon={FileText}
                title="Plan information"
                description="Give this strategy a clear identity so it is easy to understand and manage later."
              />

              <div
                className="
                  grid
                  gap-5
                "
              >
                <div>
                  <FieldLabel
                    htmlFor="saving-plan-name"
                    required
                  >
                    Plan name
                  </FieldLabel>

                  <input
                    id="saving-plan-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="e.g. Monthly house savings"
                    disabled={submitting}
                    className={`${INPUT_CLASS} ${
                      errors.name
                        ? ERROR_INPUT_CLASS
                        : ""
                    }`}
                    aria-invalid={Boolean(errors.name)}
                  />

                  <div
                    className="
                      flex justify-between
                      mt-1.5
                      gap-3
                    "
                  >
                    <FieldError message={errors.name} />

                    <span
                      className="
                        ml-auto
                        text-[11px] text-slate-400
                      "
                    >
                      {form.name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="saving-plan-description">
                    Description
                  </FieldLabel>

                  <textarea
                    id="saving-plan-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    rows={3}
                    placeholder="Describe how this plan will help you reach the goal."
                    disabled={submitting}
                    className={`${INPUT_CLASS} min-h-[96px] resize-none ${
                      errors.description
                        ? ERROR_INPUT_CLASS
                        : ""
                    }`}
                    aria-invalid={Boolean(
                      errors.description,
                    )}
                  />

                  <div
                    className="
                      flex justify-between
                      mt-1.5
                      gap-3
                    "
                  >
                    <FieldError
                      message={errors.description}
                    />

                    <span
                      className="
                        ml-auto
                        text-[11px] text-slate-400
                      "
                    >
                      {form.description.length}/
                      {MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================
                SAVING STRATEGY
            ============================================= */}

            <section>
              <SectionHeader
                icon={PiggyBank}
                title="Saving strategy"
                description="Configure how contributions will be made toward the selected goal."
              />

              <div
                className="
                  grid sm:grid-cols-2
                  gap-5
                "
              >
                {/* Plan type */}
                <div>
                  <FieldLabel
                    htmlFor="saving-plan-type"
                    required
                  >
                    Plan type
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <select
                      id="saving-plan-type"
                      name="planType"
                      value={form.planType}
                      onChange={handlePlanTypeChange}
                      disabled={submitting}
                      className={SELECT_CLASS}
                    >
                      {PLAN_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <SelectIcon />
                  </div>

                  <p className={HELPER_CLASS}>
                    {planTypeConfig.description}
                  </p>
                </div>

                {/* Contribution method */}
                <div>
                  <FieldLabel
                    htmlFor="saving-plan-method"
                    required
                  >
                    Contribution method
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <select
                      id="saving-plan-method"
                      name="contributionMethod"
                      value={
                        form.planType === "round_up"
                          ? "round_up"
                          : form.contributionMethod
                      }
                      onChange={handleChange}
                      disabled={
                        submitting ||
                        form.planType === "round_up"
                      }
                      className={`${SELECT_CLASS} ${
                        errors.contributionMethod
                          ? ERROR_INPUT_CLASS
                          : ""
                      }`}
                      aria-invalid={Boolean(
                        errors.contributionMethod,
                      )}
                    >
                      {form.planType === "round_up" ? (
                        <option value="round_up">
                          Round up
                        </option>
                      ) : (
                        CONTRIBUTION_METHODS.map(
                          (method) => (
                            <option
                              key={method.value}
                              value={method.value}
                            >
                              {method.label}
                            </option>
                          ),
                        )
                      )}
                    </select>

                    <SelectIcon />
                  </div>

                  <FieldError
                    message={errors.contributionMethod}
                  />
                </div>

                {/* Frequency */}
                <div>
                  <FieldLabel
                    htmlFor="saving-plan-frequency"
                    required
                  >
                    Contribution frequency
                  </FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <select
                      id="saving-plan-frequency"
                      name="contributionFrequency"
                      value={form.contributionFrequency}
                      onChange={handleChange}
                      disabled={submitting}
                      className={SELECT_CLASS}
                    >
                      {FREQUENCIES.map((frequency) => (
                        <option
                          key={frequency.value}
                          value={frequency.value}
                        >
                          {frequency.label}
                        </option>
                      ))}
                    </select>

                    <SelectIcon />
                  </div>
                </div>

                {/* Amount */}
                {requiresAmount ? (
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-amount"
                      required
                    >
                      Contribution amount
                    </FieldLabel>

                    <div
                      className="
                        relative
                      "
                    >
                      <span
                        className="
                          absolute left-4 top-1/2
                          text-sm text-slate-400 font-semibold
                          pointer-events-none
                          -translate-y-1/2
                        "
                      >
                        {getGoalCurrency(selectedGoal)}
                      </span>

                      <input
                        id="saving-plan-amount"
                        name="contributionAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        value={form.contributionAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        disabled={submitting}
                        className={`w-full rounded-xl border border-slate-200 bg-white py-3 pl-14 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                          errors.contributionAmount
                            ? ERROR_INPUT_CLASS
                            : ""
                        }`}
                        aria-invalid={Boolean(
                          errors.contributionAmount,
                        )}
                      />
                    </div>

                    <p className={HELPER_CLASS}>
                      The amount contributed on each
                      {form.contributionFrequency ===
                      "daily"
                        ? " day."
                        : form.contributionFrequency ===
                            "weekly"
                          ? " week."
                          : form.contributionFrequency ===
                              "biweekly"
                            ? " two-week period."
                            : form.contributionFrequency ===
                                "quarterly"
                              ? " quarter."
                              : " contribution period."}
                    </p>

                    <FieldError
                      message={errors.contributionAmount}
                    />
                  </div>
                ) : null}

                {/* Percentage */}
                {requiresPercentage ? (
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-percentage"
                      required
                    >
                      Income percentage
                    </FieldLabel>

                    <div
                      className="
                        relative
                      "
                    >
                      <input
                        id="saving-plan-percentage"
                        name="contributionPercentage"
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        inputMode="decimal"
                        value={
                          form.contributionPercentage
                        }
                        onChange={handleChange}
                        placeholder="10"
                        disabled={submitting}
                        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                          errors.contributionPercentage
                            ? ERROR_INPUT_CLASS
                            : ""
                        }`}
                        aria-invalid={Boolean(
                          errors.contributionPercentage,
                        )}
                      />

                      <span
                        className="
                          absolute right-4 top-1/2
                          text-sm text-slate-400 font-semibold
                          pointer-events-none
                          -translate-y-1/2
                        "
                      >
                        %
                      </span>
                    </div>

                    <p className={HELPER_CLASS}>
                      Percentage of income allocated to this
                      goal.
                    </p>

                    <FieldError
                      message={
                        errors.contributionPercentage
                      }
                    />
                  </div>
                ) : null}

                {/* Day of week */}
                {requiresDayOfWeek ? (
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-day-of-week"
                      required
                    >
                      Contribution day
                    </FieldLabel>

                    <div
                      className="
                        relative
                      "
                    >
                      <select
                        id="saving-plan-day-of-week"
                        name="dayOfWeek"
                        value={form.dayOfWeek}
                        onChange={handleChange}
                        disabled={submitting}
                        className={`${SELECT_CLASS} ${
                          errors.dayOfWeek
                            ? ERROR_INPUT_CLASS
                            : ""
                        }`}
                        aria-invalid={Boolean(
                          errors.dayOfWeek,
                        )}
                      >
                        <option value="" disabled>
                          Select a day
                        </option>

                        {DAYS_OF_WEEK.map((day) => (
                          <option
                            key={day.value}
                            value={day.value}
                          >
                            {day.label}
                          </option>
                        ))}
                      </select>

                      <SelectIcon />
                    </div>

                    <FieldError
                      message={errors.dayOfWeek}
                    />
                  </div>
                ) : null}

                {/* Day of month */}
                {requiresDayOfMonth ? (
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-day-of-month"
                      required
                    >
                      Day of month
                    </FieldLabel>

                    <input
                      id="saving-plan-day-of-month"
                      name="dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      step="1"
                      inputMode="numeric"
                      value={form.dayOfMonth}
                      onChange={handleChange}
                      placeholder="1"
                      disabled={submitting}
                      className={`${INPUT_CLASS} ${
                        errors.dayOfMonth
                          ? ERROR_INPUT_CLASS
                          : ""
                      }`}
                      aria-invalid={Boolean(
                        errors.dayOfMonth,
                      )}
                    />

                    <p className={HELPER_CLASS}>
                      Use a day from 1 to 31.
                    </p>

                    <FieldError
                      message={errors.dayOfMonth}
                    />
                  </div>
                ) : null}

                {/* Custom interval */}
                {requiresCustomInterval ? (
                  <div>
                    <FieldLabel
                      htmlFor="saving-plan-custom-interval"
                      required
                    >
                      Repeat every
                    </FieldLabel>

                    <div
                      className="
                        flex
                        gap-2
                      "
                    >
                      <input
                        id="saving-plan-custom-interval"
                        name="customIntervalDays"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={
                          form.customIntervalDays
                        }
                        onChange={handleChange}
                        placeholder="14"
                        disabled={submitting}
                        className={`${INPUT_CLASS} ${
                          errors.customIntervalDays
                            ? ERROR_INPUT_CLASS
                            : ""
                        }`}
                        aria-invalid={Boolean(
                          errors.customIntervalDays,
                        )}
                      />

                      <div
                        className="
                          flex items-center
                          px-4
                          text-sm text-slate-600 font-medium
                          bg-slate-50
                          rounded-xl border border-slate-200
                          shrink-0
                        "
                      >
                        days
                      </div>
                    </div>

                    <FieldError
                      message={
                        errors.customIntervalDays
                      }
                    />
                  </div>
                ) : null}
              </div>
            </section>

            {/* =============================================
                TARGET SNAPSHOT
            ============================================= */}

            {selectedGoal ? (
              <section>
                <SectionHeader
                  icon={CalendarDays}
                  title="Goal target"
                  description="These values come from the selected saving goal and are intentionally read-only."
                />

                <div
                  className="
                    grid sm:grid-cols-3
                    gap-3
                  "
                >
                  <div
                    className="
                      p-4
                      bg-slate-50
                      rounded-xl border border-slate-200
                    "
                  >
                    <p
                      className="
                        text-[11px] text-slate-500 font-medium
                      "
                    >
                      Target amount
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm text-slate-900 font-bold
                      "
                    >
                      {formatCurrency(
                        getGoalTargetAmount(
                          selectedGoal,
                        ),
                        getGoalCurrency(selectedGoal),
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      p-4
                      bg-slate-50
                      rounded-xl border border-slate-200
                    "
                  >
                    <p
                      className="
                        text-[11px] text-slate-500 font-medium
                      "
                    >
                      Currency
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm text-slate-900 font-bold
                      "
                    >
                      {getGoalCurrency(selectedGoal)}
                    </p>
                  </div>

                  <div
                    className="
                      p-4
                      bg-slate-50
                      rounded-xl border border-slate-200
                    "
                  >
                    <p
                      className="
                        text-[11px] text-slate-500 font-medium
                      "
                    >
                      Target date
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm text-slate-900 font-bold
                      "
                    >
                      {formatDate(
                        selectedGoal?.targetDate ||
                          selectedGoal?.target
                            ?.targetDate,
                      )}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex items-start
                    mt-3 p-3
                    bg-blue-50/60
                    rounded-xl border border-blue-100
                    gap-3
                  "
                >
                  <Info
                    size={17}
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
                      text-xs text-blue-800 leading-5
                    "
                  >
                    The saving plan does not create a second
                    financial target. Its target is synchronized
                    from the selected goal by the backend.
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </form>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between
            px-5 sm:px-7 py-4
            bg-slate-50/70
            border-t border-slate-100
            shrink-0 gap-3
          "
        >
          <div
            className="
              flex items-center
              text-xs text-slate-500
              gap-2
            "
          >
            <Info size={14} aria-hidden="true" />

            <span>
              Your selected goal remains the source of truth.
            </span>
          </div>

          <div
            className="
              flex
              w-full sm:w-auto
              gap-3
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                flex-1 sm:flex-none
                px-5 py-3
                text-sm text-slate-700 font-semibold
                bg-white hover:bg-slate-50
                rounded-xl border border-slate-200 hover:border-slate-300
                focus:outline-none focus:ring-4 focus:ring-slate-500/10
                transition disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              form="create-saving-plan-form"
              disabled={!canSubmit}
              className="
                flex flex-1 sm:flex-none items-center justify-center
                px-5 py-3
                text-sm text-white font-semibold
                bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300
                rounded-xl focus:outline-none
                focus:ring-4 focus:ring-blue-500/20
                shadow-sm shadow-blue-600/20 disabled:shadow-none transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {submitting ? (
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
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />
                  Create saving plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateSavingPlanModal);