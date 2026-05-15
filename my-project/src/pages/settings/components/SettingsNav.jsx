// import { motion } from "framer-motion";
// import {
//   User,
//   ShieldCheck,
//   Bell,
//   SlidersHorizontal,
//   CreditCard,
//   ChevronRight,
// } from "lucide-react";

// const tabs = [
//   {
//     id: "profile",
//     label: "Profile",
//     desc: "Personal identity & banking profile",
//     icon: User,
//   },
//   {
//     id: "security",
//     label: "Security",
//     desc: "PIN, password & device protection",
//     icon: ShieldCheck,
//   },
//   {
//     id: "notifications",
//     label: "Notifications",
//     desc: "Transaction & account alerts",
//     icon: Bell,
//   },
//   {
//     id: "preferences",
//     label: "Preferences",
//     desc: "Theme, currency & experience",
//     icon: SlidersHorizontal,
//   },
//   {
//     id: "billing",
//     label: "Billing",
//     desc: "Cards, subscriptions & payments",
//     icon: CreditCard,
//   },
// ];

// const SettingsNav = ({ activeTab, onNavigate }) => {
//   return (
//     <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.06)] overflow-hidden">

//       {/* HEADER */}
//       <div className="border-b border-slate-100 px-5 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950">

//         <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium">
//           SmartBudget
//         </p>

//         <h2 className="mt-2 text-xl font-bold text-white">
//           Settings Center
//         </h2>

//         <p className="mt-1 text-sm text-slate-400">
//           Secure fintech account management
//         </p>

//       </div>

//       {/* NAVIGATION */}
//       <div className="p-3 space-y-2">

//         {tabs.map((tab, index) => {
//           const active = activeTab === tab.id;
//           const Icon = tab.icon;

//           return (
//             <motion.button
//               key={tab.id}
//               onClick={() => onNavigate?.(tab.id)}
//               initial={{ opacity: 0, x: -8 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className={`
//                 group relative w-full overflow-hidden rounded-2xl border
//                 transition-all duration-300
//                 ${
//                   active
//                     ? `
//                       border-indigo-500/30
//                       bg-gradient-to-r
//                       from-slate-950
//                       via-slate-900
//                       to-indigo-950
//                       shadow-lg shadow-indigo-500/10
//                     `
//                     : `
//                       border-transparent
//                       bg-slate-50/80
//                       hover:bg-white
//                       hover:border-slate-200
//                       hover:shadow-md
//                     `
//                 }
//               `}
//             >

//               {/* ACTIVE GLOW */}
//               {active && (
//                 <div className="absolute inset-y-0 left-0 w-1 bg-indigo-400 rounded-full" />
//               )}

//               <div className="flex items-center justify-between px-4 py-4">

//                 {/* LEFT */}
//                 <div className="flex items-center gap-4">

//                   <div
//                     className={`
//                       flex h-11 w-11 items-center justify-center rounded-2xl
//                       transition-all duration-300
//                       ${
//                         active
//                           ? "bg-white/10 text-indigo-300"
//                           : "bg-white text-slate-700 shadow-sm"
//                       }
//                     `}
//                   >
//                     <Icon size={18} />
//                   </div>

//                   <div className="text-left">

//                     <p
//                       className={`
//                         text-sm font-semibold transition-colors
//                         ${
//                           active
//                             ? "text-white"
//                             : "text-slate-800"
//                         }
//                       `}
//                     >
//                       {tab.label}
//                     </p>

//                     <p
//                       className={`
//                         text-xs mt-1
//                         ${
//                           active
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       `}
//                     >
//                       {tab.desc}
//                     </p>

//                   </div>

//                 </div>

//                 {/* RIGHT */}
//                 <ChevronRight
//                   size={18}
//                   className={`
//                     transition-all duration-300
//                     ${
//                       active
//                         ? "text-indigo-300 translate-x-1"
//                         : "text-slate-400 group-hover:translate-x-1"
//                     }
//                   `}
//                 />

//               </div>

//             </motion.button>
//           );
//         })}

//       </div>

//       {/* FOOTER */}
//       <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">

//         <div className="flex items-center justify-between">

//           <div>
//             <p className="text-xs font-medium text-slate-500">
//               Banking Security
//             </p>

//             <p className="text-sm font-semibold text-slate-900">
//               End-to-end encrypted
//             </p>
//           </div>

//           <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5">

//             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

//             <span className="text-xs font-semibold text-emerald-700">
//               Protected
//             </span>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default SettingsNav;



import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  CreditCard,
} from "lucide-react";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
  },
];

const SettingsNav = ({
  activeTab,
  onNavigate,
}) => {
  return (
    <aside
      className="
        sticky top-6
        overflow-hidden
        rounded-[28px]
        border border-slate-200/70
        bg-white
        shadow-[0_12px_40px_rgba(15,23,42,0.06)]
      "
    >

      {/* HEADER */}
      <div
        className="
          border-b border-slate-100
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-indigo-950
          px-5 py-4
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-slate-400
              "
            >
              SmartBudget
            </p>

            <h2
              className="
                mt-2
                text-lg
                font-semibold
                tracking-tight
                text-white
              "
            >
              Settings
            </h2>

          </div>

          <div
            className="
              hidden sm:flex
              items-center gap-2
              rounded-full
              border border-emerald-500/20
              bg-emerald-500/10
              px-2.5 py-1
            "
          >

            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

            <span
              className="
                text-[10px]
                font-semibold
                text-emerald-300
              "
            >
              Secure
            </span>

          </div>

        </div>

      </div>

      {/* NAVIGATION */}
      <div
        className="
          flex gap-2
          overflow-x-auto
          p-3
          scrollbar-hide

          lg:flex-col
          lg:overflow-visible
        "
      >

        {tabs.map((tab, index) => {
          const Icon = tab.icon;

          const active =
            activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() =>
                onNavigate?.(tab.id)
              }
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.2,
                delay: index * 0.04,
              }}
              className={`
                relative
                flex items-center gap-3
                rounded-2xl
                border
                transition-all duration-300

                /* MOBILE */
                min-w-fit
                px-4 py-3

                /* DESKTOP */
                lg:w-full

                ${
                  active
                    ? `
                      border-slate-900
                      bg-slate-900
                      shadow-[0_8px_24px_rgba(15,23,42,0.14)]
                    `
                    : `
                      border-slate-200
                      bg-white
                      hover:border-slate-300
                      hover:bg-slate-50
                    `
                }
              `}
            >

              {/* ACTIVE BAR */}
              {active && (
                <div
                  className="
                    absolute left-0 top-1/2
                    hidden h-8 w-1
                    -translate-y-1/2
                    rounded-full
                    bg-indigo-400
                    lg:block
                  "
                />
              )}

              {/* ICON */}
              <div
                className={`
                  flex h-10 w-10
                  flex-shrink-0
                  items-center justify-center
                  rounded-xl
                  transition-all

                  ${
                    active
                      ? `
                        bg-white/10
                        text-white
                      `
                      : `
                        bg-slate-100
                        text-slate-700
                      `
                  }
                `}
              >
                <Icon size={18} />
              </div>

              {/* LABEL */}
              <div className="text-left">

                <p
                  className={`
                    whitespace-nowrap
                    text-sm
                    font-semibold

                    ${
                      active
                        ? "text-white"
                        : "text-slate-800"
                    }
                  `}
                >
                  {tab.label}
                </p>

              </div>

            </motion.button>
          );
        })}

      </div>

      {/* FOOTER */}
      <div
        className="
          border-t border-slate-100
          bg-slate-50/70
          px-5 py-3
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <p
              className="
                text-[11px]
                text-slate-500
              "
            >
              Banking Security
            </p>

            <p
              className="
                mt-0.5
                text-xs
                font-semibold
                text-slate-900
              "
            >
              End-to-end encrypted
            </p>

          </div>

          <div
            className="
              rounded-full
              bg-emerald-100
              px-2.5 py-1
            "
          >

            <span
              className="
                text-[10px]
                font-semibold
                text-emerald-700
              "
            >
              Active
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
};

export default SettingsNav;