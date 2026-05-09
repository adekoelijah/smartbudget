
import api from "../../../services/api";

/* =========================
   NORMALIZER
========================= */
const normalize = (res) => {
  return res?.data ?? res ?? {};
};

/* =========================
   DASHBOARD METRICS
========================= */
export const getDashboardMetrics = async () => {
  try {
    const res = await api.get("/dashboard/metrics");
    const data = normalize(res);

    return {
      stats: data?.stats || {
        income: 0,
        expense: 0,
        balance: 0,
        transactions: 0,
      },
      budget: data?.budget || null,
      savingsRate: data?.savingsRate || 0,
    };
  } catch (err) {
    console.error("getDashboardMetrics error:", err);
    return {
      stats: {
        income: 0,
        expense: 0,
        balance: 0,
        transactions: 0,
      },
      savingsRate: 0,
    };
  }
};

/* =========================
   DASHBOARD DATA
========================= */
export const getDashboardData = async () => {
  try {
    const res = await api.get("/dashboard");
    const data = normalize(res);

    return {
      transactions: data?.transactions || [],
      analytics: data?.analytics || {
        monthly: [],
        categories: [],
        trend: [],
        budgetVsActual: [],
      },
      overview: data?.overview || {
        summary: {},
        insights: [],
      },
      balance: data?.balance || 0,
    };
  } catch (err) {
    console.error("getDashboardData error:", err);

    return {
      transactions: [],
      analytics: {
        monthly: [],
        categories: [],
        trend: [],
        budgetVsActual: [],
      },
      overview: {
        summary: {},
        insights: [],
      },
      balance: 0,
    };
  }
};

/* =========================
   OPTIONAL: SINGLE DASHBOARD FETCH
========================= */
export const getFullDashboard = async () => {
  try {
    const [metrics, data] = await Promise.all([
      getDashboardMetrics(),
      getDashboardData(),
    ]);

    return {
      stats: metrics.stats,
      savingsRate: metrics.savingsRate,
      ...data,
    };
  } catch (err) {
    console.error("getFullDashboard error:", err);
    return null;
  }
};