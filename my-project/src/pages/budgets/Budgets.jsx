
import { useEffect, useState, useMemo, useCallback } from "react";

import BudgetCard from "./components/BudgetCard";
import BudgetModal from "./components/BudgetModal";
import BudgetHeader from "./components/BudgetHeader";
import BudgetEmptyState from "./components/BudgetEmptyState";

import { getBudgets, createBudget,deleteBudget } from "../../services/budgetService";
import { getTransactions } from "../../services/transactionService";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    limit: "",
    categoryKey: "food", // 👈 NEW STABLE FIELD

  });
//Handle delete
  const handleDelete = async (id) => {
  try {
    await deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b._id !== id));
  } catch (err) {
    console.error("Delete failed:", err);
  }
};
//Edit delete
const handleEdit = (budget) => {
  setEditing(budget);
  setForm({
    name: budget.name,
    limit: budget.limit,
    categoryKey: budget.categoryKey,
  });
  setModalOpen(true);
};

  /* ================= STABLE FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [budgetData, transactionData] = await Promise.all([
        getBudgets(),
        getTransactions(),
      ]);

      setBudgets(budgetData);
      setTransactions(transactionData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= REAL-TIME SYNC ================= */
  useEffect(() => {
    const handleSync = () => {
      fetchData();
    };

    window.addEventListener("budget-sync", handleSync);

    return () => {
      window.removeEventListener("budget-sync", handleSync);
    };
  }, [fetchData]);

  /* ================= CREATE BUDGET ================= */
  const handleCreateBudget = async () => {
  try {
    if (!form.name || !form.limit) return;

    const newBudget = await createBudget({
      name: form.name.trim(),
      limit: Number(form.limit),
      categoryKey: form.categoryKey, // 👈 IMPORTANT
    });

    setBudgets((prev) => [newBudget, ...prev]);

    setForm({
      name: "",
      limit: "",
      categoryKey: "food",
    });

    setModalOpen(false);
  } catch (err) {
    console.error("Create budget error:", err);
  }
};
  /* ================= LIVE CALCULATION ENGINE ================= */
  const enrichedBudgets = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category?.toLowerCase() === budget.name?.toLowerCase()
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const limit = Number(budget.limit || 0);
      const remaining = limit - spent;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;

      let status = "safe";
      if (percent >= 90) status = "critical";
      else if (percent >= 70) status = "warning";

      return {
        ...budget,
        spent,
        remaining,
        percent,
        status,
      };
    });
  }, [budgets, transactions]);

  /* ================= FILTER ================= */
  const filteredBudgets = useMemo(() => {
    return enrichedBudgets.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, enrichedBudgets]);

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    const totalSpent = enrichedBudgets.reduce(
      (sum, b) => sum + b.spent,
      0
    );

    const totalLimit = enrichedBudgets.reduce(
      (sum, b) => sum + Number(b.limit || 0),
      0
    );

    const remaining = totalLimit - totalSpent;
    const usage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    return { totalSpent, totalLimit, remaining, usage };
  }, [enrichedBudgets]);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <BudgetHeader
        search={search}
        setSearch={setSearch}
        onCreateClick={() => setModalOpen(true)}
        totalBudgets={budgets.length}
        totalSpent={totals.totalSpent}
      />

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="rounded-2xl bg-[#0f172a] p-5 border border-white/10">
          <p className="text-slate-400 text-sm">Total Spent</p>
          <h2 className="text-white text-2xl font-bold mt-2">
            ₦{totals.totalSpent.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-[#0f172a] p-5 border border-white/10">
          <p className="text-slate-400 text-sm">Total Budget</p>
          <h2 className="text-white text-2xl font-bold mt-2">
            ₦{totals.totalLimit.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-[#0f172a] p-5 border border-white/10">
          <p className="text-slate-400 text-sm">Remaining</p>
          <h2 className="text-emerald-400 text-2xl font-bold mt-2">
            ₦{totals.remaining.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-[#0f172a] p-5 border border-white/10">
          <p className="text-slate-400 text-sm">Usage</p>
          <h2 className="text-white text-2xl font-bold mt-2">
            {totals.usage.toFixed(1)}%
          </h2>
        </div>

      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center text-slate-400 py-20">
          Loading budgets...
        </div>
      ) : filteredBudgets.length === 0 ? (
        <BudgetEmptyState onCreateClick={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBudgets.map((budget) => (
            <BudgetCard
            key={budget._id}
            budget={budget}
            onEdit={handleEdit}
            onDelete={handleDelete}
              />
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <BudgetModal
          form={form}
          setForm={setForm}
          onSubmit={handleCreateBudget}
          onClose={() => setModalOpen(false)}
          editing={editing}
        />
      )}

    </div>
  );
};

export default Budgets;