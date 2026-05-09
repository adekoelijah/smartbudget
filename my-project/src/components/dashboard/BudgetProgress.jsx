const BudgetProgress = ({
  data = [],
  loading = false,
}) => {
  const getColor = (status) => {
    switch (status) {
      case "over":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold">
          Budget Usage
        </h2>
        <p className="text-xs text-gray-500">
          Track how your spending compares to your budgets
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        /* EMPTY */
        <p className="text-sm text-gray-400">
          No budgets found
        </p>
      ) : (
        /* DATA */
        <div className="space-y-4">
          {data.map((b) => {
            const percentage = Math.min(
              b.percentage || 0,
              100
            );

            return (
              <div key={b.category}>
                {/* LABEL */}
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">
                    {b.category}
                  </span>
                  <span className="text-gray-500">
                    ₦{b.spent.toLocaleString()} / ₦
                    {b.limit.toLocaleString()}
                  </span>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColor(
                      b.status
                    )} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* STATUS TEXT */}
                <div className="text-xs mt-1 text-gray-400">
                  {b.status === "over" && "Over budget"}
                  {b.status === "warning" &&
                    "Approaching limit"}
                  {b.status === "safe" && "Within budget"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;