

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X } from "lucide-react";
// import { Outlet } from "react-router-dom";

// import SettingsHeader from "./components/SettingsHeader";
// import SettingsNav from "./components/SettingsNav";

// const Settings = () => {
//   const [mobileNav, setMobileNav] = useState(false);

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 px-4 md:px-6 py-6">

//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* HEADER */}
//         <SettingsHeader />

//         {/* MOBILE NAV BUTTON */}
//         <div className="xl:hidden">
//           <button
//             onClick={() => setMobileNav(true)}
//             className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm"
//           >
//             <span className="font-medium">
//               Settings Menu
//             </span>
//             <Menu size={18} />
//           </button>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

//           {/* SIDEBAR */}
//           <aside className="hidden xl:block xl:col-span-3">
//             <div className="sticky top-6 space-y-5">

//               <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

//                 <div className="px-5 py-4 border-b border-slate-200">
//                   <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
//                     Account Center
//                   </p>

//                   <h3 className="mt-1 font-semibold">
//                     Manage Settings
//                   </h3>
//                 </div>

//                 <div className="p-3">
//                   <SettingsNav />
//                 </div>

//               </div>

//             </div>
//           </aside>

//           {/* CONTENT */}
//           <motion.main
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="xl:col-span-9"
//           >

//             <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

//               {/* BODY */}
//               <div className="p-5 md:p-7">

//                 {/* 👇 THIS IS THE KEY FIX */}
//                 <Outlet />

//               </div>

//             </div>

//           </motion.main>

//         </div>

//       </div>

//       {/* MOBILE DRAWER */}
//       <AnimatePresence>
//         {mobileNav && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMobileNav(false)}
//               className="fixed inset-0 bg-black/40 z-40 xl:hidden"
//             />

//             <motion.div
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               className="fixed top-0 left-0 h-full w-[86%] max-w-sm bg-white z-50 shadow-2xl xl:hidden"
//             >

//               <div className="p-5 border-b border-slate-200 flex items-center justify-between">
//                 <h3 className="font-semibold">Settings</h3>

//                 <button onClick={() => setMobileNav(false)}>
//                   <X size={20} />
//                 </button>
//               </div>

//               <div className="p-4">
//                 <SettingsNav />
//               </div>

//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// };

// export default Settings;


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import SettingsHeader from "./components/SettingsHeader";
import SettingsNav from "./components/SettingsNav";

const Settings = () => {
  const [mobileNav, setMobileNav] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Extract active tab from URL
   * /app/settings/profile → profile
   */
  const activeTab =
    location.pathname.split("/").filter(Boolean).pop() || "profile";

  /**
   * SaaS behavior:
   * redirect base settings → default section
   */
  useEffect(() => {
    if (location.pathname === "/app/settings") {
      navigate("/app/settings/profile", { replace: true });
    }
  }, [location.pathname, navigate]);

  /**
   * Navigation handler (used by sidebar + mobile)
   */
  const handleNavigate = (tab) => {
    navigate(`/app/settings/${tab}`);
    setMobileNav(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 md:px-6 py-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <SettingsHeader />

        {/* MOBILE BUTTON */}
        <div className="xl:hidden">
          <button
            onClick={() => setMobileNav(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <span className="font-medium capitalize">
              {activeTab} Settings
            </span>
            <Menu size={18} />
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* SIDEBAR */}
          <aside className="hidden xl:block xl:col-span-3">
            <div className="sticky top-6 space-y-5">

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Account Center
                  </p>

                  <h3 className="mt-1 font-semibold">
                    Manage Settings
                  </h3>
                </div>

                {/* 🔥 NOW ROUTE-AWARE NAV */}
                <div className="p-3">
                  <SettingsNav
                    activeTab={activeTab}
                    onNavigate={handleNavigate}
                  />
                </div>

              </div>

              {/* SaaS STATUS CARD */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5">

                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  System Status
                </p>

                <h4 className="mt-1 font-semibold">
                  All systems operational
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Settings sync instantly with your account backend.
                </p>

              </div>

            </div>
          </aside>

          {/* CONTENT */}
          <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-9"
          >

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* CONTENT BODY */}
              <div className="p-5 md:p-7">

                <Outlet />

              </div>

            </div>

          </motion.main>

        </div>

      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNav(false)}
              className="fixed inset-0 bg-black/40 z-40 xl:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 h-full w-[86%] max-w-sm bg-white z-50 shadow-2xl xl:hidden"
            >

              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold">Settings</h3>

                <button onClick={() => setMobileNav(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* 🔥 SAME NAV LOGIC USED HERE */}
              <div className="p-4">
                <SettingsNav
                  activeTab={activeTab}
                  onNavigate={handleNavigate}
                />
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;