


import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  User,
  Mail,
  Upload,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  Landmark,
  Camera,
  CheckCircle2,
  Globe,
  Wallet,
  BellRing,
  Sparkles,
} from "lucide-react";

import { useProfileSettings } from "../../hooks/useProfileSettings";
import { usePreferences } from "../../hooks/usePreferences";
//import { useUser } from "../../context/UserContext";
import { useUser } from "../../../../context/UserContext";

/* =========================================
   TRANSLATIONS
========================================= */
const translations = {
  en: {
    connecting:
      "Connecting to secure banking server...",

    personalInfo: "Personal Information",

    syncDesc:
      "Real-time profile synchronization with banking infrastructure",

    fullName: "Full Name",

    email: "Email Address",

    enterName:
      "Enter your full legal name",

    enterEmail:
      "Enter secure email address",

    secureProfile:
      "Secure Financial Profile",

    secureDesc:
      "All profile updates are encrypted and synchronized securely with your SmartBudget banking identity infrastructure in real-time.",

    ready:
      "Ready for secure synchronization",

    syncing:
      "Syncing Securely...",

    save:
      "Save & Sync Profile",

    verified: "KYC Verified",

    security:
      "Bank-Level Security",

    active: "Active",

    accountStatus:
      "Account Status",

    securityLevel:
      "Security Level",

    vault:
      "Financial Identity Vault",

    secureCore:
      "SmartBudget Secure Core",

    infrastructure:
      "Banking Security Infrastructure",

    infrastructureDesc:
      "AES-256 encryption • Real-time sync • Device protection",

    encrypted: "Encrypted",
    protected: "Protected",
    synced: "Synced",

    language: "Language",
    currency: "Currency",
    notifications: "Notifications",
  },

  yo: {
    connecting:
      "N so pọ mọ olupin ifowopamọ to ni aabo...",

    personalInfo:
      "Alaye Ara Ẹni",

    syncDesc:
      "Ìmúdójúìwọ̀n profaili lẹ́sẹ̀kẹsẹ̀ pẹlu amáyédẹrùn ifowopamọ",

    fullName: "Orukọ Kikun",

    email: "Adirẹsi Imeeli",

    enterName:
      "Tẹ orukọ rẹ ni kikun sii",

    enterEmail:
      "Tẹ imeeli aabo sii",

    secureProfile:
      "Profaili Inawo Aabo",

    secureDesc:
      "Gbogbo imudojuiwọn profaili ni a pa mọ́ ati muuṣiṣẹpọ ni aabo pẹlu amáyédẹrùn idanimọ SmartBudget rẹ.",

    ready:
      "Ṣetan fun imuṣiṣẹpọ aabo",

    syncing:
      "N muuṣiṣẹpọ ni aabo...",

    save:
      "Fipamọ & Muuṣiṣẹpọ",

    verified:
      "A ti Jẹrisi KYC",

    security:
      "Aabo Ipele Banki",

    active:
      "Nṣiṣẹ",

    accountStatus:
      "Ipo Account",

    securityLevel:
      "Ipele Aabo",

    vault:
      "Ile Ipamọ Idanimọ Inawo",

    secureCore:
      "SmartBudget Secure Core",

    infrastructure:
      "Amáyédẹrùn Aabo Ifowopamọ",

    infrastructureDesc:
      "Ìfipamọ AES-256 • Muuṣiṣẹpọ lẹsẹkẹsẹ • Idaabobo ẹrọ",

    encrypted:
      "Ti Pa Mọ",

    protected:
      "Ni Idaabobo",

    synced:
      "Ti Muuṣiṣẹpọ",

    language:
      "Ede",

    currency:
      "Owo",

    notifications:
      "Ìfitónilétí",
  },
};

/* =========================================
   COMPONENT
========================================= */
const ProfileSettings = () => {
  const {
    profile,
    preview,
    loading,
    message,
    updateField,
    setAvatar,
    saveProfile,
  } = useProfileSettings();

  const {
    prefs,
  } = usePreferences();

  const {
    user,
  } = useUser();

  const [focused, setFocused] =
    useState("");

  const language =
    prefs?.language || "en";

  const currency =
    prefs?.currency || "NGN";

  const t =
    translations[language];

  /* =========================================
     REALTIME PROFILE SYNC
  ========================================= */
  useEffect(() => {
    if (!user) return;

    if (
      user.name !== profile?.name
    ) {
      updateField(
        "name",
        user.name || ""
      );
    }

    if (
      user.email !== profile?.email
    ) {
      updateField(
        "email",
        user.email || ""
      );
    }
  }, [user]);

  /* =========================================
     SAFE STATE
  ========================================= */
  const isSavingDisabled =
    useMemo(() => {
      return (
        loading ||
        !profile?.name?.trim() ||
        !profile?.email?.trim()
      );
    }, [loading, profile]);

  const initials =
    useMemo(() => {
      if (!profile?.name)
        return "SB";

      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }, [profile]);

  /* =========================================
     SUBMIT
  ========================================= */
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      await saveProfile();
    };

  /* =========================================
     LOADING
  ========================================= */
  if (!profile) {
    return (
      <div
        className="
          flex items-center justify-center
          py-24
        "
      >

        <div
          className="
            flex items-center
            px-6 py-4
            text-slate-300
            bg-slate-900
            rounded-2xl border border-slate-800
            gap-3
          "
        >
          <Loader2
            className="
              animate-spin
            "
            size={18}
          /
          >

          <span>
            {t.connecting}
          </span>
        </div>

      </div>
    );
  }

  return (
    <div
      className="
        space-y-8
      "
    >

      {/* =========================================
         HERO SECTION
      ========================================= */}
      <motion
        .div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative overflow-hidden
          p-8
          bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950
          rounded-[32px] border border-slate-800
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        "
      >

        {/* BACKGROUND */}
        <div
          className="
            absolute right-0
            h-72 w-72
            bg-cyan-500/10
            rounded-full
            blur-3xl
            -top-20
          "
          /
        >

        <div
          className="
            absolute bottom-0 left-0
            h-56 w-56
            bg-emerald-500/10
            rounded-full
            blur-3xl
          "
          /
        >

        <div
          className="
            relative z-10 flex flex-col xl:flex-row xl:items-center
            xl:justify-between
            gap-8
          "
        >

          {/* LEFT */}
          <div
            className="
              flex flex-col md:flex-row md:items-center
              gap-6
            "
          >

            {/* AVATAR */}
            <div
              className="
                relative
              "
            >

              <motion
                .div
                whileHover={{
                  scale: 1.02,
                }}
                className="
                  overflow-hidden
                  h-24 w-24
                  bg-gradient-to-br from-slate-800 to-slate-900
                  rounded-3xl border border-white/10
                  shadow-2xl
                "
              >
                {preview ||
                profile.avatar ? (
                  <img
                    src={
                      preview ||
                      profile.avatar
                    }
                    alt="avatar"
                    className="
                      object-cover
                      h-full w-full
                    "
                    /
                  >
                ) : (
                  <div
                    className="
                      flex items-center justify-center
                      h-full w-full
                      text-2xl text-white font-bold
                    "
                  >
                    {initials}
                  </div>
                )}
              </motion.div>

              {/* CAMERA */}
              <label
                className="
                  absolute flex items-center justify-center
                  h-10 w-10
                  text-white
                  bg-black
                  rounded-2xl border border-white/10
                  shadow-lg transition
                  hover:scale-105
                  cursor-pointer
                  -bottom-2 -right-2
                "
              >
                <Camera size={16} />

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (
                      e.target.files?.[0]
                    ) {
                      setAvatar(
                        e.target
                          .files[0]
                      );
                    }
                  }}
                />
              </label>

            </div>

            {/* USER INFO */}
            <div
              className="
                space-y-3
              "
            >

              <div
                className="
                  flex items-center
                  gap-2
                "
              >

                <h2
                  className="
                    text-2xl text-white font-bold
                  "
                >
                  {profile?.name ||
                    "SmartBudget User"}
                </h2>

                <BadgeCheck
                  size={18}
                  className="
                    text-emerald-400
                  "
                  /
                >

              </div>

              <p
                className="
                  text-sm text-slate-400
                "
              >
                {profile?.email}
              </p>

              {/* LIVE PREFS */}
              <div
                className="
                  flex flex-wrap items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex items-center
                    px-3 py-1.5
                    text-xs text-cyan-400 font-semibold
                    bg-cyan-500/10
                    rounded-full border border-cyan-500/20
                    gap-2
                  "
                >
                  <Globe size={13} />

                  {t.language}:{" "}
                  <span
                    className="
                      capitalize
                    "
                  >
                    {language === "yo"
                      ? "Yorùbá"
                      : "English"}
                  </span>
                </div>

                <div
                  className="
                    flex items-center
                    px-3 py-1.5
                    text-xs text-emerald-400 font-semibold
                    bg-emerald-500/10
                    rounded-full border border-emerald-500/20
                    gap-2
                  "
                >
                  <Wallet size={13} />

                  {t.currency}:{" "}
                  {currency}
                </div>

                <div
                  className="
                    flex items-center
                    px-3 py-1.5
                    text-xs text-violet-400 font-semibold
                    bg-violet-500/10
                    rounded-full border border-violet-500/20
                    gap-2
                  "
                >
                  <BellRing size={13} />

                  {t.notifications}
                </div>

              </div>

              {/* SECURITY */}
              <div
                className="
                  flex flex-wrap items-center
                  pt-2
                  gap-3
                "
              >

                <div
                  className="
                    flex items-center
                    px-3 py-1.5
                    text-xs text-emerald-400 font-semibold
                    bg-emerald-500/10
                    rounded-full border border-emerald-500/20
                    gap-2
                  "
                >
                  <CheckCircle2
                    size={13}
                  />

                  {t.verified}
                </div>

                <div
                  className="
                    flex items-center
                    px-3 py-1.5
                    text-xs text-cyan-400 font-semibold
                    bg-cyan-500/10
                    rounded-full border border-cyan-500/20
                    gap-2
                  "
                >
                  <ShieldCheck
                    size={13}
                  />

                  {t.security}
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div
            className="
              p-5
              bg-white/[0.03]
              rounded-3xl border border-white/10
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex items-center
                gap-3
              "
            >

              <div
                className="
                  flex items-center justify-center
                  h-12 w-12
                  text-emerald-400
                  bg-emerald-500/10
                  rounded-2xl
                "
              >
                <Landmark size={22} />
              </div>

              <div>
                <p
                  className="
                    text-xs text-slate-500 uppercase tracking-widest
                  "
                >
                  {t.secureCore}
                </p>

                <h3
                  className="
                    text-lg text-white font-semibold
                  "
                >
                  {t.vault}
                </h3>
              </div>

            </div>

            {/* REALTIME STATUS */}
            <div
              className="
                grid grid-cols-2
                mt-5
                gap-4
              "
            >

              <div
                className="
                  p-4
                  bg-black/30
                  rounded-2xl
                "
              >
                <p
                  className="
                    text-xs text-slate-500
                  "
                >
                  {t.accountStatus}
                </p>

                <div
                  className="
                    flex items-center
                    mt-2
                    gap-2
                  "
                >
                  <span
                    className="
                      h-2 w-2
                      bg-emerald-400
                      rounded-full
                      animate-pulse
                    "
                    /
                  >

                  <p
                    className="
                      text-sm text-emerald-400 font-semibold
                    "
                  >
                    {t.active}
                  </p>
                </div>

              </div>

              <div
                className="
                  p-4
                  bg-black/30
                  rounded-2xl
                "
              >
                <p
                  className="
                    text-xs text-slate-500
                  "
                >
                  {t.securityLevel}
                </p>

                <p
                  className="
                    mt-1
                    text-sm text-cyan-400 font-semibold
                  "
                >
                  Tier IV
                </p>
              </div>

            </div>

          </div>

        </div>

      </motion.div>

      {/* =========================================
         FORM CARD
      ========================================= */}
      <motion
        .div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="
          bg-[#020617]
          rounded-[32px] border border-slate-800
          shadow-[0_20px_60px_rgba(0,0,0,0.35)]
        "
      >

        {/* HEADER */}
        <div
          className="
            p-6
            border-b border-slate-800
          "
        >

          <div
            className="
              flex items-center
              gap-3
            "
          >

            <div
              className="
                p-3
                text-emerald-400
                bg-emerald-500/10
                rounded-2xl
              "
            >
              <Sparkles size={18} />
            </div>

            <div>
              <h3
                className="
                  text-lg text-white font-semibold
                "
              >
                {t.personalInfo}
              </h3>

              <p
                className="
                  mt-1
                  text-sm text-slate-400
                "
              >
                {t.syncDesc}
              </p>
            </div>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            space-y-6 p-6
          "
        >

          {/* NAME */}
          <div
            className="
              space-y-2
            "
          >

            <label
              className="
                flex items-center
                text-xs text-slate-500 font-medium uppercase tracking-wider
                gap-2
              "
            >
              <User size={14} />
              {t.fullName}
            </label>

            <div
              className={`
                rounded-2xl border
                bg-slate-950
                transition-all
                ${
                  focused === "name"
                    ? `
                      border-emerald-500
                      shadow-[0_0_0_4px_rgba(16,185,129,0.08)]
                    `
                    : "border-slate-800"
                }
              `}
            >

              <input
                value={
                  profile.name || ""
                }
                onFocus={() =>
                  setFocused("name")
                }
                onBlur={() =>
                  setFocused("")
                }
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                className="
                  w-full bg-transparent
                  px-5 py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                "
                placeholder={
                  t.enterName
                }
              />

            </div>

          </div>

          {/* EMAIL */}
          <div
            className="
              space-y-2
            "
          >

            <label
              className="
                flex items-center
                text-xs text-slate-500 font-medium uppercase tracking-wider
                gap-2
              "
            >
              <Mail size={14} />
              {t.email}
            </label>

            <div
              className={`
                rounded-2xl border
                bg-slate-950
                transition-all
                ${
                  focused ===
                  "email"
                    ? `
                      border-cyan-500
                      shadow-[0_0_0_4px_rgba(6,182,212,0.08)]
                    `
                    : "border-slate-800"
                }
              `}
            >

              <input
                type="email"
                value={
                  profile.email || ""
                }
                onFocus={() =>
                  setFocused("email")
                }
                onBlur={() =>
                  setFocused("")
                }
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                className="
                  w-full bg-transparent
                  px-5 py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                "
                placeholder={
                  t.enterEmail
                }
              />

            </div>

          </div>

          {/* NOTICE */}
          <div
            className="
              flex items-start
              p-4
              bg-amber-500/5
              rounded-2xl border border-amber-500/10
              gap-3
            "
          >

            <ShieldCheck
              size={18}
              className="
                mt-0.5
                text-amber-400
              "
              /
            >

            <div>

              <p
                className="
                  text-sm text-amber-300 font-semibold
                "
              >
                {t.secureProfile}
              </p>

              <p
                className="
                  mt-1
                  text-xs text-slate-400 leading-relaxed
                "
              >
                {t.secureDesc}
              </p>

            </div>

          </div>

          {/* ACTIONS */}
          <div
            className="
              flex flex-col md:flex-row md:items-center md:justify-between
              pt-2
              gap-4
            "
          >

            {/* STATUS */}
            <AnimatePresence mode="wait">

              <motion
                .div
                key={
                  message ||
                  "default"
                }
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="
                  text-sm
                "
              >
                {message ? (
                  <div
                    className="
                      flex items-center
                      text-emerald-400
                      gap-2
                    "
                  >
                    <CheckCircle2
                      size={16}
                    />

                    {message}
                  </div>
                ) : (
                  <div
                    className="
                      flex items-center
                      text-slate-500
                      gap-2
                    "
                  >
                    <Upload size={15} />

                    {t.ready}
                  </div>
                )}
              </motion.div>

            </AnimatePresence>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={
                isSavingDisabled
              }
              className="
                relative overflow-hidden
                px-7 py-4
                text-sm text-black font-semibold
                bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400
                rounded-2xl
                shadow-[0_10px_40px_rgba(45,212,191,0.25)] transition-all
                duration-300 disabled:opacity-40
                hover:scale-[1.02] active:scale-[0.98]
                disabled:cursor-not-allowed
                group
              "
            >

              <span
                className="
                  relative z-10 flex items-center
                  gap-2
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="
                        animate-spin
                      "
                      /
                    >

                    {t.syncing}
                  </>
                ) : (
                  <>
                    <ShieldCheck
                      size={16}
                    />

                    {t.save}
                  </>
                )}

              </span>

            </button>

          </div>

        </form>

      </motion.div>

      {/* =========================================
         FOOTER
      ========================================= */}
      <div
        className="
          p-6
          bg-gradient-to-r from-slate-950 to-slate-900
          rounded-[28px] border border-slate-800
        "
      >

        <div
          className="
            flex flex-col lg:flex-row lg:items-center lg:justify-between
            gap-5
          "
        >

          <div>

            <h3
              className="
                text-sm text-white font-semibold
              "
            >
              {t.infrastructure}
            </h3>

            <p
              className="
                mt-1
                text-sm text-slate-400
              "
            >
              {t.infrastructureDesc}
            </p>

          </div>

          <div
            className="
              grid grid-cols-2 md:grid-cols-4
              gap-4
            "
          >

            {[
              t.encrypted,
              t.verified,
              t.protected,
              t.synced,
            ].map((item) => (
              <div
                key={item}
                className="
                  px-4 py-3
                  text-center
                  bg-white/[0.03]
                  rounded-2xl border border-white/5
                "
              >

                <p
                  className="
                    text-xs text-slate-500
                  "
                >
                  Status
                </p>

                <p
                  className="
                    mt-1
                    text-sm text-emerald-400 font-semibold
                  "
                >
                  {item}
                </p>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfileSettings;