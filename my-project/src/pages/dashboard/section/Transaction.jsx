import useTransactions from "../hooks/useTransactions";
import RealTimeBalanceEngine from "../components/RealTimeBalanceEngine";
import SummaryCards from "../components/SummaryCards";
import TransactionHistory from "../components/TransactionHistory";
import TransactionModal from "../components/TransactionModal";
import { useState } from "react";

const Transaction = () => {
  const {
    transactions,
    loading,
    addTransaction,
  } = useTransactions();

  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-40 bg-white rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* BALANCE ENGINE */}
      <RealTimeBalanceEngine transactions={transactions} />

      {/* SUMMARY */}
      <SummaryCards
        summary={{
          totalIncome: transactions
            .filter((t) => t.type === "income")
            .reduce((a, b) => a + Number(b.amount), 0),

          totalExpense: transactions
            .filter((t) => t.type === "expense")
            .reduce((a, b) => a + Number(b.amount), 0),
        }}
      />

      {/* HISTORY */}
      <TransactionHistory data={transactions} />

      {/* ADD BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg"
      >
        + Add Transaction
      </button>

      {/* MODAL */}
      <TransactionModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
};

export default Transaction;