


import { useEffect, useMemo, useState } from "react";

import ReportsHeader from "./components/ReportsHeader";
import ReportsFilters from "./components/ReportsFilters";
import ReportsSummary from "./components/ReportsSummary";
import ReportsChart from "./components/ReportsChart";
import ReportsEmptyState from "./components/ReportsEmptyState";

import { getTransactions } from "../../services/transactionService";
import { getBudgets } from "../../services/budgetService";
import { computeFinancialInsights } from "../../utils/financeAI";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  /* ================= DATA LAYER ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tx, bd] = await Promise.all([
          getTransactions(),
          getBudgets(),
        ]);

        setTransactions(tx || []);
        setBudgets(bd || []);
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= AI INSIGHTS ================= */
  const aiInsights = useMemo(() => {
    return computeFinancialInsights(transactions, budgets);
  }, [transactions, budgets]);

  /* ================= METRICS ENGINE ================= */
  const reportMetrics = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const savings = income - expense;
    const savingsRate = income ? (savings / income) * 100 : 0;

    return {
      income,
      expense,
      savings,
      savingsRate,
    };
  }, [transactions]);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-4 sm:px-6 lg:px-10 py-6 space-y-8">

      {/* HEADER */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0b1220]/70 py-4">
        <ReportsHeader />
      </div>

      {/* FILTERS */}
      <ReportsFilters range={range} setRange={setRange} />

      {/* SUMMARY */}
      <ReportsSummary
        metrics={reportMetrics}
        aiInsights={aiInsights}
      />

      {/* CONTENT */}
      <div className="mt-4">

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            Loading financial intelligence...
          </div>
        ) : transactions.length === 0 ? (
          <ReportsEmptyState />
        ) : (
          <div className="space-y-6">

            {/* MAIN ANALYTICS PANEL */}
            <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl">
              <ReportsChart
                transactions={transactions}
                budgets={budgets}
                range={range}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;