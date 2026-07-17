export const computeFinancialInsights = (transactions = [], budgets = []) => {
  let income = 0;
  let expense = 0;

  const categoryMap = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount || 0);

    if (t.type === "income") income += amount;
    else expense += amount;

    const cat = t.category || "general";
    categoryMap[cat] = (categoryMap[cat] || 0) + amount;
  });

  const net = income - expense;

  // Budget analysis
  let totalBudgetLimit = 0;
  let totalBudgetSpent = 0;

  budgets.forEach((b) => {
    totalBudgetLimit += Number(b.limit || 0);
    totalBudgetSpent += Number(b.spent || 0);
  });

  const budgetUsage =
    totalBudgetLimit > 0
      ? (totalBudgetSpent / totalBudgetLimit) * 100
      : 0;

  // Top category
  const topCategory = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Risk engine (Stripe-style scoring)
  let riskLevel = "low";
  let message = "Your finances are healthy";

  if (expense > income) {
    riskLevel = "high";
    message = "You are spending more than you earn";
  } else if (budgetUsage > 80 || expense > income * 0.7) {
    riskLevel = "medium";
    message = "You are approaching financial risk";
  }

  return {
    income,
    expense,
    net,
    budgetUsage,
    topCategory,
    riskLevel,
    message,
  };
};