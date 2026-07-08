


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