
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";

// const CTA = () => {
//   return (
//     <section className="relative py-28 overflow-hidden text-white">

//       {/* 🌌 MIDNIGHT FINTECH BACKGROUND (NEW IDENTITY) */}
//       <div className="absolute inset-0 -z-10">

//         {/* Base gradient layer */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[#050816] via-[#070A1A] to-[#0B122A]" />

//         {/* Subtle radial spotlight */}
//         <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.18),transparent_60%)] blur-2xl" />

//         {/* Secondary deep glow */}
//         <div className="absolute bottom-[-250px] right-[-150px] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.12),transparent_65%)] blur-3xl" />

//         {/* Grid overlay (fintech dashboard feel) */}
//         <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:60px_60px]" />
//       </div>

//       <div className="max-w-4xl mx-auto px-4 text-center">

//         {/* Badge */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 backdrop-blur mb-6"
//         >
//           🚀 Intelligent financial infrastructure for modern users
//         </motion.div>

//         {/* Heading */}
//         <motion.h2
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="text-3xl md:text-5xl font-bold leading-tight"
//         >
//           Build wealth with{" "}
//           <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
//             clarity & automation
//           </span>
//         </motion.h2>

//         {/* Subtext (refined fintech tone) */}
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.1 }}
//           className="mt-5 text-gray-300 text-sm md:text-base max-w-2xl mx-auto"
//         >
//           Join a new generation of users building disciplined financial habits with
//           real-time intelligence, automated tracking, and AI-driven insights designed
//           to help you stay ahead financially.
//         </motion.p>

//         {/* CTA BUTTON */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.2 }}
//           className="mt-10 flex justify-center"
//         >
//           <Link
//             to="/signup"
//             className="relative group px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 shadow-[0_0_40px_rgba(99,102,241,0.25)] overflow-hidden"
//           >
//             {/* Shine */}
//             <span className="absolute inset-0 bg-white/10 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 skew-x-[-20deg]" />

//             <span className="relative z-10">Get Started Free</span>
//           </Link>
//         </motion.div>

//         {/* Trust strip */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.3 }}
//           className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-gray-400"
//         >
//           <span>🔒 Bank-grade security</span>
//           <span>⚡ Real-time intelligence</span>
//           <span>📊 Smart analytics</span>
//           <span>🤖 AI-powered insights</span>
//         </motion.div>

//       </div>
//     </section>
//   );
// };

// export default CTA;




import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="relative py-28 overflow-hidden bg-[#070A12] text-white">

      {/* =========================
         BACKGROUND SYSTEM LAYER
      ========================= */}
      <div className="absolute inset-0 -z-10">

        {/* Base depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070A12] via-[#050816] to-[#04060F]" />

        {/* Controlled financial glow (not decorative) */}
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-260px] right-[-180px] w-[800px] h-[800px] bg-cyan-500/10 blur-3xl rounded-full" />

        {/* Structural grid (dashboard identity) */}
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center">

        {/* =========================
           SYSTEM LABEL (NOT MARKETING)
        ========================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-gray-300"
        >
          SmartBudget Financial Control System
        </motion.div>

        {/* =========================
           CORE STATEMENT
        ========================= */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-7 text-3xl md:text-5xl font-semibold tracking-tight leading-tight"
        >
          Structured financial control for{" "}
          <span className="text-indigo-300">
            predictable money management
          </span>
        </motion.h2>

        {/* =========================
           CLARITY DESCRIPTION
        ========================= */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-7"
        >
          SmartBudget is a structured financial layer that helps users
          monitor cashflow, enforce spending discipline, and maintain
          visibility across all financial activity in real time.
        </motion.p>

        {/* =========================
           TRUST ARCHITECTURE (NOT EMOJIS)
        ========================= */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400"
        >
          <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
            Encrypted financial data layer
          </div>

          <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
            Real-time transaction processing
          </div>

          <div className="border border-white/10 bg-white/5 rounded-xl py-3 px-4">
            Automated budgeting system
          </div>
        </motion.div>

        {/* =========================
           ACTION GATE
        ========================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/signup"
            className="
              relative px-8 py-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400
              shadow-[0_0_30px_rgba(99,102,241,0.25)]
              overflow-hidden
            "
          >
            {/* controlled shine */}
            <span className="absolute inset-0 bg-white/10 translate-x-[-130%] group-hover:translate-x-[130%] transition-transform duration-700 skew-x-[-20deg]" />

            <span className="relative z-10">
              Initialize Financial Account
            </span>
          </Link>
        </motion.div>

        {/* =========================
           FINAL TRUST LINE
        ========================= */}
        <p className="mt-10 text-xs text-gray-500">
          No credit card required • Full access on signup • Cancel anytime
        </p>

      </div>
    </section>
  );
};

export default CTA;