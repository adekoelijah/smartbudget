


// import { useState } from "react";

// const SecuritySettings = () => {
//   const [form, setForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [twoFA, setTwoFA] = useState(false);

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     if (form.newPassword !== form.confirmPassword) {
//       return setMessage("Passwords do not match");
//     }

//     try {
//       setLoading(true);
//       await new Promise((res) => setTimeout(res, 1000));

//       setMessage("Password updated successfully");

//       setForm({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch {
//       setMessage("Failed to update password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogoutAll = async () => {
//     try {
//       setLoading(true);
//       await new Promise((res) => setTimeout(res, 1000));
//       setMessage("Logged out from all devices");
//     } catch {
//       setMessage("Failed to logout devices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">

//       {/* PASSWORD CARD */}
//       <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">

//         <div>
//           <h2 className="text-lg font-semibold text-slate-900">
//             Change Password
//           </h2>
//           <p className="text-sm text-slate-500">
//             Update your credentials to keep your account secure
//           </p>
//         </div>

//         <form onSubmit={handlePasswordChange} className="space-y-3">

//           <input
//             type="password"
//             placeholder="Current Password"
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={form.currentPassword}
//             onChange={(e) =>
//               setForm({ ...form, currentPassword: e.target.value })
//             }
//           />

//           <input
//             type="password"
//             placeholder="New Password"
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={form.newPassword}
//             onChange={(e) =>
//               setForm({ ...form, newPassword: e.target.value })
//             }
//           />

//           <input
//             type="password"
//             placeholder="Confirm Password"
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             value={form.confirmPassword}
//             onChange={(e) =>
//               setForm({ ...form, confirmPassword: e.target.value })
//             }
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
//           >
//             {loading ? "Updating..." : "Update Password"}
//           </button>

//         </form>
//       </div>

//       {/* 2FA CARD */}
//       <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

//         <div className="flex items-center justify-between">

//           <div>
//             <h2 className="text-lg font-semibold text-slate-900">
//               Two-Factor Authentication
//             </h2>
//             <p className="text-sm text-slate-500">
//               Add extra protection to your account
//             </p>
//           </div>

//           <button
//             onClick={() => setTwoFA(!twoFA)}
//             className={`px-4 py-2 rounded-full text-xs font-medium transition ${
//               twoFA
//                 ? "bg-emerald-500 text-white"
//                 : "bg-slate-100 text-slate-600"
//             }`}
//           >
//             {twoFA ? "Enabled" : "Disabled"}
//           </button>

//         </div>
//       </div>

//       {/* SESSION CARD */}
//       <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">

//         <div>
//           <h2 className="text-lg font-semibold text-slate-900">
//             Active Sessions
//           </h2>
//           <p className="text-sm text-slate-500">
//             Manage logged-in devices
//           </p>
//         </div>

//         <button
//           onClick={handleLogoutAll}
//           disabled={loading}
//           className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
//         >
//           {loading ? "Processing..." : "Logout All Devices"}
//         </button>

//       </div>

//       {/* MESSAGE */}
//       {message && (
//         <p className="text-sm text-center text-slate-600">
//           {message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default SecuritySettings;

import { useState } from "react";
//import { useSecuritySettings } from "../../../hooks/useSecuritySettings";
import { useSecuritySettings } from "../../hooks/useSecuritySettings";

const SecuritySettings = () => {
  const {
    security,
    loading,
    message,
    error,
    updateField,
    toggle2FA,
    changePassword,
    save2FA,
    logoutAllDevices,
  } = useSecuritySettings();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /**
   * Sync local form → hook state before submit
   * (prevents unnecessary global updates on every keystroke)
   */
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    updateField(key, value);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // push form into hook before validation
    updateField("currentPassword", form.currentPassword);
    updateField("newPassword", form.newPassword);
    updateField("confirmPassword", form.confirmPassword);

    await changePassword();
  };

  const handleToggle2FA = async () => {
    toggle2FA();
    await save2FA();
  };

  return (
    <div className="space-y-6">

      {/* PASSWORD CARD */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Change Password
          </h2>
          <p className="text-sm text-slate-500">
            Update your credentials to keep your account secure
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3">

          <input
            type="password"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={(e) =>
              handleChange("currentPassword", e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) =>
              handleChange("newPassword", e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              handleChange("confirmPassword", e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>
      </div>

      {/* 2FA CARD */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-slate-500">
              Add extra protection to your account
            </p>
          </div>

          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${
              security.twoFA
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {security.twoFA ? "Enabled" : "Disabled"}
          </button>

        </div>
      </div>

      {/* SESSION CARD */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Active Sessions
          </h2>
          <p className="text-sm text-slate-500">
            Manage logged-in devices
          </p>
        </div>

        <button
          onClick={logoutAllDevices}
          disabled={loading}
          className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600"
        >
          {loading ? "Processing..." : "Logout All Devices"}
        </button>

      </div>

      {/* FEEDBACK */}
      {(message || error) && (
        <p className="text-sm text-center text-slate-600">
          {message || error}
        </p>
      )}

    </div>
  );
};

export default SecuritySettings;