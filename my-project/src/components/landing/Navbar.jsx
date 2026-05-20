


// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Menu,
//   X,
//   LogOut,
//   ArrowRight,
//   LayoutDashboard,
//   ShieldCheck,
//   Search,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// import CommandPalette from "../ui/CommandPalette";
// import { useAuth } from "../../hooks/useAuth";

// const NAV_ITEMS = [
//   { id: "features", label: "Platform" },
//   { id: "pricing", label: "Pricing" },
//   { id: "testimonials", label: "Customers" },
//   { id: "security", label: "Security" },
// ];

// const Navbar = () => {
//   const { isAuthenticated, user, logout } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [cmdOpen, setCmdOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [active, setActive] = useState("");

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
//       }, 120);
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
//         initial={{ y: -40 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.35 }}
//         className="fixed inset-x-0 top-0 z-50"
//       >
//         <div
//           className={`w-full transition-all duration-300 ${
//             scrolled
//               ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
//               : "bg-white/90 backdrop-blur-lg border-b border-transparent"
//           }`}
//         >
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="h-[76px] flex items-center justify-between">
//               {/* LEFT */}
//               <div className="flex items-center gap-14">
//                 {/* LOGO */}
//                 <motion.button
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => navigate("/")}
//                   className="flex items-center gap-3 cursor-pointer"
//                 >
//                   <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
//                     <span className="text-white text-sm font-semibold tracking-tight">
//                       SB
//                     </span>
//                   </div>

//                   <div className="flex flex-col items-start">
//                     <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 leading-none">
//                       SmartBudget
//                     </h2>

//                     <div className="flex items-center gap-1 mt-1">
//                       <ShieldCheck
//                         size={12}
//                         className="text-slate-400"
//                       />

//                       <span className="text-[11px] font-medium text-slate-500">
//                         Bank-grade security
//                       </span>
//                     </div>
//                   </div>
//                 </motion.button>

//                 {/* DESKTOP NAV */}
//                 <nav className="hidden lg:flex items-center">
//                   {NAV_ITEMS.map((item) => {
//                     const isActive = active === item.id;

//                     return (
//                       <button
//                         key={item.id}
//                         onClick={() => goToSection(item.id)}
//                         className={`relative h-[76px] px-5 text-[14px] font-medium transition-all duration-200 cursor-pointer
//                           ${
//                             isActive
//                               ? "text-slate-900"
//                               : "text-slate-500 hover:text-slate-900"
//                           }`}
//                       >
//                         <span>{item.label}</span>

//                         {isActive && (
//                           <motion.div
//                             layoutId="active-nav"
//                             className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
//                             transition={{
//                               type: "spring",
//                               stiffness: 300,
//                               damping: 30,
//                             }}
//                           />
//                         )}
//                       </button>
//                     );
//                   })}
//                 </nav>
//               </div>

//               {/* RIGHT */}
//               <div className="hidden lg:flex items-center gap-3">
//                 {/* SEARCH */}
//                 <button
//                   onClick={() => setCmdOpen(true)}
//                   className="h-10 px-4 border border-slate-200 rounded-xl bg-white flex items-center gap-3 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all duration-200"
//                 >
//                   <Search size={15} />

//                   <span className="text-[13px] font-medium">
//                     Search
//                   </span>

//                   <div className="px-2 py-1 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
//                     ⌘K
//                   </div>
//                 </button>

//                 {!isAuthenticated ? (
//                   <>
//                     {/* SIGN IN */}
//                     <button
//                       onClick={() => navigate("/login")}
//                       className="h-10 px-4 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer"
//                     >
//                       Sign In
//                     </button>

//                     {/* OPEN ACCOUNT */}
//                     <motion.button
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => navigate("/signup")}
//                       className="h-10 px-5 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all duration-200 shadow-sm"
//                     >
//                       Open Account
//                       <ArrowRight size={15} />
//                     </motion.button>
//                   </>
//                 ) : (
//                   <>
//                     {/* USER */}
//                     <div className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center">
//                       <span className="text-[13px] font-medium text-slate-700">
//                         {user?.name?.split(" ")[0] || "User"}
//                       </span>
//                     </div>

//                     {/* DASHBOARD */}
//                     <button
//                       onClick={() => navigate("/app")}
//                       className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
//                     >
//                       <LayoutDashboard size={15} />
//                       Dashboard
//                     </button>

//                     {/* LOGOUT */}
//                     <button
//                       onClick={handleLogout}
//                       className="h-10 px-4 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
//                     >
//                       <LogOut size={15} />
//                       Logout
//                     </button>
//                   </>
//                 )}
//               </div>

//               {/* MOBILE TOGGLE */}
//               <button
//                 onClick={() => setMobileOpen(!mobileOpen)}
//                 className="lg:hidden h-10 w-10 border border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-700"
//               >
//                 {mobileOpen ? <X size={18} /> : <Menu size={18} />}
//               </button>
//             </div>
//           </div>

//           {/* MOBILE MENU */}
//           <AnimatePresence>
//             {mobileOpen && (
//               <motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 transition={{ duration: 0.2 }}
//                 className="lg:hidden border-t border-slate-200 bg-white"
//               >
//                 <div className="px-4 py-5">
//                   {/* NAVIGATION */}
//                   <div className="space-y-1">
//                     {NAV_ITEMS.map((item) => (
//                       <button
//                         key={item.id}
//                         onClick={() => goToSection(item.id)}
//                         className="w-full h-12 px-4 rounded-xl text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
//                       >
//                         {item.label}
//                       </button>
//                     ))}
//                   </div>

//                   {/* AUTH */}
//                   <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
//                     {!isAuthenticated ? (
//                       <>
//                         <button
//                           onClick={() => navigate("/login")}
//                           className="w-full h-11 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
//                         >
//                           Sign In
//                         </button>

//                         <button
//                           onClick={() => navigate("/signup")}
//                           className="w-full h-11 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold"
//                         >
//                           Open Account
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           onClick={() => navigate("/app")}
//                           className="w-full h-11 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
//                         >
//                           Dashboard
//                         </button>

//                         <button
//                           onClick={handleLogout}
//                           className="w-full h-11 rounded-xl bg-red-50 text-red-600 text-[14px] font-semibold"
//                         >
//                           Logout
//                         </button>
//                       </>
//                     )}
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
      setScrolled(window.scrollY > 8);

      NAV_ITEMS.forEach((item) => {
        const el = document.getElementById(item.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 140 && rect.bottom >= 140) {
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
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* =======================
            BANK SURFACE LAYER
        ======================= */}
        <div
          className={`
            w-full border-b
            transition-all duration-200
            ${
              scrolled
                ? "bg-white border-slate-200 shadow-sm"
                : "bg-white border-transparent"
            }
          `}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[72px] flex items-center justify-between">

              {/* =======================
                  BRAND BLOCK
              ======================= */}
              <div className="flex items-center gap-10">

                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      SB
                    </span>
                  </div>

                  <div className="leading-tight">
                    <h1 className="text-[14px] font-semibold text-slate-900">
                      SmartBudget
                    </h1>

                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck size={12} className="text-slate-500" />
                      <span className="text-[11px] text-slate-500">
                        Bank-grade financial system
                      </span>
                    </div>
                  </div>
                </button>

                {/* DESKTOP NAV */}
                <nav className="hidden lg:flex items-center gap-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = active === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => goToSection(item.id)}
                        className={`
                          relative px-4 h-[72px]
                          text-[13px] font-medium
                          transition
                          ${
                            isActive
                              ? "text-slate-900"
                              : "text-slate-500 hover:text-slate-900"
                          }
                        `}
                      >
                        {item.label}

                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* =======================
                  ACTION AREA
              ======================= */}
              <div className="hidden lg:flex items-center gap-3">

                {/* SEARCH */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="h-9 px-3 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-500 hover:text-slate-700"
                >
                  <Search size={14} />
                  <span className="text-[12px]">Search</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    ⌘K
                  </span>
                </button>

                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[13px] text-slate-600 hover:text-slate-900"
                    >
                      Sign In
                    </button>

                    <button
                      onClick={() => navigate("/signup")}
                      className="h-9 px-4 bg-slate-900 text-white text-[13px] font-medium rounded-lg hover:bg-slate-800"
                    >
                      Open Account
                      <ArrowRight size={14} className="ml-2 inline" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/app")}
                      className="h-9 px-3 border border-slate-200 rounded-lg text-[13px]"
                    >
                      <LayoutDashboard size={14} className="inline mr-1" />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="text-[13px] text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden h-9 w-9 border border-slate-200 rounded-lg flex items-center justify-center"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* =======================
              MOBILE PANEL
          ======================= */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="lg:hidden border-t border-slate-200 bg-white"
              >
                <div className="px-4 py-4 space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => goToSection(item.id)}
                      className="w-full text-left px-3 py-2 text-[14px] text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      {item.label}
                    </button>
                  ))}
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