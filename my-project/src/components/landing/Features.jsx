
// import { motion } from "framer-motion";
// import {
//   Brain,
//   Wallet,
//   BarChart3,
//   ShieldCheck,
//   Zap,
//   Target,
//   ArrowUpRight,
// } from "lucide-react";

// /* =========================================
//    ANIMATION SYSTEM
// ========================================= */
// const container = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.08,
//       delayChildren: 0.08,
//     },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 28 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.55,
//       ease: "easeOut",
//     },
//   },
// };

// /* =========================================
//    DATA
// ========================================= */
// const features = [
//   {
//     title: "AI-Powered Insights",
//     description:
//       "Intelligent recommendations that analyze habits and optimize savings automatically.",
//     icon: Brain,
//   },
//   {
//     title: "Smart Budget Control",
//     description:
//       "Create spending plans with real-time alerts before limits are exceeded.",
//     icon: Wallet,
//   },
//   {
//     title: "Advanced Analytics",
//     description:
//       "Clean reports and visual trends that improve financial decision-making.",
//     icon: BarChart3,
//   },
//   {
//     title: "Secure by Design",
//     description:
//       "Enterprise-grade encryption protects every transaction and data point.",
//     icon: ShieldCheck,
//   },
//   {
//     title: "Live Tracking",
//     description:
//       "Monitor balances and transactions instantly across your ecosystem.",
//     icon: Zap,
//   },
//   {
//     title: "Goal Engine",
//     description:
//       "Set milestones, automate progress, and grow toward financial freedom.",
//     icon: Target,
//   },
// ];

// /* =========================================
//    CARD
// ========================================= */
// const FeatureCard = ({ feature, index }) => {
//   const Icon = feature.icon;

//   return (
//     <motion.div
//       variants={item}
//       whileHover={{
//         y: -8,
//         scale: 1.015,
//       }}
//       transition={{ duration: 0.25 }}
//       className="group relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-7 shadow-sm hover:shadow-2xl transition-all"
//     >
//       {/* Glow Layer */}
//       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5" />

//       {/* Top Row */}
//       <div className="relative flex items-center justify-between">
//         <motion.div
//           whileHover={{ rotate: -8, scale: 1.06 }}
//           className="h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-xl"
//         >
//           <Icon size={24} />
//         </motion.div>

//         <motion.div
//           whileHover={{ x: 3, y: -3 }}
//           className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
//         >
//           <ArrowUpRight size={18} />
//         </motion.div>
//       </div>

//       {/* Content */}
//       <div className="relative mt-6">
//         <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
//           {feature.title}
//         </h3>

//         <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
//           {feature.description}
//         </p>
//       </div>

//       {/* Bottom Progress Line */}
//       <motion.div
//         initial={{ width: 0 }}
//         whileInView={{ width: "100%" }}
//         viewport={{ once: true }}
//         transition={{
//           delay: 0.15 + index * 0.05,
//           duration: 0.8,
//         }}
//         className="relative mt-7 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
//       />

//       {/* Floating Dot */}
//       <motion.div
//         animate={{
//           y: [0, -6, 0],
//         }}
//         transition={{
//           repeat: Infinity,
//           duration: 3,
//           delay: index * 0.3,
//         }}
//         className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md"
//       />
//     </motion.div>
//   );
// };

// /* =========================================
//    MAIN COMPONENT
// ========================================= */
// const Features = () => {
//   return (
//     <section
//       id="features"
//       className="relative overflow-hidden py-28 bg-white dark:bg-gray-950"
//     >
//       {/* Background Glow */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[920px] h-[920px] rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/10 blur-3xl" />

//         <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-indigo-500/5 blur-3xl" />

//         <div className="absolute top-1/3 right-0 w-[360px] h-[360px] rounded-full bg-purple-500/5 blur-3xl" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 26 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.55 }}
//           className="text-center max-w-3xl mx-auto mb-16"
//         >
//           <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 shadow-sm">
//             ✨ Powerful Financial Tools
//           </span>

//           <h2 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
//             Everything you need to manage money
//             <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-transparent bg-clip-text">
//               with confidence & clarity
//             </span>
//           </h2>

//           <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-400 leading-8">
//             Built for control, automation, security, and growth—designed to
//             feel like a premium modern fintech platform.
//           </p>
//         </motion.div>

//         {/* Grid */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, amount: 0.15 }}
//           className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
//         >
//           {features.map((feature, index) => (
//             <FeatureCard
//               key={index}
//               feature={feature}
//               index={index}
//             />
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Features;

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
   MOTION SYSTEM
========================= */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================
   FEATURES (6 TOTAL)
========================= */
const features = [
  {
    title: "Smart Budget Engine",
    description:
      "Rule-based financial allocation system that enforces spending discipline automatically.",
    icon: Wallet,
  },
  {
    title: "Cashflow Monitoring",
    description:
      "Real-time tracking of income and expenses across all connected accounts.",
    icon: Activity,
  },
  {
    title: "Financial Intelligence Layer",
    description:
      "Detects behavioral patterns and surfaces actionable financial insights.",
    icon: BrainCircuit,
  },
  {
    title: "Advanced Analytics Core",
    description:
      "Structured reporting engine for financial performance and forecasting.",
    icon: BarChart3,
  },
  {
    title: "Security & Encryption Layer",
    description:
      "Bank-grade encryption securing all transactions and stored financial data.",
    icon: ShieldCheck,
  },
  {
    title: "Goal & Limit Control System",
    description:
      "User-defined financial boundaries with automated enforcement rules.",
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
        border border-slate-200
        bg-white
        p-6
        hover:border-slate-300
        transition-all duration-300
      "
    >
      {/* ICON */}
      <div className="h-10 w-10 rounded-lg bg-slate-950 flex items-center justify-center">
        <Icon size={18} className="text-white" />
      </div>

      {/* CONTENT */}
      <div className="mt-5">
        <h3 className="text-[15px] font-semibold text-slate-950 tracking-tight">
          {feature.title}
        </h3>

        <p className="mt-2 text-[13px] leading-6 text-slate-500">
          {feature.description}
        </p>
      </div>

      {/* subtle divider */}
      <div className="mt-6 h-px w-full bg-slate-100" />
    </motion.div>
  );
};

/* =========================
   SECTION
========================= */
const Features = () => {
  return (
    <section className="relative py-28 bg-white overflow-hidden">
      {/* SUBTLE GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a03_1px,transparent_1px),linear-gradient(to_bottom,#0f172a03_1px,transparent_1px)] bg-[size:90px_90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="max-w-3xl">
          <h2 className="text-[42px] md:text-[54px] leading-[1.05] tracking-[-0.04em] font-semibold text-slate-950">
            Built for financial
            <br />
            precision and control
          </h2>

          <p className="mt-6 text-[16px] leading-7 text-slate-600">
            A structured financial system designed for reliability,
            transparency, and scalable money management across users
            and transactions.
          </p>
        </div>

        {/* GRID (3 COLUMNS, 2 ROWS) */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="
            mt-16
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;