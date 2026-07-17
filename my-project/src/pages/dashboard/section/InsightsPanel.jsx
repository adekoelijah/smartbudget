import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";

/* =========================
   NORMALIZER
========================= */
const normalize = (t) => {
  if (Array.isArray(t)) return t;
  if (Array.isArray(t?.data)) return t.data;
  if (Array.isArray(t?.transactions)) return t.transactions;
  return [];
};

const num = (v) => Number(v || 0);

/* =========================
   CORE FINANCIAL ENGINE
========================= */
const analyze = (transactions = []) => {
  const tx = normalize(transactions);

  let income = 0;
  let expense = 0;
  let expenseCount = 0;

  const dailyMap = {};

  tx.forEach((t) => {
    const amount = num(t.amount);
    const date = new Date(t.date || t.createdAt).toDateString();

    if (!dailyMap[date]) dailyMap[date] = { income: 0, expense: 0 };

    if (t.type === "income") {
      income += amount;
      dailyMap[date].income += amount;
    }

    if (t.type === "expense") {
      expense += amount;
      expenseCount++;
      dailyMap[date].expense += amount;
    }
  });

  const balance = income - expense;

  /* =========================
     REAL FINANCIAL RATIOS
  ========================= */

  const savingsRate = income > 0 ? balance / income : 0; // -1 to 1+
  const expenseRatio = income > 0 ? expense / income : 0; // 0 to 1+

  // spending consistency (volatility)
  const dailyExpenses = Object.values(dailyMap).map((d) => d.expense);
  const avgExpense =
    dailyExpenses.reduce((a, b) => a + b, 0) /
    (dailyExpenses.length || 1);

  const variance =
    dailyExpenses.reduce((a, b) => a + Math.pow(b - avgExpense, 2), 0) /
    (dailyExpenses.length || 1);

  const volatility = Math.sqrt(variance);

  /* =========================
     HEALTH SCORE (REAL MODEL)
  =========================
   Weighted financial stability model:
   - Savings ratio (40%)
   - Expense control (40%)
   - Stability (20%)
  */

  const savingsScore = Math.max(0, Math.min(1, savingsRate)) * 40;

  const expenseScore =
    expenseRatio < 0.5
      ? 40
      : expenseRatio < 0.8
      ? 25
      : expenseRatio < 1
      ? 10
      : 0;

  const stabilityScore =
    volatility < income * 0.1
      ? 20
      : volatility < income * 0.25
      ? 12
      : 5;

  const healthScore = savingsScore + expenseScore + stabilityScore;

  /* =========================
     ADVISORY ENGINE (DATA DRIVEN)
  ========================= */

  let message = "";
  let tone = "info";

  if (healthScore >= 75) {
    message =
      "Your cashflow is strong and stable. You are maintaining healthy financial discipline.";
    tone = "success";
  } else if (healthScore >= 50) {
    message =
      "Your finances are stable but inefficient. Reducing unnecessary expenses will improve long-term growth.";
    tone = "warning";
  } else {
    message =
      "Your spending pattern is unstable. Immediate financial correction is recommended to avoid deficit risk.";
    tone = "danger";
  }

  /* =========================
     GOAL PROJECTION (OPTIONAL)
  ========================= */
  const projectedMonthlySurplus = balance;

  const timeToRecover =
    balance < 0 ? Math.abs(balance / (income || 1)) : 0;

  return {
    healthScore,
    income,
    expense,
    
    message,
    tone,
    projectedMonthlySurplus,
    timeToRecover,
  };
};

/* =========================
   UI
========================= */
const InsightPanel = ({ transactions = [] }) => {
  const data = useMemo(() => analyze(transactions), [transactions]);

  const ICONS = {
    success: CheckCircle,
    warning: AlertTriangle,
    danger: XCircle,
    info: Info,
  };

  const COLORS = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  const Icon = ICONS[data.tone];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Financial Intelligence Engine
        </h2>
        <p className="text-xs text-slate-500">
          Real-time analysis from transaction behavior
        </p>
      </div>

      {/* SCORE */}
      <div className={`rounded-2xl border p-4 ${COLORS[data.tone]}`}>

        <div className="flex items-center gap-2">
          <Icon size={18} />
          <span className="text-sm font-semibold">
            Financial Health Score
          </span>
        </div>

        <h1 className="text-3xl font-bold mt-2">
          {data.healthScore.toFixed(0)} / 100
        </h1>

        <p className="text-sm mt-2 opacity-90">
          {data.message}
        </p>
      </div>

      {/* METRICS */}
      

    </div>
  );
};

export default InsightPanel;