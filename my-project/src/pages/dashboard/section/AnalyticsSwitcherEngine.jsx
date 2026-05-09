


// import { useMemo, useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell,
//   LineChart, Line, CartesianGrid
// } from "recharts";

// /* =========================
//    SAFE ENGINE
// ========================= */
// const safe = (v) => Number(v || 0);

// /* =========================
//    TRANSFORMERS
// ========================= */
// const buildBarData = (tx) => {
//   const income = tx.filter(t => t.type === "income")
//     .reduce((a,b) => a + safe(b.amount), 0);

//   const expense = tx.filter(t => t.type === "expense")
//     .reduce((a,b) => a + safe(b.amount), 0);

//   return [
//     { name: "Income", value: income },
//     { name: "Expense", value: expense },
//   ];
// };

// const buildPieData = (tx) => {
//   const income = tx.filter(t => t.type === "income")
//     .reduce((a,b) => a + safe(b.amount), 0);

//   const expense = tx.filter(t => t.type === "expense")
//     .reduce((a,b) => a + safe(b.amount), 0);

//   return [
//     { name: "Income", value: income },
//     { name: "Expense", value: expense },
//     { name: "Savings", value: Math.max(income - expense, 0) },
//   ];
// };

// const buildTrendData = (tx) => {
//   const map = {};

//   tx.forEach(t => {
//     const d = new Date(t.date || t.createdAt)
//       .toISOString()
//       .split("T")[0];

//     if (!map[d]) map[d] = { income: 0, expense: 0 };

//     if (t.type === "income") map[d].income += safe(t.amount);
//     else map[d].expense += safe(t.amount);
//   });

//   return Object.entries(map).map(([date, v]) => ({
//     name: date,
//     income: v.income,
//     expense: v.expense,
//     balance: v.income - v.expense,
//   }));
// };

// /* =========================
//    COLORS
// ========================= */
// const COLORS = ["#16a34a", "#dc2626", "#2563eb"];

// /* =========================
//    COMPONENT
// ========================= */
// const AnalyticsSwitcherEngine = ({ transactions = [] }) => {
//   const [view, setView] = useState("bar");

//   const tx = useMemo(
//     () => Array.isArray(transactions) ? transactions : [],
//     [transactions]
//   );

//   const data = useMemo(() => {
//     if (view === "bar") return buildBarData(tx);
//     if (view === "pie") return buildPieData(tx);
//     return buildTrendData(tx);
//   }, [view, tx]);

//   return (
//     <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-4">

//         <h2 className="text-sm font-semibold text-slate-900">
//           Financial Analytics
//         </h2>

//         <div className="flex bg-slate-100 rounded-xl p-1">
//           {["bar", "pie", "trend"].map(v => (
//             <button
//               key={v}
//               onClick={() => setView(v)}
//               className={`px-3 py-1 text-xs rounded-lg ${
//                 view === v
//                   ? "bg-white shadow"
//                   : "text-slate-500"
//               }`}
//             >
//               {v.toUpperCase()}
//             </button>
//           ))}
//         </div>

//       </div>

//       {/* CHART AREA */}
//       <div className="h-72 w-full">

//         <ResponsiveContainer width="100%" height="100%">

//           {/* BAR CHART */}
//           {view === "bar" && (
//             <BarChart data={data}>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="value" fill="#2563eb" />
//             </BarChart>
//           )}

//           {/* PIE CHART */}
//           {view === "pie" && (
//             <PieChart>
//               <Pie
//                 data={data}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={100}
//               >
//                 {data.map((_, i) => (
//                   <Cell key={i} fill={COLORS[i]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           )}

//           {/* TREND CHART */}
//           {view === "trend" && (
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />

//               <Line
//                 type="monotone"
//                 dataKey="income"
//                 stroke="#16a34a"
//               />
//               <Line
//                 type="monotone"
//                 dataKey="expense"
//                 stroke="#dc2626"
//               />
//               <Line
//                 type="monotone"
//                 dataKey="balance"
//                 stroke="#2563eb"
//               />
//             </LineChart>
//           )}

//         </ResponsiveContainer>

//       </div>
//     </div>
//   );
// };

// export default AnalyticsSwitcherEngine;


import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

/* =========================
   SAFE HELPERS
========================= */
const safe = (v) => Number(v || 0);

const normalizeTransactions = (tx = []) => {
  if (!Array.isArray(tx)) return [];

  return tx.map((t) => ({
    date: t.date || t.createdAt,
    type: t.type,
    amount: safe(t.amount),
  }));
};

/* =========================
   AGGREGATION ENGINE
========================= */
const buildAnalytics = (transactions = []) => {
  const map = new Map();

  transactions.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString();

    if (!map.has(key)) {
      map.set(key, { name: key, income: 0, expense: 0 });
    }

    const entry = map.get(key);

    if (t.type === "income") {
      entry.income += t.amount;
    } else {
      entry.expense += t.amount;
    }
  });

  return Array.from(map.values());
};

/* =========================
   CHART COLORS (FINTECH STYLE)
========================= */
const COLORS = {
  income: "#10b981",
  expense: "#ef4444",
  savings: "#6366f1",
};

/* =========================
   MAIN COMPONENT
========================= */
const AnalyticsSwitcherEngine = ({ transactions = [] }) => {
  const [view, setView] = useState("bar");

  /* =========================
     NORMALIZED DATA SOURCE
  ========================= */
  const data = useMemo(() => {
    const tx = normalizeTransactions(transactions);
    return buildAnalytics(tx);
  }, [transactions]);

  /* =========================
     GLOBAL TOTALS
  ========================= */
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    data.forEach((d) => {
      income += d.income;
      expense += d.expense;
    });

    return {
      income,
      expense,
      savings: income - expense,
    };
  }, [data]);

  /* =========================
     PIE DATA
  ========================= */
  const pieData = [
    { name: "Income", value: totals.income },
    { name: "Expense", value: totals.expense },
    { name: "Savings", value: totals.savings > 0 ? totals.savings : 0 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Financial Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time transaction intelligence
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-slate-100 rounded-2xl p-1">

          {["bar", "pie", "trend"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded-xl transition ${
                view === v
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500"
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}

        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[320px] w-full">

        <AnimatePresence mode="wait">

          {/* BAR CHART */}
          {view === "bar" && (
            <motion.div
              key="bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Bar dataKey="income" fill={COLORS.income} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill={COLORS.expense} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* PIE CHART */}
          {view === "pie" && (
            <motion.div
              key="pie"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex items-center justify-center"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={110}
                    label
                  >
                    <Cell fill={COLORS.income} />
                    <Cell fill={COLORS.expense} />
                    <Cell fill={COLORS.savings} />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* TREND CHART */}
          {view === "trend" && (
            <motion.div
              key="trend"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke={COLORS.income}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke={COLORS.expense}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FINANCIAL INSIGHT FOOTER */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-600">

        <div className="p-3 rounded-xl bg-emerald-50">
          Income: ₦{totals.income.toLocaleString()}
        </div>

        <div className="p-3 rounded-xl bg-rose-50">
          Expense: ₦{totals.expense.toLocaleString()}
        </div>

        <div className={`p-3 rounded-xl ${totals.savings >= 0 ? "bg-indigo-50" : "bg-red-50"}`}>
          Savings: ₦{totals.savings.toLocaleString()}
        </div>

      </div>

    </div>
  );
};

export default AnalyticsSwitcherEngine;