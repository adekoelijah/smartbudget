

import {
  useEffect,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import {
  createTransaction,
  updateTransaction,
} from "../services/transactionService";

/* =========================================
   CONSTANTS
========================================= */
const expenseCategories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Rent",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

/* =========================================
   COMPONENT
========================================= */
const TransactionModal = ({
  open,
  onClose,
  onSuccess,
  initialData = null,

  /**
   * IMPORTANT
   * SYNC FROM QUICK ACTION BAR
   */
  type = "expense",
}) => {
  const isEdit =
    Boolean(initialData);

  /* =========================================
     FORM STATE
  ========================================= */
  const [form, setForm] =
    useState({
      title: "",
      type,
      amount: "",
      category: "",
      date:
        new Date()
          .toISOString()
          .slice(0, 10),
      note: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================
     RESET / INIT
  ========================================= */
  useEffect(() => {
    if (!open) return;

    /**
     * EDIT MODE
     */
    if (initialData) {
      setForm({
        title:
          initialData.title ||
          "",

        type:
          initialData.type ||
          "expense",

        amount:
          initialData.amount ||
          "",

        category:
          initialData.category ||
          "",

        date:
          initialData.date
            ?.slice(0, 10) ||
          new Date()
            .toISOString()
            .slice(0, 10),

        note:
          initialData.note ||
          "",
      });

      return;
    }

    /**
     * CREATE MODE
     */
    setForm({
      title: "",
      type,
      amount: "",
      category: "",
      date:
        new Date()
          .toISOString()
          .slice(0, 10),
      note: "",
    });

    setError("");
  }, [
    open,
    initialData,
    type,
  ]);

  /* =========================================
     FIELD UPDATE
  ========================================= */
  const updateField = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================================
     VALIDATION
  ========================================= */
  const validate = () => {
    if (!form.title.trim())
      return "Title is required";

    if (
      !form.amount ||
      Number(form.amount) <= 0
    )
      return "Valid amount required";

    if (!form.category)
      return "Select category";

    return null;
  };

  /* =========================================
     SUBMIT
  ========================================= */
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const validation =
        validate();

      if (validation) {
        setError(validation);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const payload = {
          title:
            form.title.trim(),

          type: form.type,

          amount: Number(
            form.amount
          ),

          category:
            form.category,

          date: form.date,

          note:
            form.note.trim(),
        };

        let response;

        if (isEdit) {
          response =
            await updateTransaction(
              initialData._id,
              payload
            );
        } else {
          response =
            await createTransaction(
              payload
            );
        }

        /**
         * SAFE RESPONSE
         */
        if (
          !response?.success
        ) {
          setError(
            response?.message ||
              "Transaction failed"
          );

          return;
        }

        /**
         * SUCCESS CALLBACK
         */
        onSuccess?.(
          response.data
        );

        onClose?.();
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data
            ?.message ||
            "Failed to save transaction"
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================================
     CATEGORY ENGINE
  ========================================= */
  const categories =
    form.type === "income"
      ? incomeCategories
      : expenseCategories;

  if (!open) return null;

  return (
    <AnimatePresence>

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

        {/* OVERLAY */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* MODAL */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 30,
          }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >

          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEdit
                  ? "Edit Transaction"
                  : "Create Transaction"}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Secure financial entry
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

          </div>

          {/* FORM */}
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4 p-5"
          >

            {/* TYPE */}
            <div className="grid grid-cols-2 gap-3">

              {[
                "expense",
                "income",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    updateField(
                      "type",
                      item
                    )
                  }
                  className={`
                    rounded-2xl border p-3 text-sm transition
                    ${
                      form.type ===
                      item
                        ? item ===
                          "expense"
                          ? "border-rose-200 bg-rose-50"
                          : "border-emerald-200 bg-emerald-50"
                        : "border-slate-200"
                    }
                  `}
                >

                  <div className="flex items-center gap-2">

                    {item ===
                    "expense" ? (
                      <ArrowDownCircle
                        size={
                          16
                        }
                      />
                    ) : (
                      <ArrowUpCircle
                        size={
                          16
                        }
                      />
                    )}

                    {item}

                  </div>

                </button>
              ))}

            </div>

            {/* TITLE */}
            <input
              type="text"
              placeholder="Transaction title"
              value={
                form.title
              }
              onChange={(e) =>
                updateField(
                  "title",
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            {/* AMOUNT */}
            <input
              type="number"
              placeholder="Amount"
              value={
                form.amount
              }
              onChange={(e) =>
                updateField(
                  "amount",
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            {/* CATEGORY */}
            <select
              value={
                form.category
              }
              onChange={(e) =>
                updateField(
                  "category",
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            >

              <option value="">
                Select category
              </option>

              {categories.map(
                (c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                )
              )}

            </select>

            {/* DATE */}
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                updateField(
                  "date",
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            {/* NOTE */}
            <textarea
              rows={3}
              placeholder="Note"
              value={form.note}
              onChange={(e) =>
                updateField(
                  "note",
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >

                {loading && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}

                {isEdit
                  ? "Update"
                  : "Create"}

              </button>

            </div>

          </form>

        </motion.div>
      </div>

    </AnimatePresence>
  );
};

export default TransactionModal;