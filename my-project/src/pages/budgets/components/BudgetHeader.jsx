

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { motion } from "framer-motion";
import {
  Wallet,
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const BudgetHeader = ({
  search,
  setSearch,
  onCreateClick,
  totalBudgets = 0,
  totalSpent = 0,
}) => {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-10 xl:px-12">

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-6 sm:p-8 shadow-2xl"
        >
          {/* Glow Effects */}
          <div className="absolute -top-10 left-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT CONTENT */}
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                <Sparkles size={15} />
                SmartBudget Dashboard
              </div>

              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Budget Management
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Track spending, stay disciplined, optimize your finances,
                and gain intelligent insights into your money flow.
              </p>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Total Budgets</p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {totalBudgets}
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Total Spent</p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    ₦{totalSpent.toLocaleString()}
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Status</p>
                  <h3 className="mt-1 flex items-center gap-2 text-xl font-bold text-emerald-400">
                    <TrendingUp size={18} />
                    Healthy
                  </h3>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="w-full sm:w-auto">
              <Button
                onClick={onCreateClick}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-4 font-semibold text-white shadow-xl transition hover:scale-105 sm:w-auto"
              >
                + Create Budget
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* SEARCH + AI STATUS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-[1fr_auto]"
        >
          {/* Search */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 shadow-lg">
            <Search size={18} className="text-slate-400" />
            <Input
              placeholder="Search budgets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none bg-[#0f172a] text-slate-700 placeholder:text-slate-500 focus:ring-0"
            />
          </div>

          {/* AI Insight Card */}
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-3 shadow-lg md:flex">
            <div className="rounded-xl bg-emerald-500/10 p-2">
              <Wallet size={18} className="text-emerald-400" />
            </div>

            <div>
              <p className="text-xs text-slate-500">AI Monitor</p>
              <p className="text-sm font-medium text-white">
                Tracking spending behavior
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetHeader;