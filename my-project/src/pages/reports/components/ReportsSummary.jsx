// const ReportsSummary = ({ metrics, aiInsights }) => {
//   return (
//     <div className="grid md:grid-cols-4 gap-4">

//       <div className="p-4 border rounded-xl dark:border-gray-800">
//         <p className="text-xs text-gray-500">Total Income</p>
//         <h2 className="text-lg font-semibold text-green-500">
//           ₦{metrics.income.toLocaleString()}
//         </h2>
//       </div>

//       <div className="p-4 border rounded-xl dark:border-gray-800">
//         <p className="text-xs text-gray-500">Total Expense</p>
//         <h2 className="text-lg font-semibold text-red-500">
//           ₦{metrics.expense.toLocaleString()}
//         </h2>
//       </div>

//       <div className="p-4 border rounded-xl dark:border-gray-800">
//         <p className="text-xs text-gray-500">Savings</p>
//         <h2 className="text-lg font-semibold">
//           ₦{metrics.savings.toLocaleString()}
//         </h2>
//       </div>

//       <div className="p-4 border rounded-xl dark:border-gray-800">
//         <p className="text-xs text-gray-500">Savings Rate</p>
//         <h2 className="text-lg font-semibold">
//           {metrics.savingsRate.toFixed(1)}%
//         </h2>
//       </div>

//       {/* AI INSIGHT STRIP */}
//       <div className="md:col-span-4 p-4 rounded-xl bg-white dark:bg-gray-900 border dark:border-gray-800">
//         <p className="text-sm text-gray-600 dark:text-gray-300">
//           🧠 {aiInsights?.message}
//         </p>

//         {aiInsights?.riskLevel && (
//           <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full ${
//             aiInsights.riskLevel === "high"
//               ? "bg-red-100 text-red-600"
//               : aiInsights.riskLevel === "medium"
//               ? "bg-yellow-100 text-yellow-600"
//               : "bg-green-100 text-green-600"
//           }`}>
//             {aiInsights.riskLevel.toUpperCase()} RISK
//           </span>
//         )}
//       </div>

//     </div>
//   );
// };

// export default ReportsSummary;


// import { motion } from "framer-motion";
// import {
//   ArrowDownRight,
//   ArrowUpRight,
//   Wallet,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";

// const ReportsSummary = ({ metrics, aiInsights }) => {
//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: "NGN",
//       maximumFractionDigits: 0,
//     }).format(amount || 0);

//   const getRiskStyles = (level) => {
//     switch (level) {
//       case "high":
//         return "bg-red-500/10 text-red-400 border-red-500/20";
//       case "medium":
//         return "bg-amber-500/10 text-amber-400 border-amber-500/20";
//       default:
//         return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
//     }
//   };

//   const cards = [
//     {
//       title: "Total Income",
//       value: formatCurrency(metrics?.income),
//       icon: ArrowUpRight,
//       iconBg:
//         "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
//       valueColor: "text-emerald-400",
//       sub: "Cash inflow",
//     },
//     {
//       title: "Total Expense",
//       value: formatCurrency(metrics?.expense),
//       icon: ArrowDownRight,
//       iconBg: "bg-red-500/10 text-red-400 border border-red-500/20",
//       valueColor: "text-red-400",
//       sub: "Outgoing spend",
//     },
//     {
//       title: "Net Savings",
//       value: formatCurrency(metrics?.savings),
//       icon: Wallet,
//       iconBg:
//         "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
//       valueColor: "text-white",
//       sub: "Balance retained",
//     },
//     {
//       title: "Savings Rate",
//       value: `${Number(metrics?.savingsRate || 0).toFixed(1)}%`,
//       icon: ShieldCheck,
//       iconBg:
//         "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
//       valueColor: "text-white",
//       sub: "Efficiency score",
//     },
//   ];

//   return (
//     <div className="space-y-5">
//       {/* METRIC GRID */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         {cards.map((card, index) => {
//           const Icon = card.icon;

//           return (
//             <motion.div
//               key={card.title}
//               initial={{ opacity: 0, y: 14 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.06 }}
//               className="
//                 relative overflow-hidden rounded-3xl
//                 border border-slate-200 dark:border-slate-800
//                 bg-white dark:bg-slate-900
//                 shadow-sm hover:shadow-xl
//                 transition-all duration-300
//                 p-5
//               "
//             >
//               {/* glow */}
//               <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 blur-2xl opacity-70" />

//               <div className="relative flex items-start justify-between">
//                 <div>
//                   <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
//                     {card.title}
//                   </p>

//                   <h2
//                     className={`mt-3 text-2xl font-semibold tracking-tight ${card.valueColor}`}
//                   >
//                     {card.value}
//                   </h2>

//                   <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
//                     {card.sub}
//                   </p>
//                 </div>

//                 <div
//                   className={`h-11 w-11 rounded-2xl flex items-center justify-center ${card.iconBg}`}
//                 >
//                   <Icon size={18} />
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* AI INTELLIGENCE PANEL */}
//       <motion.div
//         initial={{ opacity: 0, y: 14 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.25 }}
//         className="
//           relative overflow-hidden rounded-3xl
//           border border-slate-200 dark:border-slate-800
//           bg-gradient-to-br from-white via-slate-50 to-slate-100
//           dark:from-slate-900 dark:via-slate-900 dark:to-slate-950
//           p-5 md:p-6
//         "
//       >
//         {/* premium glow */}
//         <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />

//         <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="flex gap-4">
//             <div
//               className="
//                 h-12 w-12 rounded-2xl
//                 bg-gradient-to-br from-indigo-600 to-cyan-500
//                 text-white flex items-center justify-center
//                 shadow-lg
//               "
//             >
//               <Sparkles size={18} />
//             </div>

//             <div>
//               <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
//                 AI Financial Insight
//               </p>

//               <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-7 max-w-3xl">
//                 {aiInsights?.message ||
//                   "Your spending trend is stable. Continue maintaining disciplined budget behavior and prioritize savings growth."}
//               </p>
//             </div>
//           </div>

//           {aiInsights?.riskLevel && (
//             <span
//               className={`
//                 inline-flex items-center justify-center
//                 px-3 py-2 rounded-2xl text-xs font-semibold
//                 border ${getRiskStyles(aiInsights.riskLevel)}
//               `}
//             >
//               {aiInsights.riskLevel.toUpperCase()} RISK
//             </span>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ReportsSummary;


import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const ReportsSummary = ({ metrics, aiInsights }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(metrics?.income),
      icon: ArrowUpRight,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total Expense",
      value: formatCurrency(metrics?.expense),
      icon: ArrowDownRight,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      title: "Net Savings",
      value: formatCurrency(metrics?.savings),
      icon: Wallet,
      color: "text-white",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Savings Rate",
      value: `${Number(metrics?.savingsRate || 0).toFixed(1)}%`,
      icon: ShieldCheck,
      color: "text-white",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-6">

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                relative overflow-hidden rounded-3xl
                border border-white/10
                bg-[#0f172a]
                p-5
                shadow-lg hover:shadow-2xl
                transition-all duration-300
              "
            >
              {/* soft glow */}
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/5 blur-3xl" />

              <div className="relative flex items-start justify-between">

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {card.title}
                  </p>

                  <h2 className={`mt-3 text-2xl font-semibold ${card.color}`}>
                    {card.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-500">
                    Financial metric
                  </p>
                </div>

                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${card.bg}`}
                >
                  <Icon size={18} className={card.color} />
                </div>

              </div>
            </motion.div>
          );
        })}

      </div>

      {/* AI INSIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="
          relative overflow-hidden rounded-3xl
          border border-white/10
          bg-[#0f172a]
          p-6
        "
      >
        {/* glow accents */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5">

          {/* LEFT */}
          <div className="flex gap-4">

            <div className="
              h-12 w-12 rounded-2xl
              bg-gradient-to-br from-emerald-500 to-cyan-500
              flex items-center justify-center text-white
              shadow-lg
            ">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                AI Insight
              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-300 max-w-2xl">
                {aiInsights?.message ||
                  "Your financial behavior is stable. Maintain consistent savings habits and reduce unnecessary discretionary spending."}
              </p>
            </div>

          </div>

          {/* RISK BADGE */}
          {aiInsights?.riskLevel && (
            <div
              className={`
                inline-flex items-center rounded-2xl px-3 py-2 text-xs font-semibold border
                ${
                  aiInsights.riskLevel === "high"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : aiInsights.riskLevel === "medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }
              `}
            >
              {aiInsights.riskLevel.toUpperCase()} RISK
            </div>
          )}

        </div>
      </motion.div>

    </div>
  );
};

export default ReportsSummary;