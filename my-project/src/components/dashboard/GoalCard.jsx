const GoalCard = ({ goal }) => {
  const percentage = Math.min(
    (goal.saved / goal.target) * 100,
    100
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold mb-2">
        {goal.title}
      </h3>

      <p className="text-xs text-gray-500 mb-2">
        ₦{goal.saved.toLocaleString()} / ₦
        {goal.target.toLocaleString()}
      </p>

      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-blue-500 rounded"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default GoalCard;