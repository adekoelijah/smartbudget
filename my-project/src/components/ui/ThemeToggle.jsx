


// import { useRef, useState } from "react";
// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "../../hooks/useTheme";
// import { motion, AnimatePresence } from "framer-motion";

// const ThemeToggle = () => {
//   const { theme, setTheme } = useTheme();
//   const [ripple, setRipple] = useState(null);
//   const btnRef = useRef(null);

//   const isDark = theme === "dark";

//   const toggleTheme = () => {
//     if (!btnRef.current) return;

//     const rect = btnRef.current.getBoundingClientRect();

//     setRipple({
//       x: rect.left + rect.width / 2,
//       y: rect.top + rect.height / 2,
//     });

//     // theme switch
//     setTimeout(() => {
//       setTheme(isDark ? "light" : "dark");
//     }, 140);

//     setTimeout(() => setRipple(null), 600);
//   };

//   return (
//     <>
//       {/* 🌊 Ripple (soft fintech glow) */}
//       <AnimatePresence>
//         {ripple && (
//           <motion.div
//             initial={{
//               scale: 0,
//               opacity: 0.25,
//               x: ripple.x,
//               y: ripple.y,
//             }}
//             animate={{
//               scale: 25,
//               opacity: 0,
//             }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             className="fixed w-10 h-10 rounded-full bg-indigo-500/30 dark:bg-white/10 blur-2xl pointer-events-none z-[9999]"
//             style={{
//               translateX: "-50%",
//               translateY: "-50%",
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* 🔘 BUTTON (FINTECH STYLE UPGRADED) */}
//       <motion.button
//         ref={btnRef}
//         onClick={toggleTheme}
//         whileTap={{ scale: 0.92 }}
//         whileHover={{ scale: 1.05 }}
//         transition={{ type: "spring", stiffness: 400, damping: 25 }}
//         className="
//           relative
//           h-10 w-10
//           flex items-center justify-center
//           rounded-xl

//           bg-gradient-to-br
//           from-white/80
//           to-gray-100/60
//           dark:from-gray-900/80
//           dark:to-gray-800/60

//           border border-gray-200 dark:border-gray-800
//           shadow-sm hover:shadow-md

//           backdrop-blur-xl
//           transition-all duration-300
//         "
//         aria-label="Toggle theme"
//       >
//         {/* Icon swap animation */}
//         <AnimatePresence mode="wait">
//           {isDark ? (
//             <motion.div
//               key="sun"
//               initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
//               animate={{ rotate: 0, opacity: 1, scale: 1 }}
//               exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
//               transition={{ duration: 0.2 }}
//               className="text-yellow-400"
//             >
//               <Sun size={18} />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="moon"
//               initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
//               animate={{ rotate: 0, opacity: 1, scale: 1 }}
//               exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
//               transition={{ duration: 0.2 }}
//               className="text-indigo-600"
//             >
//               <Moon size={18} />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* subtle glow ring (fintech touch) */}
//         <span className="absolute inset-0 rounded-xl bg-indigo-500/0 hover:bg-indigo-500/5 transition" />
//       </motion.button>
//     </>
//   );
// };

// export default ThemeToggle;
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
    >
      {theme === "light" ? (
        <>
          <Moon size={16} /> Dark
        </>
      ) : (
        <>
          <Sun size={16} /> Light
        </>
      )}
    </button>
  );
};

export default ThemeToggle;