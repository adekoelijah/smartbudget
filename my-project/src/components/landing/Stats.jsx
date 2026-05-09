// import { useEffect, useRef, useState } from "react";

// // ✅ Custom Hook (valid usage)
// const useCountUp = (end, duration = 1500) => {
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
//       { threshold: 0.4 }
//     );

//     if (ref.current) observer.observe(ref.current);

//     return () => observer.disconnect();
//   }, [end, duration]);

//   return { count, ref };
// };

// // ✅ Individual Stat Card Component
// const StatCard = ({ label, value, prefix, suffix }) => {
//   const { count, ref } = useCountUp(value);

//   return (
//     <div
//       ref={ref}
//       className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 text-center shadow-sm hover:shadow-md transition"
//     >
//       <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
//         {prefix || ""}
//         {count.toLocaleString()}
//         {suffix || ""}
//       </h3>

//       <p className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
//         {label}
//       </p>
//     </div>
//   );
// };

// // 📊 Data
// const statsData = [
//   { label: "Active Users", value: 1200, suffix: "+" },
//   { label: "Transactions Processed", value: 85000, suffix: "+" },
//   { label: "Money Tracked", value: 25000000, prefix: "₦" },
//   { label: "Savings Achieved", value: 18000000, prefix: "₦" },
// ];

// // ✅ Main Component
// const Stats = () => {
//   return (
//     <section className="py-16 bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4">

//         {/* HEADER */}
//         <div className="text-center max-w-2xl mx-auto mb-10">
//           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
//             Trusted by users managing smarter finances
//           </h2>
//           <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400">
//             Our platform helps thousands track, save, and grow their money.
//           </p>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {statsData.map((stat, index) => (
//             <StatCard key={index} {...stat} />
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
  Users,
  CreditCard,
  Wallet,
  PiggyBank,
} from "lucide-react";

/* ========================================
   COUNT UP HOOK
======================================== */
const useCountUp = (end, duration = 1800) => {
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

/* ========================================
   DATA
======================================== */
const statsData = [
  {
    label: "Active Users",
    value: 1200,
    suffix: "+",
    icon: Users,
  },
  {
    label: "Transactions Processed",
    value: 85000,
    suffix: "+",
    icon: CreditCard,
  },
  {
    label: "Money Tracked",
    value: 25000000,
    prefix: "₦",
    icon: Wallet,
  },
  {
    label: "Savings Achieved",
    value: 18000000,
    prefix: "₦",
    icon: PiggyBank,
  },
];

/* ========================================
   CARD
======================================== */
const StatCard = ({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  index,
}) => {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -6,
        scale: 1.015,
      }}
      className="group relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-2xl transition-all"
    >
      {/* glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />

      {/* top row */}
      <div className="relative flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
          <Icon size={22} />
        </div>

        <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
          Live
        </span>
      </div>

      {/* value */}
      <div className="relative mt-7">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {prefix || ""}
          {count.toLocaleString()}
          {suffix || ""}
        </h3>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>

      {/* bottom line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{
          delay: 0.4 + index * 0.08,
          duration: 0.8,
        }}
        className="relative mt-6 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600"
      />
    </motion.div>
  );
};

/* ========================================
   MAIN SECTION
======================================== */
const Stats = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-flex px-4 py-2 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900">
            Performance Metrics
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Trusted by users building
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-transparent bg-clip-text">
              smarter financial habits
            </span>
          </h2>

          <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-400">
            Thousands rely on SmartBudget to track expenses,
            optimize spending, and accelerate savings growth.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              index={index}
              {...stat}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;