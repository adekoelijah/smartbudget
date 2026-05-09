
// // export default SettingsNav;
// import { NavLink } from "react-router-dom";
// import {
//   User,
//   Shield,
//   Bell,
//   Sliders,
//   CreditCard,
// } from "lucide-react";

// const tabs = [
//   { id: "profile", label: "Profile", icon: User },
//   { id: "security", label: "Security", icon: Shield },
//   { id: "notifications", label: "Notifications", icon: Bell },
//   { id: "preferences", label: "Preferences", icon: Sliders },
//   { id: "billing", label: "Billing", icon: CreditCard },
// ];

// const SettingsNav = () => {
//   return (
//     <div className="space-y-2">
//       {tabs.map((tab) => {
//         const Icon = tab.icon;

//         return (
//           <NavLink
//             key={tab.id}
//             to={`/app/settings/${tab.id}`}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
//               ${
//                 isActive
//                   ? "bg-indigo-600 text-white shadow"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`
//             }
//           >
//             <Icon size={18} />
//             {tab.label}
//           </NavLink>
//         );
//       })}
//     </div>
//   );
// };

// export default SettingsNav;


const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "preferences", label: "Preferences" },
  { id: "billing", label: "Billing" },
];

const SettingsNav = ({ activeTab, onNavigate }) => {
  return (
    <div className="space-y-2">

      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate?.(tab.id)}  // 👈 SAFE GUARD
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition
              ${active
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-100 text-slate-600"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}

    </div>
  );
};

export default SettingsNav;