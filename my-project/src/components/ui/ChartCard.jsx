import clsx from "clsx";

const ChartCard = ({
  title,
  subtitle,
  loading = false,
  error = null,
  isEmpty = false,
  actions,
  footer,
  height = 260,
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm p-5 flex flex-col",
        className
      )}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {/* CONTENT */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ minHeight: height }}
      >
        {/* LOADING */}
        {loading && (
          <div className="w-full h-full animate-pulse bg-gray-100 rounded-lg" />
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-sm text-danger text-center">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && isEmpty && (
          <div className="text-sm text-gray-400 text-center">
            No data available
          </div>
        )}

        {/* CHART */}
        {!loading && !error && !isEmpty && (
          <div className="w-full h-full">{children}</div>
        )}
      </div>

      {/* FOOTER */}
      {footer && (
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ChartCard;