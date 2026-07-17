

// export default AddTransaction;
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createTransaction } from "../../services/transactionService";

const CATEGORIES = [
  { label: "Food", icon: "🍔", key: "food" },
  { label: "Transport", icon: "🚗", key: "transport" },
  { label: "Rent", icon: "🏠", key: "rent" },
  { label: "Utilities", icon: "💡", key: "utilities" },
  { label: "Shopping", icon: "🛍️", key: "shopping" },
  { label: "Health", icon: "🏥", key: "health" },
  { label: "Salary", icon: "💰", key: "salary" },
  { label: "Business", icon: "📊", key: "business" },
  { label: "Other", icon: "📦", key: "other" },
];

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.key])
);

const steps = ["details", "category", "confirm"];

const AddTransaction = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    categoryKey: "food",
    note: "",
  });

  /* ================= FORMAT AMOUNT ================= */
  const formattedAmount = useMemo(() => {
    const val = Number(form.amount || 0);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(val);
  }, [form.amount]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.amount || Number(form.amount) <= 0)
      return "Enter a valid amount";
    return null;
  };

  const nextStep = () => {
    if (step === 0) {
      const err = validate();
      if (err) return setError(err);
    }
    setError("");
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((s) => s - 1);
  };

  /* ================= SUBMIT (FIXED BUDGET SYNC READY) ================= */
  const handleSubmit = async () => {
    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      const payload = {
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        categoryKey: form.categoryKey,
        note: form.note,
      };

      await createTransaction(payload);

      navigate("/app/transactions");
    } catch (err) {
      console.error("Add transaction error:", err);
      setError(
        err?.response?.data?.message || "Failed to add transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
  <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
    
    <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">

      {/* ================= LEFT PANEL (FORM) ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm p-5 md:p-8"
      >

          {/* HEADER */}
          <div className="border-b border-slate-100 pb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              SmartBudget
            </p>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-900">Add Transaction</h1>

            <p className="text-sm text-slate-500 mt-1">
              Record income and expenses with precision
            </p>

            {/* PROGRESS */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="pt-6">
            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-5"
                >
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />

                  <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          type: "income",
                        }))
                      }
                      className={`py-3 rounded-xl border ${
                        form.type === "income"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : ""
                      }`}
                    >
                      Income
                    </button>

                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          type: "expense",
                        }))
                      }
                      className={`py-3 rounded-xl border ${
                        form.type === "expense"
                          ? "bg-rose-600 text-white border-rose-600"
                          : ""
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 - FIXED CATEGORY UI */}
              {step === 1 && (
                <motion.div
                  key="step2"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive =
                      form.categoryKey === cat.key;

                    return (
                      <button
                        key={cat.key}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            category: cat.label,
                            categoryKey: cat.key,
                          }))
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                          isActive
                            ? "bg-slate-900 text-white border-slate-900 scale-[1.02]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-xl sm:text-2xl md:text-3xl leading-none">{cat.icon}</span>
                        <span className="text-sm font-medium">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <motion.div className="space-y-5">
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Note"
                    className="w-full rounded-xl border border-slate-200 p-4"
                  />

                  <div className="bg-slate-50 p-5 rounded-2xl">
                    <p>{form.category}</p>
                    <h3 className="text-xl font-semibold">
                      {form.title}
                    </h3>
                    <p className="text-2xl font-bold">
                      {formattedAmount}
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {error && (
              <p className="text-rose-600 text-sm mt-4">
                {error}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Back
                </button>
              )}

              {step < 2 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl"
                >
                  {loading ? "Saving..." : "Create"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT PANEL ================= */}
        {/* ================= RIGHT PANEL ================= */}
<div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 lg:sticky lg:top-6 h-fit">

  <p className="text-xs md:text-sm text-slate-500">
    Live Preview
  </p>

  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
    Transaction Preview
  </h2>

  <div className="mt-4 md:mt-6 p-4 md:p-5 bg-slate-50 rounded-2xl">
    <p className="text-xs md:text-sm text-slate-500">
      {form.category}
    </p>

    <h3 className="text-lg md:text-2xl font-semibold text-slate-900">
      {form.title || "Title"}
    </h3>

    <p className="text-xl md:text-2xl font-bold text-slate-900">
      {formattedAmount}
    </p>
  </div>

</div>

      </div>
    </div>
  );
};

export default AddTransaction;