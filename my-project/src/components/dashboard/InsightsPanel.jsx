const InsightsPanel = ({ insights = [], loading = false }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold">
          AI Insights
        </h2>
        <p className="text-xs text-gray-500">
          Smart analysis of your financial behavior
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      ) : insights.length === 0 ? (
        /* EMPTY */
        <p className="text-sm text-gray-400">
          No insights available yet
        </p>
      ) : (
        /* INSIGHTS LIST */
        <ul className="space-y-3 text-sm">
          {insights.map((msg, index) => (
            <li
              key={index}
              className="flex items-start gap-2"
            >
              <span className="text-gray-400">•</span>
              <span className="text-gray-700 leading-relaxed">
                {msg}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsPanel;