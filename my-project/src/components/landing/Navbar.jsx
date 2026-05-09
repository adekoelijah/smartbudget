


// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Menu, X, LogOut, Command } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// import ThemeToggle from "../ui/ThemeToggle";
// import CommandPalette from "../ui/CommandPalette";
// import { useAuth } from "../../hooks/useAuth";

// const NAV_ITEMS = [
//   { id: "features", label: "Features" },
//   { id: "pricing", label: "Pricing" },
//   { id: "testimonials", label: "Reviews" },
// ];

// const Navbar = () => {
//   const { isAuthenticated, user, logout } = useAuth();

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [cmdOpen, setCmdOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [active, setActive] = useState("");

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const onScroll = () => {
//       setScrolled(window.scrollY > 10);

//       NAV_ITEMS.forEach((item) => {
//         const el = document.getElementById(item.id);
//         if (!el) return;

//         const rect = el.getBoundingClientRect();

//         if (rect.top <= 120 && rect.bottom >= 120) {
//           setActive(item.id);
//         }
//       });
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const goToSection = (id) => {
//     setActive(id);

//     if (location.pathname !== "/") {
//       navigate("/");
//       setTimeout(() => {
//         document.getElementById(id)?.scrollIntoView({
//           behavior: "smooth",
//         });
//       }, 150);
//     } else {
//       document.getElementById(id)?.scrollIntoView({
//         behavior: "smooth",
//       });
//     }

//     setMobileOpen(false);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <>
//       <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

//       <motion.header
//         initial={{ y: -70 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.45 }}
//         className="fixed top-0 inset-x-0 z-50"
//       >
//         {/* NAV CONTAINER */}
//         <div
//           className={`w-full transition-all duration-300 ${
//             scrolled
//               ? "bg-white/60 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 shadow-lg"
//               : "bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl border-b border-white/10 dark:border-gray-800/40"
//           }`}
//         >
//           <div className="w-full px-4 md:px-8 lg:px-12">
//             <div className="h-20 flex items-center justify-between">

//               {/* LOGO */}
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.96 }}
//                 onClick={() => navigate("/")}
//                 className="flex items-center gap-3"
//               >
//                 <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-xl">
//                   S
//                 </div>

//                 <div className="text-left">
//                   <p className="text-base font-bold text-gray-900 dark:text-white leading-none">
//                     SmartBudget
//                   </p>
//                   <p className="text-xs text-gray-300 mt-1">
//                     Modern Finance Platform
//                   </p>
//                 </div>
//               </motion.button>

//               {/* DESKTOP NAV */}
//               <nav className="hidden lg:flex items-center gap-2">
//                 {NAV_ITEMS.map((item) => {
//                   const isActive = active === item.id;

//                   return (
//                     <button
//                       key={item.id}
//                       onClick={() => goToSection(item.id)}
//                       className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group
//                         ${
//                           isActive
//                             ? "text-indigo-600 dark:text-indigo-300"
//                             : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                         }`}
//                     >
//                       {/* ACTIVE PILL */}
//                       {isActive && (
//                         <motion.span
//                           layoutId="nav-pill"
//                           className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 border border-indigo-200/40 dark:border-indigo-500/20 shadow-sm"
//                           transition={{
//                             type: "spring",
//                             stiffness: 350,
//                             damping: 30,
//                           }}
//                         />
//                       )}

//                       {/* HOVER STATE */}
//                       {!isActive && (
//                         <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gray-100/60 dark:bg-gray-800/40" />
//                       )}

//                       {/* LABEL */}
//                       <span className="relative z-10 flex items-center gap-2">
//                         {item.label}

//                         {/* ACTIVE DOT */}
//                         {isActive && (
//                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
//                         )}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </nav>

//               {/* RIGHT SIDE */}
//               <div className="hidden lg:flex items-center gap-3">
//                 <button
//                   onClick={() => setCmdOpen(true)}
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-600 hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-900/60 transition"
//                 >
//                   <Command size={15} />
//                   <span>⌘K</span>
//                 </button>

//                 <ThemeToggle />

//                 {!isAuthenticated ? (
//                   <>
//                     <button
//                       onClick={() => navigate("/login")}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
//                     >
//                       Login
//                     </button>

//                     <motion.button
//                       whileHover={{ y: -2 }}
//                       whileTap={{ scale: 0.96 }}
//                       onClick={() => navigate("/signup")}
//                       className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-sm font-semibold shadow-xl"
//                     >
//                       Get Started
//                     </motion.button>
//                   </>
//                 ) : (
//                   <>
//                     <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
//                       Hello, {user?.name?.split(" ")[0] || "User"}
//                     </div>

//                     <button
//                       onClick={() => navigate("/app")}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
//                     >
//                       Dashboard
//                     </button>

//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
//                     >
//                       <LogOut size={16} />
//                       Logout
//                     </button>
//                   </>
//                 )}
//               </div>

//               {/* MOBILE MENU BUTTON */}
//               <button
//                 onClick={() => setMobileOpen(!mobileOpen)}
//                 className="lg:hidden h-11 w-11 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center"
//               >
//                 {mobileOpen ? <X size={18} /> : <Menu size={18} />}
//               </button>
//             </div>
//           </div>

//           {/* MOBILE MENU */}
//           <AnimatePresence>
//             {mobileOpen && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.25 }}
//                 className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
//               >
//                 <div className="px-4 py-5 space-y-3">
//                   {NAV_ITEMS.map((item) => (
//                     <button
//                       key={item.id}
//                       onClick={() => goToSection(item.id)}
//                       className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 font-medium"
//                     >
//                       {item.label}
//                     </button>
//                   ))}

//                   <div className="pt-2">
//                     <ThemeToggle />
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.header>
//     </>
//   );
// };

// export default Navbar;

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ThemeToggle from "../ui/ThemeToggle";
import CommandPalette from "../ui/CommandPalette";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Reviews" },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);

      NAV_ITEMS.forEach((item) => {
        const el = document.getElementById(item.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(item.id);
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (id) => {
    setActive(id);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }

    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      <motion.header
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45 }}
        className="fixed top-0 inset-x-0 z-50"
      >
        {/* NAV BACKGROUND WRAPPER (FINTECH UPGRADE) */}
        <div
          className={`w-full transition-all duration-300 ${
            scrolled
              ? "bg-gradient-to-r from-white/85 via-white/75 to-indigo-50/40 dark:from-[#0B1220]/90 dark:via-[#0A0F1C]/85 dark:to-[#0B1324]/90 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : "bg-gradient-to-r from-white/60 via-white/40 to-indigo-50/20 dark:from-[#0B1220]/60 dark:via-[#0A0F1C]/50 dark:to-[#0B1324]/60 backdrop-blur-xl border-b border-gray-200/30 dark:border-white/5"
          }`}
        >
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="h-20 flex items-center justify-between">

              {/* LOGO */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-xl">
                  S
                </div>

                <div className="text-left">
                  <p className="text-base font-bold text-gray-900 dark:text-white leading-none">
                    SmartBudget
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Modern Finance Platform
                  </p>
                </div>
              </motion.button>

              {/* DESKTOP NAV */}
              <nav className="hidden lg:flex items-center gap-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = active === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => goToSection(item.id)}
                      className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group
                        ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 border border-indigo-200/40 dark:border-indigo-500/20 shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}

                      {!isActive && (
                        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gray-100/60 dark:bg-gray-800/40" />
                      )}

                      <span className="relative z-10 flex items-center gap-2">
                        {item.label}

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* RIGHT SIDE */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-300 cursor-pointer hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-900/60 transition"
                >
                  <Command size={15} />
                  <span>⌘K</span>
                </button>

                <ThemeToggle />

                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      Login
                    </button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/signup")}
                      className="px-5 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-sm font-semibold shadow-xl"
                    >
                      Get Started
                    </motion.button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
                      Hello, {user?.name?.split(" ")[0] || "User"}
                    </div>

                    <button
                      onClick={() => navigate("/app")}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE BUTTON */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden h-11 w-11 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <div className="px-4 py-5 space-y-3">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => goToSection(item.id)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 font-medium"
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="pt-2">
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Navbar;