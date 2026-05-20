


import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  CreditCard,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const SettingsNav = ({ activeTab, onNavigate }) => {
  return (
    <aside
      className="
        w-full
        lg:w-[320px]
        xl:w-[340px]

        rounded-[26px]
        border border-slate-200/70
        bg-white
        shadow-[0_18px_60px_rgba(15,23,42,0.10)]

        overflow-hidden
        sticky top-6
      "
    >
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-slate-400">
              SmartBudget
            </p>
            <h2 className="text-lg font-semibold text-white mt-2">
              Settings
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-300">
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* ================= NAV BODY ================= */}

      {/* DESKTOP + TABLET: vertical sidebar */}
      <div className="hidden sm:flex flex-col gap-2 p-3">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onNavigate?.(tab.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`
                relative flex items-center gap-3
                px-4 py-3 rounded-2xl
                border transition-all duration-300

                ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
            >
              {/* ACTIVE INDICATOR BAR */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-indigo-400" />
              )}

              <div
                className={`
                  h-10 w-10 flex items-center justify-center rounded-xl
                  ${active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}
                `}
              >
                <Icon size={18} />
              </div>

              <span className="text-sm font-semibold">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ================= MOBILE (FIXED VERTICAL LIST) ================= */}
      <div className="sm:hidden flex flex-col p-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate?.(tab.id)}
              className={`
                flex items-center gap-3
                px-4 py-3 rounded-2xl
                border transition-all

                ${
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200"
                }
              `}
            >
              <div
                className={`
                  h-9 w-9 flex items-center justify-center rounded-xl
                  ${active ? "bg-white/10" : "bg-slate-100"}
                `}
              >
                <Icon size={18} />
              </div>

              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500">Bank Security</p>
            <p className="text-xs font-semibold text-slate-900">
              End-to-end encrypted
            </p>
          </div>

          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};

export default SettingsNav;