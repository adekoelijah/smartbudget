


// import Button from "../../../components/ui/Button";
// import { motion } from "framer-motion";

// const BudgetEmptyState = ({ onCreateClick }) => {
//   return (
//     <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 px-4 sm:px-6">

//       {/* ILLUSTRATION */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="mb-6"
//       >
//         <img
//           src="/images/empty-budget.svg"
//           alt="No budgets"
//           className="w-40 sm:w-52 md:w-64 mx-auto opacity-90"
//         />
//       </motion.div>

//       {/* ICON (fallback / accent) */}
//       <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-xl">
//         📊
//       </div>

//       {/* TITLE */}
//       <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
//         No budgets yet
//       </h2>

//       {/* DESCRIPTION */}
//       <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-sm sm:max-w-md leading-relaxed">
//         Create your first budget to track spending, control expenses,
//         and unlock AI-powered financial insights.
//       </p>

//       {/* CTA */}
//       <div className="mt-6 w-full sm:w-auto">
//         <Button
//           onClick={onCreateClick}
//           className="w-full sm:w-auto px-6 py-3"
//         >
//           Create your first budget
//         </Button>
//       </div>

//       {/* SECONDARY HINT */}
//       <p className="text-xs text-gray-400 mt-4">
//         Takes less than 30 seconds
//       </p>

//     </div>
//   );
// };

// export default BudgetEmptyState;


import Button from "../../../components/ui/Button";
import { motion } from "framer-motion";
import { Wallet, Sparkles, ArrowRight } from "lucide-react";

const BudgetEmptyState = ({ onCreateClick }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] px-6 py-16 sm:px-10 sm:py-20 text-center shadow-2xl">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center">

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl">
            <Wallet size={40} className="text-white" />
          </div>
        </motion.div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          <Sparkles size={15} />
          SmartBudget Ready
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold text-white"
        >
          No Budgets Yet
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-400"
        >
          Start managing your finances like a pro. Create your first budget,
          monitor spending habits, stay disciplined, and gain intelligent
          insights into your money flow.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            onClick={onCreateClick}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            Create First Budget
            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
            />
          </Button>
        </motion.div>

        {/* Footer Hint */}
        <p className="mt-5 text-xs text-slate-500">
          Takes less than 30 seconds to get started
        </p>
      </div>
    </div>
  );
};

export default BudgetEmptyState;