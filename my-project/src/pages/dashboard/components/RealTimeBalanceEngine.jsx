


import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";

import { useMemo } from "react";

/* CENTRAL ENGINE */
import {
  computeFinancials,
} from "../engine/FinancialEngine";

/* =========================
   SAFE FORMATTER
========================= */
const format = (n = 0) =>
  `₦${Number(n || 0).toLocaleString("en-NG")}`;

/* =========================
   COMPONENT
========================= */
const RealTimeBalanceEngine = ({
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

  /**
   * DESTRUCTURE SHARED ENGINE
   */
  const {
    income,
    expense,
    balance,

    todayIncome,
    todayExpense,

    savingsRatio,

    transactionCount,

    weeklyIncome,
    weeklyExpense,

    monthlyIncome,
    monthlyExpense,

    incomeTrend,
    expenseTrend,

    efficiencyRatio,
  } = financials;

  /**
   * TREND STATE
   */
  const trend =
    balance > 0
      ? "positive"
      : balance < 0
      ? "negative"
      : "neutral";

    return (
  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">

    {/* HEADER */}
    <div className="flex items-start sm:items-center justify-between mb-4 gap-3">

      <div>
        <h2 className="text-sm sm:text-base font-semibold">
          Real-Time Balance
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-500">
          Live ledger synchronization
        </p>
      </div>

      <Wallet
        size={18}
        className="text-slate-400 shrink-0"
      />

    </div>

    {/* BALANCE */}
    <h1
      className={`font-bold tracking-tight
        text-2xl sm:text-3xl md:text-3xl
        ${
          balance >= 0
            ? "text-emerald-600"
            : "text-rose-600"
        }
      `}
    >
      {format(balance)}
    </h1>

    {/* TREND */}
    <div className="mt-2 text-xs">

      {trend === "positive" && (
        <span className="text-emerald-600 flex items-center gap-1">
          <ArrowUpRight size={14} />
          Positive cashflow
        </span>
      )}

      {trend === "negative" && (
        <span className="text-rose-600 flex items-center gap-1">
          <ArrowDownRight size={14} />
          Negative cashflow
        </span>
      )}

      {trend === "neutral" && (
        <span className="text-slate-500">
          Stable account activity
        </span>
      )}

    </div>

    {/* CORE BREAKDOWN */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

      <div className="bg-emerald-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Total Income
        </p>

        <p className="font-semibold text-emerald-600 text-sm sm:text-base">
          {format(income)}
        </p>

        <p className="text-[10px] sm:text-[11px] mt-1 text-emerald-500">
          Monthly: {format(monthlyIncome)}
        </p>
      </div>

      <div className="bg-rose-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Total Expense
        </p>

        <p className="font-semibold text-rose-600 text-sm sm:text-base">
          {format(expense)}
        </p>

        <p className="text-[10px] sm:text-[11px] mt-1 text-rose-500">
          Monthly: {format(monthlyExpense)}
        </p>
      </div>

    </div>

    {/* TODAY SNAPSHOT */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

      <div className="bg-slate-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Today Inflow
        </p>

        <p className="font-semibold text-sm">
          {format(todayIncome)}
        </p>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Today Outflow
        </p>

        <p className="font-semibold text-sm">
          {format(todayExpense)}
        </p>
      </div>

    </div>

    {/* WEEKLY FLOW */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

      <div className="bg-blue-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Weekly Income
        </p>

        <p className="font-semibold text-blue-600 text-sm">
          {format(weeklyIncome)}
        </p>
      </div>

      <div className="bg-amber-50 p-3 rounded-xl">
        <p className="text-[11px] text-slate-500">
          Weekly Expense
        </p>

        <p className="font-semibold text-amber-600 text-sm">
          {format(weeklyExpense)}
        </p>
      </div>

    </div>

    {/* METRICS */}
    <div className="mt-5 border-t pt-4 space-y-2 text-xs">

      {[
        ["Savings Ratio", `${savingsRatio.toFixed(1)}%`],
        ["Efficiency Ratio", `${efficiencyRatio.toFixed(1)}%`],
        ["Transactions", transactionCount],
        ["Income Trend", `${incomeTrend.toFixed(1)}%`],
        ["Expense Trend", `${expenseTrend.toFixed(1)}%`],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between">
          <span className="text-slate-500">{label}</span>
          <span className="font-semibold">{value}</span>
        </div>
      ))}

    </div>

  </div>
);

};

export default RealTimeBalanceEngine;