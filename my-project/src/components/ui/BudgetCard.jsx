import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";

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
  amount = 0,
  spent = 0,
  loading = false,
  onEdit,
  onDelete,
  className,
}) => {
  const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  const remaining = amount - spent;

  // 🎯 Status logic
  let barColor = "bg-green-500";
  let textColor = "text-green-600";
  let statusText = "On track";

  if (percentage > 75 && percentage < 100) {
    barColor = "bg-yellow-500";
    textColor = "text-yellow-600";
    statusText = "Almost limit";
  }

  if (percentage >= 100) {
    barColor = "bg-red-500";
    textColor = "text-red-600";
    statusText = "Exceeded";
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
          {loading ? (
            <div className="w-28 h-4 bg-gray-200 animate-pulse rounded" />
          ) : (
            <h3 className="text-sm font-semibold text-gray-800">
              {name}
            </h3>
          )}

          {!loading && category && (
            <p className="text-xs text-gray-500 mt-1">
              {category}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        {!loading && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Pencil size={16} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
              >
                <Trash2 size={16} />
              </button>
            )}
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
          className={clsx("h-full transition-all duration-300", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* FOOTER */}
      {!loading && (
        <div className="flex items-center justify-between text-xs">
          <span className={clsx("font-medium", textColor)}>
            {statusText}
          </span>

          <span className="text-gray-400">
            {remaining > 0
              ? `${formatCurrency(remaining)} left`
              : "No balance"}
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;