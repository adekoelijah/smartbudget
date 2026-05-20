



import {
  Download,
  FileText,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { motion } from "framer-motion";
import Button from "../../../components/ui/Button";

/* =========================================
   HELPERS
========================================= */
const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString()}`;

const formatTime = (date) => {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================
   COMPONENT
========================================= */
const ReportsHeader = ({
  transactions = [],
  syncing = false,
  loading = false,
  lastSync = null,
  onRefresh,
  onExportCSV,
  onExportPDF,
}) => {
  const totalTransactions = transactions.length;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((a, c) => a + Number(c.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, c) => a + Number(c.amount || 0), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* ================= BANK PANEL ================= */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER STRIP (INSTITUTIONAL TOP BAR) */}
        <div className="border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight">
              Financial Reporting System
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transaction ledger summary, audit metrics, and export controls
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Last updated:{" "}
            <span className="font-medium text-slate-700">
              {formatTime(lastSync)}
            </span>
          </div>
        </div>

        {/* ================= METRICS GRID ================= */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* TOTAL TX */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                Total Transactions
              </span>
              <Wallet size={16} className="text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {totalTransactions}
            </p>
          </div>

          {/* INCOME */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-700 uppercase tracking-wide">
                Total Inflows
              </span>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <p className="mt-3 text-xl font-semibold text-emerald-800">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          {/* EXPENSE */}
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-rose-700 uppercase tracking-wide">
                Total Outflows
              </span>
              <TrendingDown size={16} className="text-rose-600" />
            </div>
            <p className="mt-3 text-xl font-semibold text-rose-800">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          {/* NET POSITION */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Net Position
            </span>

            <p
              className={`mt-3 text-xl font-semibold ${
                totalIncome - totalExpense >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Automated ledger reconciliation
            </p>
          </div>
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="border-t border-slate-100 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">

          <div className="text-xs text-slate-500">
            System status:{" "}
            <span className={syncing ? "text-amber-600" : "text-emerald-600"}>
              {syncing ? "Synchronizing ledger..." : "Operational"}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">

            <Button
              onClick={onRefresh}
              disabled={loading || syncing}
              className="h-9 px-4 rounded-lg bg-slate-900 text-white text-xs hover:bg-black flex items-center gap-2"
            >
              <RefreshCcw size={14} className={syncing ? "animate-spin" : ""} />
              Refresh
            </Button>

            <Button
              onClick={onExportPDF}
              className="h-9 px-4 rounded-lg bg-slate-800 text-white text-xs hover:bg-black flex items-center gap-2"
            >
              <FileText size={14} />
              PDF
            </Button>

            <Button
              onClick={onExportCSV}
              className="h-9 px-4 rounded-lg bg-emerald-700 text-white text-xs hover:bg-emerald-800 flex items-center gap-2"
            >
              <Download size={14} />
              CSV
            </Button>

          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ReportsHeader;