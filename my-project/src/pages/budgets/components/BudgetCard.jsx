


import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const spent = budget.spent || 0;
  const limit = budget.limit || 0;

  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

  const isDanger = percent >= 80;
  const isMid = percent >= 50 && percent < 80;

  const progressColor = isDanger
    ? "from-red-500 to-red-400"
    : isMid
    ? "from-yellow-500 to-orange-400"
    : "from-emerald-500 to-green-400";

  const safeEdit = () => {
    if (typeof onEdit === "function") {
      onEdit(budget);
    }
  };

  const safeDelete = () => {
    if (typeof onDelete === "function") {
      onDelete(budget._id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-xl"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Wallet size={16} />
            Budget Category
          </div>

          <h3 className="mt-1 text-lg font-semibold text-white">
            {budget.name}
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={safeEdit}
            className="rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={safeDelete}
            className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-gray-400">Spent</p>
          <h4 className="mt-1 text-lg font-bold text-white">
            ₦{spent.toLocaleString()}
          </h4>
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-gray-400">Limit</p>
          <h4 className="mt-1 text-lg font-bold text-white">
            ₦{limit.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">Usage</span>
          <span className="font-semibold text-white">
            {percent.toFixed(0)}%
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
          />
        </div>
      </div>

      {/* Warning */}
      {isDanger && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
          <AlertTriangle size={16} />
          You are close to exceeding this budget.
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
        <TrendingUp size={14} />
        SmartBudget Tracking Active
      </div>
    </motion.div>
  );
};

export default BudgetCard;