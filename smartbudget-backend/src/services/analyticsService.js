import Transaction from "../models/Transaction.js";

export const buildAnalytics = async (userId) => {
  const transactions = await Transaction.find({ user: userId });

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Monthly
  const monthlyMap = {};

  transactions.forEach((t) => {
    const month = new Date(t.date).toLocaleString("default", { month: "short" });

    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: 0 };
    }

    if (t.type === "income") monthlyMap[month].income += t.amount;
    else monthlyMap[month].expense += t.amount;
  });

  const monthly = Object.values(monthlyMap);

  // Categories
  const categoryMap = {};

  transactions
    .filter(t => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categories = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    summary: { totalIncome, totalExpense, balance },
    monthly,
    categories,
  };
};