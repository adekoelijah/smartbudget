
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