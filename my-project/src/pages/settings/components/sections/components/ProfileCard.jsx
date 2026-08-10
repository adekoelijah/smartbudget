
import {
  Mail,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Pencil,
} from "lucide-react";

import VerificationBadge from "./VerificationBadge";

const ProfileCard = ({
  user,
  onEdit,
  loading = false,
}) => {
  /* =========================================
     USER DISPLAY DATA
  ========================================= */

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "SmartBudget User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberDate = user?.createdAt
    ? new Intl.DateTimeFormat("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(user.createdAt))
    : "Recently joined";

  /* =========================================
     HANDLERS
  ========================================= */

  const handleEdit = () => {
    if (loading) return;

    if (typeof onEdit === "function") {
      onEdit();
    } else {
      console.warn(
        "ProfileCard: onEdit handler was not provided."
      );
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <section
      className="
        overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* =========================================
          PROFILE HEADER
      ========================================= */}

      <div
        className="
          relative
          px-6 sm:px-8 py-8
          bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
        "
      >
        <div
          className="
            flex flex-col sm:flex-row justify-between items-center
            gap-6
          "
        >
          {/* =========================================
              AVATAR + USER INFO
          ========================================= */}

          <div
            className="
              flex items-center
              gap-4
            "
          >
            {/* AVATAR */}

            <div
              className="
                relative flex justify-center items-center overflow-hidden
                w-20 h-20
                font-bold text-white text-2xl
                bg-white/20
                border-4 border-white/30 rounded-2xl
                shadow-lg
                shrink-0
              "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={fullName}
                  className="
                    object-cover
                    w-full h-full
                  "
                  /
                >
              ) : (
                initials
              )}
            </div>

            {/* USER INFORMATION */}

            <div
              className="
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
                    font-bold text-white text-xl sm:text-2xl truncate
                  "
                >
                  {fullName}
                </h2>

                {user?.isEmailVerified && (
                  <VerificationBadge />
                )}
              </div>

              <p
                className="
                  mt-1
                  text-blue-100 text-sm truncate
                "
              >
                {user?.email || "No email address"}
              </p>

              {user?.role && (
                <span
                  className="
                    inline-flex
                    mt-2 px-3 py-1
                    font-medium text-white text-xs capitalize
                    bg-white/15
                    rounded-full
                  "
                >
                  {user.role}
                </span>
              )}
            </div>
          </div>

          {/* =========================================
              EDIT BUTTON
          ========================================= */}

          <button
            type="button"
            onClick={handleEdit}
            disabled={loading}
            aria-label="Edit profile"
            className="
              inline-flex justify-center items-center
              px-5 py-3
              font-semibold text-blue-700 text-sm
              bg-white hover:bg-blue-50
              rounded-2xl focus:outline-none
              focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700
              disabled:opacity-60 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <Pencil
              className="
                w-4 h-4
              "
              /
            >

            {loading ? "Opening..." : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* =========================================
          INFORMATION
      ========================================= */}

      <div
        className="
          grid sm:grid-cols-2
          p-6 sm:p-8
          gap-4
        "
      >
        <InfoItem
          icon={<Mail
          className="
            w-5 h-5
          "
          /
        >
        }
          title="Email"
          value={user?.email || "Not available"}
        />

        <InfoItem
          icon={<CalendarDays
          className="
            w-5 h-5
          "
          /
        >
        }
          title="Member Since"
          value={memberDate}
        />

        <InfoItem
          icon={<MapPin
          className="
            w-5 h-5
          "
          /
        >
        }
          title="Location"
          value={user?.country || "Nigeria"}
        />

        <InfoItem
          icon={<ShieldCheck
          className="
            w-5 h-5
          "
          /
        >
        }
          title="Security"
          value="Account Protected"
        />
      </div>
    </section>
  );
};

/* =========================================
   INFORMATION ITEM
========================================= */

function InfoItem({
  icon,
  title,
  value,
}) {
  return (
    <div
      className="
        flex items-start
        p-4
        bg-slate-50
        border border-slate-100 rounded-2xl
        gap-4
      "
    >
      <div
        className="
          flex justify-center items-center
          w-10 h-10
          text-blue-600
          bg-blue-100
          rounded-xl
          shrink-0
        "
      >
        {icon}
      </div>

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            font-medium text-slate-500 text-xs uppercase tracking-wide
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            font-semibold text-slate-800 text-sm break-words
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfileCard;
