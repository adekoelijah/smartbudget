// import {
//   TrendingUp,
//   TrendingDown,
//   Wallet,
//   ArrowDownCircle,
//   ArrowUpCircle,
//   Percent,
//   Activity,
// } from "lucide-react";

// /* =========================
//    FORMATTERS
// ========================= */
// const formatCurrency = (value = 0) =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     maximumFractionDigits: 0,
//   }).format(Number(value || 0));

// /* =========================
//    CARD COMPONENT
// ========================= */
// const StatCard = ({
//   icon: Icon,
//   label,
//   value,
//   sub,
//   tone = "neutral",
// }) => {
//   const toneMap = {
//     positive: "bg-emerald-50 text-emerald-600",
//     negative: "bg-rose-50 text-rose-600",
//     neutral: "bg-slate-50 text-slate-600",
//     warning: "bg-amber-50 text-amber-600",
//   };

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

//       <div className="flex items-center justify-between">
//         <p className="text-xs text-slate-500">{label}</p>
//         {Icon && <Icon size={16} className="text-slate-400" />}
//       </div>

//       <h3 className="mt-2 text-lg sm:text-xl font-semibold text-slate-900">
//         {value}
//       </h3>

//       {sub && (
//         <p className="mt-2 text-xs text-slate-500">
//           {sub}
//         </p>
//       )}
//     </div>
//   );
// };

// /* =========================
//    MAIN COMPONENT
// ========================= */
// const DashboardStats = ({ data = {} }) => {
//   const totals = data?.totals || {};
//   const rates = data?.rates || {};
//   const health = data?.health || "weak";

//   const income = totals.income || 0;
//   const expense = totals.expense || 0;
//   const balance = totals.balance || 0;
//   const transactions = totals.transactions || 0;

//   const savingsRate = rates.savingsRate || 0;
//   const inflowRate = rates.inflowRate || 0;
//   const outflowRate = rates.outflowRate || 0;

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

//       {/* INCOME */}
//       <StatCard
//         icon={ArrowUpCircle}
//         label="Total Income"
//         value={formatCurrency(income)}
//         sub={`Inflow: ${inflowRate.toFixed(1)}%`}
//         tone="positive"
//       />

//       {/* EXPENSE */}
//       <StatCard
//         icon={ArrowDownCircle}
//         label="Total Expense"
//         value={formatCurrency(expense)}
//         sub={`Outflow: ${outflowRate.toFixed(1)}%`}
//         tone="negative"
//       />

//       {/* BALANCE */}
//       <StatCard
//         icon={Wallet}
//         label="Net Balance"
//         value={formatCurrency(balance)}
//         sub={
//           balance >= 0
//             ? "Positive cashflow"
//             : "Negative cashflow"
//         }
//         tone={balance >= 0 ? "positive" : "negative"}
//       />

//       {/* SAVINGS RATE */}
//       <StatCard
//         icon={Percent}
//         label="Savings Rate"
//         value={`${savingsRate.toFixed(1)}%`}
//         sub="Income retained"
//         tone={
//           savingsRate > 20
//             ? "positive"
//             : savingsRate > 0
//             ? "warning"
//             : "negative"
//         }
//       />

//       {/* TRANSACTIONS */}
//       <StatCard
//         icon={Activity}
//         label="Transactions"
//         value={transactions}
//         sub="Total activity"
//       />

//       {/* FINANCIAL HEALTH */}
//       <StatCard
//         icon={
//           health === "strong"
//             ? TrendingUp
//             : health === "stable"
//             ? Activity
//             : TrendingDown
//         }
//         label="Financial Health"
//         value={
//           health === "strong"
//             ? "Strong"
//             : health === "stable"
//             ? "Stable"
//             : "Weak"
//         }
//         sub="Based on savings behavior"
//       />
//     </div>
//   );
// };

// export default DashboardStats;



import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  Activity,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMemo } from "react";

/* =========================================
   CENTRAL FINANCIAL ENGINE
========================================= */
import {
  computeFinancials,
} from "../engine/FinancialEngine";

/* =========================================
   FORMATTERS
========================================= */
const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatPercent = (value = 0) =>
  `${Number(value || 0).toFixed(1)}%`;

/* =========================================
   HEALTH ENGINE
========================================= */
const getHealthState = (
  savingsRatio,
  efficiencyRatio
) => {
  if (
    savingsRatio >= 30 &&
    efficiencyRatio >= 70
  ) {
    return {
      label: "Strong",
      tone: "positive",
      icon: ShieldCheck,
      description:
        "Healthy cashflow and spending discipline",
    };
  }

  if (
    savingsRatio >= 10 &&
    efficiencyRatio >= 50
  ) {
    return {
      label: "Stable",
      tone: "warning",
      icon: Activity,
      description:
        "Moderate financial performance",
    };
  }

  return {
    label: "Weak",
    tone: "negative",
    icon: TrendingDown,
    description:
      "High expense pressure detected",
  };
};

/* =========================================
   CARD COMPONENT
========================================= */
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "neutral",
}) => {
  const tones = {
    positive: {
      bg: "bg-emerald-50/70",
      border: "border-emerald-100",
      icon: "text-emerald-600",
      glow: "shadow-emerald-100",
    },

    negative: {
      bg: "bg-rose-50/70",
      border: "border-rose-100",
      icon: "text-rose-600",
      glow: "shadow-rose-100",
    },

    warning: {
      bg: "bg-amber-50/70",
      border: "border-amber-100",
      icon: "text-amber-600",
      glow: "shadow-amber-100",
    },

    neutral: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: "text-slate-600",
      glow: "shadow-slate-100",
    },
  };

  const activeTone =
    tones[tone] || tones.neutral;

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-3xl border
        ${activeTone.border}
        bg-white/90 backdrop-blur-xl
        p-5
        shadow-sm hover:shadow-lg
        transition-all duration-300
      `}
    >
      {/* Glow */}
      <div
        className={`
          absolute -top-10 -right-10
          h-28 w-28 rounded-full blur-3xl opacity-20
          ${activeTone.bg}
        `}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
            {label}
          </p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`
            flex h-11 w-11 items-center justify-center
            rounded-2xl border bg-white
            ${activeTone.border}
            shadow-sm
          `}
        >
          <Icon
            size={18}
            className={activeTone.icon}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-center justify-between">
        <p className="text-xs text-slate-500 leading-relaxed">
          {sub}
        </p>

        {trend !== undefined && (
          <div
            className={`
              rounded-full px-2.5 py-1
              text-[11px] font-semibold
              ${activeTone.bg}
              ${activeTone.icon}
            `}
          >
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */
const DashboardStats = ({
  transactions = [],
}) => {
  /**
   * SINGLE SOURCE OF TRUTH
   */
  const financials = useMemo(() => {
    return computeFinancials(
      transactions
    );
  }, [transactions]);

  const {
    income,
    expense,
    balance,

    savingsRatio,
    expenseRatio,
    efficiencyRatio,

    transactionCount,

    incomeTrend,
    expenseTrend,

    healthScore,
  } = financials;

  /**
   * FLOW RATIOS
   */
  const totalFlow =
    income + expense;

  const inflowRate =
    totalFlow > 0
      ? (income / totalFlow) * 100
      : 0;

  const outflowRate =
    totalFlow > 0
      ? (expense / totalFlow) * 100
      : 0;

  /**
   * HEALTH
   */
  const health =
    getHealthState(
      savingsRatio,
      efficiencyRatio
    );

  const HealthIcon = health.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">

      {/* INCOME */}
      <StatCard
        icon={ArrowUpCircle}
        label="Total Income"
        value={formatCurrency(income)}
        sub={`Cash inflow accounts for ${formatPercent(
          inflowRate
        )} of total flow`}
        trend={incomeTrend}
        tone="positive"
      />

      {/* EXPENSE */}
      <StatCard
        icon={ArrowDownCircle}
        label="Total Expense"
        value={formatCurrency(expense)}
        sub={`Expense ratio is ${formatPercent(
          expenseRatio
        )}`}
        trend={expenseTrend}
        tone="negative"
      />

      {/* BALANCE */}
      <StatCard
        icon={Wallet}
        label="Net Balance"
        value={formatCurrency(balance)}
        sub={
          balance >= 0
            ? "Account operating above expense threshold"
            : "Expense level exceeds inflow"
        }
        tone={
          balance >= 0
            ? "positive"
            : "negative"
        }
      />

      {/* SAVINGS */}
      <StatCard
        icon={Percent}
        label="Savings Ratio"
        value={formatPercent(
          savingsRatio
        )}
        sub={`You retain ${formatPercent(
          savingsRatio
        )} from total income`}
        tone={
          savingsRatio >= 20
            ? "positive"
            : savingsRatio >= 10
            ? "warning"
            : "negative"
        }
      />

      {/* TRANSACTIONS */}
      <StatCard
        icon={Activity}
        label="Transactions"
        value={transactionCount}
        sub="Total processed financial activities"
        tone="neutral"
      />

      {/* FINANCIAL HEALTH */}
      <StatCard
        icon={HealthIcon}
        label="Financial Health"
        value={health.label}
        sub={health.description}
        trend={healthScore}
        tone={health.tone}
      />
    </div>
  );
};

export default DashboardStats;