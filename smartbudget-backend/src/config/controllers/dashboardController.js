//import Transaction from "../models/transaction.js";
import Transaction from "../../models/Transaction.js";
import mongoose from "mongoose";




//import Transaction from "../models/Transaction.js";

/**
 * 📊 FINTECH METRICS ENGINE
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId });

    const incomeTx = transactions.filter(t => t.type === "income");
    const expenseTx = transactions.filter(t => t.type === "expense");

    const income = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const transactionCount = transactions.length;

    // 📈 Growth (month-over-month)
    const now = new Date();
    const currentMonth = now.getMonth();

    const thisMonthIncome = incomeTx
      .filter(t => new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = incomeTx
      .filter(t => new Date(t.date).getMonth() === currentMonth - 1)
      .reduce((sum, t) => sum + t.amount, 0);

    const growth =
      lastMonthIncome === 0
        ? 100
        : ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;

    // 📊 Spending rate
    const spendingRate =
      income === 0 ? 0 : (expenses / income) * 100;

    // ⚠ Risk engine
    const riskScore =
      spendingRate > 100
        ? 85
        : spendingRate > 70
        ? 55
        : 20;

    res.json({
      success: true,

      stats: {
        balance,
        income,
        expenses,
        transactions: transactionCount,
        growth: Number(growth.toFixed(2)),
        spendingRate: Number(spendingRate.toFixed(2)),
        riskScore,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 
 * =========================
 * 📊 GET DASHBOARD DATA
 * =========================
 * Supports:
 * - date range filtering
 * - income/expense aggregation
 * - summary stats
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // QUERY PARAMS
    // =========================
    const { range = "30d" } = req.query;

    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "14d":
        startDate.setDate(startDate.getDate() - 14);
        break;
      case "30d":
      default:
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // =========================
    // FETCH TRANSACTIONS
    // =========================
    const transactions = await Transaction.find({
      user: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    // =========================
    // COMPUTE FINANCIAL STATS
    // =========================
    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expenses += tx.amount;
      }
    });

    const balance = income - expenses;

    const stats = {
      balance,
      income,
      expenses,
      transactions: transactions.length,
    };

    // =========================
    // RESPONSE PAYLOAD
    // =========================
    res.status(200).json({
      success: true,
      data: {
        stats,
        transactions,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};