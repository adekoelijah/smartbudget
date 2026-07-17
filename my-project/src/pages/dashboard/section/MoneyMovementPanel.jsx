import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Repeat, Plus } from "lucide-react";

const incomeCategories = ["Salary", "Freelance", "Business", "Bonus", "Other"];
const expenseCategories = ["Food", "Transport", "Bills", "Shopping", "Other"];

const MoneyMovementPanel = ({
  onCreateTransaction,
  lastTransaction,
}) => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const categories =
    type === "income" ? incomeCategories : expenseCategories;

  const reset = () => {
    setAmount("");
    setCategory("");
  };

  const handleSubmit = () => {
    if (!amount || !category) return;

    const payload = {
      type,
      amount: Number(amount),
      category,
      title: category,
      date: new Date().toISOString().slice(0, 10),
    };

    onCreateTransaction?.(payload);
    reset();
  };

  const repeatLast = () => {
    if (!lastTransaction) return;

    setType(lastTransaction.type);
    setAmount(lastTransaction.amount);
    setCategory(lastTransaction.category);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Money Movement
          </h2>
          <p className="text-xs text-slate-500">
            Quick financial entry panel
          </p>
        </div>

        <button
          onClick={repeatLast}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"
        >
          <Repeat size={14} />
          Repeat Last
        </button>
      </div>

      {/* TYPE SWITCH */}
      <div className="grid grid-cols-2 gap-3 mb-4">

        <button
          onClick={() => setType("expense")}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border ${
            type === "expense"
              ? "bg-rose-50 border-rose-200"
              : "border-slate-200"
          }`}
        >
          <ArrowDownCircle className="text-rose-500" size={18} />
          Expense
        </button>

        <button
          onClick={() => setType("income")}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border ${
            type === "income"
              ? "bg-emerald-50 border-emerald-200"
              : "border-slate-200"
          }`}
        >
          <ArrowUpCircle className="text-emerald-500" size={18} />
          Income
        </button>

      </div>

      {/* INPUTS */}
      <div className="space-y-3">

        {/* AMOUNT */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-slate-400"
        />

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800"
        >
          <Plus size={16} />
          Add Transaction
        </button>

      </div>
    </div>
  );
};

export default MoneyMovementPanel;