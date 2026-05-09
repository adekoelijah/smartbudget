// import { motion } from "framer-motion";

// // 🎯 Animation Variants
// const container = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.12,
//     },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 40 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5 },
//   },
// };

// // 🧠 Feature Data (scalable)
// const features = [
//   {
//     title: "AI-Powered Insights",
//     description:
//       "Get intelligent recommendations that help you optimize spending and grow your savings.",
//     icon: "🤖",
//   },
//   {
//     title: "Smart Budget Control",
//     description:
//       "Set budgets, track expenses, and stay within limits with real-time alerts.",
//     icon: "💰",
//   },
//   {
//     title: "Advanced Analytics",
//     description:
//       "Visualize your financial data with charts and reports that make decision-making easy.",
//     icon: "📊",
//   },
//   {
//     title: "Secure & Private",
//     description:
//       "Your financial data is encrypted and protected with industry-grade security.",
//     icon: "🔐",
//   },
//   {
//     title: "Real-Time Tracking",
//     description:
//       "Monitor transactions instantly and stay updated with your financial activities.",
//     icon: "⚡",
//   },
//   {
//     title: "Goal Planning",
//     description:
//       "Set savings goals and track your progress toward achieving financial freedom.",
//     icon: "🎯",
//   },
// ];

// const Features = () => {
//   return (
//     <section className="py-24 bg-white dark:bg-gray-950">
//       <div className="max-w-7xl mx-auto px-4">

//         {/* HEADER */}
//         <div className="text-center max-w-2xl mx-auto mb-14">
//           <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
//             Everything you need to manage your finances
//           </h2>

//           <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm md:text-base">
//             Powerful tools designed to help you track, analyze, and grow your money with confidence.
//           </p>
//         </div>

//         {/* GRID */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
//         >
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               variants={item}
//               className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
//             >
//               {/* ICON */}
//               <div className="text-3xl mb-4">
//                 {feature.icon}
//               </div>

//               {/* TITLE */}
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 {feature.title}
//               </h3>

//               {/* DESCRIPTION */}
//               <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
//                 {feature.description}
//               </p>

//               {/* HOVER LINE */}
//               <div className="mt-4 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
//             </motion.div>
//           ))}
//         </motion.div>

//       </div>
//     </section>
//   );
// };

// export default Features;
import { motion } from "framer-motion";
import {
  Brain,
  Wallet,
  BarChart3,
  ShieldCheck,
  Zap,
  Target,
  ArrowUpRight,
} from "lucide-react";

/* =========================================
   ANIMATION SYSTEM
========================================= */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

/* =========================================
   DATA
========================================= */
const features = [
  {
    title: "AI-Powered Insights",
    description:
      "Intelligent recommendations that analyze habits and optimize savings automatically.",
    icon: Brain,
  },
  {
    title: "Smart Budget Control",
    description:
      "Create spending plans with real-time alerts before limits are exceeded.",
    icon: Wallet,
  },
  {
    title: "Advanced Analytics",
    description:
      "Clean reports and visual trends that improve financial decision-making.",
    icon: BarChart3,
  },
  {
    title: "Secure by Design",
    description:
      "Enterprise-grade encryption protects every transaction and data point.",
    icon: ShieldCheck,
  },
  {
    title: "Live Tracking",
    description:
      "Monitor balances and transactions instantly across your ecosystem.",
    icon: Zap,
  },
  {
    title: "Goal Engine",
    description:
      "Set milestones, automate progress, and grow toward financial freedom.",
    icon: Target,
  },
];

/* =========================================
   CARD
========================================= */
const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={item}
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-7 shadow-sm hover:shadow-2xl transition-all"
    >
      {/* Glow Layer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5" />

      {/* Top Row */}
      <div className="relative flex items-center justify-between">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.06 }}
          className="h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-xl"
        >
          <Icon size={24} />
        </motion.div>

        <motion.div
          whileHover={{ x: 3, y: -3 }}
          className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
        >
          <ArrowUpRight size={18} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative mt-6">
        <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {feature.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>

      {/* Bottom Progress Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{
          delay: 0.15 + index * 0.05,
          duration: 0.8,
        }}
        className="relative mt-7 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
      />

      {/* Floating Dot */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          delay: index * 0.3,
        }}
        className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md"
      />
    </motion.div>
  );
};

/* =========================================
   MAIN COMPONENT
========================================= */
const Features = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-28 bg-white dark:bg-gray-950"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[920px] h-[920px] rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="absolute top-1/3 right-0 w-[360px] h-[360px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 shadow-sm">
            ✨ Powerful Financial Tools
          </span>

          <h2 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Everything you need to manage money
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-transparent bg-clip-text">
              with confidence & clarity
            </span>
          </h2>

          <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-400 leading-8">
            Built for control, automation, security, and growth—designed to
            feel like a premium modern fintech platform.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;