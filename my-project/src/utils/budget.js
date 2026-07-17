export const computeBudgetUsage = (budgets, transactions) => {
  const spendingMap = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      if (!spendingMap[t.category]) {
        spendingMap[t.category] = 0;
      }
      spendingMap[t.category] += t.amount;
    }
  });

  return budgets.map((b) => {
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
};