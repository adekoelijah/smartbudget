


// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";

// const CTA = () => {
//   return (
//     <section className="relative py-28 overflow-hidden bg-[#070A12] text-white">

//       {/* =========================
//          BACKGROUND SYSTEM LAYER
//       ========================= */}
//       <div className="absolute inset-0 -z-10">

//         {/* Base depth gradient */}
//         <div className="absolute inset-0 bg-gradient-to-b from-[#070A12] via-[#050816] to-[#04060F]" />

//         {/* Controlled financial glow (not decorative) */}
//         <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-3xl rounded-full" />
//         <div className="absolute bottom-[-260px] right-[-180px] w-[800px] h-[800px] bg-cyan-500/10 blur-3xl rounded-full" />

//         {/* Structural grid (dashboard identity) */}
//         <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:70px_70px]" />
//       </div>

//       <div className="max-w-5xl mx-auto px-4 text-center">

//         {/* =========================
//            SYSTEM LABEL (NOT MARKETING)
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-gray-300"
//         >
//           SmartBudget Financial Control System
//         </motion.div>

//         {/* =========================
//            CORE STATEMENT
//         ========================= */}
//         <motion.h2
//           initial={{ opacity: 0, y: 25 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="mt-7 text-3xl md:text-5xl font-semibold tracking-tight leading-tight"
//         >
//           Structured financial control for{" "}
//           <span className="text-indigo-300">
//             predictable money management
//           </span>
//         </motion.h2>

//         {/* =========================
//            CLARITY DESCRIPTION
//         ========================= */}
//         <motion.p
//           initial={{ opacity: 0, y: 18 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.1 }}
//           className="mt-6 text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-7"
//         >
//           SmartBudget is a structured financial layer that helps users
//           monitor cashflow, enforce spending discipline, and maintain
//           visibility across all financial activity in real time.
//         </motion.p>

//         {/* =========================
//            TRUST ARCHITECTURE (NOT EMOJIS)
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.2 }}
//           className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400"
//         >
//           <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
//             Encrypted financial data layer
//           </div>

//           <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
//             Real-time transaction processing
//           </div>

//           <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
//             Automated budgeting system
//           </div>
//         </motion.div>

//         {/* =========================
//            ACTION GATE
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.25 }}
//           className="mt-12 flex justify-center"
//         >
//           <Link
//             to="/signup"
//             className="
//               relative px-8 py-4 rounded-xl font-semibold text-white
//               bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400
//               shadow-[0_0_30px_rgba(99,102,241,0.25)]
//               overflow-hidden
//             "
//           >
//             {/* controlled shine */}
//             <span className="absolute inset-0 bg-white/10 translate-x-[-130%] group-hover:translate-x-[130%] transition-transform duration-700 skew-x-[-20deg]" />

//             <span className="relative z-10">
//               Initialize Financial Account
//             </span>
//           </Link>
//         </motion.div>

//         {/* =========================
//            FINAL TRUST LINE
//         ========================= */}
//         <p className="mt-10 text-xs text-gray-500">
//           No credit card required • Full access on signup • Cancel anytime
//         </p>

//       </div>
//     </section>
//   );
// };

// export default CTA;


import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Activity, Database } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-32 bg-[#05070D] text-white overflow-hidden">

      {/* =========================
         BACKGROUND SYSTEM (CONTROLLED DEPTH)
      ========================= */}
      <div className="absolute inset-0 -z-10">

        {/* Base layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070D] via-[#040611] to-black" />

        {/* Structural grid (financial system feel) */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* Controlled institutional glow */}
        <div className="absolute top-[-240px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">

        {/* =========================
           SYSTEM LABEL (NOT MARKETING)
        ========================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-full
            border border-white/10
            bg-white/[0.03]
            text-[11px]
            tracking-[0.2em]
            uppercase
            text-slate-300
          "
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          Financial Control System Active
        </motion.div>

        {/* =========================
           CORE STATEMENT (AUTHORITY-FIRST)
        ========================= */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            mt-8
            text-[38px]
            md:text-[54px]
            font-semibold
            tracking-tight
            leading-[1.1]
            text-white
          "
        >
          Activate structured financial
          <br />
          control infrastructure
        </motion.h2>

        {/* =========================
           SYSTEM DESCRIPTION
        ========================= */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="
            mt-6
            max-w-2xl
            mx-auto
            text-slate-400
            text-[15px]
            leading-7
          "
        >
          SmartBudget operates as a financial governance layer that enforces
          discipline, provides real-time cashflow visibility, and structures
          user financial activity into measurable systems.
        </motion.p>

        {/* =========================
           TRUST INFRASTRUCTURE BLOCKS
        ========================= */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="
            mt-10
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            text-left
          "
        >
          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Lock size={14} className="text-emerald-400" />
              Encrypted financial layer
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Activity size={14} className="text-cyan-400" />
              Real-time transaction engine
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Database size={14} className="text-indigo-400" />
              Structured budget governance
            </div>
          </div>
        </motion.div>

        {/* =========================
           PRIMARY ACTION (SINGLE GATE)
        ========================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/signup"
            className="
              group
              relative
              inline-flex
              items-center
              justify-center
              px-8 py-4
              rounded-xl
              bg-white
              text-black
              font-semibold
              text-sm
              transition
              hover:bg-slate-200
            "
          >
            Initialize Financial Account

            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        {/* =========================
           COMPLIANCE FOOTNOTE
        ========================= */}
        <p className="mt-10 text-[11px] text-slate-500">
          System access governed by standard financial security protocols.
          No banking license required.
        </p>
      </div>
    </section>
  );
};

export default CTA;