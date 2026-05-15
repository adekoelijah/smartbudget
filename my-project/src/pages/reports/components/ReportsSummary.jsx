


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