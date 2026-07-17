import { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  LockKeyhole,
} from "lucide-react";

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

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    updateField(key, value);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

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
    <div className="space-y-4 md:space-y-6">

      {/* ================= PASSWORD ================= */}
      <div className="rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6 space-y-4 md:space-y-5">

        {/* HEADER */}
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-slate-900 text-white">
            <LockKeyhole size={18} className="md:w-5 md:h-5" />
          </div>

          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Change Password
            </h2>

            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Update credentials securely
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handlePasswordChange} className="space-y-4">

          {[
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "new" },
            { label: "Confirm Password", key: "confirm" },
          ].map((field, i) => (
            <div key={i} className="space-y-1">

              <label className="text-xs md:text-sm font-medium text-slate-700">
                {field.label}
              </label>

              <div className="relative">

                <input
                  type={showPassword[field.key] ? "text" : "password"}
                  value={form[`${field.key}Password`]}
                  onChange={(e) =>
                    handleChange(`${field.key}Password`, e.target.value)
                  }
                  className="w-full rounded-xl md:rounded-2xl border bg-slate-50 px-3 md:px-4 py-2.5 md:py-3 pr-10 text-sm outline-none focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() => togglePassword(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword[field.key] ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>
            </div>
          ))}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl md:rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ================= 2FA ================= */}
      <div className="rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6">

        <div className="flex items-start justify-between gap-3">

          <div className="flex gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-emerald-100 text-emerald-600">
              <Smartphone size={18} />
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Two-Factor Authentication
              </h2>

              <p className="text-xs md:text-sm text-slate-500">
                Extra security layer
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle2FA}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-semibold ${
              security.twoFA
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {security.twoFA ? "ON" : "OFF"}
          </button>

        </div>
      </div>

      {/* ================= SESSIONS ================= */}
      <div className="rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6 space-y-4">

        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Active Sessions
          </h2>

          <p className="text-xs md:text-sm text-slate-500">
            Manage device access
          </p>
        </div>

        <button
          onClick={logoutAllDevices}
          disabled={loading}
          className="w-full sm:w-auto rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
        >
          {loading ? "Processing..." : "Logout All Devices"}
        </button>

      </div>

      {/* ================= FEEDBACK ================= */}
      {(message || error) && (
        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
          {message || error}
        </div>
      )}

    </div>
  );
};

export default SecuritySettings;