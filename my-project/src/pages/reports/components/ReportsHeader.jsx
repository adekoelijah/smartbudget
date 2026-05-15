

// import {
//   Download,
//   FileText,
//   RefreshCcw,
//   TrendingUp,
//   TrendingDown,
//   Wallet,
// } from "lucide-react";

// import { motion } from "framer-motion";
// import Button from "../../../components/ui/Button";

// /* =========================================
//    HELPERS
// ========================================= */
// const formatCurrency = (amount) => {
//   return `₦${Number(amount || 0).toLocaleString()}`;
// };

// const formatTime = (date) => {
//   if (!date) return "Just now";

//   const d = new Date(date);

//   if (isNaN(d.getTime())) return "Just now";

//   return d.toLocaleString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     day: "2-digit",
//     month: "short",
//   });
// };

// /* =========================================
//    COMPONENT
// ========================================= */
// const ReportsHeader = ({
//   transactions = [],
//   syncing = false,
//   loading = false,
//   lastSync = null,

//   onRefresh,
//   onExportCSV,
//   onExportPDF,
// }) => {
//   /* =========================================
//      METRICS
//   ========================================= */
//   const totalTransactions =
//     transactions.length;

//   const totalIncome =
//     transactions
//       .filter((t) => t.type === "income")
//       .reduce(
//         (acc, cur) =>
//           acc + Number(cur.amount || 0),
//         0
//       );

//   const totalExpense =
//     transactions
//       .filter((t) => t.type === "expense")
//       .reduce(
//         (acc, cur) =>
//           acc + Number(cur.amount || 0),
//         0
//       );

//   /* =========================================
//      ACTIONS
//   ========================================= */
//   const handleRefresh = async () => {
//     try {
//       await onRefresh?.();
//     } catch (err) {
//       console.error("Refresh failed:", err);
//     }
//   };

//   const handleCSV = async () => {
//     try {
//       await onExportCSV?.();
//     } catch (err) {
//       console.error("CSV export failed:", err);
//     }
//   };

//   const handlePDF = async () => {
//     try {
//       await onExportPDF?.();
//     } catch (err) {
//       console.error("PDF export failed:", err);
//     }
//   };

//   return (
//     <motion.section
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.25 }}
//       className="w-full"
//     >

//       {/* MAIN CARD */}
//       <div
//         className="
//           rounded-3xl
//           border border-gray-200
//           bg-white
//           p-5 md:p-6
//           shadow-sm
//         "
//       >

//         {/* TOP ROW */}
//         <div
//           className="
//             flex flex-col
//             gap-6
//             xl:flex-row
//             xl:items-start
//             xl:justify-between
//           "
//         >

//           {/* LEFT SIDE */}
//           <div className="flex-1 min-w-0">

//             {/* TITLE */}
//             <div>
//               <h1
//                 className="
//                   text-2xl md:text-3xl
//                   font-bold
//                   tracking-tight
//                   text-gray-900
//                 "
//               >
//                 Financial Reports
//               </h1>

//               <p
//                 className="
//                   mt-2
//                   text-sm
//                   leading-relaxed
//                   text-gray-500
//                 "
//               >
//                 Monitor transactions, analyze financial activity,
//                 and export professional fintech-grade reports.
//               </p>
//             </div>

//             {/* METRICS */}
//             <div
//               className="
//                 mt-6
//                 grid grid-cols-1
//                 gap-4
//                 sm:grid-cols-2
//                 xl:grid-cols-4
//               "
//             >

//               {/* TRANSACTIONS */}
//               <div
//                 className="
//                   rounded-2xl
//                   border border-gray-100
//                   bg-gray-50
//                   p-4
//                 "
//               >
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-medium text-gray-500">
//                     Transactions
//                   </p>

//                   <Wallet
//                     size={18}
//                     className="text-gray-400"
//                   />
//                 </div>

//                 <h3
//                   className="
//                     mt-4
//                     text-3xl
//                     font-bold
//                     tracking-tight
//                     text-gray-900
//                   "
//                 >
//                   {totalTransactions}
//                 </h3>
//               </div>

//               {/* INCOME */}
//               <div
//                 className="
//                   rounded-2xl
//                   border border-emerald-100
//                   bg-emerald-50
//                   p-4
//                 "
//               >
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-medium text-emerald-700">
//                     Income
//                   </p>

//                   <TrendingUp
//                     size={18}
//                     className="text-emerald-600"
//                   />
//                 </div>

//                 <h3
//                   className="
//                     mt-4
//                     text-2xl
//                     font-bold
//                     tracking-tight
//                     text-emerald-700
//                   "
//                 >
//                   {formatCurrency(totalIncome)}
//                 </h3>
//               </div>

//               {/* EXPENSE */}
//               <div
//                 className="
//                   rounded-2xl
//                   border border-rose-100
//                   bg-rose-50
//                   p-4
//                 "
//               >
//                 <div className="flex items-center justify-between">
//                   <p className="text-xs font-medium text-rose-700">
//                     Expenses
//                   </p>

//                   <TrendingDown
//                     size={18}
//                     className="text-rose-600"
//                   />
//                 </div>

//                 <h3
//                   className="
//                     mt-4
//                     text-2xl
//                     font-bold
//                     tracking-tight
//                     text-rose-700
//                   "
//                 >
//                   {formatCurrency(totalExpense)}
//                 </h3>
//               </div>

//               {/* LAST SYNC */}
//               <div
//                 className="
//                   rounded-2xl
//                   border border-blue-100
//                   bg-blue-50
//                   p-4
//                 "
//               >
//                 <p className="text-xs font-medium text-blue-700">
//                   Last Sync
//                 </p>

//                 <h3
//                   className="
//                     mt-4
//                     text-sm
//                     font-semibold
//                     text-blue-700
//                   "
//                 >
//                   {formatTime(lastSync)}
//                 </h3>

//                 <div
//                   className="
//                     mt-3
//                     inline-flex
//                     items-center
//                     rounded-full
//                     bg-blue-100
//                     px-2 py-1
//                     text-[10px]
//                     font-medium
//                     text-blue-700
//                   "
//                 >
//                   Live Reporting
//                 </div>
//               </div>

//             </div>
//           </div>

//           {/* ACTIONS */}
//           {/* ACTIONS */}
// <div
//   className="
//     flex flex-row xl:flex-col
//     gap-3
//     w-full
//     xl:w-[200px]
//   "
// >

//   {/* REFRESH */}
//   <Button
//     onClick={handleRefresh}
//     disabled={loading || syncing}
//     className="
//       flex-1 xl:flex-none
//       h-10
//       rounded-xl
//       bg-gray-900
//       text-xs font-medium text-white
//       hover:bg-black
//       transition-all
//       flex items-center justify-center gap-2
//     "
//   >
//     <RefreshCcw
//       size={14}
//       className={syncing ? "animate-spin" : ""}
//     />
//     <span className="hidden sm:inline">
//       {syncing ? "Syncing..." : "Refresh"}
//     </span>
//   </Button>

//   {/* PDF */}
//   <Button
//     onClick={handlePDF}
//     className="
//       flex-1 xl:flex-none
//       h-10
//       rounded-xl
//       bg-gray-900
//       text-xs font-medium text-white
//       hover:bg-black
//       transition-all
//       flex items-center justify-center gap-2
//     "
//   >
//     <FileText size={14} />
//     <span className="hidden sm:inline">PDF</span>
//   </Button>

//   {/* CSV */}
//   <Button
//     onClick={handleCSV}
//     className="
//       flex-1 xl:flex-none
//       h-10
//       rounded-xl
//       bg-emerald-600
//       text-xs font-semibold text-white
//       hover:bg-emerald-700
//       transition-all
//       flex items-center justify-center gap-2
//     "
//   >
//     <Download size={14} />
//     <span className="hidden sm:inline">CSV</span>
//   </Button>

// </div>
//         </div>
//       </div>
//     </motion.section>
//   );
// };

// export default ReportsHeader;



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