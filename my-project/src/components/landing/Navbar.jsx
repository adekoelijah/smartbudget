

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
//         {/* NAV BACKGROUND WRAPPER (FINTECH UPGRADE) */}
//         <div
//           className={`w-full transition-all duration-300 ${
//             scrolled
//               ? "bg-gradient-to-r from-white/85 via-white/75 to-indigo-50/40 dark:from-[#0B1220]/90 dark:via-[#0A0F1C]/85 dark:to-[#0B1324]/90 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
//               : "bg-gradient-to-r from-white/60 via-white/40 to-indigo-50/20 dark:from-[#0B1220]/60 dark:via-[#0A0F1C]/50 dark:to-[#0B1324]/60 backdrop-blur-xl border-b border-gray-200/30 dark:border-white/5"
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
//                   <p className="text-xs text-gray-500 mt-1">
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

//                       {!isActive && (
//                         <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gray-100/60 dark:bg-gray-800/40" />
//                       )}

//                       <span className="relative z-10 flex items-center gap-2">
//                         {item.label}

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
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-300 cursor-pointer hover:text-black dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-900/60 transition"
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
//                       className="px-5 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-sm font-semibold shadow-xl"
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

//               {/* MOBILE BUTTON */}
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
import {
  Menu,
  X,
  LogOut,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CommandPalette from "../ui/CommandPalette";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { id: "features", label: "Platform" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Customers" },
  { id: "security", label: "Security" },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

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
      }, 120);
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
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`w-full transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              : "bg-white/90 backdrop-blur-lg border-b border-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[76px] flex items-center justify-between">
              {/* LEFT */}
              <div className="flex items-center gap-14">
                {/* LOGO */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold tracking-tight">
                      SB
                    </span>
                  </div>

                  <div className="flex flex-col items-start">
                    <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 leading-none">
                      SmartBudget
                    </h2>

                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck
                        size={12}
                        className="text-slate-400"
                      />

                      <span className="text-[11px] font-medium text-slate-500">
                        Bank-grade security
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* DESKTOP NAV */}
                <nav className="hidden lg:flex items-center">
                  {NAV_ITEMS.map((item) => {
                    const isActive = active === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => goToSection(item.id)}
                        className={`relative h-[76px] px-5 text-[14px] font-medium transition-all duration-200 cursor-pointer
                          ${
                            isActive
                              ? "text-slate-900"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                      >
                        <span>{item.label}</span>

                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* RIGHT */}
              <div className="hidden lg:flex items-center gap-3">
                {/* SEARCH */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="h-10 px-4 border border-slate-200 rounded-xl bg-white flex items-center gap-3 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all duration-200"
                >
                  <Search size={15} />

                  <span className="text-[13px] font-medium">
                    Search
                  </span>

                  <div className="px-2 py-1 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
                    ⌘K
                  </div>
                </button>

                {!isAuthenticated ? (
                  <>
                    {/* SIGN IN */}
                    <button
                      onClick={() => navigate("/login")}
                      className="h-10 px-4 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer"
                    >
                      Sign In
                    </button>

                    {/* OPEN ACCOUNT */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/signup")}
                      className="h-10 px-5 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all duration-200 shadow-sm"
                    >
                      Open Account
                      <ArrowRight size={15} />
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* USER */}
                    <div className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center">
                      <span className="text-[13px] font-medium text-slate-700">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                    </div>

                    {/* DASHBOARD */}
                    <button
                      onClick={() => navigate("/app")}
                      className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </button>

                    {/* LOGOUT */}
                    <button
                      onClick={handleLogout}
                      className="h-10 px-4 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden h-10 w-10 border border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-700"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t border-slate-200 bg-white"
              >
                <div className="px-4 py-5">
                  {/* NAVIGATION */}
                  <div className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => goToSection(item.id)}
                        className="w-full h-12 px-4 rounded-xl text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* AUTH */}
                  <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
                    {!isAuthenticated ? (
                      <>
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full h-11 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
                        >
                          Sign In
                        </button>

                        <button
                          onClick={() => navigate("/signup")}
                          className="w-full h-11 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold"
                        >
                          Open Account
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate("/app")}
                          className="w-full h-11 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
                        >
                          Dashboard
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full h-11 rounded-xl bg-red-50 text-red-600 text-[14px] font-semibold"
                        >
                          Logout
                        </button>
                      </>
                    )}
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