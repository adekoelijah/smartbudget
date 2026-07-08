


import { motion } from "framer-motion";
import {
  BrainCircuit,
  Wallet,
  BarChart3,
  ShieldCheck,
  Activity,
  Target,
} from "lucide-react";

/* =========================
   MOTION SYSTEM (CONTROLLED)
========================= */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================
   FEATURES DATA
========================= */
const features = [
  {
    title: "Smart Budget Engine",
    description:
      "Rule-based allocation system that enforces disciplined spending structures automatically.",
    icon: Wallet,
  },
  {
    title: "Cashflow Intelligence",
    description:
      "Real-time monitoring of inflow and outflow across all financial accounts and channels.",
    icon: Activity,
  },
  {
    title: "Behavioral Finance Layer",
    description:
      "Detects spending patterns and translates them into structured financial insights.",
    icon: BrainCircuit,
  },
  {
    title: "Analytics & Reporting Core",
    description:
      "Institution-grade reporting engine for forecasting, trends, and financial performance.",
    icon: BarChart3,
  },
  {
    title: "Security Architecture",
    description:
      "Bank-grade encryption layer ensuring financial data integrity and protection.",
    icon: ShieldCheck,
  },
  {
    title: "Financial Control System",
    description:
      "User-defined limits and automated enforcement rules for financial discipline.",
    icon: Target,
  },
];

/* =========================
   CARD
========================= */
const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={item}
      className="
        group relative
        rounded-2xl
        border border-white/10
        bg-[#0B1220]
        p-6
        transition-all duration-300
        hover:border-white/20
      "
    >
      {/* subtle top line (institutional signal) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ICON SYSTEM */}
      <div className="flex items-center gap-4">
        <div
          className="
            flex items-center justify-center
            h-11 w-11
            rounded-xl
            bg-white/5
            border border-white/10
          "
        >
          <Icon size={18} className="text-slate-200" />
        </div>

        <h3 className="text-[15px] font-semibold text-white tracking-tight">
          {feature.title}
        </h3>
      </div>

      {/* DESCRIPTION */}
      <p className="mt-4 text-[13px] leading-6 text-slate-400">
        {feature.description}
      </p>

      {/* bottom trust line */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-px flex-1 bg-white/5" />
        <span className="px-3 text-[10px] tracking-[0.2em] text-slate-500">
          CONTROL LAYER
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
    </motion.div>
  );
};

/* =========================
   SECTION
========================= */
const Features = () => {
  return (
    <section className="relative py-28 bg-[#070A12] overflow-hidden">

      {/* STRUCTURED BACKGROUND GRID */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="max-w-3xl">
          <h2 className="text-[44px] md:text-[56px] leading-[1.05] tracking-[-0.04em] font-semibold text-white">
            Financial systems
            <br />
            built for control,
            <br />
            not guesswork
          </h2>

          <p className="mt-6 text-[15px] leading-7 text-slate-400">
            A structured financial architecture designed for precision,
            stability, and predictable financial behavior across all user levels.
          </p>
        </div>

        {/* GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="
            mt-16
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;