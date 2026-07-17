import { useMemo } from "react";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🎨 Chart colors
const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

const InsightCard = ({ transactions = [], loading = false }) => {
  /**
   * 🔍 COMPUTATIONS (Memoized)
   */
  const {
    totalIncome,
    totalExpense,
    savings,
    savingsRate,
    categoryData,
  } = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
        savingsRate: 0,
        categoryData: [],
      };
    }

    let income = 0;
    let expense = 0;
    const categoryMap = {};

    transactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;

        // Group by category
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      }
    });

    const savingsValue = income - expense;
    const rate = income ? ((savingsValue / income) * 100).toFixed(1) : 0;

    const categoryArr = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      totalIncome: income,
      totalExpense: expense,
      savings: savingsValue,
      savingsRate: rate,
      categoryData: categoryArr,
    };
  }, [transactions]);

  const isEmpty = !loading && transactions.length === 0;

  return (
    <div className="space-y-6">
      {/* 🔢 TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            value: savingsRate,
            isPositive: savings >= 0,
          }}
          subtitle="Savings rate"
        />
      </div>

      {/* 📊 CATEGORY BREAKDOWN */}
      <ChartCard
        title="Spending by Category"
        subtitle="Where your money goes"
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
              {categoryData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 🧠 SMART INSIGHTS */}
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
            {/* Insight 1 */}
            {savings < 0 && (
              <li>
                ⚠️ You are spending more than you earn. Consider
                reducing expenses.
              </li>
            )}

            {/* Insight 2 */}
            {savingsRate > 20 && (
              <li>
                ✅ Great job! Your savings rate is healthy.
              </li>
            )}

            {/* Insight 3 */}
            {categoryData.length > 0 && (
              <li>
                💡 Highest spending category:{" "}
                <strong>
                  {categoryData.sort((a, b) => b.value - a.value)[0]
                    .name}
                </strong>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InsightCard;