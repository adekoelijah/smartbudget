export const aggregateDashboard = (transactions, budgets) => {
  let income = 0;
  let expense = 0;

  const categoryMap = {};
  const spendingMap = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;

    if (t.type === "income") {
      income += amount;
    } else {
      expense += amount;

      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += amount;

      if (!spendingMap[t.category]) {
        spendingMap[t.category] = 0;
      }
      spendingMap[t.category] += amount;
    }
  });

  const budgetInsights = budgets.map((b) => {
    const spent = spendingMap[b.category] || 0;
    const percentage = (spent / b.limit) * 100;

    return {
      ...b,
      spent,
      percentage,
      status:
        percentage > 100
          ? "over"
          : percentage > 80
          ? "warning"
          : "safe",
    };
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    categoryData: Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value })
    ),
    budgetInsights,
  };
};