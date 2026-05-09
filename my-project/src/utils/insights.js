export const generateInsights = ({
  totalIncome,
  totalExpense,
  savingsRate,
  categoryData,
  budgetInsights,
}) => {
  const messages = [];

  if (totalExpense > totalIncome) {
    messages.push("You are spending more than your income.");
  }

  if (savingsRate < 20) {
    messages.push("Savings rate is below 20%.");
  }

  const top = categoryData.sort((a, b) => b.value - a.value)[0];

  if (top) {
    messages.push(`Highest spending is on ${top.name}.`);
  }

  budgetInsights.forEach((b) => {
    if (b.status === "over") {
      messages.push(`You exceeded ${b.category} budget.`);
    }
  });

  return messages;
};