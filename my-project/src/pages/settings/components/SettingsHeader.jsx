import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Save,
  ShieldCheck,
  CreditCard,
  User,
  Bell,
  SlidersHorizontal,
  BadgeCheck,
  Wifi,
  Loader2,
} from "lucide-react";

import { useUser } from "../hooks/useUser";

const SettingsHeader = () => {
  const location = useLocation();

  const [saving, setSaving] = useState(false);

  const {
    user,
    loading,
    updateProfile,
    refreshUser,
  } = useUser();

  /* ================= CURRENT SECTION ================= */

  const currentSection = useMemo(() => {
    const segment = location.pathname.split("/").pop();

    const map = {
      profile: {
        label: "Profile Settings",
        icon: User,
        desc: "Manage your banking identity & profile",
      },

      security: {
        label: "Security Center",
        icon: ShieldCheck,
        desc: "Authentication & account protection",
      },

      notifications: {
        label: "Notifications",
        icon: Bell,
        desc: "Transaction alerts & updates",
      },

      preferences: {
        label: "Preferences",
        icon: SlidersHorizontal,
        desc: "Customize your banking experience",
      },

      billing: {
        label: "Billing & Cards",
        icon: CreditCard,
        desc: "Manage subscriptions and payment methods",
      },
    };

    return map[segment] || map.profile;
  }, [location.pathname]);

  const SectionIcon = currentSection.icon;

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    try {
      if (!updateProfile) {
        console.error("updateProfile function missing");
        return;
      }

      setSaving(true);

      await updateProfile({
        name: user?.name || "",
        avatar: user?.avatar || "",
      });

      await refreshUser();

    } catch (err) {
      console.error("SAVE_SETTINGS_ERROR:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-slate-200/70
        bg-gradient-to-br from-white via-slate-50 to-slate-100
        shadow-[0_10px_40px_rgba(15,23,42,0.08)]
      "
    >

      {/* FINTECH TOP GLOW */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500" />

      <div className="p-6 md:p-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

        {/* ================= LEFT SIDE ================= */}
        <div className="flex flex-col gap-6">

          {/* USER CARD */}
          <div className="flex items-center gap-4">

            {/* AVATAR */}
            <div className="
              relative h-14 w-14 rounded-2xl
              bg-slate-200 overflow-hidden
              ring-4 ring-white shadow-md
            ">

              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
              )}

              {/* LIVE STATUS */}
              <div className="
                absolute bottom-1 right-1
                h-3 w-3 rounded-full
                bg-emerald-500 ring-2 ring-white
              " />
            </div>

            {/* USER INFO */}
            <div className="space-y-1">

              <div className="flex items-center gap-2">

                <h2 className="text-base font-semibold text-slate-900">
                  {loading ? "Loading..." : user?.name || "Bank User"}
                </h2>

                <BadgeCheck
                  size={16}
                  className="text-emerald-500"
                />
              </div>

              <p className="text-sm text-slate-500">
                {user?.email || "No email connected"}
              </p>

              {/* LIVE API STATUS */}
              <div className="flex items-center gap-2 pt-1">

                <Wifi
                  size={13}
                  className="text-emerald-500"
                />

                <span className="text-xs font-medium text-emerald-600">
                  Real-time sync active
                </span>
              </div>

            </div>

          </div>

          {/* SECTION INFO */}
          <div className="flex items-center gap-4">

            <div className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl
              bg-gradient-to-br from-indigo-600 to-indigo-700
              text-white
              shadow-lg shadow-indigo-500/20
            ">
              <SectionIcon size={20} />
            </div>

            <div className="space-y-1">

              <h3 className="text-sm font-semibold text-slate-900">
                {currentSection.label}
              </h3>

              <p className="text-sm text-slate-500">
                {currentSection.desc}
              </p>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-4">

          {/* ACCOUNT SECURITY BADGE */}
          <div className="
            hidden md:flex items-center gap-2
            rounded-2xl border border-emerald-200
            bg-emerald-50
            px-4 py-3
          ">

            <ShieldCheck
              size={18}
              className="text-emerald-600"
            />

            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Bank-Level Security
              </p>

              <p className="text-[11px] text-emerald-600">
                Encrypted & Protected
              </p>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="
              flex items-center gap-2
              rounded-2xl
              bg-slate-950
              px-5 py-3
              text-sm font-medium text-white
              transition-all duration-200
              hover:bg-black
              disabled:cursor-not-allowed
              disabled:opacity-60
              shadow-lg shadow-slate-900/20
            "
          >

            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}

          </button>

        </div>

      </div>

    </motion.div>
  );
};

export default SettingsHeader;