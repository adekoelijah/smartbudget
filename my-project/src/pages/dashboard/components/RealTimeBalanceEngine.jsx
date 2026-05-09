// import {
//   ArrowUpRight,
//   ArrowDownRight,
//   Wallet,
// } from "lucide-react";
// import { useMemo } from "react";

// /* =========================
//    NORMALIZER (UNIVERSAL FIX)
// ========================= */
// const normalizeTransactions = (input) => {
//   if (!input) return [];

//   if (Array.isArray(input)) return input;

//   if (Array.isArray(input?.transactions)) return input.transactions;

//   if (Array.isArray(input?.data)) return input.data;

//   if (Array.isArray(input?.data?.transactions))
//     return input.data.transactions;

//   return [];
// };

// /* =========================
//    SAFE HELPERS
// ========================= */
// const safe = (v) => Number(v || 0);

// const format = (n) =>
//   `₦${Number(n).toLocaleString("en-NG")}`;

// const parseDate = (d) => new Date(d);

// /* =========================
//    MAIN ENGINE
// ========================= */
// const RealTimeBalanceEngine = ({ transactions }) => {
//   const computed = useMemo(() => {
//     const tx = normalizeTransactions(transactions);

//     if (!tx.length) {
//       return {
//         income: 0,
//         expense: 0,
//         balance: 0,
//         todayIncome: 0,
//         todayExpense: 0,
//         savingsRate: 0,
//         trend: "neutral",
//       };
//     }

//     const now = new Date();

//     let income = 0;
//     let expense = 0;
//     let todayIncome = 0;
//     let todayExpense = 0;

//     tx.forEach((t) => {
//       const amount = safe(t.amount);
//       const date = parseDate(t.date || t.createdAt);

//       const isToday =
//         date.toDateString() === now.toDateString();

//       if (t.type === "income") {
//         income += amount;
//         if (isToday) todayIncome += amount;
//       } else if (t.type === "expense") {
//         expense += amount;
//         if (isToday) todayExpense += amount;
//       }
//     });

//     const balance = income - expense;

//     const savingsRate =
//       income > 0 ? (balance / income) * 100 : 0;

//     const trend =
//       balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral";

//     return {
//       income,
//       expense,
//       balance,
//       todayIncome,
//       todayExpense,
//       savingsRate,
//       trend,
//     };
//   }, [transactions]); // 🔥 reacts instantly to API + socket

//   return (
//     <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

//       {/* HEADER */}
//       <div className="flex justify-between mb-4">
//         <div>
//           <h2 className="text-sm font-semibold">
//             Real-Time Balance
//           </h2>
//           <p className="text-xs text-slate-500">
//             Synced with transactions
//           </p>
//         </div>
//         <Wallet size={18} className="text-slate-400" />
//       </div>

//       {/* BALANCE */}
//       <h1
//         className={`text-3xl font-bold ${
//           computed.balance >= 0
//             ? "text-emerald-600"
//             : "text-rose-600"
//         }`}
//       >
//         {format(computed.balance)}
//       </h1>

//       {/* TREND */}
//       <div className="mt-2 text-xs">
//         {computed.trend === "positive" && (
//           <span className="text-emerald-600 flex items-center gap-1">
//             <ArrowUpRight size={14} /> Growing
//           </span>
//         )}
//         {computed.trend === "negative" && (
//           <span className="text-rose-600 flex items-center gap-1">
//             <ArrowDownRight size={14} /> Declining
//           </span>
//         )}
//       </div>

//       {/* BREAKDOWN */}
//       <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
//         <div className="bg-emerald-50 p-3 rounded-xl">
//           <p className="text-xs text-slate-500">Income</p>
//           <p className="font-semibold text-emerald-600">
//             {format(computed.income)}
//           </p>
//         </div>

//         <div className="bg-rose-50 p-3 rounded-xl">
//           <p className="text-xs text-slate-500">Expense</p>
//           <p className="font-semibold text-rose-600">
//             {format(computed.expense)}
//           </p>
//         </div>
//       </div>

//       {/* TODAY */}
//       <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
//         <div className="bg-slate-50 p-3 rounded-xl">
//           <p className="text-xs text-slate-500">Today In</p>
//           <p className="font-semibold">
//             {format(computed.todayIncome)}
//           </p>
//         </div>

//         <div className="bg-slate-50 p-3 rounded-xl">
//           <p className="text-xs text-slate-500">Today Out</p>
//           <p className="font-semibold">
//             {format(computed.todayExpense)}
//           </p>
//         </div>
//       </div>

//       {/* SAVINGS */}
//       <div className="mt-4 text-xs">
//         Savings Rate:{" "}
//         <span className="font-semibold">
//           {computed.savingsRate.toFixed(1)}%
//         </span>
//       </div>
//     </div>
//   );
// };

// export default RealTimeBalanceEngine;



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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">
            Real-Time Balance
          </h2>

          <p className="text-xs text-slate-500">
            Live ledger synchronization
          </p>
        </div>

        <Wallet
          size={18}
          className="text-slate-400"
        />
      </div>

      {/* BALANCE */}
      <h1
        className={`text-3xl font-bold ${
          balance >= 0
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
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
      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="bg-emerald-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Total Income
          </p>

          <p className="font-semibold text-emerald-600">
            {format(income)}
          </p>

          <p className="text-[11px] mt-1 text-emerald-500">
            Monthly: {format(monthlyIncome)}
          </p>
        </div>

        <div className="bg-rose-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Total Expense
          </p>

          <p className="font-semibold text-rose-600">
            {format(expense)}
          </p>

          <p className="text-[11px] mt-1 text-rose-500">
            Monthly: {format(monthlyExpense)}
          </p>
        </div>

      </div>

      {/* TODAY SNAPSHOT */}
      <div className="grid grid-cols-2 gap-3 mt-4">

        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Today Inflow
          </p>

          <p className="font-semibold">
            {format(todayIncome)}
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Today Outflow
          </p>

          <p className="font-semibold">
            {format(todayExpense)}
          </p>
        </div>

      </div>

      {/* WEEKLY FLOW */}
      <div className="grid grid-cols-2 gap-3 mt-4">

        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Weekly Income
          </p>

          <p className="font-semibold text-blue-600">
            {format(weeklyIncome)}
          </p>
        </div>

        <div className="bg-amber-50 p-3 rounded-xl">
          <p className="text-xs text-slate-500">
            Weekly Expense
          </p>

          <p className="font-semibold text-amber-600">
            {format(weeklyExpense)}
          </p>
        </div>

      </div>

      {/* METRICS */}
      <div className="mt-5 border-t pt-4 space-y-2 text-xs">

        <div className="flex justify-between">
          <span className="text-slate-500">
            Savings Ratio
          </span>

          <span className="font-semibold">
            {savingsRatio.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Efficiency Ratio
          </span>

          <span className="font-semibold">
            {efficiencyRatio.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Transactions
          </span>

          <span className="font-semibold">
            {transactionCount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Income Trend
          </span>

          <span className="font-semibold text-emerald-600">
            {incomeTrend.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Expense Trend
          </span>

          <span className="font-semibold text-rose-600">
            {expenseTrend.toFixed(1)}%
          </span>
        </div>

      </div>
    </div>
  );
};

export default RealTimeBalanceEngine;