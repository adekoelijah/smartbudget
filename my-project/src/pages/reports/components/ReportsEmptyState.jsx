// const ReportsEmptyState = () => {
//   return (
//     <div className="flex flex-col items-center justify-center text-center py-20 px-4">

//       {/* ICON */}
//       <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
//         📊
//       </div>

//       {/* TITLE */}
//       <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//         No financial data yet
//       </h2>

//       {/* DESCRIPTION */}
//       <p className="text-sm text-gray-500 mt-2 max-w-md">
//         Your reports will appear here once you start adding transactions and budgets.
//         We’ll automatically generate insights and analytics for you.
//       </p>

//     </div>
//   );
// };

// export default ReportsEmptyState;


import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";

const ReportsEmptyState = () => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-24 px-4 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl"></div>

      {/* ICON */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10"
      >
        <BarChart3 className="text-emerald-400" size={28} />
      </motion.div>

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-white">
        No financial data yet
      </h2>

      {/* DESCRIPTION */}
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        Start adding transactions and budgets to unlock powerful insights,
        spending analytics, and AI-driven financial reports.
      </p>

      {/* MINI INSIGHTS PREVIEW */}
      <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-md">

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
          <Wallet className="mx-auto text-slate-400" size={18} />
          <p className="mt-2 text-xs text-slate-500">Track Income</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
          <TrendingUp className="mx-auto text-slate-400" size={18} />
          <p className="mt-2 text-xs text-slate-500">Monitor Spending</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
          <BarChart3 className="mx-auto text-slate-400" size={18} />
          <p className="mt-2 text-xs text-slate-500">View Reports</p>
        </div>

      </div>
    </div>
  );
};

export default ReportsEmptyState;