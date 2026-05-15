


// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Users,
//   CreditCard,
//   Wallet,
//   PiggyBank,
// } from "lucide-react";

// /* ========================================
//    COUNT UP HOOK
// ======================================== */
// const useCountUp = (end, duration = 1800) => {
//   const [count, setCount] = useState(0);
//   const ref = useRef(null);
//   const started = useRef(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting && !started.current) {
//           started.current = true;

//           let start = 0;
//           const increment = end / (duration / 16);

//           const animate = () => {
//             start += increment;

//             if (start < end) {
//               setCount(Math.floor(start));
//               requestAnimationFrame(animate);
//             } else {
//               setCount(end);
//             }
//           };

//           animate();
//         }
//       },
//       { threshold: 0.35 }
//     );

//     if (ref.current) observer.observe(ref.current);

//     return () => observer.disconnect();
//   }, [end, duration]);

//   return { count, ref };
// };

// /* ========================================
//    DATA
// ======================================== */
// const statsData = [
//   {
//     label: "Active Users",
//     value: 1200,
//     suffix: "+",
//     icon: Users,
//   },
//   {
//     label: "Transactions Processed",
//     value: 85000,
//     suffix: "+",
//     icon: CreditCard,
//   },
//   {
//     label: "Money Tracked",
//     value: 25000000,
//     prefix: "₦",
//     icon: Wallet,
//   },
//   {
//     label: "Savings Achieved",
//     value: 18000000,
//     prefix: "₦",
//     icon: PiggyBank,
//   },
// ];

// /* ========================================
//    CARD
// ======================================== */
// const StatCard = ({
//   label,
//   value,
//   prefix,
//   suffix,
//   icon: Icon,
//   index,
// }) => {
//   const { count, ref } = useCountUp(value);

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 35 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, amount: 0.35 }}
//       transition={{
//         duration: 0.55,
//         delay: index * 0.08,
//       }}
//       whileHover={{
//         y: -6,
//         scale: 1.015,
//       }}
//       className="group relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-2xl transition-all"
//     >
//       {/* glow */}
//       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />

//       {/* top row */}
//       <div className="relative flex items-center justify-between">
//         <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
//           <Icon size={22} />
//         </div>

//         <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
//           Live
//         </span>
//       </div>

//       {/* value */}
//       <div className="relative mt-7">
//         <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
//           {prefix || ""}
//           {count.toLocaleString()}
//           {suffix || ""}
//         </h3>

//         <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//           {label}
//         </p>
//       </div>

//       {/* bottom line */}
//       <motion.div
//         initial={{ width: 0 }}
//         whileInView={{ width: "100%" }}
//         viewport={{ once: true }}
//         transition={{
//           delay: 0.4 + index * 0.08,
//           duration: 0.8,
//         }}
//         className="relative mt-6 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
//       />
//     </motion.div>
//   );
// };

// /* ========================================
//    MAIN SECTION
// ======================================== */
// const Stats = () => {
//   return (
//     <section className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-950">
//       {/* background glow */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-8">
//         {/* HEADER */}
//         <motion.div
//           initial={{ opacity: 0, y: 35 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center max-w-3xl mx-auto mb-14"
//         >
//           <span className="inline-flex px-4 py-2 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900">
//             Performance Metrics
//           </span>

//           <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
//             Trusted by users building
//             <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-transparent bg-clip-text">
//               smarter financial habits
//             </span>
//           </h2>

//           <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-400">
//             Thousands rely on SmartBudget to track expenses,
//             optimize spending, and accelerate savings growth.
//           </p>
//         </motion.div>

//         {/* GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//           {statsData.map((stat, index) => (
//             <StatCard
//               key={index}
//               index={index}
//               {...stat}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Stats;



import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet2,
  Activity,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* =========================
   COUNT UP HOOK (stable)
========================= */
const useCountUp = (end, duration = 1600) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          let start = 0;
          const increment = end / (duration / 16);

          const animate = () => {
            start += increment;

            if (start < end) {
              setCount(Math.floor(start));
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          animate();
        }
      },
      { threshold: 0.35 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
};

/* =========================
   FINTECH KPI DATA (3 ONLY)
========================= */
const statsData = [
  {
    title: "Total Assets Under Management",
    value: 285000000,
    prefix: "₦",
    subtitle: "Across verified user portfolios",
    icon: Wallet2,
    trend: "+18.2%",
  },
  {
    title: "Monthly Transaction Volume",
    value: 920000,
    suffix: "+",
    subtitle: "Secure processed transactions",
    icon: Activity,
    trend: "+11.6%",
  },
  {
    title: "Platform Security Integrity",
    value: 99.98,
    suffix: "%",
    subtitle: "Uptime + encrypted processing systems",
    icon: ShieldCheck,
    trend: "Enterprise",
  },
];

/* =========================
   CARD
========================= */
const StatCard = ({ data, index }) => {
  const { count, ref } = useCountUp(data.value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      className="
        relative
        bg-white
        border border-slate-200
        rounded-2xl
        p-7
        shadow-[0_1px_2px_rgba(15,23,42,0.04)]
        hover:shadow-[0_18px_50px_rgba(15,23,42,0.06)]
        transition-all duration-300
      "
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-slate-950 flex items-center justify-center">
          <data.icon size={20} className="text-white" />
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50">
          <TrendingUp size={12} className="text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-700">
            {data.trend}
          </span>
        </div>
      </div>

      {/* VALUE */}
      <div className="mt-8">
        <h3 className="text-[34px] font-semibold tracking-[-0.04em] text-slate-950">
          {data.prefix || ""}
          {typeof data.value === "number" && data.value % 1 !== 0
            ? count.toFixed(2)
            : count.toLocaleString()}
          {data.suffix || ""}
        </h3>

        <p className="mt-3 text-[15px] font-semibold text-slate-900">
          {data.title}
        </p>

        <p className="mt-2 text-[13px] leading-6 text-slate-500">
          {data.subtitle}
        </p>
      </div>

      {/* FOOTER STRIP (fintech signature element) */}
      <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-slate-500 font-medium">
            Live system metric
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          Real-time
        </span>
      </div>
    </motion.div>
  );
};

/* =========================
   SECTION
========================= */
const Stats = () => {
  return (
    <section className="relative bg-[#F8FAFC] py-28 overflow-hidden">
      {/* subtle grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">
              Financial Intelligence Layer
            </span>
          </div>

          <h2 className="mt-8 text-[44px] md:text-[58px] leading-[1.02] tracking-[-0.05em] font-semibold text-slate-950">
            Trusted financial
            <br />
            infrastructure built
            <br />
            for scale
          </h2>

          <p className="mt-8 text-[16px] leading-7 text-slate-600 max-w-2xl">
            SmartBudget provides enterprise-grade financial
            tracking, secure transaction monitoring, and
            intelligent budgeting systems designed for real
            financial operations — not mock dashboards.
          </p>
        </div>

        {/* 3-CARD GRID (FINTECH STANDARD) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((item, index) => (
            <StatCard
              key={index}
              data={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;