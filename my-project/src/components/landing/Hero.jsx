


// import { motion, useScroll, useTransform } from "framer-motion";
// import { Link } from "react-router-dom";

// /**
//  * 🎬 Motion Variants
//  */
// const fadeUp = {
//   hidden: { opacity: 0, y: 35 },
//   show: (delay = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       delay,
//       duration: 0.7,
//       ease: [0.22, 1, 0.36, 1],
//     },
//   }),
// };

// const floatCard = {
//   animate: {
//     y: [0, -12, 0],
//     transition: {
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut",
//     },
//   },
// };

// const Hero = () => {
//   const { scrollY } = useScroll();

//   const yText = useTransform(scrollY, [0, 500], [0, -20]);
//   const yImage = useTransform(scrollY, [0, 500], [0, -35]);

//   return (
//     <section className="relative overflow-hidden pt-28 pb-24 bg-white dark:bg-[#050816]">
//       {/* BACKGROUND */}
//       <div className="absolute inset-0 -z-10">
//         {/* grid */}
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

//         {/* top glow */}
//         <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[820px] h-[820px] rounded-full bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-cyan-400/20 blur-3xl" />

//         {/* bottom glow */}
//         <div className="absolute bottom-[-260px] right-[-120px] w-[520px] h-[520px] rounded-full bg-purple-500/10 blur-3xl" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-14 items-center">
//         {/* LEFT SIDE */}
//         <motion.div style={{ y: yText }}>
//           {/* badge */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.05}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-sm"
//           >
//             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wide">
//               Trusted Financial Intelligence
//             </span>
//           </motion.div>

//           {/* heading */}
//           <motion.h1
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.15}
//             className="mt-6 text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-gray-900 dark:text-white"
//           >
//             Smarter money
//             <br />
//             management for
//             <br />
//             <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
//               modern living
//             </span>
//           </motion.h1>

//           {/* description */}
//           <motion.p
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.25}
//             className="mt-6 max-w-xl text-[15px] md:text-lg leading-8 text-gray-600 dark:text-gray-400"
//           >
//             Monitor spending, automate budgets, and gain real-time financial
//             insights through a premium dashboard built for growth.
//           </motion.p>

//           {/* stats */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.35}
//             className="mt-8 grid grid-cols-3 gap-4 max-w-xl"
//           >
//             {[
//               ["₦250k+", "Saved"],
//               ["18%", "Growth"],
//               ["24/7", "Tracking"],
//             ].map(([value, label], i) => (
//               <div
//                 key={i}
//                 className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl px-4 py-4 shadow-sm"
//               >
//                 <p className="text-xl font-semibold text-gray-900 dark:text-white">
//                   {value}
//                 </p>
//                 <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
//                   {label}
//                 </p>
//               </div>
//             ))}
//           </motion.div>

//           {/* buttons */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.45}
//             className="mt-8 flex flex-wrap gap-4"
//           >
//             <Link
//               to="/signup"
//               className="px-7 py-3 rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-black font-medium shadow-xl shadow-black/10 hover:-translate-y-0.5 transition"
//             >
//               Start Free
//             </Link>

//             <Link
//               to="/login"
//               className="px-7 py-3 rounded-2xl border border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl text-gray-800 dark:text-white hover:bg-white hover:text-black transition"
//             >
//               Login
//             </Link>
//           </motion.div>
//         </motion.div>

//         {/* RIGHT SIDE */}
//         <motion.div style={{ y: yImage }} className="relative">
//           {/* glass card */}
//           <motion.div
//             initial={{ opacity: 0, y: 50, scale: 0.96 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{ duration: 0.8 }}
//             className="relative rounded-[28px] border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-2xl shadow-2xl p-5"
//           >
//             {/* top bar */}
//             <div className="flex items-center justify-between mb-5">
//               <div>
//                 <p className="text-xs text-gray-500">Available Balance</p>
//                 <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
//                   ₦245,000
//                 </h3>
//               </div>

//               <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
//                 +12.4%
//               </div>
//             </div>

//             {/* chart area */}
//             <div className="h-44 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-cyan-500/10 border border-white/40 dark:border-white/5 flex items-end gap-2 px-4 pb-4">
//               {[45, 70, 55, 95, 75, 110, 88].map((h, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ height: 0 }}
//                   animate={{ height: h }}
//                   transition={{ delay: i * 0.08, duration: 0.6 }}
//                   className="flex-1 rounded-xl bg-gradient-to-t from-indigo-600 to-cyan-400"
//                 />
//               ))}
//             </div>

//             {/* lower cards */}
//             <div className="grid grid-cols-2 gap-4 mt-4">
//               <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
//                 <p className="text-xs text-gray-500">Income</p>
//                 <p className="mt-1 font-semibold text-gray-900 dark:text-white">
//                   ₦120,000
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
//                 <p className="text-xs text-gray-500">Expenses</p>
//                 <p className="mt-1 font-semibold text-gray-900 dark:text-white">
//                   ₦65,000
//                 </p>
//               </div>
//             </div>
//           </motion.div>

//           {/* floating card 1 */}
//           <motion.div
//             variants={floatCard}
//             animate="animate"
//             whileHover={{ scale: 1.05 }}
//             className="absolute -left-8 top-10 hidden md:block"
//           >
//             <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-xl px-4 py-3 backdrop-blur-xl">
//               <p className="text-xs text-gray-500">Savings Goal</p>
//               <p className="font-semibold text-gray-900 dark:text-white">
//                 72% Completed
//               </p>
//             </div>
//           </motion.div>

//           {/* floating card 2 */}
//           <motion.div
//             variants={floatCard}
//             animate="animate"
//             whileHover={{ scale: 1.05 }}
//             transition={{ delay: 1 }}
//             className="absolute -right-6 bottom-8 hidden md:block"
//           >
//             <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-xl px-4 py-3 backdrop-blur-xl">
//               <p className="text-xs text-gray-500">AI Insight</p>
//               <p className="font-semibold text-gray-900 dark:text-white">
//                 Spending reduced 18%
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Hero;




import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.6, ease: "easeOut" },
  }),
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -20]);

  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-[#0B1220] pt-28 pb-24">

      {/* BACKGROUND GRID (SUBTLE FINTECH STYLE) */}
      <div className="absolute inset-0 -z-10">
        <div className="
          absolute inset-0
          bg-[linear-gradient(to_right,#0f172a10_1px,transparent_1px),linear-gradient(to_bottom,#0f172a10_1px,transparent_1px)]
          dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]
          bg-[size:40px_40px]
        " />

        {/* SOFT PRIMARY GLOW */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT */}
        <motion.div style={{ y }}>

          {/* BADGE */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              border border-slate-200 dark:border-slate-800
              bg-white dark:bg-[#0F172A]
            "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              SmartBudget Finance OS
            </span>
          </motion.div>

          {/* TITLE */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="mt-6 text-4xl md:text-6xl font-semibold text-slate-900 dark:text-white leading-tight"
          >
            Smarter money
            <br />
            decisions for your
            <br />
            <span className="text-indigo-500">
              financial future
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="mt-5 max-w-xl text-slate-600 dark:text-slate-400"
          >
            Track spending, automate budgeting, and gain real-time insights
            into your financial life with a modern fintech dashboard.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="mt-8 flex gap-4"
          >
            <Link
              to="/signup"
              className="
                px-6 py-3 rounded-xl
                bg-indigo-600 text-white
                hover:bg-indigo-700 transition
              "
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="
                px-6 py-3 rounded-xl
                border border-slate-300 dark:border-slate-700
                text-slate-800 dark:text-white
                hover:bg-slate-100 dark:hover:bg-slate-800
              "
            >
              Login
            </Link>
          </motion.div>

        </motion.div>

        {/* RIGHT - FINTECH DASHBOARD MOCK */}
        <motion.div className="relative">

          <div className="
            rounded-2xl border border-slate-200 dark:border-slate-800
            bg-white dark:bg-[#0F172A]
            shadow-xl p-6
          ">

            {/* BALANCE */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">Balance</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  ₦245,000
                </h2>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                +12.4%
              </span>
            </div>

            {/* SIMPLE CHART */}
            <div className="mt-6 h-40 flex items-end gap-2">
              {[40, 60, 50, 80, 70, 90, 65].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 bg-indigo-500/70 rounded-md"
                />
              ))}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500">Income</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  ₦120,000
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500">Expenses</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  ₦65,000
                </p>
              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Hero;