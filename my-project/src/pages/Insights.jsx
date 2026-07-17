import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { getTransactions } from "../services/transactionService";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

const Insights = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err) {
        setError("Failed to load insights");
        console.error(err);
      } finally {
        setLoading(false);

      }
    };

    fetchData();
  }, []);

  /**
   * 📊 COMPUTATIONS
   */
  const {
    totalIncome,
    totalExpense,
    savings,
    savingsRate,
    categoryData,
    monthlyData,
  } = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
        savingsRate: 0,
        categoryData: [],
        monthlyData: [],
      };
    }

    let income = 0;
    let expense = 0;

    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const month = date.toLocaleString("default", { month: "short" });

      // Income vs Expense
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;

        // Category aggregation
        categoryMap[t.category] =
          (categoryMap[t.category] || 0) + t.amount;
      }

      // Monthly aggregation
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expense: 0 };
      }

      if (t.type === "income") {
        monthlyMap[month].income += t.amount;
      } else {
        monthlyMap[month].expense += t.amount;
      }
    });

    const savingsValue = income - expense;
    const rate = income
      ? ((savingsValue / income) * 100).toFixed(1)
      : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      savings: savingsValue,
      savingsRate: rate,
      categoryData: Object.entries(categoryMap).map(
        ([name, value]) => ({ name, value })
      ),
      monthlyData: Object.values(monthlyMap),
    };
  }, [transactions]);

  const isEmpty = !loading && transactions.length === 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-lg font-semibold">Insights</h1>
        <p className="text-sm text-gray-500">
          Understand your financial behavior
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={totalIncome}
          format="currency"
          loading={loading}
        />

        <StatCard
          title="Total Expenses"
          value={totalExpense}
          format="currency"
          loading={loading}
        />

        <StatCard
          title="Savings"
          value={savings}
          format="currency"
          loading={loading}
          trend={{
            value: Number(savingsRate),
            isPositive: savings >= 0,
          }}
          subtitle="Savings rate"
        />
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CATEGORY PIE */}
        <ChartCard
          title="Spending by Category"
          loading={loading}
          isEmpty={isEmpty || categoryData.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* MONTHLY BAR */}
        <ChartCard
          title="Monthly Overview"
          loading={loading}
          isEmpty={isEmpty || monthlyData.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#10B981" />
              <Bar dataKey="expense" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* SMART INSIGHTS */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">
          Smart Insights
        </h3>

        {loading ? (
          <div className="h-16 bg-gray-100 animate-pulse rounded" />
        ) : isEmpty ? (
          <p className="text-sm text-gray-400">
            No insights available yet
          </p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-700">
            {savings < 0 && (
              <li>
                ⚠️ You are spending more than you earn.
              </li>
            )}

            {Number(savingsRate) > 20 && (
              <li>
                ✅ Strong savings habit detected.
              </li>
            )}

            {categoryData.length > 0 && (
              <li>
                💡 Highest spending:{" "}
                <strong>
                  {
                    [...categoryData].sort(
                      (a, b) => b.value - a.value
                    )[0].name
                  }
                </strong>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Insights;