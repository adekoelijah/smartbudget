const TransactionCard = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex justify-between items-center p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-200">

      {/* LEFT SIDE */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
          {transaction.title}
        </h3>

        <p className="text-xs text-gray-500 capitalize">
          {transaction.category}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

        {/* AMOUNT */}
        <span
          className={`font-bold text-sm md:text-base ${
            isIncome ? "text-green-600" : "text-red-500"
          }`}
        >
          {isIncome ? "+" : "-"} ₦
          {Number(transaction.amount).toLocaleString()}
        </span>

        {/* DELETE BUTTON */}
        <button
          onClick={() => onDelete(transaction._id)}
          className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition"
        >
          Delete
        </button>

      </div>

    </div>
  );
};

export default TransactionCard;