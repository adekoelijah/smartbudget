import Budget from "../../models/Budget.js";
import Transaction from "../../models/Transaction.js";

export const getBudgets = async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(budgets);
};

export const createBudget = async (req, res) => {
  const { name, limit, category } = req.body;

  if (!name || limit == null) {
    return res.status(400).json({ message: "Name and limit are required" });
  }

  const parsedLimit = Number(limit);
  if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
    return res.status(400).json({ message: "Budget limit must be a non-negative number" });
  }

  const budget = await Budget.create({
    user: req.user._id,
    name,
    limit: parsedLimit,
    category: category || "expense",
  });

  res.status(201).json(budget);
};

export const updateBudget = async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }

  const { name, limit, category } = req.body;

  budget.name = name ?? budget.name;

  if (limit != null) {
    const parsedLimit = Number(limit);
    if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
      return res.status(400).json({ message: "Budget limit must be a non-negative number" });
    }
    budget.limit = parsedLimit;
  }

  budget.category = category ?? budget.category;

  await budget.save();
  res.json(budget);
};

export const deleteBudget = async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }

  await Transaction.deleteMany({ user: req.user._id, category: budget.category });
  await budget.deleteOne();

  res.json({ message: "Budget deleted" });
};
