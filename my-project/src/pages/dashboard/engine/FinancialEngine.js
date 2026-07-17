/* =========================================
   SAFE NUMBER
========================================= */
const safe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* =========================================
   NORMALIZE TRANSACTIONS
========================================= */
export const normalizeTransactions = (input = []) => {
  if (!Array.isArray(input)) return [];

  return input
    .filter(Boolean)
    .map((t) => ({
      id: t?._id || t?.id || crypto.randomUUID(),

      type:
        t?.type === "income"
          ? "income"
          : "expense",

      amount: safe(t?.amount),

      category:
        t?.category ||
        t?.categoryName ||
        "uncategorized",

      title:
        t?.title ||
        t?.description ||
        "Untitled Transaction",

      date: new Date(
        t?.date ||
          t?.createdAt ||
          Date.now()
      ),
    }));
};

/* =========================================
   TREND ENGINE
========================================= */
const computeTrend = (current, previous) => {
  if (!previous && current > 0) return 100;
  if (!previous) return 0;

  return ((current - previous) / previous) * 100;
};

/* =========================================
   MAIN FINANCIAL ENGINE
========================================= */
export const computeFinancials = (
  transactionsInput = []
) => {
  const tx = normalizeTransactions(
    transactionsInput
  );

  let income = 0;
  let expense = 0;

  let todayIncome = 0;
  let todayExpense = 0;

  let weeklyIncome = 0;
  let weeklyExpense = 0;

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  let previousMonthIncome = 0;
  let previousMonthExpense = 0;

  const now = new Date();

  /* =========================================
     CATEGORY AGGREGATION
  ========================================= */
  const categoryMap = {};

  /* =========================================
     TREND SERIES
  ========================================= */
  const trendMap = {};

  tx.forEach((t) => {
    const amount = safe(t.amount);
    const date = new Date(t.date);

    const isIncome = t.type === "income";

    /* TOTALS */
    if (isIncome) income += amount;
    else expense += amount;

    /* TODAY */
    const isToday =
      date.toDateString() ===
      now.toDateString();

    if (isToday) {
      if (isIncome) todayIncome += amount;
      else todayExpense += amount;
    }

    /* WEEK */
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    if (date >= weekAgo) {
      if (isIncome) weeklyIncome += amount;
      else weeklyExpense += amount;
    }

    /* MONTH */
    const sameMonth =
      date.getMonth() === now.getMonth() &&
      date.getFullYear() ===
        now.getFullYear();

    if (sameMonth) {
      if (isIncome) monthlyIncome += amount;
      else monthlyExpense += amount;
    }

    /* PREVIOUS MONTH */
    const previousMonth =
      date.getMonth() ===
        now.getMonth() - 1 &&
      date.getFullYear() ===
        now.getFullYear();

    if (previousMonth) {
      if (isIncome)
        previousMonthIncome += amount;
      else
        previousMonthExpense += amount;
    }

    /* CATEGORY */
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = {
        income: 0,
        expense: 0,
      };
    }

    if (isIncome)
      categoryMap[t.category].income += amount;
    else
      categoryMap[t.category].expense += amount;

    /* TREND DATA */
    const key = date
      .toISOString()
      .split("T")[0];

    if (!trendMap[key]) {
      trendMap[key] = {
        income: 0,
        expense: 0,
      };
    }

    if (isIncome)
      trendMap[key].income += amount;
    else
      trendMap[key].expense += amount;
  });

  /* =========================================
     CORE FINANCIALS
  ========================================= */
  const balance = income - expense;

  const savingsRatio =
    income > 0
      ? (balance / income) * 100
      : 0;

  const expenseRatio =
    income > 0
      ? (expense / income) * 100
      : 0;

  const efficiencyRatio =
    income > 0
      ? 100 - expenseRatio
      : 0;

  /* =========================================
     TRENDS
  ========================================= */
  const incomeTrend = computeTrend(
    monthlyIncome,
    previousMonthIncome
  );

  const expenseTrend = computeTrend(
    monthlyExpense,
    previousMonthExpense
  );

  /* =========================================
     HEALTH SCORE
  ========================================= */
  const healthScore =
    savingsRatio * 0.4 +
    efficiencyRatio * 0.4 +
    (balance > 0 ? 20 : 0);

  /* =========================================
     RETURN SHARED ENGINE
  ========================================= */
  return {
    /* CORE */
    income,
    expense,
    balance,

    /* RATIOS */
    savingsRatio,
    expenseRatio,
    efficiencyRatio,

    /* COUNTS */
    transactionCount: tx.length,

    /* TODAY */
    todayIncome,
    todayExpense,

    /* WEEK */
    weeklyIncome,
    weeklyExpense,

    /* MONTH */
    monthlyIncome,
    monthlyExpense,

    /* TRENDS */
    incomeTrend,
    expenseTrend,

    /* HEALTH */
    healthScore,

    /* CATEGORY */
    categoryBreakdown: Object.entries(
      categoryMap
    ).map(([category, values]) => ({
      category,
      ...values,
      total:
        values.income + values.expense,
    })),

    /* TREND CHART */
    trendData: Object.entries(
      trendMap
    ).map(([date, values]) => ({
      date,
      ...values,
      balance:
        values.income - values.expense,
    })),

    /* RAW */
    transactions: tx,
  };
};