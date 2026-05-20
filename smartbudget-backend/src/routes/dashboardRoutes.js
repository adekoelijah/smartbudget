

import express from "express";
import Transaction from "../models/Transaction.js";

import Budget from "../models/Budget.js";
//New add

import { getDashboardMetrics } from "../config/controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();





/* ======================================================
   🔧 HELPERS (Production-grade aggregation utilities)
====================================================== */

const getDateFilter = (range) => {
  const now = new Date();

  const map = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
  };

  const days = map[range] || 30;

  return new Date(now.setDate(now.getDate() - days));
};

const calculateRiskScore = (income, expense) => {
  if (income === 0 && expense > 0) return 90;

  const ratio = expense / (income || 1);

  if (ratio > 1) return 85;
  if (ratio > 0.7) return 60;
  if (ratio > 0.4) return 35;
  return 15;
};

const generateInsights = (income, expense, budgets) => {
  const insights = [];

  if (expense > income) {
    insights.push({
      type: "danger",
      title: "Overspending Alert",
      message: "You are currently spending more than you earn.",
    });
  }

  if (expense < income * 0.4) {
    insights.push({
      type: "success",
      title: "Strong Savings Pattern",
      message: "You are maintaining a healthy savings rate.",
    });
  }

  const highBudget = budgets.find(
    (b) => b.limit && b.spent / b.limit > 0.8
  );

  if (highBudget) {
    insights.push({
      type: "warning",
      title: "Budget Warning",
      message: `${highBudget.name} is close to its limit.`,
    });
  }

  return insights;
};

/* ======================================================
   📊 MAIN DASHBOARD ENDPOINT (Stripe-style aggregation)c
====================================================== */

//metric
router.get("/metrics", protect, getDashboardMetrics);

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const range = req.query.range || "30d";

    const dateFilter = getDateFilter(range);

    /* =========================
       📦 DATA FETCH (OPTIMIZED)
    ========================== */

    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: dateFilter },
    }).sort({ createdAt: -1 });

    const budgets = await Budget.find({ userId });
    

    /* =========================
       💰 FINANCIAL METRICS
    ========================== */

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    /* =========================
       📊 BUDGET ANALYTICS
    ========================== */

    const budgetUtilization = budgets.map((b) => ({
      id: b._id,
      name: b.name,
      limit: b.limit,
      spent: b.spent,
      usage: b.limit ? (b.spent / b.limit) * 100 : 0,
      status:
        b.spent / b.limit > 0.9
          ? "critical"
          : b.spent / b.limit > 0.7
          ? "warning"
          : "healthy",
    }));

    const budgetHealth =
      budgets.length === 0
        ? 100
        : Math.round(
            budgets.reduce((acc, b) => {
              const usage = b.limit ? b.spent / b.limit : 0;
              return acc + (1 - Math.min(usage, 1));
            }, 0) / budgets.length * 100
          );

    /* =========================
       🧠 INSIGHTS ENGINE
    ========================== */

    const insights = generateInsights(income, expense, budgets);

    const riskScore = calculateRiskScore(income, expense);

    /* =========================
       📤 RESPONSE
    ========================== */

    return res.json({
      success: true,

      meta: {
        range,
      },

      stats: {
        balance,
        income,
        expenses: expense,
        transactions: transactions.length,
        budgetCount: budgets.length,
        budgetHealth,
      },

      transactions,
      budgets,
      budgetUtilization,

      insights,

      riskScore,

      summary:
        expense > income
          ? "High spending detected. Review your expenses."
          : "Your financial health is stable and improving.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;