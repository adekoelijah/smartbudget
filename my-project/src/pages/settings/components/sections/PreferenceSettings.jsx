

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
    <div className="flex flex-col gap-3 py-5 border-b border-slate-200 last:border-b-0">

      {/* HEADER */}
      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {label}
          </p>

          <p className="text-xs text-slate-500 leading-relaxed break-words">
            {description}
          </p>
        </div>

      </div>

      {/* CONTROL (FULL WIDTH MOBILE, RIGHT ALIGNED DESKTOP) */}
      <div className="w-full md:flex md:justify-end">
        <div className="w-full md:w-[220px]">
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
    <div className="space-y-6">

      {/* HEADER */}
      <div
        className="
          relative overflow-hidden
          rounded-3xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        {/* BACKGROUND EFFECT */}
        <div
          className="
            absolute right-0 top-0
            h-40 w-40
            rounded-full
            bg-emerald-100/40
            blur-3xl
          "
        />

        <div className="relative z-10 flex gap-4">

          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-slate-900
              text-white
              shadow-lg
            "
          >
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2
              className="
                text-xl font-bold
                tracking-tight
                text-slate-900
              "
            >
              Preferences Center
            </h2>

            <p
              className="
                mt-2 max-w-2xl
                text-sm leading-relaxed
                text-slate-500
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
          rounded-3xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        {/* TITLE */}
        <div className="mb-3">
          <h3
            className="
              text-xs font-semibold
              uppercase tracking-[0.2em]
              text-slate-400
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
            className="
              h-11 w-full md:w-[220px]
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-medium
              text-slate-800
              outline-none
              transition
              focus:border-slate-400
              focus:bg-white
            "
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
          rounded-3xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        {/* TITLE */}
        <div className="mb-3">
          <h3
            className="
              text-xs font-semibold
              uppercase tracking-[0.2em]
              text-slate-400
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
            className="
              h-11 w-full md:w-[220px]
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-medium
              text-slate-800
              outline-none
              transition
              focus:border-slate-400
              focus:bg-white
            "
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
            className="
              h-11 w-full md:w-[220px]
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-medium
              text-slate-800
              outline-none
              transition
              focus:border-slate-400
              focus:bg-white
            "
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
            className="
              h-11 w-full md:w-[220px]
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-medium
              text-slate-800
              outline-none
              transition
              focus:border-slate-400
              focus:bg-white
            "
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
              gap-2 rounded-2xl
              border border-emerald-100
              bg-emerald-50
              px-4 py-2
              text-xs font-semibold
              text-emerald-700
            "
          >
            Smart Regional Sync Active
          </div>
        </Field>

      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="
            inline-flex items-center
            gap-2
            rounded-2xl
            bg-slate-900
            px-6 py-3
            text-sm font-semibold
            text-white
            transition-all
            hover:bg-black
            disabled:cursor-not-allowed
            disabled:opacity-60
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
            rounded-2xl
            border border-emerald-100
            bg-emerald-50
            px-4 py-3
            text-center
            text-sm font-medium
            text-emerald-700
          "
        >
          {message}
        </div>
      )}

    </div>
  );
};

export default PreferenceSettings;