import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

const BalanceCard = ({ balance = {} }) => {
  const {
    totalIncome = 0,
    totalExpense = 0,
    currentBalance = 0,
    trends = {},
  } = balance;

  const netFlow = totalIncome - totalExpense;

  const daily = trends.daily ?? 0;
  const weekly = trends.weekly ?? 0;

  const getTrendUI = (value) => {
    if (value > 0) {
      return {
        icon: TrendingUp,
        color: "text-emerald-600",
        label: `+${value.toFixed(1)}%`,
      };
    }

    if (value < 0) {
      return {
        icon: TrendingDown,
        color: "text-rose-600",
        label: `${value.toFixed(1)}%`,
      };
    }

    return {
      icon: Activity,
      color: "text-slate-500",
      label: "0%",
    };
  };

  const status =
    currentBalance > 0
      ? "healthy"
      : currentBalance === 0
      ? "neutral"
      : "critical";

  const statusStyle = {
    healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
    critical: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const dailyTrend = getTrendUI(daily);
  const weeklyTrend = getTrendUI(weekly);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Real-Time Balance
          </h2>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full border ${statusStyle[status]}`}
        >
          {status.toUpperCase()}
        </span>

      </div>

      {/* BALANCE */}
      <div className="mb-6">
        <p className="text-xs text-slate-500">Current Balance</p>

        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          ₦{Number(currentBalance).toLocaleString()}
        </h1>
      </div>

      {/* BREAKDOWN */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        <div className="bg-emerald-50 p-3 rounded-2xl">
          <p className="text-xs text-slate-500">Income</p>
          <p className="font-semibold text-emerald-700">
            ₦{Number(totalIncome).toLocaleString()}
          </p>
        </div>

        <div className="bg-rose-50 p-3 rounded-2xl">
          <p className="text-xs text-slate-500">Expense</p>
          <p className="font-semibold text-rose-700">
            ₦{Number(totalExpense).toLocaleString()}
          </p>
        </div>

      </div>

      {/* TREND INDICATORS */}
      <div className="border-t pt-4 grid grid-cols-2 gap-4">

        {/* DAILY */}
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-500">Daily Trend</p>
            <p className={`text-sm font-semibold ${dailyTrend.color}`}>
              {dailyTrend.label}
            </p>
          </div>

          <dailyTrend.icon size={16} className={dailyTrend.color} />
        </div>

        {/* WEEKLY */}
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-500">Weekly Trend</p>
            <p className={`text-sm font-semibold ${weeklyTrend.color}`}>
              {weeklyTrend.label}
            </p>
          </div>

          <weeklyTrend.icon size={16} className={weeklyTrend.color} />
        </div>

      </div>
    </div>
  );
};

export default BalanceCard;