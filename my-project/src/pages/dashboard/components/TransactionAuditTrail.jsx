

// import { useMemo, useState, useEffect } from "react";
// import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

// /* =========================
//    SAFE HELPERS
// ========================= */
// const safeNumber = (v) => Number(v || 0);

// /* =========================
//    NORMALIZER
// ========================= */
// const normalizeTx = (t) => ({
//   id: t._id || t.id,
//   title: t.title || "Untitled",
//   category: t.category || "Uncategorized",
//   type: t.type || "expense",
//   amount: safeNumber(t.amount),
//   date: t.date || t.createdAt || "",
//   note: t.note || "",
// });

// /* =========================
//    COMPONENT
// ========================= */
// const TransactionAuditTrail = ({
//   transactions = [],
//   search: externalSearch,
//   onSearchChange,
// }) => {
//   /* =========================
//      INTERNAL SEARCH STATE (FIX)
//   ========================= */
//   const [internalSearch, setInternalSearch] = useState("");

//   const search = externalSearch ?? internalSearch;

//   const setSearch = (value) => {
//     setInternalSearch(value);
//     onSearchChange?.(value); // optional sync upward
//   };

//   /* =========================
//      NORMALIZE
//   ========================= */
//   const normalized = useMemo(() => {
//     return Array.isArray(transactions)
//       ? transactions.map(normalizeTx)
//       : [];
//   }, [transactions]);

//   /* =========================
//      FILTER ENGINE
//   ========================= */
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     if (!q) return normalized;

//     return normalized.filter((t) => {
//       return (
//         `${t.title} ${t.category} ${t.type} ${t.note} ${t.amount}`
//           .toLowerCase()
//           .includes(q)
//       );
//     });
//   }, [normalized, search]);

//   return (
//     <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">

//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

//         <div>
//           <h2 className="text-sm font-semibold text-slate-900">
//             Transaction History
//           </h2>
//           <p className="text-xs text-slate-500">
//             Full financial history ledger
//           </p>
//         </div>

//         {/* SEARCH (FIXED) */}
//         <div className="relative w-full md:w-72">
//           <Search
//             size={16}
//             className="absolute left-3 top-3 text-slate-400"
//           />

//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search transactions..."
//             className="w-full border border-slate-200 rounded-2xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-slate-400"
//           />
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="divide-y divide-slate-100">

//         {filtered.length === 0 ? (
//           <div className="py-10 text-center text-sm text-slate-400">
//             No transactions found
//           </div>
//         ) : (
//           filtered.map((t) => {
//             const isIncome = t.type === "income";

//             return (
//               <div
//                 key={t.id}
//                 className="grid grid-cols-1 md:grid-cols-5 py-4 text-sm items-center gap-2"
//               >
//                 <div className="font-medium text-slate-900">
//                   {t.title}
//                 </div>

//                 <div className="text-slate-500">
//                   {t.category}
//                 </div>

//                 <div className="text-slate-400 text-xs">
//                   {t.date
//                     ? new Date(t.date).toLocaleDateString()
//                     : "-"}
//                 </div>

//                 <div className="flex items-center gap-1 text-xs">
//                   {isIncome ? (
//                     <ArrowUpRight size={14} className="text-emerald-500" />
//                   ) : (
//                     <ArrowDownRight size={14} className="text-rose-500" />
//                   )}

//                   <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
//                     {t.type}
//                   </span>
//                 </div>

//                 <div className={`text-right font-semibold ${
//                   isIncome ? "text-emerald-600" : "text-rose-600"
//                 }`}>
//                   ₦{safeNumber(t.amount).toLocaleString()}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransactionAuditTrail;





import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================
   SAFE HELPERS
========================= */
const safeNumber = (v) => Number(v || 0);

const ITEMS_PER_PAGE = 10;

/* =========================
   NORMALIZER
========================= */
const normalizeTx = (t) => ({
  id: t._id || t.id,
  title: t.title || "Untitled",
  category: t.category || "Uncategorized",
  type: t.type || "expense",
  amount: safeNumber(t.amount),
  date: t.date || t.createdAt || "",
  note: t.note || "",
});

/* =========================
   COMPONENT
========================= */
const TransactionAuditTrail = ({
  transactions = [],
  search: externalSearch,
  onSearchChange,
}) => {
  /* =========================
     SEARCH STATE
  ========================= */
  const [internalSearch, setInternalSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const search =
    externalSearch ?? internalSearch;

  const setSearch = (value) => {
    setInternalSearch(value);
    onSearchChange?.(value);
    setPage(1); // reset page on search
  };

  /* =========================
     NORMALIZE DATA
  ========================= */
  const normalized = useMemo(() => {
    return Array.isArray(transactions)
      ? transactions.map(normalizeTx)
      : [];
  }, [transactions]);

  /* =========================
     FILTER ENGINE
  ========================= */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return normalized;

    return normalized.filter((t) => {
      return (
        `${t.title} ${t.category} ${t.type} ${t.note} ${t.amount}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [normalized, search]);

  /* =========================
     PAGINATION
  ========================= */
  const totalPages = Math.ceil(
    filtered.length / ITEMS_PER_PAGE
  );

  const paginatedTransactions =
    useMemo(() => {
      const start =
        (page - 1) * ITEMS_PER_PAGE;

      return filtered.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [filtered, page]);

  /* =========================
     AUTO FIX PAGE
  ========================= */
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* =========================
          HEADER
      ========================= */}
      <div className="p-4 md:p-5 border-b border-slate-100">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* TITLE */}
          <div>
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Transaction History
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Secure financial audit ledger
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search title, category, amount..."
              className="
                w-full
                rounded-2xl
                border border-slate-200
                bg-slate-50
                pl-10 pr-4 py-3
                text-sm
                text-slate-700
                outline-none
                transition-all
                focus:border-slate-400
                focus:bg-white
              "
            />
          </div>

        </div>
      </div>

      {/* =========================
          TABLE HEADER
      ========================= */}
      <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">

        <div>Title</div>
        <div>Category</div>
        <div>Date</div>
        <div>Type</div>
        <div className="text-right">
          Amount
        </div>

      </div>

      {/* =========================
          TRANSACTION LIST
      ========================= */}
      <div className="divide-y divide-slate-100">

        {paginatedTransactions.length ===
        0 ? (
          <div className="py-16 text-center">

            <p className="text-sm text-slate-400">
              No transactions found
            </p>

          </div>
        ) : (
          paginatedTransactions.map((t) => {
            const isIncome =
              t.type === "income";

            return (
              <div
                key={t.id}
                className="
                  p-4 md:px-5 md:py-4
                  hover:bg-slate-50/70
                  transition-colors
                "
              >

                {/* MOBILE CARD */}
                <div className="flex flex-col gap-3 md:hidden">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {t.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {t.category}
                      </p>
                    </div>

                    <div
                      className={`text-sm font-bold ${
                        isIncome
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      ₦
                      {safeNumber(
                        t.amount
                      ).toLocaleString()}
                    </div>

                  </div>

                  <div className="flex items-center justify-between">

                    <div className="text-xs text-slate-400">
                      {t.date
                        ? new Date(
                            t.date
                          ).toLocaleDateString()
                        : "-"}
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        isIncome
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight
                          size={14}
                        />
                      ) : (
                        <ArrowDownRight
                          size={14}
                        />
                      )}

                      {t.type}
                    </div>

                  </div>

                </div>

                {/* DESKTOP GRID */}
                <div className="hidden md:grid grid-cols-5 gap-4 items-center text-sm">

                  <div className="font-medium text-slate-900 truncate">
                    {t.title}
                  </div>

                  <div className="text-slate-500 truncate">
                    {t.category}
                  </div>

                  <div className="text-slate-400 text-xs">
                    {t.date
                      ? new Date(
                          t.date
                        ).toLocaleDateString()
                      : "-"}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isIncome
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight
                        size={14}
                      />
                    ) : (
                      <ArrowDownRight
                        size={14}
                      />
                    )}

                    {t.type}
                  </div>

                  <div
                    className={`text-right font-semibold ${
                      isIncome
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    ₦
                    {safeNumber(
                      t.amount
                    ).toLocaleString()}
                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* =========================
          PAGINATION
      ========================= */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50">

          {/* INFO */}
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(page - 1) *
                ITEMS_PER_PAGE +
                1}
            </span>{" "}
            -
            <span className="font-medium text-slate-700">
              {" "}
              {Math.min(
                page * ITEMS_PER_PAGE,
                filtered.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {filtered.length}
            </span>{" "}
            transactions
          </p>

          {/* BUTTONS */}
          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setPage((p) =>
                  Math.max(p - 1, 1)
                )
              }
              disabled={page === 1}
              className="
                h-10 w-10
                flex items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                hover:bg-slate-100
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition
              "
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-4 text-sm font-medium text-slate-700">
              {page} / {totalPages}
            </div>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    p + 1,
                    totalPages
                  )
                )
              }
              disabled={page === totalPages}
              className="
                h-10 w-10
                flex items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                hover:bg-slate-100
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition
              "
            >
              <ChevronRight size={16} />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionAuditTrail;