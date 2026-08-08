
import {
  memo,
  useMemo,
} from "react";

import {
  Activity,
  Bell,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Wifi,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import { motion } from "framer-motion";

import { useUser } from "../../../hooks/useUser";

/*
============================================================
SECTION CONFIGURATION
============================================================
*/

const SECTION_CONFIG = {
  profile: {
    title: "Profile Settings",
    description:
      "Manage your identity, personal information, and account details.",
    icon: User,
  },

  security: {
    title: "Security Center",
    description:
      "Protect your account with authentication and session controls.",
    icon: ShieldCheck,
  },

  notifications: {
    title: "Notification Settings",
    description:
      "Control alerts, financial updates, and account communication.",
    icon: Bell,
  },

  preferences: {
    title: "Preferences",
    description:
      "Customize your SmartBudget experience and application settings.",
    icon: SlidersHorizontal,
  },

  billing: {
    title: "Billing & Subscription",
    description:
      "Manage your plan, payments, and subscription settings.",
    icon: CreditCard,
  },
};

/*
============================================================
SETTINGS HEADER
============================================================
*/

const SettingsHeader = () => {
  const location = useLocation();

  /*
  ============================================================
  USER STATE
  ============================================================
  */

  const {
    user,
    loading,
  } = useUser();

  /*
  ============================================================
  CURRENT SECTION
  ============================================================
  */

  const sectionKey = useMemo(() => {
    const segments = location.pathname
      .split("/")
      .filter(Boolean);

    return (
      segments[segments.length - 1] ||
      "profile"
    );
  }, [location.pathname]);

  const section =
    SECTION_CONFIG[sectionKey] ||
    SECTION_CONFIG.profile;

  const SectionIcon = section.icon;

  /*
  ============================================================
  USER NAME
  ============================================================
  */

  const fullName = useMemo(() => {
    const firstName =
      user?.firstName?.trim() || "";

    const lastName =
      user?.lastName?.trim() || "";

    const name = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      name ||
      user?.name?.trim() ||
      "SmartBudget User"
    );
  }, [
    user?.firstName,
    user?.lastName,
    user?.name,
  ]);

  /*
  ============================================================
  INITIALS
  ============================================================
  */

  const initials = useMemo(() => {
    const words = fullName
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return "SB";
    }

    return words
      .slice(0, 2)
      .map(
        (word) =>
          word.charAt(0)
      )
      .join("")
      .toUpperCase();
  }, [fullName]);

  /*
  ============================================================
  AVATAR
  ============================================================
  */

  const avatarUrl =
    typeof user?.avatar === "string"
      ? user.avatar.trim()
      : "";

  /*
  ============================================================
  EMAIL
  ============================================================
  */

  const email =
    typeof user?.email === "string"
      ? user.email.trim()
      : "";

  /*
  ============================================================
  EMAIL VERIFICATION
  ============================================================
  */

  const emailVerified =
    Boolean(
      user?.emailVerified ??
        user?.isEmailVerified
    );

  /*
  ============================================================
  SECURITY SCORE
  ============================================================
  */

  const securityScore = useMemo(() => {
    let score = 40;

    if (
      user?.emailVerified ||
      user?.isEmailVerified
    ) {
      score += 20;
    }

    if (user?.phoneVerified) {
      score += 15;
    }

    if (
      user?.twoFactorEnabled ||
      user?.twoFactor?.enabled
    ) {
      score += 25;
    }

    return Math.min(
      score,
      100
    );
  }, [
    user?.emailVerified,
    user?.isEmailVerified,
    user?.phoneVerified,
    user?.twoFactorEnabled,
    user?.twoFactor?.enabled,
  ]);

  /*
  ============================================================
  SECURITY LABEL
  ============================================================
  */

  const securityLabel = useMemo(() => {
    if (securityScore >= 90) {
      return "Excellent";
    }

    if (securityScore >= 70) {
      return "Strong";
    }

    if (securityScore >= 50) {
      return "Moderate";
    }

    return "Needs attention";
  }, [securityScore]);

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <motion
      .section
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        relative overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* BLUE ACCENT */}

      <div
        className="
          top-0 absolute inset-x-0
          h-1
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500
        "
        aria-hidden="true"
      /
      >

      {/* MAIN CONTENT */}

      <div
        className="
          p-4 sm:p-5 lg:p-6
        "
      >

        {/* MODULE HEADER */}

        <div
          className="
            flex items-start
            gap-3 sm:gap-4
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 sm:w-12 h-11 sm:h-12
              text-blue-600
              bg-blue-50
              border border-blue-100 rounded-2xl
              shrink-0
            "
          >
            <SectionIcon
              size={22}
              aria-hidden="true"
            />
          </div>

          <div
            className="
              flex-1
              min-w-0
            "
          >

            <div
              className="
                flex flex-wrap items-center
                gap-2
              "
            >
              <h1
                className="
                  font-bold text-slate-900 text-lg sm:text-xl lg:text-2xl
                  leading-tight
                "
              >
                {section.title}
              </h1>

              <span
                className="
                  inline-flex items-center
                  px-2 py-1
                  font-medium text-[11px] text-emerald-700 whitespace-nowrap
                  bg-emerald-50
                  border border-emerald-100 rounded-full
                  gap-1
                "
              >
                <CheckCircle2
                  size={12}
                  aria-hidden="true"
                />

                Active
              </span>
            </div>

            <p
              className="
                max-w-3xl
                mt-1.5
                text-slate-500 text-sm leading-relaxed
              "
            >
              {section.description}
            </p>
          </div>
        </div>

        {/* DIVIDER */}

        <div
          className="
            h-px
            my-5 sm:my-6
            bg-slate-100
          "
          /
        >

        {/* USER + SECURITY */}

        <div
          className="
            grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]
            gap-4 lg:gap-6
          "
        >

          {/* USER PROFILE */}

          <div
            className="
              flex items-center
              min-w-0
              p-4
              bg-slate-50
              border border-slate-200 rounded-2xl
              gap-3 sm:gap-4
            "
          >

            {/* AVATAR */}

            <div
              className="
                relative
                w-14 sm:w-16 h-14 sm:h-16
                shrink-0
              "
            >
              <div
                className="
                  flex justify-center items-center overflow-hidden
                  w-full h-full
                  text-white
                  bg-gradient-to-br from-blue-600 to-indigo-700
                  border-2 border-white rounded-2xl
                  shadow-sm
                "
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${fullName}'s profile`}
                    className="
                      object-cover
                      w-full h-full
                    "
                    loading="eager"
                  /
                  >
                ) : (
                  <span
                    className="
                      font-bold text-lg sm:text-xl tracking-wide
                    "
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                )}
              </div>

              {/* ONLINE INDICATOR */}

              <span
                className="
                  right-0 bottom-0 absolute
                  w-3.5 h-3.5
                  bg-emerald-500
                  border-2 border-white rounded-full
                "
                title="Account active"
                aria-label="Account active"
              /
              >
            </div>

            {/* USER INFORMATION */}

            <div
              className="
                flex-1
                min-w-0
              "
            >
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <h2
                  className="
                    max-w-full
                    font-bold text-slate-900 text-base sm:text-lg truncate
                  "
                  title={fullName}
                >
                  {loading
                    ? "Loading profile..."
                    : fullName}
                </h2>

                {emailVerified && (
                  <span
                    className="
                      inline-flex items-center
                      px-2 py-0.5
                      font-medium text-[10px] text-emerald-700 sm:text-[11px]
                      whitespace-nowrap
                      bg-emerald-50
                      border border-emerald-100 rounded-full
                      gap-1
                    "
                  >
                    <CheckCircle2
                      size={11}
                      aria-hidden="true"
                    />

                    Verified
                  </span>
                )}
              </div>

              <p
                className="
                  mt-1
                  text-slate-500 text-xs sm:text-sm truncate
                "
                title={
                  email ||
                  "No email connected"
                }
              >
                {email ||
                  "No email connected"}
              </p>

              <div
                className="
                  flex flex-wrap items-center
                  mt-2
                  gap-2
                "
              >
                <StatusPill
                  icon={Wifi}
                  text="Live Sync"
                />

                <StatusPill
                  icon={Activity}
                  text="System Healthy"
                />
              </div>
            </div>
          </div>

          {/* SECURITY SCORE */}

          <div
            className="
              p-4
              bg-blue-50/60
              border border-blue-100 rounded-2xl
            "
          >
            <div
              className="
                flex justify-between items-start
                gap-4
              "
            >
              <div>
                <p
                  className="
                    font-medium text-slate-500 text-xs
                  "
                >
                  Security Score
                </p>

                <div
                  className="
                    flex items-baseline
                    mt-1
                    gap-1.5
                  "
                >
                  <span
                    className="
                      font-bold text-slate-900 text-2xl
                    "
                  >
                    {securityScore}%
                  </span>

                  <span
                    className="
                      text-slate-500 text-xs
                    "
                  >
                    {securityLabel}
                  </span>
                </div>
              </div>

              <div
                className="
                  flex justify-center items-center
                  w-10 h-10
                  text-blue-600
                  bg-white
                  border border-blue-100 rounded-xl
                  shadow-sm
                "
              >
                <ShieldCheck
                  size={21}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* PROGRESS BAR */}

            <div
              className="
                overflow-hidden
                w-full h-2
                mt-4
                bg-blue-100
                rounded-full
              "
              role="progressbar"
              aria-valuenow={securityScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Account security score"
            >
              <div
                className="
                  h-full
                  bg-blue-600
                  rounded-full
                  transition-all duration-500 ease-out
                "
                style={{
                  width: `${securityScore}%`,
                }}
              /
              >
            </div>

            <div
              className="
                flex items-center
                mt-3
                text-xs
                gap-2
              "
            >
              <ShieldCheck
                size={14}
                className="
                  text-emerald-600
                "
                aria-hidden="true"
              /
              >

              <span
                className="
                  text-slate-600
                "
              >
                {securityScore >= 70
                  ? "Your account has strong protection."
                  : "Complete security steps to improve protection."}
              </span>
            </div>
          </div>
        </div>

        {/* SECURITY FOOTER */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-4 p-3 sm:p-4
            bg-slate-50
            border border-slate-200 rounded-2xl
            gap-3
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-emerald-600
                bg-emerald-50
                border border-emerald-100 rounded-xl
                shrink-0
              "
            >
              <LockKeyhole
                size={17}
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-semibold text-slate-800 text-xs sm:text-sm
                "
              >
                Secure Financial Workspace
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px] text-slate-500 sm:text-xs
                "
              >
                Your account settings are protected
                and synchronized securely.
              </p>
            </div>
          </div>

          <div
            className="
              flex items-center
              font-medium text-emerald-700 text-xs whitespace-nowrap
              gap-1.5
            "
          >
            <CheckCircle2
              size={14}
              aria-hidden="true"
            />

            Protection Active
          </div>
        </div>
      </div>
    </motion.section>
  );
};

/*
============================================================
STATUS PILL
============================================================
*/

const StatusPill = ({
  icon: Icon,
  text,
}) => {
  return (
    <span
      className="
        inline-flex items-center
        px-2 py-1
        font-medium text-[10px] text-slate-600 sm:text-[11px] whitespace-nowrap
        bg-white
        border border-slate-200 rounded-lg
        gap-1.5
      "
    >
      <Icon
        size={12}
        className="
          text-emerald-600
        "
        aria-hidden="true"
      /
      >

      {text}
    </span>
  );
};

export default memo(SettingsHeader);
