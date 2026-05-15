

import { useState } from "react";
import {
  Bell,
  Mail,
  ShieldCheck,
  Smartphone,
  Wallet,
  CheckCircle2,
} from "lucide-react";

/* ================= DEFAULT SETTINGS ================= */
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

const formatLabel = (text) =>
  text.replace(/([A-Z])/g, " $1");

/* ================= TOGGLE ================= */
const Toggle = ({ value, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative h-6 w-11 md:h-7 md:w-12 rounded-full transition-all
      ${value ? "bg-emerald-500" : "bg-slate-200"}
    `}
  >
    <span
      className={`
        absolute top-1 left-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-white shadow-sm
        transition-transform duration-300
        ${value ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);

/* ================= COMPONENT ================= */
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

      await new Promise((r) => setTimeout(r, 600));

      setMessage("Notification preferences updated successfully");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">

      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">

          <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Bell size={20} className="md:w-6 md:h-6" />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Notification Center
            </h2>

            <p className="mt-1 text-xs md:text-sm text-slate-500 leading-relaxed">
              Control alerts, updates, and financial notifications securely.
            </p>
          </div>

        </div>
      </div>

      {/* ================= EMAIL ================= */}
      <div className="rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6">

        <div className="flex items-center gap-3 md:gap-4">

          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Mail size={18} />
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900">
              Email Notifications
            </h3>
            <p className="text-xs md:text-sm text-slate-500">
              Secure alerts via email
            </p>
          </div>

        </div>

        <div className="mt-4 md:mt-6 space-y-3">

          {Object.entries(settings.email).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-3 md:p-4"
            >

              <div className="flex items-start gap-2 md:gap-3 min-w-0">

                <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />

                <p className="text-sm font-medium text-slate-800 truncate">
                  {formatLabel(key)}
                </p>

              </div>

              <Toggle
                value={value}
                onClick={() => toggle("email", key)}
              />

            </div>
          ))}

        </div>
      </div>

      {/* ================= IN-APP ================= */}
      <div className="rounded-2xl md:rounded-3xl border bg-white p-4 md:p-6">

        <div className="flex items-center gap-3 md:gap-4">

          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Smartphone size={18} />
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900">
              In-App Notifications
            </h3>

            <p className="text-xs md:text-sm text-slate-500">
              Live updates inside SmartBudget
            </p>
          </div>

        </div>

        <div className="mt-4 md:mt-6 space-y-3">

          {Object.entries(settings.inApp).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-3 md:p-4"
            >

              <div className="flex items-start gap-2 md:gap-3 min-w-0">

                <Wallet size={16} className="text-blue-500 shrink-0 mt-0.5" />

                <p className="text-sm font-medium text-slate-800 truncate">
                  {formatLabel(key)}
                </p>

              </div>

              <Toggle
                value={value}
                onClick={() => toggle("inApp", key)}
              />

            </div>
          ))}

        </div>
      </div>

      {/* ================= SAVE BUTTON ================= */}
      <div className="flex justify-stretch sm:justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          <CheckCircle2 size={16} />
          {loading ? "Saving..." : "Save Preferences"}
        </button>

      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-sm text-emerald-700">
          {message}
        </div>
      )}

    </div>
  );
};

export default NotificationSettings;