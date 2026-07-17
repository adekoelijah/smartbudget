// import { useEffect, useState, useCallback } from "react";
// import { getBudgets } from "../services/budgetService";

// /**
//  * 🧠 SAAS BUDGET HOOK
//  * Centralized budget state management layer
//  * Designed for scalability, caching, and real-time upgrade
//  */

// export const useBudgets = (filters = {}) => {
//   const [budgets, setBudgets] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /**
//    * 📡 FETCH BUDGETS (stable reference for reuse)
//    */
//   const fetchBudgets = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const data = await getBudgets(filters);

//       // 🧹 ensure safe fallback structure
//       setBudgets(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err?.message || "Failed to load budgets");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   /**
//    * ⚡ INITIAL LOAD
//    * Safe effect: no cascading setState loops
//    */
//   useEffect(() => {
//     fetchBudgets();
//   }, [fetchBudgets]);

//   /**
//    * 🔄 MANUAL REFRESH (SaaS UX pattern)
//    */
//   const refetch = useCallback(() => {
//     fetchBudgets();
//   }, [fetchBudgets]);

//   /**
//    * ➕ COMPUTED VALUES (safe derived state)
//    */
//   const totalBudget = budgets.reduce(
//     (sum, b) => sum + (b.amount || 0),
//     0
//   );

//   const totalSpent = budgets.reduce(
//     (sum, b) => sum + (b.spent || 0),
//     0
//   );

//   const remaining = totalBudget - totalSpent;

//   return {
//     budgets,
//     loading,
//     error,
//     refetch,

//     // 📊 derived SaaS metrics
//     totalBudget,
//     totalSpent,
//     remaining,
//   };
// };


import { useEffect, useState, useCallback } from "react";
import { getBudgets } from "../services/budgetService";

const DEFAULT_FILTERS = {};

export const useBudgets = (filters = DEFAULT_FILTERS) => {

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBudgets(filters);

      setBudgets(
        Array.isArray(data)
          ? data
          : data?.budgets || []
      );

    } catch (err) {
      setError(err?.message || "Failed to load budgets");
      setBudgets([]);

    } finally {
      setLoading(false);
    }

  }, [filters]);


  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);


  const refetch = useCallback(() => {
    fetchBudgets();
  }, [fetchBudgets]);


  const totalBudget = budgets.reduce(
    (sum, b) => sum + Number(b.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, b) => sum + Number(b.spent || 0),
    0
  );


  return {
    budgets,
    loading,
    error,
    refetch,
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
  };
};