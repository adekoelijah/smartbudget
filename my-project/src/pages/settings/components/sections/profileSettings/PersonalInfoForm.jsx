// src/components/profile/PersonalInfoForm.jsx

import PropTypes from "prop-types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

const PersonalInfoForm = ({
  formData,
  onChange,
  onSubmit,
  loading = false,
}) => {
  const fields = [
    {
      name: "fullName",
      label: "Full Name",
      placeholder: "Enter your full name",
      icon: User,
      type: "text",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      icon: Mail,
      type: "email",
      disabled: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      icon: Phone,
      type: "tel",
    },
    {
      name: "location",
      label: "Location",
      placeholder: "Enter your location",
      icon: MapPin,
      type: "text",
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
      <div className="mb-8">
        <h2
          className="
            text-xl
            md:text-2xl
            font-semibold
            text-slate-900
          "
        >
          Personal Information
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Manage your profile details and account identity.
        </p>
      </div>


      <form
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <div
                key={field.name}
                className="space-y-2"
              >
                <label
                  htmlFor={field.name}
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {field.label}
                </label>

                <div
                  className="
                    relative
                  "
                >
                  <Icon
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-slate-400
                    "
                  />

                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="
                      w-full
                      h-12
                      rounded-2xl
                      pl-12
                      pr-4
                      bg-white/80
                      border
                      border-slate-200
                      text-slate-900
                      placeholder:text-slate-400
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                      disabled:bg-slate-100
                      disabled:text-slate-500
                    "
                  />
                </div>
              </div>
            );
          })}
        </div>


        {/* Save Button */}
        <div
          className="
            flex
            justify-end
            pt-4
          "
        >
          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              h-12
              px-6
              rounded-2xl
              bg-blue-600
              text-white
              font-medium
              shadow-lg
              shadow-blue-600/20
              hover:bg-blue-700
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? (
              <>
                <Loader2
                  className="
                    w-5
                    h-5
                    animate-spin
                  "
                />
                Saving...
              </>
            ) : (
              <>
                <Save
                  className="
                    w-5
                    h-5
                  "
                />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};


PersonalInfoForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};


export default PersonalInfoForm;