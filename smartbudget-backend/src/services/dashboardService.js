import Transaction from "../models/transaction.js";
import mongoose from "mongoose";

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