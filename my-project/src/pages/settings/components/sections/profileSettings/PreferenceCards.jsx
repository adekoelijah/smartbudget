// src/components/profile/PreferenceCards.jsx

import PropTypes from "prop-types";
import {
  Bell,
  ShieldCheck,
  Eye,
  Moon,
  Smartphone,
  Mail,
  ChevronRight,
} from "lucide-react";


const PreferenceCards = ({
  preferences,
  onToggle,
  onNavigate,
}) => {

  const preferenceItems = [
    {
      id: "notifications",
      title: "Notifications",
      description:
        "Receive updates about transactions, budgets and account activity.",
      icon: Bell,
      type: "toggle",
    },
    {
      id: "securityAlerts",
      title: "Security Alerts",
      description:
        "Get notified about suspicious login attempts and account changes.",
      icon: ShieldCheck,
      type: "toggle",
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      description:
        "Control how your personal information and data are managed.",
      icon: Eye,
      type: "navigate",
    },
    {
      id: "mobileAccess",
      title: "Mobile Access",
      description:
        "Manage devices connected to your SmartBudget account.",
      icon: Smartphone,
      type: "navigate",
    },
    {
      id: "emailPreferences",
      title: "Email Preferences",
      description:
        "Choose which financial reports and updates you receive.",
      icon: Mail,
      type: "navigate",
    },
  ];


  return (
    <section
      className="
        rounded-3xl
        bg-white/70
        backdrop-blur-xl
        border
        border-white/60
        shadow-[0_25px_70px_rgba(15,23,42,0.08)]
        p-6
        md:p-8
      "
    >

      {/* Header */}
      <div className="mb-7">
        <h2
          className="
            text-xl
            md:text-2xl
            font-semibold
            text-slate-900
          "
        >
          Preferences
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Customize how SmartBudget works for you.
        </p>
      </div>


      <div className="space-y-4">

        {preferenceItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="
                flex
                items-center
                justify-between
                gap-4
                p-4
                rounded-2xl
                bg-white/60
                border
                border-slate-100
              "
            >

              {/* Left Content */}
              <div
                className="
                  flex
                  items-center
                  gap-4
                  min-w-0
                "
              >

                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    bg-blue-50
                    text-blue-600
                    shrink-0
                  "
                >
                  <Icon className="w-5 h-5" />
                </div>


                <div className="min-w-0">

                  <h3
                    className="
                      font-medium
                      text-slate-900
                      text-sm
                      md:text-base
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      text-xs
                      md:text-sm
                      text-slate-500
                      mt-1
                      leading-relaxed
                    "
                  >
                    {item.description}
                  </p>

                </div>

              </div>



              {/* Action */}
              {item.type === "toggle" ? (
                <button
                  type="button"
                  onClick={() =>
                    onToggle(item.id)
                  }
                  className={`
                    relative
                    w-12
                    h-7
                    rounded-full
                    transition
                    shrink-0
                    ${
                      preferences[item.id]
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }
                  `}
                >

                  <span
                    className={`
                      absolute
                      top-1
                      w-5
                      h-5
                      rounded-full
                      bg-white
                      shadow
                      transition
                      ${
                        preferences[item.id]
                          ? "left-6"
                          : "left-1"
                      }
                    `}
                  />

                </button>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    onNavigate(item.id)
                  }
                  className="
                    w-9
                    h-9
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    hover:text-blue-600
                    hover:bg-blue-50
                    transition
                  "
                >
                  <ChevronRight
                    className="
                      w-5
                      h-5
                    "
                  />
                </button>

              )}

            </div>
          );
        })}

      </div>

    </section>
  );
};



PreferenceCards.propTypes = {
  preferences: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};


export default PreferenceCards;