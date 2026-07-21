// src/components/profile/SecurityCenter.jsx

import PropTypes from "prop-types";
import {
  ShieldCheck,
  LockKeyhole,
  Smartphone,
  Activity,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";


const SecurityCenter = ({
  securityData,
  onAction,
  onLogout,
}) => {

  const securityItems = [
    {
      id: "password",
      title: "Password Security",
      description:
        "Keep your account protected with a strong password.",
      icon: LockKeyhole,
      status: securityData.passwordStatus || "Strong",
      action: "Change Password",
    },
    {
      id: "twoFactor",
      title: "Two-Factor Authentication",
      description:
        "Add an extra verification layer to your account.",
      icon: ShieldCheck,
      status: securityData.twoFactorEnabled
        ? "Enabled"
        : "Not Enabled",
      action: securityData.twoFactorEnabled
        ? "Manage"
        : "Enable",
    },
    {
      id: "devices",
      title: "Connected Devices",
      description:
        "Review devices that have access to your account.",
      icon: Smartphone,
      status: `${securityData.deviceCount || 0} Devices`,
      action: "Review",
    },
    {
      id: "activity",
      title: "Login Activity",
      description:
        "Monitor recent account access and sessions.",
      icon: Activity,
      status: "Protected",
      action: "View Activity",
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
      <div
        className="
          flex
          justify-between
          items-start
          gap-4
          mb-8
        "
      >

        <div>
          <h2
            className="
              text-xl
              md:text-2xl
              font-semibold
              text-slate-900
            "
          >
            Security Center
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Manage your account protection and access controls.
          </p>
        </div>


        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-blue-50
            flex
            items-center
            justify-center
            text-blue-600
          "
        >
          <ShieldCheck className="w-6 h-6" />
        </div>

      </div>



      {/* Security Status */}
      <div
        className="
          mb-6
          rounded-2xl
          bg-blue-50/70
          border
          border-blue-100
          p-5
          flex
          items-center
          justify-between
        "
      >

        <div>
          <p className="text-sm text-slate-600">
            Security Status
          </p>

          <h3
            className="
              mt-1
              font-semibold
              text-slate-900
            "
          >
            Account Protected
          </h3>
        </div>


        <CheckCircle2
          className="
            w-8
            h-8
            text-blue-600
          "
        />

      </div>



      {/* Security Options */}
      <div className="space-y-4">

        {securityItems.map((item) => {

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

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                    text-slate-700
                  "
                >
                  <Icon className="w-5 h-5" />
                </div>


                <div>

                  <h4
                    className="
                      font-medium
                      text-slate-900
                    "
                  >
                    {item.title}
                  </h4>

                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-1
                    "
                  >
                    {item.description}
                  </p>

                  <span
                    className="
                      text-xs
                      text-blue-600
                      font-medium
                    "
                  >
                    {item.status}
                  </span>

                </div>

              </div>


              <button
                type="button"
                onClick={() => onAction(item.id)}
                className="
                  flex
                  items-center
                  gap-1
                  text-sm
                  font-medium
                  text-blue-600
                  hover:text-blue-700
                "
              >
                {item.action}

                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          );

        })}



        {/* Logout Card */}
        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            gap-4
            p-4
            rounded-2xl
            bg-red-50/70
            border
            border-red-100
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-red-100
                flex
                items-center
                justify-center
                text-red-600
              "
            >
              <LogOut className="w-5 h-5" />
            </div>


            <div>

              <h4
                className="
                  font-medium
                  text-slate-900
                "
              >
                Sign Out
              </h4>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                Securely log out from this device.
              </p>

            </div>

          </div>



          <button
            type="button"
            onClick={onLogout}
            className="
              px-5
              h-10
              rounded-xl
              bg-red-600
              text-white
              text-sm
              font-medium
              hover:bg-red-700
              transition
            "
          >
            Logout
          </button>


        </div>

      </div>

    </section>
  );
};



SecurityCenter.propTypes = {
  securityData: PropTypes.object.isRequired,
  onAction: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};


export default SecurityCenter;