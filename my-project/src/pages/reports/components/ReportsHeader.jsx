


// import Button from "../../../components/ui/Button";
// import { Download, FileText, Sparkles } from "lucide-react";

// const ReportsHeader = () => {
//   return (
//     <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

//       {/* LEFT SECTION */}
//       <div className="space-y-2">

//         {/* BADGE */}
//         <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400">
//           <Sparkles size={14} />
//           AI Financial Intelligence
//         </div>

//         {/* TITLE */}
//         <h1 className="text-2xl font-bold text-white sm:text-3xl">
//           Financial Reports
//         </h1>

//         {/* DESCRIPTION */}
//         <p className="max-w-xl text-sm leading-relaxed text-slate-400">
//           Real-time insights into your income, expenses, and spending behavior.
//           Built to help you make smarter financial decisions.
//         </p>
//       </div>

//       {/* RIGHT ACTIONS */}
//       <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

//         <Button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 hover:bg-white/10">
//           <FileText size={16} />
//           Export PDF
//         </Button>

//         <Button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg hover:scale-[1.02] transition">
//           <Download size={16} />
//           Download CSV
//         </Button>

//       </div>
//     </div>
//   );
// };

// export default ReportsHeader;



import {
  Download,
  FileText,
  Sparkles,
  RefreshCcw,
  Database,
} from "lucide-react";

import { motion } from "framer-motion";

import Button from "../../../components/ui/Button";

/* =========================================
   SAFE HELPERS
========================================= */
const formatTime = (date) => {
  if (!date) return "—";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "—";

  return d.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
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
  /* =========================================
     STATS ENGINE
  ========================================= */
  const totalTransactions =
    transactions.length;

  const totalIncome =
    transactions
      .filter((t) => t.type === "income")
      .reduce(
        (acc, cur) =>
          acc + Number(cur.amount || 0),
        0
      );

  const totalExpense =
    transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, cur) =>
          acc + Number(cur.amount || 0),
        0
      );

  /* =========================================
     SAFE ACTIONS
  ========================================= */
  const handleRefresh =
    async () => {
      try {
        await onRefresh?.();
      } catch (err) {
        console.error(
          "Refresh failed:",
          err
        );
      }
    };

  const handleCSV =
    async () => {
      try {
        await onExportCSV?.();
      } catch (err) {
        console.error(
          "CSV export failed:",
          err
        );
      }
    };

  const handlePDF =
    async () => {
      try {
        await onExportPDF?.();
      } catch (err) {
        console.error(
          "PDF export failed:",
          err
        );
      }
    };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-slate-800
        bg-gradient-to-br
        from-slate-950
        via-slate-900
        to-slate-950
        p-6
        shadow-2xl
      "
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_30%)]" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

        {/* LEFT */}
        <div className="space-y-5">

          {/* BADGE */}
          <div className="
            inline-flex items-center gap-2
            rounded-full
            border border-emerald-500/20
            bg-emerald-500/10
            px-4 py-2
            text-xs font-medium
            text-emerald-300
            backdrop-blur-xl
          ">
            <Sparkles size={14} />

            AI Financial Intelligence
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Financial Reports
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              Real-time financial analytics,
              transaction intelligence,
              reporting infrastructure,
              and fintech-grade export systems.
            </p>
          </div>

          {/* LIVE METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-xs text-slate-400">
                Transactions
              </p>

              <h3 className="mt-1 text-xl font-bold text-white">
                {totalTransactions}
              </h3>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <p className="text-xs text-emerald-300">
                Income
              </p>

              <h3 className="mt-1 text-xl font-bold text-emerald-400">
                ₦{totalIncome.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">
              <p className="text-xs text-rose-300">
                Expenses
              </p>

              <h3 className="mt-1 text-xl font-bold text-rose-400">
                ₦{totalExpense.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4">
              <p className="text-xs text-cyan-300">
                Last Sync
              </p>

              <h3 className="mt-1 text-sm font-semibold text-cyan-400">
                {formatTime(lastSync)}
              </h3>
            </div>

          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="
          flex flex-col sm:flex-row
          items-stretch sm:items-center
          gap-3
        ">

          {/* REFRESH */}
          <Button
            onClick={handleRefresh}
            disabled={loading || syncing}
            className="
              flex items-center justify-center gap-2
              rounded-2xl
              border border-white/10
              bg-white/5
              px-5 py-3
              text-sm font-medium
              text-slate-200
              backdrop-blur-xl
              hover:bg-white/10
              transition-all
            "
          >
            <RefreshCcw
              size={16}
              className={
                syncing
                  ? "animate-spin"
                  : ""
              }
            />

            {syncing
              ? "Syncing..."
              : "Refresh"}
          </Button>

          {/* PDF */}
          <Button
            onClick={handlePDF}
            className="
              flex items-center justify-center gap-2
              rounded-2xl
              border border-cyan-500/20
              bg-cyan-500/10
              px-5 py-3
              text-sm font-medium
              text-cyan-300
              hover:bg-cyan-500/20
              transition-all
            "
          >
            <FileText size={16} />

            Export PDF
          </Button>

          {/* CSV */}
          <Button
            onClick={handleCSV}
            className="
              flex items-center justify-center gap-2
              rounded-2xl
              bg-gradient-to-r
              from-emerald-500
              to-cyan-500
              px-5 py-3
              text-sm font-semibold
              text-white
              shadow-lg shadow-emerald-500/20
              hover:scale-[1.02]
              active:scale-[0.98]
              transition-all
            "
          >
            <Download size={16} />

            Download CSV
          </Button>

        </div>
      </div>

      {/* FOOTER */}
      <div className="
        relative z-10
        mt-6
        flex items-center gap-2
        border-t border-white/5
        pt-4
        text-xs text-slate-500
      ">
        <Database size={13} />

        Live transaction infrastructure connected
        to reporting engine.
      </div>
    </motion.div>
  );
};

export default ReportsHeader;