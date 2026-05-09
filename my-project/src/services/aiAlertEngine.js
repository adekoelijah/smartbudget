
export const processAIAlert = (transaction) => {
  const alerts = [];

  // ⚠️ High-value anomaly detection
  if (transaction.amount > 50000) {
    alerts.push({
      type: "danger",
      title: "High Value Transaction Detected",
      message: `₦${transaction.amount} was just processed.`,
    });
  }

  // 📊 Frequency anomaly
  if (transaction.isRapid === true) {
    alerts.push({
      type: "warning",
      title: "Rapid Spending Pattern",
      message: "Multiple transactions detected in short time window.",
    });
  }

  // 💡 Smart suggestion
  if (transaction.category === "subscription") {
    alerts.push({
      type: "info",
      title: "Recurring Payment Detected",
      message: "Consider reviewing active subscriptions.",
    });
  }

  return alerts;
};