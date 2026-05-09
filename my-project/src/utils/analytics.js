// analytics.js

export const computeDashboardStats = (transactions) => {
  let income = 0;
  let expense = 0;

  const monthlyMap = {};
  const categoryMap = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;

    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: 0 };
    }

    if (t.type === "income") {
      income += amount;
      monthlyMap[month].income += amount;
    } else {
      expense += amount;
      monthlyMap[month].expense += amount;

      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += amount;
    }
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    savingsRate: income ? ((income - expense) / income) * 100 : 0,
    chartData: Object.values(monthlyMap),
    categoryData: Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value })
    ),
  };
};