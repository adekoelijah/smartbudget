// import { useState } from "react";

// const defaultSettings = {
//   email: {
//     budgetAlerts: true,
//     weeklyReports: true,
//     unusualActivity: true,
//   },
//   inApp: {
//     budgetAlerts: true,
//     transactionUpdates: true,
//   },
// };

// const loadSettings = () => {
//   try {
//     const stored = localStorage.getItem("notification_settings");
//     return stored ? JSON.parse(stored) : defaultSettings;
//   } catch {
//     return defaultSettings;
//   }
// };

// const NotificationSettings = () => {
//   // ✅ Lazy initialization (FIXED)
//   const [settings, setSettings] = useState(loadSettings);

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // 🔁 TOGGLE HANDLER
//   const toggle = (channel, key) => {
//     setSettings((prev) => ({
//       ...prev,
//       [channel]: {
//         ...prev[channel],
//         [key]: !prev[channel][key],
//       },
//     }));
//   };

//   // 💾 SAVE SETTINGS
//   const handleSave = async () => {
//     setMessage("");

//     try {
//       setLoading(true);

//       // ✅ Persist locally
//       localStorage.setItem(
//         "notification_settings",
//         JSON.stringify(settings)
//       );

//       // 🔌 Replace with real API
//       await new Promise((res) => setTimeout(res, 800));

//       setMessage("Notification preferences updated");
//     } catch {
//       setMessage("Failed to update notifications");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">

//       {/* EMAIL NOTIFICATIONS */}
//       <div className="p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           Email Notifications
//         </h2>

//         {Object.entries(settings.email).map(([key, value]) => (
//           <div
//             key={key}
//             className="flex items-center justify-between"
//           >
//             <div>
//               <p className="text-sm font-medium capitalize">
//                 {key.replace(/([A-Z])/g, " $1")}
//               </p>
//               <p className="text-xs text-gray-500">
//                 Receive email alerts for this activity
//               </p>
//             </div>

//             <button
//               onClick={() => toggle("email", key)}
//               className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
//                 value ? "bg-green-500" : "bg-gray-300"
//               }`}
//             >
//               <div
//                 className={`w-4 h-4 bg-white rounded-full transform transition ${
//                   value ? "translate-x-5" : ""
//                 }`}
//               />
//             </button>
//           </div>
//         ))}

//       </div>

//       {/* IN-APP NOTIFICATIONS */}
//       <div className="p-6 border rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">

//         <h2 className="font-semibold text-gray-900 dark:text-white">
//           In-App Notifications
//         </h2>

//         {Object.entries(settings.inApp).map(([key, value]) => (
//           <div
//             key={key}
//             className="flex items-center justify-between"
//           >
//             <div>
//               <p className="text-sm font-medium capitalize">
//                 {key.replace(/([A-Z])/g, " $1")}
//               </p>
//               <p className="text-xs text-gray-500">
//                 Show notifications inside the app
//               </p>
//             </div>

//             <button
//               onClick={() => toggle("inApp", key)}
//               className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
//                 value ? "bg-green-500" : "bg-gray-300"
//               }`}
//             >
//               <div
//                 className={`w-4 h-4 bg-white rounded-full transform transition ${
//                   value ? "translate-x-5" : ""
//                 }`}
//               />
//             </button>
//           </div>
//         ))}

//       </div>

//       {/* ACTION */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleSave}
//           disabled={loading}
//           className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
//         >
//           {loading ? "Saving..." : "Save Preferences"}
//         </button>
//       </div>

//       {/* FEEDBACK */}
//       {message && (
//         <p className="text-sm text-center text-gray-600 dark:text-gray-300">
//           {message}
//         </p>
//       )}

//     </div>
//   );
// };

// export default NotificationSettings;


import { useState } from "react";

const defaultSettings = {
  email: {
    budgetAlerts: true,
    weeklyReports: true,
    unusualActivity: true,
  },
  inApp: {
    budgetAlerts: true,
    transactionUpdates: true,
  },
};

const loadSettings = () => {
  try {
    const stored = localStorage.getItem("notification_settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState(loadSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const toggle = (channel, key) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key],
      },
    }));
  };

  const handleSave = async () => {
    setMessage("");

    try {
      setLoading(true);

      localStorage.setItem(
        "notification_settings",
        JSON.stringify(settings)
      );

      await new Promise((res) => setTimeout(res, 600));

      setMessage("Notification preferences updated successfully");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ value, onClick }) => (
    <button
      onClick={onClick}
      className={`
        relative w-11 h-6 rounded-full transition
        ${value ? "bg-emerald-500" : "bg-white/10"}
      `}
    >
      <span
        className={`
          absolute top-1 left-1 w-4 h-4 rounded-full bg-white
          transition-transform duration-300
          ${value ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

        <h2 className="text-lg font-semibold">
          Notification Control Center
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Manage how SmartBudget communicates with you
        </p>

      </div>

      {/* EMAIL SETTINGS */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-5">

        <h3 className="text-sm uppercase tracking-widest text-slate-400">
          Email Notifications
        </h3>

        {Object.entries(settings.email).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Receive email alerts for this activity
              </p>
            </div>

            <Toggle
              value={value}
              onClick={() => toggle("email", key)}
            />
          </div>
        ))}

      </div>

      {/* IN-APP SETTINGS */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-5">

        <h3 className="text-sm uppercase tracking-widest text-slate-400">
          In-App Notifications
        </h3>

        {Object.entries(settings.inApp).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Show notifications inside the app
              </p>
            </div>

            <Toggle
              value={value}
              onClick={() => toggle("inApp", key)}
            />
          </div>
        ))}

      </div>

      {/* SAVE ACTION */}
      <div className="flex justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="
            px-5 py-3 rounded-2xl text-sm font-medium
            bg-emerald-500 text-black
            hover:opacity-90 transition
            disabled:opacity-50
          "
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>

      </div>

      {/* FEEDBACK */}
      {message && (
        <p className="text-center text-sm text-slate-400">
          {message}
        </p>
      )}

    </div>
  );
};

export default NotificationSettings;