


// import { useEffect, useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import {
//   Sparkles,
//   TrendingUp,
//   ShieldCheck,
//   AlertTriangle,
// } from "lucide-react";

// import BudgetCard from "./components/BudgetCard";
// import BudgetModal from "./components/BudgetModal";
// import BudgetHeader from "./components/BudgetHeader";
// import BudgetEmptyState from "./components/BudgetEmptyState";

// import {
//   getBudgets,
//   createBudget,
//   updateBudget,
//   deleteBudget,
// } from "../../services/budgetService";

// const Budgets = () => {
//   const [budgets, setBudgets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [search, setSearch] = useState("");

//   const [form, setForm] = useState({
//     name: "",
//     limit: "",
//     category: "expense",
//   });

//   /* FETCH */
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await getBudgets();
//         setBudgets(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   /* FILTER */
//   const filteredBudgets = useMemo(() => {
//     return budgets.filter((b) =>
//       b.name.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search, budgets]);

//   /* AI INSIGHTS */
//   const aiInsights = useMemo(() => {
//     if (!budgets.length) return null;

//     let totalLimit = 0;
//     let totalSpent = 0;

//     const insights = budgets.map((b) => {
//       const spent = b.spent || 0;
//       const limit = b.limit || 1;

//       const usage = (spent / limit) * 100;

//       totalLimit += limit;
//       totalSpent += spent;

//       let status = "safe";
//       let message = "Healthy spending pattern";

//       if (usage >= 90) {
//         status = "critical";
//         message = "Overspending risk detected";
//       } else if (usage >= 70) {
//         status = "warning";
//         message = "Approaching spending limit";
//       }

//       return { ...b, usage, status, message };
//     });

//     const overallUsage = (totalSpent / totalLimit) * 100;

//     return {
//       insights,
//       overallUsage,
//       totalLimit,
//       totalSpent,
//       recommendation:
//         overallUsage > 80
//           ? "Reduce expenses in high-risk budgets."
//           : "Your financial discipline looks strong.",
//     };
//   }, [budgets]);

//   /* CREATE / UPDATE */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (editing) {
//         const updated = await updateBudget(editing._id, form);

//         setBudgets((prev) =>
//           prev.map((b) => (b._id === editing._id ? updated : b))
//         );
//       } else {
//         const created = await createBudget(form);
//         setBudgets((prev) => [created, ...prev]);
//       }

//       resetForm();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleEdit = (budget) => {
//     setEditing(budget);

//     setForm({
//       name: budget.name,
//       limit: budget.limit,
//       category: budget.category,
//     });

//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     await deleteBudget(id);
//     setBudgets((prev) => prev.filter((b) => b._id !== id));
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       limit: "",
//       category: "expense",
//     });

//     setEditing(null);
//     setModalOpen(false);
//   };

//   const usageColor =
//     aiInsights?.overallUsage >= 80
//       ? "text-red-400"
//       : aiInsights?.overallUsage >= 60
//       ? "text-yellow-400"
//       : "text-emerald-400";

//   return (
//     <div className="space-y-8">

//       {/* HEADER */}
//       <BudgetHeader
//         search={search}
//         setSearch={setSearch}
//         onCreateClick={() => setModalOpen(true)}
//         totalBudgets={budgets.length}
//         totalSpent={aiInsights?.totalSpent || 0}
//       />

//       {/* AI INSIGHTS CARD */}
//       {aiInsights && (
//         <motion.div
//           initial={{ opacity: 0, y: 14 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl"
//         >
//           {/* Glow */}
//           <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"></div>

//           <div className="relative z-10 grid gap-6 md:grid-cols-3">

//             {/* Left */}
//             <div className="md:col-span-2">
//               <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
//                 <Sparkles size={15} />
//                 AI Financial Insights
//               </div>

//               <h2 className="text-2xl font-bold text-white">
//                 Smart Spending Analysis
//               </h2>

//               <p className="mt-3 text-sm leading-relaxed text-slate-400">
//                 {aiInsights.recommendation}
//               </p>
//             </div>

//             {/* Right Stats */}
//             <div className="space-y-3">
//               <div className="rounded-2xl bg-white/5 p-4">
//                 <p className="text-xs text-slate-400">Overall Usage</p>
//                 <h3 className={`mt-1 text-2xl font-bold ${usageColor}`}>
//                   {aiInsights.overallUsage.toFixed(1)}%
//                 </h3>
//               </div>

//               <div className="rounded-2xl bg-white/5 p-4">
//                 <p className="text-xs text-slate-400">Security Status</p>
//                 <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
//                   {aiInsights.overallUsage > 80 ? (
//                     <>
//                       <AlertTriangle size={18} className="text-red-400" />
//                       Alert
//                     </>
//                   ) : (
//                     <>
//                       <ShieldCheck size={18} className="text-emerald-400" />
//                       Stable
//                     </>
//                   )}
//                 </h3>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* CONTENT */}
//       {loading ? (
//         <div className="rounded-3xl border border-white/10 bg-[#0f172a] py-20 text-center text-slate-400 shadow-xl">
//           Loading budgets...
//         </div>
//       ) : filteredBudgets.length === 0 ? (
//         <BudgetEmptyState onCreateClick={() => setModalOpen(true)} />
//       ) : (
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
//           {aiInsights.insights
//             .filter((b) =>
//               b.name.toLowerCase().includes(search.toLowerCase())
//             )
//             .map((budget) => (
//               <BudgetCard
//                 key={budget._id}
//                 budget={budget}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//                 aiStatus={budget.status}
//                 aiMessage={budget.message}
//               />
//             ))}
//         </div>
//       )}

//       {/* MODAL */}
//       {modalOpen && (
//         <BudgetModal
//           form={form}
//           setForm={setForm}
//           onSubmit={handleSubmit}
//           onClose={resetForm}
//           editing={editing}
//         />
//       )}
//     </div>
//   );
// };

// export default Budgets;
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