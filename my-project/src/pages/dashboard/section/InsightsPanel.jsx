
import { useMemo } from "react";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { computeFinancials } from "../engine/FinancialEngine";

/* =========================================================
   CONSTANTS
========================================================= */

const EXPERT_WHATSAPP = "+2347088294012";

const DEFAULT_CURRENCY = "NGN";

/* =========================================================
   SAFE UTILITIES
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// const getTransactionId = (transaction) =>
//   transaction?._id ||
//   transaction?.id ||
//   `${transaction?.date || transaction?.createdAt}-${transaction?.amount}-${transaction?.description || transaction?.category || Math.random()}`;

const getTransactionDate = (transaction) => {
  const rawDate =
    transaction?.date ||
    transaction?.createdAt ||
    transaction?.updatedAt;

  if (!rawDate) return null;

  const date = new Date(rawDate);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const getTransactionLabel = (transaction) => {
  return (
    transaction?.description ||
    transaction?.title ||
    transaction?.name ||
    transaction?.category ||
    "Unnamed transaction"
  );
};

const getCategory = (transaction) => {
  return (
    transaction?.category ||
    transaction?.categoryName ||
    transaction?.expenseCategory ||
    "Uncategorized"
  );
};

const isExpense = (transaction) =>
  String(transaction?.type || "").toLowerCase() ===
  "expense";

const isIncome = (transaction) =>
  String(transaction?.type || "").toLowerCase() ===
  "income";

const normalizeTransactions = (input) => {
  if (Array.isArray(input)) {
    return input;
  }

  if (Array.isArray(input?.transactions)) {
    return input.transactions;
  }

  if (Array.isArray(input?.data)) {
    return input.data;
  }

  if (Array.isArray(input?.data?.transactions)) {
    return input.data.transactions;
  }

  return [];
};

/* =========================================================
   CURRENCY FORMATTER
========================================================= */

const formatCurrency = (
  value = 0,
  currency = DEFAULT_CURRENCY
) => {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
};

const formatCompactCurrency = (
  value = 0,
  currency = DEFAULT_CURRENCY
) => {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return formatCurrency(amount, currency);
  }
};

const formatPercent = (value = 0) =>
  `${toNumber(value).toFixed(1)}%`;

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDate = (transaction) => {
  const date = getTransactionDate(transaction);

  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* =========================================================
   INTELLIGENCE ENGINE
========================================================= */

const buildInsights = (
  transactions,
  financials
) => {
  const tx = normalizeTransactions(transactions);

  const income = toNumber(financials?.income);
  const expense = toNumber(financials?.expense);
  const balance = toNumber(financials?.balance);

  /* -------------------------------------------------------
     EXPENSES
  ------------------------------------------------------- */

  const expenses = tx
    .filter(isExpense)
    .map((transaction) => ({
      ...transaction,
      numericAmount: toNumber(transaction.amount),
      categoryName: getCategory(transaction),
      label: getTransactionLabel(transaction),
    }))
    .filter(
      (transaction) =>
        transaction.numericAmount > 0
    )
    .sort(
      (a, b) =>
        b.numericAmount -
        a.numericAmount
    );

  /* -------------------------------------------------------
     INCOME TRANSACTIONS
  ------------------------------------------------------- */

  const incomes = tx
    .filter(isIncome)
    .map((transaction) => ({
      ...transaction,
      numericAmount: toNumber(transaction.amount),
    }))
    .filter(
      (transaction) =>
        transaction.numericAmount > 0
    );

  /* -------------------------------------------------------
     LARGEST EXPENSE
  ------------------------------------------------------- */

  const largestExpense =
    expenses[0] || null;

  const secondLargestExpense =
    expenses[1] || null;

  const largestExpenseRatio =
    expense > 0 && largestExpense
      ? (largestExpense.numericAmount /
          expense) *
        100
      : 0;

  const largestExpenseToIncome =
    income > 0 && largestExpense
      ? (largestExpense.numericAmount /
          income) *
        100
      : 0;

  /* -------------------------------------------------------
     CATEGORY ANALYSIS
  ------------------------------------------------------- */

  const categoryMap = new Map();

  expenses.forEach((transaction) => {
    const category =
      transaction.categoryName;

    const existing =
      categoryMap.get(category) || {
        category,
        amount: 0,
        count: 0,
        transactions: [],
      };

    existing.amount +=
      transaction.numericAmount;

    existing.count += 1;

    existing.transactions.push(
      transaction
    );

    categoryMap.set(
      category,
      existing
    );
  });

  const categories = Array.from(
    categoryMap.values()
  )
    .map((category) => ({
      ...category,
      percentage:
        expense > 0
          ? (category.amount /
              expense) *
            100
          : 0,
      average:
        category.count > 0
          ? category.amount /
            category.count
          : 0,
    }))
    .sort(
      (a, b) =>
        b.amount - a.amount
    );

  const highestSpendingCategory =
    categories[0] || null;

  /* -------------------------------------------------------
     AVERAGE EXPENSE
  ------------------------------------------------------- */

  const averageExpense =
    expenses.length > 0
      ? expense / expenses.length
      : 0;

  /* -------------------------------------------------------
     LARGE TRANSACTION DETECTION
     
     We use both:
       1. Relative-to-average detection
       2. Relative-to-income detection

     This prevents a fixed arbitrary threshold.
  ------------------------------------------------------- */

  const largeTransactionThreshold =
    Math.max(
      averageExpense * 2.5,
      income > 0
        ? income * 0.1
        : 0
    );

  const unusuallyLargeExpenses =
    expenses.filter(
      (transaction) =>
        transaction.numericAmount >=
        largeTransactionThreshold
    );

  /* -------------------------------------------------------
     SPENDING PRESSURE
  ------------------------------------------------------- */

  const expenseToIncomeRatio =
    income > 0
      ? (expense / income) * 100
      : expense > 0
      ? 100
      : 0;

  const savingsRate =
    income > 0
      ? ((income - expense) /
          income) *
        100
      : 0;

  /* -------------------------------------------------------
     CATEGORY CONCENTRATION
  ------------------------------------------------------- */

  const categoryConcentration =
    highestSpendingCategory
      ? highestSpendingCategory.percentage
      : 0;

  /* -------------------------------------------------------
     FINANCIAL STATUS
  ------------------------------------------------------- */

  let status = "healthy";

  if (income <= 0 && expense > 0) {
    status = "critical";
  } else if (expenseToIncomeRatio >= 100) {
    status = "critical";
  } else if (
    expenseToIncomeRatio >= 80
  ) {
    status = "warning";
  } else if (
    savingsRate >= 20 &&
    expenseToIncomeRatio < 70
  ) {
    status = "healthy";
  } else {
    status = "stable";
  }

  /* -------------------------------------------------------
     PRIMARY ADVICE
  ------------------------------------------------------- */

  let primaryAdvice = "";

  if (income <= 0 && expense > 0) {
    primaryAdvice =
      "You have recorded expenses without sufficient income data. Review your cash inflows and avoid making major discretionary purchases until your cash position is clearer.";
  } else if (
    expenseToIncomeRatio >= 100
  ) {
    primaryAdvice =
      "Your expenses are currently equal to or greater than your income. Your priority should be reducing discretionary spending and protecting your available cash.";
  } else if (
    expenseToIncomeRatio >= 80
  ) {
    primaryAdvice =
      "A large portion of your income is being consumed by expenses. Reducing non-essential spending could materially improve your monthly cash position.";
  } else if (
    largestExpenseRatio >= 30
  ) {
    primaryAdvice =
      "One transaction represents a significant share of your total spending. Review whether this expense was necessary, recurring, or avoidable.";
  } else if (
    categoryConcentration >= 40
  ) {
    primaryAdvice =
      "Your spending is heavily concentrated in one category. Monitor this category closely and consider setting a dedicated budget limit.";
  } else if (
    savingsRate >= 20
  ) {
    primaryAdvice =
      "Your current cashflow shows healthy savings capacity. Maintain this discipline and continue directing part of your surplus toward your financial goals.";
  } else {
    primaryAdvice =
      "Your finances are relatively stable, but there is room to improve your savings capacity by monitoring recurring and discretionary expenses.";
  }

  /* -------------------------------------------------------
     LARGEST TRANSACTION ADVICE
  ------------------------------------------------------- */

  let largestTransactionAdvice = "";

  if (!largestExpense) {
    largestTransactionAdvice =
      "No expense transactions are available yet.";
  } else if (
    largestExpenseToIncome >= 25
  ) {
    largestTransactionAdvice =
      "This transaction consumed a substantial portion of your recorded income. Consider reviewing whether similar purchases can be reduced or planned in advance.";
  } else if (
    largestExpenseRatio >= 20
  ) {
    largestTransactionAdvice =
      "This is one of the transactions having the greatest impact on your total spending.";
  } else if (
    largestExpense.numericAmount >=
    averageExpense * 2
  ) {
    largestTransactionAdvice =
      "This transaction is significantly above your average expense. Review it carefully to determine whether it is exceptional or likely to recur.";
  } else {
    largestTransactionAdvice =
      "This is currently your largest recorded expense.";
  }

  /* -------------------------------------------------------
     CATEGORY ADVICE
  ------------------------------------------------------- */

  let categoryAdvice = "";

  if (!highestSpendingCategory) {
    categoryAdvice =
      "Category spending analysis will become available as you record expenses.";
  } else if (
    highestSpendingCategory.percentage >=
    50
  ) {
    categoryAdvice = `${highestSpendingCategory.category} accounts for ${formatPercent(
      highestSpendingCategory.percentage
    )} of your total expenses. This category deserves close budget monitoring.`;
  } else if (
    highestSpendingCategory.percentage >=
    30
  ) {
    categoryAdvice = `${highestSpendingCategory.category} is currently your largest spending category, representing ${formatPercent(
      highestSpendingCategory.percentage
    )} of total expenses.`;
  } else {
    categoryAdvice = `${highestSpendingCategory.category} is your highest spending category, but your spending is relatively distributed across categories.`;
  }

  return {
    income,
    expense,
    balance,

    expenses,
    incomes,

    largestExpense,
    secondLargestExpense,

    largestExpenseRatio,
    largestExpenseToIncome,

    categories,
    highestSpendingCategory,

    averageExpense,
    largeTransactionThreshold,
    unusuallyLargeExpenses,

    expenseToIncomeRatio,
    savingsRate,

    categoryConcentration,

    status,

    primaryAdvice,
    largestTransactionAdvice,
    categoryAdvice,
  };
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy cashflow",
    icon: ShieldCheck,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClass:
      "bg-emerald-100 text-emerald-600",
  },

  stable: {
    label: "Stable cashflow",
    icon: CheckCircle2,
    className:
      "border-blue-200 bg-blue-50 text-blue-800",
    iconClass:
      "bg-blue-100 text-blue-600",
  },

  warning: {
    label: "Spending needs attention",
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
    iconClass:
      "bg-amber-100 text-amber-600",
  },

  critical: {
    label: "Immediate attention required",
    icon: AlertTriangle,
    className:
      "border-rose-200 bg-rose-50 text-rose-800",
    iconClass:
      "bg-rose-100 text-rose-600",
  },
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const Metric = ({
  label,
  value,
  description,
}) => (
  <div
    className="bg-slate-50/70 p-4 border border-slate-200 rounded-2xl"
  >
    <p
      className="font-medium text-[11px] text-slate-400 uppercase tracking-wider"
    >
      {label}
    </p>

    <p
      className="mt-2 font-bold text-slate-900 text-lg tracking-tight"
    >
      {value}
    </p>

    {description && (
      <p
        className="mt-1 text-slate-500 text-xs leading-relaxed"
      >
        {description}
      </p>
    )}
  </div>
);

const ProgressBar = ({
  percentage = 0,
}) => {
  const width = Math.min(
    Math.max(percentage, 0),
    100
  );

  return (
    <div
      className="bg-slate-100 rounded-full h-2 overflow-hidden"
    >
      <div
        className="bg-slate-900 rounded-full h-full transition-all duration-500"
        style={{
          width: `${width}%`,
        }}
      /
      >
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const InsightPanel = ({
  transactions = [],
  currency = DEFAULT_CURRENCY,
}) => {
  /* -------------------------------------------------------
     SAFE TRANSACTION INPUT
  ------------------------------------------------------- */

  const safeTransactions = useMemo(
    () => normalizeTransactions(transactions),
    [transactions]
  );

  /* -------------------------------------------------------
     CORE FINANCIAL ENGINE
  ------------------------------------------------------- */

  const financials = useMemo(
    () =>
      computeFinancials(
        safeTransactions
      ),
    [safeTransactions]
  );

  /* -------------------------------------------------------
     INTELLIGENCE ENGINE
  ------------------------------------------------------- */

  const insights = useMemo(
    () =>
      buildInsights(
        safeTransactions,
        financials
      ),
    [
      safeTransactions,
      financials,
    ]
  );

  const statusConfig =
    STATUS_CONFIG[insights.status] ||
    STATUS_CONFIG.stable;

  const StatusIcon =
    statusConfig.icon;

  /* -------------------------------------------------------
     WHATSAPP EXPERT LINK
  ------------------------------------------------------- */

  const whatsappMessage = encodeURIComponent(
    `Hello SmartBudget Expert,

I would like professional advice on my finances.

My SmartBudget analysis shows:
• Income: ${formatCurrency(
      insights.income,
      currency
    )}
• Expenses: ${formatCurrency(
      insights.expense,
      currency
    )}
• Balance: ${formatCurrency(
      insights.balance,
      currency
    )}
• Expense-to-income ratio: ${formatPercent(
      insights.expenseToIncomeRatio
    )}
• Savings rate: ${formatPercent(
      insights.savingsRate
    )}
• Highest spending category: ${
      insights.highestSpendingCategory
        ?.category || "N/A"
    }
• Largest expense: ${
      insights.largestExpense
        ? formatCurrency(
            insights.largestExpense
              .numericAmount,
            currency
          )
        : "N/A"
    }

I would like help understanding my spending pattern and improving my financial management.`
  );

  const whatsappUrl = `https://wa.me/${EXPERT_WHATSAPP}?text=${whatsappMessage}`;

  return (
    <section
      className="bg-white shadow-sm border border-slate-200 rounded-[28px] overflow-hidden"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="px-5 sm:px-6 py-5 border-slate-100 border-b"
      >

        <div
          className="flex justify-between items-start gap-4"
        >

          <div
            className="flex items-start gap-3"
          >

            <div
              className="flex justify-center items-center bg-slate-900 shadow-sm rounded-2xl w-11 h-11 text-white shrink-0"
            >
              <Sparkles size={19} />
            </div>

            <div>
              <div
                className="flex items-center gap-2"
              >

                <h2
                  className="font-bold text-slate-900 text-base tracking-tight"
                >
                  Financial Intelligence
                </h2>

                <span
                  className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[9px] text-slate-500 uppercase tracking-wider"
                >
                  Live
                </span>

              </div>

              <p
                className="mt-1 max-w-xl text-slate-500 text-xs leading-relaxed"
              >
                Automated analysis of your income,
                spending behaviour and transaction
                patterns.
              </p>
            </div>

          </div>

          <div
            className="hidden sm:flex justify-center items-center bg-slate-50 rounded-xl w-9 h-9 text-slate-400"
          >
            <WalletCards size={17} />
          </div>

        </div>

      </div>

      {/* =================================================
          FINANCIAL STATUS
      ================================================= */}

      <div
        className="p-5 sm:p-6"
      >

        <div
          className={`rounded-2xl border p-4 ${statusConfig.className}`}
        >

          <div
            className="flex items-start gap-3"
          >

            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusConfig.iconClass}`}
            >
              <StatusIcon size={17} />
            </div>

            <div
              className="min-w-0"
            >

              <p
                className="font-bold text-sm"
              >
                {statusConfig.label}
              </p>

              <p
                className="opacity-80 mt-1 text-xs leading-relaxed"
              >
                {insights.primaryAdvice}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            CORE METRICS
        ================================================= */}

        <div
          className="gap-3 grid grid-cols-1 sm:grid-cols-3 mt-5"
        >

          <Metric
            label="Income"
            value={formatCompactCurrency(
              insights.income,
              currency
            )}
            description="Recorded inflow"
          />

          <Metric
            label="Expenses"
            value={formatCompactCurrency(
              insights.expense,
              currency
            )}
            description="Recorded outflow"
          />

          <Metric
            label="Savings rate"
            value={formatPercent(
              insights.savingsRate
            )}
            description={
              insights.savingsRate >= 20
                ? "Healthy retention"
                : "Room for improvement"
            }
          />

        </div>

        {/* =================================================
            SPENDING PRESSURE
        ================================================= */}

        <div
          className="mt-5 p-4 border border-slate-200 rounded-2xl"
        >

          <div
            className="flex justify-between items-center gap-3"
          >

            <div>
              <p
                className="font-semibold text-slate-900 text-sm"
              >
                Spending pressure
              </p>

              <p
                className="mt-1 text-slate-500 text-xs"
              >
                Expenses relative to recorded income
              </p>
            </div>

            <span
              className={`text-sm font-bold ${
                insights.expenseToIncomeRatio >= 100
                  ? "text-rose-600"
                  : insights.expenseToIncomeRatio >= 80
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {formatPercent(
                insights.expenseToIncomeRatio
              )}
            </span>

          </div>

          <div
            className="mt-3"
          >
            <ProgressBar
              percentage={
                insights.expenseToIncomeRatio
              }
            />
          </div>

          <p
            className="mt-3 text-slate-500 text-xs leading-relaxed"
          >
            {insights.expenseToIncomeRatio >=
            100
              ? "Your recorded spending has reached or exceeded your recorded income."
              : insights.expenseToIncomeRatio >=
                80
              ? "Your spending is consuming most of your recorded income."
              : "Your spending is currently below your recorded income."}
          </p>

        </div>

        {/* =================================================
            LARGEST TRANSACTION
        ================================================= */}

        <div
          className="mt-5"
        >

          <div
            className="flex justify-between items-center mb-3"
          >

            <div>
              <h3
                className="font-bold text-slate-900 text-sm"
              >
                Largest expense
              </h3>

              <p
                className="mt-1 text-slate-500 text-xs"
              >
                The transaction currently having
                the greatest impact on spending.
              </p>
            </div>

            <CircleDollarSign
              size={18}
              className="text-slate-300"
              /
            >

          </div>

          {insights.largestExpense ? (
            <div
              className="bg-slate-50/60 p-4 border border-slate-200 rounded-2xl"
            >

              <div
                className="flex justify-between items-start gap-4"
              >

                <div
                  className="min-w-0"
                >

                  <div
                    className="flex items-center gap-2"
                  >

                    <span
                      className="flex justify-center items-center bg-rose-100 rounded-xl w-8 h-8 text-rose-600 shrink-0"
                    >
                      <ArrowDownRight size={15} />
                    </span>

                    <div
                      className="min-w-0"
                    >

                      <p
                        className="font-semibold text-slate-900 text-sm truncate"
                      >
                        {insights.largestExpense.label}
                      </p>

                      <p
                        className="text-[11px] text-slate-500"
                      >
                        {getCategory(
                          insights.largestExpense
                        )}{" "}
                        ·{" "}
                        {formatDate(
                          insights.largestExpense
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                <div
                  className="text-right shrink-0"
                >

                  <p
                    className="font-bold text-slate-900 text-base"
                  >
                    {formatCurrency(
                      insights.largestExpense
                        .numericAmount,
                      currency
                    )}
                  </p>

                  <p
                    className="mt-0.5 font-medium text-[11px] text-rose-600"
                  >
                    {formatPercent(
                      insights.largestExpenseRatio
                    )}{" "}
                    of expenses
                  </p>

                </div>

              </div>

              <div
                className="mt-4 pt-3 border-slate-200 border-t"
              >

                <p
                  className="text-slate-600 text-xs leading-relaxed"
                >
                  {insights.largestTransactionAdvice}
                </p>

              </div>

            </div>
          ) : (
            <div
              className="p-5 border border-slate-200 border-dashed rounded-2xl text-center"
            >

              <p
                className="font-medium text-slate-700 text-sm"
              >
                No expense transactions yet
              </p>

              <p
                className="mt-1 text-slate-500 text-xs"
              >
                Start recording expenses to unlock
                transaction intelligence.
              </p>

            </div>
          )}

        </div>

        {/* =================================================
            HIGHEST SPENDING CATEGORY
        ================================================= */}

        <div
          className="mt-5"
        >

          <div
            className="mb-3"
          >

            <h3
              className="font-bold text-slate-900 text-sm"
            >
              Spending by category
            </h3>

            <p
              className="mt-1 text-slate-500 text-xs"
            >
              Where your money is going most.
            </p>

          </div>

          {insights.categories.length > 0 ? (
            <div
              className="space-y-3"
            >

              {insights.categories
                .slice(0, 4)
                .map((category) => (

                  <div
                    key={category.category}
                    className="p-3 border border-slate-100 rounded-2xl"
                  >

                    <div
                      className="flex justify-between items-center gap-3"
                    >

                      <div
                        className="min-w-0"
                      >

                        <p
                          className="font-semibold text-slate-800 text-xs truncate"
                        >
                          {category.category}
                        </p>

                        <p
                          className="mt-0.5 text-[10px] text-slate-400"
                        >
                          {category.count}{" "}
                          transaction
                          {category.count === 1
                            ? ""
                            : "s"}
                        </p>

                      </div>

                      <div
                        className="text-right"
                      >

                        <p
                          className="font-bold text-slate-900 text-xs"
                        >
                          {formatCurrency(
                            category.amount,
                            currency
                          )}
                        </p>

                        <p
                          className="text-[10px] text-slate-400"
                        >
                          {formatPercent(
                            category.percentage
                          )}
                        </p>

                      </div>

                    </div>

                    <div
                      className="mt-2"
                    >
                      <ProgressBar
                        percentage={
                          category.percentage
                        }
                      />
                    </div>

                  </div>

                ))}

            </div>
          ) : (
            <div
              className="p-5 border border-slate-200 border-dashed rounded-2xl text-slate-500 text-xs text-center"
            >
              Category analysis will appear
              after expenses are recorded.
            </div>
          )}

          {insights.highestSpendingCategory && (
            <div
              className="bg-slate-50 mt-3 p-4 rounded-2xl"
            >

              <div
                className="flex items-start gap-3"
              >

                <div
                  className="mt-0.5"
                >
                  <TrendingUp
                    size={16}
                    className="text-slate-500"
                    /
                  >
                </div>

                <p
                  className="text-slate-600 text-xs leading-relaxed"
                >
                  {insights.categoryAdvice}
                </p>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            ANOMALY DETECTION
        ================================================= */}

        {insights.unusuallyLargeExpenses.length >
          0 && (

          <div
            className="bg-amber-50/60 mt-5 p-4 border border-amber-200 rounded-2xl"
          >

            <div
              className="flex items-start gap-3"
            >

              <div
                className="flex justify-center items-center bg-amber-100 rounded-xl w-9 h-9 text-amber-600 shrink-0"
              >
                <AlertTriangle size={17} />
              </div>

              <div>

                <p
                  className="font-semibold text-amber-900 text-sm"
                >
                  Unusually large spending detected
                </p>

                <p
                  className="mt-1 text-amber-800/80 text-xs leading-relaxed"
                >
                  {
                    insights
                      .unusuallyLargeExpenses
                      .length
                  }{" "}
                  transaction
                  {insights
                    .unusuallyLargeExpenses
                    .length === 1
                    ? ""
                    : "s"}{" "}
                  exceed your calculated large-expense
                  threshold of{" "}
                  <strong>
                    {formatCurrency(
                      insights.largeTransactionThreshold,
                      currency
                    )}
                  </strong>
                  .
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            EXPERT ADVICE
        ================================================= */}

        <div
          className="bg-slate-900 mt-6 p-5 rounded-2xl overflow-hidden text-white"
        >

          <div
            className="flex items-start gap-4"
          >

            <div
              className="flex justify-center items-center bg-white/10 rounded-xl w-10 h-10 shrink-0"
            >
              <MessageCircle size={19} />
            </div>

            <div
              className="flex-1 min-w-0"
            >

              <p
                className="font-bold text-sm"
              >
                Want a professional review?
              </p>

              <p
                className="mt-1 text-slate-300 text-xs leading-relaxed"
              >
                Your dashboard provides automated
                analysis. For personalized financial
                guidance based on your situation,
                speak directly with an expert.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 mt-4 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 font-bold text-slate-900 text-xs transition"
              >
                <MessageCircle size={15} />

                Chat with a financial expert

                <ChevronRight size={14} />
              </a>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default InsightPanel;