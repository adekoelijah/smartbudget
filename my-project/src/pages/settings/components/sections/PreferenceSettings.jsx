

import {
  Globe,
  LayoutGrid,
  Clock3,
  Wallet,
  Languages,
  ShieldCheck,
  Save,
} from "lucide-react";

import { usePreferences } from "../../hooks/usePreferences";

/* =========================================
   FIELD COMPONENT
========================================= */
const Field = ({ icon: Icon, label, description, children }) => {
  return (
    <div
      className="
        flex flex-col
        py-5
        border-slate-200 border-b last:border-b-0
        gap-3
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
            w-10 h-10
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
        >
          <Icon size={18} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {label}
          </p>

          <p
            className="
              text-slate-500 text-xs break-words leading-relaxed
            "
          >
            {description}
          </p>
        </div>

      </div>

      {/* CONTROL (FULL WIDTH MOBILE, RIGHT ALIGNED DESKTOP) */}
      <div
        className="
          md:flex md:justify-end
          w-full
        "
      >
        <div
          className="
            w-full md:w-[220px]
          "
        >
          {children}
        </div>
      </div>

    </div>
  );
};

/* =========================================
   COMPONENT
========================================= */
const PreferenceSettings = () => {
  const {
    prefs,
    loading,
    message,
    updatePref,
    savePreferences,
  } = usePreferences();

  /* =========================================
     HANDLE LANGUAGE
  ========================================= */
  const handleLanguageChange = (
    value
  ) => {
    updatePref("language", value);

    /**
     * GLOBAL APP LANGUAGE
     * This allows every page/component
     * to instantly detect language changes
     */

    localStorage.setItem(
      "app_language",
      value
    );

    /**
     * OPTIONAL:
     * Useful for i18n systems later
     */
    document.documentElement.lang =
      value;

    /**
     * OPTIONAL:
     * Add language direction support
     */
    document.documentElement.dir =
      "ltr";
  };

  /* =========================================
     SAVE
  ========================================= */
  const handleSave = async () => {
    try {
      await savePreferences();

      /**
       * GLOBAL SETTINGS STORAGE
       * Used across billing,
       * dashboard, reports,
       * analytics and profile pages
       */
      localStorage.setItem(
        "smartbudget_preferences",
        JSON.stringify(prefs)
      );
    } catch (err) {
      console.error(
        "SAVE_PREFERENCES_ERROR:",
        err
      );
    }
  };

  return (
    <div
      className="
        space-y-6
      "
    >

      {/* HEADER */}
      <div
        className="
          relative overflow-hidden
          p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >

        {/* BACKGROUND EFFECT */}
        <div
          className="
            top-0 right-0 absolute
            w-40 h-40
            bg-emerald-100/40
            rounded-full
            blur-3xl
          "
          /
        >

        <div
          className="
            z-10 relative flex
            gap-4
          "
        >

          <div
            className="
              flex justify-center items-center
              w-14 h-14
              text-white
              bg-slate-900
              rounded-2xl
              shadow-lg
            "
          >
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2
              className="
                font-bold text-slate-900 text-xl tracking-tight
              "
            >
              Preferences Center
            </h2>

            <p
              className="
                max-w-2xl
                mt-2
                text-slate-500 text-sm leading-relaxed
              "
            >
              Personalize how SmartBudget
              behaves across billing,
              analytics, reports,
              notifications, and account
              experiences.
            </p>
          </div>

        </div>
      </div>

      {/* DISPLAY SETTINGS */}
      <div
        className="
          p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >

        {/* TITLE */}
        <div
          className="
            mb-3
          "
        >
          <h3
            className="
              font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]
            "
          >
            Display Settings
          </h3>
        </div>

        {/* DENSITY */}
        <Field
          icon={LayoutGrid}
          label="Layout Density"
          description="
            Controls spacing and component
            sizing across the dashboard,
            reports, billing and analytics pages.
          "
        >
          <select
            value={prefs.density}
            onChange={(e) =>
              updatePref(
                "density",
                e.target.value
              )
            }
            className="bg-slate-50 focus:bg-white px-4 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none w-full md:w-[220px] h-11 font-medium text-slate-800 text-sm transition"
          >
            <option value="comfortable">
              Comfortable
            </option>

            <option value="compact">
              Compact
            </option>
          </select>
        </Field>

      </div>

      {/* REGIONAL SETTINGS */}
      <div
        className="
          p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >

        {/* TITLE */}
        <div
          className="
            mb-3
          "
        >
          <h3
            className="
              font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]
            "
          >
            Regional & Localization
          </h3>
        </div>

        {/* CURRENCY */}
        <Field
          icon={Wallet}
          label="Currency"
          description="
            Sets the default financial
            display format used across
            transactions, reports,
            invoices and billing.
          "
        >
          <select
            value={prefs.currency}
            onChange={(e) =>
              updatePref(
                "currency",
                e.target.value
              )
            }
            className="bg-slate-50 focus:bg-white px-4 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none w-full md:w-[220px] h-11 font-medium text-slate-800 text-sm transition"
          >
            <option value="NGN">
              ₦ NGN
            </option>

            <option value="USD">
              $ USD
            </option>

            <option value="EUR">
              € EUR
            </option>

            <option value="GBP">
              £ GBP
            </option>
          </select>
        </Field>

        {/* TIMEZONE */}
        <Field
          icon={Clock3}
          label="Timezone"
          description="
            Used for analytics timing,
            transaction records,
            reports and scheduled
            financial activities.
          "
        >
          <select
            value={prefs.timezone}
            onChange={(e) =>
              updatePref(
                "timezone",
                e.target.value
              )
            }
            className="bg-slate-50 focus:bg-white px-4 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none w-full md:w-[220px] h-11 font-medium text-slate-800 text-sm transition"
          >
            <option value="Africa/Lagos">
              Africa/Lagos
            </option>

            <option value="UTC">
              UTC
            </option>

            <option value="Europe/London">
              Europe/London
            </option>

            <option value="America/New_York">
              America/New_York
            </option>
          </select>
        </Field>

        {/* LANGUAGE */}
        <Field
          icon={Languages}
          label="Language"
          description="
            Controls the global application
            language across all pages,
            components, billing flows,
            notifications and dashboards.
          "
        >
          <select
            value={prefs.language}
            onChange={(e) =>
              handleLanguageChange(
                e.target.value
              )
            }
            className="bg-slate-50 focus:bg-white px-4 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none w-full md:w-[220px] h-11 font-medium text-slate-800 text-sm transition"
          >
            <option value="en">
              English
            </option>

            <option value="yo">
              Yoruba
            </option>
          </select>
        </Field>

        {/* REGION */}
        <Field
          icon={Globe}
          label="Regional Experience"
          description="
            Syncs localization settings
            with taxes, billing format,
            receipts and financial reporting.
          "
        >
          <div
            className="
              inline-flex items-center
              px-4 py-2
              font-semibold text-emerald-700 text-xs
              bg-emerald-50
              border border-emerald-100 rounded-2xl
              gap-2
            "
          >
            Smart Regional Sync Active
          </div>
        </Field>

      </div>

      {/* SAVE BUTTON */}
      <div
        className="
          flex justify-end
        "
      >

        <button
          onClick={handleSave}
          disabled={loading}
          className="
            inline-flex items-center
            px-6 py-3
            font-semibold text-white text-sm
            bg-slate-900 hover:bg-black
            rounded-2xl
            disabled:opacity-60 transition-all
            disabled:cursor-not-allowed
            gap-2
          "
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Save Preferences"}
        </button>

      </div>

      {/* FEEDBACK */}
      {message && (
        <div
          className="
            px-4 py-3
            font-medium text-emerald-700 text-sm text-center
            bg-emerald-50
            border border-emerald-100 rounded-2xl
          "
        >
          {message}
        </div>
      )}

    </div>
  );
};

export default PreferenceSettings;