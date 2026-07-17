import clsx from "clsx";
import { MoreVertical } from "lucide-react";

// 💰 Currency formatter
const formatCurrency = (value) => {
  if (value == null) return "--";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
};

const BudgetCard = ({
  name,
  category,
  amount,
  spent,
  loading = false,
  onEdit,
  onDelete,
  className,
}) => {
  const percentage = amount ? Math.min((spent / amount) * 100, 100) : 0;
  const remaining = amount - spent;

  // 🎯 Status logic
  let statusColor = "bg-green-500";
  let textColor = "text-green-600";

  if (percentage > 75 && percentage <= 100) {
    statusColor = "bg-yellow-500";
    textColor = "text-yellow-600";
  }

  if (percentage >= 100) {
    statusColor = "bg-red-500";
    textColor = "text-red-600";
  }

  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4",
        className
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {loading ? (
              <span className="inline-block w-24 h-4 bg-gray-200 animate-pulse rounded" />
            ) : (
              name
            )}
          </h3>

          {category && !loading && (
            <p className="text-xs text-gray-500 mt-1">
              {category}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        {!loading && (onEdit || onDelete) && (
          <div className="relative group">
            <MoreVertical className="cursor-pointer" size={18} />

            <div className="absolute right-0 mt-2 w-28 bg-white border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AMOUNT */}
      <div>
        {loading ? (
          <div className="w-32 h-5 bg-gray-200 animate-pulse rounded" />
        ) : (
          <p className="text-sm text-gray-600">
            {formatCurrency(spent)} / {formatCurrency(amount)}
          </p>
        )}
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx("h-full transition-all", statusColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* FOOTER */}
      {!loading && (
        <div className="flex items-center justify-between text-xs">
          <p className={clsx("font-medium", textColor)}>
            {percentage >= 100
              ? "Budget exceeded"
              : `${percentage.toFixed(0)}% used`}
          </p>

          <p className="text-gray-400">
            {remaining > 0
              ? `${formatCurrency(remaining)} left`
              : "No balance"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;