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
   FIELD
========================================================= */

const Field = ({
  label,
  description,
  value,
  onChange,
  min = 0,
  step = "0.01",
  required = false,
}) => (
  <div>
    <label
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
          >
            *
          </span>
        ) : null}
      </span>

      {description ? (
        <span
          className="
            block
            mt-1
            text-slate-500 text-xs leading-5
          "
        >
          {description}
        </span>
      ) : null}

      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="bg-white mt-2 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 w-full min-h-11 text-slate-900 text-sm transition"
      />
    </label>
  </div>
);

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
      <Icon size={16} />

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
  const [
    monthlyExpenses,
    setMonthlyExpenses,
  ] = useState(
    initialValues.monthlyEssentialExpenses ||
      ""
  );

  const [
    currentFund,
    setCurrentFund,
  ] = useState(
    initialValues.currentFund || ""
  );

  const [
    targetMonths,
    setTargetMonths,
  ] = useState(
    initialValues.targetMonths ||
      EMERGENCY_FUND_DEFAULTS.targetMonths
  );

  const [
    monthlyIncome,
    setMonthlyIncome,
  ] = useState(
    initialValues.monthlyIncome || ""
  );

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] = useState(
    initialValues.monthlyContribution ||
      ""
  );

  const {
    result,
    loading,
    error,
    calculate,
  } =
    useEmergencyFundCalculator();

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        const payload = {
          monthlyEssentialExpenses:
            Number(monthlyExpenses),

          currentFund:
            Number(currentFund || 0),

          targetMonths:
            Number(targetMonths),

          monthlyIncome:
            Number(monthlyIncome || 0),

          monthlyContribution:
            Number(
              monthlyContribution || 0
            ),
        };

        const calculated =
          await calculate(
            payload
          );

        if (
          typeof onCalculated ===
          "function"
        ) {
          onCalculated(
            calculated
          );
        }
      },
      [
        monthlyExpenses,
        currentFund,
        targetMonths,
        monthlyIncome,
        monthlyContribution,
        calculate,
        onCalculated,
      ]
    );

  const healthConfig =
    result
      ? EMERGENCY_FUND_HEALTH_CONFIG[
          result.health
        ]
      : null;

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
    >
      {/* HEADER */}

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
            Estimate how much you need for a financial
            safety buffer and how quickly you can build it.
          </p>
        </div>
      </header>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
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
            label="Monthly essential expenses"
            description="Housing, food, utilities, transportation and other essential costs."
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
            required
          />

          <Field
            label="Current emergency fund"
            description="How much you currently have reserved for emergencies."
            value={currentFund}
            onChange={setCurrentFund}
          />

          <Field
            label="Monthly income"
            description="Used to estimate your emergency-fund savings rate."
            value={monthlyIncome}
            onChange={setMonthlyIncome}
          />

          <Field
            label="Monthly emergency contribution"
            description="How much you plan to contribute each month."
            value={monthlyContribution}
            onChange={setMonthlyContribution}
          />
        </div>

        {/* TARGET MONTHS */}

        <div>
          <label
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
              className="
                block
                mt-1
                text-slate-500 text-xs
              "
            >
              Most people use 3–6 months of essential expenses.
            </span>

            <select
              value={targetMonths}
              onChange={(event) =>
                setTargetMonths(
                  event.target.value
                )
              }
              className="bg-white mt-2 px-3.5 border border-slate-200 focus:border-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 w-full min-h-11 text-slate-900 text-sm"
            >
              {Array.from(
                {
                  length:
                    EMERGENCY_FUND_DEFAULTS.maximumTargetMonths -
                    EMERGENCY_FUND_DEFAULTS.minimumTargetMonths +
                    1,
                },
                (_, index) =>
                  EMERGENCY_FUND_DEFAULTS.minimumTargetMonths +
                  index
              ).map((months) => (
                <option
                  key={months}
                  value={months}
                >
                  {months} months
                </option>
              ))}
            </select>
          </label>
        </div>

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

        <button
          type="submit"
          disabled={
            loading ||
            !monthlyExpenses
          }
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
          <Calculator size={17} />

          {loading
            ? "Calculating..."
            : "Calculate emergency fund"}
        </button>
      </form>

      {/* RESULTS */}

      {result ? (
        <div
          className="
            mt-7 pt-6
            border-slate-200 border-t
          "
        >
          {/* HEALTH */}

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
                  flex items-center
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
                    result.healthLabel}
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs leading-5
                "
              >
                {result.healthMessage}
              </p>
            </div>
          </div>

          {/* PROGRESS */}

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
                  result.progressPercentage
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
            >
              <div
                className="
                  h-full
                  bg-slate-900
                  rounded-full
                  transition-all duration-500
                "
                style={{
                  width: `${Math.min(
                    result.progressPercentage,
                    100
                  )}%`,
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
                  result.currentFund,
                  result.currency
                )}
              </span>

              <span
                className="
                  font-medium text-slate-700
                "
              >
                {formatEmergencyCurrency(
                  result.targetAmount,
                  result.currency
                )}
              </span>
            </div>
          </div>

          {/* METRICS */}

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
                result.targetAmount,
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
                result.recommendedContribution,
                result.currency
              )}
              description="Suggested monthly contribution"
            />

            <ResultMetric
              icon={Calculator}
              label="Remaining"
              value={formatEmergencyCurrency(
                result.remainingAmount,
                result.currency
              )}
              description="Amount needed to reach target"
            />
          </div>

          {/* RECOMMENDATION */}

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
                      result.recommendedContribution,
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