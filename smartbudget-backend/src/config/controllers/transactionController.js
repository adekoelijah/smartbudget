

// import { getIO } from "../../socket/socket.js";



// import Transaction from "../../models/Transaction.js";
// import Budget from "../../models/Budget.js";



// export const createTransaction = async (req, res) => {
//   try {
//     const { title, amount, category, type, date } = req.body;

//     if (!title || amount == null) {
//       return res.status(400).json({ message: "Title and amount are required" });
//     }

//     const parsedAmount = Number(amount);
//     if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
//       return res.status(400).json({ message: "Amount must be a non-negative number" });
//     }

//     const transaction = await Transaction.create({
//       user: req.user._id,
//       title,
//       amount: parsedAmount,
//       category: category || "general",
//       type: type || "expense",
//       date: date ? new Date(date) : Date.now(),
//     });

//     await updateBudgetTotals(req.user._id);

//     // 🔥 REAL-TIME SYNC (Stripe-style)
//     const io = getIO();

// io.to(req.user._id.toString()).emit("transaction:created", {
//   id: `evt_${Date.now()}`,          // or uuid
//   type: "transaction:created",
//   version: 1,
//   timestamp: Date.now(),
//   data: transaction,                // 👈 actual payload
// });

//     io.to(req.user._id.toString()).emit("dashboard:refresh", {
//       type: "dashboard:refresh",
//     });

//     return res.status(201).json(transaction);
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };

// export const updateTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     const { title, amount, category, type, date } = req.body;

//     transaction.title = title ?? transaction.title;

//     if (amount != null) {
//       const parsedAmount = Number(amount);
//       if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
//         return res.status(400).json({ message: "Amount must be a non-negative number" });
//       }
//       transaction.amount = parsedAmount;
//     }

//     transaction.category = category ?? transaction.category;
//     transaction.type = type ?? transaction.type;
//     transaction.date = date ? new Date(date) : transaction.date;

//     await transaction.save();
//     await updateBudgetTotals(req.user._id);

//     // 🔥 REAL-TIME UPDATE
//     const io = getIO();
//     io.to(req.user._id.toString()).emit("transaction:updated", {
//       type: "transaction:updated",
//       data: transaction,
//     });

//     io.to(req.user._id.toString()).emit("dashboard:refresh");

//     return res.json(transaction);
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };

// export const deleteTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     await Transaction.deleteOne({ _id: transaction._id });
//     await updateBudgetTotals(req.user._id);

//     // 🔥 REAL-TIME DELETE EVENT
//     const io = getIO();
//     io.to(req.user._id.toString()).emit("transaction:deleted", {
//       type: "transaction:deleted",
//       data: { id: req.params.id },
//     });

//     io.to(req.user._id.toString()).emit("dashboard:refresh");

//     return res.status(204).send();
//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//     });
//   }
// };





















// // const updateBudgetTotals = async (userId) => {
// //   const budgets = await Budget.find({ user: userId });
// //   const transactionTotals = await Transaction.aggregate([
// //     { $match: { user: userId, type: "expense" } },
// //     { $group: { _id: "$category", total: { $sum: "$amount" } } },
// //   ]);

// //   const spentByCategory = transactionTotals.reduce((acc, item) => {
// //     acc[item._id] = item.total;
// //     return acc;
// //   }, {});

// //   await Promise.all(
// //     budgets.map((budget) => {
// //       const spent = spentByCategory[budget.category] || 0;
// //       budget.spent = spent;
// //       return budget.save();
// //     })
// //   );
// // };

// // export const getTransactions = async (req, res) => {
// //   const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
// //   res.json(transactions);
// // };

// // export const createTransaction = async (req, res) => {
// //   const { title, amount, category, type, date } = req.body;

// //   if (!title || amount == null) {
// //     return res.status(400).json({ message: "Title and amount are required" });
// //   }

// //   const parsedAmount = Number(amount);
// //   if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
// //     return res.status(400).json({ message: "Amount must be a non-negative number" });
// //   }

// //   const transaction = await Transaction.create({
// //     user: req.user._id,
// //     title,
// //     amount: parsedAmount,
// //     category: category || "general",
// //     type: type || "expense",
// //     date: date ? new Date(date) : Date.now(),
// //   });

// //   await updateBudgetTotals(req.user._id);
// //   res.status(201).json(transaction);
// // };

// // export const updateTransaction = async (req, res) => {
// //   const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
// //   if (!transaction) {
// //     return res.status(404).json({ message: "Transaction not found" });
// //   }

// //   const { title, amount, category, type, date } = req.body;

// //   transaction.title = title ?? transaction.title;

// //   if (amount != null) {
// //     const parsedAmount = Number(amount);
// //     if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
// //       return res.status(400).json({ message: "Amount must be a non-negative number" });
// //     }
// //     transaction.amount = parsedAmount;
// //   }

// //   transaction.category = category ?? transaction.category;
// //   transaction.type = type ?? transaction.type;
// //   transaction.date = date ? new Date(date) : transaction.date;

// //   await transaction.save();
// //   await updateBudgetTotals(req.user._id);
// //   res.json(transaction);
// // };

// // export const deleteTransaction = async (req, res) => {
// //   const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
// //   if (!transaction) {
// //     return res.status(404).json({ message: "Transaction not found" });
// //   }

// //   await Transaction.deleteOne({ _id: transaction._id });
// //   await updateBudgetTotals(req.user._id);

// //   res.status(204).send();
// // };

// import Transaction from "../../models/Transaction.js";
// import Budget from "../../models/Budget.js";
// import { getIO } from "../../socket/socket.js";

// /* ===============================
//    Budget Sync
// ================================= */
// const updateBudgetTotals = async (userId) => {
//   const budgets = await Budget.find({ user: userId });

//   const totals = await Transaction.aggregate([
//     { $match: { user: userId, type: "expense" } },
//     {
//       $group: {
//         _id: "$category",
//         total: { $sum: "$amount" },
//       },
//     },
//   ]);


//   //new code 

//   const spentMap = totals.reduce((acc, item) => {
//     acc[item._id] = item.total;
//     return acc;
//   }, {});

//   await Promise.all(
//     budgets.map((budget) => {
//       budget.spent = spentMap[budget.category] || 0;
//       return budget.save();
//     })
//   );
// };

// /* ===============================
//    GET ALL
// ================================= */
// export const getTransactions = async (req, res) => {
//   const transactions = await Transaction.find({
//     user: req.user._id,
//   }).sort({ createdAt: -1 });

//   res.json(transactions);
// };

// /* ===============================
//    CREATE
// ================================= */
// export const createTransaction = async (req, res) => {
//   const { title, amount, category, type, date } = req.body;

//   const transaction = await Transaction.create({
//     user: req.user._id,
//     title,
//     amount,
//     category,
//     type,
//     date,
//   });

//   await updateBudgetTotals(req.user._id);

//   getIO()
//     .to(req.user._id.toString())
//     .emit("dashboard:event", {
//       type: "transaction:created",
//       data: transaction,
//     });

//   res.status(201).json(transaction);
// };

// /* ===============================
//    UPDATE
// ================================= */
// export const updateTransaction = async (req, res) => {
//   const transaction = await Transaction.findOne({
//     _id: req.params.id,
//     user: req.user._id,
//   });

//   if (!transaction) {
//     return res.status(404).json({
//       message: "Transaction not found",
//     });
//   }

//   Object.assign(transaction, req.body);

//   await transaction.save();
//   await updateBudgetTotals(req.user._id);

//   res.json(transaction);
// };

// /* ===============================
//    DELETE
// ================================= */
// export const deleteTransaction = async (req, res) => {
//   await Transaction.deleteOne({
//     _id: req.params.id,
//     user: req.user._id,
//   });

//   await updateBudgetTotals(req.user._id);

//   res.status(204).send();
// };


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