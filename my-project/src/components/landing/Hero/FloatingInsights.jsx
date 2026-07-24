import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  "Analyzing your spending habits...",
  "Food expenses increased by 14% this month.",
  "Great job! Your savings improved by 24%.",
  "You're projected to reach your emergency fund 14 days early.",
  "Reducing entertainment spending could save ₦20,000 monthly.",
  "No suspicious transactions detected.",
  "SmartBudget AI has finished your financial analysis.",
];

const TYPING_SPEED = 35;
const PAUSE = 2000;

const FloatingInsights = () => {
  const [text, setText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = messages[messageIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), PAUSE);
        }
      } else {
        if (text.length > 0) {
          setText(current.slice(0, text.length - 1));
        } else {
          setIsDeleting(false);
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }
      }
    }, isDeleting ? 15 : TYPING_SPEED);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, messageIndex]);

  return (
   <motion
     .div
  initial={{ opacity: 0, x: 20, y: 20 }}
  animate={{
    opacity: 1,
    x: 0,
    y: [0, -8, 0],
  }}
  transition={{
    opacity: { duration: 0.6 },
    x: { duration: 0.6 },
    y: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
     className="
       absolute z-30 top-6 sm:top-10 lg:top-24 left-1/2 sm:left-auto sm:right-4
       w-[92vw] sm:w-[320px] lg:w-[300px] max-w-[320px]
       p-4 sm:p-5
       bg-white/[0.08]
       rounded-[24px] border border-white/10
       backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,.45)]
       sm:translate-x-0
       -translate-x-1/2 lg:-right-10
     "
   >
      {/* Header */}
      <div
        className="
          flex items-center
          gap-3
        "
      >
  <div
    className="
      flex items-center justify-center
      h-10 sm:h-11 w-10 sm:w-11
      bg-gradient-to-br from-emerald-400 to-cyan-400
      rounded-xl
      shadow-lg shadow-emerald-500/20
    "
  >
    <BrainCircuit
      size={20}
      className="
        sm:h-[22px] sm:w-[22px]
        text-black
      "
      /
    >
  </div>

  <div
    className="
      min-w-0
    "
  >
    <p
      className="
        text-[9px] text-emerald-300 sm:text-[10px] font-semibold uppercase
        tracking-[0.24em] sm:tracking-[0.28em]
      "
    >
      SmartBudget AI
    </p>

    <h3
      className="
        mt-1
        text-sm text-white sm:text-base font-semibold
      "
    >
      Financial Assistant
    </h3>
  </div>
</div>

      {/* Typing Area */}
      <div
        className="
          min-h-[120px] sm:min-h-[100px] lg:min-h-[95px]
          mt-5 p-4
          bg-black/30
          rounded-2xl border border-white/10
        "
      >
  <p
    className="
      break-words text-xs text-slate-300 sm:text-[13px] leading-6
    "
  >
    {text}

    <motion
      .span
      animate={{
        opacity: [1, 0, 1],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
      }}
      className="
        text-emerald-400
      "
    >
      |
    </motion.span>
  </p>
</div>

      {/* Status */}
      <div
        className="
          flex items-center
          mt-4
          gap-2
        "
      >
  <motion
    .div
    animate={{
      scale: [1, 1.5, 1],
    }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
    }}
    className="
      h-2 w-2
      bg-emerald-400
      rounded-full
    "
    /
  >

  <span
    className="
      text-[11px] text-slate-400 sm:text-xs
    "
  >
    AI analyzing...
  </span>
</div>
    </motion.div>
  );
};

export default FloatingInsights;