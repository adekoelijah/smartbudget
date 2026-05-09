export const generateInsights = (f) => {
  const insights = [];

  // 💸 savings health
  if (f.savingsRatio < 10) {
    insights.push({
      type: "danger",
      title: "Critical Savings Rate",
      message: `Your savings rate is ${f.savingsRatio.toFixed(
        1
      )}%. You are spending almost all your income.`,
    });
  } else if (f.savingsRatio < 25) {
    insights.push({
      type: "warning",
      title: "Low Savings Efficiency",
      message: `You retain only ${f.savingsRatio.toFixed(
        1
      )}% of income. Aim for 30%+.`,
    });
  } else {
    insights.push({
      type: "success",
      title: "Healthy Savings Pattern",
      message: `Great discipline — ${f.savingsRatio.toFixed(
        1
      )}% savings rate.`,
    });
  }

  // 💳 spending efficiency
  if (f.efficiency > 90) {
    insights.push({
      type: "danger",
      title: "High Spending Ratio",
      message: `You spend ${f.efficiency.toFixed(
        1
      )}% of income. Risk of instability.`,
    });
  }

  // 📉 volatility
  if (f.volatility > f.income * 0.2) {
    insights.push({
      type: "warning",
      title: "Unstable Spending Behavior",
      message:
        "Your spending varies heavily day-to-day. Budget consistency is low.",
    });
  }

  // 💰 balance insight
  if (f.balance < 0) {
    insights.push({
      type: "danger",
      title: "Negative Cashflow",
      message: "You are spending more than you earn.",
    });
  }

  // default fallback
  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Stable Financial Activity",
      message: "Your financial behavior looks balanced.",
    });
  }

  return insights;
};