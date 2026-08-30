
// components/.../SavingStrategiesModal.jsx

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  PiggyBank,
  Target,
  X,
} from "lucide-react";

import {
  SAVINGS_PLAN_STATUS,
  SAVINGS_FREQUENCIES,
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

const FIXED_STRATEGY =
  SAVINGS_STRATEGIES?.FIXED ?? "fixed";

const DEFAULT_FREQUENCY =
  SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly";

const DEFAULT_STATUS =
  SAVINGS_PLAN_STATUS?.DRAFT ?? "draft";

const FREQUENCY_OPTIONS = [
  {
    value: SAVINGS_FREQUENCIES?.DAILY ?? "daily",
    label: "Daily",
  },
  {
    value: SAVINGS_FREQUENCIES?.WEEKLY ?? "weekly",
    label: "Weekly",
  },
  {
    value: SAVINGS_FREQUENCIES?.BIWEEKLY ?? "biweekly",
    label: "Every 2 weeks",
  },
  {
    value: SAVINGS_FREQUENCIES?.MONTHLY ?? "monthly",
    label: "Monthly",
  },
  {
    value: SAVINGS_FREQUENCIES?.QUARTERLY ?? "quarterly",
    label: "Quarterly",
  },
  {
    value: SAVINGS_FREQUENCIES?.YEARLY ?? "yearly",
    label: "Yearly",
  },
];

const CURRENCY_OPTIONS = [
  {
    value: "NGN",
    label: "NGN",
    symbol: "₦",
  },
  {
    value: "USD",
    label: "USD",
    symbol: "$",
  },
  {
    value: "GBP",
    label: "GBP",
    symbol: "£",
  },
  {
    value: "EUR",
    label: "EUR",
    symbol: "€",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getText = (...values) => {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return "";
};

const getNumber = (...values) => {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
};

const getStrategyId = (strategy) => {
  if (
    !strategy ||
    typeof strategy !== "object"
  ) {
    return null;
  }

  const id =
    strategy._id ??
    strategy.id ??
    strategy.planId ??
    strategy.strategyId;

  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    return null;
  }

  return String(id);
};

/* =========================================================
   FORM FACTORY
========================================================= */

const createInitialForm = (strategy = null) => ({
  name: getText(
    strategy?.name,
    strategy?.title,
    strategy?.planName,
    strategy?.strategyName
  ),

  description: getText(
    strategy?.description,
    strategy?.summary,
    strategy?.note
  ),

  strategy:
    getText(
      strategy?.strategy,
      strategy?.strategyType,
      strategy?.method,
      strategy?.type
    ) || FIXED_STRATEGY,

  amount: (() => {
    const amount = getNumber(
      strategy?.amount,
      strategy?.contributionAmount,
      strategy?.fixedAmount,
      strategy?.savingAmount,
      strategy?.metrics?.contributionAmount
    );

    return amount > 0 ? String(amount) : "";
  })(),

  targetAmount: (() => {
    const target = getNumber(
      strategy?.targetAmount,
      strategy?.target,
      strategy?.goalAmount,
      strategy?.progress?.target
    );

    return target > 0 ? String(target) : "";
  })(),

  frequency:
    getText(
      strategy?.frequency,
      strategy?.schedule?.frequency
    ) || DEFAULT_FREQUENCY,

  currency:
    getText(
      strategy?.currency,
      strategy?.targetCurrency,
      strategy?.savingAccount?.currency
    ) || DEFAULT_CURRENCY,

  status:
    getText(
      strategy?.status,
      strategy?.state
    ) || DEFAULT_STATUS,
});

/* =========================================================
   VALIDATION
========================================================= */

const validateForm = (form) => {
  const errors = {};

  const name = form.name.trim();
  const amount = Number(form.amount);

  const targetAmount =
    form.targetAmount === ""
      ? 0
      : Number(form.targetAmount);

  if (!name) {
    errors.name =
      "Please enter a strategy name.";
  } else if (name.length < 3) {
    errors.name =
      "Strategy name must be at least 3 characters.";
  } else if (name.length > 100) {
    errors.name =
      "Strategy name cannot exceed 100 characters.";
  }

  if (
    form.amount === "" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    errors.amount =
      "Enter a valid contribution amount greater than zero.";
  }

  if (
    form.targetAmount !== "" &&
    (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    )
  ) {
    errors.targetAmount =
      "Target amount must be greater than zero.";
  }

  if (
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isFinite(targetAmount) &&
    targetAmount > 0 &&
    amount > targetAmount
  ) {
    errors.amount =
      "Contribution amount cannot be greater than the target.";
  }

  if (!form.frequency) {
    errors.frequency =
      "Please select a savings frequency.";
  }

  if (!form.currency) {
    errors.currency =
      "Please select a currency.";
  }

  return errors;
};

/* =========================================================
   PAYLOAD
========================================================= */

const buildPayload = (form, strategy) => {
  const payload = {
    name: form.name.trim(),

    description:
      form.description.trim(),

    strategy: FIXED_STRATEGY,

    amount: Number(form.amount),

    contributionAmount:
      Number(form.amount),

    frequency:
      form.frequency,

    currency:
      form.currency || DEFAULT_CURRENCY,
  };

  if (form.targetAmount !== "") {
    payload.targetAmount =
      Number(form.targetAmount);
  }

  const strategyId =
    getStrategyId(strategy);

  if (strategyId) {
    payload.strategyId = strategyId;
  }

  return payload;
};

/* =========================================================
   FIELD ERROR
========================================================= */

const FieldError = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      className="
        flex items-center
        mt-1.5
        text-red-600 text-xs
        gap-1.5
      "
      role="alert"
    >
      <AlertCircle
        size={13}
        strokeWidth={2}
        aria-hidden="true"
      />

      {message}
    </p>
  );
};

/* =========================================================
   INPUT CLASS HELPER
========================================================= */

const getInputClass = (hasError = false) => `
  w-full
  mt-2
  px-3.5
  py-2.5
  text-slate-900
  text-sm
  bg-white
  border
  rounded-xl
  outline-none
  transition
  placeholder:text-slate-400
  disabled:bg-slate-50
  disabled:cursor-not-allowed
  focus:ring-2
  ${
    hasError
      ? `
        border-red-300
        focus:border-red-400
        focus:ring-red-100
      `
      : `
        border-slate-200
        focus:border-slate-400
        focus:ring-slate-100
      `
  }
`;

/* =========================================================
   COMPONENT
========================================================= */

const SavingStrategiesModal = ({
  isOpen = false,
  strategy = null,
  onClose,
  onSubmit,
  loading = false,
  error = null,
  title,
  submitLabel,
}) => {
  /*
   * IMPORTANT
   *
   * We derive the initial form from the current strategy.
   *
   * No useEffect + setState is used here.
   */

  const initialForm = useMemo(
    () => createInitialForm(strategy),
    [strategy]
  );

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [submitError, setSubmitError] =
    useState(null);

  const isEditMode =
    Boolean(getStrategyId(strategy));

  const currencySymbol =
    CURRENCY_OPTIONS.find(
      (currency) =>
        currency.value === form.currency
    )?.symbol ?? "₦";

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const next = {
        ...previous,
      };

      delete next[name];

      return next;
    });

    setSubmitError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const validationErrors =
      validateForm(form);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    if (
      typeof onSubmit !== "function"
    ) {
      setSubmitError(
        "Unable to save this strategy. No submit handler was provided."
      );

      return;
    }

    setErrors({});
    setSubmitError(null);

    const payload =
      buildPayload(
        form,
        strategy
      );

    try {
      await onSubmit(
        payload,
        strategy
      );
    } catch (submissionError) {
      const message =
        submissionError?.response?.data
          ?.message ??
        submissionError?.message ??
        "Unable to save this strategy. Please try again.";

      setSubmitError(message);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setErrors({});
    setSubmitError(null);

    if (
      typeof onClose === "function"
    ) {
      onClose();
    }
  };

  const handleBackdropClick = (
    event
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      handleClose();
    }
  };

  const modalTitle =
    title ??
    (
      isEditMode
        ? "Edit saving strategy"
        : "Create saving strategy"
    );

  const actionLabel =
    submitLabel ??
    (
      isEditMode
        ? "Save changes"
        : "Create strategy"
    );

  const externalError =
    typeof error === "string"
      ? error
      : error?.message ?? null;

  const displayedError =
    submitError ??
    externalError;

  /* =======================================================
     RENDER
  ======================================================= */
const handleMouseDown = (event)=> event.stopPropagation()
  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-center
        p-4
        bg-slate-950/40
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="saving-strategies-modal-title"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="
          overflow-hidden
          w-full max-w-xl max-h-[90vh]
          bg-white
          border border-slate-200 rounded-2xl
          shadow-2xl
        "
        onMouseDown={handleMouseDown}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex justify-between items-start
            px-5 sm:px-6 py-5
            border-slate-100 border-b
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
                w-11 h-11
                text-slate-700
                bg-slate-100
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <PiggyBank
                size={21}
                strokeWidth={2}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="saving-strategies-modal-title"
                className="
                  font-semibold text-slate-900 text-base leading-6
                "
              >
                {modalTitle}
              </h2>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs leading-5
                "
              >
                Set a consistent amount and
                schedule for your savings plan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              inline-flex justify-center items-center
              w-9 h-9
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
            aria-label="Close modal"
          >
            <X
              size={18}
              strokeWidth={2}
            />
          </button>
        </header>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div
            className="
              overflow-y-auto
              max-h-[calc(90vh-170px)]
              px-5 sm:px-6 py-5
            "
          >

            {/* =============================================
                ERROR
            ============================================= */}

            {displayedError && (
              <div
                className="
                  flex items-start
                  mb-5 p-3.5
                  text-red-700
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

                <p
                  className="
                    text-xs leading-5
                  "
                >
                  {displayedError}
                </p>
              </div>
            )}

            {/* =============================================
                STRATEGY TYPE
            ============================================= */}

            <div
              className="
                flex items-center
                mb-5 p-3.5
                bg-slate-50
                border border-slate-200 rounded-xl
                gap-3
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-9 h-9
                  text-slate-700
                  bg-white
                  rounded-lg
                  shadow-sm
                  shrink-0
                "
                aria-hidden="true"
              >
                <Target
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-slate-800 text-xs
                  "
                >
                  Fixed amount strategy
                </p>

                <p
                  className="
                    mt-0.5
                    text-[11px] text-slate-500
                  "
                >
                  Save the same amount every
                  time your schedule runs.
                </p>
              </div>

              <CheckCircle2
                size={17}
                className="
                  ml-auto
                  text-emerald-600
                  shrink-0
                "
                aria-label="Fixed amount strategy"
              /
              >
            </div>

            {/* =============================================
                NAME
            ============================================= */}

            <div
              className="
                mb-5
              "
            >
              <label
                htmlFor="strategy-name"
                className="
                  block
                  font-semibold text-slate-700 text-xs
                "
              >
                Strategy name
              </label>

              <input
                id="strategy-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                maxLength={100}
                placeholder="e.g. Monthly emergency fund"
                className={getInputClass(
                  Boolean(errors.name)
                )}
              />

              <FieldError
                message={errors.name}
              />
            </div>

            {/* =============================================
                DESCRIPTION
            ============================================= */}

            <div
              className="
                mb-5
              "
            >
              <label
                htmlFor="strategy-description"
                className="
                  block
                  font-semibold text-slate-700 text-xs
                "
              >
                Description

                <span
                  className="
                    ml-1
                    font-normal text-slate-400
                  "
                >
                  Optional
                </span>
              </label>

              <textarea
                id="strategy-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                maxLength={500}
                placeholder="Describe what this savings strategy is for..."
                className="
                  w-full
                  mt-2 px-3.5 py-2.5
                  text-slate-900 placeholder:text-slate-400 text-sm leading-6
                  bg-white disabled:bg-slate-50
                  border border-slate-200 focus:border-slate-400 rounded-xl
                  outline-none focus:ring-2 focus:ring-slate-100
                  transition
                  resize-none disabled:cursor-not-allowed
                "
                /
              >
            </div>

            {/* =============================================
                CONTRIBUTION + CURRENCY
            ============================================= */}

            <div
              className="
                grid grid-cols-1 sm:grid-cols-[1fr_120px]
                mb-5
                gap-3
              "
            >
              <div>
                <label
                  htmlFor="strategy-amount"
                  className="
                    block
                    font-semibold text-slate-700 text-xs
                  "
                >
                  Fixed contribution
                </label>

                <div
                  className="
                    relative
                    mt-2
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
                    {currencySymbol}
                  </span>

                  <input
                    id="strategy-amount"
                    name="amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="5000"
                    className={`
                      ${getInputClass(
                        Boolean(errors.amount)
                      )}
                      pl-8
                    `}
                  />
                </div>

                <FieldError
                  message={errors.amount}
                />
              </div>

              <div>
                <label
                  htmlFor="strategy-currency"
                  className="
                    block
                    font-semibold text-slate-700 text-xs
                  "
                >
                  Currency
                </label>

                <select
                  id="strategy-currency"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  disabled={loading}
                  className="
                    w-full
                    mt-2 px-3 py-2.5
                    text-slate-900 text-sm
                    bg-white disabled:bg-slate-50
                    border border-slate-200 focus:border-slate-400 rounded-xl
                    outline-none focus:ring-2 focus:ring-slate-100
                    transition
                    disabled:cursor-not-allowed
                  "
                >
                  {CURRENCY_OPTIONS.map(
                    (currency) => (
                      <option
                        key={currency.value}
                        value={currency.value}
                      >
                        {currency.label}
                      </option>
                    )
                  )}
                </select>

                <FieldError
                  message={errors.currency}
                />
              </div>
            </div>

            {/* =============================================
                TARGET
            ============================================= */}

            <div
              className="
                mb-5
              "
            >
              <label
                htmlFor="strategy-target"
                className="
                  block
                  font-semibold text-slate-700 text-xs
                "
              >
                Savings target

                <span
                  className="
                    ml-1
                    font-normal text-slate-400
                  "
                >
                  Optional
                </span>
              </label>

              <div
                className="
                  relative
                  mt-2
                "
              >
                <Target
                  size={16}
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
                  id="strategy-target"
                  name="targetAmount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.targetAmount}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="100000"
                  className={`
                    ${getInputClass(
                      Boolean(errors.targetAmount)
                    )}
                    pl-10
                  `}
                />
              </div>

              <FieldError
                message={errors.targetAmount}
              />
            </div>

            {/* =============================================
                FREQUENCY
            ============================================= */}

            <div
              className="
                mb-2
              "
            >
              <label
                htmlFor="strategy-frequency"
                className="
                  block
                  font-semibold text-slate-700 text-xs
                "
              >
                Contribution frequency
              </label>

              <div
                className="
                  relative
                  mt-2
                "
              >
                <CalendarClock
                  size={16}
                  className="
                    top-1/2 left-3.5 absolute
                    text-slate-400
                    pointer-events-none
                    -translate-y-1/2
                  "
                  aria-hidden="true"
                /
                >

                <select
                  id="strategy-frequency"
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  disabled={loading}
                  className="
                    w-full
                    py-2.5 pr-3.5 pl-10
                    text-slate-900 text-sm
                    bg-white disabled:bg-slate-50
                    border border-slate-200 focus:border-slate-400 rounded-xl
                    outline-none focus:ring-2 focus:ring-slate-100
                    transition
                    disabled:cursor-not-allowed
                  "
                >
                  {FREQUENCY_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <FieldError
                message={errors.frequency}
              />
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              items-stretch sm:items-center
              px-5 sm:px-6 py-4
              bg-slate-50/70
              border-slate-100 border-t
              gap-2
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                inline-flex justify-center items-center
                min-h-10
                px-4 py-2
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-lg focus:outline-none
                focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
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
                min-h-10
                px-4 py-2
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-lg focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                disabled:opacity-60 transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={15}
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
                  <CheckCircle2
                    size={15}
                    aria-hidden="true"
                  />

                  {actionLabel}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENT CONTRACT
========================================================= */

SavingStrategiesModal.displayName =
  "SavingStrategiesModal";

export default SavingStrategiesModal;
