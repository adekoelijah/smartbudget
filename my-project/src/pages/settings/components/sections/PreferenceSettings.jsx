
import {
  Globe,
  LayoutGrid,
  Clock3,
  Wallet,
  Languages,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import usePreferences from "../../hooks/usePreferences";

/*
============================================================
FIELD COMPONENT
============================================================
*/

const Field = ({
  icon: Icon,
  label,
  description,
  children,
}) => {
  return (
    <div
      className="
        items-start grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-2xl
        gap-4
      "
    >
      {/* INFORMATION */}

      <div
        className="
          flex items-start
          min-w-0
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
        >
          <Icon
            size={18}
            aria-hidden="true"
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h4
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {label}
          </h4>

          <p
            className="
              max-w-xl
              mt-1
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* CONTROL */}

      <div
        className="
          w-full
        "
      >
        {children}
      </div>
    </div>
  );
};

/*
============================================================
SELECT COMPONENT
============================================================
*/

const Select = ({
  value = "",
  onChange,
  disabled = false,
  children,
  ariaLabel,
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="
        w-full h-11
        px-4
        font-medium text-slate-800 text-sm
        bg-slate-50 hover:bg-white focus:bg-white
        border border-slate-200 focus:border-blue-500 rounded-2xl outline-none
        focus:ring-2 focus:ring-blue-100
        disabled:opacity-60 transition
        disabled:cursor-not-allowed
      "
    >
      {children}
    </select>
  );
};

/*
============================================================
STATUS MESSAGE
============================================================
*/

const StatusMessage = ({
  type,
  message,
}) => {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      className={`
        flex items-start
        gap-2
        p-3
        rounded-xl
        text-sm
        border
        ${
          isError
            ? `
              bg-red-50
              text-red-700
              border-red-100
            `
            : `
              bg-emerald-50
              text-emerald-700
              border-emerald-100
            `
        }
      `}
      role={isError ? "alert" : "status"}
    >
      {isError ? (
        <AlertCircle
          size={18}
          className="
            mt-0.5
            shrink-0
          "
          aria-hidden="true"
        /
        >
      ) : (
        <CheckCircle2
          size={18}
          className="
            mt-0.5
            shrink-0
          "
          aria-hidden="true"
        /
        >
      )}

      <span>{message}</span>
    </div>
  );
};

/*
============================================================
MAIN COMPONENT
============================================================
*/

const PreferenceSettings = () => {
  const {
    preferences,
    loading,
    saving,
    message,
    error,
    updatePreference,
    savePreferences,
  } = usePreferences();

  /*
  ============================================================
  SAFE PREFERENCES
  ============================================================
  */

  const {
    density = "comfortable",
    currency = "NGN",
    timezone = "Africa/Lagos",
    language = "en",
  } = preferences || {};

  /*
  ============================================================
  LANGUAGE
  ============================================================
  */

  const handleLanguageChange = (value) => {
    updatePreference(
      "language",
      value
    );

    /*
    Keep the document language
    synchronized with the selected
    application language.
    */

    document.documentElement.lang =
      value;
  };

  /*
  ============================================================
  SAVE
  ============================================================
  */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    await savePreferences();
  };

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading) {
    return (
      <section
        className="
          w-full
          p-4 sm:p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >
        <div
          className="
            space-y-5
            animate-pulse
          "
        >
          <div
            className="
              w-48 h-6
              bg-slate-200
              rounded-lg
            "
            /
          >

          <div
            className="
              w-80 max-w-full h-4
              bg-slate-100
              rounded-lg
            "
            /
          >

          <div
            className="
              space-y-3
            "
          >
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-24
                    bg-slate-100
                    rounded-2xl
                  "
                  /
                >
              )
            )}
          </div>

          <div
            className="
              w-40 h-12
              bg-slate-200
              rounded-2xl
            "
            /
          >
        </div>
      </section>
    );
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <section
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

      <div
        className="
          p-4 sm:p-6 lg:p-7
        "
      >
        {/* HEADER */}

        <div
          className="
            flex items-start
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              text-blue-600
              bg-blue-50
              border border-blue-100 rounded-2xl
              shrink-0
            "
          >
            <SlidersIcon />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h2
              className="
                font-bold text-slate-900 text-lg sm:text-xl
              "
            >
              Preferences
            </h2>

            <p
              className="
                max-w-2xl
                mt-1
                text-slate-500 text-sm leading-relaxed
              "
            >
              Customize regional settings,
              language, timezone, currency,
              and dashboard display preferences.
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

        {/* STATUS */}

        <div
          className="
            space-y-3 mb-5
          "
        >
          <StatusMessage
            type="error"
            message={error}
          />

          <StatusMessage
            type="success"
            message={message}
          />
        </div>

        {/* SETTINGS */}

        <div
          className="
            space-y-3
          "
        >
          {/* DISPLAY */}

          <Field
            icon={LayoutGrid}
            label="Layout Density"
            description="
              Controls spacing and sizing across
              your dashboard experience.
            "
          >
            <Select
              value={density}
              disabled={saving}
              ariaLabel="Layout density"
              onChange={(event) =>
                updatePreference(
                  "density",
                  event.target.value
                )
              }
            >
              <option value="compact">
                Compact
              </option>

              <option value="comfortable">
                Comfortable
              </option>

              <option value="spacious">
                Spacious
              </option>
            </Select>
          </Field>

          {/* CURRENCY */}

          <Field
            icon={Wallet}
            label="Currency"
            description="
              Controls currency formatting across
              transactions, budgets, and reports.
            "
          >
            <Select
              value={currency}
              disabled={saving}
              ariaLabel="Currency"
              onChange={(event) =>
                updatePreference(
                  "currency",
                  event.target.value
                )
              }
            >
              <option value="NGN">
                Nigerian Naira (₦)
              </option>

              <option value="USD">
                US Dollar ($)
              </option>

              <option value="GBP">
                British Pound (£)
              </option>

              <option value="EUR">
                Euro (€)
              </option>
            </Select>
          </Field>

          {/* TIMEZONE */}

          <Field
            icon={Clock3}
            label="Timezone"
            description="
              Used for transaction timestamps,
              reminders, and financial reports.
            "
          >
            <Select
              value={timezone}
              disabled={saving}
              ariaLabel="Timezone"
              onChange={(event) =>
                updatePreference(
                  "timezone",
                  event.target.value
                )
              }
            >
              <option value="Africa/Lagos">
                West Africa Time
              </option>

              <option value="Africa/Accra">
                Ghana Time
              </option>

              <option value="Europe/London">
                London
              </option>

              <option value="America/New_York">
                Eastern Time
              </option>

              <option value="America/Los_Angeles">
                Pacific Time
              </option>
            </Select>
          </Field>

          {/* LANGUAGE */}

          <Field
            icon={Languages}
            label="Language"
            description="
              Controls the language used by
              the SmartBudget application.
            "
          >
            <Select
              value={language}
              disabled={saving}
              ariaLabel="Application language"
              onChange={(event) =>
                handleLanguageChange(
                  event.target.value
                )
              }
            >
              <option value="en">
                English
              </option>
            </Select>
          </Field>

          {/* REGION */}

          <Field
            icon={Globe}
            label="Region"
            description="
              Your account region used for
              localization and regional formatting.
            "
          >
            <div
              className="
                flex justify-between items-center
                w-full h-11
                px-4
                font-medium text-slate-800 text-sm
                bg-slate-50
                border border-slate-200 rounded-2xl
              "
            >
              <span>
                Nigeria
              </span>

              <span
                className="
                  font-medium text-slate-400 text-xs
                "
              >
                NG
              </span>
            </div>
          </Field>
        </div>

        {/* SAVE AREA */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-6 pt-5
            border-slate-100 border-t
            gap-4
          "
        >
          <div
            className="
              flex items-center
              text-slate-500 text-xs
              gap-2
            "
          >
            <ShieldCheck
              size={16}
              className="
                text-emerald-600
              "
              aria-hidden="true"
            /
            >

            <span>
              Your preferences are securely
              synchronized with your account.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex justify-center items-center
              w-full sm:w-auto min-w-[190px]
              px-6 py-3
              font-semibold text-white text-sm
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              rounded-2xl
              disabled:opacity-60 shadow-sm hover:shadow transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <Save
              size={17}
              aria-hidden="true"
            />

            {saving
              ? "Saving..."
              : "Save Preferences"}
          </button>
        </div>
      </div>
    </section>
  );
};

/*
============================================================
HEADER ICON
============================================================
*/

const SlidersIcon = () => {
  return (
    <LayoutGrid
      size={21}
      aria-hidden="true"
    />
  );
};

export default PreferenceSettings;