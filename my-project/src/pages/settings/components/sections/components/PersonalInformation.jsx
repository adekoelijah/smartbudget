
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import SaveBar from "./SaveBar";

/* =========================================
   CREATE INITIAL FORM DATA
========================================= */

const createInitialData = (user) => ({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  country: user?.country ?? "",
  dateOfBirth: user?.dateOfBirth ?? "",
});

/* =========================================
   PERSONAL INFORMATION
========================================= */

const PersonalInformation = ({
  user,
  onUpdate,
  isSaving = false,
}) => {
  const initialData = useMemo(
    () => createInitialData(user),
    [user]
  );

  const [isEditing, setIsEditing] = useState(false);

  const [validationError, setValidationError] =
    useState("");

  const [formData, setFormData] = useState(
    () => createInitialData(user)
  );


  /* =========================================
     CHECK FOR CHANGES
  ========================================= */

  const hasChanges = useMemo(() => {
    return Object.keys(formData).some(
      (key) =>
        formData[key] !== initialData[key]
    );
  }, [formData, initialData]);

  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setValidationError("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     VALIDATE FORM
  ========================================= */

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "First name is required.";
    }

    if (!formData.lastName.trim()) {
      return "Last name is required.";
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      formData.phone &&
      formData.phone.length < 7
    ) {
      return "Please enter a valid phone number.";
    }

    return null;
  };

  /* =========================================
     HANDLE SAVE
  ========================================= */

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const error = validateForm();

    if (error) {
      setValidationError(error);
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    if (typeof onUpdate !== "function") {
      setValidationError(
        "Profile update service is not available."
      );
      return;
    }

    setValidationError("");

    try {
      const result = await onUpdate(formData);

      if (result?.success) {
        setIsEditing(false);
        setValidationError("");
      } else {
        setValidationError(
          result?.message ||
            "Unable to update profile."
        );
      }
    } catch (error) {
      console.error(
        "PERSONAL_INFORMATION_SAVE_ERROR:",
        error
      );

      setValidationError(
        error?.message ||
          "Unable to update profile."
      );
    }
  };

  /* =========================================
     HANDLE CANCEL
  ========================================= */

  const handleCancel = () => {
    setFormData(
      createInitialData(user)
    );

    setValidationError("");

    setIsEditing(false);
  };

  /* =========================================
     START EDITING
  ========================================= */

  const handleStartEditing = () => {
    setFormData(
      createInitialData(user)
    );

    setValidationError("");

    setIsEditing(true);
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <section
      className="
        w-full
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          p-6 sm:p-8
          border-slate-200 border-b
          gap-4
        "
      >
        <div>
          <h2
            className="
              font-bold text-slate-900 text-xl
            "
          >
            Personal Information
          </h2>

          <p
            className="
              mt-1
              text-slate-500 text-sm
            "
          >
            Manage your personal account details
            securely.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEditing}
            className="
              inline-flex justify-center items-center
              px-4 py-2.5
              font-medium text-white text-sm
              bg-blue-600 hover:bg-blue-700
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition
              gap-2
            "
          >
            <Edit3
              className="
                w-4 h-4
              "
              /
            >

            Edit Information
          </button>
        )}
      </div>

      {/* =========================================
          FORM
      ========================================= */}

      <div
        className="
          p-6 sm:p-8
        "
      >
        {/* VALIDATION ERROR */}

        {validationError && (
          <div
            role="alert"
            className="
              mb-6 px-4 py-3
              font-medium text-red-700 text-sm
              bg-red-50
              border border-red-200 rounded-xl
            "
          >
            {validationError}
          </div>
        )}

        {/* FORM GRID */}

        <div
          className="
            grid sm:grid-cols-2
            gap-5
          "
        >
          <FormField
            icon={<User
            className="
              w-5 h-5
            "
            /
          >}
            label="First Name"
            name="firstName"
            value={formData.firstName}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />

          <FormField
            icon={<User
            className="
              w-5 h-5
            "
            /
          >}
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />

          <FormField
            icon={<Mail
            className="
              w-5 h-5
            "
            /
          >}
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />

          <FormField
            icon={<Phone
            className="
              w-5 h-5
            "
            /
          >}
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />

          <FormField
            icon={<MapPin
            className="
              w-5 h-5
            "
            /
          >}
            label="Country"
            name="country"
            value={formData.country}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />

          <FormField
            icon={<Calendar
            className="
              w-5 h-5
            "
            /
          >}
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formatDateInput(
              formData.dateOfBirth
            )}
            disabled={!isEditing || isSaving}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* =========================================
          SAVE BAR
      ========================================= */}

      <SaveBar
        visible={isEditing && hasChanges}
        isSaving={isSaving}
        hasError={Boolean(validationError)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </section>
  );
};

/* =========================================
   FORM FIELD
========================================= */

function FormField({
  icon,
  label,
  name,
  type = "text",
  value,
  disabled = false,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          block
          mb-2
          font-medium text-slate-700 text-sm
        "
      >
        {label}
      </label>

      <div
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          border
          px-4
          py-3
          transition

          ${
            disabled
              ? `
                border-slate-200
                bg-slate-50
              `
              : `
                border-blue-300
                bg-white
                focus-within:ring-2
                focus-within:ring-blue-100
              `
          }
        `}
      >
        <span
          className="
            text-slate-400
            shrink-0
          "
        >
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          onChange={onChange}
          autoComplete="off"
          className="
            w-full
            text-slate-900 disabled:text-slate-500 placeholder:text-slate-400 text-sm
            bg-transparent
            outline-none
            disabled:cursor-not-allowed
          "
          /
        >
      </div>
    </div>
  );
}

/* =========================================
   DATE FORMATTER
========================================= */

function formatDateInput(date) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed
    .toISOString()
    .slice(0, 10);
}

export default PersonalInformation;