




// import { motion, useScroll, useTransform } from "framer-motion";
// import { Link } from "react-router-dom";

// const fadeUp = {
//   hidden: { opacity: 0, y: 24 },
//   show: (d = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: d, duration: 0.6, ease: "easeOut" },
//   }),
// };

// const Hero = () => {
//   const { scrollY } = useScroll();
//   const y = useTransform(scrollY, [0, 400], [0, -20]);

//   return (
//     <section className="relative overflow-hidden bg-slate-50 dark:bg-[#0B1220] pt-28 pb-24">

//       {/* BACKGROUND GRID (SUBTLE FINTECH STYLE) */}
//       <div className="absolute inset-0 -z-10">
//         <div className="
//           absolute inset-0
//           bg-[linear-gradient(to_right,#0f172a10_1px,transparent_1px),linear-gradient(to_bottom,#0f172a10_1px,transparent_1px)]
//           dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]
//           bg-[size:40px_40px]
//         " />

//         {/* SOFT PRIMARY GLOW */}
//         <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/10 blur-3xl rounded-full" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-14 items-center">

//         {/* LEFT */}
//         <motion.div style={{ y }}>

//           {/* BADGE */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             className="
//               inline-flex items-center gap-2 px-4 py-2 rounded-full
//               border border-slate-200 dark:border-slate-800
//               bg-white dark:bg-[#0F172A]
//             "
//           >
//             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-xs text-slate-600 dark:text-slate-300">
//               SmartBudget Finance OS
//             </span>
//           </motion.div>

//           {/* TITLE */}
//           <motion.h1
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.1}
//             className="mt-6 text-4xl md:text-6xl font-semibold text-slate-900 dark:text-white leading-tight"
//           >
//             Smarter money
//             <br />
//             decisions for your
//             <br />
//             <span className="text-indigo-500">
//               financial future
//             </span>
//           </motion.h1>

//           {/* DESCRIPTION */}
//           <motion.p
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.2}
//             className="mt-5 max-w-xl text-slate-600 dark:text-slate-400"
//           >
//             Track spending, automate budgeting, and gain real-time insights
//             into your financial life with a modern fintech dashboard.
//           </motion.p>

//           {/* CTA */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             custom={0.3}
//             className="mt-8 flex gap-4"
//           >
//             <Link
//               to="/signup"
//               className="
//                 px-6 py-3 rounded-xl
//                 bg-indigo-600 text-white
//                 hover:bg-indigo-700 transition
//               "
//             >
//               Get Started
//             </Link>

//             <Link
//               to="/login"
//               className="
//                 px-6 py-3 rounded-xl
//                 border border-slate-300 dark:border-slate-700
//                 text-slate-800 dark:text-white
//                 hover:bg-slate-100 dark:hover:bg-slate-800
//               "
//             >
//               Login
//             </Link>
//           </motion.div>

//         </motion.div>

//         {/* RIGHT - FINTECH DASHBOARD MOCK */}
//         <motion.div className="relative">

//           <div className="
//             rounded-2xl border border-slate-200 dark:border-slate-800
//             bg-white dark:bg-[#0F172A]
//             shadow-xl p-6
//           ">

//             {/* BALANCE */}
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-xs text-slate-500">Balance</p>
//                 <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
//                   ₦245,000
//                 </h2>
//               </div>

//               <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
//                 +12.4%
//               </span>
//             </div>

//             {/* SIMPLE CHART */}
//             <div className="mt-6 h-40 flex items-end gap-2">
//               {[40, 60, 50, 80, 70, 90, 65].map((h, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ height: 0 }}
//                   animate={{ height: h }}
//                   transition={{ delay: i * 0.05 }}
//                   className="flex-1 bg-indigo-500/70 rounded-md"
//                 />
//               ))}
//             </div>

//             {/* STATS */}
//             <div className="grid grid-cols-2 gap-4 mt-6">
//               <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
//                 <p className="text-xs text-slate-500">Income</p>
//                 <p className="text-slate-900 dark:text-white font-semibold">
//                   ₦120,000
//                 </p>
//               </div>

//               <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
//                 <p className="text-xs text-slate-500">Expenses</p>
//                 <p className="text-slate-900 dark:text-white font-semibold">
//                   ₦65,000
//                 </p>
//               </div>
//             </div>

//           </div>

//         </motion.div>

//       </div>
//     </section>
//   );
// };

// export default Hero;





import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Wallet2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-[140px] pb-24">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        {/* GRID */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)]
            bg-[size:64px_64px]
          "
        />

        {/* TOP GRADIENT */}
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-slate-50 to-transparent" />

        {/* SOFT RADIAL */}
        <div className="absolute top-[-200px] right-[-120px] w-[500px] h-[500px] bg-slate-200/40 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            {/* TRUST BADGE */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="
                inline-flex items-center gap-2
                h-11 px-4
                rounded-full
                border border-slate-200
                bg-white
                shadow-[0_1px_2px_rgba(15,23,42,0.04)]
              "
            >
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50">
                <ShieldCheck
                  size={14}
                  className="text-emerald-600"
                />
              </div>

              <span className="text-[13px] font-medium text-slate-700">
                Enterprise-grade financial infrastructure
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.08}
              className="
                mt-8
                max-w-3xl
                text-[44px]
                sm:text-[56px]
                lg:text-[68px]
                leading-[1]
                tracking-[-0.04em]
                font-semibold
                text-slate-950
              "
            >
              Financial clarity
              <br />
              built for modern
              <br />
              money management
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.16}
              className="
                mt-7
                max-w-2xl
                text-[17px]
                leading-8
                text-slate-600
              "
            >
              SmartBudget helps individuals and businesses
              manage cash flow, monitor spending behavior,
              automate budgeting, and make confident
              financial decisions through a secure and
              intelligent finance platform.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.24}
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                to="/signup"
                className="
                  h-12 px-6
                  rounded-xl
                  bg-[#0F172A]
                  text-white
                  text-[14px]
                  font-semibold
                  flex items-center gap-2
                  hover:bg-slate-800
                  transition-all duration-200
                  shadow-sm
                "
              >
                Open Account
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="
                  h-12 px-6
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-700
                  text-[14px]
                  font-semibold
                  flex items-center
                  hover:bg-slate-50
                  transition-all duration-200
                "
              >
                Sign In
              </Link>
            </motion.div>

            {/* METRICS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.32}
              className="
                mt-14
                grid grid-cols-2 sm:grid-cols-4
                gap-8
              "
            >
              {[
                {
                  value: "99.9%",
                  label: "Platform uptime",
                },
                {
                  value: "256-bit",
                  label: "Encrypted security",
                },
                {
                  value: "24/7",
                  label: "Transaction monitoring",
                },
                {
                  value: "Real-time",
                  label: "Financial insights",
                },
              ].map((item, index) => (
                <div key={index}>
                  <h3 className="text-[22px] font-semibold text-slate-950">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-[13px] text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.18}
            className="relative"
          >
            {/* MAIN DASHBOARD */}
            <div
              className="
                relative
                rounded-[28px]
                border border-slate-200
                bg-white
                p-6
                shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              "
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-500">
                    Total Balance
                  </p>

                  <h2 className="mt-3 text-[40px] leading-none font-semibold tracking-tight text-slate-950">
                    ₦2,450,000
                  </h2>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                    <TrendingUp
                      size={14}
                      className="text-emerald-600"
                    />

                    <span className="text-[12px] font-semibold text-emerald-700">
                      +18.2% this month
                    </span>
                  </div>
                </div>

                <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center">
                  <Wallet2
                    size={24}
                    className="text-white"
                  />
                </div>
              </div>

              {/* CHART */}
              <div className="mt-10">
                <div className="flex items-end gap-3 h-[220px]">
                  {[48, 80, 65, 110, 90, 150, 130].map(
                    (height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{
                          delay: index * 0.06,
                          duration: 0.5,
                        }}
                        className="
                          relative flex-1 rounded-t-2xl
                          bg-gradient-to-b
                          from-slate-700
                          to-slate-900
                        "
                      >
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20" />
                      </motion.div>
                    )
                  )}
                </div>

                {/* LABELS */}
                <div className="mt-4 flex justify-between text-[12px] font-medium text-slate-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* BOTTOM STATS */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-slate-500">
                      Income
                    </p>

                    <BarChart3
                      size={16}
                      className="text-slate-400"
                    />
                  </div>

                  <h3 className="mt-3 text-[24px] font-semibold tracking-tight text-slate-950">
                    ₦840K
                  </h3>

                  <p className="mt-1 text-[12px] text-emerald-600 font-medium">
                    +12.4% increase
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-slate-500">
                      Expenses
                    </p>

                    <BarChart3
                      size={16}
                      className="text-slate-400"
                    />
                  </div>

                  <h3 className="mt-3 text-[24px] font-semibold tracking-tight text-slate-950">
                    ₦312K
                  </h3>

                  <p className="mt-1 text-[12px] text-slate-500 font-medium">
                    Controlled spending
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="
                absolute
                -left-10
                bottom-10
                hidden lg:block
              "
            >
              <div
                className="
                  w-[240px]
                  rounded-2xl
                  border border-slate-200
                  bg-white/95
                  backdrop-blur-xl
                  p-5
                  shadow-[0_10px_40px_rgba(15,23,42,0.08)]
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-slate-500">
                      Savings Goal
                    </p>

                    <h4 className="mt-2 text-[26px] font-semibold tracking-tight text-slate-950">
                      78%
                    </h4>
                  </div>

                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <TrendingUp
                      size={18}
                      className="text-slate-700"
                    />
                  </div>
                </div>

                <div className="mt-5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[78%] rounded-full bg-slate-900" />
                </div>

                <p className="mt-3 text-[12px] leading-5 text-slate-500">
                  You are on track to achieve your monthly
                  savings target.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;