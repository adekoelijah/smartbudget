
import Transaction from "../../models/Transaction.js";
import Budget from "../../models/Budget.js";
import { getIO } from "../../socket/socket.js";
import { buildAnalytics } from "../../services/analyticsService.js";
import {
  createTransactionNotification,
} from "../../services/notificationService.js";

/* ===============================
   BUDGET SYNC
================================= */

const updateBudgetTotals = async (userId) => {
  const budgets = await Budget.find({
    user: userId,
  });

  const totals = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
      },
    },
    {
      $group: {
        _id: "$category",
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const spentMap = totals.reduce(
    (acc, item) => {
      acc[item._id] = item.total;
      return acc;
    },
    {}
  );

  await Promise.all(
    budgets.map((budget) => {
      budget.spent =
        spentMap[budget.category] || 0;

      return budget.save();
    })
  );
};

/* ===============================
   SOCKET EMITTER
================================= */

const emitDashboardUpdates = async (
  userId,
  transaction,
  actionType
) => {
  const io = getIO();

  // Dashboard event
  io.to(userId.toString()).emit(
    "dashboard:event",
    {
      type: actionType,
      data: transaction,
    }
  );

  // Analytics update
  const analytics =
    await buildAnalytics(userId);

  io.to(userId.toString()).emit(
    "analyticsUpdated",
    analytics
  );
};

/* ===============================
   GET ALL TRANSACTIONS
================================= */

export const getTransactions = async (
  req,
  res
) => {
  try {
    const transactions =
      await Transaction.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.json(transactions);
  } catch (err) {
    console.error(
      "GET_TRANSACTIONS_ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

/* ===============================
   CREATE TRANSACTION
================================= */

export const createTransaction = async (
  req,
  res
) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      date,
    } = req.body;

    /* ===============================
       CREATE TRANSACTION
    ================================= */

    const transaction =
      await Transaction.create({
        user: req.user._id,
        title,
        amount,
        category,
        type,
        date,
      });

    /* ===============================
       SYNC BUDGETS
    ================================= */

    await updateBudgetTotals(
      req.user._id
    );

    /* ===============================
       CREATE NOTIFICATION
    ================================= */

    try {
      const formattedAmount =
        new Intl.NumberFormat(
          "en-NG",
          {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
          }
        ).format(amount);

      const isExpense =
        type === "expense";

      await createTransactionNotification({
        userId: req.user._id,

        title: isExpense
          ? "Expense Recorded"
          : "Income Recorded",

        message: isExpense
          ? `Your expense "${title}" of ${formattedAmount} was successfully recorded.`
          : `Your income "${title}" of ${formattedAmount} was successfully recorded.`,

        metadata: {
          transactionId:
            transaction._id,
          transactionType: type,
          amount,
          category,
        },
      });

      console.log(
        "TRANSACTION_NOTIFICATION_CREATED:",
        transaction._id.toString()
      );
    } catch (notificationError) {
      /*
       * IMPORTANT:
       * A notification failure must not
       * make a successful transaction
       * appear to have failed.
       */

      console.error(
        "TRANSACTION_NOTIFICATION_ERROR:",
        notificationError
      );
    }

    /* ===============================
       EMIT DASHBOARD UPDATES
    ================================= */

    await emitDashboardUpdates(
      req.user._id,
      transaction,
      "transaction:created"
    );

    /* ===============================
       RESPONSE
    ================================= */

    return res.status(201).json(
      transaction
    );
  } catch (err) {
    console.error(
      "CREATE_TRANSACTION_ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

/* ===============================
   UPDATE TRANSACTION
================================= */

export const updateTransaction = async (
  req,
  res
) => {
  try {
    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    Object.assign(
      transaction,
      req.body
    );

    await transaction.save();

    /* ===============================
       SYNC BUDGETS
    ================================= */

    await updateBudgetTotals(
      req.user._id
    );

    /* ===============================
       EMIT DASHBOARD UPDATES
    ================================= */

    await emitDashboardUpdates(
      req.user._id,
      transaction,
      "transaction:updated"
    );

    return res.json(transaction);
  } catch (err) {
    console.error(
      "UPDATE_TRANSACTION_ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

/* ===============================
   DELETE TRANSACTION
================================= */

export const deleteTransaction = async (
  req,
  res
) => {
  try {
    const deleted =
      await Transaction.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!deleted) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    /* ===============================
       SYNC BUDGETS
    ================================= */

    await updateBudgetTotals(
      req.user._id
    );

    /* ===============================
       EMIT DASHBOARD UPDATES
    ================================= */

    await emitDashboardUpdates(
      req.user._id,
      deleted,
      "transaction:deleted"
    );

    return res.status(204).send();
  } catch (err) {
    console.error(
      "DELETE_TRANSACTION_ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};
