
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";

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
   RESPONSIVE HOOK
========================= */
const useMobile = () => useMediaQuery({ maxWidth: 640 });

const safe = (v) => Number(v || 0);

const normalizeTransactions = (tx = []) =>
  Array.isArray(tx)
    ? tx.map((t) => ({
        date: t.date || t.createdAt,
        type: t.type,
        amount: safe(t.amount),
      }))
    : [];

const buildAnalytics = (transactions = []) => {
  const map = new Map();

  transactions.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString();

    if (!map.has(key)) {
      map.set(key, { name: key, income: 0, expense: 0 });
    }

    const entry = map.get(key);

    t.type === "income"
      ? (entry.income += t.amount)
      : (entry.expense += t.amount);
  });

  return Array.from(map.values());
};

const COLORS = {
  income: "#10b981",
  expense: "#ef4444",
  savings: "#6366f1",
};

const AnalyticsSwitcherEngine = ({ transactions = [] }) => {
  const [view, setView] = useState("bar");
  const isMobile = useMobile();

  const data = useMemo(() => {
    const tx = normalizeTransactions(transactions);
    return buildAnalytics(tx);
  }, [transactions]);

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

  const pieData = [
    { name: "Income", value: totals.income },
    { name: "Expense", value: totals.expense },
    { name: "Savings", value: Math.max(totals.savings, 0) },
  ];

  const pieRadius = isMobile ? 70 : 110;

  return (
    <div
      className="
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >

      {/* ================= HEADER ================= */}
      <div
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mb-5
          gap-3
        "
      >

        <div>
          <h2
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            Financial Analytics
          </h2>
          <p
            className="
              text-slate-500 text-xs
            "
          >
            Real-time transaction intelligence
          </p>
        </div>

        {/* TOGGLE */}
        <div
          className="
            flex
            w-full sm:w-auto
            p-1
            bg-slate-100
            rounded-2xl
          "
        >

          {["bar", "pie", "trend"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs rounded-xl transition ${
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

      {/* ================= CHART ================= */}
      <div
        className="
          w-full h-[260px] sm:h-[320px]
        "
      >

        <AnimatePresence mode="wait">

          {/* BAR */}
          {view === "bar" && (
            <motion
              .div
              key="bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                h-full
              "
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="income" fill={COLORS.income} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill={COLORS.expense} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* PIE */}
          {view === "pie" && (
            <motion
              .div
              key="pie"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="
                flex justify-center items-center
                w-full min-w-0 h-[280px] h-full
              "
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={pieRadius}
                    label={!isMobile}
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

          {/* TREND */}
          {view === "trend" && (
            <motion
              .div
              key="trend"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                h-full
              "
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke={COLORS.income} strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke={COLORS.expense} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ================= FOOTER ================= */}
      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          mt-4
          text-slate-600 text-xs
          gap-2
        "
      >

        <div
          className="
            p-3
            bg-emerald-50
            rounded-xl
          "
        >
          Income: ₦{totals.income.toLocaleString()}
        </div>

        <div
          className="
            p-3
            bg-rose-50
            rounded-xl
          "
        >
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