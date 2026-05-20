

// import { motion } from "framer-motion";
// import {
//   BrainCircuit,
//   Wallet,
//   BarChart3,
//   ShieldCheck,
//   Activity,
//   Target,
// } from "lucide-react";

// /* =========================
//    MOTION SYSTEM
// ========================= */
// const container = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.05,
//     },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 16 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: [0.22, 1, 0.36, 1],
//     },
//   },
// };

// /* =========================
//    FEATURES (6 TOTAL)
// ========================= */
// const features = [
//   {
//     title: "Smart Budget Engine",
//     description:
//       "Rule-based financial allocation system that enforces spending discipline automatically.",
//     icon: Wallet,
//   },
//   {
//     title: "Cashflow Monitoring",
//     description:
//       "Real-time tracking of income and expenses across all connected accounts.",
//     icon: Activity,
//   },
//   {
//     title: "Financial Intelligence Layer",
//     description:
//       "Detects behavioral patterns and surfaces actionable financial insights.",
//     icon: BrainCircuit,
//   },
//   {
//     title: "Advanced Analytics Core",
//     description:
//       "Structured reporting engine for financial performance and forecasting.",
//     icon: BarChart3,
//   },
//   {
//     title: "Security & Encryption Layer",
//     description:
//       "Bank-grade encryption securing all transactions and stored financial data.",
//     icon: ShieldCheck,
//   },
//   {
//     title: "Goal & Limit Control System",
//     description:
//       "User-defined financial boundaries with automated enforcement rules.",
//     icon: Target,
//   },
// ];

// /* =========================
//    CARD
// ========================= */
// const FeatureCard = ({ feature }) => {
//   const Icon = feature.icon;

//   return (
//     <motion.div
//       variants={item}
//       className="
//         group relative
//         rounded-2xl
//         border border-slate-200
//         bg-white
//         p-6
//         hover:border-slate-300
//         transition-all duration-300
//       "
//     >
//       {/* ICON */}
//       <div className="h-10 w-10 rounded-lg bg-slate-950 flex items-center justify-center">
//         <Icon size={18} className="text-white" />
//       </div>

//       {/* CONTENT */}
//       <div className="mt-5">
//         <h3 className="text-[15px] font-semibold text-slate-950 tracking-tight">
//           {feature.title}
//         </h3>

//         <p className="mt-2 text-[13px] leading-6 text-slate-500">
//           {feature.description}
//         </p>
//       </div>

//       {/* subtle divider */}
//       <div className="mt-6 h-px w-full bg-slate-100" />
//     </motion.div>
//   );
// };

// /* =========================
//    SECTION
// ========================= */
// const Features = () => {
//   return (
//     <section className="relative py-28 bg-white overflow-hidden">
//       {/* SUBTLE GRID BACKGROUND */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a03_1px,transparent_1px),linear-gradient(to_bottom,#0f172a03_1px,transparent_1px)] bg-[size:90px_90px]" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* HEADER */}
//         <div className="max-w-3xl">
//           <h2 className="text-[42px] md:text-[54px] leading-[1.05] tracking-[-0.04em] font-semibold text-slate-950">
//             Built for financial
//             <br />
//             precision and control
//           </h2>

//           <p className="mt-6 text-[16px] leading-7 text-slate-600">
//             A structured financial system designed for reliability,
//             transparency, and scalable money management across users
//             and transactions.
//           </p>
//         </div>

//         {/* GRID (3 COLUMNS, 2 ROWS) */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, amount: 0.2 }}
//           className="
//             mt-16
//             grid
//             grid-cols-1
//             sm:grid-cols-2
//             lg:grid-cols-3
//             gap-6
//           "
//         >
//           {features.map((feature, index) => (
//             <FeatureCard key={index} feature={feature} />
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