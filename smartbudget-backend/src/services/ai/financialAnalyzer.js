export const analyzeFinancials = (transactions) => {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a,b)=>a+b.amount,0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a,b)=>a+b.amount,0);

  const savings = income - expense;

  let riskScore = 50;

  if (expense > income) riskScore = 90;
  else if (savings > income * 0.4) riskScore = 20;

  return {
    income,
    expense,
    savings,
    riskScore,
    summary:
      savings > 0
        ? "Healthy financial behavior detected."
        : "High spending detected. Adjust budgeting.",
  };
};