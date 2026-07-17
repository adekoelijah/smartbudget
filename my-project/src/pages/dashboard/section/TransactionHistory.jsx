import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/* =========================
   SAFE NORMALIZER
========================= */
const normalize = (input) => {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.transactions)) return input.transactions;
  return [];
};

const safeNumber = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const safeDate = (d) => {
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date(0) : date;
};

const format = (n) =>
  `₦${safeNumber(n).toLocaleString("en-NG")}`;

const TransactionHistory = (props) => {
  // 🔥 Accept BOTH prop styles safely
  const raw = props?.transactions || props?.data || [];

  const data = useMemo(() => {
    let tx = normalize(raw);

    // DEBUG SAFETY (you can remove later)
    if (!Array.isArray(tx)) {
      console.warn("TransactionHistory: invalid data format", tx);
      return [];
    }

    tx = [...tx];

    // SORT SAFE
    tx.sort((a, b) => {
      const d1 = safeDate(b?.date || b?.createdAt);
      const d2 = safeDate(a?.date || a?.createdAt);
      return d1 - d2;
    });

    return tx;
  }, [raw]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">

      {/* HEADER */}
      <div className="p-5 border-b">
        <h2 className="text-sm font-semibold text-slate-900">
          Transaction History
        </h2>
        <p className="text-xs text-slate-500">
          Live ledger feed
        </p>
      </div>

      {/* EMPTY STATE */}
      {data.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400">
          No transactions available
        </div>
      )}

      {/* LIST */}
      <div className="divide-y divide-slate-100">

        {data.map((t, i) => {
          const isIncome = t?.type === "income";

          return (
            <div
              key={t?._id || t?.id || i}
              className="flex flex-col md:grid md:grid-cols-5 gap-2 px-5 py-4 hover:bg-slate-50 transition"
            >

              {/* TITLE */}
              <div className="font-medium text-slate-900">
                {t?.title || "Untitled"}
              </div>

              {/* CATEGORY */}
              <div className="text-sm text-slate-500">
                {t?.category || "General"}
              </div>

              {/* DATE */}
              <div className="text-xs text-slate-400">
                {safeDate(t?.date || t?.createdAt).toLocaleDateString()}
              </div>

              {/* TYPE */}
              <div className="flex items-center gap-1 text-xs">
                {isIncome ? (
                  <ArrowUpRight size={14} className="text-emerald-500" />
                ) : (
                  <ArrowDownRight size={14} className="text-rose-500" />
                )}

                <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
                  {isIncome ? "Income" : "Expense"}
                </span>
              </div>

              {/* AMOUNT */}
              <div className={`text-right font-semibold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                {format(t?.amount)}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionHistory;