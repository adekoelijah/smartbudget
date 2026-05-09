// import { useMemo } from "react";
// import { useLocation } from "react-router-dom";

// const SettingsHeader = () => {
//   const location = useLocation();

//   // 📍 Derive current section name (Stripe-style context awareness)
//   const currentSection = useMemo(() => {
//     const segment = location.pathname.split("/").pop();

//     const map = {
//       profile: "Profile",
//       security: "Security",
//       notifications: "Notifications",
//       preferences: "Preferences",
//       billing: "Billing",
//     };

//     return map[segment] || "Profile";
//   }, [location.pathname]);

//   return (
//     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//       {/* LEFT: TITLE + CONTEXT */}
//       <div>
//         <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
//           Settings
//         </h1>

//         <p className="text-sm text-gray-500">
//           Manage your account, preferences, and billing
//         </p>

//         {/* CURRENT SECTION INDICATOR */}
//         <p className="text-xs mt-1 text-gray-400">
//           {currentSection}
//         </p>
//       </div>

//       {/* RIGHT: ACTIONS */}
//       <div className="flex items-center gap-2">

//         {/* SAVE BUTTON (HOOK READY) */}
//         <button
//           className="px-4 py-2 text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
//         >
//           Save Changes
//         </button>

//         {/* RESET BUTTON */}
//         <button
//           className="px-4 py-2 text-sm rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//         >
//           Reset
//         </button>

//       </div>

//     </div>
//   );
// };

// export default SettingsHeader;

// import { useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Save,
//   RotateCcw,
//   ShieldCheck,
//   CreditCard,
//   User,
//   Bell,
//   SlidersHorizontal,
// } from "lucide-react";

// const SettingsHeader = () => {
//   const location = useLocation();

//   /**
//    * 📍 Detect active section
//    */
//   const currentSection = useMemo(() => {
//     const segment = location.pathname.split("/").pop();

//     const map = {
//       profile: {
//         label: "Profile",
//         icon: User,
//         desc: "Manage identity, avatar and personal details",
//       },
//       security: {
//         label: "Security",
//         icon: ShieldCheck,
//         desc: "Password, sessions and authentication controls",
//       },
//       notifications: {
//         label: "Notifications",
//         icon: Bell,
//         desc: "Email alerts, updates and communication rules",
//       },
//       preferences: {
//         label: "Preferences",
//         icon: SlidersHorizontal,
//         desc: "Theme, language and app experience settings",
//       },
//       billing: {
//         label: "Billing",
//         icon: CreditCard,
//         desc: "Plans, invoices and payment methods",
//       },
//     };

//     return map[segment] || map.profile;
//   }, [location.pathname]);

//   const SectionIcon = currentSection.icon;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -14 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35 }}
//       className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
//     >
//       <div className="p-5 md:p-7">

//         <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

//           {/* LEFT SIDE */}
//           <div className="space-y-4">

//             {/* Top Label */}
//             <div className="flex items-center gap-2 flex-wrap">

//               <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
//                 Account Center
//               </span>

//               <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
//                 Secure & Synced
//               </span>

//             </div>

//             {/* Title */}
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
//                 Settings
//               </h1>

//               <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
//                 Manage your account preferences, privacy,
//                 notifications, billing and security controls.
//               </p>
//             </div>

//             {/* Active Section */}
//             <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 w-fit">

//               <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
//                 <SectionIcon size={18} />
//               </div>

//               <div>
//                 <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
//                   Current Section
//                 </p>

//                 <p className="text-sm font-semibold text-slate-900 dark:text-white">
//                   {currentSection.label}
//                 </p>

//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   {currentSection.desc}
//                 </p>
//               </div>

//             </div>

//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex flex-col sm:flex-row gap-3">

//             {/* RESET */}
//             <motion.button
//                 whileHover={{ scale: 1.02, y: -1 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="
//                 inline-flex items-center justify-center gap-2
//                 px-5 py-3 rounded-2xl
//                border border-slate-300 dark:border-slate-700
//               bg-white dark:bg-slate-950
//              text-slate-700 dark:text-white
//              font-semibold
//               shadow-sm hover:shadow-md
//               hover:bg-slate-50 dark:hover:bg-slate-800
//                  transition-all duration-200
//   "
// >
//   <RotateCcw size={16} className="text-slate-500 dark:text-slate-300" />
//   <span className="text-white">Reset</span>
// </motion.button>

//             {/* SAVE */}
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition"
//             >
//               <Save size={16} />
//               Save Changes
//             </motion.button>

//           </div>

//         </div>

//       </div>
//     </motion.div>
//   );
// };

// export default SettingsHeader;

import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  User,
  Bell,
  SlidersHorizontal,
} from "lucide-react";

const SettingsHeader = () => {
  const location = useLocation();

  const currentSection = useMemo(() => {
    const segment = location.pathname.split("/").pop();

    const map = {
      profile: {
        label: "Profile",
        icon: User,
        desc: "Manage identity, avatar and personal details",
      },
      security: {
        label: "Security",
        icon: ShieldCheck,
        desc: "Password, sessions and authentication controls",
      },
      notifications: {
        label: "Notifications",
        icon: Bell,
        desc: "Email alerts and system updates",
      },
      preferences: {
        label: "Preferences",
        icon: SlidersHorizontal,
        desc: "Language, currency and app behavior",
      },
      billing: {
        label: "Billing",
        icon: CreditCard,
        desc: "Plans, invoices and payment methods",
      },
    };

    return map[segment] || map.profile;
  }, [location.pathname]);

  const SectionIcon = currentSection.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="p-6 md:p-8">

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-5">

            {/* BADGES */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                Account Center
              </span>

              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                Secure System
              </span>
            </div>

            {/* TITLE */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Settings
              </h1>

              <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
                Manage your account preferences, privacy, notifications, billing and security controls.
              </p>
            </div>

            {/* ACTIVE SECTION CARD */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 w-fit">

              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
                <SectionIcon size={18} />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  Current Section
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {currentSection.label}
                </p>

                <p className="text-xs text-slate-500">
                  {currentSection.desc}
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* RESET */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="
                inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-2xl
                border border-slate-200
                bg-white
                text-slate-700 font-semibold
                shadow-sm hover:shadow-md hover:bg-slate-50
                transition
              "
            >
              <RotateCcw size={16} className="text-slate-500" />
              Reset
            </motion.button>

            {/* SAVE */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-2xl
                bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500
                text-white font-semibold shadow-lg hover:shadow-xl
                transition
              "
            >
              <Save size={16} />
              Save Changes
            </motion.button>

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default SettingsHeader;