import { motion } from "framer-motion";
import { ShieldCheck, LockKeyhole } from "lucide-react";

const TrustScore = ({
  score = 99,
  maxScore = 100,
  size = 180,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(score, maxScore);
  const offset =
    circumference - (progress / maxScore) * circumference;

  const getStatus = () => {
    if (score >= 95)
      return {
        label: "Excellent",
        color: "text-emerald-400",
      };

    if (score >= 85)
      return {
        label: "Very Good",
        color: "text-cyan-400",
      };

    if (score >= 70)
      return {
        label: "Good",
        color: "text-amber-400",
      };

    return {
      label: "Needs Attention",
      color: "text-red-400",
    };
  };

  const status = getStatus();

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-white/[0.05]
        backdrop-blur-3xl
        p-8
        shadow-[0_20px_60px_rgba(0,0,0,.35)]
      "
    >
      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="
          absolute
          -top-20
          right-0
          h-52
          w-52
          rounded-full
          bg-cyan-500/15
          blur-[90px]
        " />

        <div className="
          absolute
          bottom-0
          left-0
          h-40
          w-40
          rounded-full
          bg-blue-600/15
          blur-[90px]
        " />

      </div>

      <div className="relative z-10 flex flex-col items-center">

        <div className="flex items-center gap-2">

          <ShieldCheck
            size={18}
            className="text-cyan-400"
          />

          <span className="text-sm font-semibold tracking-wide text-slate-300">
            Account Trust
          </span>

        </div>

        <div className="relative mt-8">

          <svg
            width={size}
            height={size}
            className="-rotate-90"
          >
            {/* Track */}

            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,.08)"
              strokeWidth={strokeWidth}
            />

            {/* Progress */}

            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="url(#trustGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{
                strokeDashoffset: circumference,
              }}
              animate={{
                strokeDashoffset: offset,
              }}
              transition={{
                duration: 1.8,
                ease: "easeOut",
              }}
            />

            <defs>

              <linearGradient
                id="trustGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                />

                <stop
                  offset="50%"
                  stopColor="#3b82f6"
                />

                <stop
                  offset="100%"
                  stopColor="#6366f1"
                />

              </linearGradient>

            </defs>

          </svg>

          {/* Center */}

          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
            "
          >
            <span className="text-5xl font-bold text-white">
              {score}
            </span>

            <span className="text-sm text-cyan-400">
              /100
            </span>
          </div>

        </div>

        <div className="mt-8 text-center">

          <h3 className="text-lg font-semibold text-white">
            Trust Score
          </h3>

          <p className={`mt-2 font-medium ${status.color}`}>
            {status.label}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Your SmartBudget identity is protected by
            enterprise-grade encryption, trusted devices,
            and continuous cloud synchronization.
          </p>

        </div>

        {/* Footer */}

        <div
          className="
            mt-8
            flex
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-5
            py-4
          "
        >
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-500/10
                text-cyan-400
              "
            >
              <LockKeyhole size={18} />
            </div>

            <div>

              <p className="text-sm font-medium text-white">
                Security Status
              </p>

              <p className="text-xs text-slate-400">
                Bank-grade Protection
              </p>

            </div>

          </div>

          <span className="flex items-center gap-2 text-emerald-400">

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />

            Active

          </span>

        </div>

      </div>

    </motion.div>
  );
};

export default TrustScore;