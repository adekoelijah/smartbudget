import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// 🔢 simple number formatter (extend as needed)
const formatValue = (value, format) => {
  if (value == null) return "--";

  if (format === "currency") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "compact") {
    return new Intl.NumberFormat("en", {
      notation: "compact",
    }).format(value);
  }

  return value;
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // { value: number, isPositive: boolean }
  format, // "currency" | "compact"
  loading = false,
  actions,
  className,
}) => {
  const isPositive = trend?.isPositive;

  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between",
        className
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-2xl font-bold mt-1 text-gray-900">
            {loading ? (
              <span className="inline-block w-24 h-6 bg-gray-200 animate-pulse rounded" />
            ) : (
              formatValue(value, format)
            )}
          </h2>
        </div>

        {/* ICON / ACTION */}
        {Icon ? (
          <div className="p-2 rounded-lg bg-gray-100 text-primary">
            <Icon size={18} />
          </div>
        ) : (
          actions && <div>{actions}</div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between text-sm">
        {/* TREND */}
        {trend && !loading && (
          <div
            className={clsx(
              "flex items-center gap-1 font-medium",
              isPositive ? "text-green-600" : "text-red-500"
            )}
          >
            {isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {trend.value}%
          </div>
        )}

        {/* SUBTITLE */}
        {subtitle && (
          <p className="text-gray-400 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;