
import { useEffect, useState, useMemo } from "react";

import TransactionHeader from "./components/TransactionHeader";
import TransactionList from "./components/TransactionList";
import TransactionEmptyState from "./components/TransactionEmptyState";
import TransactionFilters from "./components/TransactionFilters";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../../services/transactionService";

import { useBudgets } from "../../hooks/useBudgets";
import { computeFinancialInsights } from "../../utils/financeAI";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { budgets } = useBudgets?.() || { budgets: [] };

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "general",
  });

  /* ===============================
     FETCH TRANSACTIONS
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data || []);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     FILTER + SEARCH
  // =============================== */
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        if (filter === "all") return true;
        return item.type === filter;
      })
      .filter((item) =>
        item.title?.toLowerCase().includes(search.toLowerCase())
      );
  }, [transactions, filter, search]);

  
  /* ===============================
     SUMMARY METRICS
  =============================== */
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
      if (item.type === "income") {
        income += Number(item.amount);
      } else {
        expense += Number(item.amount);
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  /* ===============================
     AI INSIGHTS
  =============================== */
  const aiInsights = useMemo(() => {
    return computeFinancialInsights(transactions, budgets);
  }, [transactions, budgets]);

  /* ===============================
     CREATE TRANSACTION
  =============================== */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.title || !form.amount) return;

    try {
      setCreating(true);

      const created = await createTransaction({
        ...form,
        amount: Number(form.amount),
      });

      setTransactions((prev) => [created, ...prev]);

      setForm({
        title: "",
        amount: "",
        type: "expense",
        category: "general",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  /* ===============================
     DELETE TRANSACTION
  =============================== */
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
  <div className="min-h-screen bg-slate-50">
    
    {/* SAFE CONTAINER (FIXS FLOATING ISSUE) */}
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

      {/* ================= HEADER ================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Finance Center
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
              Transactions
            </h1>

            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Manage cashflow, review spending activity, and maintain clean records.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 w-full lg:w-[280px]">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Records</p>
              <p className="mt-1 text-lg font-semibold">
                {transactions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Filtered</p>
              <p className="mt-1 text-lg font-semibold">
                {filteredTransactions.length}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================= METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-slate-500">Income</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold">
            ₦{summary.income.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expenses</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold">
            ₦{summary.expense.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-slate-500">Net Balance</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold">
            ₦{summary.balance.toLocaleString()}
          </h2>
        </div>

      </div>

      {/* ================= ENTRY + FILTER ================= */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
          <TransactionHeader
            total={transactions.length}
            onSubmit={handleCreate}
            form={form}
            setForm={setForm}
            loading={creating}
          />
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <TransactionFilters
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />
        </div>

      </div>

      {/* ================= AI INSIGHTS ================= */}
      {aiInsights && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

            <div>
              <h2 className="text-lg font-semibold">
                Financial Insights
              </h2>

              <p className="text-sm text-slate-500">
                Generated from transaction patterns
              </p>
            </div>

            <span className="w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase">
              {aiInsights.riskLevel} risk
            </span>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Income</p>
              <p className="text-xl font-semibold">
                ₦{aiInsights.income.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Expense</p>
              <p className="text-xl font-semibold">
                ₦{aiInsights.expense.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Net</p>
              <p className="text-xl font-semibold">
                ₦{aiInsights.net.toLocaleString()}
              </p>
            </div>

          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-medium">
              {aiInsights.message}
            </p>
          </div>

        </div>
      )}

      {/* ================= LIST ================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">

        <h2 className="text-lg font-semibold mb-4">
          Activity
        </h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <TransactionEmptyState />
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDelete}
          />
        )}

      </div>

    </div>
  </div>
);
};

export default Transactions;