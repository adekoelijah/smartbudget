
import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PiggyBank,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { computeFinancials } from "../engine/FinancialEngine";

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (
  value = 0,
  currency = "NGN"
) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(0);
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (value = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-NG").format(number);
};

const formatPercent = (value = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.0%";
  }

  return `${number.toFixed(1)}%`;
};

/* =========================================================
   SAFE NUMBER
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/* =========================================================
   TREND INDICATOR
========================================================= */

const TrendIndicator = ({
  value = 0,
  positiveIsGood = true,
}) => {
  const trend = toNumber(value);

  if (trend === 0) {
    return (
      <span
        className="
          inline-flex items-center
          px-2 py-1
          font-semibold text-[11px] text-slate-500
          bg-slate-50
          border border-slate-200 rounded-full
        "
      >
        No change
      </span>
    );
  }

  const isPositive =
    positiveIsGood
      ? trend > 0
      : trend < 0;

  const Icon =
    trend > 0
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-0.5
        rounded-full
        border
        px-2 py-1
        text-[11px]
        font-semibold
        ${
          isPositive
            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
            : "border-rose-100 bg-rose-50 text-rose-600"
        }
      `}
    >
      <Icon size={12} strokeWidth={2.5} />

      {Math.abs(trend).toFixed(1)}%
    </span>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  trend,
  positiveIsGood = true,
  tone = "neutral",
  primary = false,
}) => {
  const tones = {
    primary: {
      icon:
        "bg-slate-900 text-white",
      border:
        "border-slate-200",
      accent:
        "bg-slate-900",
    },

    income: {
      icon:
        "bg-emerald-50 text-emerald-600",
      border:
        "border-emerald-100",
      accent:
        "bg-emerald-500",
    },

    expense: {
      icon:
        "bg-rose-50 text-rose-600",
      border:
        "border-rose-100",
      accent:
        "bg-rose-500",
    },

    savings: {
      icon:
        "bg-blue-50 text-blue-600",
      border:
        "border-blue-100",
      accent:
        "bg-blue-500",
    },

    cashflow: {
      icon:
        "bg-violet-50 text-violet-600",
      border:
        "border-violet-100",
      accent:
        "bg-violet-500",
    },

    neutral: {
      icon:
        "bg-slate-50 text-slate-600",
      border:
        "border-slate-200",
      accent:
        "bg-slate-400",
    },
  };

  const activeTone =
    tones[tone] || tones.neutral;

  return (
    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        bg-white
        ${activeTone.border}
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${
          primary
            ? "min-h-[170px]"
            : "min-h-[155px]"
        }
      `}
    >
      {/* Top accent */}

      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-0.5
          ${activeTone.accent}
        `}
      />

      {/* Header */}

      <div
        className="
          flex justify-between items-start
          gap-4
        "
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${activeTone.icon}
          `}
        >
          <Icon
            size={19}
            strokeWidth={2}
          />
        </div>

        {trend !== undefined && (
          <TrendIndicator
            value={trend}
            positiveIsGood={
              positiveIsGood
            }
          />
        )}
      </div>

      {/* Content */}

      <div
        className="
          mt-5
        "
      >
        <p
          className="
            font-semibold text-[11px] text-slate-400 uppercase tracking-[0.08em]
          "
        >
          {label}
        </p>

        <h3
          className={`
            mt-1.5
            truncate
            font-bold
            tracking-tight
            text-slate-900
            ${
              primary
                ? "text-2xl"
                : "text-xl"
            }
          `}
          title={value}
        >
          {value}
        </h3>

        {description && (
          <p
            className="
              mt-2
              text-slate-500 text-xs line-clamp-2 leading-5
            "
          >
            {description}
          </p>
        )}
      </div>
    </article>
  );
};

/* =========================================================
   DASHBOARD STATS
========================================================= */

const DashboardStats = ({
  transactions = [],
  currency = "NGN",
}) => {
  /*
   * FinancialEngine remains the single
   * source of truth.
   */

  const financials = useMemo(() => {
    return computeFinancials(
      Array.isArray(transactions)
        ? transactions
        : []
    );
  }, [transactions]);

  const {
    income = 0,
    expense = 0,
    balance = 0,

    savingsRatio = 0,

    transactionCount = 0,

    incomeTrend = 0,
    expenseTrend = 0,
  } = financials || {};

  /* =======================================================
     DERIVED METRICS
  ======================================================= */

  const netCashFlow =
    toNumber(income) -
    toNumber(expense);

  const savingsAmount =
    Math.max(netCashFlow, 0);

  const isPositiveBalance =
    toNumber(balance) >= 0;

  const savingsDescription =
    savingsAmount > 0
      ? `${formatCurrency(
          savingsAmount,
          currency
        )} retained after expenses`
      : "No positive savings recorded";

  const cashFlowDescription =
    netCashFlow > 0
      ? "Money coming in exceeds money going out"
      : netCashFlow < 0
      ? "Expenses currently exceed income"
      : "Income and expenses are balanced";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-label="Financial overview"
      className="
        w-full
      "
    >
      {/* Section heading */}

      <div
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-end
          mb-4
          gap-1
        "
      >
        <div>
          <h2
            className="
              font-bold text-slate-900 text-base tracking-tight
            "
          >
            Financial overview
          </h2>

          <p
            className="
              text-slate-500 text-xs
            "
          >
            A real-time snapshot of your money
          </p>
        </div>

        <span
          className="
            hidden sm:block
            font-medium text-[11px] text-slate-400
          "
        >
          {formatNumber(
            transactionCount
          )}{" "}
          transaction
          {transactionCount === 1
            ? ""
            : "s"}{" "}
          recorded
        </span>
      </div>

      {/* =================================================
          KPI GRID
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6
          gap-4
        "
      >
        {/* =================================================
            1. NET BALANCE
        ================================================= */}

        <StatCard
          icon={Wallet}
          label="Net balance"
          value={formatCurrency(
            balance,
            currency
          )}
          description={
            isPositiveBalance
              ? "Your recorded income is currently above expenses"
              : "Your recorded expenses currently exceed income"
          }
          tone="primary"
          primary
        />

        {/* =================================================
            2. INCOME
        ================================================= */}

        <StatCard
          icon={ArrowUpCircle}
          label="Income"
          value={formatCurrency(
            income,
            currency
          )}
          description="Total money received"
          trend={incomeTrend}
          positiveIsGood
          tone="income"
        />

        {/* =================================================
            3. EXPENSES
        ================================================= */}

        <StatCard
          icon={ArrowDownCircle}
          label="Expenses"
          value={formatCurrency(
            expense,
            currency
          )}
          description="Total money spent"
          trend={expenseTrend}
          positiveIsGood={false}
          tone="expense"
        />

        {/* =================================================
            4. SAVINGS
        ================================================= */}

        <StatCard
          icon={PiggyBank}
          label="Savings"
          value={formatCurrency(
            savingsAmount,
            currency
          )}
          description={
            `${formatPercent(
              savingsRatio
            )} of income retained`
          }
          tone="savings"
        />

        {/* =================================================
            5. CASH FLOW
        ================================================= */}

        <StatCard
          icon={
            netCashFlow >= 0
              ? TrendingUp
              : TrendingDown
          }
          label="Cash flow"
          value={formatCurrency(
            netCashFlow,
            currency
          )}
          description={
            cashFlowDescription
          }
          tone="cashflow"
        />

        {/* =================================================
            6. ACTIVITY
        ================================================= */}

        <StatCard
          icon={Activity}
          label="Transactions"
          value={formatNumber(
            transactionCount
          )}
          description="Recorded financial activities"
          tone="neutral"
        />
      </div>
    </section>
  );
};

export default DashboardStats;