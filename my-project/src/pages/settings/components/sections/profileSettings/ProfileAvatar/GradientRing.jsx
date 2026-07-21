import { motion } from "framer-motion";

const GradientRing = ({
  children,
  size = 160,
  thickness = 4,
  glow = true,
  animate = true,
  className = "",
}) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Outer Glow */}
      {glow && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,.45) 0%, rgba(59,130,246,.28) 45%, transparent 75%)",
            }}
          />

          <div
            className="absolute inset-4 rounded-full blur-xl opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,.35) 0%, transparent 75%)",
            }}
          />
        </>
      )}

      {/* Animated Gradient Ring */}
      <motion.div
        animate={
          animate
            ? {
                rotate: 360,
              }
            : {}
        }
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
        }}
        className="absolute rounded-full"
        style={{
          inset: 0,
          padding: thickness,
          background: `
            conic-gradient(
              from 0deg,
              #06b6d4,
              #3b82f6,
              #6366f1,
              #0ea5e9,
              #22d3ee,
              #06b6d4
            )
          `,
        }}
      >
        {/* Glass Inner Surface */}
        <div
          className="
            h-full
            w-full
            rounded-full
            border
            border-white/10
            bg-slate-950/95
            backdrop-blur-3xl
            shadow-[inset_0_1px_1px_rgba(255,255,255,.12)]
          "
        />
      </motion.div>

      {/* Reflection */}
      <div
        className="
          pointer-events-none
          absolute
          inset-2
          rounded-full
          bg-gradient-to-br
          from-white/20
          via-transparent
          to-transparent
          opacity-70
        "
      />

      {/* Avatar */}
      <div
        className="relative z-10 overflow-hidden rounded-full"
        style={{
          width: size - thickness * 2,
          height: size - thickness * 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientRing;