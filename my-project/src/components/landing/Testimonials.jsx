

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/* =========================
   DATA
========================= */
const testimonials = [
  {
    id: 1,
    name: "David O.",
    role: "Independent Consultant",
    company: "Upwork",
    statement:
      "SmartBudget gives structured visibility into monthly cashflow. Everything is now intentional and traceable.",
    impact: "Savings discipline improved by 38%",
  },
  {
    id: 2,
    name: "Sarah K.",
    role: "E-commerce Founder",
    company: "Shopify Merchant",
    statement:
      "Expense governance became proactive. We now detect financial leaks before they scale.",
    impact: "Overspending reduced by 42%",
  },
  {
    id: 3,
    name: "John M.",
    role: "Software Engineer",
    company: "GitHub",
    statement:
      "The system feels engineered like infrastructure, not a budgeting app.",
    impact: "Stable monthly savings achieved",
  },
  {
    id: 4,
    name: "Grace A.",
    role: "Financial Consultant",
    company: "Deloitte",
    statement:
      "Reporting clarity is enterprise-grade. It matches institutional financial tools.",
    impact: "Reporting accuracy +64%",
  },
  {
    id: 5,
    name: "Michael T.",
    role: "Startup Founder",
    company: "Stripe Ecosystem",
    statement:
      "We use SmartBudget for internal financial governance across teams.",
    impact: "Burn rate reduced significantly",
  },
  {
    id: 6,
    name: "Ada N.",
    role: "Product Manager",
    company: "Notion",
    statement:
      "Forecasting became reliable. Financial planning is now structured and predictable.",
    impact: "Forecast accuracy improved",
  },
];

/* =========================
   CARD
========================= */
const Card = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="
        relative
        rounded-2xl
        border border-slate-200
        bg-white
        p-6
        hover:shadow-lg
        transition
      "
    >
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500">
            {item.role} · {item.company}
          </p>
        </div>

        <CheckCircle2 size={16} className="text-emerald-500" />
      </div>

      {/* statement */}
      <p className="mt-5 text-sm leading-6 text-slate-600">
        {item.statement}
      </p>

      {/* impact */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-xs text-slate-500">
          Financial impact
        </span>

        <span className="text-xs font-semibold text-slate-900">
          {item.impact}
        </span>
      </div>
    </motion.div>
  );
};

/* =========================
   SECTION
========================= */
const Testimonials = () => {
  const [visibleCount, setVisibleCount] = useState(3);

  const visible = testimonials.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + 3, testimonials.length)
    );
  };

  const canLoadMore = visibleCount < testimonials.length;

  return (
    <section className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-xs font-medium text-slate-600">
            <ShieldCheck size={14} />
            Verified Financial Outcomes
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
            Real users,
            <br />
            real financial control
          </h2>

          <p className="mt-4 text-slate-600">
            SmartBudget is used for structured financial
            planning, disciplined spending, and operational
            cashflow visibility.
          </p>
        </div>

        {/* GRID */}
        <motion.div
          layout
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {visible.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* LOAD MORE */}
        {canLoadMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={loadMore}
              className="
                flex items-center gap-2
                px-6 py-3
                rounded-xl
                border
                bg-white
                hover:bg-slate-100
                transition
                text-sm font-medium
                text-slate-700
              "
            >
              Load more testimonials
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;