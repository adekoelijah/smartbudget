

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet2,
  Activity,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* =========================
   COUNT UP HOOK (UNCHANGED CORE)
========================= */
const useCountUp = (end, duration = 1400) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          let start = 0;
          const step = end / (duration / 16);

          const animate = () => {
            start += step;

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
   DATA (FINANCIAL METRICS)
========================= */
const statsData = [
  {
    title: "Total Assets Under Management",
    value: 285000000,
    prefix: "₦",
    subtitle: "Aggregated across verified accounts",
    icon: Wallet2,
    trend: "+18.2%",
  },
  {
    title: "Monthly Transaction Volume",
    value: 920000,
    suffix: "+",
    subtitle: "Processed through secured rails",
    icon: Activity,
    trend: "+11.6%",
  },
  {
    title: "System Integrity Score",
    value: 99.98,
    suffix: "%",
    subtitle: "Uptime + encryption reliability index",
    icon: ShieldCheck,
    trend: "Stable",
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="
        relative
        rounded-2xl
        border border-slate-200
        bg-white
        p-7
        transition
        hover:border-slate-300
      "
    >
      {/* top structural line */}
      <div className="absolute inset-x-0 top-0 h-px bg-slate-100" />

      {/* HEADER */}
      <div className="flex items-start justify-between">

        {/* ICON BLOCK (controlled, not flashy) */}
        <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center">
          <data.icon size={18} className="text-white" />
        </div>

        {/* TREND */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <TrendingUp size={12} className="text-slate-400" />
          {data.trend}
        </div>
      </div>

      {/* VALUE */}
      <div className="mt-8">
        <h3 className="text-[34px] font-semibold tracking-[-0.04em] text-slate-950">
          {data.prefix || ""}
          {typeof data.value === "number"
            ? data.value % 1 !== 0
              ? count.toFixed(2)
              : count.toLocaleString()
            : count}
          {data.suffix || ""}
        </h3>

        <p className="mt-3 text-[14px] font-semibold text-slate-900">
          {data.title}
        </p>

        <p className="mt-2 text-[13px] leading-6 text-slate-500">
          {data.subtitle}
        </p>
      </div>

      {/* SYSTEM FOOTER (BANK SIGNATURE ELEMENT) */}
      <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-slate-500">
            Live financial metric
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          real-time sync
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
    <section className="relative bg-white py-28 overflow-hidden">

      {/* CONTROLLED BACKGROUND (NO DISTRACTION) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a03_1px,transparent_1px),linear-gradient(to_bottom,#0f172a03_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* soft vertical fade only (institutional depth) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
            <div className="h-2 w-2 rounded-full bg-slate-900" />
            <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">
              Financial Systems Overview
            </span>
          </div>

          <h2 className="mt-8 text-[46px] md:text-[58px] leading-[1.02] tracking-[-0.05em] font-semibold text-slate-950">
            Financial infrastructure
            <br />
            built for measurable trust
          </h2>

          <p className="mt-7 text-[16px] leading-7 text-slate-600 max-w-2xl">
            A structured financial intelligence layer designed to deliver
            transparency, system stability, and consistent financial accuracy
            across all user operations.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((item, index) => (
            <StatCard key={index} data={item} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Stats;