// const ReportsChart = ({ transactions }) => {
//   return (
//     <div className="p-6 border rounded-xl dark:border-gray-800">

//       <h3 className="text-sm font-semibold mb-4">
//         Spending Overview
//       </h3>

//       <div className="space-y-2">

//         {transactions.slice(0, 6).map((t) => (
//           <div
//             key={t._id}
//             className="flex justify-between text-sm"
//           >
//             <span>{t.title}</span>
//             <span
//               className={
//                 t.type === "income"
//                   ? "text-green-500"
//                   : "text-red-500"
//               }
//             >
//               ₦{t.amount}
//             </span>
//           </div>
//         ))}

//       </div>

//     </div>
//   );
// };

// export default ReportsChart;


import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const ReportsChart = ({ transactions = [] }) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const net = income - expense;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Spending Overview
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Wallet size={14} />
          Live Report
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Income</p>
          <h4 className="mt-1 text-green-400 font-bold">
            ₦{income.toLocaleString()}
          </h4>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Expenses</p>
          <h4 className="mt-1 text-red-400 font-bold">
            ₦{expense.toLocaleString()}
          </h4>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Net</p>
          <h4
            className={`mt-1 font-bold ${
              net >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            ₦{net.toLocaleString()}
          </h4>
        </div>

      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="space-y-3">

        {transactions.slice(0, 6).map((t) => (
          <div
            key={t._id}
            className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
          >

            <div>
              <p className="text-sm text-white">{t.title}</p>
              <p className="text-xs text-slate-400">{t.category}</p>
            </div>

            <div className="flex items-center gap-2">

              {t.type === "income" ? (
                <TrendingUp size={14} className="text-green-400" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}

              <span
                className={`text-sm font-semibold ${
                  t.type === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₦{Number(t.amount).toLocaleString()}
              </span>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

export default ReportsChart;