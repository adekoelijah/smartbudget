import express from "express";
import protect from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../config/controllers/budgetController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(asyncHandler(getBudgets)).post(asyncHandler(createBudget));
router.route("/:id").put(asyncHandler(updateBudget)).delete(asyncHandler(deleteBudget));


router.post("/sync", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const budgets = await Budget.find({ user: userId });
    const transactions = await Transaction.find({ user: userId });

    const spentByCategory = {};

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        spentByCategory[t.category] =
          (spentByCategory[t.category] || 0) + t.amount;
      });

    const updatedBudgets = await Promise.all(
      budgets.map(async (b) => {
        b.spent = spentByCategory[b.category] || 0;
        await b.save();
        return b;
      })
    );

    return res.json({
      success: true,
      budgets: updatedBudgets
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


router.post("/recalculate", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    await updateBudgetTotals(userId); // your existing function

    res.json({ message: "Budgets recalculated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
