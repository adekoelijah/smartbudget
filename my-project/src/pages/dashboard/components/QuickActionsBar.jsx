


// import {
//   PlusCircle,
//   TrendingUp,
//   BarChart3,
//   RefreshCcw,
//   Download,
//   Wallet,
//   Loader2,
// } from "lucide-react";
// import { useState } from "react";

// /**
//  * FINTECH COMMAND BAR
//  * - Mobile-first horizontal scroll
//  * - Desktop compact grid feel
//  * - Intent-driven (not form-driven)
//  */
// const QuickActionBar = ({
//   onOpenTransactionModal,
//   onOpenAnalytics,
//   onOpenBudget,
//   onRefresh,
//   onOpenExport,
//   navigate,
// }) => {
//   const [loadingKey, setLoadingKey] = useState(null);

//   const run = async (key, fn) => {
//     if (!fn) return;

//     try {
//       setLoadingKey(key);
//       await fn();
//     } catch (err) {
//       console.error("QuickActionBar error:", err);
//     } finally {
//       setLoadingKey(null);
//     }
//   };

//   const actions = [
//     {
//       key: "quick_add",
//       label: "Quick Add",
//       icon: PlusCircle,
//       tone: "emerald",
//       onClick: () =>
//         run("quick_add", () =>
//           onOpenTransactionModal?.()
//         ),
//     },

//     {
//       key: "insights",
//       label: "Insights",
//       icon: TrendingUp,
//       tone: "indigo",
//       onClick: () =>
//         run("insights", onOpenAnalytics),
//     },

//     {
//       key: "budget",
//       label: "Budget",
//       icon: Wallet,
//       tone: "violet",
//       onClick: () =>
//         run("budget", () =>
//           navigate?.("/budget")
//         ),
//     },

//     {
//       key: "sync",
//       label: "Sync",
//       icon: RefreshCcw,
//       tone: "blue",
//       onClick: () =>
//         run("sync", onRefresh),
//     },

//     {
//       key: "reports",
//       label: "Reports",
//       icon: Download,
//       tone: "slate",
//       onClick: () =>
//         run("reports", onOpenExport),
//     },
//   ];

//   const tones = {
//     emerald:
//       "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
//     indigo:
//       "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
//     violet:
//       "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-100",
//     blue:
//       "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-100",
//     slate:
//       "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200",
//   };

//   return (
//     <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm">

//       {/* RESPONSIVE WRAPPER */}
//       <div className="
//         flex gap-2
//         overflow-x-auto
//         md:grid md:grid-cols-5
//         md:overflow-visible
//         md:gap-3
//       ">

//         {actions.map((action) => {
//           const Icon = action.icon;
//           const isLoading = loadingKey === action.key;

//           return (
//             <button
//               key={action.key}
//               onClick={action.onClick}
//               disabled={!!loadingKey}
//               className={`
//                 flex items-center justify-center gap-2
//                 px-4 py-3 rounded-2xl
//                 text-sm font-medium border
//                 whitespace-nowrap
//                 transition-all duration-200
//                 active:scale-[0.98]
//                 disabled:opacity-50 disabled:cursor-not-allowed
//                 min-w-[140px]
//                 md:min-w-0
//                 ${tones[action.tone]}
//               `}
//             >
//               {isLoading ? (
//                 <Loader2 size={16} className="animate-spin" />
//               ) : (
//                 <Icon size={16} />
//               )}

//               {action.label}
//             </button>
//           );
//         })}

//       </div>
//     </div>
//   );
// };

// export default QuickActionBar;





import {
  PlusCircle,
  RefreshCcw,
  Download,
  ReceiptText,
  Loader2,
} from "lucide-react";

import { useState } from "react";

/* =========================================
   BANK-GRADE COMMAND CENTER
========================================= */
const QuickActionBar = ({
  onOpenTransactionModal,
  onRefresh,
  onOpenExport,
  navigate,
  setTransactionType,
}) => {
  const [loadingKey, setLoadingKey] =
    useState(null);

  /* =========================================
     SAFE ACTION RUNNER
  ========================================= */
  const run = async (
    key,
    callback
  ) => {
    if (
      typeof callback !==
      "function"
    )
      return;

    try {
      setLoadingKey(key);

      await Promise.resolve(
        callback()
      );
    } catch (err) {
      console.error(
        `[QuickAction:${key}]`,
        err
      );
    } finally {
      setLoadingKey(null);
    }
  };

  /* =========================================
     ACTIONS
  ========================================= */
  const actions = [
    {
      key: "transaction",
      label: "Transaction",
      icon: PlusCircle,

      tone:
        "text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100",

      onClick: () =>
        run(
          "transaction",
          () => {
            /**
             * IMPORTANT
             * Prevent validation mismatch
             */
            setTransactionType?.(
              "expense"
            );

            onOpenTransactionModal?.();
          }
        ),
    },

    {
      key: "sync",
      label: "Refresh",
      icon: RefreshCcw,

      tone:
        "text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100",

      onClick: () =>
        run(
          "sync",
          async () => {
            await onRefresh?.();
          }
        ),
    },

    {
      key: "report",
      label: "Reports",
      icon: Download,

      tone:
        "text-slate-800 bg-slate-100 border-slate-200 hover:bg-slate-200",

      onClick: () =>
        run(
          "report",
          async () => {
            await onOpenExport?.();
          }
        ),
    },

    {
      key: "ledger",
      label: "Ledger",
      icon: ReceiptText,

      tone:
        "text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100",

      onClick: () =>
        run(
          "ledger",
          () =>
            navigate?.(
              "/transactions"
            )
        ),
    },
  ];

  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
        p-4
      "
    >

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Command Center
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Real-time financial controls
        </p>
      </div>

      {/* ACTION GRID */}
      <div
        className="
          flex gap-3 overflow-x-auto
          md:grid md:grid-cols-4
        "
      >

        {actions.map((action) => {
          const Icon =
            action.icon;

          const loading =
            loadingKey ===
            action.key;

          return (
            <button
              key={action.key}
              onClick={
                action.onClick
              }
              disabled={
                !!loadingKey
              }
              className={`
                flex items-center justify-center gap-2
                min-w-[160px] md:min-w-0
                rounded-2xl border
                px-4 py-4
                text-sm font-medium
                transition-all duration-200
                active:scale-[0.98]
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${action.tone}
              `}
            >

              {loading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Icon size={17} />
              )}

              <span>
                {action.label}
              </span>

            </button>
          );
        })}

      </div>
    </div>
  );
};

export default QuickActionBar;