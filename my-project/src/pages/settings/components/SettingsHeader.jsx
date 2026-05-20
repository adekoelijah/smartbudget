

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
  ChevronRight,
  Activity,
  LockKeyhole,
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

  /* =========================================
     ACTIVE SECTION
  ========================================= */

  const currentSection = useMemo(() => {
    const segment = location.pathname.split("/").pop();

    const map = {
      profile: {
        label: "Profile Settings",
        icon: User,
        desc: "Manage verified banking identity and personal information",
      },

      security: {
        label: "Security Center",
        icon: ShieldCheck,
        desc: "Authentication, session protection and account defense",
      },

      notifications: {
        label: "Notifications",
        icon: Bell,
        desc: "Transaction alerts, activities and system communication",
      },

      preferences: {
        label: "Preferences",
        icon: SlidersHorizontal,
        desc: "Customize your financial workspace experience",
      },

      billing: {
        label: "Billing & Cards",
        icon: CreditCard,
        desc: "Manage subscriptions, payment methods and card settings",
      },
    };

    return map[segment] || map.profile;
  }, [location.pathname]);

  const SectionIcon = currentSection.icon;

  /* =========================================
     SAVE SYSTEM
  ========================================= */

  const handleSave = async () => {
    try {
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
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        relative overflow-hidden
        rounded-[32px]
        border border-slate-200/80
        bg-white
        shadow-[0_20px_80px_rgba(15,23,42,0.08)]
      "
    >

      {/* =========================================
         BANK TOP STRIP
      ========================================= */}

      <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-slate-950 via-indigo-700 to-emerald-500" />

      {/* =========================================
         BACKGROUND GRID
      ========================================= */}

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* =========================================
         CONTENT
      ========================================= */}

      <div className="relative p-5 sm:p-7 lg:p-8">

        {/* =========================================
           TOP ROW
        ========================================= */}

        <div className="
          flex flex-col
          xl:flex-row xl:items-center xl:justify-between
          gap-8
        ">

          {/* =========================================
             LEFT SIDE
          ========================================= */}

          <div className="flex-1">

            {/* =========================================
               USER + SECURITY ROW
            ========================================= */}

            <div className="
              flex flex-col
              lg:flex-row lg:items-center
              gap-6
            ">

              {/* USER CARD */}

              <div className="
                flex items-center gap-4
                min-w-0
              ">

                {/* AVATAR */}

                <div className="
                  relative
                  h-16 w-16
                  rounded-2xl
                  overflow-hidden
                  border border-slate-200
                  bg-slate-100
                  shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                ">

                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="
                      h-full w-full
                      flex items-center justify-center
                      bg-slate-100
                    ">
                      <User
                        size={24}
                        className="text-slate-500"
                      />
                    </div>
                  )}

                  {/* LIVE DOT */}

                  <div className="
                    absolute bottom-1.5 right-1.5
                    h-3 w-3 rounded-full
                    bg-emerald-500
                    ring-2 ring-white
                  " />
                </div>

                {/* USER INFO */}

                <div className="min-w-0">

                  <div className="flex items-center gap-2 flex-wrap">

                    <h2 className="
                      text-[18px]
                      font-semibold
                      tracking-[-0.02em]
                      text-slate-950
                      truncate
                    ">
                      {loading
                        ? "Loading..."
                        : user?.name || "SmartBudget User"}
                    </h2>

                    <div className="
                      flex items-center gap-1
                      rounded-full
                      border border-emerald-200
                      bg-emerald-50
                      px-2 py-1
                    ">
                      <BadgeCheck
                        size={13}
                        className="text-emerald-600"
                      />

                      <span className="
                        text-[11px]
                        font-semibold
                        text-emerald-700
                      ">
                        VERIFIED
                      </span>
                    </div>

                  </div>

                  <p className="
                    mt-1
                    text-sm
                    text-slate-500
                    truncate
                  ">
                    {user?.email || "No email linked"}
                  </p>

                  {/* SYSTEM STATUS */}

                  <div className="
                    mt-3
                    flex flex-wrap items-center gap-3
                  ">

                    <div className="
                      flex items-center gap-2
                      rounded-full
                      bg-slate-100
                      px-3 py-1.5
                    ">
                      <Wifi
                        size={13}
                        className="text-emerald-600"
                      />

                      <span className="
                        text-[11px]
                        font-medium
                        text-slate-700
                      ">
                        Real-time Sync
                      </span>
                    </div>

                    <div className="
                      flex items-center gap-2
                      rounded-full
                      bg-slate-100
                      px-3 py-1.5
                    ">
                      <Activity
                        size={13}
                        className="text-indigo-600"
                      />

                      <span className="
                        text-[11px]
                        font-medium
                        text-slate-700
                      ">
                        System Operational
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =========================================
               SECTION PANEL
            ========================================= */}

            <div className="
              mt-8
              rounded-3xl
              border border-slate-200
              bg-slate-50/80
              p-5 sm:p-6
            ">

              <div className="
                flex flex-col
                lg:flex-row lg:items-center lg:justify-between
                gap-5
              ">

                {/* LEFT */}

                <div className="flex items-start gap-4">

                  <div className="
                    flex h-14 w-14
                    items-center justify-center
                    rounded-2xl
                    bg-slate-950
                    text-white
                    shadow-[0_10px_25px_rgba(15,23,42,0.2)]
                  ">
                    <SectionIcon size={22} />
                  </div>

                  <div>

                    <div className="
                      flex items-center gap-2
                      text-[12px]
                      uppercase tracking-[0.18em]
                      font-semibold
                      text-slate-400
                    ">
                      SETTINGS MODULE
                      <ChevronRight size={13} />
                      ACTIVE
                    </div>

                    <h3 className="
                      mt-2
                      text-[24px]
                      leading-none
                      font-semibold
                      tracking-[-0.03em]
                      text-slate-950
                    ">
                      {currentSection.label}
                    </h3>

                    <p className="
                      mt-3
                      max-w-2xl
                      text-sm leading-7
                      text-slate-500
                    ">
                      {currentSection.desc}
                    </p>

                  </div>

                </div>

                {/* SECURITY PANEL */}

                <div className="
                  w-full lg:w-auto
                  rounded-2xl
                  border border-emerald-200
                  bg-white
                  px-5 py-4
                ">

                  <div className="flex items-start gap-3">

                    <div className="
                      mt-0.5
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-emerald-50
                    ">
                      <LockKeyhole
                        size={18}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>

                      <p className="
                        text-sm
                        font-semibold
                        text-slate-900
                      ">
                        Enterprise Security Active
                      </p>

                      <p className="
                        mt-1
                        text-xs leading-6
                        text-slate-500
                      ">
                        Encrypted sessions, protected API layers,
                        and secured financial infrastructure enabled.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =========================================
             ACTION SIDE
          ========================================= */}

          <div className="
            flex flex-col
            sm:flex-row
            xl:flex-col
            gap-4
            xl:w-[240px]
          ">

            {/* SAVE BUTTON */}

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="
                group
                relative overflow-hidden
                h-[58px]
                rounded-2xl
                bg-slate-950
                px-6
                text-white
                shadow-[0_20px_40px_rgba(15,23,42,0.18)]
                transition-all duration-300
                hover:-translate-y-[2px]
                hover:bg-black
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              <div className="
                absolute inset-0
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                bg-gradient-to-r from-white/0 via-white/10 to-white/0
              " />

              <div className="
                relative
                flex items-center justify-center gap-2
              ">

                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}

              </div>

            </button>

            {/* SECURITY STATUS */}

            <div className="
              flex-1
              rounded-2xl
              border border-slate-200
              bg-white
              p-5
            ">

              <div className="
                flex items-center gap-2
                text-slate-900
              ">

                <ShieldCheck
                  size={16}
                  className="text-emerald-600"
                />

                <span className="
                  text-sm
                  font-semibold
                ">
                  Protection Status
                </span>

              </div>

              <div className="
                mt-4
                flex items-end gap-2
              ">

                <h4 className="
                  text-3xl
                  font-semibold
                  tracking-[-0.04em]
                  text-slate-950
                ">
                  99.99%
                </h4>

                <span className="
                  pb-1
                  text-xs
                  font-medium
                  text-emerald-600
                ">
                  SECURE
                </span>

              </div>

              <p className="
                mt-2
                text-xs leading-6
                text-slate-500
              ">
                Banking infrastructure integrity operating normally.
              </p>

            </div>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default SettingsHeader;