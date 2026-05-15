


// import { useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   User,
//   Mail,
//   Upload,
//   Loader2,
//   ShieldCheck,
//   BadgeCheck,
//   Landmark,
//   Camera,
//   CheckCircle2,
// } from "lucide-react";

// import { useProfileSettings } from "../../hooks/useProfileSettings";

// const ProfileSettings = () => {
//   const {
//     profile,
//     preview,
//     loading,
//     message,
//     updateField,
//     setAvatar,
//     saveProfile,
//   } = useProfileSettings();

//   const [focused, setFocused] = useState("");

//   /* =========================
//      SAFE DERIVED STATE
//   ========================= */
//   const isSavingDisabled = useMemo(() => {
//     return (
//       loading ||
//       !profile?.name?.trim() ||
//       !profile?.email?.trim()
//     );
//   }, [loading, profile]);

//   const initials = useMemo(() => {
//     if (!profile?.name) return "SB";

//     return profile.name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase();
//   }, [profile]);

//   /* =========================
//      SUBMIT HANDLER
//   ========================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await saveProfile();
//   };

//   if (!profile) {
//     return (
//       <div className="flex items-center justify-center py-24">
//         <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 text-slate-300">
//           <Loader2 className="animate-spin" size={18} />
//           <span>Connecting to secure banking server...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">

//       {/* ================= HERO ================= */}
//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="
//           relative overflow-hidden rounded-[32px]
//           border border-slate-800
//           bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950
//           p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]
//         "
//       >

//         {/* BACKGROUND EFFECT */}
//         <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
//         <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

//         <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

//           {/* LEFT */}
//           <div className="flex items-center gap-5">

//             {/* AVATAR */}
//             <div className="relative">

//               <div
//                 className="
//                   h-24 w-24 overflow-hidden rounded-3xl
//                   border border-white/10
//                   bg-gradient-to-br from-slate-800 to-slate-900
//                   shadow-xl
//                 "
//               >
//                 {preview || profile.avatar ? (
//                   <img
//                     src={preview || profile.avatar}
//                     alt="avatar"
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
//                     {initials}
//                   </div>
//                 )}
//               </div>

//               <label
//                 className="
//                   absolute -bottom-2 -right-2
//                   flex h-10 w-10 cursor-pointer items-center justify-center
//                   rounded-2xl border border-white/10
//                   bg-black text-white shadow-lg
//                   transition hover:scale-105
//                 "
//               >
//                 <Camera size={16} />

//                 <input
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   onChange={(e) => {
//                     if (e.target.files?.[0]) {
//                       setAvatar(e.target.files[0]);
//                     }
//                   }}
//                 />
//               </label>

//             </div>

//             {/* USER INFO */}
//             <div className="space-y-2">

//               <div className="flex items-center gap-2">
//                 <h2 className="text-2xl font-bold text-white">
//                   {profile?.name || "Bank User"}
//                 </h2>

//                 <BadgeCheck
//                   size={18}
//                   className="text-emerald-400"
//                 />
//               </div>

//               <p className="text-sm text-slate-400">
//                 {profile?.email}
//               </p>

//               <div className="flex flex-wrap items-center gap-3 pt-2">

//                 <div
//                   className="
//                     flex items-center gap-2 rounded-full
//                     border border-emerald-500/20
//                     bg-emerald-500/10
//                     px-3 py-1.5
//                     text-xs font-semibold text-emerald-400
//                   "
//                 >
//                   <CheckCircle2 size={13} />
//                   KYC Verified
//                 </div>

//                 <div
//                   className="
//                     flex items-center gap-2 rounded-full
//                     border border-cyan-500/20
//                     bg-cyan-500/10
//                     px-3 py-1.5
//                     text-xs font-semibold text-cyan-400
//                   "
//                 >
//                   <ShieldCheck size={13} />
//                   Bank-Level Security
//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* RIGHT */}
//           <div
//             className="
//               rounded-3xl border border-white/10
//               bg-white/[0.03]
//               p-5 backdrop-blur-xl
//             "
//           >

//             <div className="flex items-center gap-3">

//               <div
//                 className="
//                   flex h-12 w-12 items-center justify-center
//                   rounded-2xl bg-emerald-500/10 text-emerald-400
//                 "
//               >
//                 <Landmark size={22} />
//               </div>

//               <div>
//                 <p className="text-xs uppercase tracking-widest text-slate-500">
//                   SmartBudget Secure Core
//                 </p>

//                 <h3 className="text-lg font-semibold text-white">
//                   Financial Identity Vault
//                 </h3>
//               </div>

//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-4">

//               <div className="rounded-2xl bg-black/30 p-4">
//                 <p className="text-xs text-slate-500">
//                   Account Status
//                 </p>

//                 <p className="mt-1 text-sm font-semibold text-emerald-400">
//                   Active
//                 </p>
//               </div>

//               <div className="rounded-2xl bg-black/30 p-4">
//                 <p className="text-xs text-slate-500">
//                   Security Level
//                 </p>

//                 <p className="mt-1 text-sm font-semibold text-cyan-400">
//                   Tier IV
//                 </p>
//               </div>

//             </div>

//           </div>

//         </div>

//       </motion.div>

//       {/* ================= FORM CARD ================= */}
//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.05 }}
//         className="
//           rounded-[32px]
//           border border-slate-800
//           bg-[#020617]
//           shadow-[0_20px_60px_rgba(0,0,0,0.35)]
//         "
//       >

//         {/* HEADER */}
//         <div className="border-b border-slate-800 p-6">

//           <h3 className="text-lg font-semibold text-white">
//             Personal Information
//           </h3>

//           <p className="mt-1 text-sm text-slate-400">
//             Real-time profile synchronization with banking infrastructure
//           </p>

//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="space-y-6 p-6">

//           {/* NAME */}
//           <div className="space-y-2">

//             <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
//               <User size={14} />
//               Full Name
//             </label>

//             <div
//               className={`
//                 rounded-2xl border bg-slate-950 transition-all
//                 ${
//                   focused === "name"
//                     ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
//                     : "border-slate-800"
//                 }
//               `}
//             >
//               <input
//                 value={profile.name || ""}
//                 onFocus={() => setFocused("name")}
//                 onBlur={() => setFocused("")}
//                 onChange={(e) =>
//                   updateField("name", e.target.value)
//                 }
//                 className="
//                   w-full bg-transparent px-5 py-4
//                   text-white outline-none placeholder:text-slate-600
//                 "
//                 placeholder="Enter your full legal name"
//               />
//             </div>

//           </div>

//           {/* EMAIL */}
//           <div className="space-y-2">

//             <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
//               <Mail size={14} />
//               Email Address
//             </label>

//             <div
//               className={`
//                 rounded-2xl border bg-slate-950 transition-all
//                 ${
//                   focused === "email"
//                     ? "border-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
//                     : "border-slate-800"
//                 }
//               `}
//             >
//               <input
//                 type="email"
//                 value={profile.email || ""}
//                 onFocus={() => setFocused("email")}
//                 onBlur={() => setFocused("")}
//                 onChange={(e) =>
//                   updateField("email", e.target.value)
//                 }
//                 className="
//                   w-full bg-transparent px-5 py-4
//                   text-white outline-none placeholder:text-slate-600
//                 "
//                 placeholder="Enter secure email address"
//               />
//             </div>

//           </div>

//           {/* SECURITY NOTICE */}
//           <div
//             className="
//               flex items-start gap-3 rounded-2xl
//               border border-amber-500/10
//               bg-amber-500/5 p-4
//             "
//           >
//             <ShieldCheck
//               size={18}
//               className="mt-0.5 text-amber-400"
//             />

//             <div>
//               <p className="text-sm font-semibold text-amber-300">
//                 Secure Financial Profile
//               </p>

//               <p className="mt-1 text-xs leading-relaxed text-slate-400">
//                 All profile updates are encrypted and synchronized
//                 securely with your SmartBudget banking identity
//                 infrastructure in real-time.
//               </p>
//             </div>

//           </div>

//           {/* ACTIONS */}
//           <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">

//             {/* STATUS */}
//             <div className="text-sm">

//               {message ? (
//                 <div className="flex items-center gap-2 text-emerald-400">
//                   <CheckCircle2 size={16} />
//                   {message}
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2 text-slate-500">
//                   <Upload size={15} />
//                   Ready for secure synchronization
//                 </div>
//               )}

//             </div>

//             {/* BUTTON */}
//             <button
//               type="submit"
//               disabled={isSavingDisabled}
//               className="
//                 group relative overflow-hidden
//                 rounded-2xl px-7 py-4
//                 text-sm font-semibold text-black
//                 transition-all duration-300
//                 disabled:cursor-not-allowed disabled:opacity-40
//                 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400
//                 hover:scale-[1.02]
//                 active:scale-[0.98]
//                 shadow-[0_10px_40px_rgba(45,212,191,0.25)]
//               "
//             >

//               <span className="relative z-10 flex items-center gap-2">

//                 {loading ? (
//                   <>
//                     <Loader2
//                       size={16}
//                       className="animate-spin"
//                     />
//                     Syncing Securely...
//                   </>
//                 ) : (
//                   <>
//                     <ShieldCheck size={16} />
//                     Save & Sync Profile
//                   </>
//                 )}

//               </span>

//             </button>

//           </div>

//         </form>

//       </motion.div>

//       {/* ================= SECURITY FOOTER ================= */}
//       <div
//         className="
//           rounded-[28px]
//           border border-slate-800
//           bg-gradient-to-r from-slate-950 to-slate-900
//           p-6
//         "
//       >

//         <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//           <div>
//             <h3 className="text-sm font-semibold text-white">
//               Banking Security Infrastructure
//             </h3>

//             <p className="mt-1 text-sm text-slate-400">
//               AES-256 encryption • Real-time sync • Device protection
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

//             {[
//               "Encrypted",
//               "Verified",
//               "Protected",
//               "Synced",
//             ].map((item) => (
//               <div
//                 key={item}
//                 className="
//                   rounded-2xl border border-white/5
//                   bg-white/[0.03]
//                   px-4 py-3 text-center
//                 "
//               >
//                 <p className="text-xs text-slate-500">
//                   Status
//                 </p>

//                 <p className="mt-1 text-sm font-semibold text-emerald-400">
//                   {item}
//                 </p>
//               </div>
//             ))}

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default ProfileSettings;


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
      <div className="flex items-center justify-center py-24">

        <div
          className="
            flex items-center gap-3
            rounded-2xl
            border border-slate-800
            bg-slate-900
            px-6 py-4
            text-slate-300
          "
        >
          <Loader2
            className="animate-spin"
            size={18}
          />

          <span>
            {t.connecting}
          </span>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =========================================
         HERO SECTION
      ========================================= */}
      <motion.div
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
          rounded-[32px]
          border border-slate-800
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-indigo-950
          p-8
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        "
      >

        {/* BACKGROUND */}
        <div
          className="
            absolute -top-20 right-0
            h-72 w-72
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute bottom-0 left-0
            h-56 w-56
            rounded-full
            bg-emerald-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative z-10
            flex flex-col gap-8
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* LEFT */}
          <div
            className="
              flex flex-col gap-6
              md:flex-row md:items-center
            "
          >

            {/* AVATAR */}
            <div className="relative">

              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                className="
                  h-24 w-24 overflow-hidden
                  rounded-3xl
                  border border-white/10
                  bg-gradient-to-br
                  from-slate-800
                  to-slate-900
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
                      h-full w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-full w-full
                      items-center justify-center
                      text-2xl font-bold
                      text-white
                    "
                  >
                    {initials}
                  </div>
                )}
              </motion.div>

              {/* CAMERA */}
              <label
                className="
                  absolute -bottom-2 -right-2
                  flex h-10 w-10
                  cursor-pointer
                  items-center justify-center
                  rounded-2xl
                  border border-white/10
                  bg-black text-white
                  shadow-lg
                  transition
                  hover:scale-105
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
            <div className="space-y-3">

              <div className="flex items-center gap-2">

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-white
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
                />

              </div>

              <p className="text-sm text-slate-400">
                {profile?.email}
              </p>

              {/* LIVE PREFS */}
              <div
                className="
                  flex flex-wrap
                  items-center gap-3
                "
              >

                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-cyan-500/20
                    bg-cyan-500/10
                    px-3 py-1.5
                    text-xs font-semibold
                    text-cyan-400
                  "
                >
                  <Globe size={13} />

                  {t.language}:{" "}
                  <span className="capitalize">
                    {language === "yo"
                      ? "Yorùbá"
                      : "English"}
                  </span>
                </div>

                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-emerald-500/20
                    bg-emerald-500/10
                    px-3 py-1.5
                    text-xs font-semibold
                    text-emerald-400
                  "
                >
                  <Wallet size={13} />

                  {t.currency}:{" "}
                  {currency}
                </div>

                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-violet-500/20
                    bg-violet-500/10
                    px-3 py-1.5
                    text-xs font-semibold
                    text-violet-400
                  "
                >
                  <BellRing size={13} />

                  {t.notifications}
                </div>

              </div>

              {/* SECURITY */}
              <div
                className="
                  flex flex-wrap
                  items-center gap-3
                  pt-2
                "
              >

                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-emerald-500/20
                    bg-emerald-500/10
                    px-3 py-1.5
                    text-xs font-semibold
                    text-emerald-400
                  "
                >
                  <CheckCircle2
                    size={13}
                  />

                  {t.verified}
                </div>

                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-cyan-500/20
                    bg-cyan-500/10
                    px-3 py-1.5
                    text-xs font-semibold
                    text-cyan-400
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
              rounded-3xl
              border border-white/10
              bg-white/[0.03]
              p-5
              backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-emerald-500/10
                  text-emerald-400
                "
              >
                <Landmark size={22} />
              </div>

              <div>
                <p
                  className="
                    text-xs uppercase
                    tracking-widest
                    text-slate-500
                  "
                >
                  {t.secureCore}
                </p>

                <h3
                  className="
                    text-lg font-semibold
                    text-white
                  "
                >
                  {t.vault}
                </h3>
              </div>

            </div>

            {/* REALTIME STATUS */}
            <div
              className="
                mt-5 grid
                grid-cols-2 gap-4
              "
            >

              <div
                className="
                  rounded-2xl
                  bg-black/30 p-4
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
                    mt-2 flex
                    items-center gap-2
                  "
                >
                  <span
                    className="
                      h-2 w-2
                      rounded-full
                      bg-emerald-400
                      animate-pulse
                    "
                  />

                  <p
                    className="
                      text-sm font-semibold
                      text-emerald-400
                    "
                  >
                    {t.active}
                  </p>
                </div>

              </div>

              <div
                className="
                  rounded-2xl
                  bg-black/30 p-4
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
                    mt-1 text-sm
                    font-semibold
                    text-cyan-400
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
      <motion.div
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
          rounded-[32px]
          border border-slate-800
          bg-[#020617]
          shadow-[0_20px_60px_rgba(0,0,0,0.35)]
        "
      >

        {/* HEADER */}
        <div
          className="
            border-b border-slate-800
            p-6
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                rounded-2xl
                bg-emerald-500/10
                p-3
                text-emerald-400
              "
            >
              <Sparkles size={18} />
            </div>

            <div>
              <h3
                className="
                  text-lg font-semibold
                  text-white
                "
              >
                {t.personalInfo}
              </h3>

              <p
                className="
                  mt-1 text-sm
                  text-slate-400
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
          className="space-y-6 p-6"
        >

          {/* NAME */}
          <div className="space-y-2">

            <label
              className="
                flex items-center gap-2
                text-xs font-medium
                uppercase tracking-wider
                text-slate-500
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
          <div className="space-y-2">

            <label
              className="
                flex items-center gap-2
                text-xs font-medium
                uppercase tracking-wider
                text-slate-500
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
              flex items-start gap-3
              rounded-2xl
              border border-amber-500/10
              bg-amber-500/5
              p-4
            "
          >

            <ShieldCheck
              size={18}
              className="
                mt-0.5 text-amber-400
              "
            />

            <div>

              <p
                className="
                  text-sm font-semibold
                  text-amber-300
                "
              >
                {t.secureProfile}
              </p>

              <p
                className="
                  mt-1 text-xs
                  leading-relaxed
                  text-slate-400
                "
              >
                {t.secureDesc}
              </p>

            </div>

          </div>

          {/* ACTIONS */}
          <div
            className="
              flex flex-col gap-4
              pt-2
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            {/* STATUS */}
            <AnimatePresence mode="wait">

              <motion.div
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
                className="text-sm"
              >
                {message ? (
                  <div
                    className="
                      flex items-center
                      gap-2
                      text-emerald-400
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
                      gap-2
                      text-slate-500
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
                group relative
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-emerald-400
                via-cyan-400
                to-teal-400
                px-7 py-4
                text-sm font-semibold
                text-black
                shadow-[0_10px_40px_rgba(45,212,191,0.25)]
                transition-all duration-300
                hover:scale-[1.02]
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <span
                className="
                  relative z-10
                  flex items-center gap-2
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="
                        animate-spin
                      "
                    />

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
          rounded-[28px]
          border border-slate-800
          bg-gradient-to-r
          from-slate-950
          to-slate-900
          p-6
        "
      >

        <div
          className="
            flex flex-col gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <h3
              className="
                text-sm font-semibold
                text-white
              "
            >
              {t.infrastructure}
            </h3>

            <p
              className="
                mt-1 text-sm
                text-slate-400
              "
            >
              {t.infrastructureDesc}
            </p>

          </div>

          <div
            className="
              grid grid-cols-2 gap-4
              md:grid-cols-4
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
                  rounded-2xl
                  border border-white/5
                  bg-white/[0.03]
                  px-4 py-3
                  text-center
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
                    mt-1 text-sm
                    font-semibold
                    text-emerald-400
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