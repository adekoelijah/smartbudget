


import Transaction from "../../models/Transaction.js";
import Budget from "../../models/Budget.js";
import { getIO } from "../../socket/socket.js";
//import { buildAnalytics } from "../services/analyticsService.js";
import { buildAnalytics } from "../../services/analyticsService.js";

/* ===============================
   Budget Sync
================================= */
const updateBudgetTotals = async (userId) => {
  const budgets = await Budget.find({ user: userId });

  const totals = await Transaction.aggregate([
    { $match: { user: userId, type: "expense" } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const spentMap = totals.reduce((acc, item) => {
    acc[item._id] = item.total;
    return acc;
  }, {});

  await Promise.all(
    budgets.map((budget) => {
      budget.spent = spentMap[budget.category] || 0;
      return budget.save();
    })
  );
};

/* ===============================
   SOCKET EMITTER (NEW - CENTRALIZED)
================================= */
const emitDashboardUpdates = async (userId, transaction, actionType) => {
  const io = getIO();

  // Existing event (for lists, activity feeds, etc.)
  io.to(userId.toString()).emit("dashboard:event", {
    type: actionType,
    data: transaction,
  });

  // 🔥 Analytics event (for charts + summary cards)
  const analytics = await buildAnalytics(userId);

  io.to(userId.toString()).emit("analyticsUpdated", analytics);
};

/* ===============================
   GET ALL
================================= */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   CREATE
================================= */
export const createTransaction = async (req, res) => {
  try {
    const { title, amount, category, type, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      category,
      type,
      date,
    });

    // Sync budgets
    await updateBudgetTotals(req.user._id);

    // Emit updates (dashboard + analytics)
    await emitDashboardUpdates(
      req.user._id,
      transaction,
      "transaction:created"
    );

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPDATE
================================= */
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    Object.assign(transaction, req.body);

    await transaction.save();

    // Sync budgets
    await updateBudgetTotals(req.user._id);

    // Emit updates
    await emitDashboardUpdates(
      req.user._id,
      transaction,
      "transaction:updated"
    );

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   DELETE
================================= */
export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // Sync budgets
    await updateBudgetTotals(req.user._id);

    // Emit updates
    await emitDashboardUpdates(
      req.user._id,
      deleted,
      "transaction:deleted"
    );

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};