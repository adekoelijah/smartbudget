

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Wallet2,
  TrendingUp,
  Activity,
  Landmark,
  Sparkles,
  BarChart3,
  Globe,
  CheckCircle2,
} from "lucide-react";

/* =========================================
   ANIMATION
========================================= */
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  show: (delay = 0) => ({
    opacity: 1,
    y: 0,

    transition: {
      delay,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* =========================================
   COMPONENT
========================================= */
const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] pt-[150px] pb-28">

      {/* =====================================
          BACKGROUND
      ===================================== */}
      <div className="absolute inset-0 -z-10">

        {/* GRID */}
        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]
            bg-[size:80px_80px]
          "
        />

        {/* TOP LIGHT */}
        <div
          className="
            absolute
            top-[-250px]
            left-1/2
            -translate-x-1/2
            w-[900px]
            h-[900px]
            rounded-full
            bg-emerald-500/10
            blur-3xl
          "
        />

        {/* SIDE LIGHT */}
        <div
          className="
            absolute
            right-[-180px]
            top-[120px]
            w-[500px]
            h-[500px]
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        {/* BOTTOM */}
        <div
          className="
            absolute inset-x-0 bottom-0
            h-[300px]
            bg-gradient-to-t
            from-black
            to-transparent
          "
        />
      </div>

      {/* =====================================
          CONTAINER
      ===================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-20 items-center">

          {/* =====================================
              LEFT SIDE
          ===================================== */}
          <div>

            {/* BADGE */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="
                inline-flex items-center gap-3
                rounded-full
                border border-white/10
                bg-white/5
                backdrop-blur-xl
                px-5
                py-3
              "
            >
              <div
                className="
                  flex items-center justify-center
                  h-8 w-8
                  rounded-full
                  bg-emerald-500/15
                "
              >
                <ShieldCheck
                  size={16}
                  className="text-emerald-400"
                />
              </div>

              <span
                className="
                  text-sm
                  font-medium
                  tracking-wide
                  text-slate-200
                "
              >
                Secure financial infrastructure for modern banking
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.08}
              className="
                mt-10
                text-[50px]
                sm:text-[68px]
                lg:text-[82px]
                leading-[0.92]
                tracking-[-0.06em]
                font-semibold
                text-white
              "
            >
              Banking
              <span className="text-emerald-400">
                {" "}reimagined
              </span>

              <br />

              for intelligent
              <br />
              money control
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.16}
              className="
                mt-8
                max-w-2xl
                text-[18px]
                leading-8
                text-slate-400
              "
            >
              SmartBudget delivers enterprise-grade financial
              management, real-time analytics, intelligent
              budgeting, transaction monitoring, and secure
              banking infrastructure built for individuals,
              startups, and modern businesses.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.24}
              className="
                mt-10
                flex flex-col sm:flex-row
                items-start sm:items-center
                gap-4
              "
            >
              {/* PRIMARY */}
              <Link
                to="/signup"
                className="
                  group
                  relative
                  overflow-hidden
                  h-14
                  px-7
                  rounded-2xl
                  bg-emerald-500
                  text-black
                  font-semibold
                  text-sm
                  flex items-center gap-3
                  transition-all duration-300
                  hover:scale-[1.02]
                  shadow-[0_20px_60px_rgba(16,185,129,0.25)]
                "
              >
                <span className="relative z-10">
                  Open Secure Account
                </span>

                <ArrowRight
                  size={18}
                  className="
                    relative z-10
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />

                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-r
                    from-emerald-400
                    to-emerald-300
                  "
                />
              </Link>

              {/* SECONDARY */}
              <Link
                to="/login"
                className="
                  h-14
                  px-7
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  text-sm
                  font-semibold
                  text-white
                  flex items-center
                  hover:bg-white/10
                  transition-all duration-300
                "
              >
                Access Dashboard
              </Link>
            </motion.div>

            {/* TRUST ROW */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.32}
              className="
                mt-12
                flex flex-wrap
                items-center
                gap-6
              "
            >
              {[
                "256-bit Encryption",
                "Real-time Monitoring",
                "AI Budget Intelligence",
                "Enterprise Security",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />

                  <span
                    className="
                      text-sm
                      text-slate-300
                    "
                  >
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* STATS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
              className="
                mt-16
                grid grid-cols-2 md:grid-cols-4
                gap-5
              "
            >
              {[
                {
                  value: "99.99%",
                  label: "Platform uptime",
                },

                {
                  value: "24/7",
                  label: "Fraud monitoring",
                },

                {
                  value: "₦12B+",
                  label: "Transactions tracked",
                },

                {
                  value: "AI Powered",
                  label: "Financial insights",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-white/[0.04]
                    backdrop-blur-xl
                    p-5
                  "
                >
                  <h3
                    className="
                      text-2xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    {item.value}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* =====================================
              RIGHT SIDE
          ===================================== */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.18}
            className="relative"
          >

            {/* MAIN CARD */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border border-white/10
                bg-white/[0.05]
                backdrop-blur-2xl
                p-7
                shadow-[0_30px_120px_rgba(0,0,0,0.45)]
              "
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div>
                  <div
                    className="
                      inline-flex items-center gap-2
                      rounded-full
                      border border-emerald-500/20
                      bg-emerald-500/10
                      px-3 py-1
                    "
                  >
                    <Sparkles
                      size={13}
                      className="text-emerald-400"
                    />

                    <span
                      className="
                        text-[11px]
                        font-semibold
                        tracking-wide
                        text-emerald-300
                      "
                    >
                      SMART FINANCE AI
                    </span>
                  </div>

                  <p
                    className="
                      mt-5
                      text-sm
                      text-slate-400
                    "
                  >
                    Total Portfolio Balance
                  </p>

                  <h2
                    className="
                      mt-3
                      text-[52px]
                      leading-none
                      tracking-tight
                      font-semibold
                      text-white
                    "
                  >
                    ₦24.8M
                  </h2>

                  <div
                    className="
                      mt-5
                      inline-flex items-center gap-2
                      rounded-full
                      bg-emerald-500/10
                      px-3 py-2
                    "
                  >
                    <TrendingUp
                      size={14}
                      className="text-emerald-400"
                    />

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-emerald-300
                      "
                    >
                      +18.4% growth this month
                    </span>
                  </div>
                </div>

                <div
                  className="
                    flex items-center justify-center
                    h-16 w-16
                    rounded-2xl
                    bg-gradient-to-br
                    from-emerald-400
                    to-emerald-600
                    shadow-[0_20px_40px_rgba(16,185,129,0.35)]
                  "
                >
                  <Landmark
                    size={28}
                    className="text-black"
                  />
                </div>
              </div>

              {/* GRAPH */}
              <div className="mt-12">

                <div className="flex items-end gap-3 h-[240px]">
                  {[60, 95, 82, 140, 120, 190, 165].map(
                    (height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{
                          delay: index * 0.06,
                          duration: 0.7,
                        }}
                        className="
                          relative flex-1
                          rounded-t-[20px]
                          bg-gradient-to-b
                          from-emerald-400
                          via-emerald-500
                          to-emerald-700
                          shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                        "
                      >
                        <div
                          className="
                            absolute inset-x-0 top-0
                            h-[1px]
                            bg-white/40
                          "
                        />
                      </motion.div>
                    )
                  )}
                </div>

                {/* DAYS */}
                <div
                  className="
                    mt-5
                    flex justify-between
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* BOTTOM GRID */}
              <div className="mt-8 grid grid-cols-2 gap-4">

                {/* CARD */}
                <div
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-black/20
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">
                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Revenue Flow
                    </p>

                    <Activity
                      size={16}
                      className="text-emerald-400"
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      text-3xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    ₦8.4M
                  </h3>

                  <p
                    className="
                      mt-2
                      text-xs
                      font-medium
                      text-emerald-300
                    "
                  >
                    +12.8% growth
                  </p>
                </div>

                {/* CARD */}
                <div
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-black/20
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">
                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                      "
                    >
                      Global Access
                    </p>

                    <Globe
                      size={16}
                      className="text-cyan-400"
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      text-3xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    180+
                  </h3>

                  <p
                    className="
                      mt-2
                      text-xs
                      font-medium
                      text-slate-400
                    "
                  >
                    Countries supported
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING CARD */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.6,
              }}

              className="
                absolute
                -left-10
                bottom-10
                hidden xl:block
              "
            >
              <div
                className="
                  w-[260px]
                  rounded-3xl
                  border border-white/10
                  bg-white/[0.06]
                  backdrop-blur-2xl
                  p-6
                  shadow-[0_20px_60px_rgba(0,0,0,0.4)]
                "
              >
                <div className="flex items-start justify-between">

                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Smart Savings
                    </p>

                    <h4
                      className="
                        mt-3
                        text-[34px]
                        leading-none
                        font-semibold
                        tracking-tight
                        text-white
                      "
                    >
                      82%
                    </h4>
                  </div>

                  <div
                    className="
                      flex items-center justify-center
                      h-12 w-12
                      rounded-2xl
                      bg-emerald-500/15
                    "
                  >
                    <BarChart3
                      size={18}
                      className="text-emerald-400"
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    h-2.5
                    overflow-hidden
                    rounded-full
                    bg-white/10
                  "
                >
                  <div
                    className="
                      h-full
                      w-[82%]
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-400
                      to-emerald-600
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-xs
                    leading-6
                    text-slate-400
                  "
                >
                  AI-powered financial automation keeps your
                  monthly savings goals consistently on track.
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