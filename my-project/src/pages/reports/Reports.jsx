


import { useEffect, useMemo, useState } from "react";

import ReportsHeader from "./components/ReportsHeader";
import ReportsFilters from "./components/ReportsFilters";
import ReportsSummary from "./components/ReportsSummary";
import ReportsChart from "./components/ReportsChart";
import ReportsEmptyState from "./components/ReportsEmptyState";

import { getTransactions } from "../../services/transactionService";
import { getBudgets } from "../../services/budgetService";
import { computeFinancialInsights } from "../../utils/financeAI";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  /* ================= STATE ================= */
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [range, setRange] = useState("month");

  /* ================= DATA FETCH ================= */
  const fetchReportsData = async () => {
    try {
      setSyncing(true);

      const [tx, bd] = await Promise.all([
        getTransactions(),
        getBudgets(),
      ]);

      setTransactions(tx || []);
      setBudgets(bd || []);
      setLastSync(new Date());
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  /* ================= FILTER ENGINE ================= */
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((t) => {
      const date = new Date(t.date);
      const diffDays =
        (now - date) / (1000 * 60 * 60 * 24);

      const type = t.type?.toLowerCase();

      if (range === "week") return diffDays <= 7;
      if (range === "month") return diffDays <= 30;
      if (range === "year") return diffDays <= 365;

      return true;
    });
  }, [transactions, range]);

  /* ================= AI INSIGHTS ================= */
  const aiInsights = useMemo(() => {
    return computeFinancialInsights(
      filteredTransactions,
      budgets
    );
  }, [filteredTransactions, budgets]);

  /* ================= METRICS ================= */
  const reportMetrics = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type?.toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expense = filteredTransactions
      .filter((t) => t.type?.toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const savings = income - expense;
    const savingsRate = income ? (savings / income) * 100 : 0;

    return {
      income,
      expense,
      savings,
      savingsRate,
    };
  }, [filteredTransactions]);

  /* ================= EXPORT HELPERS ================= */
  const handleExportCSV = () => {
    try {
      const headers = ["Title", "Amount", "Type", "Category", "Date"];

      const rows = filteredTransactions.map((t) => [
        t.title,
        t.amount,
        t.type,
        t.category,
        new Date(t.date).toLocaleDateString(),
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      saveAs(blob, "smartbudget-report.csv");
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("SmartBudget Report", 14, 20);

      const rows = filteredTransactions.map((t) => [
        t.title,
        `₦${t.amount}`,
        t.type,
        t.category,
        new Date(t.date).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["Title", "Amount", "Type", "Category", "Date"]],
        body: rows,
      });

      doc.save("smartbudget-report.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* HEADER */}
      <ReportsHeader
        transactions={filteredTransactions}
        syncing={syncing}
        loading={loading}
        lastSync={lastSync}
        onRefresh={fetchReportsData}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* FILTERS */}
      <ReportsFilters range={range} setRange={setRange} />

      {/* SUMMARY */}
      <ReportsSummary
        metrics={reportMetrics}
        aiInsights={aiInsights}
      />

      {/* CONTENT */}
      <div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500">
            Loading financial reports...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <ReportsEmptyState />
        ) : (
          <div className="space-y-6">

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <ReportsChart
                transactions={filteredTransactions}
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