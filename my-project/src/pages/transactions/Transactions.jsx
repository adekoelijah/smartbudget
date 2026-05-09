



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
  =============================== */
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ==================================
            HEADER
        ================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Finance Center
              </p>

              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Transactions
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage cashflow, review spending activity, and maintain clean records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-[280px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Records</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {transactions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Filtered</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================
            METRICS
        ================================== */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Income</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              ₦{summary.income.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Expenses</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              ₦{summary.expense.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Net Balance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              ₦{summary.balance.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* ==================================
            QUICK ENTRY + FILTERS
        ================================== */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <TransactionHeader
              total={transactions.length}
              onSubmit={handleCreate}
              form={form}
              setForm={setForm}
              loading={creating}
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Filters
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Narrow results quickly using search and type.
              </p>
            </div>

            <TransactionFilters
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
            />
          </div>

        </div>

        {/* ==================================
            INTELLIGENCE PANEL
        ================================== */}
        {aiInsights && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Financial Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Generated from transaction patterns and budget behavior.
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {aiInsights.riskLevel} risk
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Income
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  ₦{aiInsights.income.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Expense
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  ₦{aiInsights.expense.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Net Position
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  ₦{aiInsights.net.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">
                {aiInsights.message}
              </p>

              {aiInsights.topCategory && (
                <p className="mt-2 text-xs text-slate-500">
                  Highest spend category:
                  <span className="ml-1 font-semibold text-slate-700">
                    {aiInsights.topCategory[0]}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ==================================
            TRANSACTION TABLE / LIST
        ================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest inflows and outflows.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
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