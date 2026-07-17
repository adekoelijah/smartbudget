const TransactionEmptyState = () => {
  return (
    <div className="bg-white border rounded-3xl px-6 py-16 md:py-20 text-center shadow-sm">

      {/* ICON */}
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
        💳
      </div>

      {/* TITLE */}
      <h2 className="mt-6 text-xl md:text-2xl font-bold text-gray-900">
        No transactions yet
      </h2>

      {/* DESCRIPTION */}
      <p className="mt-3 text-sm md:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
        Start tracking your income and expenses to unlock smarter financial
        insights, spending trends, and better money decisions.
      </p>

      {/* CTA */}
      <button className="mt-8 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
        Add First Transaction
      </button>

    </div>
  );
};

export default TransactionEmptyState;