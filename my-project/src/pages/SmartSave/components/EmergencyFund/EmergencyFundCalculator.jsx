import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import useEmergencyFundCalculator from "../../../../hooks/useEmergencyFundCalculator";

import {
  EMERGENCY_FUND_DEFAULTS,
  EMERGENCY_FUND_HEALTH_CONFIG,
} from "../../../../constants/emergencyFundConstants";

import {
  formatEmergencyCurrency,
  formatMonths,
  formatPercentage,
} from "../../../../utils/smartSave/emergencyFundFormatters";

/* =========================================================
   CONSTANTS
========================================================= */

const FIELD_IDS = Object.freeze({
  monthlyExpenses: "emergency-fund-monthly-expenses",
  currentFund: "emergency-fund-current-fund",
  monthlyIncome: "emergency-fund-monthly-income",
  monthlyContribution:
    "emergency-fund-monthly-contribution",
  targetMonths: "emergency-fund-target-months",
});

const DEFAULT_TARGET_MONTHS =
  Number(
    EMERGENCY_FUND_DEFAULTS.targetMonths
  ) || 3;

const MIN_TARGET_MONTHS =
  Number(
    EMERGENCY_FUND_DEFAULTS.minimumTargetMonths
  ) || 1;

const MAX_TARGET_MONTHS =
  Number(
    EMERGENCY_FUND_DEFAULTS.maximumTargetMonths
  ) || 12;

const normalizeInitialNumber = (
  value,
  fallback = ""
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? String(numericValue)
    : fallback;
};

const clampTargetMonths = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_TARGET_MONTHS;
  }

  return Math.min(
    Math.max(
      Math.trunc(numericValue),
      MIN_TARGET_MONTHS
    ),
    MAX_TARGET_MONTHS
  );
};

/* =========================================================
   FIELD
========================================================= */

const Field = ({
  id,
  label,
  description,
  value,
  onChange,
  min = 0,
  step = "0.01",
  required = false,
  disabled = false,
  error = null,
}) => {
  const descriptionId = description
    ? `${id}-description`
    : undefined;

  const errorId = error
    ? `${id}-error`
    : undefined;

  const describedBy = [
    descriptionId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="
          block
        "
      >
        <span
          className="
            font-medium text-slate-800 text-sm
          "
        >
          {label}

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
        </span>

        {description ? (
          <span
            id={descriptionId}
            className="
              block
              mt-1
              text-slate-500 text-xs leading-5
            "
          >
            {description}
          </span>
        ) : null}
      </label>

      <input
        id={id}
        name={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        required={required}
        inputMode="decimal"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="bg-white disabled:bg-slate-50 mt-2 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 w-full min-h-11 text-slate-900 disabled:text-slate-400 text-sm transition"
      />

      {error ? (
        <p
          id={errorId}
          className="
            mt-1.5
            text-red-600 text-xs
          "
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

/* =========================================================
   RESULT METRIC
========================================================= */

const ResultMetric = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
  <div
    className="
      p-4
      bg-white
      border border-slate-200 rounded-xl
    "
  >
    <div
      className="
        flex items-center
        text-slate-500
        gap-2
      "
    >
      <Icon
        size={16}
        aria-hidden="true"
      />

      <span
        className="
          font-medium text-xs
        "
      >
        {label}
      </span>
    </div>

    <p
      className="
        mt-2
        font-bold text-slate-900 text-base
      "
    >
      {value}
    </p>

    {description ? (
      <p
        className="
          mt-1
          text-slate-500 text-xs leading-5
        "
      >
        {description}
      </p>
    ) : null}
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmergencyFundCalculator = ({
  initialValues = {},
  onCalculated,
  className = "",
}) => {
  /* =======================================================
     INITIAL FORM STATE
  ======================================================= */

  const [
    monthlyExpenses,
    setMonthlyExpenses,
  ] = useState(() =>
    normalizeInitialNumber(
      initialValues.monthlyEssentialExpenses
    )
  );

  const [
    currentFund,
    setCurrentFund,
  ] = useState(() =>
    normalizeInitialNumber(
      initialValues.currentFund
    )
  );

  const [
    targetMonths,
    setTargetMonths,
  ] = useState(() =>
    String(
      clampTargetMonths(
        initialValues.targetMonths ??
          DEFAULT_TARGET_MONTHS
      )
    )
  );

  const [
    monthlyIncome,
    setMonthlyIncome,
  ] = useState(() =>
    normalizeInitialNumber(
      initialValues.monthlyIncome
    )
  );

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] = useState(() =>
    normalizeInitialNumber(
      initialValues.monthlyContribution
    )
  );

  const [
    validationError,
    setValidationError,
  ] = useState(null);

  /* =======================================================
     CALCULATOR HOOK
  ======================================================= */

  const {
    result,
    loading,
    error,
    calculate,
  } =
    useEmergencyFundCalculator();

  /* =======================================================
     TARGET OPTIONS
  ======================================================= */

  const targetMonthOptions =
    useMemo(() => {
      const count =
        MAX_TARGET_MONTHS -
        MIN_TARGET_MONTHS +
        1;

      return Array.from(
        { length: Math.max(count, 0) },
        (_, index) =>
          MIN_TARGET_MONTHS + index
      );
    }, []);

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validateForm =
    useCallback(() => {
      const expenses =
        Number(monthlyExpenses);

      const current =
        Number(currentFund || 0);

      const income =
        Number(monthlyIncome || 0);

      const contribution =
        Number(
          monthlyContribution || 0
        );

      const months =
        Number(targetMonths);

      if (
        !monthlyExpenses ||
        !Number.isFinite(expenses) ||
        expenses <= 0
      ) {
        return "Enter a valid monthly essential expense amount.";
      }

      if (
        !Number.isFinite(current) ||
        current < 0
      ) {
        return "Current emergency fund cannot be negative.";
      }

      if (
        !Number.isFinite(income) ||
        income < 0
      ) {
        return "Monthly income cannot be negative.";
      }

      if (
        !Number.isFinite(contribution) ||
        contribution < 0
      ) {
        return "Monthly emergency contribution cannot be negative.";
      }

      if (
        !Number.isFinite(months) ||
        months < MIN_TARGET_MONTHS ||
        months > MAX_TARGET_MONTHS
      ) {
        return `Choose an emergency-fund target between ${MIN_TARGET_MONTHS} and ${MAX_TARGET_MONTHS} months.`;
      }

      if (
        income > 0 &&
        contribution > income
      ) {
        return "Monthly emergency contribution cannot be greater than monthly income.";
      }

      return null;
    }, [
      monthlyExpenses,
      currentFund,
      monthlyIncome,
      monthlyContribution,
      targetMonths,
    ]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (loading) {
          return;
        }

        const validationMessage =
          validateForm();

        if (validationMessage) {
          setValidationError(
            validationMessage
          );

          return;
        }

        setValidationError(null);

        const payload = {
          monthlyEssentialExpenses:
            Number(monthlyExpenses),

          currentFund:
            Number(currentFund || 0),

          targetMonths:
            clampTargetMonths(
              targetMonths
            ),

          monthlyIncome:
            Number(monthlyIncome || 0),

          monthlyContribution:
            Number(
              monthlyContribution || 0
            ),
        };

        try {
          const calculated =
            await calculate(payload);

          if (
            typeof onCalculated ===
              "function" &&
            calculated
          ) {
            onCalculated(calculated);
          }
        } catch {
          /*
           * The calculator hook owns the calculation
           * error state. We deliberately do not duplicate
           * that error here.
           */
        }
      },
      [
        loading,
        validateForm,
        monthlyExpenses,
        currentFund,
        targetMonths,
        monthlyIncome,
        monthlyContribution,
        calculate,
        onCalculated,
      ]
    );

  /* =======================================================
     DERIVED RESULT STATE
  ======================================================= */

  const healthConfig =
    result
      ? EMERGENCY_FUND_HEALTH_CONFIG?.[
          result.health
        ] ?? null
      : null;

  const progressPercentage =
    result
      ? Math.min(
          Math.max(
            Number(
              result.progressPercentage
            ) || 0,
            0
          ),
          100
        )
      : 0;

  const currentFundAmount =
    Number(result?.currentFund) || 0;

  const targetAmount =
    Number(result?.targetAmount) || 0;

  const remainingAmount =
    Number(result?.remainingAmount) || 0;

  const recommendedContribution =
    Number(
      result?.recommendedContribution
    ) || 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
        ${className}
      `}
      aria-labelledby="emergency-fund-calculator-title"
      aria-busy={loading}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <ShieldCheck
            size={20}
            className="
              text-slate-700
            "
            /
          >
        </div>

        <div>
          <h2
            id="emergency-fund-calculator-title"
            className="
              font-bold text-slate-900 text-base
            "
          >
            Emergency Fund Calculator
          </h2>

          <p
            className="
              mt-1
              text-slate-500 text-sm leading-5
            "
          >
            Estimate how much you need for a
            financial safety buffer and how
            quickly you can build it.
          </p>
        </div>
      </header>

      {/* ===================================================
          FORM
      =================================================== */}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="
          space-y-5 mt-6
        "
      >
        <div
          className="
            grid grid-cols-1 md:grid-cols-2
            gap-4
          "
        >
          <Field
            id={FIELD_IDS.monthlyExpenses}
            label="Monthly essential expenses"
            description="Housing, food, utilities, transportation and other essential costs."
            value={monthlyExpenses}
            onChange={(value) => {
              setMonthlyExpenses(value);

              if (validationError) {
                setValidationError(null);
              }
            }}
            required
            disabled={loading}
            error={
              validationError &&
              !monthlyExpenses
                ? validationError
                : null
            }
          />

          <Field
            id={FIELD_IDS.currentFund}
            label="Current emergency fund"
            description="How much you currently have reserved for emergencies."
            value={currentFund}
            onChange={setCurrentFund}
            disabled={loading}
          />

          <Field
            id={FIELD_IDS.monthlyIncome}
            label="Monthly income"
            description="Used to estimate your emergency-fund savings rate."
            value={monthlyIncome}
            onChange={setMonthlyIncome}
            disabled={loading}
          />

          <Field
            id={FIELD_IDS.monthlyContribution}
            label="Monthly emergency contribution"
            description="How much you plan to contribute each month."
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            disabled={loading}
          />
        </div>

        {/* =================================================
            TARGET MONTHS
        ================================================= */}

        <div>
          <label
            htmlFor={FIELD_IDS.targetMonths}
            className="
              block
            "
          >
            <span
              className="
                font-medium text-slate-800 text-sm
              "
            >
              Emergency-fund target
            </span>

            <span
              id={`${FIELD_IDS.targetMonths}-description`}
              className="
                block
                mt-1
                text-slate-500 text-xs
              "
            >
              Most people use 3–6 months of
              essential expenses.
            </span>

            <select
              id={FIELD_IDS.targetMonths}
              name={FIELD_IDS.targetMonths}
              value={targetMonths}
              onChange={(event) =>
                setTargetMonths(
                  String(
                    clampTargetMonths(
                      event.target.value
                    )
                  )
                )
              }
              disabled={loading}
              aria-describedby={`${FIELD_IDS.targetMonths}-description`}
              className="bg-white disabled:bg-slate-50 mt-2 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 w-full min-h-11 text-slate-900 disabled:text-slate-400 text-sm"
            >
              {targetMonthOptions.map(
                (months) => (
                  <option
                    key={months}
                    value={months}
                  >
                    {months}{" "}
                    {months === 1
                      ? "month"
                      : "months"}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        {/* =================================================
            VALIDATION ERROR
        ================================================= */}

        {validationError ? (
          <div
            className="
              flex items-start
              p-4
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-3
            "
            role="alert"
          >
            <AlertTriangle
              size={18}
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
                  font-semibold text-amber-800 text-sm
                "
              >
                Check your information
              </p>

              <p
                className="
                  mt-1
                  text-amber-700 text-xs leading-5
                "
              >
                {validationError}
              </p>
            </div>
          </div>
        ) : null}

        {/* =================================================
            CALCULATION ERROR
        ================================================= */}

        {error ? (
          <div
            className="
              flex items-start
              p-4
              bg-red-50
              border border-red-200 rounded-xl
              gap-3
            "
            role="alert"
          >
            <AlertTriangle
              size={18}
              className="
                mt-0.5
                text-red-600
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <div>
              <p
                className="
                  font-semibold text-red-800 text-sm
                "
              >
                Calculation failed
              </p>

              <p
                className="
                  mt-1
                  text-red-700 text-xs leading-5
                "
              >
                {error}
              </p>
            </div>
          </div>
        ) : null}

        {/* =================================================
            SUBMIT
        ================================================= */}

        <button
          type="submit"
          disabled={
            loading ||
            !monthlyExpenses
          }
          aria-busy={loading}
          className="
            inline-flex justify-center items-center
            w-full min-h-11
            px-4 py-2.5
            font-semibold text-white text-sm
            bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300
            rounded-xl
            transition
            disabled:cursor-not-allowed
            gap-2
          "
        >
          <Calculator
            size={17}
            aria-hidden="true"
          />

          {loading
            ? "Calculating..."
            : "Calculate emergency fund"}
        </button>
      </form>

      {/* ===================================================
          RESULTS
      =================================================== */}

      {result ? (
        <div
          className="
            mt-7 pt-6
            border-slate-200 border-t
          "
          aria-live="polite"
        >
          {/* ===============================================
              HEALTH
          =============================================== */}

          <div
            className="
              flex items-start
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-10 h-10
                bg-slate-100
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              {result.isComplete ? (
                <CheckCircle2
                  size={20}
                  className="
                    text-emerald-600
                  "
                  /
                >
              ) : (
                <TrendingUp
                  size={20}
                  className="
                    text-slate-700
                  "
                  /
                >
              )}
            </div>

            <div>
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <h3
                  className="
                    font-bold text-slate-900 text-sm
                  "
                >
                  Emergency-fund health
                </h3>

                <span
                  className="
                    px-2 py-1
                    font-semibold text-[11px] text-slate-700
                    bg-slate-100
                    rounded-full
                  "
                >
                  {healthConfig?.label ||
                    result.healthLabel ||
                    "Not assessed"}
                </span>
              </div>

              {result.healthMessage ? (
                <p
                  className="
                    mt-1
                    text-slate-500 text-xs leading-5
                  "
                >
                  {result.healthMessage}
                </p>
              ) : null}
            </div>
          </div>

          {/* ===============================================
              PROGRESS
          =============================================== */}

          <div
            className="
              mt-5
            "
          >
            <div
              className="
                flex justify-between items-center
                mb-2
              "
            >
              <span
                className="
                  font-medium text-slate-500 text-xs
                "
              >
                Fund progress
              </span>

              <span
                className="
                  font-bold text-slate-900 text-sm
                "
              >
                {formatPercentage(
                  progressPercentage
                )}
              </span>
            </div>

            <div
              className="
                overflow-hidden
                h-2.5
                bg-slate-100
                rounded-full
              "
              role="progressbar"
              aria-valuenow={
                progressPercentage
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Emergency fund progress"
            >
              <div
                className="
                  h-full
                  bg-slate-900
                  rounded-full
                  transition-all duration-500
                "
                style={{
                  width: `${progressPercentage}%`,
                }}
              /
              >
            </div>

            <div
              className="
                flex justify-between
                mt-2
                text-xs
              "
            >
              <span
                className="
                  text-slate-500
                "
              >
                {formatEmergencyCurrency(
                  currentFundAmount,
                  result.currency
                )}
              </span>

              <span
                className="
                  font-medium text-slate-700
                "
              >
                {formatEmergencyCurrency(
                  targetAmount,
                  result.currency
                )}
              </span>
            </div>
          </div>

          {/* ===============================================
              METRICS
          =============================================== */}

          <div
            className="
              grid grid-cols-1 sm:grid-cols-2
              mt-5
              gap-3
            "
          >
            <ResultMetric
              icon={Target}
              label="Recommended target"
              value={formatEmergencyCurrency(
                targetAmount,
                result.currency
              )}
              description={`${result.targetMonths} months of essential expenses`}
            />

            <ResultMetric
              icon={ShieldCheck}
              label="Coverage"
              value={formatMonths(
                result.monthsCovered
              )}
              description="Current emergency coverage"
            />

            <ResultMetric
              icon={TrendingUp}
              label="Recommended contribution"
              value={formatEmergencyCurrency(
                recommendedContribution,
                result.currency
              )}
              description="Suggested monthly contribution"
            />

            <ResultMetric
              icon={Calculator}
              label="Remaining"
              value={formatEmergencyCurrency(
                remainingAmount,
                result.currency
              )}
              description="Amount needed to reach target"
            />
          </div>

          {/* ===============================================
              RECOMMENDATION
          =============================================== */}

          <div
            className="
              flex items-start
              mt-5 p-4
              bg-slate-50
              border border-slate-200 rounded-xl
              gap-3
            "
          >
            <TrendingUp
              size={17}
              className="
                mt-0.5
                text-slate-600
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <div>
              <p
                className="
                  font-semibold text-slate-800 text-xs
                "
              >
                SmartSave recommendation
              </p>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs leading-5
                "
              >
                {result.isComplete
                  ? "Your emergency fund has reached the recommended target. You can now redirect additional savings toward your other financial goals."
                  : `Consider allocating approximately ${formatEmergencyCurrency(
                      recommendedContribution,
                      result.currency
                    )} per month toward your emergency fund until you reach your ${result.targetMonths}-month target.`}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default EmergencyFundCalculator;