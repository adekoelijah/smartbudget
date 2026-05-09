import { useEffect, useState, useCallback } from "react";
import { getBudgets } from "../services/budgetService";

/**
 * 🧠 SAAS BUDGET HOOK
 * Centralized budget state management layer
 * Designed for scalability, caching, and real-time upgrade
 */

export const useBudgets = (filters = {}) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 📡 FETCH BUDGETS (stable reference for reuse)
   */
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBudgets(filters);

      // 🧹 ensure safe fallback structure
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * ⚡ INITIAL LOAD
   * Safe effect: no cascading setState loops
   */
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  /**
   * 🔄 MANUAL REFRESH (SaaS UX pattern)
   */
  const refetch = useCallback(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  /**
   * ➕ COMPUTED VALUES (safe derived state)
   */
  const totalBudget = budgets.reduce(
    (sum, b) => sum + (b.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, b) => sum + (b.spent || 0),
    0
  );

  const remaining = totalBudget - totalSpent;

  return {
    budgets,
    loading,
    error,
    refetch,

    // 📊 derived SaaS metrics
    totalBudget,
    totalSpent,
    remaining,
  };
};