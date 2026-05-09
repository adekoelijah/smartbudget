
import { usePreferences } from "../../hooks/usePreferences";

/**
 * 🧱 MUST stay outside render cycle
 */
const Field = ({ label, description, children }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-b-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-100">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  );
};

const PreferenceSettings = () => {
  const {
    prefs,
    loading,
    message,
    updatePref,
    savePreferences,
  } = usePreferences();

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-lg font-semibold">Preferences Center</h2>
        <p className="text-sm text-slate-400 mt-1">
          Control how your finance dashboard behaves
        </p>
      </div>

      {/* DISPLAY */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Display
        </h3>

        <Field label="Layout Density" description="Controls spacing across UI">
          <select
            value={prefs.density}
            onChange={(e) => updatePref("density", e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </Field>
      </div>

      {/* REGIONAL */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">

        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Regional
        </h3>

        <Field label="Currency" description="Financial display format">
          <select
            value={prefs.currency}
            onChange={(e) => updatePref("currency", e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm"
          >
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </Field>

        <Field label="Timezone" description="Analytics timing reference">
          <select
            value={prefs.timezone}
            onChange={(e) => updatePref("timezone", e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm"
          >
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>

        <Field label="Language" description="Interface language">
          <select
            value={prefs.language}
            onChange={(e) => updatePref("language", e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm"
          >
            <option value="en">English</option>
          </select>
        </Field>

      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={loading}
          className="px-6 py-3 rounded-2xl text-sm font-medium bg-emerald-500 text-black hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      {/* FEEDBACK */}
      {message && (
        <p className="text-center text-sm text-slate-400">
          {message}
        </p>
      )}

    </div>
  );
};

export default PreferenceSettings;